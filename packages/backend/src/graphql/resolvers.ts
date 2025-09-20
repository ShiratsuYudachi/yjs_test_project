import { PrismaClient } from '@prisma/client';
import { PrismaTableStore } from '../store/tables';

type Context = {
	prisma: PrismaClient;
	tableStore: PrismaTableStore;
};

export const resolvers = {
	Query: {
		tables: async (_: unknown, __: unknown, ctx: Context) => {
			return ctx.tableStore.list();
		},
		table: async (_: unknown, args: { id: string }, ctx: Context) => {
			return ctx.tableStore.get(args.id);
		},
		cells: async (_: unknown, args: { tableId: string }, ctx: Context) => {
			const cells = await ctx.prisma.tableCell.findMany({
				where: { tableId: args.tableId },
				orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
			});
			return cells.map(c => ({
				id: c.id,
				rowIndex: c.rowIndex,
				colIndex: c.colIndex,
				value: c.value,
				updatedAt: c.updatedAt.toISOString(),
			}));
		},
	},
	Mutation: {
		createTable: async (_: unknown, args: { name: string }, ctx: Context) => {
			return ctx.tableStore.create(args.name);
		},
		deleteTable: async (_: unknown, args: { id: string }, ctx: Context) => {
			return ctx.tableStore.delete(args.id);
		},
		upsertCell: async (_: unknown, args: { tableId: string; rowIndex: number; colIndex: number; value: string }, ctx: Context) => {
			await ctx.prisma.tableCell.upsert({
				where: { tableId_rowIndex_colIndex: { tableId: args.tableId, rowIndex: args.rowIndex, colIndex: args.colIndex } },
				update: { value: args.value },
				create: { tableId: args.tableId, rowIndex: args.rowIndex, colIndex: args.colIndex, value: args.value },
			});
			return true;
		},
	},
	Table: {
		cells: async (parent: { id: string }, _: unknown, ctx: Context) => {
			const cells = await ctx.prisma.tableCell.findMany({
				where: { tableId: parent.id },
				orderBy: [{ rowIndex: 'asc' }, { colIndex: 'asc' }],
			});
			return cells.map(c => ({
				id: c.id,
				rowIndex: c.rowIndex,
				colIndex: c.colIndex,
				value: c.value,
				updatedAt: c.updatedAt.toISOString(),
			}));
		},
	},
};


