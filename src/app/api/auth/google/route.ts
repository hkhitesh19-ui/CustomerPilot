import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
    const appUrl = `${protocol}://${host}`;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${appUrl}/api/auth/google/callback`;

    if (!clientId) {
      return NextResponse.redirect(`${appUrl}/signup?error=google_auth_not_configured`);
    }

    const url = new URL(req.url);
    const moduleParam = url.searchParams.get("module") || "";

    const scope = "openid email profile";
    const state = `signup_${moduleParam}_` + Math.random().toString(36).substring(7);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scope,
      access_type: "offline",
      prompt: "select_account",
      state: state,
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error("[Google Auth Start] Error:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/signup?error=auth_error`);
  }
}
