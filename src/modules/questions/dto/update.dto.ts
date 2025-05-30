// src/modules/questions/dto/update.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsBoolean,
  ValidateIf,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ModelAnswerDto } from 'src/modules/exams/dto/model-answer.dto';
import {
  QuestionType,
  EducationLevel,
  DifficultyLevel,
} from './create.dto';

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

export class UpdateQuestionDto {
  @ApiProperty({ example: 'Novo enunciado', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  text?: string;

  @ApiProperty({
    example: QuestionType.SUB,
    enum: QuestionType,
    required: false,
  })
  @IsOptional()
  @IsEnum(QuestionType)
  questionType?: QuestionType;

  @ApiProperty({
    example: ['História'],
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
    description: 'Só para OBJ',
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

  @ApiProperty({ example: 'ENEM 2023', required: false })
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
    description: 'Só para SUB e se useModelAnswers=true',
  })
  @ValidateIf(o => o.questionType === QuestionType.SUB && o.useModelAnswers === true)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModelAnswerDto)
  modelAnswers?: ModelAnswerDto[];
}
