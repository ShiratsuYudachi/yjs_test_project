/*
  Warnings:

  - You are about to drop the column `cols` on the `Table` table. All the data in the column will be lost.
  - You are about to drop the column `rows` on the `Table` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Table" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Table" ("createdAt", "id", "name") SELECT "createdAt", "id", "name" FROM "Table";
DROP TABLE "Table";
ALTER TABLE "new_Table" RENAME TO "Table";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
