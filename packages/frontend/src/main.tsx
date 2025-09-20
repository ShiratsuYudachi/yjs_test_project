import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider, Container, Text, Modal, TextInput, Button, createTheme, Box, Loader, Center } from '@mantine/core';
import '@mantine/core/styles.css';
import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { TableDisplay } from './components/TableDisplay';
import { useSyncedTableInfo } from './hooks/useSyncedTableInfo';
import { TablesSidebar } from './components/TablesSidebar';
import { PasswordView } from './components/PasswordView';
import { TableAuthProvider, useTableAuth } from './contexts/TableAuthContext';
import { UserProvider, useUser } from './contexts/UserContext';
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

const TableView: React.FC = () => {
	const { tableId } = useParams<{ tableId: string }>();
	const { userName } = useUser();
	const { password, setStatus } = useTableAuth();

	const handlePasswordError = () => {
		setStatus('failed');
	};

	// Always call the hook
	const {
		tableData,
		updateCell,
		addRow,
		addCol,
		setEditingCell,
		clearEditingCell,
		editingMap,
		isConnected,
	} = useSyncedTableInfo(
		tableId || '', 
		[], 
		userName || undefined, 
		password || undefined, 
		handlePasswordError
	);


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


	return (
		<Box style={{ display: 'flex', height: '100vh' }}>
			<TablesSidebar />
			<Box flex={1} p="xl" style={{ overflow: 'auto' }}>
				<Text size="sm" c="blue" mb="md">
					🔄 Y.js Collaborative Table - Open multiple tabs to see real-time collaboration!
					{isConnected ? ' ✅ Connected' : ' 🔄 Connecting...'}
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

const PasswordInputView: React.FC = () => {
	const { setPassword, setStatus, status } = useTableAuth();
	const navigate = useNavigate();

	const handlePasswordSubmit = (submittedPassword: string) => {
		setPassword(submittedPassword);
		setStatus('OK');
	};

	const handleCancel = () => {
		navigate('/tables');
	};

	return (
		<PasswordView 
			onPasswordSubmit={handlePasswordSubmit}
			
			onCancel={handleCancel}
		/>
	);
};

const TableContainer: React.FC = () => {
	const { status, setPassword, setStatus } = useTableAuth();
	const [loading, setLoading] = useState(false);
	const { tableId } = useParams<{ tableId: string }>();

	useEffect(() => {
		console.log("updating status")
		if (tableId) {
			setLoading(true);
			setPassword(null);
			setStatus('OK');
			
			// Show loading for a brief moment to give visual feedback
			const timer = setTimeout(() => {
				setLoading(false);
			}, 300);
			
			return () => clearTimeout(timer);
		}
	}, [tableId, setPassword, setStatus]);

	if (loading) {
		return (
			<Box style={{ display: 'flex', height: '100vh' }}>
				<TablesSidebar />
				<Box 
					flex={1} 
					style={{ 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						background: 'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-indigo-0) 100%)',
						animation: 'fadeIn 0.3s ease-in-out'
					}}
				>
					<Center>
						<Box ta="center">
							<Loader size="xl" mb="lg" color="blue" />
							<Text size="lg" fw={500} c="blue" mb="xs">Loading table...</Text>
							<Text size="sm" c="dimmed">Preparing your collaborative workspace</Text>
						</Box>
					</Center>
				</Box>
			</Box>
		);
	}

	if (status === 'failed') {
		return <PasswordInputView />;
	}

	return <TableView />;
};

const AppWithUser: React.FC = () => {
	const { userName, setUserName } = useUser();

	if (!userName) {
		return <NicknameModal onSubmit={setUserName} />;
	}

	return (
		<TableAuthProvider>
			<Routes>
				<Route path="/tables" element={<TableContainer />} />
				<Route path="/tables/:tableId" element={<TableContainer />} />
				<Route path="*" element={<Navigate to="/tables" replace />} />
			</Routes>
		</TableAuthProvider>
	);
};

const theme = createTheme({
	// Use Mantine's default theme
});

const App = () => {
	return (
		<MantineProvider theme={theme}>
			<BrowserRouter>
				<UserProvider>
					<AppWithUser />
				</UserProvider>
			</BrowserRouter>
		</MantineProvider>
	);
};

ReactDOM.createRoot(document.getElementById('root')!).render(
	<React.StrictMode>
		<App />
	</React.StrictMode>
);