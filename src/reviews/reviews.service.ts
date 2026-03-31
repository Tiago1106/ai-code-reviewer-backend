import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import type { ReviewRecord } from './types/index';
import { MOCK_REVIEW_RESULT } from './fixtures/mock-review.fixture';

@Injectable()
export class ReviewsService implements OnModuleDestroy {
  private readonly store = new Map<string, ReviewRecord>();
  private readonly ttlMs: number;
  private readonly cleanupInterval: ReturnType<typeof setInterval>;

  constructor(private readonly configService: ConfigService) {
    this.ttlMs = this.configService.get<number>('REVIEW_TTL_MS', 900_000);

    const cleanupIntervalMs = this.configService.get<number>(
      'REVIEW_CLEANUP_INTERVAL_MS',
      60_000,
    );

    this.cleanupInterval = setInterval(
      () => this.removeExpired(),
      cleanupIntervalMs,
    );
  }

  onModuleDestroy(): void {
    clearInterval(this.cleanupInterval);
  }

  create(): { id: string } {
    const id = uuidv4();
    const now = Date.now();

    const record: ReviewRecord = {
      id,
      createdAt: now,
      expiresAt: now + this.ttlMs,
      result: MOCK_REVIEW_RESULT,
    };

    this.store.set(id, record);

    return { id };
  }

  findOne(id: string): ReviewRecord | null {
    const record = this.store.get(id);

    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      this.store.delete(id);
      return null;
    }

    return record;
  }

  private removeExpired(): void {
    const now = Date.now();

    for (const [id, record] of this.store) {
      if (now > record.expiresAt) {
        this.store.delete(id);
      }
    }
  }
}
