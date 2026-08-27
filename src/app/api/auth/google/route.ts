import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const appUrl = url.origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.redirect(`${appUrl}/signup?error=google_auth_not_configured`);
    }

    const scopes = [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ");

    const state = "signup_" + Math.random().toString(36).substring(7);

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `response_type=code&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `access_type=offline&` +
      `prompt=select_account&` +
      `state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("[Google Auth Start] Error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/signup?error=auth_error`);
  }
}
