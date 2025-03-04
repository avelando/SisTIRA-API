import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'NovoNome',
    required: false,
    description: 'Novo nome de usuário, se desejar alterar.',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    example: 'novoemail@example.com',
    required: false,
    description: 'Novo endereço de e-mail.',
  })
  @IsOptional()
  @IsEmail({}, { message: 'E-mail inválido' })
  email?: string;

  @ApiProperty({
    example: 'NovoPrimeiroNome',
    required: false,
    description: 'Novo primeiro nome.',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'NovoSobrenome',
    required: false,
    description: 'Novo sobrenome do usuário.',
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'NovoSobrenome',
    required: false,
    description: 'Novo sobrenome do usuário.',
  })
  @IsOptional()
  @IsString()
  password?: string;
}
