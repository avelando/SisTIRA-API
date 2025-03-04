import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Prova de História' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Prova sobre Revolução Francesa', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['question-id-1', 'question-id-2'], required: false })
  @IsOptional()
  @IsArray()
  questions?: string[];

  @ApiProperty({ example: 'question-bank-id-1', required: false })
  @IsOptional()
  @IsString()
  questionBankId?: string;
}
