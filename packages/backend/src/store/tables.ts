export type Table = {
	id: string;
	name: string;
	createdAt: string;
};

export interface TableStore {
	list(): Promise<Table[]> | Table[];
	get(id: string): Promise<Table | undefined> | Table | undefined;
	create(name: string): Promise<Table> | Table;
	delete(id: string): Promise<boolean> | boolean;
}

// Prisma-backed store implementation
import { PrismaClient } from '@prisma/client';

export class PrismaTableStore implements TableStore {
	private prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}

	async list(): Promise<Table[]> {
		const rows = await this.prisma.table.findMany({ orderBy: { createdAt: 'asc' } });
		return rows.map(r => ({ id: r.id, name: r.name, createdAt: r.createdAt.toISOString() }));
	}

	async get(id: string): Promise<Table | undefined> {
		const r = await this.prisma.table.findUnique({ where: { id } });
		return r ? { id: r.id, name: r.name, createdAt: r.createdAt.toISOString() } : undefined;
	}

	async create(name: string): Promise<Table> {
		const r = await this.prisma.table.create({ data: { name: name || 'Untitled Table' , rows: 3, cols: 3 } });
		return { id: r.id, name: r.name, createdAt: r.createdAt.toISOString() };
	}

	async delete(id: string): Promise<boolean> {
		await this.prisma.table.delete({ where: { id } });
		return true;
	}
}


