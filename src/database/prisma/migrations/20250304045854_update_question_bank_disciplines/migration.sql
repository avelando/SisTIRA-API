/*
  Warnings:

  - You are about to drop the `PredominantDiscipline` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PredominantDiscipline" DROP CONSTRAINT "PredominantDiscipline_disciplineId_fkey";

-- DropForeignKey
ALTER TABLE "PredominantDiscipline" DROP CONSTRAINT "PredominantDiscipline_questionBankId_fkey";

-- DropTable
DROP TABLE "PredominantDiscipline";

-- CreateTable
CREATE TABLE "QuestionBankDiscipline" (
    "id" TEXT NOT NULL,
    "questionBankId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "isPredominant" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "QuestionBankDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuestionBankDiscipline_questionBankId_disciplineId_key" ON "QuestionBankDiscipline"("questionBankId", "disciplineId");

-- AddForeignKey
ALTER TABLE "QuestionBankDiscipline" ADD CONSTRAINT "QuestionBankDiscipline_questionBankId_fkey" FOREIGN KEY ("questionBankId") REFERENCES "QuestionBank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionBankDiscipline" ADD CONSTRAINT "QuestionBankDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE CASCADE ON UPDATE CASCADE;
