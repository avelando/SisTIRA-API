import { Module, forwardRef } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { GoogleAuthController } from './google.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthService } from './google.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController, GoogleAuthController],
  providers: [AuthService, JwtAuthGuard, JwtStrategy, GoogleStrategy, GoogleAuthService],
  exports: [AuthService, JwtAuthGuard, JwtModule],
})

export class AuthModule { }
