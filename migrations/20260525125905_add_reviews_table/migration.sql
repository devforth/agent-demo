-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "app_name" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review_text" TEXT NOT NULL,
    "author_email" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "responded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL
);
