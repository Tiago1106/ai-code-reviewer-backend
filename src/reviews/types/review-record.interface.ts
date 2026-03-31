import type { ReviewResult } from './review-result.interface';

export interface ReviewRecord {
  id: string;
  createdAt: number;
  expiresAt: number;
  result: ReviewResult;
}
