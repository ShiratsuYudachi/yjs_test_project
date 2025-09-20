export type TableSummary = {
	id: string;
	name: string;
	createdAt: string;
};

const BASE_URL = 'http://localhost:3001';

export async function listTables(): Promise<TableSummary[]> {
	const res = await fetch(`${BASE_URL}/api/tables`);
	if (!res.ok) throw new Error('Failed to list tables');
	return res.json();
}

export async function createTable(name: string): Promise<TableSummary> {
	const res = await fetch(`${BASE_URL}/api/tables`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name }),
	});
	if (!res.ok) throw new Error('Failed to create table');
	return res.json();
}

export async function deleteTable(id: string): Promise<void> {
	const res = await fetch(`${BASE_URL}/api/tables/${id}`, { method: 'DELETE' });
	if (!res.ok && res.status !== 204) throw new Error('Failed to delete table');
}


