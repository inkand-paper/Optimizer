import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

export const authOptions: AuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "abir-optimizer-jwt-secret-key-2026-production-ready",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      checks: ["none"],
      authorization: {
        params: {
          prompt: "consent",
        },
      },
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email || `${profile.login}@users.noreply.github.com`,
          image: profile.avatar_url,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "",
      clientSecret: process.env.GOOGLE_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      checks: ["none"],
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
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.callback-url" : "next-auth.callback-url",
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: process.env.NODE_ENV === "production" ? "__Host-next-auth.csrf-token" : "next-auth.csrf-token",
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
              name: user.name || user.email.split('@')[0],
              image: user.image,
              role: "DEVELOPER",
              plan: "FREE",
              emailVerified: new Date(),
            },
          });

          if (existingUser?.twoFactorEnabled) {
            const { signJwt } = await import("@/lib/auth");
            const mfaToken = signJwt({ userId: existingUser.id, mfaChallenge: true }, '5m');
            return `/login?mfaRequired=true&mfaToken=${encodeURIComponent(mfaToken)}`;
          }
        } catch (err) {
          console.error("[NEXTAUTH_SIGNIN_UPSERT_ERROR]", err);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      const email = user?.email || (token.email as string);
      if (email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: { id: true, role: true, plan: true, twoFactorEnabled: true },
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
        const sUser = session.user as { id?: string; role?: string; plan?: string; name?: string | null; email?: string | null; image?: string | null };
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
  debug: process.env.NODE_ENV === 'development',
};
