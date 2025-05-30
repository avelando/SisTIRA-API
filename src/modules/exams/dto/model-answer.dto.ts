import { IsEnum, IsString } from 'class-validator';
import { ModelAnswerType } from '@prisma/client';

export class ModelAnswerDto {
  @IsEnum(ModelAnswerType)
  type: ModelAnswerType;

  @IsString()
  content: string;
}
