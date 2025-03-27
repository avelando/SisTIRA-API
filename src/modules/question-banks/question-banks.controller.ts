import { 
  Controller, Get, Post, Body, Param, Delete, Put, Patch, UseGuards, Req, ForbiddenException 
} from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar um banco de questões específico' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.findOne(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar nome e descrição do banco de questões' })
  update(@Req() req: Request, @Param('id') id: string, @Body() updateQuestionBankDto: UpdateQuestionBankDto) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.update(req.user.userId, id, updateQuestionBankDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/add-questions')
  @ApiOperation({ summary: 'Adicionar questões ao banco de questões' })
  addQuestions(@Req() req: Request, @Param('id') id: string, @Body() body: { questions: string[] }) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.addQuestions(req.user.userId, id, body.questions);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Deletar um banco de questões' })
  remove(@Req() req: Request, @Param('id') id: string) {
    if (!req.user || !req.user.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.remove(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/remove-questions')
  @ApiOperation({ summary: 'Remover questões do banco de questões' })
  removeQuestions(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { questions: string[] },
  ) {
    if (!req.user?.userId) throw new ForbiddenException('Usuário não autenticado');
    return this.questionBanksService.removeQuestions(req.user.userId, id, body.questions);
  }
}
