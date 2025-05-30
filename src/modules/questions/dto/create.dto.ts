// src/modules/questions/dto/create.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModelAnswerDto } from 'src/modules/exams/dto/model-answer.dto';

export enum QuestionType {
  OBJ = 'OBJ',
  SUB = 'SUB',
}

export enum EducationLevel {
  FUNDAMENTAL_1  = '1º ano EF',
  FUNDAMENTAL_2  = '2º ano EF',
  FUNDAMENTAL_3  = '3º ano EF',
  FUNDAMENTAL_4  = '4º ano EF',
  FUNDAMENTAL_5  = '5º ano EF',
  FUNDAMENTAL_6  = '6º ano EF',
  FUNDAMENTAL_7  = '7º ano EF',
  FUNDAMENTAL_8  = '8º ano EF',
  FUNDAMENTAL_9  = '9º ano EF',
  MEDIO_1        = '1º ano EM',
  MEDIO_2        = '2º ano EM',
  MEDIO_3        = '3º ano EM',
  GRADUACAO      = 'Graduação',
  ESPECIALIZACAO = 'Especialização',
  MESTRADO       = 'Mestrado',
  DOUTORADO      = 'Doutorado',
}

export enum DifficultyLevel {
  VERY_EASY = 'Muito fácil',
  EASY      = 'Fácil',
  MEDIUM    = 'Médio',
  HARD      = 'Difícil',
  VERY_HARD = 'Muito difícil',
}

class AlternativeDto {
  @ApiProperty({ example: 'Resposta A' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  @Type(() => Boolean)
  correct: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'Qual é a capital da França?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: QuestionType.OBJ, enum: QuestionType })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({
    example: ['Geografia'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  disciplines?: string[];

  @ApiProperty({
    example: [{ content: 'Paris', correct: true }],
    type: [AlternativeDto],
    required: false,
    description: 'Só para questionType=OBJ',
  })
  @ValidateIf(o => o.questionType === QuestionType.OBJ)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  alternatives?: AlternativeDto[];

  @ApiProperty({ enum: EducationLevel, required: false })
  @IsOptional()
  @IsEnum(EducationLevel)
  educationLevel?: EducationLevel;

  @ApiProperty({ enum: DifficultyLevel, required: false })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiProperty({ example: 'ENEM 2022', required: false })
  @IsOptional()
  @IsString()
  examReference?: string;

  @ApiProperty({
    example: true,
    required: false,
    description: 'Se true, IA usará as respostas-modelo na correção',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  useModelAnswers?: boolean;

  @ApiProperty({
    type: [ModelAnswerDto],
    required: false,
    description:
      'Só para SUB e se useModelAnswers=true: WRONG, MEDIAN e CORRECT',
  })
  @ValidateIf(
    o => o.questionType === QuestionType.SUB && o.useModelAnswers === true,
  )
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelAnswerDto)
  modelAnswers?: ModelAnswerDto[];
}
