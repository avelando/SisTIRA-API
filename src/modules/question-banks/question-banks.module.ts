import { Module } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service';
import { QuestionBanksController } from './question-banks.controller';

@Module({
  providers: [QuestionBanksService],
  controllers: [QuestionBanksController]
})
export class QuestionBanksModule {}
