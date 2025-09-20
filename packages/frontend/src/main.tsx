import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { TableDisplay, TableMetadata } from './components/TableDisplay';
import { useSyncedTableInfo } from './hooks/useSyncedTableInfo';
import { TablesSidebar } from './components/TablesSidebar';
import './index.css';

// Move constants outside component to prevent re-creation
const INITIAL_METADATA: TableMetadata = {
	rows: 3,
	cols: 3,
	title: 'My Collaborative Table',
	description: 'Click on any cell to edit. All cells are treated equally - no column headers needed.',
};
const TableView: React.FC = () => {
	const { tableId } = useParams<{ tableId: string }>();
	if (!tableId) {
		return (
			<div className="flex h-screen">
				<TablesSidebar />
				<div className="flex-1 p-6 overflow-auto">
					<Text size="sm" className="mb-4 text-blue-600">Select or create a table from the sidebar.</Text>
				</div>
			</div>
		);
	}
	const {
		metadata,
		tableData,
		updateMetadata,
		updateCell,
		isConnected,
	} = useSyncedTableInfo(tableId, INITIAL_METADATA);

	return (
		<div className="flex h-screen">
			<TablesSidebar />
			<div className="flex-1 p-6 overflow-auto">
			<Text size="sm" className="mb-4 text-blue-600">
				🔄 Y.js Collaborative Table - Open multiple tabs to see real-time collaboration!
				{isConnected ? ' ✅ Connected' : ' ❌ Disconnected'}
			</Text>
			<TableDisplay 
				metadata={metadata}
				tableData={tableData}
				onMetadataChange={updateMetadata}
				onCellChange={updateCell}
			/>
			</div>
		</div>
	);
};

const App = () => {
	return (
		<MantineProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/tables" element={<TableView />} />
					<Route path="/tables/:tableId" element={<TableView />} />
					<Route path="*" element={<Navigate to="/tables" replace />} />
				</Routes>
			</BrowserRouter>
		</MantineProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);