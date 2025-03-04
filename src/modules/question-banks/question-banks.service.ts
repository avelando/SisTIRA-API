import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionBankDto } from './dto/create.dto';
import { UpdateQuestionBankDto } from './dto/update.dto';

@Injectable()
export class QuestionBanksService {
  constructor(private prisma: PrismaService) {}

  private async calculatePredominantDisciplines(questionIds: string[]): Promise<string[]> {
    const disciplinesCount: Record<string, number> = {};

    for (const questionId of questionIds) {
      const question = await this.prisma.question.findUnique({
        where: { id: questionId },
        include: { questionDisciplines: { include: { discipline: { select: { name: true } } } } },
      });

      if (question) {
        for (const { discipline } of question.questionDisciplines) {
          disciplinesCount[discipline.name] = (disciplinesCount[discipline.name] || 0) + 1;
        }
      }
    }

    return Object.entries(disciplinesCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([name]) => name);
  }

  async create(userId: string, data: CreateQuestionBankDto) {
    const predominantDisciplines = await this.calculatePredominantDisciplines(data.questions || []);

    return this.prisma.questionBank.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
        questions: { connect: data.questions?.map((id) => ({ id })) || [] },
        predominantDisciplines,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.questionBank.findMany({
      where: { creatorId: userId },
      include: {
        questions: { select: { text: true, questionDisciplines: { include: { discipline: { select: { name: true } } } } } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const questionBank = await this.prisma.questionBank.findUnique({
      where: { id },
      include: { questions: { select: { text: true, questionDisciplines: { include: { discipline: { select: { name: true } } } } } } },
    });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return questionBank;
  }

  async update(userId: string, id: string, data: UpdateQuestionBankDto) {
    const questionBank = await this.prisma.questionBank.findUnique({ where: { id } });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    const predominantDisciplines = await this.calculatePredominantDisciplines(data.questions || []);

    return this.prisma.questionBank.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        questions: { set: data.questions?.map((id) => ({ id })) || [] },
        predominantDisciplines,
      },
    });
  }

  async remove(userId: string, id: string) {
    const questionBank = await this.prisma.questionBank.findUnique({ where: { id } });

    if (!questionBank) throw new NotFoundException('Banco de questões não encontrado');
    if (questionBank.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.questionBank.delete({ where: { id } });
  }
}
