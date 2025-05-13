import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateExamDto } from './dto/create.dto';
import { UpdateExamDto } from './dto/update.dto';
import { CreateManualQuestionDto } from './dto/create-question.dto';

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateExamDto) {
    return this.prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: userId,
      },
      include: {
        questions: { select: { question: { select: { text: true } } } },
        examQuestionBanks: { select: { questionBank: { select: { id: true, name: true } } } },
      },
    });
  }  

  async findAll(userId: string) {
    return this.prisma.exam.findMany({
      where: { creatorId: userId },
      include: {
        questions: {
          select: {
            question: { select: { text: true } }
          }
        },
        examQuestionBanks: {
          select: {
            questionBank: { select: { id: true, name: true } }
          }
        }
      },
    });
  }

  async findOne(userId: string, id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        creatorId: true,
        questions: {
          select: {
            question: {
              select: {
                id: true,
                text: true,
                questionType: true,
                alternatives: {
                  select: { id: true, content: true, correct: true }
                }
              }
            }
          }
        },
        examQuestionBanks: {
          select: {
            questionBank: {
              select: {
                id: true,
                name: true,
                description: true,
                creatorId: true,
                createdAt: true,
                questions: {
                  select: {
                    question: {
                      select: {
                        id: true,
                        text: true,
                        questionType: true,
                        alternatives: {
                          select: {
                            id: true,
                            content: true,
                            correct: true,
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }        
      }
    });
  
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    const manualQuestions = exam.questions.map(q => q.question);
    const bankQuestions = exam.examQuestionBanks.flatMap(b => b.questionBank.questions.map(q => q.question));
  
    const allQuestionsMap = new Map();
    [...manualQuestions, ...bankQuestions].forEach(q => {
      allQuestionsMap.set(q.id, q);
    });
  
    return {
      ...exam,
      allQuestions: Array.from(allQuestionsMap.values()),
    };
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
        title: data.title,
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
        questions: {
          select: {
            question: { select: { text: true } }
          }
        },
        examQuestionBanks: {
          select: {
            questionBank: { select: { id: true, name: true } }
          }
        }
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

  async addQuestions(userId: string, examId: string, questionIds: string[]) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examQuestionBanks: {
          select: {
            questionBank: {
              select: {
                questions: { select: { questionId: true } }
              }
            }
          }
        }
      }
    });
  
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    const bankQuestionIds = exam.examQuestionBanks.flatMap(bank =>
      bank.questionBank.questions.map(q => q.questionId)
    );
  
    const filtered = questionIds.filter(id => !bankQuestionIds.includes(id));
  
    await this.prisma.examQuestion.createMany({
      data: filtered.map(questionId => ({ examId, questionId })),
      skipDuplicates: true,
    });
  
    return this.findOne(userId, examId);
  }   

  async removeQuestions(userId: string, examId: string, questionIds: string[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.examQuestion.deleteMany({
      where: {
        examId,
        questionId: { in: questionIds }
      }
    });
  }

  async addBanks(userId: string, examId: string, bankIds: string[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    await this.prisma.examQuestionBank.createMany({
      data: bankIds.map(bankId => ({ examId, questionBankId: bankId })),
      skipDuplicates: true,  // pula relações já existentes
    });

    return this.prisma.exam.findUnique({
      where: { id: examId },
      include: { examQuestionBanks: { select: { questionBank: { select: { id: true, name: true } } } } },
    });
  }

  async removeBanks(userId: string, examId: string, bankIds: string[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    return this.prisma.examQuestionBank.deleteMany({
      where: {
        examId,
        questionBankId: { in: bankIds }
      }
    });
  }

  async respondToExam(userId: string, examId: string, answers: { questionId: string; alternativeId?: string; textResponse?: string }[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
  
    if (!exam.isPublic && !exam.accessCode) {
      throw new ForbiddenException('Prova privada');
    }
  
    return this.prisma.examResponse.create({
      data: {
        userId,
        examId,
        answers: {
          create: answers.map(ans => ({
            questionId: ans.questionId,
            alternativeId: ans.alternativeId,
            textResponse: ans.textResponse
          }))
        }
      }
    });
  }

  async getExamResponses(userId: string, examId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
    });
  
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    return this.prisma.examResponse.findMany({
      where: { examId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        answers: {
          include: {
            question: {
              select: {
                id: true,
                text: true,
                questionType: true,
              },
            },
            alternative: {
              select: {
                id: true,
                content: true,
                correct: true,
              },
            },
          },
        },
      },
    });
  }

  async createQuestionAndAddToExam(userId: string, examId: string, data: CreateManualQuestionDto) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
  
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');
  
    const disciplinesToConnect = data.disciplines?.length
      ? await Promise.all(
          data.disciplines.map(async (name) => {
            let discipline = await this.prisma.discipline.findFirst({
              where: { name, creatorId: userId },
            });
            if (!discipline) {
              discipline = await this.prisma.discipline.create({
                data: { name, creatorId: userId },
              });
            }
            return { disciplineId: discipline.id };
          })
        )
      : [];
  
    const question = await this.prisma.question.create({
      data: {
        text: data.text,
        questionType: data.questionType,
        creatorId: userId,
        questionDisciplines: disciplinesToConnect.length
          ? {
              create: disciplinesToConnect.map((d) => ({
                discipline: { connect: { id: d.disciplineId } },
              })),
            }
          : undefined,
        alternatives: data.questionType === 'OBJ'
          ? {
              create: data.alternatives?.map((alt) => ({
                content: alt.content,
                correct: alt.correct,
              })) ?? [],
            }
          : undefined,
      },
      select: { id: true },
    });
  
    await this.prisma.examQuestion.create({
      data: {
        examId,
        questionId: question.id,
      },
    });
  
    return this.findOne(userId, examId);
  }  
}
