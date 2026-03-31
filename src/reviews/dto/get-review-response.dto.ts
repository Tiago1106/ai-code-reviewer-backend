import { ApiProperty } from '@nestjs/swagger';
import type { ReviewResult } from '../types/index';

export class GetReviewResponseDto {
  @ApiProperty({
    description: 'ID único da review.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  id!: string;

  @ApiProperty({
    description: 'Status da review.',
    example: 'done',
    enum: ['done'],
  })
  status!: string;

  @ApiProperty({
    description: 'Resultado estruturado da review.',
  })
  result!: ReviewResult;
}
