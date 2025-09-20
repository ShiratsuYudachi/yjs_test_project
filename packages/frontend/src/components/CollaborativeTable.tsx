import React from 'react';
import { Container, Title, Button } from '@mantine/core';
import { EditableCell } from './EditableCell';

export interface TableMetadata {
	rows: number;
	cols: number;
	title?: string;
	description?: string;
}

interface CollaborativeTableProps {
	metadata: TableMetadata;
	tableData: string[][];
	onMetadataChange: (newMetadata: TableMetadata) => void;
	onCellChange: (rowIndex: number, colIndex: number, value: string) => void;
}

export const CollaborativeTable: React.FC<CollaborativeTableProps> = ({
	metadata,
	tableData,
	onMetadataChange,
	onCellChange,
}) => {
	const getCellValue = (rowIndex: number, colIndex: number): string => {
		// Return cell value if it exists in tableData, otherwise empty string
		if (rowIndex < tableData.length && colIndex < tableData[rowIndex].length) {
			return tableData[rowIndex][colIndex];
		}
		return '';
	};


	const addNewRow = () => {
		const newMetadata = { ...metadata, rows: metadata.rows + 1 };
		onMetadataChange(newMetadata);
	};

	const addNewCol = () => {
		const newMetadata = { ...metadata, cols: metadata.cols + 1 };
		onMetadataChange(newMetadata);
	};


	return (
		<Container className="py-8">
			<div className="mb-6">
				<Title order={2} className="mb-4">
					{metadata.title || 'Collaborative Table'}
				</Title>
				<p className="text-gray-600 mb-4">
					{metadata.description}
				</p>
				<div className="flex gap-2 mb-4">
					<Button onClick={addNewRow}>Add New Row</Button>
					<Button onClick={addNewCol} variant="outline">Add New Column</Button>
				</div>
			</div>

			<div className="table-container border border-gray-300 rounded-lg overflow-hidden">
				{/* Table Body - Generate based on metadata size */}
				<div className="table-body">
					{Array.from({ length: metadata.rows }, (_, rowIndex) => (
						<div 
							key={rowIndex} 
							className={`table-row grid border-b border-gray-300 last:border-b-0`}
							style={{ gridTemplateColumns: `repeat(${metadata.cols}, 1fr)` }}
						>
							{Array.from({ length: metadata.cols }, (_, colIndex) => (
								<div key={`${rowIndex}-${colIndex}`} className="border-r border-gray-300 last:border-r-0">
									<EditableCell
										value={getCellValue(rowIndex, colIndex)}
										rowIndex={rowIndex}
										colIndex={colIndex}
										onValueChange={onCellChange}
									/>
								</div>
							))}
						</div>
					))}
				</div>
			</div>

			{/* Debug Info */}
			<div className="mt-6 p-4 bg-gray-100 rounded-lg">
				<h4 className="font-semibold mb-2">Debug Info:</h4>
				<p className="text-sm">Table Size: {metadata.rows} × {metadata.cols}</p>
				<p className="text-sm">Data Size: {tableData.length} × {tableData[0]?.length || 0}</p>
				<p className="text-sm">Total Cells: {metadata.rows * metadata.cols} (Data: {tableData.reduce((sum, row) => sum + row.length, 0)})</p>
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
