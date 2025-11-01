import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext, getSession } from "~/lib/auth";
import { lessons, lessonProgress } from "~/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/lessons/[slug]/complete
 *
 * Mark a lesson as completed with a quiz score
 * - Requires authentication
 * - Creates or updates lesson_progress entry
 * - Marks as completed if score >= 70%
 */
export async function POST({ params, request }: APIEvent) {
  console.log("[API] POST /api/lessons/[slug]/complete called");
  try {
    const { slug } = params;
    console.log("[API] Lesson slug:", slug);

    if (!slug) {
      console.log("[API] Error: No slug provided");
      return json(
        {
          success: false,
          error: "Lesson slug is required",
        },
        { status: 400 }
      );
    }

    // Get authenticated user
    const session = await getSession();
    console.log("[API] Session:", session ? "Found" : "Not found");
    console.log("[API] User ID:", session?.user?.id);

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

    // Parse request body
    const body = await request.json();
    const { score } = body;
    console.log("[API] Received score:", score);

    if (typeof score !== "number" || score < 0 || score > 100) {
      console.log("[API] Error: Invalid score");
      return json(
        {
          success: false,
          error: "Valid score (0-100) is required",
        },
        { status: 400 }
      );
    }

    const db = getDbFromContext();

    // Find the lesson by slug
    console.log("[API] Looking up lesson by slug...");
    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.slug, slug),
    });
    console.log("[API] Lesson found:", lesson ? lesson.id : "Not found");

    if (!lesson) {
      console.log("[API] Error: Lesson not found");
      return json(
        {
          success: false,
          error: "Lesson not found",
        },
        { status: 404 }
      );
    }

    // Check if progress already exists
    console.log("[API] Checking for existing progress...");
    const existingProgress = await db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.lessonId, lesson.id)
      ),
    });
    console.log("[API] Existing progress:", existingProgress ? "Found" : "Not found");

    const completed = score >= 70;
    const now = new Date();
    console.log("[API] Completed status:", completed);
    console.log("[API] Timestamp:", now);

    if (existingProgress) {
      // Update existing progress
      console.log("[API] Updating existing progress...");
      await db
        .update(lessonProgress)
        .set({
          completed,
          score,
          lastAccessed: now,
        })
        .where(
          and(
            eq(lessonProgress.userId, session.user.id),
            eq(lessonProgress.lessonId, lesson.id)
          )
        );
      console.log("[API] Progress updated successfully");
    } else {
      // Insert new progress record
      console.log("[API] Inserting new progress record...");
      await db.insert(lessonProgress).values({
        userId: session.user.id,
        lessonId: lesson.id,
        completed,
        score,
        lastAccessed: now,
      });
      console.log("[API] Progress inserted successfully");
    }

    const response = {
      success: true,
      progress: {
        lessonId: lesson.id,
        completed,
        score,
        lastAccessed: now,
      },
    };
    console.log("[API] Returning success response:", response);
    return json(response);
  } catch (error) {
    console.error("[API] Error updating lesson progress:", error);
    return json(
      {
        success: false,
        error: "Failed to update lesson progress",
      },
      { status: 500 }
    );
  }
}
