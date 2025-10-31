import { redirect } from "@solidjs/router";
import { getRequestEvent } from "solid-js/web";
import { createDbClient } from "~/db/client";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { sessions, users } from "~/db/schema";

/**
 * Get the current user session by looking up the session token in the database
 */
export async function getSession() {
  const event = getRequestEvent();

  if (!event) {
    return null;
  }

  try {
    // Get the session token from cookies
    const cookieHeader = event.request.headers.get("cookie");

    if (!cookieHeader) {
      return null;
    }

    // Parse cookies to find the session token
    // Auth.js uses either "authjs.session-token" or "__Secure-authjs.session-token"
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, ...v] = c.split("=");
        return [key, v.join("=")];
      })
    );

    const sessionToken =
      cookies["authjs.session-token"] ||
      cookies["__Secure-authjs.session-token"];

    if (!sessionToken) {
      return null;
    }

    // Look up the session in the database
    const db = getDbFromContext();

    const result = await db
      .select({
        session: sessions,
        user: users,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(eq(sessions.sessionToken, sessionToken))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const { session, user } = result[0];

    // Check if session is expired
    if (session.expires < new Date()) {
      return null;
    }

    // Return session object matching Auth.js format
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
      expires: session.expires.toISOString(),
    };
  } catch (error) {
    console.error("[auth] Session lookup failed:", error);
    return null;
  }
}

/**
 * Get the current user or redirect to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    throw redirect("/login");
  }

  return session.user;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Get database client from request context
 */
export function getDbFromContext() {
  const event = getRequestEvent();

  // Production: use Cloudflare D1
  if (event?.nativeEvent?.context?.cloudflare?.env?.DB) {
    const { env } = event.nativeEvent.context.cloudflare;
    return createDbClient(env.DB);
  }

  // Development: use local SQLite via libsql
  const { drizzle: drizzleLibsql } = require("drizzle-orm/libsql");
  const { createClient } = require("@libsql/client");
  const schema = require("~/db/schema");

  const client = createClient({
    url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder-id-run-wrangler-d1-create.sqlite",
  });

  return drizzleLibsql(client, { schema });
}
