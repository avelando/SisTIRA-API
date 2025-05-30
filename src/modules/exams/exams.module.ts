import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { CorrectionService } from './correction.service';

@Module({
  imports: [AuthModule],
  controllers: [ExamsController],
  providers: [ExamsService, PrismaService, CorrectionService],
})
export class ExamsModule {}
