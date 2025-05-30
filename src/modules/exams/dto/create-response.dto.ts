import { IsUUID, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsString()
  alternativeId?: string;

  @IsOptional()
  @IsString()
  textResponse?: string;
}

export class RespondExamDto {
  @IsUUID()
  examId: string;

  @IsOptional()
  @IsString()
  accessCode?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
