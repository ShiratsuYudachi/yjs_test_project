import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text, Modal, TextInput, Button } from '@mantine/core';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { TableDisplay } from './components/TableDisplay';
import { useSyncedTableInfo } from './hooks/useSyncedTableInfo';
import { TablesSidebar } from './components/TablesSidebar';
import './index.css';

// Nickname modal component
const NicknameModal: React.FC<{ onSubmit: (name: string) => void }> = ({ onSubmit }) => {
	const [nickname, setNickname] = useState('');
	const [opened, setOpened] = useState(true);

	const handleSubmit = () => {
		const trimmed = nickname.trim();
		if (trimmed) {
			onSubmit(trimmed);
			setOpened(false);
		}
	};

	return (
		<Modal opened={opened} onClose={() => {}} withCloseButton={false} closeOnClickOutside={false} closeOnEscape={false}>
			<Text size="lg" className="mb-4">Enter your nickname</Text>
			<TextInput
				placeholder="Your nickname..."
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				className="mb-4"
				autoFocus
			/>
			<Button onClick={handleSubmit} disabled={!nickname.trim()}>
				Join
			</Button>
		</Modal>
	);
};

// no metadata needed anymore
const TableView: React.FC = () => {
	const { tableId } = useParams<{ tableId: string }>();
	const [userName, setUserName] = useState<string | null>(null);

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
		setEditingCell,
		clearEditingCell,
		editingMap,
		isConnected,
	} = useSyncedTableInfo(tableId, [], userName || undefined);

	return (
		<div className="flex h-screen">
			<TablesSidebar />
			<div className="flex-1 p-6 overflow-auto">
				{!userName && <NicknameModal onSubmit={setUserName} />}
				<Text size="sm" className="mb-4 text-blue-600">
					🔄 Y.js Collaborative Table - Open multiple tabs to see real-time collaboration!
					{isConnected ? ' ✅ Connected' : ' ❌ Disconnected'}
					{userName && ` | Hello, ${userName}!`}
				</Text>
				<TableDisplay 
					tableData={tableData}
					onCellChange={updateCell}
					onAddRow={addRow}
					onAddCol={addCol}
					setEditingCell={setEditingCell}
					clearEditingCell={clearEditingCell}
					editingMap={editingMap}
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