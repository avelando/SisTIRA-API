import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create.dto';
import { UpdateQuestionDto } from './dto/update.dto';
import { validate as isUUID } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  private async processDisciplines(userId: string, disciplines: string[]): Promise<{ disciplineId: string }[]> {
    const processedDisciplines: { disciplineId: string }[] = [];

    for (const discipline of disciplines) {
      if (isUUID(discipline)) {
        processedDisciplines.push({ disciplineId: discipline });
      } else {
        let existingDiscipline = await this.prisma.discipline.findFirst({
          where: { name: discipline, creatorId: userId },
        });

        if (!existingDiscipline) {
          existingDiscipline = await this.prisma.discipline.create({
            data: { name: discipline, creatorId: userId },
          });
        }

        processedDisciplines.push({ disciplineId: existingDiscipline.id });
      }
    }

    return processedDisciplines;
  }

  async create(userId: string, data: CreateQuestionDto) {
    const disciplinesToConnect = data.disciplines?.length
      ? await this.processDisciplines(userId, data.disciplines)
      : [];

    return this.prisma.question.create({
      data: {
        text: data.text,
        questionType: data.questionType,
        creatorId: userId,
        educationLevel: data.educationLevel ?? null,
        difficulty: data.difficulty ?? null,
        examReference: data.examReference ?? null,
        questionDisciplines: disciplinesToConnect.length
          ? {
              create: disciplinesToConnect.map(d => ({
                discipline: { connect: { id: d.disciplineId } },
              })),
            }
          : undefined,
        alternatives: data.questionType === 'SUB' ? undefined : { create: data.alternatives ?? [] },
      },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        questionDisciplines: { select: { discipline: { select: { id: true, name: true } } } },
        alternatives: { select: { content: true, correct: true } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.question.findMany({
      where: { creatorId: userId },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        questionDisciplines: { select: { discipline: { select: { id: true, name: true } } } },
        alternatives: { select: { content: true, correct: true } },
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        questionDisciplines: { select: { discipline: { select: { id: true, name: true } } } },
        alternatives: { select: { content: true, correct: true } },
      },
    });

    if (!question) throw new NotFoundException('Questão não encontrada');

    return question;
  }

  async update(userId: string, id: string, data: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { questionDisciplines: { include: { discipline: true } }, alternatives: true },
    });
  
    if (!question) throw new NotFoundException('Questão não encontrada');
    if (question.creatorId !== userId) throw new ForbiddenException('Você só pode editar suas próprias questões');
  
    const disciplinesToConnect = await this.processDisciplines(userId, data.disciplines ?? []);
    const existingIds = question.questionDisciplines.map(d => d.discipline.id);
    const newIds = disciplinesToConnect.map(d => d.disciplineId);
  
    const createConnections = disciplinesToConnect
      .filter(d => !existingIds.includes(d.disciplineId))
      .map(d => ({ discipline: { connect: { id: d.disciplineId } } }));
  
    const deleteConnections = existingIds
      .filter(id => !newIds.includes(id))
      .map(id => ({ disciplineId: id }));
  
    let alternativesOps: Prisma.QuestionUpdateInput['alternatives'] | undefined;
  
    if (data.questionType === 'OBJ') {
      alternativesOps = { deleteMany: {}, create: data.alternatives ?? [] };
    } else if (question.questionType === 'OBJ') {
      alternativesOps = { deleteMany: {} };
    }
  
    const updatedQuestion = await this.prisma.question.update({
      where: { id },
      data: {
        text: data.text,
        questionType: data.questionType,
        educationLevel: data.educationLevel ?? null,
        difficulty: data.difficulty ?? null,
        examReference: data.examReference ?? null,
        questionDisciplines: {
          deleteMany: deleteConnections.length ? deleteConnections : undefined,
          create: createConnections.length ? createConnections : undefined,
        },
        alternatives: alternativesOps,
      },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        questionDisciplines: {
          select: {
            discipline: {
              select: { id: true, name: true },
            },
          },
        },
        alternatives: {
          select: { id: true, content: true, correct: true },
        },
      },
    });
  
    await this.removeUnusedDisciplines();
    return updatedQuestion;
  }  

  async remove(userId: string, id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) throw new NotFoundException('Questão não encontrada');
    if (question.creatorId !== userId) throw new ForbiddenException('Você só pode excluir suas próprias questões');

    await this.prisma.question.delete({ where: { id } });

    await this.removeUnusedDisciplines();

    return { message: 'Questão removida com sucesso' };
  }

  private async removeUnusedDisciplines() {
    await this.prisma.discipline.deleteMany({
      where: {
        questionDisciplines: { none: {} }
      }
    });
  }
}
