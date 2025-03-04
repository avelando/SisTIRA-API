/*
  Warnings:

  - You are about to drop the column `predominantDisciplines` on the `QuestionBank` table. All the data in the column will be lost.
  - You are about to drop the `_QuestionBanks` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_QuestionBanks" DROP CONSTRAINT "_QuestionBanks_A_fkey";

-- DropForeignKey
ALTER TABLE "_QuestionBanks" DROP CONSTRAINT "_QuestionBanks_B_fkey";

-- AlterTable
ALTER TABLE "QuestionBank" DROP COLUMN "predominantDisciplines";

-- DropTable
DROP TABLE "_QuestionBanks";

-- CreateTable
CREATE TABLE "QuestionBankQuestion" (
    "questionBankId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,

    CONSTRAINT "QuestionBankQuestion_pkey" PRIMARY KEY ("questionBankId","questionId")
);

-- CreateTable
CREATE TABLE "PredominantDiscipline" (
    "id" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,

    CONSTRAINT "PredominantDiscipline_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuestionBankQuestion" ADD CONSTRAINT "QuestionBankQuestion_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankQuestion" ADD CONSTRAINT "QuestionBankQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredominantDiscipline" ADD CONSTRAINT "PredominantDiscipline_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PredominantDiscipline" ADD CONSTRAINT "PredominantDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
