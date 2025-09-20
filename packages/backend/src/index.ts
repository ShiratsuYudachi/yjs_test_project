import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';
import {PrismaTableStore } from './store/tables';
import { createTablesRouter } from './routes/tables';
import { createCellsRouter } from './routes/cells';
import { PrismaClient } from '@prisma/client';

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3001;
const wsPort = parseInt(process.env.WS_PORT || '1234');

// Initialize Prisma and stores (swap to Prisma store by default)
const prisma = new PrismaClient();
const tableStore = new PrismaTableStore(prisma);

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

// Routes - Tables API
const tablesRouter = createTablesRouter(tableStore);
router.use(tablesRouter.routes(), tablesRouter.allowedMethods());

// Cells API
const cellsRouter = createCellsRouter(prisma);
router.use(cellsRouter.routes(), cellsRouter.allowedMethods());

// Attach router
app.use(router.routes());
app.use(router.allowedMethods());

const server = app.listen(port, () => {
	console.log(`HTTP server running on http://localhost:${port}`);
});

// WebSocket server for Y.js
const wss = new WebSocketServer({ port: wsPort });

wss.on('connection', (ws, req) => {
	setupWSConnection(ws, req);
});

console.log(`Y.js WebSocket server running on ws://localhost:${wsPort}`);
