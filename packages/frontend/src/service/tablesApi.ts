import { GraphQLClient } from 'graphql-request';
import { getSdk } from '../graphql/types';

export type TableSummary = {
	id: string;
	name: string;
	createdAt: string;
};

const BASE_URL = 'http://localhost:3001/graphql';
const client = new GraphQLClient(BASE_URL);
const sdk = getSdk(client);

export async function listTables(): Promise<TableSummary[]> {
	const data = await sdk.Tables();
	return data.tables;
}

export async function createTable(name: string): Promise<TableSummary> {
	const data = await sdk.CreateTable({ name });
	return data.createTable;
}

export async function deleteTable(id: string): Promise<void> {
	const data = await sdk.DeleteTable({ id });
	if (!data.deleteTable) throw new Error('Delete table failed');
}


