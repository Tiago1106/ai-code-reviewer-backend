import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ReviewsService } from './reviews.service';
import { MOCK_REVIEW_RESULT } from './fixtures/mock-review.fixture';

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: number) => {
              const config: Record<string, number> = {
                REVIEW_TTL_MS: 900_000,
                REVIEW_CLEANUP_INTERVAL_MS: 60_000,
              };
              return config[key] ?? defaultValue;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    service.onModuleDestroy();
  });

  describe('create', () => {
    it('should return an object with a UUID id', () => {
      const result = service.create();

      expect(result).toHaveProperty('id');
      expect(result.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique ids for each review', () => {
      const result1 = service.create();
      const result2 = service.create();

      expect(result1.id).not.toBe(result2.id);
    });
  });

  describe('findOne', () => {
    it('should return the review record for a valid id', () => {
      const { id } = service.create();
      const record = service.findOne(id);

      expect(record).not.toBeNull();
      expect(record!.id).toBe(id);
      expect(record!.result).toEqual(MOCK_REVIEW_RESULT);
      expect(record!.createdAt).toBeLessThanOrEqual(Date.now());
      expect(record!.expiresAt).toBeGreaterThan(Date.now());
    });

    it('should return null for a non-existent id', () => {
      const record = service.findOne('non-existent-id');

      expect(record).toBeNull();
    });

    it('should return null and delete expired reviews', () => {
      const { id } = service.create();

      // Advance time past TTL
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now + 900_001);

      const record = service.findOne(id);

      expect(record).toBeNull();

      // Restore Date.now and verify the record was deleted
      jest.spyOn(Date, 'now').mockReturnValue(now);
      const recordAfter = service.findOne(id);
      expect(recordAfter).toBeNull();

      jest.restoreAllMocks();
    });

    it('should return the record if not yet expired', () => {
      const { id } = service.create();

      // Advance time but still within TTL
      const now = Date.now();
      jest.spyOn(Date, 'now').mockReturnValue(now + 899_999);

      const record = service.findOne(id);

      expect(record).not.toBeNull();
      expect(record!.id).toBe(id);

      jest.restoreAllMocks();
    });
  });

  describe('onModuleDestroy', () => {
    it('should clear the cleanup interval without errors', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });
  });
});
