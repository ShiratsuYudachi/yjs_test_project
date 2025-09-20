import { useState, useEffect, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
// metadata removed

interface UseCollaborativeTableReturn {
	tableData: string[][];
	updateCell: (rowIndex: number, colIndex: number, value: string) => void;
	addRow: () => void;
	addCol: () => void;
	setEditingCell: (rowIndex: number, colIndex: number) => void;
	clearEditingCell: () => void;
	editingMap: Record<string, string[]>;
	isConnected: boolean;
}

export const useSyncedTableInfo = (
	documentName: string,
	initialData: string[][] = [],
	userName?: string,
	password?: string,
	onConnectionError?: () => void,
): UseCollaborativeTableReturn => {
	const [tableData, setTableData] = useState<string[][]>(initialData);
	const [isConnected, setIsConnected] = useState(false);
    const [editingMap, setEditingMap] = useState<Record<string, string[]>>({});

	const ydocRef = useRef<Y.Doc | null>(null);
	const providerRef = useRef<WebsocketProvider | null>(null);
// no metadata now
const ytableDataRef = useRef<Y.Array<Y.Array<string>> | null>(null);
const selfClientIdRef = useRef<number | null>(null);
	
	// Store initial values in refs to avoid dependency issues
// removed
	const initialDataRef = useRef(initialData);

	useEffect(() => {
		// Create Y.js document and connect to WebSocket
		const ydoc = new Y.Doc();
		
		// Build WebSocket URL with password if provided
		let wsUrl = `ws://localhost:1234/${documentName}`;
		if (password) {
			wsUrl += `?password=${encodeURIComponent(password)}`;
		}
		
		const provider = new WebsocketProvider(wsUrl, '', ydoc);
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');

		ydocRef.current = ydoc;
		providerRef.current = provider;
		ytableDataRef.current = ytableData;
		selfClientIdRef.current = provider.awareness.clientID;

		// Connection status
		provider.on('status', (event: any) => {
			setIsConnected(event.status === 'connected');
		});

		// Handle WebSocket errors (like wrong password)
		provider.ws?.addEventListener('close', (event: CloseEvent) => {
			if (event.code === 1008) {
				onConnectionError?.();
			}
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

		// Awareness: set local nickname and track others' editing
		const setLocalUser = () => {
			const desired = (userName && userName.trim()) ? userName.trim() : 'Anonymous';
			const states = Array.from(provider.awareness.getStates().values());
			const used = new Set<string>();
			states.forEach(s => { if (s?.user?.name) used.add(String(s.user.name)); });
			let finalName = desired;
			let i = 2;
			while (used.has(finalName)) finalName = `${desired}-${i++}`;
			provider.awareness.setLocalStateField('user', { name: finalName });
		};

		const recomputeEditing = () => {
			const map: Record<string, string[]> = {};
			const selfId = selfClientIdRef.current;
			provider.awareness.getStates().forEach((state: any, cid: number) => {
				if (cid === selfId) return;
				const name = state?.user?.name as string | undefined;
				const editing = state?.editing as { rowIndex: number; colIndex: number } | undefined;
				if (!name || !editing) return;
				const key = `${editing.rowIndex}:${editing.colIndex}`;
				if (!map[key]) map[key] = [];
				map[key].push(name);
			});
			setEditingMap(map);
		};

		const onAwarenessChange = () => {
			recomputeEditing();
		};
		provider.awareness.on('change', onAwarenessChange);

		// Initial sync
		updateTableData();
		setLocalUser();
		recomputeEditing();

		// Cleanup
		return () => {
			ytableData.unobserve(updateTableData);
			ytableData.unobserveDeep(updateTableData);
			provider.awareness.off('change', onAwarenessChange);
			provider.destroy();
			ydoc.destroy();
		};
	}, [documentName, userName, password]);

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

	const setEditingCell = (rowIndex: number, colIndex: number) => {
		if (!providerRef.current) return;
		providerRef.current.awareness.setLocalStateField('editing', { rowIndex, colIndex });
	};

	const clearEditingCell = () => {
		if (!providerRef.current) return;
		providerRef.current.awareness.setLocalStateField('editing', null as any);
	};

	return {
		tableData,
		updateCell,
		addRow,
		addCol,
		setEditingCell,
		clearEditingCell,
		editingMap,
		isConnected
	};
};
