import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { sessions } from "~/db/schema";
import { getDbFromContext } from "~/lib/auth";

export async function POST({ request }: APIEvent) {
  try {
    // Get session token from cookies
    const cookieHeader = request.headers.get("cookie");

    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, ...v] = c.split("=");
          return [key, v.join("=")];
        })
      );

      const sessionToken =
        cookies["authjs.session-token"] ||
        cookies["__Secure-authjs.session-token"];

      if (sessionToken) {
        // Delete session from database
        const db = getDbFromContext();
        await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
      }
    }

    // Clear cookie
    const response = json({ success: true });
    const headers = new Headers(response.headers);
    headers.append(
      "Set-Cookie",
      `authjs.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Sign out error:", error);
    return json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
