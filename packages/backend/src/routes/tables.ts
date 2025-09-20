import Router from 'koa-router';
import { TableStore } from '../store/tables';

export function createTablesRouter(store: TableStore): Router {
	const router = new Router({ prefix: '/api/tables' });

    router.get('/', async (ctx) => {
        const data = await store.list();
        ctx.body = data;
    });

    router.post('/', async (ctx) => {
		const body = ctx.request.body as { name?: string } | undefined;
		const name = (body && body.name ? String(body.name) : '').trim();
        const table = await store.create(name || 'Untitled Table');
		ctx.status = 201;
		ctx.body = table;
	});

    router.get('/:id', async (ctx) => {
        const table = await store.get(ctx.params.id);
		if (!table) {
			ctx.status = 404;
			ctx.body = { error: 'Table not found' };
			return;
		}
		ctx.body = table;
	});

    router.delete('/:id', async (ctx) => {
        const ok = await store.delete(ctx.params.id);
		ctx.status = ok ? 204 : 404;
		if (!ok) {
			ctx.body = { error: 'Table not found' };
		}
	});

	return router;
}


