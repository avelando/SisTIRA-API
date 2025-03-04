import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsNotEmpty, 
  IsString, 
  IsArray, 
  ValidateNested, 
  IsBoolean, 
  ValidateIf 
} from 'class-validator';
import { Type } from 'class-transformer';

enum QuestionType {
  OBJ = 'OBJ',
  SUB = 'SUB',
}

class AlternativeDto {
  @ApiProperty({ example: 'Resposta A' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  correct: boolean;
}

export class CreateQuestionDto {
  @ApiProperty({ example: 'Qual é a capital da França?' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ example: 'OBJ', enum: QuestionType })
  @IsEnum(QuestionType)
  questionType: QuestionType;

  @ApiProperty({ example: ['Geografia'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  disciplines: string[];

  @ApiProperty({ example: [{ content: 'Paris', correct: true }], type: [AlternativeDto], required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternativeDto)
  @ValidateIf((obj) => obj.questionType === QuestionType.OBJ)
  alternatives?: AlternativeDto[];
}
