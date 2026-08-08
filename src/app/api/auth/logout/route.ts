import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear the custom JWT token
  response.cookies.set('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0, // Immediately expire
  });

  // Also clear NextAuth cookie just in case they used Google Login
  response.cookies.set('next-auth.session-token', '', {
    path: '/',
    maxAge: 0,
  });
  response.cookies.set('__Secure-next-auth.session-token', '', {
    path: '/',
    maxAge: 0,
  });

  return response;
}
