import { SolidAuth, type SolidAuthConfig } from "@auth/solid-start";
import Credentials from "@auth/core/providers/credentials";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { createDbClient } from "~/db/client";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import { getRequestEvent } from "solid-js/web";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "~/db/schema";

function getDb() {
  const event = getRequestEvent();

  // Production: use Cloudflare D1
  if (event?.nativeEvent?.context?.cloudflare?.env?.DB) {
    const { env } = event.nativeEvent.context.cloudflare;
    return createDbClient(env.DB);
  }

  // Development: use local SQLite via libsql
  const client = createClient({
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder-id-run-wrangler-d1-create.sqlite",
  });

  return drizzleLibsql(client, { schema });
}

export const { GET, POST } = SolidAuth({
  adapter: DrizzleAdapter(getDb()) as any,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        const db = getDb();

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string),
        });

        if (!user || !user.passwordHash) {
          return null;
        }

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
    strategy: "database",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  pages: {
    signIn: "/login",
  },
  basePath: "/api/auth",
  trustHost: true,
} as SolidAuthConfig);
