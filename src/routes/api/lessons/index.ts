import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext } from "~/lib/auth";
import { lessons } from "~/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/lessons
 *
 * Fetch all lessons with optional category filter
 * Query params:
 *  - category: Filter by category (basics, patterns, psychology, risk)
 */
export async function GET({ request }: APIEvent) {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get("category");

    const db = getDbFromContext();

    let query;
    if (category) {
      // Filter by category
      query = db
        .select()
        .from(lessons)
        .where(eq(lessons.category, category as any))
        .orderBy(lessons.order);
    } else {
      // Get all lessons
      query = db.select().from(lessons).orderBy(lessons.order);
    }

    const allLessons = await query;

    // Group lessons by category for easier consumption
    const grouped = allLessons.reduce(
      (acc, lesson) => {
        if (!acc[lesson.category]) {
          acc[lesson.category] = [];
        }
        acc[lesson.category].push(lesson);
        return acc;
      },
      {} as Record<string, typeof allLessons>
    );

    return json({
      success: true,
      lessons: allLessons,
      grouped,
      total: allLessons.length,
    });
  } catch (error) {
    console.error("[API] Error fetching lessons:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch lessons",
      },
      { status: 500 }
    );
  }
}
