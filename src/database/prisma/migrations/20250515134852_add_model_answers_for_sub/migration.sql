-- CreateEnum
CREATE TYPE "ModelAnswerType" AS ENUM ('WRONG', 'MEDIAN', 'CORRECT');

-- AlterTable
ALTER TABLE "Exam" ALTER COLUMN "isPublic" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SubjectiveModelAnswer" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" "ModelAnswerType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubjectiveModelAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SubjectiveModelAnswer_questionId_type_key" ON "SubjectiveModelAnswer"("questionId", "type");

-- AddForeignKey
ALTER TABLE "SubjectiveModelAnswer" ADD CONSTRAINT "SubjectiveModelAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
