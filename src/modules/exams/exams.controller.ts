import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateExamDto } from './dto/create.dto';
import { UpdateExamDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Provas')
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Criar uma nova prova' })
  create(@Req() req: Request, @Body() createExamDto: CreateExamDto) {
    if (!req.user) throw new ForbiddenException('Usuário não autenticado');
    return this.examsService.create((req.user as any).userId, createExamDto);
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
  update(@Req() req: Request, @Param('id') id: string, @Body() updateExamDto: UpdateExamDto) {
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
}
