import { Title } from "@solidjs/meta";
import { createAsync, query, A, useParams, revalidate } from "@solidjs/router";
import { Show, createMemo, For, createSignal } from "solid-js";
import { getSession } from "~/lib/auth";
import Nav from "~/components/layout/Nav";
import LessonQuiz from "~/components/quiz/LessonQuiz";
import { getQuizForLesson } from "~/db/quiz-data";

interface Lesson {
  id: string;
  slug: string;
  title: string;
  content: string;
  category: "basics" | "patterns" | "psychology" | "risk";
  order: number;
  difficulty: number;
  imageUrl: string | null;
  createdAt: string;
}

interface LessonResponse {
  success: boolean;
  lesson: Lesson;
}

interface LessonsResponse {
  success: boolean;
  lessons: Lesson[];
  grouped: Record<string, Lesson[]>;
  total: number;
}

const getLesson = query(async (slug: string) => {
  "use server";
  const response = await fetch(`http://localhost:3000/api/lessons/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch lesson");
  }
  return (await response.json()) as LessonResponse;
}, "lesson-detail");

const getAllLessons = query(async () => {
  "use server";
  const response = await fetch("http://localhost:3000/api/lessons");
  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }
  return (await response.json()) as LessonsResponse;
}, "all-lessons-nav");

const getLessonProgress = query(async (lessonId: string) => {
  "use server";
  console.log("[getLessonProgress] Fetching progress for lesson:", lessonId);

  const session = await getSession();
  if (!session || !session.user) {
    console.log("[getLessonProgress] No session, returning null");
    return null;
  }

  const { getDbFromContext } = await import("~/lib/auth");
  const { lessonProgress } = await import("~/db/schema");
  const { eq, and } = await import("drizzle-orm");

  const db = getDbFromContext();

  const progress = await db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.lessonId, lessonId)
    ),
  });

  console.log("[getLessonProgress] Progress found:", progress ? `Score: ${progress.score}, Completed: ${progress.completed}` : "None");
  return progress;
}, "lesson-progress");

export default function LessonDetail() {
  const params = useParams();

  const lessonData = createAsync(() => getLesson(params.slug));
  const allLessonsData = createAsync(() => getAllLessons());

  const lesson = createMemo(() => lessonData()?.lesson);
  const allLessons = createMemo(() => allLessonsData()?.lessons || []);
  const lessonQuiz = createMemo(() => {
    const currentLesson = lesson();
    return currentLesson ? getQuizForLesson(currentLesson.id) : undefined;
  });

  // Fetch lesson progress - depends on lessonData being loaded first
  const lessonProgress = createAsync(async () => {
    const data = lessonData(); // This creates the dependency on lessonData
    console.log("[LessonDetail] Fetching progress, lesson data:", data?.lesson?.id, data?.lesson?.title);
    if (!data?.lesson) {
      console.log("[LessonDetail] No lesson data yet, returning null");
      return null;
    }
    console.log("[LessonDetail] Calling getLessonProgress for:", data.lesson.id);
    return getLessonProgress(data.lesson.id);
  });

  // Track whether user wants to retake the quiz
  const [isRetakingQuiz, setIsRetakingQuiz] = createSignal(false);

  const prevLesson = createMemo(() => {
    const current = lesson();
    if (!current) return null;
    const sorted = [...allLessons()].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((l) => l.id === current.id);
    return currentIndex > 0 ? sorted[currentIndex - 1] : null;
  });

  const nextLesson = createMemo(() => {
    const current = lesson();
    if (!current) return null;
    const sorted = [...allLessons()].sort((a, b) => a.order - b.order);
    const currentIndex = sorted.findIndex((l) => l.id === current.id);
    return currentIndex < sorted.length - 1 ? sorted[currentIndex + 1] : null;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "basics":
        return "#10b981"; // green
      case "patterns":
        return "#3b82f6"; // blue
      case "psychology":
        return "#8b5cf6"; // purple
      case "risk":
        return "#f59e0b"; // orange
      default:
        return "var(--color-primary)";
    }
  };

  // Simple markdown-to-HTML converter for basic formatting
  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split('\n');
    const htmlLines: string[] = [];
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Skip empty lines (but track them for paragraph breaks)
      if (line.trim() === '') {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        htmlLines.push('');
        continue;
      }

      // Headers (must be before other replacements)
      if (line.match(/^### /)) {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        line = line.replace(/^### (.*)$/, '<h3>$1</h3>');
        htmlLines.push(line);
        continue;
      }
      if (line.match(/^## /)) {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        line = line.replace(/^## (.*)$/, '<h2>$1</h2>');
        htmlLines.push(line);
        continue;
      }
      if (line.match(/^# /)) {
        if (inList) {
          htmlLines.push('</ul>');
          inList = false;
        }
        line = line.replace(/^# (.*)$/, '<h1>$1</h1>');
        htmlLines.push(line);
        continue;
      }

      // List items
      if (line.match(/^[\-\*] /)) {
        if (!inList) {
          htmlLines.push('<ul>');
          inList = true;
        }
        line = line.replace(/^[\-\*] (.*)$/, '<li>$1</li>');
        // Process inline formatting in list items
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');
        htmlLines.push(line);
        continue;
      }

      // Close list if we're in one and hit non-list content
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }

      // Regular paragraph text - process inline formatting
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      line = line.replace(/\*([^*]+)\*/g, '<em>$1</em>');

      // Add as paragraph if not empty
      if (line.trim()) {
        htmlLines.push(`<p>${line}</p>`);
      }
    }

    // Close list if still open
    if (inList) {
      htmlLines.push('</ul>');
    }

    return htmlLines.join('\n');
  };

  return (
    <main>
      <Title>{lesson()?.title || "Loading..."} - MarketDojo</Title>
      <Nav />

      <Show
        when={lesson()}
        fallback={
          <div
            style={{
              "max-width": "1200px",
              margin: "0 auto",
              padding: "2rem",
              "text-align": "center",
            }}
          >
            <p style={{ color: "var(--color-text-secondary)" }}>Loading lesson...</p>
          </div>
        }
      >
        {(currentLesson) => (
          <div
            style={{
              "max-width": "900px",
              margin: "0 auto",
              padding: "2rem",
            }}
          >
            {/* Back to Lessons */}
            <A
              href="/lessons"
              style={{
                display: "inline-flex",
                "align-items": "center",
                gap: "0.5rem",
                color: "var(--color-text-secondary)",
                "text-decoration": "none",
                "font-size": "0.875rem",
                "margin-bottom": "2rem",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--color-text-secondary)";
              }}
            >
              <svg
                style={{ width: "1rem", height: "1rem" }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Lessons
            </A>

            {/* Lesson Header */}
            <div style={{ "margin-bottom": "2rem" }}>
              {/* Category & Difficulty */}
              <div
                style={{
                  display: "flex",
                  "justify-content": "space-between",
                  "align-items": "center",
                  "margin-bottom": "1rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.75rem", "align-items": "center" }}>
                  <span
                    style={{
                      "font-size": "0.75rem",
                      "font-weight": "600",
                      padding: "0.375rem 0.875rem",
                      "background-color": getCategoryColor(currentLesson().category) + "20",
                      color: getCategoryColor(currentLesson().category),
                      "border-radius": "0.375rem",
                      "text-transform": "capitalize",
                    }}
                  >
                    {currentLesson().category}
                  </span>
                  <span
                    style={{
                      "font-size": "0.875rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    Lesson #{currentLesson().order}
                  </span>
                </div>

                {/* Difficulty Bars */}
                <div style={{ display: "flex", gap: "0.125rem", "align-items": "flex-end", height: "1.25rem" }}>
                  <For each={Array(5)}>
                    {(_, i) => (
                      <div
                        style={{
                          width: "0.375rem",
                          height: `${(i() + 1) * 0.2}rem`,
                          "background-color": i() < currentLesson().difficulty
                            ? getCategoryColor(currentLesson().category)
                            : "#27272a",
                          "border-radius": "0.125rem",
                        }}
                      />
                    )}
                  </For>
                  <span
                    style={{
                      "font-size": "0.75rem",
                      color: "var(--color-text-secondary)",
                      "margin-left": "0.5rem",
                    }}
                  >
                    Difficulty: {currentLesson().difficulty}/5
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 style={{ "margin-bottom": "1rem", "font-size": "2.5rem" }}>{currentLesson().title}</h1>
            </div>

            {/* Lesson Content */}
            <article
              style={{
                padding: "2rem",
                "background-color": "var(--color-bg-secondary)",
                "border-radius": "0.75rem",
                border: "1px solid var(--color-border)",
                "line-height": "1.8",
                "margin-bottom": "2rem",
              }}
              class="lesson-content"
              innerHTML={renderMarkdown(currentLesson().content)}
            />

            {/* Quiz Section */}
            <Show when={lessonQuiz()}>
              {(quiz) => (
                <div style={{ "margin-bottom": "2rem" }}>
                  <h2 style={{ "font-size": "1.75rem", "margin-bottom": "1rem" }}>
                    Test Your Knowledge
                  </h2>

                  {/* Show completion summary if quiz was already completed */}
                  <Show
                    when={!lessonProgress()?.completed || isRetakingQuiz()}
                    fallback={
                        <div
                          style={{
                            padding: "2rem",
                            "background-color": "var(--color-bg-secondary)",
                            "border-radius": "0.75rem",
                            border: "1px solid var(--color-border)",
                            "text-align": "center",
                          }}
                        >
                          <div
                            style={{
                              width: "4rem",
                              height: "4rem",
                              "background-color": "var(--color-success)",
                              "border-radius": "50%",
                              display: "flex",
                              "align-items": "center",
                              "justify-content": "center",
                              margin: "0 auto 1rem",
                            }}
                          >
                            <svg
                              style={{
                                width: "2.5rem",
                                height: "2.5rem",
                                color: "white",
                              }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="3"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                          <h3 style={{ "font-size": "1.5rem", "margin-bottom": "0.5rem" }}>
                            Quiz Completed!
                          </h3>
                          <div
                            style={{
                              "font-size": "3rem",
                              "font-weight": "700",
                              color: lessonProgress()?.score && lessonProgress()!.score >= 70 ? "var(--color-success)" : "var(--color-warning)",
                              "margin-bottom": "0.5rem",
                            }}
                          >
                            {lessonProgress()?.score || 0}%
                          </div>
                          <p style={{ color: "var(--color-text-secondary)", "margin-bottom": "2rem" }}>
                            {lessonProgress()?.score && lessonProgress()!.score >= 70
                              ? "Great job! You passed this lesson."
                              : "You completed the quiz. Try retaking it to improve your score!"}
                          </p>
                          <button
                            onClick={() => setIsRetakingQuiz(true)}
                            style={{
                              padding: "0.75rem 1.5rem",
                              "background-color": "var(--color-primary)",
                              color: "white",
                              border: "none",
                              "border-radius": "0.5rem",
                              "font-weight": "500",
                              cursor: "pointer",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--color-primary)";
                            }}
                          >
                            Retake Quiz
                          </button>
                        </div>
                      }
                    >
                      <LessonQuiz
                        quiz={quiz()}
                        onComplete={async (score) => {
                          console.log("[LessonDetail] onComplete callback received!");
                          console.log("[LessonDetail] Score:", score);
                          console.log("[LessonDetail] Lesson slug:", params.slug);

                          try {
                            console.log("[LessonDetail] Sending POST to /api/lessons/" + params.slug + "/complete");
                            const response = await fetch(`/api/lessons/${params.slug}/complete`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({ score }),
                            });

                            console.log("[LessonDetail] Response status:", response.status);
                            const data = await response.json() as { success: boolean; progress?: any; error?: string };
                            console.log("[LessonDetail] Response data:", data);

                            if (data.success) {
                              console.log("[LessonDetail] Progress saved successfully:", data.progress);
                              // Revalidate the progress cache so it updates on the lessons page
                              console.log("[LessonDetail] Revalidating caches...");
                              revalidate("lessons-progress");
                              // Also revalidate user stats for the profile page
                              revalidate("user-stats");
                              // Revalidate lesson progress
                              revalidate("lesson-progress");
                              console.log("[LessonDetail] Caches revalidated!");
                              // Reset retaking state
                              setIsRetakingQuiz(false);
                            } else {
                              console.error("[LessonDetail] Failed to save progress:", data.error);
                            }
                          } catch (error) {
                            console.error("[LessonDetail] Error saving progress:", error);
                          }
                        }}
                      />
                    </Show>
                </div>
              )}
            </Show>

            <style>{`
              .lesson-content h1 {
                font-size: 2rem;
                font-weight: 700;
                margin-top: 2rem;
                margin-bottom: 1rem;
                color: var(--color-text);
              }

              .lesson-content h1:first-child {
                margin-top: 0;
              }

              .lesson-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                margin-top: 2rem;
                margin-bottom: 1rem;
                color: var(--color-text);
                border-bottom: 1px solid var(--color-border);
                padding-bottom: 0.5rem;
              }

              .lesson-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
                color: var(--color-text);
              }

              .lesson-content p {
                margin-bottom: 1rem;
                color: var(--color-text);
              }

              .lesson-content ul {
                margin-bottom: 1rem;
                padding-left: 1.5rem;
                list-style-type: disc;
              }

              .lesson-content li {
                margin-bottom: 0.5rem;
                color: var(--color-text);
              }

              .lesson-content strong {
                font-weight: 600;
                color: var(--color-primary);
              }

              .lesson-content em {
                font-style: italic;
                color: var(--color-text-secondary);
              }

              .lesson-content code {
                background-color: var(--color-bg);
                padding: 0.125rem 0.375rem;
                border-radius: 0.25rem;
                font-family: var(--font-mono);
                font-size: 0.875em;
                color: var(--color-success);
              }
            `}</style>

            {/* Navigation */}
            <div
              style={{
                display: "flex",
                "justify-content": "space-between",
                "align-items": "center",
                gap: "1rem",
                padding: "1.5rem",
                "background-color": "var(--color-bg-secondary)",
                "border-radius": "0.75rem",
                border: "1px solid var(--color-border)",
              }}
            >
              <Show
                when={prevLesson()}
                fallback={
                  <div style={{ flex: "1" }}></div>
                }
              >
                {(prev) => (
                  <A
                    href={`/lessons/${prev().slug}`}
                    style={{
                      flex: "1",
                      display: "flex",
                      "flex-direction": "column",
                      gap: "0.25rem",
                      "text-decoration": "none",
                      padding: "1rem",
                      "border-radius": "0.5rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span
                      style={{
                        "font-size": "0.75rem",
                        color: "var(--color-text-secondary)",
                        "text-transform": "uppercase",
                        "letter-spacing": "0.05em",
                      }}
                    >
                      Previous
                    </span>
                    <span style={{ "font-weight": "500", color: "var(--color-text)" }}>
                      {prev().title}
                    </span>
                  </A>
                )}
              </Show>

              <div
                style={{
                  width: "1px",
                  height: "3rem",
                  "background-color": "var(--color-border)",
                }}
              ></div>

              <Show
                when={nextLesson()}
                fallback={
                  <div style={{ flex: "1" }}></div>
                }
              >
                {(next) => (
                  <A
                    href={`/lessons/${next().slug}`}
                    style={{
                      flex: "1",
                      display: "flex",
                      "flex-direction": "column",
                      gap: "0.25rem",
                      "text-decoration": "none",
                      "text-align": "right",
                      padding: "1rem",
                      "border-radius": "0.5rem",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <span
                      style={{
                        "font-size": "0.75rem",
                        color: "var(--color-text-secondary)",
                        "text-transform": "uppercase",
                        "letter-spacing": "0.05em",
                      }}
                    >
                      Next
                    </span>
                    <span style={{ "font-weight": "500", color: "var(--color-text)" }}>
                      {next().title}
                    </span>
                  </A>
                )}
              </Show>
            </div>
          </div>
        )}
      </Show>
    </main>
  );
}
