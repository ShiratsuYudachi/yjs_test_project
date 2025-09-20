import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
// metadata removed

interface UseCollaborativeTableReturn {
	tableData: string[][];
	updateCell: (rowIndex: number, colIndex: number, value: string) => void;
	addRow: () => void;
	addCol: () => void;
	isConnected: boolean;
}

export const useSyncedTableInfo = (
	documentName: string,
	initialData: string[][] = []
): UseCollaborativeTableReturn => {
	const [tableData, setTableData] = useState<string[][]>(initialData);
	const [isConnected, setIsConnected] = useState(false);

	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
// no metadata now
	const ytableDataRef = useRef<Y.Array<Y.Array<string>> | null>(null);
	
	// Store initial values in refs to avoid dependency issues
// removed
	const initialDataRef = useRef(initialData);

	useEffect(() => {
		// Create Y.js document and connect to WebSocket
		const ydoc = new Y.Doc();
		const provider = new WebsocketProvider('ws://localhost:1234', documentName, ydoc);
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');

		ydocRef.current = ydoc;
		providerRef.current = provider;
		ytableDataRef.current = ytableData;

		// Connection status
		provider.on('status', (event: any) => {
			setIsConnected(event.status === 'connected');
		});

        // no metadata init

		if (ytableData.length === 0 && initialDataRef.current.length > 0) {
			initialDataRef.current.forEach(row => {
				const yrow = new Y.Array<string>();
				row.forEach(cell => yrow.push([cell]));
				ytableData.push([yrow]);
			});
		}

        // no metadata updates

		// Update local state when Y.js table data changes
		const updateTableData = () => {
			const newData: string[][] = [];
			ytableData.forEach((yrow: Y.Array<string>) => {
				const row: string[] = [];
				yrow.forEach((cell: string) => {
					row.push(cell);
				});
				newData.push(row);
			});
            console.log("updating tableData:", newData);
			setTableData(newData);
		};

		// Listen for Y.js changes
		ytableData.observe(updateTableData);
		
		ytableData.observeDeep(updateTableData);

		// Initial sync
		updateTableData();

		// Cleanup
		return () => {
			ytableData.unobserve(updateTableData);
			ytableData.unobserveDeep(updateTableData);
			provider.destroy();
			ydoc.destroy();
		};
	}, [documentName]); // Only documentName as dependency

	// Expand table data if needed
	const expandTableData = (targetRowIndex: number, targetColIndex: number) => {
		if (!ytableDataRef.current) return;

		const ytableData = ytableDataRef.current;
		
		// Expand rows if needed
		while (ytableData.length <= targetRowIndex) {
			const yrow = new Y.Array<string>();
			ytableData.push([yrow]);
		}
		
		// Expand columns in the target row if needed
		const targetRow = ytableData.get(targetRowIndex);
		while (targetRow.length <= targetColIndex) {
			targetRow.push(['']);
		}
	};

// no metadata updater

	// Update individual cell
	const updateCell = (rowIndex: number, colIndex: number, value: string) => {
		if (!ytableDataRef.current) return;

		// First, expand tableData if the cell is out of range
		expandTableData(rowIndex, colIndex);
		
		// Now update the cell value
		const ytableData = ytableDataRef.current;
		const yrow = ytableData.get(rowIndex);
		yrow.delete(colIndex, 1);
		yrow.insert(colIndex, [value]);
        console.log("updating ytableData:", ytableData);
	};

	const addRow = () => {
		if (!ytableDataRef.current) return;
		const ytableData = ytableDataRef.current;
		let maxCols = 0;
		ytableData.forEach((r) => { if (r.length > maxCols) maxCols = r.length; });
		const yrow = new Y.Array<string>();
		for (let i = 0; i < maxCols; i++) yrow.push(['']);
		ytableData.push([yrow]);
	};

	const addCol = () => {
		if (!ytableDataRef.current) return;
		const ytableData = ytableDataRef.current;
		ytableData.forEach((yrow) => {
			yrow.push(['']);
		});
	};

	return {
		tableData,
		updateCell,
		addRow,
		addCol,
		isConnected,
	};
};
