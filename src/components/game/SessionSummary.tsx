/**
 * SessionSummary - End-of-session statistics and results
 * Shows final score, accuracy, patterns tested, and mastery changes
 */

import { For, Show } from "solid-js";
import { A } from "@solidjs/router";

export interface PatternStats {
  name: string;
  correct: number;
  total: number;
}

export interface MasteryChange {
  pattern: string;
  before: number;
  after: number;
}

export interface SessionSummaryProps {
  isOpen?: boolean;
  finalScore?: number;
  totalQuestions?: number;
  correctAnswers?: number;
  patternsTesteed?: PatternStats[];
  masteryChanges?: MasteryChange[];
  duration?: string;
  onPlayAgain?: () => void;
}

export default function SessionSummary(props: SessionSummaryProps) {
  const isOpen = () => props.isOpen ?? false;
  const finalScore = () => props.finalScore ?? 0;
  const totalQuestions = () => props.totalQuestions ?? 0;
  const correctAnswers = () => props.correctAnswers ?? 0;
  const accuracy = () =>
    totalQuestions() > 0
      ? Math.round((correctAnswers() / totalQuestions()) * 100)
      : 0;
  const patternsTesteed = () =>
    props.patternsTesteed ?? [
      { name: "Doji", correct: 3, total: 5 },
      { name: "Hammer", correct: 2, total: 3 },
      { name: "Engulfing", correct: 4, total: 4 },
    ];
  const masteryChanges = () =>
    props.masteryChanges ?? [
      { pattern: "Doji", before: 65, after: 70 },
      { pattern: "Hammer", before: 45, after: 52 },
      { pattern: "Engulfing", before: 80, after: 85 },
    ];
  const duration = () => props.duration ?? "05:32";

  const getAccuracyColor = () => {
    const acc = accuracy();
    if (acc >= 80) return "var(--color-success)";
    if (acc >= 60) return "var(--color-warning)";
    return "var(--color-danger)";
  };

  return (
    <Show when={isOpen()}>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          "background-color": "rgba(0, 0, 0, 0.85)",
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "z-index": "1000",
          padding: "1rem",
          overflow: "auto",
        }}
      >
        {/* Summary Panel */}
        <div
          style={{
            "background-color": "var(--color-bg-primary)",
            border: "2px solid var(--color-border)",
            "border-radius": "1rem",
            "max-width": "700px",
            width: "100%",
            padding: "2.5rem",
            "box-shadow": "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            "max-height": "90vh",
            overflow: "auto",
          }}
        >
          {/* Header */}
          <div style={{ "text-align": "center", "margin-bottom": "2rem" }}>
            <h1
              style={{
                "font-size": "2.5rem",
                "font-weight": "bold",
                "margin-bottom": "0.5rem",
                color: "var(--color-text-primary)",
              }}
            >
              Session Complete!
            </h1>
            <p
              style={{
                color: "var(--color-text-secondary)",
                "font-size": "1rem",
              }}
            >
              Duration: {duration()}
            </p>
          </div>

          {/* Score Card */}
          <div
            style={{
              "background-color": "var(--color-bg-secondary)",
              "border-radius": "0.75rem",
              padding: "2rem",
              "margin-bottom": "2rem",
              "text-align": "center",
            }}
          >
            <div
              style={{
                "font-size": "3rem",
                "font-weight": "bold",
                color: "var(--color-primary)",
                "margin-bottom": "0.5rem",
              }}
            >
              {finalScore().toLocaleString()}
            </div>
            <div
              style={{
                "font-size": "0.875rem",
                color: "var(--color-text-secondary)",
                "text-transform": "uppercase",
                "letter-spacing": "0.1em",
              }}
            >
              Final Score
            </div>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: "grid",
              "grid-template-columns": "repeat(2, 1fr)",
              gap: "1rem",
              "margin-bottom": "2rem",
            }}
          >
            <div
              style={{
                "background-color": "var(--color-bg-secondary)",
                "border-radius": "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  "font-size": "2rem",
                  "font-weight": "bold",
                  color: getAccuracyColor(),
                  "margin-bottom": "0.25rem",
                }}
              >
                {accuracy()}%
              </div>
              <div
                style={{
                  "font-size": "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Accuracy
              </div>
            </div>

            <div
              style={{
                "background-color": "var(--color-bg-secondary)",
                "border-radius": "0.5rem",
                padding: "1.5rem",
              }}
            >
              <div
                style={{
                  "font-size": "2rem",
                  "font-weight": "bold",
                  color: "var(--color-text-primary)",
                  "margin-bottom": "0.25rem",
                }}
              >
                {correctAnswers()}/{totalQuestions()}
              </div>
              <div
                style={{
                  "font-size": "0.875rem",
                  color: "var(--color-text-secondary)",
                }}
              >
                Questions Correct
              </div>
            </div>
          </div>

          {/* Patterns Tested */}
          <div style={{ "margin-bottom": "2rem" }}>
            <h3
              style={{
                "font-size": "1.125rem",
                "font-weight": "600",
                "margin-bottom": "1rem",
                color: "var(--color-text-primary)",
              }}
            >
              Patterns Tested
            </h3>
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
              <For each={patternsTesteed()}>
                {(pattern) => {
                  const patternAccuracy = Math.round(
                    (pattern.correct / pattern.total) * 100
                  );
                  return (
                    <div
                      style={{
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "space-between",
                        padding: "0.75rem 1rem",
                        "background-color": "var(--color-bg-secondary)",
                        "border-radius": "0.5rem",
                      }}
                    >
                      <div style={{ "font-weight": "500" }}>{pattern.name}</div>
                      <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
                        <div
                          style={{
                            "font-size": "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {pattern.correct}/{pattern.total}
                        </div>
                        <div
                          style={{
                            "font-weight": "600",
                            color:
                              patternAccuracy >= 80
                                ? "var(--color-success)"
                                : patternAccuracy >= 60
                                  ? "var(--color-warning)"
                                  : "var(--color-danger)",
                          }}
                        >
                          {patternAccuracy}%
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          {/* Mastery Changes */}
          <div style={{ "margin-bottom": "2rem" }}>
            <h3
              style={{
                "font-size": "1.125rem",
                "font-weight": "600",
                "margin-bottom": "1rem",
                color: "var(--color-text-primary)",
              }}
            >
              Mastery Level Changes
            </h3>
            <div style={{ display: "flex", "flex-direction": "column", gap: "0.5rem" }}>
              <For each={masteryChanges()}>
                {(change) => {
                  const delta = change.after - change.before;
                  const isPositive = delta > 0;
                  return (
                    <div
                      style={{
                        display: "flex",
                        "align-items": "center",
                        "justify-content": "space-between",
                        padding: "0.75rem 1rem",
                        "background-color": "var(--color-bg-secondary)",
                        "border-radius": "0.5rem",
                      }}
                    >
                      <div style={{ "font-weight": "500" }}>{change.pattern}</div>
                      <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
                        <div
                          style={{
                            "font-size": "0.875rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {change.before}% → {change.after}%
                        </div>
                        <div
                          style={{
                            "font-weight": "600",
                            color: isPositive
                              ? "var(--color-success)"
                              : "var(--color-danger)",
                            "min-width": "3rem",
                            "text-align": "right",
                          }}
                        >
                          {isPositive ? "+" : ""}
                          {delta}%
                        </div>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>
          </div>

          {/* Actions */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              "flex-wrap": "wrap",
            }}
          >
            <button
              onClick={() => props.onPlayAgain?.()}
              style={{
                flex: "1",
                "min-width": "200px",
                padding: "1rem 2rem",
                "border-radius": "0.5rem",
                border: "none",
                "background-color": "var(--color-primary)",
                color: "white",
                "font-weight": "600",
                "font-size": "1rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              🎮 Play Again
            </button>

            <A
              href="/learn"
              style={{
                flex: "1",
                "min-width": "200px",
                padding: "1rem 2rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-border)",
                "background-color": "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                "font-weight": "600",
                "font-size": "1rem",
                cursor: "pointer",
                transition: "all 0.2s",
                "text-align": "center",
                "text-decoration": "none",
                display: "flex",
                "align-items": "center",
                "justify-content": "center",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              📚 Back to Lessons
            </A>
          </div>
        </div>
      </div>
    </Show>
  );
}
