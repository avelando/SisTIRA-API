/*
  Warnings:

  - You are about to drop the column `questionId` on the `Discipline` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Discipline" DROP CONSTRAINT "Discipline_questionId_fkey";

-- AlterTable
ALTER TABLE "Discipline" DROP COLUMN "questionId";

-- CreateTable
CREATE TABLE "QuestionDiscipline" (
    "questionId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "QuestionDiscipline_pkey" PRIMARY KEY ("questionId","disciplineId")
);

-- AddForeignKey
ALTER TABLE "QuestionDiscipline" ADD CONSTRAINT "QuestionDiscipline_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionDiscipline" ADD CONSTRAINT "QuestionDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
