import { json } from "@solidjs/router";
import { getDbFromContext, getSession } from "~/lib/auth";
import { sessionResults } from "~/db/schema";

/**
 * POST /api/session/start
 *
 * Initialize a new quiz session
 * - Requires authentication
 * - Creates a session_results record with initial values
 * - Returns session ID for tracking
 */
export async function POST() {
  console.log("[API] POST /api/session/start called");
  try {
    // Get authenticated user
    const session = await getSession();
    console.log("[API] Session:", session ? "Found" : "Not found");

    if (!session || !session.user) {
      console.log("[API] Error: Not authenticated");
      return json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 }
      );
    }

    const db = getDbFromContext();

    // Create a new session result record with initial values
    const sessionId = crypto.randomUUID();
    const now = new Date();

    console.log("[API] Creating new session:", sessionId);
    await db.insert(sessionResults).values({
      id: sessionId,
      userId: session.user.id,
      score: 0,
      accuracy: 0,
      patternsTestedCount: 0,
      duration: 0,
      maxStreak: 0,
      createdAt: now,
    });

    console.log("[API] Session created successfully");
    const response = {
      success: true,
      sessionId,
      createdAt: now,
    };

    return json(response);
  } catch (error) {
    console.error("[API] Error starting session:", error);
    return json(
      {
        success: false,
        error: "Failed to start session",
      },
      { status: 500 }
    );
  }
}
