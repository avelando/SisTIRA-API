/*
  Warnings:

  - You are about to drop the column `questionBankId` on the `Exam` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Exam" DROP CONSTRAINT "Exam_questionBankId_fkey";

-- AlterTable
ALTER TABLE "Exam" DROP COLUMN "questionBankId";

-- CreateTable
CREATE TABLE "ExamQuestionBank" (
    "examId" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,

    CONSTRAINT "ExamQuestionBank_pkey" PRIMARY KEY ("examId","questionBankId")
);

-- AddForeignKey
ALTER TABLE "ExamQuestionBank" ADD CONSTRAINT "ExamQuestionBank_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamQuestionBank" ADD CONSTRAINT "ExamQuestionBank_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;
