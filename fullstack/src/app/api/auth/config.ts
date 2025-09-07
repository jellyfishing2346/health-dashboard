import GoogleProvider from 'next-auth/providers/google';
import type { NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db } from '@/lib/db';

export const authConfig: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      const t: any = token;
      if (user) t.id = (user as any).id;
      return t;
    },
    async session({ session, token }) {
      const t: any = token;
      if (session.user) (session.user as any).id = t.id as string;
      return session;
    },
  },
};
