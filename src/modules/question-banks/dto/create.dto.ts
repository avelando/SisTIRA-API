import { IsString, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuestionBankDto {
  @ApiProperty({ example: 'Banco de História' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Banco de questões sobre história mundial', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['question-id-1', 'question-id-2'], required: false })
  @IsOptional()
  @IsArray()
  questions?: string[];
}
