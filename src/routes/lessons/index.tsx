import { Title } from "@solidjs/meta";
import { createAsync, cache, A, useSearchParams } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import { getSession } from "~/lib/auth";
import Nav from "~/components/layout/Nav";

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

interface LessonsResponse {
  success: boolean;
  lessons: Lesson[];
  grouped: Record<string, Lesson[]>;
  total: number;
}

const getLessons = cache(async (category?: string) => {
  "use server";
  const url = category
    ? `http://localhost:3000/api/lessons?category=${category}`
    : "http://localhost:3000/api/lessons";

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch lessons");
  }
  return (await response.json()) as LessonsResponse;
}, "lessons-data");

const getUserSession = cache(async () => {
  "use server";
  return await getSession();
}, "lessons-user-session");

export default function Lessons() {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = createAsync(() => getUserSession());

  const selectedCategory = createMemo(() => searchParams.category as string | undefined);

  const lessonsData = createAsync(() => getLessons(selectedCategory()));

  const handleCategoryChange = (category: string | undefined) => {
    if (category) {
      setSearchParams({ category });
    } else {
      setSearchParams({ category: null });
    }
  };

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

  return (
    <main>
      <Title>Trading Lessons - MarketDojo</Title>
      <Nav />

      <div
        style={{
          "max-width": "1200px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ "margin-bottom": "2rem" }}>
          <h1 style={{ "margin-bottom": "0.5rem" }}>Trading Lessons</h1>
          <p
            style={{
              "font-size": "1.125rem",
              color: "var(--color-text-secondary)",
            }}
          >
            Learn technical analysis and candlestick patterns through interactive lessons
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ "margin-bottom": "2rem" }}>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              "flex-wrap": "wrap",
              "align-items": "center",
            }}
          >
            <span
              style={{
                "font-size": "0.875rem",
                "font-weight": "500",
                color: "var(--color-text-secondary)",
              }}
            >
              Filter:
            </span>
            <button
              onClick={() => handleCategoryChange(undefined)}
              style={{
                padding: "0.5rem 1rem",
                "background-color": !selectedCategory()
                  ? "var(--color-primary)"
                  : "var(--color-bg-secondary)",
                color: !selectedCategory() ? "white" : "var(--color-text)",
                border: `1px solid ${!selectedCategory() ? "var(--color-primary)" : "var(--color-border)"}`,
                "border-radius": "0.5rem",
                "font-size": "0.875rem",
                "font-weight": "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = !selectedCategory() ? "var(--color-primary)" : "var(--color-border)";
              }}
            >
              All Lessons
            </button>
            <button
              onClick={() => handleCategoryChange("basics")}
              style={{
                padding: "0.5rem 1rem",
                "background-color":
                  selectedCategory() === "basics" ? "#10b981" : "var(--color-bg-secondary)",
                color: selectedCategory() === "basics" ? "white" : "var(--color-text)",
                border: `1px solid ${selectedCategory() === "basics" ? "#10b981" : "var(--color-border)"}`,
                "border-radius": "0.5rem",
                "font-size": "0.875rem",
                "font-weight": "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#10b981";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedCategory() === "basics" ? "#10b981" : "var(--color-border)";
              }}
            >
              Basics
            </button>
            <button
              onClick={() => handleCategoryChange("patterns")}
              style={{
                padding: "0.5rem 1rem",
                "background-color":
                  selectedCategory() === "patterns" ? "#3b82f6" : "var(--color-bg-secondary)",
                color: selectedCategory() === "patterns" ? "white" : "var(--color-text)",
                border: `1px solid ${selectedCategory() === "patterns" ? "#3b82f6" : "var(--color-border)"}`,
                "border-radius": "0.5rem",
                "font-size": "0.875rem",
                "font-weight": "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#3b82f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedCategory() === "patterns" ? "#3b82f6" : "var(--color-border)";
              }}
            >
              Patterns
            </button>
            <button
              onClick={() => handleCategoryChange("psychology")}
              style={{
                padding: "0.5rem 1rem",
                "background-color":
                  selectedCategory() === "psychology" ? "#8b5cf6" : "var(--color-bg-secondary)",
                color: selectedCategory() === "psychology" ? "white" : "var(--color-text)",
                border: `1px solid ${selectedCategory() === "psychology" ? "#8b5cf6" : "var(--color-border)"}`,
                "border-radius": "0.5rem",
                "font-size": "0.875rem",
                "font-weight": "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#8b5cf6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedCategory() === "psychology" ? "#8b5cf6" : "var(--color-border)";
              }}
            >
              Psychology
            </button>
            <button
              onClick={() => handleCategoryChange("risk")}
              style={{
                padding: "0.5rem 1rem",
                "background-color":
                  selectedCategory() === "risk" ? "#f59e0b" : "var(--color-bg-secondary)",
                color: selectedCategory() === "risk" ? "white" : "var(--color-text)",
                border: `1px solid ${selectedCategory() === "risk" ? "#f59e0b" : "var(--color-border)"}`,
                "border-radius": "0.5rem",
                "font-size": "0.875rem",
                "font-weight": "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f59e0b";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = selectedCategory() === "risk" ? "#f59e0b" : "var(--color-border)";
              }}
            >
              Risk Management
            </button>
          </div>
        </div>

        {/* Lessons Grid */}
        <Show
          when={lessonsData()}
          fallback={
            <div style={{ "text-align": "center", padding: "3rem" }}>
              <p style={{ color: "var(--color-text-secondary)" }}>Loading lessons...</p>
            </div>
          }
        >
          <Show
            when={lessonsData()!.lessons.length > 0}
            fallback={
              <div style={{ "text-align": "center", padding: "3rem" }}>
                <p style={{ color: "var(--color-text-secondary)" }}>No lessons found in this category.</p>
              </div>
            }
          >
            <p
              style={{
                "font-size": "0.875rem",
                color: "var(--color-text-secondary)",
                "margin-bottom": "1rem",
              }}
            >
              Showing {lessonsData()!.lessons.length} lesson{lessonsData()!.lessons.length !== 1 ? "s" : ""}
            </p>
            <div
              style={{
                display: "grid",
                "grid-template-columns": "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              <For each={lessonsData()!.lessons}>
                {(lesson) => (
                  <A
                    href={`/lessons/${lesson.slug}`}
                    style={{
                      padding: "1.5rem",
                      "background-color": "var(--color-bg-secondary)",
                      "border-radius": "0.75rem",
                      border: "1px solid var(--color-border)",
                      "text-decoration": "none",
                      display: "flex",
                      "flex-direction": "column",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = getCategoryColor(lesson.category);
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Category & Difficulty */}
                    <div
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        "margin-bottom": "1rem",
                      }}
                    >
                      <span
                        style={{
                          "font-size": "0.75rem",
                          "font-weight": "600",
                          padding: "0.25rem 0.75rem",
                          "background-color": getCategoryColor(lesson.category) + "20",
                          color: getCategoryColor(lesson.category),
                          "border-radius": "0.375rem",
                          "text-transform": "capitalize",
                        }}
                      >
                        {lesson.category}
                      </span>
                      <div style={{ display: "flex", gap: "0.125rem", "align-items": "flex-end", height: "1rem" }}>
                        <For each={Array(5)}>
                          {(_, i) => (
                            <div
                              style={{
                                width: "0.25rem",
                                height: `${(i() + 1) * 0.15}rem`,
                                "background-color": i() < lesson.difficulty
                                  ? getCategoryColor(lesson.category)
                                  : "#27272a",
                                "border-radius": "0.125rem",
                                transition: "background-color 0.2s",
                              }}
                            />
                          )}
                        </For>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 style={{ "margin-bottom": "0.75rem", "font-size": "1.125rem" }}>{lesson.title}</h3>

                    {/* Content Preview */}
                    <p
                      style={{
                        color: "var(--color-text-secondary)",
                        "font-size": "0.875rem",
                        "line-height": "1.5",
                        "flex-grow": "1",
                        "margin-bottom": "1rem",
                        overflow: "hidden",
                        display: "-webkit-box",
                        "-webkit-line-clamp": "3",
                        "-webkit-box-orient": "vertical",
                      }}
                    >
                      {lesson.content
                        .split("\n")
                        .find((line) => line.trim() && !line.startsWith("#"))
                        ?.trim() || "Learn more about this topic..."}
                    </p>

                    {/* Footer */}
                    <div
                      style={{
                        display: "flex",
                        "justify-content": "space-between",
                        "align-items": "center",
                        "padding-top": "1rem",
                        "border-top": "1px solid var(--color-border)",
                        "font-size": "0.875rem",
                      }}
                    >
                      <span style={{ color: "var(--color-text-secondary)" }}>Lesson #{lesson.order}</span>
                      <span
                        style={{
                          color: getCategoryColor(lesson.category),
                          "font-weight": "500",
                          display: "flex",
                          "align-items": "center",
                          gap: "0.25rem",
                        }}
                      >
                        Start Learning
                        <svg
                          style={{ width: "1rem", height: "1rem" }}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </A>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </main>
  );
}
