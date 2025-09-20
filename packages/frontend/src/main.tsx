import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text, Modal, TextInput, Button, createTheme, Box } from '@mantine/core';
import '@mantine/core/styles.css';
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
		<Modal 
			opened={opened} 
			onClose={() => {}} 
			withCloseButton={false} 
			closeOnClickOutside={false} 
			closeOnEscape={false}
			zIndex={1000}
			overlayProps={{ opacity: 0.7, blur: 3 }}
			centered
		>
			<Text size="lg" mb="md">Enter your nickname</Text>
			<TextInput
				placeholder="Your nickname..."
				value={nickname}
				onChange={(e) => setNickname(e.target.value)}
				onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
				mb="md"
				autoFocus
			/>
			<Button onClick={handleSubmit} disabled={!nickname.trim()} fullWidth>
				Join Collaboration
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
			<Box style={{ display: 'flex', height: '100vh' }}>
				<TablesSidebar />
				<Box flex={1} p="xl" style={{ overflow: 'auto' }}>
					<Text size="sm" c="blue">Select or create a table from the sidebar.</Text>
				</Box>
			</Box>
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
		<Box style={{ display: 'flex', height: '100vh' }}>
			<TablesSidebar />
			<Box flex={1} p="xl" style={{ overflow: 'auto' }}>
				{!userName && <NicknameModal onSubmit={setUserName} />}
				<Text size="sm" c="blue" mb="md">
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
			</Box>
		</Box>
	);
};

const theme = createTheme({
	// Use Mantine's default theme
});

const App = () => {
	return (
		<MantineProvider theme={theme}>
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