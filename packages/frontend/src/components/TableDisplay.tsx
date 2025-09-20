import React from 'react';
import { Container, Button, Box, Text, Table, Group, Paper, Stack } from '@mantine/core';
import { EditableCell } from './EditableCell';

interface TableDisplayProps {
	tableData: string[][];
	onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
	onAddRow: () => void;
	onAddCol: () => void;
	setEditingCell: (rowIndex: number, colIndex: number) => void;
	clearEditingCell: () => void;
	editingMap: Record<string, string[]>;
}

export const TableDisplay: React.FC<TableDisplayProps> = ({
	tableData,
	onCellChange,
	onAddRow,
	onAddCol,
	setEditingCell,
	clearEditingCell,
	editingMap,
}) => {
	const rows = tableData.length;
	const cols = tableData.reduce((m, r) => Math.max(m, r.length), 0);
	const getCellValue = (rowIndex: number, colIndex: number): string => {
		// Return cell value if it exists in tableData, otherwise empty string
		if (rowIndex < tableData.length && colIndex < tableData[rowIndex].length) {
			return tableData[rowIndex][colIndex];
		}
		return '';
	};


	return (
		<Container py="lg">
			<Group mb="md">
				<Button onClick={onAddRow}>Add New Row</Button>
				<Button onClick={onAddCol} variant="outline">Add New Column</Button>
			</Group>

			<Paper withBorder>
				<Box style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
					{Array.from({ length: rows }, (_, rowIndex) => (
						Array.from({ length: cols }, (_, colIndex) => {
							const cellKey = `${rowIndex}:${colIndex}`;
							const editingUsers = editingMap[cellKey] || [];
							return (
								<Box 
									key={`${rowIndex}-${colIndex}`} 
									style={{ 
										borderRight: colIndex < cols - 1 ? '1px solid var(--mantine-color-gray-3)' : undefined,
										borderBottom: rowIndex < rows - 1 ? '1px solid var(--mantine-color-gray-3)' : undefined,
									}}
								>
									<EditableCell
										value={getCellValue(rowIndex, colIndex)}
										rowIndex={rowIndex}
										colIndex={colIndex}
										onValueChange={onCellChange}
										onFocus={setEditingCell}
										onBlur={clearEditingCell}
										editingUsers={editingUsers}
									/>
								</Box>
							);
						})
					)).flat()}
				</Box>
			</Paper>

			{/* Debug Info */}
			<Paper mt="xl" p="md" bg="gray.1">
				<Text fw={600} mb="sm">Debug Info:</Text>
				<Stack gap="xs">
					<Text size="sm">Table Size: {rows} × {cols}</Text>
					<Text size="sm">Data Size: {tableData.length} × {tableData[0]?.length || 0}</Text>
					<Text size="sm">Total Cells: {rows * cols} (Data: {tableData.reduce((sum, row) => sum + row.length, 0)})</Text>
					<Table bg="white" mt="sm">
						<Table.Tbody>
							{tableData.map((row, rowIndex) => (
								<Table.Tr key={rowIndex}>
									{row.map((cell, colIndex) => (
										<Table.Td key={colIndex}>{cell}</Table.Td>
									))}
								</Table.Tr>
							))}
						</Table.Tbody>
					</Table>
				</Stack>
			</Paper>
		</Container>
	);
};
