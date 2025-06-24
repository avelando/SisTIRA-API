import {
  Controller,
  Get,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { GoogleAuthService } from './google.service';
import type { User } from '@prisma/client';

@Controller('auth/google')
export class GoogleAuthController {
  constructor(private readonly googleAuthService: GoogleAuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleLogin(): Promise<void> {
  }

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      const user = (req.user as unknown) as User;
      if (!user) throw new UnauthorizedException();

      const token = this.googleAuthService.signToken(user);
      res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
      });

      return res.redirect('http://127.0.0.1:3000/dashboard');
    } catch (err) {
      console.error('Erro no OAuth callback:', err);
      return res.redirect('http://127.0.0.1:3000/auth/login');
    }
  }
}
