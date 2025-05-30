import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddQuestionsDto {
  @ApiProperty({ example: ['q-id-1','q-id-2'] })
  @IsArray()
  @IsString({ each: true })
  questions: string[];
}
