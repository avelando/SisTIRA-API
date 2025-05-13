import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateQuestionDto } from './dto/create.dto';
import { UpdateQuestionDto } from './dto/update.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Questões')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService, private prisma: PrismaService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todas as questões do usuário autenticado' })
  findAll(@Req() req: Request) {
    if (!req.user) throw new Error('Usuário não autenticado');
    return this.questionsService.findAll(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma nova questão' })
  create(@Req() req: Request, @Body() createQuestionDto: CreateQuestionDto) {
    if (!req.user) throw new Error('Usuário não autenticado');
    return this.questionsService.create(req.user.userId, createQuestionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma questão (somente o criador pode alterar)' })
  update(@Req() req: Request, @Param('id') id: string, @Body() updateQuestionDto: UpdateQuestionDto) {
    if (!req.user) throw new Error('Usuário não autenticado');
    return this.questionsService.update(req.user.userId, id, updateQuestionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma questão (somente o criador pode deletar)' })
  remove(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) throw new Error('Usuário não autenticado');
    return this.questionsService.remove(req.user.userId, id);
  }
}
