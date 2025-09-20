import * as Y from 'yjs';
import { PrismaClient } from '@prisma/client';

type DebounceHandle = ReturnType<typeof setTimeout> | null;

export function createYjsPersistence(prisma: PrismaClient) {
	const debounceByDoc = new Map<string, DebounceHandle>();

	const schedulePersist = (docName: string, ydoc: Y.Doc) => {
		const prev = debounceByDoc.get(docName);
		if (prev) clearTimeout(prev as any);
		const handle = setTimeout(() => {
			persistFullSnapshot(docName, ydoc).catch((err) => {
				console.error('[yjs][persist] error', err);
			});
		}, 250);
		debounceByDoc.set(docName, handle);
	};

	const persistFullSnapshot = async (docName: string, ydoc: Y.Doc) => {
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');
		const newCells: { tableId: string; rowIndex: number; colIndex: number; value: string }[] = [];
		ytableData.forEach((yrow, rowIndex) => {
			for (let colIndex = 0; colIndex < yrow.length; colIndex++) {
				const value = yrow.get(colIndex) as unknown as string;
				if (value && value.length > 0) {
					newCells.push({ tableId: docName, rowIndex, colIndex, value });
				}
			}
		});

		const ops: any[] = [
			prisma.tableCell.deleteMany({ where: { tableId: docName } }),
		];
		if (newCells.length) {
			ops.push(prisma.tableCell.createMany({ data: newCells }));
		}
		await prisma.$transaction(ops);
	};

	const hydrateIfEmpty = async (docName: string, ydoc: Y.Doc) => {
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');
		const ymetadata = ydoc.getMap('table-metadata');
		if (ytableData.length > 0) return;

		const cells = await prisma.tableCell.findMany({ where: { tableId: docName } });
		if (cells.length === 0) return;

		let maxRow = 0;
		let maxCol = 0;
		for (const c of cells) {
			if (c.rowIndex > maxRow) maxRow = c.rowIndex;
			if (c.colIndex > maxCol) maxCol = c.colIndex;
		}
		const rows = maxRow + 1;
		const cols = maxCol + 1;

		Y.transact(ydoc, () => {
			// set metadata
			ymetadata.set('rows', rows);
			ymetadata.set('cols', cols);
			if (!ymetadata.get('title')) ymetadata.set('title', '');
			if (!ymetadata.get('description')) ymetadata.set('description', '');

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
			// fill values
			for (const c of cells) {
				const yrow = ytableData.get(c.rowIndex);
				// replace value at col
				yrow.delete(c.colIndex, 1);
				yrow.insert(c.colIndex, [c.value]);
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
				console.log('[yjs][hydrate] observing deep changes');
				schedulePersist(docName, ydoc);
			};
            console.log('[yjs][hydrate] observing deep changes');
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


