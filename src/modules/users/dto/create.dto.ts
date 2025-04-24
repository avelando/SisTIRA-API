import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength, Matches, IsIn } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'JohnDoe',
    description: 'Nome de usuário exclusivo para login.',
  })
  @IsNotEmpty({ message: 'O nome de usuário é obrigatório' })
  username: string;

  @ApiProperty({
    example: 'johndoe@example.com',
    description: 'Endereço de e-mail válido.',
  })
  @IsEmail({}, { message: 'E-mail inválido' })
  email: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'Senha do usuário, com pelo menos 6 caracteres, incluindo letras e números.',
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/, {
    message: 'A senha deve conter pelo menos uma letra e um número',
  })
  password: string;

  @ApiProperty({
    example: 'John',
    description: 'Primeiro nome do usuário.',
  })
  @IsNotEmpty({ message: 'O primeiro nome é obrigatório' })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Último nome do usuário.',
  })
  @IsNotEmpty({ message: 'O sobrenome é obrigatório' })
  lastName: string;

  @ApiProperty({
    example: 'STUDENT',
    enum: ['STUDENT', 'TEACHER'],
    description: 'Tipo de perfil do usuário.',
  })
  @IsNotEmpty({ message: 'O tipo de perfil é obrigatório' })
  @IsIn(['STUDENT', 'TEACHER'], { message: 'Tipo de perfil inválido' })
  profileType: 'STUDENT' | 'TEACHER';
}
