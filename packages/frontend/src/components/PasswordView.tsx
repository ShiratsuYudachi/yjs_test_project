import React, { useState } from 'react';
import { Container, Text, TextInput, Button, Box, Alert } from '@mantine/core';
import { useNavigate, useParams } from 'react-router-dom';
import { TablesSidebar } from './TablesSidebar';

interface PasswordViewProps {
	onPasswordSubmit: (password: string) => void;
	error?: string;
	tableName?: string;
	onCancel?: () => void;
}

export const PasswordView: React.FC<PasswordViewProps> = ({ onPasswordSubmit, error, tableName, onCancel }) => {
	const [password, setPassword] = useState('');
	const navigate = useNavigate();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (password.trim()) {
			onPasswordSubmit(password.trim());
		}
	};

	const handleCancel = () => {
		if (onCancel) {
			onCancel();
		} else {
			navigate('/tables');
		}
	};

	return (
		<Box style={{ display: 'flex', height: '100vh' }}>
			<TablesSidebar />
			<Box flex={1} p="xl" style={{ overflow: 'auto' }}>
				<Container size="sm" style={{ marginTop: '10vh' }}>
					<Text size="xl" mb="md" ta="center">
						{tableName ? `Enter password for "${tableName}"` : 'Enter table password'}
					</Text>
					
					{error && (
						<Alert color="red" mb="md">
							{error}
						</Alert>
					)}

					<form onSubmit={handleSubmit}>
						<TextInput
							type="password"
							placeholder="Table password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							mb="md"
							autoFocus
							size="lg"
						/>
						
						<Box style={{ display: 'flex', gap: '1rem' }}>
							<Button type="submit" disabled={!password.trim()} flex={1} size="lg">
								Join Table
							</Button>
							<Button variant="outline" onClick={handleCancel} flex={1} size="lg">
								Cancel
							</Button>
						</Box>
					</form>
				</Container>
			</Box>
		</Box>
	);
};
