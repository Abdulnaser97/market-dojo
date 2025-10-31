import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { users, sessions } from "~/db/schema";
import { getDbFromContext } from "~/lib/auth";

export async function POST({ request }: APIEvent) {
  try {
    const data = (await request.json()) as { email: string; password: string };
    const { email, password } = data;

    if (!email || !password) {
      return json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const db = getDbFromContext();

    // Find user
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user || !user.passwordHash) {
      return json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create session
    const sessionToken = crypto.randomUUID();
    const expires = new Date();
    expires.setDate(expires.getDate() + 1); // 1 day from now

    await db.insert(sessions).values({
      sessionToken,
      userId: user.id,
      expires,
    });

    // Set session cookie
    const response = json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    // Add Set-Cookie header
    const headers = new Headers(response.headers);
    headers.append(
      "Set-Cookie",
      `authjs.session-token=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24}`
    );

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error("Sign in error:", error);
    return json(
      { error: "Failed to sign in" },
      { status: 500 }
    );
  }
}
