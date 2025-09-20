import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text } from '@mantine/core';
import { TableDisplay, TableMetadata } from './components/TableDisplay';
import { useSyncedTableInfo } from './hooks/useSyncedTableInfo';
import './index.css';

// Move constants outside component to prevent re-creation
const INITIAL_METADATA: TableMetadata = {
	rows: 3,
	cols: 3,
	title: 'My Collaborative Table',
	description: 'Click on any cell to edit. All cells are treated equally - no column headers needed.',
};
const TableDemo = () => {
	const {
		metadata,
		tableData,
		updateMetadata,
		updateCell,
		isConnected,
	} = useSyncedTableInfo('shared-table', INITIAL_METADATA);

	return (
		<div>
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