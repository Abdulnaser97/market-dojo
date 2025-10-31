import type { SolidAuthConfig } from "@auth/solid-start";
import Credentials from "@auth/core/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users } from "~/db/schema";
import type { DB } from "~/db/client";

export function getAuthConfig(db: DB): SolidAuthConfig {
  return {
    adapter: DrizzleAdapter(db as any) as any,
    providers: [
      Credentials({
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) {
            return null;
          }

          // Find user by email
          const user = await db.query.users.findFirst({
            where: eq(users.email, credentials.email as string),
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );

          if (!isValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        },
      }) as any,
    ],
    session: {
      strategy: "jwt",
      maxAge: 24 * 60 * 60, // 1 day
    },
    pages: {
      signIn: "/login",
    },
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
        }
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
        }
        return session;
      },
    },
    trustHost: true,
  };
}
