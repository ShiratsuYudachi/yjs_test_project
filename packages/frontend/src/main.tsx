import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Title, Textarea, Text, Divider } from '@mantine/core';
import { CollaborativeTable, TableMetadata } from './components/CollaborativeTable';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import './index.css';

const TableDemo = () => {
	const [metadata, setMetadata] = useState<TableMetadata>({
		rows: 3,
		cols: 3,
		title: 'My Collaborative Table',
		description: 'Click on any cell to edit. All cells are treated equally - no column headers needed.',
	});

	const [tableData, setTableData] = useState<string[][]>([[]]);

	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
	const ymetadataRef = useRef<Y.Map<any> | null>(null);
	const ytableDataRef = useRef<Y.Array<any> | null>(null);

	useEffect(() => {
		// Create Y.js document and connect to WebSocket
		const ydoc = new Y.Doc();
		const provider = new WebsocketProvider('ws://localhost:1234', 'shared-table', ydoc);
		const ymetadata = ydoc.getMap('table-metadata');
		const ytableData = ydoc.getArray('table-data');

		ydocRef.current = ydoc;
		providerRef.current = provider;
		ymetadataRef.current = ymetadata;
		ytableDataRef.current = ytableData;

		// Initialize Y.js data if empty
		if (ymetadata.size === 0) {
			ymetadata.set('rows', 3);
			ymetadata.set('cols', 3);
			ymetadata.set('title', 'My Collaborative Table');
			ymetadata.set('description', 'Click on any cell to edit. All cells are treated equally - no column headers needed.');
		}

		// Update local state when Y.js metadata changes
		const updateMetadata = () => {
			const newMetadata: TableMetadata = {
				rows: (ymetadata.get('rows') as number) || 3,
				cols: (ymetadata.get('cols') as number) || 3,
				title: (ymetadata.get('title') as string) || 'My Collaborative Table',
				description: (ymetadata.get('description') as string) || 'Click on any cell to edit.',
			};
			setMetadata(newMetadata);
		};

		// Update local state when Y.js table data changes
		const updateTableData = () => {
			const newData: string[][] = [];
			ytableData.forEach((yrow: any) => {
				const row: string[] = [];
				yrow.forEach((cell: string) => {
					row.push(cell);
				});
				newData.push(row);
			});
			setTableData(newData);
		};

		// Listen for Y.js changes
		ymetadata.observe(updateMetadata);
		ytableData.observe(updateTableData);

		// Initial sync
		updateMetadata();
		updateTableData();

		// Cleanup
		return () => {
			ymetadata.unobserve(updateMetadata);
			ytableData.unobserve(updateTableData);
			provider.destroy();
			ydoc.destroy();
		};
	}, []);

	const expandTableData = (targetRowIndex: number, targetColIndex: number) => {
		if (!ytableDataRef.current) return;

		const ytableData = ytableDataRef.current;
		
		// Expand rows if needed
		while (ytableData.length <= targetRowIndex) {
			const yrow = new Y.Array();
			ytableData.push([yrow]);
		}
		
		// Expand columns in the target row if needed
		const targetRow = ytableData.get(targetRowIndex) as Y.Array<string>;
		while (targetRow.length <= targetColIndex) {
			targetRow.push(['']);
		}
	};

	const handleMetadataChange = (newMetadata: TableMetadata) => {
		if (!ymetadataRef.current) return;

		const ymetadata = ymetadataRef.current;
		ymetadata.set('rows', newMetadata.rows);
		ymetadata.set('cols', newMetadata.cols);
		ymetadata.set('title', newMetadata.title || '');
		ymetadata.set('description', newMetadata.description || '');
	};

	const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
		if (!ytableDataRef.current) return;

		// First, expand tableData if the cell is out of range
		expandTableData(rowIndex, colIndex);
		
		// Now update the cell value
		const ytableData = ytableDataRef.current;
		const yrow = ytableData.get(rowIndex) as Y.Array<string>;
		yrow.delete(colIndex, 1);
		yrow.insert(colIndex, [value]);
	};

	return (
		<div>
			<Text size="sm" className="mb-4 text-blue-600">
				🔄 Y.js Collaborative Table - Open multiple tabs to see real-time collaboration!
			</Text>
			<CollaborativeTable 
				metadata={metadata}
				tableData={tableData}
				onMetadataChange={handleMetadataChange}
				onCellChange={handleCellChange}
			/>
		</div>
	);
};

const App = () => {
	return (
		<MantineProvider>
			<Container className="min-h-screen py-8">
				<TableDemo />
			</Container>
		</MantineProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);