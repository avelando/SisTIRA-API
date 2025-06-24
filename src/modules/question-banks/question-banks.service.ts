import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionBankDto } from './dto/create.dto';
import { UpdateQuestionBankDto } from './dto/update.dto';

import { NotificationType } from '@prisma/client';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  private async calculatePredominantDisciplines(questionBankId: string, questionIds: string[]) {
    const disciplinesCount: Record<string, number> = {};

    for (const questionId of questionIds) {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
        include: { questionDisciplines: { select: { disciplineId: true } } },
      });

      if (question) {
        for (const { disciplineId } of question.questionDisciplines) {
          disciplinesCount[disciplineId] = (disciplinesCount[disciplineId] || 0) + 1;
        }
      }
    }

    const sortedDisciplines = Object.entries(disciplinesCount)
      .sort((a, b) => b[1] - a[1])
      .map(([disciplineId]) => disciplineId);

    await this.prisma.questionBankDiscipline.deleteMany({
      where: { questionBankId },
    });

    await this.prisma.questionBankDiscipline.createMany({
      data: sortedDisciplines.map((disciplineId, index) => ({
        questionBankId,
        disciplineId,
        isPredominant: index < 2, 
      })),
    });
  }

  async create(userId: string, data: CreateQuestionBankDto) {
    const userQuestions = await this.prisma.question.findMany({
      where: { id: { in: data.questions || [] }, creatorId: userId },
      select: { id: true },
    });
    if (userQuestions.length !== (data.questions || []).length) {
      throw new ForbiddenException('Você só pode adicionar questões criadas por você mesmo.');
    }

    const questionBank = await this.prisma.questionBank.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
        questions: {
          create: data.questions?.map((id) => ({ questionId: id })) || [],
        },
      },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.QUESTION_BANK_CREATED,
        entityId: questionBank.id,
        message: `Novo banco de questões criado: ${questionBank.name}`,
      },
    });

    await this.calculatePredominantDisciplines(questionBank.id, data.questions || []);

    return questionBank;
  }

  async findAll(userId: string) {
    return this.prisma.questionBank.findMany({
      where: { creatorId: userId },
      include: {
        questions: {
          include: {
            question: {
              select: {
                text: true,
                questionDisciplines: { include: { discipline: { select: { name: true } } } },
              },
            },
          },
        },
        questionBankDisciplines: {
          include: { discipline: { select: { name: true, id: true } } },
        },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: {
        questions: {
          include: {
            question: {
              select: {
                text: true,
                questionDisciplines: { include: { discipline: { select: { name: true } } } },
              },
            },
          },
        },
        questionBankDisciplines: {
          include: { discipline: { select: { name: true, id: true } } },
        },
      },
    });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return questionBank;
  }

  async update(userId: string, id: string, data: UpdateQuestionBankDto) {
    const questionBank = await this.prisma.questionBank.findUnique({ where: { id } });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.questionBank.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
    });
  }

  async addQuestions(userId: string, id: string, questionIds: string[]) {
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: { questions: true },
    });
  
    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    const existingQuestionIds = new Set(questionBank.questions.map(q => q.questionId));
  
    const newQuestions = questionIds.filter(questionId => !existingQuestionIds.has(questionId));
  
    if (newQuestions.length === 0) {
      throw new BadRequestException('Todas as questões já estão neste banco.');
    }
  
    const validQuestions = await this.prisma.question.findMany({
      where: { id: { in: newQuestions }, creatorId: userId },
      select: { id: true },
    });
  
    if (validQuestions.length !== newQuestions.length) {
      throw new ForbiddenException('Você só pode adicionar questões criadas por você mesmo.');
    }
  
    await this.prisma.questionBankQuestion.createMany({
      data: newQuestions.map((questionId) => ({ questionBankId: id, questionId })),
    });
  
    await this.calculatePredominantDisciplines(id, [
      ...Array.from(existingQuestionIds) as string[],
      ...newQuestions
    ]);    
  
    return this.findOne(userId, id);
  }  

  async remove(userId: string, id: string) {
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    await this.prisma.questionBankQuestion.deleteMany({
      where: { questionBankId: id },
    });

    await this.prisma.questionBankDiscipline.deleteMany({
      where: { questionBankId: id },
    });

    return this.prisma.questionBank.delete({ where: { id } });
  }

  async removeQuestions(userId: string, id: string, questionIds: string[]) {
    const bank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!bank) throw new NotFoundException('Banco de questões não encontrado');
    if (bank.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    await this.prisma.questionBankQuestion.deleteMany({
      where: {
        questionBankId: id,
        questionId: { in: questionIds },
      },
    });
  
    const remainingIds = bank.questions
      .map(q => q.questionId)
      .filter(qId => !questionIds.includes(qId));
    await this.calculatePredominantDisciplines(id, remainingIds);
  
    return this.findOne(userId, id);
  }
}
