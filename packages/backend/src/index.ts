import Koa from 'koa';

const app = new Koa();
const port = process.env.PORT || 3001;

app.use(async (ctx) => {
	ctx.body = 'Hello World from Koa';
});

app.listen(port, () => {
	console.log(`Backend running on http://localhost:${port}`);
});
