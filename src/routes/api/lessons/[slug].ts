import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext } from "~/lib/auth";
import { lessons } from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/lessons/[slug]
 *
 * Fetch a single lesson by its slug
 */
export async function GET({ params }: APIEvent) {
  try {
    const { slug } = params;

    if (!slug) {
      return json(
        {
          success: false,
          error: "Lesson slug is required",
        },
        { status: 400 }
      );
    }

    const db = getDbFromContext();

    const lesson = await db.query.lessons.findFirst({
      where: eq(lessons.slug, slug),
    });

    if (!lesson) {
      return json(
        {
          success: false,
          error: "Lesson not found",
        },
        { status: 404 }
      );
    }

    return json({
      success: true,
      lesson,
    });
  } catch (error) {
    console.error("[API] Error fetching lesson:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch lesson",
      },
      { status: 500 }
    );
  }
}
