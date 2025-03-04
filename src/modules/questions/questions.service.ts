import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create.dto';
import { UpdateQuestionDto } from './dto/update.dto';
import { validate as isUUID } from 'uuid';

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
    const disciplinesToConnect = await this.processDisciplines(userId, data.disciplines ?? []);

    return this.prisma.question.create({
      data: {
        text: data.text,
        questionType: data.questionType,
        creatorId: userId,
        questionDisciplines: {
          create: disciplinesToConnect.map(d => ({
            discipline: { connect: { id: d.disciplineId } }
          }))
        },
        alternatives: data.questionType === 'SUB' ? undefined : { create: data.alternatives ?? [] },
      },
      select: {
        id: true,
        text: true,
        questionType: true,
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
        include: { questionDisciplines: true, alternatives: true },
    });

    if (!question) throw new NotFoundException('Questão não encontrada');
    if (question.creatorId !== userId) throw new ForbiddenException('Você só pode editar suas próprias questões');

    let disciplinesToConnect: { disciplineId: string }[] = [];
    let disciplinesToDelete: { disciplineId: string }[] = [];

    if (data.disciplines !== undefined) {  
        if (data.disciplines.length === 0) {  
            disciplinesToDelete = question.questionDisciplines.map(d => ({ disciplineId: d.disciplineId }));
        } else {
            disciplinesToConnect = await this.processDisciplines(userId, data.disciplines);

            const existingDisciplineIds = question.questionDisciplines.map(d => d.disciplineId);
            const newDisciplineIds = disciplinesToConnect.map(d => d.disciplineId);

            disciplinesToDelete = existingDisciplineIds
                .filter(id => !newDisciplineIds.includes(id))
                .map(id => ({ disciplineId: id }));
        }
    }

    return this.prisma.question.update({
        where: { id },
        data: {
            text: data.text,
            questionType: data.questionType,
            questionDisciplines: {
                deleteMany: disciplinesToDelete.length ? disciplinesToDelete : undefined,
                create: disciplinesToConnect.length ? disciplinesToConnect.map(d => ({
                    discipline: { connect: { id: d.disciplineId } }
                })) : undefined,
            },
            alternatives: data.alternatives
                ? { deleteMany: {}, create: data.alternatives }
                : undefined,
        },
        select: {
            id: true,
            text: true,
            questionType: true,
            questionDisciplines: { select: { discipline: { select: { id: true, name: true } } } },
            alternatives: { select: { id: true, content: true, correct: true } },
        },
    });
  }

  async remove(userId: string, id: string) {
    const question = await this.prisma.question.findUnique({ where: { id } });

    if (!question) throw new NotFoundException('Questão não encontrada');
    if (question.creatorId !== userId) throw new ForbiddenException('Você só pode excluir suas próprias questões');

    return this.prisma.question.delete({ where: { id } });
  }
}
