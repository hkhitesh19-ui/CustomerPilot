import { describe, it, expect } from 'vitest';
import {
  calculateReviewBonus,
  generateReviewDraft,
  computeReputationScore,
  REVIEW_BONUS_BASE,
  REVIEW_BONUS_5_STAR,
  REVIEW_BONUS_PHOTO,
} from '@/lib/review-engine';

describe('Pillar 2 — AI Draft Google Review & Reputation Engine', () => {
  describe('Review Bonus Calculation (calculateReviewBonus)', () => {
    it('awards base 1 bonus stamp for text review under 5 stars without photo', () => {
      expect(calculateReviewBonus({ rating: 4, hasPhoto: false })).toBe(REVIEW_BONUS_BASE);
      expect(calculateReviewBonus({ rating: 3, hasPhoto: false })).toBe(REVIEW_BONUS_BASE);
    });

    it('awards 2 bonus stamps for 5-star review without photo', () => {
      expect(calculateReviewBonus({ rating: 5, hasPhoto: false })).toBe(
        REVIEW_BONUS_BASE + REVIEW_BONUS_5_STAR
      );
    });

    it('awards 3 bonus stamps for 4-star review with photo', () => {
      expect(calculateReviewBonus({ rating: 4, hasPhoto: true })).toBe(
        REVIEW_BONUS_BASE + REVIEW_BONUS_PHOTO
      );
    });

    it('awards maximum 4 bonus stamps for 5-star review with photo', () => {
      expect(calculateReviewBonus({ rating: 5, hasPhoto: true })).toBe(
        REVIEW_BONUS_BASE + REVIEW_BONUS_5_STAR + REVIEW_BONUS_PHOTO
      );
      expect(calculateReviewBonus({ rating: 5, hasPhoto: true })).toBe(4);
    });
  });

  describe('Deterministic AI Review Draft Generator (generateReviewDraft)', () => {
    const context = {
      customerName: 'Hitesh Patel',
      merchantName: 'Cake Connection',
      rewardName: 'Belgian Chocolate Pastry',
    };

    it('generates enthusiastic 5-star review for high ratings (>= 4)', () => {
      const draft = generateReviewDraft({ ...context, rating: 5 });
      expect(draft).toContain('Cake Connection');
      expect(draft).toContain('belgian chocolate pastry');
      expect(draft).toContain('⭐⭐⭐⭐⭐');
      expect(draft).toContain('Highly recommend');
    });

    it('generates balanced neutral review for 3-star ratings', () => {
      const draft = generateReviewDraft({ ...context, rating: 3 });
      expect(draft).toContain('Cake Connection');
      expect(draft).toContain('solid experience');
      expect(draft).not.toContain('⭐⭐⭐⭐⭐');
    });

    it('generates constructive internal feedback draft for low ratings (<= 2)', () => {
      const draft = generateReviewDraft({ ...context, rating: 2 });
      expect(draft).toContain('mixed experience');
      expect(draft).toContain('shared feedback with the manager');
      expect(draft).not.toContain('Highly recommend');
    });
  });

  describe('Reputation Impact Score (computeReputationScore)', () => {
    const now = new Date('2026-08-09T12:00:00Z');

    it('starts at neutral 50 when there are no submitted reviews', () => {
      const result = computeReputationScore({ reviews: [], now });
      expect(result.score).toBe(50);
      expect(result.rating).toBe(0);
      expect(result.totalReviews).toBe(0);
    });

    it('increases score for 5-star and 4-star reviews with photo trust signal', () => {
      const reviews = [
        { rating: 5, hasPhoto: true, submittedAt: '2026-08-05T10:00:00Z', status: 'submitted' },
        { rating: 4, hasPhoto: false, submittedAt: '2026-08-06T10:00:00Z', status: 'submitted' },
      ];
      // 50 (base) + 5 (5-star) + 2 (photo) + 2 (4-star) = 59
      const result = computeReputationScore({ reviews, now });
      expect(result.score).toBe(59);
      expect(result.rating).toBe(4.5);
      expect(result.totalReviews).toBe(2);
      expect(result.recent30).toBe(2);
    });

    it('penalizes negative ratings and penalizes stale reviews >90 days old', () => {
      const reviews = [
        { rating: 1, hasPhoto: false, submittedAt: '2026-04-01T10:00:00Z', status: 'submitted' }, // >90 days old
      ];
      // 50 (base) - 15 (1-star) - 2 (stale > 90d) = 33
      const result = computeReputationScore({ reviews, now });
      expect(result.score).toBe(33);
      expect(result.rating).toBe(1.0);
      expect(result.recent30).toBe(0);
    });

    it('clamps reputation score within [0, 100]', () => {
      const manyNegative = Array(10).fill({
        rating: 1,
        hasPhoto: false,
        submittedAt: '2026-08-01T10:00:00Z',
        status: 'submitted',
      });
      const result = computeReputationScore({ reviews: manyNegative, now });
      expect(result.score).toBe(0);
    });
  });
});
