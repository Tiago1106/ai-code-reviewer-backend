import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import {
  CreateReviewDto,
  CreateReviewResponseDto,
  GetReviewResponseDto,
} from './dto/index';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Envia código para review.' })
  @ApiResponse({
    status: 201,
    description: 'Review criada com sucesso.',
    type: CreateReviewResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos (validação do DTO).',
  })
  create(@Body() _createReviewDto: CreateReviewDto): CreateReviewResponseDto {
    // No MVP, the DTO is validated but not used — the mock fixture is always returned.
    return this.reviewsService.create();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca o resultado de uma review pelo ID.' })
  @ApiParam({
    name: 'id',
    description: 'UUID da review.',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @ApiResponse({
    status: 200,
    description: 'Review encontrada.',
    type: GetReviewResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Review não encontrada ou expirada.',
  })
  findOne(@Param('id') id: string): GetReviewResponseDto {
    const record = this.reviewsService.findOne(id);

    if (!record) {
      throw new NotFoundException('Review not found');
    }

    return {
      id: record.id,
      status: 'done',
      result: record.result,
    };
  }
}
