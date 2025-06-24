import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create.dto';
import { UpdateQuestionDto } from './dto/update.dto';
import { validate as isUUID } from 'uuid';
import { Prisma } from '@prisma/client';

import { NotificationType } from '@prisma/client';

@Injectable()
export class QuestionsService {
  constructor(private prisma: PrismaService) {}

  private async processDisciplines(
    userId: string,
    disciplines: string[],
  ): Promise<{ disciplineId: string }[]> {
    const processed: { disciplineId: string }[] = [];
    for (const d of disciplines) {
      if (isUUID(d)) {
        processed.push({ disciplineId: d });
      } else {
        let exist = await this.prisma.discipline.findFirst({
          where: { name: d, creatorId: userId },
        });
        if (!exist) {
          exist = await this.prisma.discipline.create({
            data: { name: d, creatorId: userId },
          });
        }
        processed.push({ disciplineId: exist.id });
      }
    }
    return processed;
  }

  async create(userId: string, data: CreateQuestionDto) {
    const discs = data.disciplines?.length
      ? await this.processDisciplines(userId, data.disciplines)
      : [];

    const question = await this.prisma.question.create({
      data: {
        text: data.text,
        questionType: data.questionType,
        creatorId: userId,
        educationLevel: data.educationLevel ?? null,
        difficulty: data.difficulty ?? null,
        examReference: data.examReference ?? null,
        useModelAnswers: data.useModelAnswers ?? false,

        questionDisciplines: discs.length
          ? {
              create: discs.map(d => ({
                discipline: { connect: { id: d.disciplineId } },
              })),
            }
          : undefined,

        alternatives:
          data.questionType === 'OBJ'
            ? { create: data.alternatives ?? [] }
            : undefined,

        modelAnswers:
          data.questionType === 'SUB' && data.useModelAnswers
            ? { create: data.modelAnswers! }
            : undefined,
      },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        useModelAnswers: true,
        questionDisciplines: {
          select: { discipline: { select: { id: true, name: true } } },
        },
        alternatives: { select: { id: true, content: true, correct: true } },
        modelAnswers: { select: { id: true, type: true, content: true } },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.QUESTION_CREATED,
        entityId: question.id,
        message: `Nova questão criada: "${question.text.slice(0, 50)}…"`,
      },
    });

    return question;
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
        useModelAnswers: true,
        questionDisciplines: {
          select: { discipline: { select: { id: true, name: true } } },
        },
        alternatives: { select: { content: true, correct: true } },
        modelAnswers: { select: { id: true, type: true, content: true } },
      },
    });
  }

  async findOne(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        questionDisciplines: {
          select: { discipline: { select: { id: true, name: true } } },
        },
        alternatives: true,
        modelAnswers: true,
      },
    });
    if (!question) throw new NotFoundException('Questão não encontrada');
    return question;
  }

  async update(userId: string, id: string, data: UpdateQuestionDto) {
    const existing = await this.prisma.question.findUnique({
      where: { id },
      include: {
        creator: true,
        questionDisciplines: { include: { discipline: true } },
        alternatives: true,
        modelAnswers: true,
      },
    });
    if (!existing) throw new NotFoundException('Questão não encontrada');
    if (existing.creatorId !== userId)
      throw new ForbiddenException('Você só pode editar suas próprias questões');

    const discs = data.disciplines?.length
      ? await this.processDisciplines(userId, data.disciplines)
      : [];
    const existingIds = existing.questionDisciplines.map(d => d.discipline.id);
    const newIds = discs.map(d => d.disciplineId);

    const createCon = discs
      .filter(d => !existingIds.includes(d.disciplineId))
      .map(d => ({ discipline: { connect: { id: d.disciplineId } } }));
    const deleteCon = existingIds
      .filter(dId => !newIds.includes(dId))
      .map(disciplineId => ({ disciplineId }));

    let altOps: Prisma.QuestionUpdateInput['alternatives'] | undefined;
    if (data.questionType === 'OBJ') {
      altOps = { deleteMany: {}, create: data.alternatives ?? [] };
    } else if (existing.questionType === 'OBJ') {
      altOps = { deleteMany: {} };
    }

    let maOps: Prisma.QuestionUpdateInput['modelAnswers'] | undefined;
    if (data.questionType === 'SUB' && data.useModelAnswers) {
      maOps = { deleteMany: {}, create: data.modelAnswers ?? [] };
    } else if (data.useModelAnswers === false) {
      maOps = { deleteMany: {} };
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        text: data.text,
        questionType: data.questionType,
        educationLevel: data.educationLevel ?? null,
        difficulty: data.difficulty ?? null,
        examReference: data.examReference ?? null,
        useModelAnswers: data.useModelAnswers,

        questionDisciplines: {
          deleteMany: deleteCon.length ? deleteCon : undefined,
          create: createCon.length ? createCon : undefined,
        },

        alternatives: altOps,
        modelAnswers: maOps,
      },
      select: {
        id: true,
        text: true,
        questionType: true,
        educationLevel: true,
        difficulty: true,
        examReference: true,
        useModelAnswers: true,
        questionDisciplines: {
          select: { discipline: { select: { id: true, name: true } } },
        },
        alternatives: { select: { id: true, content: true, correct: true } },
        modelAnswers: { select: { id: true, type: true, content: true } },
      },
    });
  }

  async remove(userId: string, id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });
    if (!question) throw new NotFoundException('Questão não encontrada');
    if (question.creatorId !== userId)
      throw new ForbiddenException('Você só pode excluir suas próprias questões');

    await this.prisma.question.delete({ where: { id } });
    await this.removeUnusedDisciplines();
    return { message: 'Questão removida com sucesso' };
  }

  private async removeUnusedDisciplines() {
    await this.prisma.discipline.deleteMany({
      where: {
        questionDisciplines: { none: {} },
      },
    });
  }
}
