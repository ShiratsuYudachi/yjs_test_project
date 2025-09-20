import React from 'react';
import { Container, Button } from '@mantine/core';
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
		<Container className="py-8">
			<div className="flex gap-2 mb-4">
				<Button onClick={onAddRow}>Add New Row</Button>
				<Button onClick={onAddCol} variant="outline">Add New Column</Button>
			</div>

			<div className="table-container border border-gray-300 rounded-lg overflow-hidden">
				{/* Table Body - Generate based on metadata size */}
				<div className="table-body">
					{Array.from({ length: rows }, (_, rowIndex) => (
						<div 
							key={rowIndex} 
							className={`table-row grid border-b border-gray-300 last:border-b-0`}
							style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
						>
							{Array.from({ length: cols }, (_, colIndex) => {
								const cellKey = `${rowIndex}:${colIndex}`;
								const editingUsers = editingMap[cellKey] || [];
								return (
									<div key={`${rowIndex}-${colIndex}`} className="border-r border-gray-300 last:border-r-0">
										<EditableCell
											value={getCellValue(rowIndex, colIndex)}
											rowIndex={rowIndex}
											colIndex={colIndex}
											onValueChange={onCellChange}
											onFocus={setEditingCell}
											onBlur={clearEditingCell}
											editingUsers={editingUsers}
										/>
									</div>
								);
							})}
						</div>
					))}
				</div>
			</div>

			{/* Debug Info */}
			<div className="mt-6 p-4 bg-gray-100 rounded-lg">
				<h4 className="font-semibold mb-2">Debug Info:</h4>
				<p className="text-sm">Table Size: {rows} × {cols}</p>
				<p className="text-sm">Data Size: {tableData.length} × {tableData[0]?.length || 0}</p>
				<p className="text-sm">Total Cells: {rows * cols} (Data: {tableData.reduce((sum, row) => sum + row.length, 0)})</p>
			<table className="text-xs bg-white p-2 rounded border mt-2 overflow-x-auto">
				<tbody>
					{tableData.map((row, rowIndex) => (
						<tr key={rowIndex}>
							{row.map((cell, colIndex) => (
								<td key={colIndex} className="border px-2 py-1">{cell}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			</div>
		</Container>
	);
};
