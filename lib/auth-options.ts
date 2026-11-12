import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// [SECURITY — C1] Hard-fail at startup if NEXTAUTH_SECRET is missing in production.
if (process.env.NODE_ENV === "production" && !process.env.NEXTAUTH_SECRET) {
  throw new Error(
    "FATAL: NEXTAUTH_SECRET environment variable is required in production."
  );
}

export const authOptions: AuthOptions = {
  // [SECURITY — C1] No hardcoded fallback string — will throw above in prod if unset.
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      // [SECURITY — C2] Removed `checks: ["none"]` — restores CSRF state verification.
      // allowDangerousEmailAccountLinking retained intentionally for the email-merge UX,
      // but CSRF/state checks are no longer disabled.
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email:
            profile.email ||
            `${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      // [SECURITY — C2] Removed `checks: ["none"]` — restores PKCE + state checks.
      allowDangerousEmailAccountLinking: true,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile",
        },
      },
    }),
  ],
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Host-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      if (user && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, twoFactorEnabled: true },
          });

          await prisma.user.upsert({
            where: { email: user.email },
            update: {
              name: user.name || undefined,
              image: user.image || undefined,
              emailVerified: new Date(),
            },
            create: {
              email: user.email,
              name: user.name || user.email.split("@")[0],
              image: user.image,
              role: "DEVELOPER",
              plan: "FREE",
              emailVerified: new Date(),
            },
          });

          // [SECURITY — H2] MFA challenge token is now returned in the JSON body
          // of the custom /api/auth/login route, never as a URL query param.
          // For NextAuth social logins we store the pending challenge in the JWT
          // and redirect to the MFA page — the token stays server-side.
          if (existingUser?.twoFactorEnabled) {
            const { signJwt } = await import("@/lib/auth");
            const mfaToken = signJwt(
              { userId: existingUser.id, mfaChallenge: true },
              "5m"
            );
            // Store mfaToken in a short-lived HttpOnly cookie instead of URL param.
            // The login page reads and clears it immediately on mount.
            const { cookies } = await import("next/headers");
            const cookieStore = await cookies();
            cookieStore.set("mfa_challenge", mfaToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax",
              maxAge: 5 * 60, // 5 minutes — matches token TTL
              path: "/",
            });
            return "/login?mfaRequired=true";
          }
        } catch (err) {
          console.error("[NEXTAUTH_SIGNIN_UPSERT_ERROR]", err);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger }) {
      // [PERF — P3] Only hit the DB on initial sign-in or explicit session update.
      // On every subsequent token refresh (trigger === undefined and user is null),
      // return the cached token to avoid a DB round-trip per request.
      if (!user && trigger !== 'update') return token;

      const email = user?.email || (token.email as string);
      if (email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              role: true,
              plan: true,
              twoFactorEnabled: true,
            },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.plan = dbUser.plan;
            token.twoFactorEnabled = dbUser.twoFactorEnabled;
          }
        } catch (err) {
          console.error("[NEXTAUTH_JWT_FETCH_ERROR]", err);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const sUser = session.user as {
          id?: string;
          role?: string;
          plan?: string;
          name?: string | null;
          email?: string | null;
          image?: string | null;
        };
        sUser.id = token.id as string;
        sUser.role = (token.role as string) ?? "DEVELOPER";
        sUser.plan = (token.plan as string) ?? "FREE";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect OAuth errors to /login?error=... so they're displayed
  },
  debug: process.env.NODE_ENV === "development",
};
