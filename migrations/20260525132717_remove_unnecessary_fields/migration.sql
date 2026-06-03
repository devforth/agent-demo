/*
  Warnings:

  - You are about to drop the column `app_name` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `responded` on the `reviews` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL
);
INSERT INTO "new_reviews" ("author_email", "created_at", "id", "platform", "rating", "review_text") SELECT "author_email", "created_at", "id", "platform", "rating", "review_text" FROM "reviews";
DROP TABLE "reviews";
ALTER TABLE "new_reviews" RENAME TO "reviews";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
