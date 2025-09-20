import React, { useState, useEffect } from 'react';

interface EditableCellProps {
	value: string;
	rowIndex: number;
	colIndex: number;
	onValueChange: (rowIndex: number, colIndex: number, value: string) => void;
	onFocus?: (rowIndex: number, colIndex: number) => void;
	onBlur?: () => void;
	editingUsers?: string[];
}

export const EditableCell: React.FC<EditableCellProps> = ({
	value,
	rowIndex,
	colIndex,
	onValueChange,
	onFocus,
	onBlur,
	editingUsers = [],
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

	const handleFocus = () => {
		onFocus?.(rowIndex, colIndex);
	};

	const handleBlur = () => {
		onBlur?.();
	};

	const isBeingEdited = editingUsers.length > 0;
	const editingTooltip = isBeingEdited ? `Editing: ${editingUsers.join(', ')}` : '';

	return (
		<div className={`p-2 relative ${isBeingEdited ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}>
			<input
				type="text"
				value={localValue}
				onChange={handleInputChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				className="w-full border-none outline-none bg-transparent"
				placeholder="Enter value..."
			/>
			{isBeingEdited && (
				<div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs px-1 py-0.5 rounded-bl text-nowrap z-10" title={editingTooltip}>
					{editingUsers.join(', ')}
				</div>
			)}
		</div>
	);
};
