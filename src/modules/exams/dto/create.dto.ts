import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Prova de História' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Prova sobre Revolução Francesa', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}
