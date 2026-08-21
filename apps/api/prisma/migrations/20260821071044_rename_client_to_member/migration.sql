/*
  Warnings:

  - The values [client] on the enum `RoomRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RoomRole_new" AS ENUM ('admin', 'member');
ALTER TABLE "public"."RoomMembers" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "RoomMembers" ALTER COLUMN "role" TYPE "RoomRole_new" USING ("role"::text::"RoomRole_new");
ALTER TYPE "RoomRole" RENAME TO "RoomRole_old";
ALTER TYPE "RoomRole_new" RENAME TO "RoomRole";
DROP TYPE "public"."RoomRole_old";
ALTER TABLE "RoomMembers" ALTER COLUMN "role" SET DEFAULT 'member';
COMMIT;

-- AlterTable
ALTER TABLE "RoomMembers" ALTER COLUMN "role" SET DEFAULT 'member';
