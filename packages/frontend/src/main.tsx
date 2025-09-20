import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { TableDisplay } from './components/TableDisplay';
import { useSyncedTableInfo } from './hooks/useSyncedTableInfo';
import { TablesSidebar } from './components/TablesSidebar';
import './index.css';

// no metadata needed anymore
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
		tableData,
		updateCell,
		addRow,
		addCol,
		isConnected,
	} = useSyncedTableInfo(tableId);

	return (
		<div className="flex h-screen">
			<TablesSidebar />
			<div className="flex-1 p-6 overflow-auto">
			<Text size="sm" className="mb-4 text-blue-600">
				🔄 Y.js Collaborative Table - Open multiple tabs to see real-time collaboration!
				{isConnected ? ' ✅ Connected' : ' ❌ Disconnected'}
			</Text>
			<TableDisplay 
				tableData={tableData}
				onCellChange={updateCell}
				onAddRow={addRow}
				onAddCol={addCol}
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