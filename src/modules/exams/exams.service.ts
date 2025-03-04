import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateExamDto } from './dto/create.dto';
import { UpdateExamDto } from './dto/update.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateExamDto) {
    let questionsToConnect = data.questions ?? [];

    const questionBank = data.questionBankId
      ? await this.prisma.questionBank.findUnique({
          where: { id: data.questionBankId },
          include: { questions: { select: { questionId: true } } },
        })
      : null;

    if (data.questionBankId && !questionBank) {
      throw new NotFoundException('Banco de questões não encontrado.');
    }

    questionsToConnect = [
      ...new Set([
        ...questionsToConnect,
        ...(questionBank?.questions?.map(q => q.questionId) || []),
      ]),
    ];

    return this.prisma.exam.create({
      data: {
        name: data.name,
        description: data.description,
        creatorId: userId,
        questionBankId: data.questionBankId || null,
        questions: {
          create: questionsToConnect.map(questionId => ({
            question: { connect: { id: questionId } }
          })),
        },
      },
      include: {
        questionBank: { select: { id: true, name: true } },
        questions: { select: { question: { select: { text: true } } } },
      },
    });    
  }

  async findAll(userId: string) {
    return this.prisma.exam.findMany({
      where: { creatorId: userId },
      include: {
        questionBank: { select: { id: true, name: true } },
        questions: { select: { question: { select: { text: true } } } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        questionBank: { select: { id: true, name: true } },
        questions: { select: { question: { select: { text: true } } } },
      },
    });

    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return exam;
  }

  async update(userId: string, id: string, data: UpdateExamDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: { questions: true },
    });

    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    const updatedExam = await this.prisma.exam.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        questions: {
          deleteMany: {},
          create: data.questions?.map(questionId => ({
            examId: id,
            questionId,
          })) || [],
        },
      },
      include: {
        questionBank: { select: { id: true, name: true } },
        questions: { select: { question: { select: { text: true } } } },
      },
    });

    return updatedExam;
  }

  async remove(userId: string, id: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id } });

    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.exam.delete({ where: { id } });
  }
}
