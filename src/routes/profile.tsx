import { Title } from "@solidjs/meta";
import { query, createAsync, useNavigate, revalidate } from "@solidjs/router";
import { Show, createEffect } from "solid-js";
import Nav from "~/components/layout/Nav";
import { getSession } from "~/lib/auth";

const getUserSession = query(async () => {
  "use server";
  return await getSession();
}, "user-session");

interface ProfileStats {
  lessonsCompleted: number;
  totalLessons: number;
  quizSessions: number;
  averageAccuracy: number;
}

const getUserStats = query(async (): Promise<ProfileStats> => {
  "use server";
  console.log("[getUserStats] Cache function called");

  const session = await getSession();
  console.log("[getUserStats] Session:", session ? "Found" : "Not found");

  if (!session || !session.user) {
    console.log("[getUserStats] No session, returning empty stats");
    return {
      lessonsCompleted: 0,
      totalLessons: 0,
      quizSessions: 0,
      averageAccuracy: 0,
    };
  }

  const { getDbFromContext } = await import("~/lib/auth");
  const schemaModule = await import("~/db/schema");
  const { lessonProgress, lessons, sessionResults } = schemaModule;
  type LessonProgress = typeof schemaModule.lessonProgress.$inferSelect;
  const { eq, count } = await import("drizzle-orm");

  const db = getDbFromContext();

  // Get total lessons count
  const [totalLessonsResult] = await db
    .select({ count: count() })
    .from(lessons);
  const totalLessons = totalLessonsResult.count;
  console.log("[getUserStats] Total lessons:", totalLessons);

  // Get completed lessons count
  const completedLessons = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, session.user.id),
  });
  const lessonsCompleted = completedLessons.filter((p: LessonProgress) => p.completed).length;
  console.log("[getUserStats] Completed lessons:", lessonsCompleted);

  // Get quiz sessions count (from session_results table)
  const quizSessions = await db.query.sessionResults.findMany({
    where: eq(sessionResults.userId, session.user.id),
  });
  const quizSessionsCount = quizSessions.length;
  console.log("[getUserStats] Quiz sessions:", quizSessionsCount);

  // Calculate average accuracy from completed lessons
  const scoresWithValues = completedLessons.filter((p: LessonProgress) => p.score !== null && p.completed);
  const averageAccuracy = scoresWithValues.length > 0
    ? Math.round(scoresWithValues.reduce((sum: number, p: LessonProgress) => sum + (p.score || 0), 0) / scoresWithValues.length)
    : 0;
  console.log("[getUserStats] Average accuracy:", averageAccuracy);

  const stats = {
    lessonsCompleted,
    totalLessons,
    quizSessions: quizSessionsCount,
    averageAccuracy,
  };
  console.log("[getUserStats] Returning stats:", stats);

  return stats;
}, "user-stats");

export default function Profile() {
  const navigate = useNavigate();
  const session = createAsync(() => getUserSession());
  const stats = createAsync(() => getUserStats());

  // Redirect if not authenticated
  createEffect(() => {
    const sessionData = session();
    if (sessionData === null) {
      navigate("/login", { replace: true });
    }
  });

  const user = () => session()?.user;

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      revalidate("nav-user-session");
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <main>
      <Title>Profile - MarketDojo</Title>
      <Nav />

      <div
        style={{
          "max-width": "800px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <h1 style={{ "margin-bottom": "2rem" }}>Your Profile</h1>

        <Show when={user()} fallback={<div>Loading...</div>}>
          {(userData) => (
            <div
              style={{
                "background-color": "var(--color-bg-secondary)",
                "border-radius": "0.75rem",
                border: "1px solid var(--color-border)",
                padding: "2rem",
              }}
            >
              <div style={{ "margin-bottom": "2rem" }}>
                <h2 style={{ "margin-bottom": "1rem", "font-size": "1.5rem" }}>
                  Account Information
                </h2>

                <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        "font-weight": "600",
                        "margin-bottom": "0.25rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Email
                    </label>
                    <div style={{ "font-size": "1.125rem" }}>{userData().email}</div>
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        "font-weight": "600",
                        "margin-bottom": "0.25rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      User ID
                    </label>
                    <div
                      style={{
                        "font-size": "0.875rem",
                        "font-family": "var(--font-mono)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      {userData().id}
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  "padding-top": "2rem",
                  "border-top": "1px solid var(--color-border)",
                }}
              >
                <h2 style={{ "margin-bottom": "1rem", "font-size": "1.5rem" }}>
                  Progress Stats
                </h2>

                <div
                  style={{
                    display: "grid",
                    "grid-template-columns": "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      padding: "1.5rem",
                      "background-color": "var(--color-bg)",
                      "border-radius": "0.5rem",
                      "text-align": "center",
                    }}
                  >
                    <div
                      style={{
                        "font-size": "2rem",
                        "font-weight": "700",
                        color: "var(--color-primary)",
                      }}
                    >
                      {stats()?.lessonsCompleted || 0} / {stats()?.totalLessons || 0}
                    </div>
                    <div
                      style={{
                        "margin-top": "0.5rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Lessons Completed
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1.5rem",
                      "background-color": "var(--color-bg)",
                      "border-radius": "0.5rem",
                      "text-align": "center",
                      opacity: "0.6",
                    }}
                  >
                    <div
                      style={{
                        "font-size": "2rem",
                        "font-weight": "700",
                        color: "var(--color-success)",
                      }}
                    >
                      {stats()?.quizSessions || 0}
                    </div>
                    <div
                      style={{
                        "margin-top": "0.5rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Game Sessions
                    </div>
                    <div
                      style={{
                        "margin-top": "0.25rem",
                        "font-size": "0.75rem",
                        color: "var(--color-text-secondary)",
                        "font-style": "italic",
                      }}
                    >
                      (Coming Soon)
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "1.5rem",
                      "background-color": "var(--color-bg)",
                      "border-radius": "0.5rem",
                      "text-align": "center",
                    }}
                  >
                    <div
                      style={{
                        "font-size": "2rem",
                        "font-weight": "700",
                        color: "var(--color-text)",
                      }}
                    >
                      {stats()?.averageAccuracy || 0}%
                    </div>
                    <div
                      style={{
                        "margin-top": "0.5rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Accuracy
                    </div>
                  </div>
                </div>

                <p
                  style={{
                    "margin-top": "1rem",
                    color: "var(--color-text-secondary)",
                    "font-size": "0.875rem",
                  }}
                >
                  Start learning and taking quizzes to track your progress!
                </p>
              </div>

              <div
                style={{
                  "margin-top": "2rem",
                  "padding-top": "2rem",
                  "border-top": "1px solid var(--color-border)",
                }}
              >
                <button
                  onClick={handleSignOut}
                  style={{
                    padding: "0.75rem 1.5rem",
                    "background-color": "var(--color-danger)",
                    color: "white",
                    border: "none",
                    "border-radius": "0.5rem",
                    "font-size": "1rem",
                    "font-weight": "600",
                    cursor: "pointer",
                  }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </Show>
      </div>
    </main>
  );
}
