import { http, HttpResponse } from 'msw';

export const googleHandlers = [
  // Google OAuth 2.0 Token Exchange
  http.post('https://oauth2.googleapis.com/token', () => {
    return HttpResponse.json({
      access_token: 'mock_google_access_token_12345',
      expires_in: 3600,
      token_type: 'Bearer',
      scope: 'https://www.googleapis.com/auth/business.manage',
      refresh_token: 'mock_google_refresh_token_67890',
    });
  }),

  // Google Places Details
  http.get('https://maps.googleapis.com/maps/api/place/details/json', () => {
    return HttpResponse.json({
      status: 'OK',
      result: {
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        name: 'Cake Connection Mock',
        formatted_address: '123 Bakery Street, Ahmedabad, Gujarat',
        rating: 4.8,
        user_ratings_total: 154,
        url: 'https://maps.google.com/?cid=1024',
      },
    });
  }),

  // Google Places Search
  http.get('https://maps.googleapis.com/maps/api/place/findplacefromtext/json', () => {
    return HttpResponse.json({
      status: 'OK',
      candidates: [
        {
          place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          name: 'Cake Connection Mock',
          formatted_address: '123 Bakery Street, Ahmedabad',
        },
      ],
    });
  }),

  // GBP Review Reply Submission
  http.put('https://mybusiness.googleapis.com/v4/accounts/:accountId/locations/:locationId/reviews/:reviewId/reply', async ({ request }) => {
    const body = (await request.json()) as any;
    return HttpResponse.json({
      comment: body?.comment || 'Thank you for your review!',
      updateTime: new Date().toISOString(),
    });
  }),

  // GBP Reviews List
  http.get('https://mybusiness.googleapis.com/v4/accounts/:accountId/locations/:locationId/reviews', () => {
    return HttpResponse.json({
      reviews: [
        {
          reviewId: 'rev_mock_001',
          reviewer: { displayName: 'Hitesh K' },
          starRating: 'FIVE',
          comment: 'Best chocolate cake in town!',
          createTime: '2026-08-01T10:00:00Z',
          updateTime: '2026-08-01T10:00:00Z',
        },
      ],
      totalReviewerCount: 1,
    });
  }),
];
