/*
  Warnings:

  - You are about to drop the column `image` on the `Room` table. All the data in the column will be lost.
  - Added the required column `avatar` to the `Room` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isGroup` to the `Room` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Room" DROP COLUMN "image",
ADD COLUMN     "avatar" TEXT NOT NULL,
ADD COLUMN     "isGroup" BOOLEAN NOT NULL;
