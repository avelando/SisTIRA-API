import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GoogleProfile } from '../../interfaces/googleProps';
import { CreateUserDto } from '../users/dto/create.dto';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import type { User } from '@prisma/client';

@Injectable()
export class GoogleAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) { }

  async findOrCreate(profile: GoogleProfile): Promise<User> {
    const existing = await this.usersService.findByEmail(profile.email);
    if (existing) return existing;

    const newUser: CreateUserDto = {
      username: profile.email.split('@')[0],
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      password: Math.random().toString(36).slice(-8),
      profileType: 'TEACHER',
      isGoogleUser: true,
    };
    return this.usersService.create(newUser);
  }

  signToken(user: Pick<User, 'id' | 'email'>): string {
    const payload = { sub: user.id, email: user.email };
    return this.jwtService.sign(payload);
  }
}
