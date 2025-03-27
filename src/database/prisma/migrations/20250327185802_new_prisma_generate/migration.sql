/*
  Warnings:

  - A unique constraint covering the columns `[accessCode]` on the table `Exam` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "accessCode" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "ExamResponse" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamAnswer" (
    "id" TEXT NOT NULL,
    "responseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "alternativeId" TEXT,
    "subjectiveText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamResponse_examId_userId_key" ON "ExamResponse"("examId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_accessCode_key" ON "Exam"("accessCode");

-- AddForeignKey
ALTER TABLE "ExamResponse" ADD CONSTRAINT "ExamResponse_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResponse" ADD CONSTRAINT "ExamResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_responseId_fkey" FOREIGN KEY ("responseId") REFERENCES "ExamResponse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamAnswer" ADD CONSTRAINT "ExamAnswer_alternativeId_fkey" FOREIGN KEY ("alternativeId") REFERENCES "Alternative"("id") ON DELETE SET NULL ON UPDATE CASCADE;
