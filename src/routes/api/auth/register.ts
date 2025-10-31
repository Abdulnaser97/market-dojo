import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { eq } from "drizzle-orm";
import { users } from "~/db/schema";
import { getDbFromContext, hashPassword } from "~/lib/auth";

export async function POST({ request }: APIEvent) {
  try {
    const data = (await request.json()) as { email: string; password: string; name?: string };
    const { email, password, name } = data;

    // Validation
    if (!email || !password) {
      return json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const db = getDbFromContext();

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email,
      name: name || null,
      passwordHash,
      emailVerified: null,
      image: null,
    });

    return json({
      success: true,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);
    return json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
