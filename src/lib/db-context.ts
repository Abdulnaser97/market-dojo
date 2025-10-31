import { getRequestEvent } from "solid-js/web";
import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleLibsql } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "~/db/schema";
import type { DB } from "~/db/client";

// For local development, use a local SQLite file
let localDb: DB | null = null;

function getLocalDb(): DB {
  if (!localDb) {
    const client = createClient({
      url: "file:.wrangler/state/v3/d1/miniflare-D1DatabaseObject/placeholder-id-run-wrangler-d1-create.sqlite",
    });
    localDb = drizzleLibsql(client, { schema }) as unknown as DB;
  }
  return localDb;
}

/**
 * Get database client from request context (production)
 * or local SQLite file (development)
 */
export function getDb(): DB {
  const event = getRequestEvent();

  // In production (Cloudflare Workers)
  if (event?.nativeEvent?.context?.cloudflare?.env?.DB) {
    const d1 = event.nativeEvent.context.cloudflare.env.DB;
    return drizzle(d1, { schema }) as unknown as DB;
  }

  // In development (local SQLite)
  return getLocalDb();
}
