/**
 * app/api/auth/github-connect/route.ts
 * GET → redirects logged-in user to GitHub OAuth for code review feature
 */

import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";

const GITHUB_CLIENT_ID = process.env.GITHUB_CODE_REVIEW_CLIENT_ID!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;
const CALLBACK_URL = `${APP_URL}/api/auth/github-connect/callback`;

export async function GET(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: CALLBACK_URL,
    scope: "repo read:user",
    state: token.userId, // use userId as CSRF state
  });

  return NextResponse.redirect(
    `https://github.com/login/oauth/authorize?${params}`
  );
}