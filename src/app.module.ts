import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthController } from './modules/auth/auth.controller';
import { QuestionsModule } from './modules/questions/questions.module';
import { QuestionBanksModule } from './modules/question-banks/question-banks.module'

@Module({
  imports: [UsersModule, AuthModule, QuestionsModule, QuestionBanksModule],
  controllers: [AppController, AuthController],
  providers: [AppService],
})

export class AppModule {}
