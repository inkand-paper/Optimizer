import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * [SECURITY — H2] MFA Challenge Token Exchange
 *
 * This endpoint lets the client-side login page retrieve the MFA challenge token
 * that was placed in an HttpOnly cookie by the NextAuth signIn callback.
 * The cookie is consumed (deleted) after one read so it cannot be replayed.
 *
 * This keeps the JWT entirely out of URL query parameters (browser history,
 * server logs, referrer headers).
 */
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const mfaToken = cookieStore.get("mfa_challenge")?.value;

  if (!mfaToken) {
    return NextResponse.json({ error: "No pending MFA challenge" }, { status: 404 });
  }

  // Consume the cookie immediately — single-use.
  cookieStore.delete("mfa_challenge");

  // Basic origin check — only serve to same-origin requests.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({ mfaToken });
}
