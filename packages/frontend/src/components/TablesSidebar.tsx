import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
		<div className="w-64 border-r h-full flex flex-col">
			<div className="p-3 flex items-center justify-between border-b">
				<div className="font-semibold">Tables</div>
				<button onClick={handleCreate} className="px-2 py-1 bg-blue-600 text-white rounded">+</button>
			</div>
			<div className="flex-1 overflow-auto">
				{loading ? (
					<div className="p-3 text-sm text-gray-500">Loading...</div>
				) : (
					<ul>
						{tables.map(t => (
							<li key={t.id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50">
								<Link to={`/tables/${t.id}`} className="text-blue-700 underline">
									{t.name || 'Untitled Table'}
								</Link>
								<button onClick={() => handleDelete(t.id)} className="text-red-600 text-sm">Delete</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
};


