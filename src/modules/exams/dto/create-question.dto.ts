import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsArray, ValidateNested, ValidateIf, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

enum QuestionType {
  OBJ = 'OBJ',
  SUB = 'SUB',
}

export class AlternativeDto {
  @ApiProperty()
  @IsString()
  content: string;

  @ApiProperty()
  @IsBoolean()
  correct: boolean;
}

export class CreateManualQuestionDto {
  @ApiProperty()
  @IsString()
  text: string;

  @ApiProperty({ enum: QuestionType })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  disciplines?: string[];

  @ApiProperty({ type: [AlternativeDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  @ValidateIf((o) => o.questionType === QuestionType.OBJ)
  alternatives?: AlternativeDto[];
}
