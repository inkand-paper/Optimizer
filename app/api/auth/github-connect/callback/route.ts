/**
 * app/api/auth/github-connect/callback/route.ts
 * GitHub redirects here after user authorizes the OAuth app
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const GITHUB_CLIENT_ID = process.env.GITHUB_CODE_REVIEW_CLIENT_ID!;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CODE_REVIEW_CLIENT_SECRET!;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // this is the userId we passed

  if (!code || !state) {
    return NextResponse.redirect(
      `${APP_URL}/dashboard/code-review?error=github_oauth_failed`
    );
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.access_token) {
      throw new Error(tokenData.error_description ?? "Token exchange failed");
    }

    const accessToken: string = tokenData.access_token;

    // Get GitHub user info
    const ghUserRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    const ghUser = await ghUserRes.json();

    // Verify the user exists
    const user = await prisma.user.findUnique({ where: { id: state } });
    if (!user) throw new Error("User not found");

    // Save GitHub token
    await prisma.user.update({
      where: { id: state },
      data: {
        githubAccessToken: accessToken,
        githubUserName: ghUser.login ?? null,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        type: "AUTH",
        action: "GitHub account connected for Code Review",
        status: "SUCCESS",
        userId: state,
        details: { githubUserName: ghUser.login },
      },
    });

    return NextResponse.redirect(
      `${APP_URL}/dashboard/code-review?github=connected&username=${ghUser.login}`
    );
  } catch (err) {
    console.error("[GITHUB_CONNECT_CALLBACK]", err);
    return NextResponse.redirect(
      `${APP_URL}/dashboard/code-review?error=github_connect_failed`
    );
  }
}