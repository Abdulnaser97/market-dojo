import { Title } from "@solidjs/meta";
import { createAsync, cache, A, useParams, useNavigate } from "@solidjs/router";
import { Show, createMemo, For } from "solid-js";
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

const getLesson = cache(async (slug: string) => {
  "use server";
  const response = await fetch(`http://localhost:3000/api/lessons/${slug}`);
  if (!response.ok) {
    throw new Error("Failed to fetch lesson");
  }
  return (await response.json()) as LessonResponse;
}, "lesson-detail");

const getAllLessons = cache(async () => {
  "use server";
  const response = await fetch("http://localhost:3000/api/lessons");
  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }
  return (await response.json()) as LessonsResponse;
}, "all-lessons-nav");

const getUserSession = cache(async () => {
  "use server";
  return await getSession();
}, "lesson-detail-session");

export default function LessonDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const session = createAsync(() => getUserSession());

  const lessonData = createAsync(() => getLesson(params.slug));
  const allLessonsData = createAsync(() => getAllLessons());

  const lesson = createMemo(() => lessonData()?.lesson);
  const allLessons = createMemo(() => allLessonsData()?.lessons || []);
  const lessonQuiz = createMemo(() => {
    const currentLesson = lesson();
    return currentLesson ? getQuizForLesson(currentLesson.id) : undefined;
  });

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
                  <LessonQuiz
                    quiz={quiz()}
                    onComplete={(score) => {
                      console.log("Quiz completed with score:", score);
                      // TODO: Save score to database in Phase 3.5
                    }}
                  />
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
