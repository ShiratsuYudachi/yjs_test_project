import React, { useState } from 'react';
import { Modal, TextInput, Button, Stack, Text } from '@mantine/core';

interface CreateTableModalProps {
	opened: boolean;
	onClose: () => void;
	onSubmit: (name: string, password?: string) => void;
	loading?: boolean;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
	opened,
	onClose,
	onSubmit,
	loading = false
}) => {
	const [name, setName] = useState('');
	const [password, setPassword] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmedName = name.trim();
		const trimmedPassword = password.trim();
		
		if (!trimmedName) return;
		
		onSubmit(trimmedName, trimmedPassword || undefined);
	};

	const handleClose = () => {
		if (!loading) {
			setName('');
			setPassword('');
			onClose();
		}
	};

	return (
		<Modal
			opened={opened}
			onClose={handleClose}
			title="Create New Table"
			centered
			closeOnClickOutside={!loading}
			closeOnEscape={!loading}
		>
			<form onSubmit={handleSubmit}>
				<Stack gap="md">
					<TextInput
						label="Table Name"
						placeholder="Enter table name..."
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						autoFocus
						disabled={loading}
					/>
					
					<div>
						<TextInput
							label="Password (Optional)"
							placeholder="Enter password to protect this table..."
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={loading}
						/>
						<Text size="xs" c="dimmed" mt={4}>
							Leave empty for no password protection
						</Text>
					</div>

					<Stack gap="sm" mt="md">
						<Button 
							type="submit" 
							disabled={!name.trim() || loading}
							loading={loading}
							fullWidth
						>
							Create Table
						</Button>
						<Button 
							variant="subtle" 
							onClick={handleClose}
							disabled={loading}
							fullWidth
						>
							Cancel
						</Button>
					</Stack>
				</Stack>
			</form>
		</Modal>
	);
};
