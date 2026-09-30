import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
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
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "DEVELOPER";
        token.plan = (user as { plan?: string }).plan ?? "FREE";
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
  events: {
    /**
     * Ensure emailVerified is set for all OAuth users.
     */
    async signIn({ user, account }) {
      try {
        if (account?.provider !== "credentials" && user?.id && !(user as unknown as Record<string, unknown>).emailVerified) {
          await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: new Date() },
          });
        }
      } catch (err) {
        console.error("[NEXTAUTH_SIGNIN_EVENT_ERROR]", err);
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect OAuth errors to /login?error=... so they're displayed
  },
  debug: process.env.NODE_ENV === 'development',
};
