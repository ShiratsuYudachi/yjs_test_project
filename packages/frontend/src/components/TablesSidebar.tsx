import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, ActionIcon, Text, Box, ScrollArea, Stack } from '@mantine/core';
import { createTable, deleteTable, listTables, TableSummary } from '../service/tablesApi';

export const TablesSidebar: React.FC = () => {
	const [tables, setTables] = useState<TableSummary[]>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();

	const fetchTables = async () => {
		setLoading(true);
		try {
			const data = await listTables();
			setTables(data);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTables();
	}, []);

	const handleCreate = async () => {
		const name = window.prompt('Enter table name') || '';
		try {
			const t = await createTable(name.trim());
			await fetchTables();
			navigate(`/tables/${t.id}`);
		} catch (e) {
			console.error(e);
		}
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm('Delete this table?')) return;
		try {
			await deleteTable(id);
			await fetchTables();
		} catch (e) {
			console.error(e);
		}
	};

	return (
		<Box w={256} h="100vh" style={{ borderRight: '1px solid var(--mantine-color-gray-3)', display: 'flex', flexDirection: 'column' }}>
			<Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
				<Text fw={600}>Tables</Text>
				<Button size="xs" onClick={handleCreate}>+</Button>
			</Box>
			<ScrollArea flex={1}>
				{loading ? (
					<Text size="sm" c="dimmed" p="md">Loading...</Text>
				) : (
					<Stack gap="xs" p="sm">
						{tables.map(t => (
							<Box key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
								<Button 
									component={Link} 
									to={`/tables/${t.id}`} 
									variant="subtle" 
									size="sm" 
									style={{ flex: 1, justifyContent: 'flex-start' }}
								>
									{t.name || 'Untitled Table'}
								</Button>
								<ActionIcon size="sm" variant="subtle" color="red" onClick={() => handleDelete(t.id)}>
									×
								</ActionIcon>
							</Box>
						))}
					</Stack>
				)}
			</ScrollArea>
		</Box>
	);
};


