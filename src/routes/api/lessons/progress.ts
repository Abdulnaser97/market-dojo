import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext, getSession } from "~/lib/auth";
import { lessonProgress } from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/lessons/progress
 *
 * Fetch all lesson progress for the current authenticated user
 */
export async function GET({}: APIEvent) {
  console.log("[API] GET /api/lessons/progress called");
  try {
    // Get authenticated user
    const session = await getSession();
    console.log("[API] Session:", session ? "Found" : "Not found");
    console.log("[API] User ID:", session?.user?.id);

    if (!session || !session.user) {
      console.log("[API] No session, returning empty progress");
      return json({
        success: true,
        progress: {}, // Return empty object for unauthenticated users
      });
    }

    const db = getDbFromContext();

    // Fetch all progress for this user
    console.log("[API] Fetching progress for user:", session.user.id);
    const userProgress = await db.query.lessonProgress.findMany({
      where: eq(lessonProgress.userId, session.user.id),
    });
    console.log("[API] Found progress records:", userProgress.length);
    console.log("[API] Progress records:", userProgress);

    // Transform into a map for easier lookup by lessonId
    const progressMap: Record<string, { completed: boolean; score: number | null }> = {};
    for (const progress of userProgress) {
      progressMap[progress.lessonId] = {
        completed: progress.completed,
        score: progress.score,
      };
    }
    console.log("[API] Progress map:", progressMap);

    const response = {
      success: true,
      progress: progressMap,
    };
    console.log("[API] Returning response:", response);
    return json(response);
  } catch (error) {
    console.error("[API] Error fetching lesson progress:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch lesson progress",
      },
      { status: 500 }
    );
  }
}
