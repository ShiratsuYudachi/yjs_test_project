import * as Y from 'yjs';
import { PrismaClient } from '@prisma/client';

type DebounceHandle = ReturnType<typeof setTimeout> | null;

export function createYjsPersistence(prisma: PrismaClient) {
	const debounceByDoc = new Map<string, DebounceHandle>();

	const schedulePersist = (docName: string, ydoc: Y.Doc) => {
		const prev = debounceByDoc.get(docName);
		if (prev) clearTimeout(prev as any);
		const handle = setTimeout(() => {
            console.log("[yjs][persist] saving snapshot");
			persistFullSnapshot(docName, ydoc).catch((err) => {
				console.error('[yjs][persist] error', err);
			});
		}, 250);
		debounceByDoc.set(docName, handle);
	};

	const persistFullSnapshot = async (docName: string, ydoc: Y.Doc) => {
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');
		const ymetadata = ydoc.getMap('table-metadata');
		const newCells: { tableId: string; rowIndex: number; colIndex: number; value: string }[] = [];

		// compute rows/cols from current doc for robustness
		const rowsCount = ytableData.length;
		let maxCols = 0;
		ytableData.forEach((yrow) => { if (yrow.length > maxCols) maxCols = yrow.length; });

		ytableData.forEach((yrow, rowIndex) => {
			for (let colIndex = 0; colIndex < yrow.length; colIndex++) {
				const value = yrow.get(colIndex) as unknown as string;
				if (value && value.length > 0) {
					newCells.push({ tableId: docName, rowIndex, colIndex, value });
				}
			}
		});
		const newTableEntry = {
			rows: (ymetadata.get('rows') as number) ?? rowsCount,
			cols: (ymetadata.get('cols') as number) ?? maxCols,
		};

		const ops: any[] = [
			prisma.tableCell.deleteMany({ where: { tableId: docName } }),
			prisma.table.update({
				where: { id: docName },
				data: newTableEntry,
			}),
		];
		if (newCells.length) {
			ops.push(prisma.tableCell.createMany({ data: newCells }));
		}
		await prisma.$transaction(ops);
	};

	const hydrateIfEmpty = async (docName: string, ydoc: Y.Doc) => {
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');
		const ymetadata = ydoc.getMap('table-metadata')
		if (ytableData.length > 0) return;

		const tableEntry = await prisma.table.findUnique({ where: { id: docName } });
		if (!tableEntry) return;

		const cells = await prisma.tableCell.findMany({ where: { tableId: docName } });

		// determine required matrix size from both DB table metadata and actual cells
		let maxRow = 0;
		let maxCol = 0;
		for (const c of cells) {
			if (c.rowIndex > maxRow) maxRow = c.rowIndex;
			if (c.colIndex > maxCol) maxCol = c.colIndex;
		}
		const rowsFromCells = cells.length ? maxRow + 1 : 0;
		const colsFromCells = cells.length ? maxCol + 1 : 0;
		const rows = Math.max(tableEntry?.rows || 0, rowsFromCells);
		const cols = Math.max(tableEntry?.cols || 0, colsFromCells);

		Y.transact(ydoc, () => {
			// set metadata
			ymetadata.set('rows', rows);
			ymetadata.set('cols', cols);
            ymetadata.set('title', tableEntry.name);
            console.log("hydrating table metadata title:", ymetadata.get('title'));

			// ensure rows
			while (ytableData.length < rows) {
				const yrow = new Y.Array<string>();
				// prefill columns
				for (let i = 0; i < cols; i++) yrow.push(['']);
				ytableData.push([yrow]);
			}
			// ensure each row has cols
			for (let r = 0; r < rows; r++) {
				const yrow = ytableData.get(r);
				while (yrow.length < cols) yrow.push(['']);
			}
			// fill values (if any)
			for (const c of cells) {
				const yrow = ytableData.get(c.rowIndex);
				if (!yrow) continue; // safety guard
				// replace value at col
				if (c.colIndex < yrow.length) {
					yrow.delete(c.colIndex, 1);
					yrow.insert(c.colIndex, [c.value]);
				}
			}
		});
	};

	return {
		bindState: async (docName: string, ydoc: Y.Doc) => {
			try {
				await hydrateIfEmpty(docName, ydoc);
			} catch (e) {
				console.error('[yjs][hydrate] error', e);
			}
			const ytableData = ydoc.getArray('table-data');
			const onDeep = () => {
				schedulePersist(docName, ydoc);
			};
			ytableData.observeDeep(onDeep);
			// return unbind
			return () => {
				ytableData.unobserveDeep(onDeep);
				const h = debounceByDoc.get(docName);
				if (h) clearTimeout(h as any);
				debounceByDoc.delete(docName);
			};
		},
		writeState: async (docName: string, ydoc: Y.Doc) => {
			await persistFullSnapshot(docName, ydoc);
		},
	};
}


