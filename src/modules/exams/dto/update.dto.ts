import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateExamDto {
  @ApiProperty({ example: 'Prova de Matemática', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Prova atualizada', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['question-id-1', 'question-id-2'], required: false })
  @IsOptional()
  @IsArray()
  questions?: string[];
}
