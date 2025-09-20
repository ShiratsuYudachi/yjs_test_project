export type TableSummary = {
	id: string;
	name: string;
	createdAt: string;
};

const BASE_URL = 'http://localhost:3001/graphql';

export async function listTables(): Promise<TableSummary[]> {
	const res = await fetch(`${BASE_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ query: '{ tables { id name createdAt } }' }),
	});
	if (!res.ok) throw new Error('Failed to list tables');
	const json = await res.json();
	return json.data.tables;
}

export async function createTable(name: string): Promise<TableSummary> {
	const res = await fetch(`${BASE_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: 'mutation($name:String!){ createTable(name:$name){ id name createdAt } }',
			variables: { name },
		}),
	});
	if (!res.ok) throw new Error('Failed to create table');
	const json = await res.json();
	return json.data.createTable;
}

export async function deleteTable(id: string): Promise<void> {
	const res = await fetch(`${BASE_URL}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({
			query: 'mutation($id:ID!){ deleteTable(id:$id) }',
			variables: { id },
		}),
	});
	if (!res.ok) throw new Error('Failed to delete table');
	const json = await res.json();
	if (!json.data?.deleteTable) throw new Error('Delete table failed');
}


