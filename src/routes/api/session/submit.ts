import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext, getSession } from "~/lib/auth";
import { sessionResults, patternMastery } from "~/db/schema";
import { eq, and } from "drizzle-orm";

export interface PatternResult {
  patternName: string;
  correct: boolean;
  timeTaken: number;
}

export interface SubmitSessionRequest {
  sessionId: string;
  score: number;
  accuracy: number;
  duration: number;
  maxStreak: number;
  patternResults: PatternResult[];
}

/**
 * POST /api/session/submit
 *
 * Submit final session results and update pattern mastery
 * - Requires authentication
 * - Updates session_results record with final stats
 * - Updates pattern_mastery for each pattern tested
 * - Applies adaptive weight adjustments
 */
export async function POST({ request }: APIEvent) {
  console.log("[API] POST /api/session/submit called");
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

    // Parse request body
    const body = (await request.json()) as SubmitSessionRequest;
    const { sessionId, score, accuracy, duration, maxStreak, patternResults } = body;

    console.log("[API] Session ID:", sessionId);
    console.log("[API] Final score:", score);
    console.log("[API] Accuracy:", accuracy);
    console.log("[API] Pattern results:", patternResults?.length || 0, "patterns");

    // Validate required fields
    if (!sessionId || typeof score !== "number" || typeof accuracy !== "number") {
      console.log("[API] Error: Missing or invalid fields");
      return json(
        {
          success: false,
          error: "Invalid session data",
        },
        { status: 400 }
      );
    }

    const db = getDbFromContext();

    // Update session results
    console.log("[API] Updating session results...");
    await db
      .update(sessionResults)
      .set({
        score,
        accuracy,
        patternsTestedCount: patternResults?.length || 0,
        duration: duration || 0,
        maxStreak: maxStreak || 0,
      })
      .where(
        and(
          eq(sessionResults.id, sessionId),
          eq(sessionResults.userId, session.user.id)
        )
      );
    console.log("[API] Session results updated");

    // Update pattern mastery for each pattern tested
    if (patternResults && Array.isArray(patternResults)) {
      console.log("[API] Updating pattern mastery...");
      const now = new Date();

      for (const result of patternResults as PatternResult[]) {
        const { patternName, correct } = result;
        console.log(`[API] Processing pattern: ${patternName} (${correct ? "correct" : "incorrect"})`);

        // Check if mastery record exists
        const existing = await db.query.patternMastery.findFirst({
          where: and(
            eq(patternMastery.userId, session.user.id),
            eq(patternMastery.patternName, patternName)
          ),
        });

        if (existing) {
          // Update existing mastery record
          const newCorrectCount = existing.correctCount + (correct ? 1 : 0);
          const newIncorrectCount = existing.incorrectCount + (correct ? 0 : 1);
          const totalAttempts = newCorrectCount + newIncorrectCount;
          const newAccuracy = totalAttempts > 0 ? newCorrectCount / totalAttempts : 0;

          // Adaptive weight adjustment
          // Correct: decrease weight (user knows this pattern)
          // Incorrect: increase weight (needs more practice)
          let newWeight = existing.weight;
          if (correct) {
            newWeight = Math.max(0.5, existing.weight * 0.9); // Decrease by 10%, min 0.5
          } else {
            newWeight = Math.min(2.0, existing.weight * 1.2); // Increase by 20%, max 2.0
          }

          console.log(`[API]   Updating: accuracy ${(existing.accuracy * 100).toFixed(1)}% → ${(newAccuracy * 100).toFixed(1)}%, weight ${existing.weight.toFixed(2)} → ${newWeight.toFixed(2)}`);

          await db
            .update(patternMastery)
            .set({
              correctCount: newCorrectCount,
              incorrectCount: newIncorrectCount,
              accuracy: newAccuracy,
              weight: newWeight,
              lastSeen: now,
            })
            .where(
              and(
                eq(patternMastery.userId, session.user.id),
                eq(patternMastery.patternName, patternName)
              )
            );
        } else {
          // Create new mastery record
          const newAccuracy = correct ? 1.0 : 0.0;
          const initialWeight = correct ? 0.9 : 1.2; // Start based on first attempt

          console.log(`[API]   Creating new record: accuracy ${(newAccuracy * 100).toFixed(1)}%, weight ${initialWeight.toFixed(2)}`);

          await db.insert(patternMastery).values({
            userId: session.user.id,
            patternName,
            correctCount: correct ? 1 : 0,
            incorrectCount: correct ? 0 : 1,
            accuracy: newAccuracy,
            weight: initialWeight,
            lastSeen: now,
          });
        }
      }
      console.log("[API] Pattern mastery updated");
    }

    // Fetch updated mastery data to return
    const updatedMastery = await db.query.patternMastery.findMany({
      where: eq(patternMastery.userId, session.user.id),
    });

    const response = {
      success: true,
      sessionId,
      mastery: updatedMastery,
    };

    console.log("[API] Returning success response");
    return json(response);
  } catch (error) {
    console.error("[API] Error submitting session:", error);
    return json(
      {
        success: false,
        error: "Failed to submit session results",
      },
      { status: 500 }
    );
  }
}
