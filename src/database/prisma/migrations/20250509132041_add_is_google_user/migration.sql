-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isGoogleUser" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "password" DROP NOT NULL;
