import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddBanksDto {
  @ApiProperty({ example: ['bank-id-1','bank-id-2'] })
  @IsArray()
  @IsString({ each: true })
  bankIds: string[];
}
