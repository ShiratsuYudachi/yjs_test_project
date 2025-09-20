import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { TableMetadata } from '../components/TableDisplay';

interface UseCollaborativeTableReturn {
	metadata: TableMetadata;
	tableData: string[][];
	updateMetadata: (newMetadata: TableMetadata) => void;
	updateCell: (rowIndex: number, colIndex: number, value: string) => void;
	isConnected: boolean;
}

export const useSyncedTableInfo = (
	documentName: string,
	initialMetadata: TableMetadata,
	initialData: string[][] = []
): UseCollaborativeTableReturn => {
	const [metadata, setMetadata] = useState<TableMetadata>(initialMetadata);
	const [tableData, setTableData] = useState<string[][]>(initialData);
	const [isConnected, setIsConnected] = useState(false);

	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
	const ymetadataRef = useRef<Y.Map<any> | null>(null);
	const ytableDataRef = useRef<Y.Array<Y.Array<string>> | null>(null);
	
	// Store initial values in refs to avoid dependency issues
	const initialMetadataRef = useRef(initialMetadata);
	const initialDataRef = useRef(initialData);

	useEffect(() => {
		// Create Y.js document and connect to WebSocket
		const ydoc = new Y.Doc();
		const provider = new WebsocketProvider('ws://localhost:1234', documentName, ydoc);
		const ymetadata = ydoc.getMap('table-metadata');
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');

		ydocRef.current = ydoc;
		providerRef.current = provider;
		ymetadataRef.current = ymetadata;
		ytableDataRef.current = ytableData;

		// Connection status
		provider.on('status', (event: any) => {
			setIsConnected(event.status === 'connected');
		});

		// Initialize Y.js data if empty
		if (ymetadata.size === 0) {
			ymetadata.set('rows', initialMetadataRef.current.rows);
			ymetadata.set('cols', initialMetadataRef.current.cols);
			ymetadata.set('title', initialMetadataRef.current.title || '');
			ymetadata.set('description', initialMetadataRef.current.description || '');
		}

		if (ytableData.length === 0 && initialDataRef.current.length > 0) {
			initialDataRef.current.forEach(row => {
				const yrow = new Y.Array<string>();
				row.forEach(cell => yrow.push([cell]));
				ytableData.push([yrow]);
			});
		}

		// Update local state when Y.js metadata changes
		const updateMetadata = () => {
			const newMetadata: TableMetadata = {
				rows: (ymetadata.get('rows') as number) || initialMetadataRef.current.rows,
				cols: (ymetadata.get('cols') as number) || initialMetadataRef.current.cols,
				title: (ymetadata.get('title') as string) || initialMetadataRef.current.title || '',
				description: (ymetadata.get('description') as string) || initialMetadataRef.current.description || '',
			};
			setMetadata(newMetadata);
		};

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
		ymetadata.observe(updateMetadata);
		ytableData.observe(updateTableData);
		
		ytableData.observeDeep(updateTableData);

		// Initial sync
		updateMetadata();
		updateTableData();

		// Cleanup
		return () => {
			ymetadata.unobserve(updateMetadata);
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

	// Update metadata
	const updateMetadata = (newMetadata: TableMetadata) => {
		if (!ymetadataRef.current) return;

		const ymetadata = ymetadataRef.current;
		ymetadata.set('rows', newMetadata.rows);
		ymetadata.set('cols', newMetadata.cols);
		ymetadata.set('title', newMetadata.title || '');
		ymetadata.set('description', newMetadata.description || '');
	};

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

	return {
		metadata,
		tableData,
		updateMetadata,
		updateCell,
		isConnected,
	};
};
