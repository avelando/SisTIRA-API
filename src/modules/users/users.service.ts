import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateUserDto) {
    if (!data.password) {
      throw new BadRequestException('A senha não pode estar vazia');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      console.error(`Erro ao criar usuário: Email ou Username já existem (${data.email} | ${data.username})`);
      throw new BadRequestException('Já existe um usuário com este e-mail ou username.');
    }

    return this.prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
      },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');
  
    if (data.email || data.username) {
      const existingUser = await this.prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            { username: data.username },
          ],
          NOT: { id: userId },
        },
      });
  
      if (existingUser) {
        console.error(`Erro ao atualizar usuário: Email ou Username já em uso (${data.email} | ${data.username})`);
        throw new BadRequestException('Já existe um usuário com este e-mail ou username.');
      }
    }
  
    const updatedData: any = {};
  
    if (data.username) updatedData.username = data.username;
    if (data.email) updatedData.email = data.email;
    if (data.firstName) updatedData.firstName = data.firstName;
    if (data.lastName) updatedData.lastName = data.lastName;
  
    if (data.profileImageUrl !== undefined) {
      updatedData.profileImageUrl = data.profileImageUrl;
    }
  
    return this.prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });
  }  

  async deleteUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Usuário não encontrado');

    return this.prisma.user.delete({ where: { id: userId } });
  }
}
