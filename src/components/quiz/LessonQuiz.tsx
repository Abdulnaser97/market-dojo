import { createSignal, For, Show } from "solid-js";
import type { LessonQuiz } from "~/db/quiz-data";

interface LessonQuizProps {
  quiz: LessonQuiz;
  onComplete?: (score: number) => void;
}

export default function LessonQuiz(props: LessonQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = createSignal(0);
  const [selectedAnswer, setSelectedAnswer] = createSignal<number | null>(null);
  const [showExplanation, setShowExplanation] = createSignal(false);
  const [userAnswers, setUserAnswers] = createSignal<number[]>([]);
  const [quizComplete, setQuizComplete] = createSignal(false);


  const currentQuestion = () => props.quiz.questions[currentQuestionIndex()];
  const isLastQuestion = () => currentQuestionIndex() === props.quiz.questions.length - 1;
  const totalQuestions = () => props.quiz.questions.length;
  const isAnswerCorrect = () => selectedAnswer() === currentQuestion().correctAnswer;

  const handleSubmitAnswer = () => {
    if (selectedAnswer() === null) return;

    setShowExplanation(true);
    setUserAnswers([...userAnswers(), selectedAnswer()!]);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion()) {
      // Quiz complete
      const allAnswers = userAnswers();
      const correctCount = allAnswers.filter(
        (answer, idx) => answer === props.quiz.questions[idx].correctAnswer
      ).length;
      const score = Math.round((correctCount / totalQuestions()) * 100);

      console.log("[LessonQuiz] Quiz complete!");
      console.log("[LessonQuiz] User answers:", allAnswers);
      console.log("[LessonQuiz] Correct count:", correctCount);
      console.log("[LessonQuiz] Total questions:", totalQuestions());
      console.log("[LessonQuiz] Final score:", score);
      console.log("[LessonQuiz] Calling onComplete callback...");

      setQuizComplete(true);
      props.onComplete?.(score);
    } else {
      // Reset UI state first, then move to next question
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCurrentQuestionIndex(currentQuestionIndex() + 1);
    }
  };

  const calculateFinalScore = () => {
    const correctCount = userAnswers().filter(
      (answer, idx) => answer === props.quiz.questions[idx].correctAnswer
    ).length;
    return Math.round((correctCount / totalQuestions()) * 100);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setUserAnswers([]);
    setQuizComplete(false);
  };

  return (
    <div
      style={{
        padding: "2rem",
        "background-color": "var(--color-bg-secondary)",
        "border-radius": "0.75rem",
        border: "1px solid var(--color-border)",
      }}
    >
      <Show
        when={!quizComplete()}
        fallback={
          <div style={{ "text-align": "center" }}>
            {/* Quiz Results */}
            <h3 style={{ "font-size": "1.5rem", "margin-bottom": "1rem" }}>
              Quiz Complete! 🎉
            </h3>
            <div
              style={{
                "font-size": "3rem",
                "font-weight": "700",
                color: calculateFinalScore() >= 70 ? "var(--color-success)" : "var(--color-danger)",
                "margin-bottom": "1rem",
              }}
            >
              {calculateFinalScore()}%
            </div>
            <p style={{ color: "var(--color-text-secondary)", "margin-bottom": "2rem" }}>
              You got {userAnswers().filter((answer, idx) => answer === props.quiz.questions[idx].correctAnswer).length} out of {totalQuestions()} questions correct
            </p>
            <div style={{ display: "flex", gap: "1rem", "justify-content": "center" }}>
              <button
                onClick={resetQuiz}
                style={{
                  padding: "0.75rem 1.5rem",
                  "background-color": "var(--color-bg)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  "border-radius": "0.5rem",
                  "font-weight": "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
              >
                Retake Quiz
              </button>
            </div>
          </div>
        }
      >
        {/* Quiz Header */}
        <div style={{ "margin-bottom": "2rem" }}>
          <div
            style={{
              display: "flex",
              "justify-content": "space-between",
              "align-items": "center",
              "margin-bottom": "1rem",
            }}
          >
            <h3 style={{ "font-size": "1.25rem" }}>Quiz</h3>
            <span style={{ color: "var(--color-text-secondary)", "font-size": "0.875rem" }}>
              Question {currentQuestionIndex() + 1} of {totalQuestions()}
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: "100%",
              height: "0.5rem",
              "background-color": "var(--color-bg)",
              "border-radius": "0.25rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${((currentQuestionIndex() + 1) / totalQuestions()) * 100}%`,
                height: "100%",
                "background-color": "var(--color-primary)",
                transition: "width 0.3s",
              }}
            />
          </div>
        </div>

        {/* Question */}
        <div style={{ "margin-bottom": "2rem" }}>
          <h4
            style={{
              "font-size": "1.125rem",
              "margin-bottom": "1.5rem",
              "line-height": "1.6",
            }}
          >
            {currentQuestion().question}
          </h4>

          {/* Answer Options */}
          <form style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
            <For each={currentQuestion().options}>
              {(option, index) => {
                const isCorrect = index() === currentQuestion().correctAnswer;
                const isSelected = selectedAnswer() === index();
                const shouldHighlight = showExplanation() && (isCorrect || isSelected);

                return (
                  <label
                    style={{
                      display: "flex",
                      "align-items": "center",
                      gap: "0.75rem",
                      padding: "0.75rem",
                      "border-radius": "0.5rem",
                      border: shouldHighlight
                        ? `2px solid ${isCorrect ? "var(--color-success)" : "var(--color-danger)"}`
                        : "2px solid transparent",
                      "background-color": shouldHighlight
                        ? isCorrect ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)"
                        : "transparent",
                      cursor: showExplanation() ? "default" : "pointer",
                      transition: "all 0.2s",
                    }}
                  >
                    <input
                      type="radio"
                      name="quiz-answer"
                      value={index()}
                      checked={selectedAnswer() === index()}
                      onInput={(e) => {
                        if (!showExplanation()) {
                          setSelectedAnswer(Number(e.currentTarget.value));
                        }
                      }}
                      disabled={showExplanation()}
                      style={{ width: "1.25rem", height: "1.25rem" }}
                    />
                    <span style={{
                      color: shouldHighlight
                        ? isCorrect ? "var(--color-success)" : "var(--color-danger)"
                        : "var(--color-text)",
                      "font-weight": shouldHighlight ? "500" : "normal",
                    }}>
                      {option}
                    </span>
                  </label>
                );
              }}
            </For>
          </form>
        </div>

        {/* Feedback Banner */}
        <Show when={showExplanation()}>
          <div
            style={{
              padding: "1rem",
              "background-color": isAnswerCorrect()
                ? "rgba(34, 197, 94, 0.15)"
                : "rgba(239, 68, 68, 0.15)",
              border: `2px solid ${isAnswerCorrect() ? "var(--color-success)" : "var(--color-danger)"}`,
              "border-radius": "0.5rem",
              "margin-bottom": "1rem",
              display: "flex",
              "align-items": "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                "font-size": "1.5rem",
                "line-height": "1",
              }}
            >
              {isAnswerCorrect() ? "✓" : "✗"}
            </div>
            <div>
              <div
                style={{
                  "font-weight": "600",
                  "font-size": "1.125rem",
                  color: isAnswerCorrect() ? "var(--color-success)" : "var(--color-danger)",
                }}
              >
                {isAnswerCorrect() ? "Correct!" : "Incorrect"}
              </div>
              <div
                style={{
                  "font-size": "0.875rem",
                  color: "var(--color-text-secondary)",
                  "margin-top": "0.25rem",
                }}
              >
                {isAnswerCorrect()
                  ? "Great job! You got it right."
                  : "Don't worry, review the explanation below."}
              </div>
            </div>
          </div>
        </Show>

        {/* Explanation */}
        <Show when={showExplanation()}>
          <div
            style={{
              padding: "1rem",
              "background-color": "var(--color-bg)",
              "border-radius": "0.5rem",
              "margin-bottom": "1.5rem",
              border: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", "align-items": "flex-start" }}>
              <svg
                style={{
                  width: "1.25rem",
                  height: "1.25rem",
                  "flex-shrink": "0",
                  "margin-top": "0.125rem",
                }}
                fill="none"
                stroke="var(--color-primary)"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div style={{ "font-weight": "500", "margin-bottom": "0.25rem" }}>Explanation</div>
                <div style={{ color: "var(--color-text-secondary)", "font-size": "0.875rem" }}>
                  {currentQuestion().explanation}
                </div>
              </div>
            </div>
          </div>
        </Show>

        {/* Action Button */}
        <Show
          when={!showExplanation()}
          fallback={
            <button
              onClick={handleNextQuestion}
              style={{
                width: "100%",
                padding: "0.75rem",
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
              {isLastQuestion() ? "Finish Quiz" : "Next Question"}
            </button>
          }
        >
          <button
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer() === null}
            style={{
              width: "100%",
              padding: "0.75rem",
              "background-color": selectedAnswer() !== null ? "var(--color-primary)" : "var(--color-bg)",
              color: selectedAnswer() !== null ? "white" : "var(--color-text-secondary)",
              border: "1px solid var(--color-border)",
              "border-radius": "0.5rem",
              "font-weight": "500",
              cursor: selectedAnswer() !== null ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              if (selectedAnswer() !== null) {
                e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedAnswer() !== null) {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }
            }}
          >
            Submit Answer
          </button>
        </Show>
      </Show>
    </div>
  );
}
