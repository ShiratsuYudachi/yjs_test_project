import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection, setPersistence } from 'y-websocket/bin/utils';
import {PrismaTableStore } from './store/tables';
import { ApolloServer } from '@apollo/server';
import { koaMiddleware } from '@as-integrations/koa';
import { resolvers } from './graphql/resolvers';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { createYjsPersistence } from './yjs/persistence';

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3001;
const wsPort = parseInt(process.env.WS_PORT || '1234');

// Initialize Prisma and stores (swap to Prisma store by default)
const prisma = new PrismaClient();
const tableStore = new PrismaTableStore(prisma);
const yjsPersistence = createYjsPersistence(prisma);
// register persistence globally for y-websocket
setPersistence(yjsPersistence as any);

// Middlewares
app.use(cors());
app.use(bodyParser());

// Basic request/response logger
app.use(async (ctx, next) => {
	const start = Date.now();
	try {
		await next();
	} catch (err) {
		console.error('Unhandled error:', err);
		ctx.status = 500;
		ctx.body = { error: 'Internal Server Error' };
	}
	const ms = Date.now() - start;
	let bodyPreview: string;
	try {
		bodyPreview = typeof ctx.body === 'string' ? ctx.body : JSON.stringify(ctx.body);
	} catch {
		bodyPreview = '[unserializable body]';
	}
	// console.log(`${ctx.method} ${ctx.url} -> ${ctx.status} ${ms}ms`, bodyPreview);
	console.log("[INFO] ", `${ctx.method} ${ctx.url} -> ${ctx.status} ${ms}ms`);
});

// (REST removed) We now use GraphQL only

// Attach router
app.use(router.routes());
app.use(router.allowedMethods());

// GraphQL (/graphql)
function loadTypeDefs(): string {
	const distPath = path.resolve(__dirname, 'graphql', 'schema.graphql');
	const srcPath = path.resolve(__dirname, '../src/graphql/schema.graphql');
	if (fs.existsSync(distPath)) return fs.readFileSync(distPath, 'utf8');
	if (fs.existsSync(srcPath)) return fs.readFileSync(srcPath, 'utf8');
	throw new Error('schema.graphql not found in dist or src');
}

const apollo = new ApolloServer({ typeDefs: loadTypeDefs(), resolvers });
(async () => {
	await apollo.start();
	app.use(koaMiddleware(apollo, {
		context: async () => ({ prisma, tableStore })
	}));
})();

const server = app.listen(port, () => {
	console.log(`HTTP server running on http://localhost:${port}`);
});

// WebSocket server for Y.js
const wss = new WebSocketServer({ port: wsPort });

wss.on('connection', async (ws, req) => {
	try {
		// Parse the URL to get tableId and password
		const url = new URL(req.url!, `ws://${req.headers.host}`);
		const tableId = url.pathname.replace(/^\//, '').replace(/\/$/, ''); // Remove leading and trailing slashes
		const providedPassword = url.searchParams.get('password')?.replace('/', '');
		
		console.log('WebSocket connection attempt:', {
			url: req.url,
			pathname: url.pathname,
			tableId,
			providedPassword: providedPassword ? '[REDACTED]' : null
		});

		// Check if table exists and validate password
		const table = await prisma.table.findUnique({
			where: { id: tableId },
			select: { password: true }
		});

		if (!table) {
			console.log("tableId", tableId);
			console.log("closed - table not found")
			ws.close(1000, 'Table not found');
			return;
		}

		// If table has a password, verify it
		if (table?.password && table?.password !== providedPassword) {
			ws.close(1008, 'Invalid password');
			console.log("closed - invalid password", table?.password, providedPassword)
			return;
		}
		const cleanedReq = {
			...req,
			url: req.url?.replace(/\/$/, '') || req.url
		};
		setupWSConnection(ws, cleanedReq);
	} catch (error) {
		console.error('WebSocket connection error:', error);
		ws.close(1011, 'Internal server error');
	}
});

console.log(`Y.js WebSocket server running on ws://localhost:${wsPort}`);
