import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service';
import { CreateQuestionBankDto } from './dto/create.dto';
import { UpdateQuestionBankDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Bancos de Questões')
@Controller('question-banks')
export class QuestionBanksController {
  constructor(private readonly questionBanksService: QuestionBanksService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar um novo banco de questões' })
  create(@Req() req: Request, @Body() createQuestionBankDto: CreateQuestionBankDto) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.create(req.user.userId, createQuestionBankDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todos os bancos de questões do usuário' })
  findAll(@Req() req: Request) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.findAll(req.user.userId);
  }
}
