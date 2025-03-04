import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { QuestionBanksModule } from '../../modules/question-banks/question-banks.module';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
  imports: [QuestionBanksModule],
})
export class PrismaModule {}
