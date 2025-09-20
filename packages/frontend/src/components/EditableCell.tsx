import React, { useState, useEffect } from 'react';

interface EditableCellProps {
	value: string;
	rowIndex: number;
	colIndex: number;
	onValueChange: (rowIndex: number, colIndex: number, value: string) => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
	value,
	rowIndex,
	colIndex,
	onValueChange,
}) => {
	const [localValue, setLocalValue] = useState(value);

	useEffect(() => {
		setLocalValue(value);
	}, [value]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value;
		setLocalValue(newValue);
		onValueChange(rowIndex, colIndex, newValue);
	};

	return (
		<div className="p-2 bg-white">
			<input
				type="text"
				value={localValue}
				onChange={handleInputChange}
				className="w-full border-none outline-none bg-transparent"
				placeholder="Enter value..."
			/>
		</div>
	);
};
