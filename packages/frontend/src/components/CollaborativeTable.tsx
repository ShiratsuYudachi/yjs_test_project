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
	onDataChange: (newData: string[][]) => void;
	onMetadataChange: (newMetadata: TableMetadata) => void;
}

export const CollaborativeTable: React.FC<CollaborativeTableProps> = ({
	metadata,
	tableData,
	onDataChange,
	onMetadataChange,
}) => {
	const handleValueChange = (rowIndex: number, colIndex: number, value: string) => {
		const newData = tableData.map((row, rIndex) => 
			rIndex === rowIndex 
				? row.map((cell, cIndex) => cIndex === colIndex ? value : cell)
				: row
		);
		onDataChange(newData);
	};

	const addNewRow = () => {
		const newRow = new Array(metadata.cols).fill('');
		const newData = [...tableData, newRow];
		const newMetadata = { ...metadata, rows: metadata.rows + 1 };
		
		onDataChange(newData);
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
				<Button onClick={addNewRow} className="mb-4">
					Add New Row
				</Button>
			</div>

			<div className="table-container border border-gray-300 rounded-lg overflow-hidden">
				{/* Table Body */}
				<div className="table-body">
					{tableData.map((row, rowIndex) => (
						<div 
							key={rowIndex} 
							className={`table-row grid border-b border-gray-300 last:border-b-0`}
							style={{ gridTemplateColumns: `repeat(${metadata.cols}, 1fr)` }}
						>
							{row.map((cellValue, colIndex) => (
								<div key={`${rowIndex}-${colIndex}`} className="border-r border-gray-300 last:border-r-0">
									<EditableCell
										value={cellValue}
										rowIndex={rowIndex}
										colIndex={colIndex}
										onValueChange={handleValueChange}
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
				<p className="text-sm">Rows: {metadata.rows} (Actual: {tableData.length})</p>
				<p className="text-sm">Cols: {metadata.cols}</p>
				<p className="text-sm">Total Cells: {metadata.rows * metadata.cols}</p>
			</div>
		</Container>
	);
};
