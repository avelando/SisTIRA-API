import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExamDto {
  @ApiProperty({ example: 'Prova de História' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Prova sobre Revolução Francesa', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false, description: 'Se true, gera um código de acesso (e não link público).' })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({ 
    example: true, 
    required: false, 
    description: 'Se true, gera um código de acesso aleatório (em vez de usar o ID).' 
  })
  @IsOptional()
  @IsBoolean()
  generateAccessCode?: boolean;
}
