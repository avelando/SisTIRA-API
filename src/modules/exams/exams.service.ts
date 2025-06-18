import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateExamDto } from './dto/create.dto';
import { UpdateExamDto } from './dto/update.dto';
import { CreateManualQuestionDto } from './dto/create-question.dto';
import { RespondExamDto } from './dto/create-response.dto';

import { customAlphabet } from 'nanoid';
import { ExamForResponse } from 'src/interfaces/examProps';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

@Injectable()
export class ExamsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateExamDto) {
    let accessCode: string | undefined;
    if (!data.isPublic && data.generateAccessCode) {
      accessCode = nanoid(); 
    }

    return this.prisma.exam.create({
      data: {
        title: data.title,
        description: data.description,
        creatorId: userId,
        isPublic: data.isPublic ?? false,
        accessCode,
      },
      include: {
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
                  },
                },
              },
            },
          },
        },
        examQuestionBanks: {
          select: {
            questionBank: {
              select: { id: true, name: true },
            },
          },
        },
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
        accessCode: true,
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
    const exam = await this.prisma.exam.findUnique({ where: { id } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    const updateData: any = {
      ...(data.title !== undefined     && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
    };

    if (data.questions) {
      updateData.questions = {
        deleteMany: {},
        create: data.questions.map(qId => ({
          examId: id,
          questionId: qId,
        })),
      };
    }

    return this.prisma.exam.update({
      where: { id },
      data: updateData,
      include: {
        questions: {
          select: {
            question: {
              select: {
                id: true,
                text: true,
                questionType: true,
                alternatives: {
                  select: { id: true, content: true, correct: true },
                },
              },
            },
          },
        },
        examQuestionBanks: {
          select: {
            questionBank: { select: { id: true, name: true } },
          },
        },
      },
    });
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

    await this.prisma.examQuestion.deleteMany({
      where: {
        examId,
        questionId: { in: questionIds }
      }
    });

    return this.findOne(userId, examId);
  }

  async addBanks(userId: string, examId: string, bankIds: string[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    await this.prisma.examQuestionBank.createMany({
      data: bankIds.map(bankId => ({ examId, questionBankId: bankId })),
      skipDuplicates: true,
    });

    return this.findOne(userId, examId);
  }

  async removeBanks(userId: string, examId: string, bankIds: string[]) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.creatorId !== userId) throw new ForbiddenException('Acesso negado');

    await this.prisma.examQuestionBank.deleteMany({
      where: {
        examId,
        questionBankId: { in: bankIds },
      },
    });

    return this.findOne(userId, examId);
  }

  async respondToExam(
    userId: string,
    dto: RespondExamDto,
  ) {
    const { examId, accessCode, answers } = dto;

    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');

    if (!exam.isPublic && exam.accessCode !== accessCode) {
      throw new ForbiddenException('Código inválido ou prova privada');
    }

    return this.prisma.examResponse.create({
      data: {
        userId,
        examId,
        answers: {
          create: answers.map(ans => ({
            questionId: ans.questionId,
            alternativeId: ans.alternativeId,
            subjectiveText: ans.textResponse,
          })),
        },
      },
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

  async getCounts(userId: string) {
    const examsCount = await this.prisma.exam.count({
      where: { creatorId: userId }
    });

    const banksCount = await this.prisma.questionBank.count({
      where: { creatorId: userId }
    });

    const questionsCount = await this.prisma.question.count({
      where: { creatorId: userId }
    });

    return { examsCount, banksCount, questionsCount };
  }

  async getExamForResponse(identifier: string): Promise<ExamForResponse> {
    const resp = await this.prisma.exam.findFirst({
      where: {
        OR: [
          { id: identifier, isPublic: true },
          { accessCode: identifier },
        ],
      },
      include: {
        questions: {
          select: {
            question: {
              select: {
                id: true,
                text: true,
                questionType: true,
                alternatives: { select: { id: true, content: true } },
                modelAnswers: { select: { type: true, content: true } },
              },
            },
          },
        },
        examQuestionBanks: {
          select: {
            questionBank: {
              select: {
                questions: {
                  select: {
                    question: {
                      select: {
                        id: true,
                        text: true,
                        questionType: true,
                        alternatives: { select: { id: true, content: true } },
                        modelAnswers: { select: { type: true, content: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!resp) throw new NotFoundException('Prova não encontrada ou código inválido');

    const manualQs = resp.questions.map(r => r.question);
    const bankQs = resp.examQuestionBanks
      .flatMap(b => b.questionBank.questions.map(r => r.question));

    const allMap = new Map<string, typeof manualQs[0]>();
    [...manualQs, ...bankQs].forEach(q => allMap.set(q.id, q));
    const allQuestions = Array.from(allMap.values());

    return {
      examId:      resp.id,
      title:       resp.title,
      description: resp.description ?? undefined,
      accessCode:  resp.accessCode ?? undefined,
      questions:   allQuestions.map(q => ({
        id:           q.id,
        text:         q.text,
        questionType: q.questionType,
        alternatives: q.alternatives,
        modelAnswers: q.modelAnswers,
      })),
    };
  }

  async grantAccess(userId: string, examId: string, code: string) {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId }});
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.accessCode !== code) throw new ForbiddenException('Código inválido');

    await this.prisma.examAccess.upsert({
      where: { userId_examId: { userId, examId } },
      create: { userId, examId },
      update: {},
    });

    return this.getExamForResponseAuth(userId, examId);
  }

  async hasAccess(userId: string, examId: string): Promise<boolean> {
    const exam = await this.prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) throw new NotFoundException('Prova não encontrada');
    if (exam.isPublic) return true;

    const access = await this.prisma.examAccess.findUnique({
      where: { userId_examId: { userId, examId } }
    });
    return !!access;
  }

  async getExamForResponseAuth(userId: string, examId: string): Promise<ExamForResponse> {
    const can = await this.hasAccess(userId, examId);
    if (!can) throw new ForbiddenException('Acesso negado — digite o código');
    return this.getExamForResponse(examId);
  }
}
