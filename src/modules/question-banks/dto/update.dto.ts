import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuestionBankDto {
  @ApiProperty({ example: 'Banco de Matemática', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Banco atualizado de questões matemáticas', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['question-id-1', 'question-id-2'], required: false })
  @IsOptional()
  @IsArray()
  questions?: string[];
}
