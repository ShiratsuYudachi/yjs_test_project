import Router from 'koa-router';
import { PrismaClient } from '@prisma/client';

export function createCellsRouter(prisma: PrismaClient): Router {
	const router = new Router({ prefix: '/api/tables/:tableId/cells' });

	// List all cells for a table
    router.get('/', async (ctx) => {
		const tableId = ctx.params.tableId;
        const cells = await prisma.tableCell.findMany({
			where: { tableId },
			orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
		});
        const payload = cells.map(c => ({
			id: c.id,
			rowIndex: c.rowIndex,
			colIndex: c.colIndex,
			value: c.value,
			updatedAt: c.updatedAt.toISOString(),
        }));
        console.log('cells.list', tableId, '->', payload.length);
        ctx.body = payload;
	});

	// Upsert a single cell
    router.put('/:row/:col', async (ctx) => {
		const tableId = ctx.params.tableId;
		const rowIndex = parseInt(ctx.params.row, 10);
		const colIndex = parseInt(ctx.params.col, 10);
		const body = ctx.request.body as { value?: string } | undefined;
		const value = (body && typeof body.value === 'string') ? body.value : '';
        await prisma.tableCell.upsert({
			where: { tableId_rowIndex_colIndex: { tableId, rowIndex, colIndex } },
			update: { value },
			create: { tableId, rowIndex, colIndex, value },
		});
        console.log('cells.upsert', { tableId, rowIndex, colIndex, value });
		ctx.status = 204;
	});

	return router;
}


