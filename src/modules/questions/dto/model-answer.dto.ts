import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsNotEmpty } from 'class-validator';
import { ModelAnswerType } from '@prisma/client';

export class ModelAnswerDto {
  @ApiProperty({
    enum: ModelAnswerType,
    example: ModelAnswerType.WRONG,
    description: 'Tipo de resposta-modelo: WRONG, MEDIAN ou CORRECT',
  })
  @IsEnum(ModelAnswerType)
  type: ModelAnswerType;

  @ApiProperty({ example: 'Resposta totalmente errada.' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
