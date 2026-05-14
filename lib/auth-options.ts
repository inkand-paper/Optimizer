import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { AuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET || (() => { throw new Error("NEXTAUTH_SECRET is missing"); })(),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
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
        token.role = (user as any).role ?? "DEVELOPER";
        token.plan = (user as any).plan ?? "FREE";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role ?? "DEVELOPER";
        (session.user as any).plan = token.plan ?? "FREE";
      }
      return session;
    },
  },
  events: {
    /**
     * Ensure emailVerified is set for all OAuth users.
     * PrismaAdapter normally handles this, but this is a safety net
     * in case a user was created without it (e.g., via a partial migration).
     */
    async signIn({ user, account }) {
      if (account?.provider !== "credentials" && user.id && !(user as unknown as Record<string, unknown>).emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect OAuth errors to /login?error=... so they're displayed
  },
  debug: process.env.NODE_ENV === 'development',
};
