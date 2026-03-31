import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { MOCK_REVIEW_RESULT } from './fixtures/mock-review.fixture';
import { Language } from './types/index';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockService = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should call service.create and return { id }', () => {
      const mockId = 'test-uuid-1234';
      mockService.create.mockReturnValue({ id: mockId });

      const result = controller.create({
        language: Language.TYPESCRIPT,
        code: 'const x = 1;',
      });

      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual({ id: mockId });
    });
  });

  describe('findOne', () => {
    it('should return the review response for a valid id', () => {
      const mockRecord = {
        id: 'test-uuid-1234',
        createdAt: Date.now(),
        expiresAt: Date.now() + 900_000,
        result: MOCK_REVIEW_RESULT,
      };
      mockService.findOne.mockReturnValue(mockRecord);

      const result = controller.findOne('test-uuid-1234');

      expect(service.findOne).toHaveBeenCalledWith('test-uuid-1234');
      expect(result).toEqual({
        id: 'test-uuid-1234',
        status: 'done',
        result: MOCK_REVIEW_RESULT,
      });
    });

    it('should throw NotFoundException when review is not found', () => {
      mockService.findOne.mockReturnValue(null);

      expect(() => controller.findOne('non-existent-id')).toThrow(
        NotFoundException,
      );
      expect(() => controller.findOne('non-existent-id')).toThrow(
        'Review not found',
      );
    });
  });
});
