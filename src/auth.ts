import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { googleAuthEnabled } from "@/lib/auth-callback";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials.email ?? "")
          .toLowerCase()
          .trim();
        const password = String(credentials.password ?? "");
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
    ...(googleAuthEnabled()
      ? [
          Google({
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase().trim();
      const verified = (profile as { email_verified?: boolean } | undefined)?.email_verified;
      if (!email || verified === false) return false;

      await prisma.user.upsert({
        where: { email },
        update: { name: user.name?.trim() || undefined },
        create: {
          email,
          name: user.name?.trim() || email.split("@")[0] || "Gost",
        },
      });
      return true;
    },
    async jwt({ token, user }) {
      if (user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email.toLowerCase() },
          select: { id: true },
        });
        if (dbUser) token.sub = dbUser.id;
      } else if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
