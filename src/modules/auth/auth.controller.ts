import { Controller, Post, Body, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Autenticação')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    console.log('🔍 Dados recebidos no DTO:', loginDto);

    if (!loginDto.email || !loginDto.password) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios');
    }

    const { token, user } = await this.authService.login(loginDto.email, loginDto.password);

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
    });    

    return res.json({ message: 'Login realizado com sucesso!', user });
  }
}
