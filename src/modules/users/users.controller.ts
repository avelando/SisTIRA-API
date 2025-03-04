import { 
  Controller, Post, Body, Get, UseGuards, Patch, Delete, Req, UnauthorizedException 
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import { Request } from 'express';

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário', description: 'Cria um novo usuário na plataforma.' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro nos dados enviados.' })
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('me')
  @ApiOperation({ summary: 'Obter os dados do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Dados do usuário retornados com sucesso.' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  getProfile(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException('Usuário não autenticado');
    return this.usersService.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Patch('me')
  @ApiOperation({ 
    summary: 'Atualizar parcialmente os dados do usuário autenticado', 
    description: 'Permite atualizar apenas username, email, password, firstName e lastName. Os demais campos não podem ser alterados.' 
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro nos dados enviados.' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'NovoNome' },
        email: { type: 'string', example: 'novoemail@example.com' },
        firstName: { type: 'string', example: 'NovoPrimeiroNome' },
        lastName: { type: 'string', example: 'NovoSobrenome' }
      },
    },
  })
  updateProfile(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    if (!req.user) throw new UnauthorizedException('Usuário não autenticado');
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Delete('me')
  @ApiOperation({ summary: 'Deletar a conta do usuário autenticado' })
  @ApiResponse({ status: 200, description: 'Conta deletada com sucesso.' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  deleteProfile(@Req() req: Request) {
    if (!req.user) throw new UnauthorizedException('Usuário não autenticado');
    return this.usersService.deleteUser(req.user.userId);
  }
}
