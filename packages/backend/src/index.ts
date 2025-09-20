import Koa from 'koa';
import Router from 'koa-router';
import cors from '@koa/cors';
import bodyParser from 'koa-bodyparser';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';
import { InMemoryTableStore } from './store/tables';
import { createTablesRouter } from './routes/tables';

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3001;
const wsPort = parseInt(process.env.WS_PORT || '1234');

// Initialize store (swap this with a DB-backed implementation later)
const tableStore = new InMemoryTableStore();

// Middlewares
app.use(cors());
app.use(bodyParser());

// Routes - Tables API
const tablesRouter = createTablesRouter(tableStore);
router.use(tablesRouter.routes(), tablesRouter.allowedMethods());

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
