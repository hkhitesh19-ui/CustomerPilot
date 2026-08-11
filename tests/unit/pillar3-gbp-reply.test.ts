import { describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { postGoogleReviewReplyWithQuotaProtection } from '@/lib/google-places-api';
import { searchPlaces } from '@/lib/google-places-api';

describe('Pillar 3 — Google Business Profile & Places Integration', () => {
  describe('Google Places URL and Text Resolution', () => {
    it('correctly parses Google Maps URL queries without hitting external network', async () => {
      const urlQuery = 'https://maps.app.goo.gl/abcdef123';
      const result = await searchPlaces(urlQuery);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].placeId).toBeDefined();
      expect(result.results[0].types).toContain('establishment');
    });

    it('throws error when search query is empty', async () => {
      await expect(searchPlaces('')).rejects.toThrow('SEARCH_QUERY_REQUIRED');
    });

    it('correctly formats and normalizes long Maps URLs', async () => {
      const urlQuery = 'https://www.google.com/maps/place/Some+Business/@12.34,56.78,15z';
      const result = await searchPlaces(urlQuery);
      expect(result.results).toHaveLength(1);
      expect(result.results[0].placeId).toBeDefined();
    });

    it('correctly falls back to text search for non-URL queries', async () => {
      const textQuery = 'Best Coffee Shop in Mumbai';
      const result = await searchPlaces(textQuery);
      expect(result.results.length).toBeGreaterThanOrEqual(1);
      expect(result.results[0].placeId).toBeDefined();
      expect(result.results[0].displayName?.text).toBeDefined();
    });

    it('handles null or undefined query gracefully', async () => {
      await expect(searchPlaces(undefined as any)).rejects.toThrow('SEARCH_QUERY_REQUIRED');
      await expect(searchPlaces(null as any)).rejects.toThrow('SEARCH_QUERY_REQUIRED');
    });
  });

  describe('GBP Review Reply with Quota & Dead-Letter Protection', () => {
    it('successfully posts review reply when GBP API returns 200 OK', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.json({
            comment: 'Thank you for your warm words! See you soon at Cake Connection.',
            updateTime: '2026-08-09T12:00:00Z',
          });
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Thank you for your warm words! See you soon at Cake Connection.',
        accessToken: 'mock_valid_gbp_token',
      });

      expect(result.success).toBe(true);
      expect(result.status).toBe('POSTED');
      expect(result.replyText).toContain('Thank you for your warm words');
    });

    it('gracefully handles 403 QUOTA_LOCKED / Resource Exhausted without throwing unhandled exceptions', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.json(
            {
              error: {
                code: 403,
                message: 'Quota exceeded for project 391546314644',
                status: 'PERMISSION_DENIED',
              },
            },
            { status: 403 }
          );
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Auto reply awaiting quota activation',
        accessToken: 'mock_limited_token',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('QUOTA_LOCKED');
      expect(result.replyText).toBe('Auto reply awaiting quota activation');
    });

    it('gracefully handles 401 UNAUTHORIZED / expired tokens without crashing', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.json(
            {
              error: {
                code: 401,
                message: 'Request is missing required authentication credential.',
                status: 'UNAUTHENTICATED',
              },
            },
            { status: 401 }
          );
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Auto reply',
        accessToken: 'expired_token',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
    });

    it('gracefully handles 404 NOT FOUND for deleted reviews', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.json(
            { error: { code: 404, message: 'Review not found.' } },
            { status: 404 }
          );
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_deleted',
        comment: 'Auto reply',
        accessToken: 'mock_token',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
    });

    it('handles 500 server errors as FAILED status with error message', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.json(
            { error: { message: 'Internal Server Error' } },
            { status: 500 }
          );
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Failed reply',
        accessToken: 'mock_token',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
    });

    it('handles network timeouts or unavailable network gracefully', async () => {
      server.use(
        http.post(/https:\/\/mybusinessreviews\.googleapis\.com\/v1\/.*/, () => {
          return HttpResponse.error();
        })
      );

      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Timeout reply',
        accessToken: 'mock_token',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
    });
    
    it('returns error when access token is missing', async () => {
      const result = await postGoogleReviewReplyWithQuotaProtection({
        merchantId: 'm_cake_01',
        reviewName: 'accounts/123/locations/456/reviews/rev_001',
        comment: 'Reply text',
        accessToken: '',
      });

      expect(result.success).toBe(false);
      expect(result.status).toBe('FAILED');
    });
  });
});

