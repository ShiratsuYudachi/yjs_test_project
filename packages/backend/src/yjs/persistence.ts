import * as Y from 'yjs';
import { PrismaClient } from '@prisma/client';
import { printType } from 'graphql';

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

        // can be optimized more.. but lazy now
		const cells = yTableDataToArray(ytableData);
        const ops: any[] = [];
        for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
            for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {
                const value = cells[rowIndex][colIndex];
                ops.push(prisma.tableCell.upsert({
                    where: { tableId_rowIndex_colIndex: { tableId: docName, rowIndex, colIndex } },
                    update: { value },
                    create: { tableId: docName, rowIndex, colIndex, value },
                }));
            }
        }
		printytableData('[yjs][persist] saving table-data:', ytableData);
		await prisma.$transaction(ops);
	};

    const yTableDataToArray = (ytableData: Y.Array<Y.Array<string>>) => {
        const array: string[][] = [];
		ytableData.forEach((yrow: Y.Array<string>) => {
			const row: string[] = [];
			yrow.forEach((cell: string) => row.push(cell));
			array.push(row);
		});
        return array;
    }

    const printytableData = (str: string, ytableData: Y.Array<Y.Array<string>>) => {
        const debugArray: string[][] = [];
		ytableData.forEach((yrow: Y.Array<string>) => {
			const row: string[] = [];
			yrow.forEach((cell: string) => row.push(cell));
			debugArray.push(row);
		});
        console.log(str, debugArray);
    };

	const hydrateIfEmpty = async (docName: string, ydoc: Y.Doc) => {
		const ytableData = ydoc.getArray<Y.Array<string>>('table-data');
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
		const rows = rowsFromCells;
		const cols = colsFromCells;

		Y.transact(ydoc, () => {

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
        printytableData('[yjs][hydrate] hydrating table-data:', ytableData);
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


