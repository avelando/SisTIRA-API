import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Credenciais inválidas');

    return user;
  }

  async login(email: string, password: string) {
    if (!email || !password) {
      throw new UnauthorizedException('E-mail e senha são obrigatórios');
    }
  
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email };
  
    const token = this.jwtService.sign(payload);
    return { token, user };
  }  
}
