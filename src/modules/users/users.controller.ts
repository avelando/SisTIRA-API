import {
  Controller, Post, Body, Get, UseGuards, Patch, Delete, Req, UnauthorizedException,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  HttpStatus
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.dto';
import { UpdateUserDto } from './dto/update.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { cloudinaryV2 } from 'src/config/cloudinary.config';
import { Readable } from 'stream';

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

@ApiTags('Usuários')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) { }

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
    summary: 'Atualizar os dados do usuário autenticado',
    description: 'Atualiza nome, email, username e demais campos (exceto imagem).'
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'Erro nos dados enviados.' })
  @ApiResponse({ status: 401, description: 'Usuário não autenticado.' })
  @ApiBody({ type: UpdateUserDto })
  async updateProfile(
    @Req() req: Request,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (!req.user) throw new UnauthorizedException('Usuário não autenticado');
    return this.usersService.updateUser(req.user.userId, updateUserDto);
  }

  @Patch('me/profile-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Atualizar a imagem de perfil do usuário autenticado',
    description: 'Atualiza apenas a imagem de perfil via FormData.'
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Imagem atualizada com sucesso.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Erro no upload da imagem.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Usuário não autenticado.' })
  async updateProfileImage(
    @Req() req: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!req.user) throw new UnauthorizedException('Usuário não autenticado');
    if (!file) throw new BadRequestException('Arquivo de imagem não enviado');

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        {
          folder: 'profile_images',
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
        },
        async (error, result) => {
          if (error || !result) {
            console.error('Erro no upload do Cloudinary:', error);
            return reject(new BadRequestException('Falha ao enviar imagem.'));
          }

          await this.usersService.updateUser(req.user!.userId, {
            profileImageUrl: result!.secure_url,
          });

          resolve({ profileImageUrl: result!.secure_url });
        },
      );

      bufferToStream(file.buffer).pipe(uploadStream);
    });
  }
}
