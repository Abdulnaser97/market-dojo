/**
 * QuizDialog - Modal dialog for pattern recognition quizzes
 * Displays question, multiple choice answers, timer, and feedback
 */

import { Show } from "solid-js";

export interface QuizOption {
  label: string;
  value: string;
}

export interface QuizDialogProps {
  isOpen?: boolean;
  question?: string;
  options?: QuizOption[];
  timeRemaining?: number;
  totalTime?: number;
  selectedAnswer?: string;
  correctAnswer?: string;
  explanation?: string;
  showExplanation?: boolean;
  debugMode?: boolean;
  onSelectAnswer?: (value: string) => void;
  onClose?: () => void;
}

export default function QuizDialog(props: QuizDialogProps) {
  const isOpen = () => props.isOpen ?? false;
  const question = () => props.question ?? "What pattern is forming here?";
  const options = () =>
    props.options ?? [
      { label: "A", value: "Doji" },
      { label: "B", value: "Hammer" },
      { label: "C", value: "Engulfing" },
      { label: "D", value: "Shooting Star" },
    ];
  const timeRemaining = () => props.timeRemaining ?? 15;
  const totalTime = () => props.totalTime ?? 15;
  const selectedAnswer = () => props.selectedAnswer;
  const correctAnswer = () => props.correctAnswer;
  const explanation = () =>
    props.explanation ??
    "This is an example explanation that would describe why the answer is correct.";
  const showExplanation = () => props.showExplanation ?? false;

  const timePercentage = () => (timeRemaining() / totalTime()) * 100;
  const isCorrect = () =>
    selectedAnswer() && selectedAnswer() === correctAnswer();
  const isIncorrect = () =>
    selectedAnswer() && selectedAnswer() !== correctAnswer();

  return (
    <Show when={isOpen()}>
      {/* Container - no overlay, PatternHighlight provides the vignette */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          display: "flex",
          "align-items": "center",
          "justify-content": "flex-start",
          "z-index": "1000",
          padding: "2rem",
          "pointer-events": "none", // Let clicks pass through to pattern highlight
        }}
      >
        {/* Dialog - Left Aligned */}
        <div
          style={{
            "background-color": "#1a1a1d", // Solid dark background
            border: "3px solid #6366f1", // Indigo border to match highlight
            "border-radius": "0.75rem",
            width: "450px",
            "max-width": "100%",
            padding: "2rem",
            "box-shadow": "0 0 40px rgba(99, 102, 241, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            "max-height": "calc(100vh - 4rem)",
            overflow: "auto",
            "pointer-events": "auto", // Re-enable pointer events for the dialog itself
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Timer Bar */}
          <div
            style={{
              height: "4px",
              "background-color": "var(--color-bg-secondary)",
              "border-radius": "2px",
              "margin-bottom": "1.5rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${timePercentage()}%`,
                "background-color":
                  timePercentage() > 50
                    ? "var(--color-success)"
                    : timePercentage() > 20
                      ? "var(--color-warning)"
                      : "var(--color-danger)",
                transition: "width 1s linear, background-color 0.3s",
              }}
            />
          </div>

          {/* Timer Display */}
          <div
            style={{
              "text-align": "center",
              "margin-bottom": "1.5rem",
            }}
          >
            <div
              style={{
                "font-size": "2rem",
                "font-weight": "bold",
                color:
                  timePercentage() > 50
                    ? "var(--color-success)"
                    : timePercentage() > 20
                      ? "var(--color-warning)"
                      : "var(--color-danger)",
                "font-variant-numeric": "tabular-nums",
              }}
            >
              {timeRemaining()}s
            </div>
            {props.debugMode && (
              <div
                style={{
                  "font-size": "0.75rem",
                  "margin-top": "0.5rem",
                  color: "var(--color-warning)",
                  "font-weight": "600",
                }}
              >
                ⏸ TIMER PAUSED (Debug Mode)
              </div>
            )}
          </div>

          {/* Question */}
          <div
            style={{
              "font-size": "1.25rem",
              "font-weight": "600",
              "margin-bottom": "1.5rem",
              "text-align": "center",
              color: "var(--color-text-primary)",
            }}
          >
            {question()}
          </div>

          {/* Answer Options */}
          <div
            style={{
              display: "flex",
              "flex-direction": "column",
              gap: "0.75rem",
              "margin-bottom": showExplanation() ? "1.5rem" : "0",
            }}
          >
            {options().map((option) => {
              const isSelected = selectedAnswer() === option.value;
              const isCorrectOption = correctAnswer() === option.value;
              const showFeedback = showExplanation();

              let backgroundColor = "var(--color-bg-secondary)";
              let borderColor = "var(--color-border)";
              let textColor = "var(--color-text-primary)";

              if (showFeedback) {
                if (isCorrectOption) {
                  backgroundColor = "rgba(34, 197, 94, 0.1)";
                  borderColor = "var(--color-success)";
                  textColor = "var(--color-success)";
                } else if (isSelected) {
                  backgroundColor = "rgba(239, 68, 68, 0.1)";
                  borderColor = "var(--color-danger)";
                  textColor = "var(--color-danger)";
                }
              } else if (isSelected) {
                backgroundColor = "var(--color-primary)";
                borderColor = "var(--color-primary)";
                textColor = "white";
              }

              return (
                <button
                  onClick={() => !showExplanation() && props.onSelectAnswer?.(option.value)}
                  disabled={showExplanation()}
                  style={{
                    padding: "1rem 1.5rem",
                    "border-radius": "0.5rem",
                    border: `2px solid ${borderColor}`,
                    "background-color": backgroundColor,
                    color: textColor,
                    "font-size": "1rem",
                    "font-weight": "600",
                    "text-align": "left",
                    cursor: showExplanation() ? "default" : "pointer",
                    transition: "all 0.2s",
                    display: "flex",
                    "align-items": "center",
                    gap: "1rem",
                  }}
                  onMouseEnter={(e) => {
                    if (!showExplanation() && !isSelected) {
                      e.currentTarget.style.borderColor = "var(--color-primary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!showExplanation() && !isSelected) {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                    }
                  }}
                >
                  <span
                    style={{
                      "font-weight": "bold",
                      "font-size": "1.125rem",
                    }}
                  >
                    {option.label}.
                  </span>
                  <span style={{ flex: "1" }}>{option.value}</span>
                  <Show when={showFeedback && isCorrectOption}>
                    <span style={{ "font-size": "1.25rem" }}>✓</span>
                  </Show>
                  <Show when={showFeedback && isSelected && !isCorrectOption}>
                    <span style={{ "font-size": "1.25rem" }}>✗</span>
                  </Show>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          <Show when={showExplanation()}>
            <div
              style={{
                padding: "1rem",
                "border-radius": "0.5rem",
                "background-color": isCorrect()
                  ? "rgba(34, 197, 94, 0.1)"
                  : "rgba(239, 68, 68, 0.1)",
                border: isCorrect()
                  ? "1px solid var(--color-success)"
                  : "1px solid var(--color-danger)",
              }}
            >
              <div
                style={{
                  "font-weight": "600",
                  "margin-bottom": "0.5rem",
                  color: isCorrect() ? "var(--color-success)" : "var(--color-danger)",
                }}
              >
                {isCorrect() ? "✓ Correct!" : "✗ Incorrect"}
              </div>
              <div
                style={{
                  color: "var(--color-text-secondary)",
                  "line-height": "1.5",
                }}
              >
                {explanation()}
              </div>
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
}
