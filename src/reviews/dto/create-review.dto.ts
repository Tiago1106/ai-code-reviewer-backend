import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Language } from '../types/index';

export class CreateReviewDto {
  @ApiProperty({
    enum: Language,
    description: 'Linguagem de programação do código enviado.',
    example: 'typescript',
  })
  @IsEnum(Language, {
    message: `language must be one of: ${Object.values(Language).join(', ')}`,
  })
  language!: Language;

  @ApiProperty({
    description: 'Trecho de código a ser revisado.',
    example: 'const x = 1;',
  })
  @IsString()
  @IsNotEmpty({ message: 'code must not be empty' })
  code!: string;

  @ApiPropertyOptional({
    description: 'Contexto adicional sobre o código (opcional).',
    example: 'Este código faz parte de um módulo de autenticação.',
  })
  @IsOptional()
  @IsString()
  context?: string;
}
