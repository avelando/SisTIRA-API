import { Module } from '@nestjs/common';
import { QuestionBanksService } from './question-banks.service';
import { QuestionBanksController } from './question-banks.controller';
import { PrismaModule } from 'src/database/prisma/prisma.module'; 
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/modules/auth/auth.module';

@Module({
  imports: [PrismaModule, JwtModule.register({}), AuthModule],
  providers: [QuestionBanksService],
  controllers: [QuestionBanksController],
})
export class QuestionBanksModule {}
