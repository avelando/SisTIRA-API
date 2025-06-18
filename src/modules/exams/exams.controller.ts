import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  ForbiddenException,
  Patch,
  NotFoundException,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create.dto';
import { UpdateExamDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';
import { CreateManualQuestionDto } from './dto/create-question.dto';
import { RespondExamDto } from './dto/create-response.dto';
import { CorrectionService } from './correction.service';
import { ExamForResponse } from 'src/interfaces/examProps';

@ApiTags('Provas')
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly correctionService: CorrectionService,
  ) {}

  @Get('health/gemini')
  async healthGemini() {
    return this.correctionService.testConnection();
  }

  @UseGuards(JwtAuthGuard)
  @Get('counts')
  @ApiOperation({ summary: 'Total de provas, bancos e questões do usuário' })
  async getCounts(@Req() req: Request) {
    const userId = (req.user as any).userId;
    return this.examsService.getCounts(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary:
      'Criar uma nova prova — marque isPublic para link público, ou marque generateAccessCode para gerar um código de acesso',
  })
  create(@Req() req: Request, @Body() createExamDto: CreateExamDto) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    const userId = (req.user as any).userId;
    return this.examsService.create(userId, createExamDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar todas as provas do usuário' })
  findAll(@Req() req: Request) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.findAll((req.user as any).userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma prova específica' })
  findOne(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.findOne((req.user as any).userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Atualizar uma prova' })
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateExamDto: UpdateExamDto,
  ) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.update((req.user as any).userId, id, updateExamDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Deletar uma prova' })
  remove(@Req() req: Request, @Param('id') id: string) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.remove((req.user as any).userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/add-questions')
  @ApiOperation({ summary: 'Adicionar questões à prova' })
  addQuestions(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { questions: string[] },
  ) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.addQuestions((req.user as any).userId, id, body.questions);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/remove-questions')
  @ApiOperation({ summary: 'Remover questões da prova' })
  removeQuestions(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { questions: string[] },
  ) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.removeQuestions((req.user as any).userId, id, body.questions);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/add-banks')
  @ApiOperation({ summary: 'Adicionar bancos à prova' })
  addBanks(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { bankIds: string[] },
  ) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.addBanks((req.user as any).userId, id, body.bankIds);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/remove-banks')
  @ApiOperation({ summary: 'Remover bancos da prova' })
  removeBanks(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { bankIds: string[] },
  ) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.removeBanks((req.user as any).userId, id, body.bankIds);
  }

  @Get('respond/:identifier')
  @ApiOperation({ summary: 'Obter prova para responder (público por código)' })
  getForResponse(@Param('identifier') identifier: string) {
    return this.examsService.getExamForResponse(identifier);
  }

  @Post('respond')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Submeter respostas da prova (requer login)' })
  respond(
    @Req() req: Request,
    @Body() dto: RespondExamDto,
  ) {
    const userId = (req.user as any).userId;
    return this.examsService.respondToExam(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/responses')
  @ApiOperation({ summary: 'Listar respostas enviadas' })
  getResponses(@Req() req: Request, @Param('id') examId: string) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.getExamResponses((req.user as any).userId, examId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/manual-question')
  @ApiOperation({ summary: 'Criar questão manual dentro da prova' })
  createManualQuestion(
    @Req() req: Request,
    @Param('id') examId: string,
    @Body() createManualQuestionDto: CreateManualQuestionDto,
  ) {
    return this.examsService.createQuestionAndAddToExam(
      (req.user as any).userId,
      examId,
      createManualQuestionDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/grant-access')
  @ApiOperation({ summary: 'Validar código e conceder acesso à prova' })
  async grantAccess(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: { accessCode: string },
  ) {
    const userId = (req.user as any).userId;
    return this.examsService.grantAccess(userId, id, body.accessCode);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':examId/respond-auth')
  @ApiOperation({ summary: 'Obter prova para responder (autorizar acesso)' })
  async getExamForResponseAuth(
    @Req() req: Request,
    @Param('examId') examId: string,
  ): Promise<ExamForResponse> {
    const userId = (req.user as any).userId;
    return this.examsService.getExamForResponseAuth(userId, examId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/check-access')
  @ApiOperation({ summary: 'Verificar se o usuário tem acesso à prova' })
  async checkAccess(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const userId = (req.user as any).userId;
    const has = await this.examsService.hasAccess(userId, id);
    return { hasAccess: has };
  }
}
