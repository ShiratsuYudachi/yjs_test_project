import Koa from 'koa';
import { WebSocketServer } from 'ws';
// @ts-ignore
import { setupWSConnection } from 'y-websocket/bin/utils';

const app = new Koa();
const port = process.env.PORT || 3001;
const wsPort = parseInt(process.env.WS_PORT || '1234');

// HTTP server
app.use(async (ctx) => {
	ctx.body = 'Y.js Backend Server Running';
});

const server = app.listen(port, () => {
	console.log(`HTTP server running on http://localhost:${port}`);
});

// WebSocket server for Y.js
const wss = new WebSocketServer({ port: wsPort });

wss.on('connection', (ws, req) => {
	setupWSConnection(ws, req);
});

console.log(`Y.js WebSocket server running on ws://localhost:${wsPort}`);
