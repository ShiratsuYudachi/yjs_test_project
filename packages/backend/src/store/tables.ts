export type Table = {
	id: string;
	name: string;
	createdAt: string;
};

export interface TableStore {
	list(): Table[];
	get(id: string): Table | undefined;
	create(name: string): Table;
	delete(id: string): boolean;
}

export class InMemoryTableStore implements TableStore {
	private tablesById: Map<string, Table> = new Map();

	list(): Table[] {
		return Array.from(this.tablesById.values());
	}

	get(id: string): Table | undefined {
		return this.tablesById.get(id);
	}

	create(name: string): Table {
		const id = this.generateId();
		const table: Table = { id, name, createdAt: new Date().toISOString() };
		this.tablesById.set(id, table);
		return table;
	}

	delete(id: string): boolean {
		return this.tablesById.delete(id);
	}

	private generateId(): string {
		const ts = new Date()
			.toISOString()
			.replace(/[-:TZ\.]/g, '')
			.slice(0, 14);
		const rand = Math.random().toString(36).slice(2, 8);
		return `${ts}-${rand}`;
	}
}


