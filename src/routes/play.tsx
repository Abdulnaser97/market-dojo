import { Title } from "@solidjs/meta";
import { CandlestickData } from "lightweight-charts";
import { createSignal, onMount, onCleanup } from "solid-js";
import Nav from "~/components/layout/Nav";
import ChartView from "~/components/game/ChartView";
import GameHUD from "~/components/game/GameHUD";
import QuizDialog from "~/components/game/QuizDialog";
import SessionSummary from "~/components/game/SessionSummary";
import type { WorkerMessage, MainThreadMessage, QuizData, ScoreUpdate } from "~/game/simulator.worker";
import type { Pattern } from "~/game/PatternService";
// @ts-ignore - Vite handles worker imports
import SimulatorWorker from "~/game/simulator.worker?worker";

// API Response types
interface MarketDataResponse {
  success: boolean;
  data?: CandlestickData[];
  cached?: boolean;
  error?: string;
}

interface SessionStartResponse {
  success: boolean;
  sessionId?: string;
  createdAt?: string;
  error?: string;
}

interface SessionSubmitResponse {
  success: boolean;
  sessionId?: string;
  mastery?: any[];
  error?: string;
}

export default function Play() {
  // Data loading state
  const [fullData, setFullData] = createSignal<CandlestickData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Simulation state
  const [animatedData, setAnimatedData] = createSignal<CandlestickData[]>([]);
  const [isPlaying, setIsPlaying] = createSignal(false);
  const [isPaused, setIsPaused] = createSignal(false);
  const [speed, setSpeed] = createSignal(1);
  const [progress, setProgress] = createSignal(0);
  const [hasStarted, setHasStarted] = createSignal(false);

  // Number of initial candles to show for context
  const INITIAL_CANDLES = 50;

  // Game state
  const [score, setScore] = createSignal(0);
  const [streak, setStreak] = createSignal(0);
  const [elapsedSeconds, setElapsedSeconds] = createSignal(0);

  // Session tracking
  const [sessionId, setSessionId] = createSignal<string | null>(null);
  const [_sessionStartTime, setSessionStartTime] = createSignal<Date | null>(null);
  const [sessionCompleteData, setSessionCompleteData] = createSignal<any>(null);

  // Quiz state
  const [currentQuiz, setCurrentQuiz] = createSignal<QuizData | null>(null);
  const [quizTimeRemaining, setQuizTimeRemaining] = createSignal(15);
  const [selectedAnswer, setSelectedAnswer] = createSignal<string | null>(null);
  const [showExplanation, setShowExplanation] = createSignal(false);

  // UI demo state
  const [showSummaryDemo, setShowSummaryDemo] = createSignal(false);

  // Debug mode
  const [debugMode, setDebugMode] = createSignal(false);

  // Worker instance
  let worker: Worker | null = null;
  let timerInterval: number | null = null;
  let quizTimerInterval: number | null = null;

  // Format elapsed time as MM:SS
  const formattedTime = () => {
    const seconds = elapsedSeconds();
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  onMount(async () => {
    try {
      setLoading(true);
      console.log("[Play] Fetching market data...");

      const response = await fetch("/api/market-data?symbol=BTC/USD&timeframe=1h&limit=1000");
      const result = await response.json() as MarketDataResponse;

      console.log("[Play] API response:", result);

      if (result.success && result.data) {
        setFullData(result.data);
        console.log(`[Play] Loaded ${result.data.length} candlesticks (cached: ${result.cached})`);

        // Show initial candles for context
        const initialCandles = result.data.slice(0, INITIAL_CANDLES);
        setAnimatedData(initialCandles);
        console.log(`[Play] Showing initial ${INITIAL_CANDLES} candles for context`);

        // Initialize worker
        initializeWorker(result.data);
      } else {
        setError(result.error || "Failed to load chart data");
      }
    } catch (err) {
      console.error("[Play] Error fetching data:", err);
      setError("Network error while loading chart data");
    } finally {
      setLoading(false);
    }

    // Add keyboard shortcut for debug mode (Shift+D)
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'D') {
        setDebugMode(!debugMode());
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  });

  onCleanup(() => {
    // Clean up worker and timers
    if (worker) {
      worker.terminate();
    }
    if (timerInterval !== null) {
      clearInterval(timerInterval);
    }
    if (quizTimerInterval !== null) {
      clearInterval(quizTimerInterval);
    }
  });

  /**
   * Initialize the simulator worker
   */
  function initializeWorker(data: CandlestickData[]) {
    console.log("[Play] Initializing worker with", data.length, "candles");

    worker = new SimulatorWorker();

    // Handle messages from worker
    worker.onmessage = (event: MessageEvent<MainThreadMessage>) => {
      const { type, payload } = event.data;

      switch (type) {
        case "READY":
          console.log("[Play] Worker ready, total candles:", payload.totalCandles);
          break;

        case "TICK":
          // Add new candle to animated data
          console.log("[Play] TICK received, index:", payload.index, "progress:", payload.progress.toFixed(1) + "%");
          console.log("[Play] Candle data:", payload.candle);
          setAnimatedData((prev) => {
            const newData = [...prev, payload.candle];
            console.log("[Play] animatedData updated, new length:", newData.length);
            return newData;
          });
          setProgress(payload.progress);
          break;

        case "COMPLETE":
          console.log("[Play] Simulation complete", payload);
          setIsPlaying(false);
          setIsPaused(false);
          stopTimer();

          // Submit session results
          handleSessionComplete(payload);
          break;

        case "QUIZ_EVENT":
          console.log("[Play] Quiz event received:", payload);
          setCurrentQuiz(payload);
          setQuizTimeRemaining(payload.timeLimit);
          setSelectedAnswer(null);
          setShowExplanation(false);
          startQuizTimer();
          break;

        case "SCORE_UPDATE":
          console.log("[Play] Score update received:", payload);
          const scoreUpdate = payload as ScoreUpdate;
          setScore(scoreUpdate.score);
          setStreak(scoreUpdate.streak);
          break;

        case "ERROR":
          console.error("[Play] Worker error:", payload.message);
          setError(payload.message);
          break;
      }
    };

    // Initialize worker with data
    const message: WorkerMessage = {
      type: "INIT",
      payload: { data },
    };
    worker.postMessage(message);
  }

  /**
   * Start the simulation
   */
  async function startSimulation() {
    if (!worker) return;

    console.log("[Play] Starting simulation");
    setAnimatedData([]);
    setElapsedSeconds(0);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setIsPaused(false);
    setHasStarted(true);

    // Initialize session in database
    try {
      const response = await fetch("/api/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json() as SessionStartResponse;

      if (result.success && result.sessionId && result.createdAt) {
        setSessionId(result.sessionId);
        setSessionStartTime(new Date(result.createdAt));
        console.log("[Play] Session started:", result.sessionId);
      } else {
        console.error("[Play] Failed to start session:", result.error);
      }
    } catch (error) {
      console.error("[Play] Error starting session:", error);
    }

    const message: WorkerMessage = { type: "START" };
    worker.postMessage(message);

    startTimer();
  }

  /**
   * Handle session completion - submit results to API
   */
  async function handleSessionComplete(payload: any) {
    const currentSessionId = sessionId();

    if (!currentSessionId) {
      console.warn("[Play] No session ID, skipping submission");
      setShowSummaryDemo(true); // Still show summary
      return;
    }

    const duration = elapsedSeconds();
    const { score, accuracy, maxStreak, patternAttempts } = payload;

    // Transform pattern attempts for API
    const patternResults = patternAttempts.map((attempt: any) => ({
      patternName: attempt.patternName,
      correct: attempt.correct,
      timeTaken: attempt.timeTaken,
    }));

    console.log("[Play] Submitting session results...");
    console.log("[Play] Session ID:", currentSessionId);
    console.log("[Play] Score:", score);
    console.log("[Play] Accuracy:", accuracy);
    console.log("[Play] Max Streak:", maxStreak);
    console.log("[Play] Duration:", duration, "seconds");
    console.log("[Play] Patterns tested:", patternResults.length);

    try {
      const response = await fetch("/api/session/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          score,
          accuracy,
          duration,
          maxStreak,
          patternResults,
        }),
      });

      const result = await response.json() as SessionSubmitResponse;

      if (result.success) {
        console.log("[Play] Session submitted successfully");
        console.log("[Play] Updated mastery:", result.mastery);

        // Store session data for summary
        setSessionCompleteData({
          score,
          accuracy,
          correctCount: payload.correctCount,
          totalQuestions: patternResults.length,
          duration,
          maxStreak,
          patternResults,
        });

        // Show session summary with results
        setShowSummaryDemo(true);
      } else {
        console.error("[Play] Failed to submit session:", result.error);

        // Still store and show summary
        setSessionCompleteData({
          score,
          accuracy,
          correctCount: payload.correctCount,
          totalQuestions: patternResults.length,
          duration,
          maxStreak,
          patternResults,
        });
        setShowSummaryDemo(true);
      }
    } catch (error) {
      console.error("[Play] Error submitting session:", error);

      // Still store and show summary
      setSessionCompleteData({
        score,
        accuracy,
        correctCount: payload.correctCount,
        totalQuestions: patternResults.length,
        duration,
        maxStreak,
        patternResults,
      });
      setShowSummaryDemo(true);
    }
  }

  /**
   * Toggle pause/resume
   */
  function togglePause() {
    if (!worker) return;

    if (isPaused()) {
      console.log("[Play] Resuming");
      setIsPaused(false);
      const message: WorkerMessage = { type: "RESUME" };
      worker.postMessage(message);
      startTimer();
    } else {
      console.log("[Play] Pausing");
      setIsPaused(true);
      const message: WorkerMessage = { type: "PAUSE" };
      worker.postMessage(message);
      stopTimer();
    }
  }

  /**
   * Change playback speed
   */
  function changeSpeed(newSpeed: number) {
    if (!worker) return;

    console.log("[Play] Changing speed to", newSpeed);
    setSpeed(newSpeed);

    const message: WorkerMessage = {
      type: "SET_SPEED",
      payload: { speed: newSpeed },
    };
    worker.postMessage(message);
  }

  /**
   * Start the timer
   */
  function startTimer() {
    stopTimer(); // Clear any existing timer
    timerInterval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }

  /**
   * Stop the timer
   */
  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Start the quiz countdown timer
   */
  function startQuizTimer() {
    stopQuizTimer(); // Clear any existing timer

    // Skip timer in debug mode
    if (debugMode()) {
      return;
    }

    quizTimerInterval = window.setInterval(() => {
      setQuizTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up! Auto-submit with no answer
          handleQuizTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  /**
   * Stop the quiz timer
   */
  function stopQuizTimer() {
    if (quizTimerInterval !== null) {
      clearInterval(quizTimerInterval);
      quizTimerInterval = null;
    }
  }

  /**
   * Handle quiz timeout (no answer selected)
   */
  function handleQuizTimeout() {
    stopQuizTimer();
    setShowExplanation(true);

    // Auto-close quiz after showing explanation (5 seconds for reading)
    setTimeout(() => {
      // Send empty answer to worker when closing (counts as incorrect)
      closeQuiz("");
    }, 5000);
  }

  /**
   * Handle answer selection
   */
  function handleAnswerSelect(answer: string) {
    if (showExplanation()) return; // Already answered

    stopQuizTimer();
    setSelectedAnswer(answer);
    setShowExplanation(true);

    // Auto-close quiz after 5 seconds (give time to read explanation)
    setTimeout(() => {
      closeQuiz(answer);
    }, 5000);
  }

  /**
   * Close the quiz dialog and submit answer to worker
   */
  function closeQuiz(answer?: string) {
    stopQuizTimer();
    setCurrentQuiz(null);
    setSelectedAnswer(null);
    setShowExplanation(false);

    // Send answer to worker for scoring and resume simulation
    if (worker && answer !== undefined) {
      const message: WorkerMessage = {
        type: "SUBMIT_ANSWER",
        payload: { answer }
      };
      worker.postMessage(message);
    }
  }

  /**
   * Transform pattern results into PatternStats format for summary
   */
  function getPatternStats() {
    const data = sessionCompleteData();
    if (!data || !data.patternResults) return undefined;

    // Group by pattern name and count correct/total
    const patternMap = new Map<string, { correct: number; total: number }>();

    for (const result of data.patternResults) {
      const existing = patternMap.get(result.patternName) || { correct: 0, total: 0 };
      patternMap.set(result.patternName, {
        correct: existing.correct + (result.correct ? 1 : 0),
        total: existing.total + 1,
      });
    }

    // Convert to array format
    return Array.from(patternMap.entries()).map(([name, stats]) => ({
      name,
      correct: stats.correct,
      total: stats.total,
    }));
  }

  /**
   * Show demo quiz for testing (includes pattern highlighting)
   */
  function showDemoQuiz() {
    const data = animatedData().length > 0 ? animatedData() : fullData();

    if (data.length < 10) {
      console.warn("[Play] Not enough data to show demo quiz");
      return;
    }

    // Create a demo pattern using some candles in the middle of the visible data
    const midIndex = Math.floor(data.length / 2);
    const patternIndices = [midIndex - 2, midIndex - 1, midIndex];

    const demoPattern: Pattern = {
      name: "Morning Star",
      type: "reversal",
      candleIndices: patternIndices,
      confidence: 85,
      sentiment: "bullish",
    };

    const demoQuiz: QuizData = {
      question: "What candlestick pattern is forming here?",
      options: [
        { label: "A", value: "Morning Star" },
        { label: "B", value: "Evening Star" },
        { label: "C", value: "Three White Soldiers" },
        { label: "D", value: "Three Black Crows" },
      ],
      correctAnswer: "Morning Star",
      explanation: "The Morning Star pattern typically signals a bullish reversal. This is a three-candle pattern with 85% confidence based on the candlestick formation.",
      pattern: demoPattern,
      timeLimit: 15,
    };

    setCurrentQuiz(demoQuiz);
    setQuizTimeRemaining(15);
    setSelectedAnswer(null);
    setShowExplanation(false);
    startQuizTimer();
  }

  return (
    <main>
      <Title>Play - MarketDojo</Title>
      <Nav />

      {/* Debug Mode Indicator */}
      {debugMode() && (
        <div
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            "z-index": "9999",
            padding: "0.75rem 1.5rem",
            "border-radius": "0.5rem",
            "background-color": "var(--color-warning)",
            color: "white",
            "font-weight": "bold",
            "box-shadow": "0 4px 6px rgba(0, 0, 0, 0.3)",
            display: "flex",
            "align-items": "center",
            gap: "0.5rem",
          }}
        >
          <span>🐛</span>
          <span>DEBUG MODE</span>
          <span style={{ "font-size": "0.875rem", opacity: "0.9" }}>(Shift+D to toggle)</span>
        </div>
      )}

      <div
        style={{
          "max-width": "1400px",
          margin: "0 auto",
          padding: "2rem",
        }}
      >
        <div style={{ "margin-bottom": "2rem" }}>
          <h1 style={{ "margin-bottom": "0.5rem" }}>Pattern Quiz Game</h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Test your pattern recognition skills in real-time market simulation
          </p>
        </div>

        {/* Game Container with HUD and Chart */}
        <div
          style={{
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)",
            overflow: "hidden",
          }}
        >
          {loading() ? (
            <div style={{ "text-align": "center", padding: "3rem" }}>
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  border: "4px solid var(--color-border)",
                  "border-top-color": "var(--color-primary)",
                  "border-radius": "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p style={{ color: "var(--color-text-secondary)" }}>Loading chart data...</p>
            </div>
          ) : error() ? (
            <div style={{ "text-align": "center", padding: "3rem" }}>
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  "background-color": "var(--color-danger)",
                  "border-radius": "50%",
                  display: "flex",
                  "align-items": "center",
                  "justify-content": "center",
                  margin: "0 auto 1rem",
                }}
              >
                <span style={{ color: "white", "font-size": "1.5rem" }}>✗</span>
              </div>
              <p style={{ color: "var(--color-danger)", "font-weight": "600" }}>{error()}</p>
            </div>
          ) : (
            <>
              {/* Game HUD - Horizontal bar at top */}
              <div style={{ padding: "1.5rem 1.5rem 0 1.5rem" }}>
                <GameHUD
                  score={score()}
                  streak={streak()}
                  timer={formattedTime()}
                  speed={speed()}
                  isPaused={isPaused()}
                  hasStarted={hasStarted()}
                  onSpeedChange={changeSpeed}
                  onPauseToggle={togglePause}
                  onStart={startSimulation}
                />
              </div>
              {/* Chart below HUD */}
              <div style={{ padding: "1.5rem" }}>
                <ChartView
                  data={animatedData()}
                  height={600}
                  highlightPattern={currentQuiz()?.pattern ?? null}
                  showHighlight={currentQuiz() !== null}
                />
              </div>
            </>
          )}
        </div>

        {/* Controls - Phase 4.4 Simulation */}
        <div style={{ "margin-top": "1.5rem", "text-align": "center" }}>
          <p
            style={{
              "font-size": "0.875rem",
              color: "var(--color-text-secondary)",
              "margin-bottom": "1rem",
            }}
          >
            Phase 4.4: Simulation Engine (animated chart playback)
            {isPlaying() && ` | Progress: ${Math.round(progress())}%`}
          </p>
          <div style={{ display: "flex", gap: "1rem", "justify-content": "center", "flex-wrap": "wrap" }}>
            <button
              onClick={startSimulation}
              disabled={isPlaying() || isPaused()}
              style={{
                padding: "0.75rem 2rem",
                "border-radius": "0.5rem",
                border: "none",
                "background-color":
                  isPlaying() || isPaused()
                    ? "var(--color-bg-secondary)"
                    : "var(--color-primary)",
                color: isPlaying() || isPaused() ? "var(--color-text-secondary)" : "white",
                "font-weight": "600",
                "font-size": "1rem",
                cursor: isPlaying() || isPaused() ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                opacity: isPlaying() || isPaused() ? "0.5" : "1",
              }}
            >
              {isPlaying() || isPaused() ? "▶ Simulation Running" : "▶ Start Simulation"}
            </button>
            <button
              onClick={showDemoQuiz}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-border)",
                "background-color": "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Show Quiz Demo
            </button>
            <button
              onClick={() => setDebugMode(!debugMode())}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-border)",
                "background-color": debugMode()
                  ? "var(--color-warning)"
                  : "var(--color-bg-secondary)",
                color: debugMode() ? "white" : "var(--color-text-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {debugMode() ? "🐛 Debug ON" : "Debug Mode"}
            </button>
            <button
              onClick={() => setShowSummaryDemo(!showSummaryDemo())}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-border)",
                "background-color": showSummaryDemo()
                  ? "var(--color-primary)"
                  : "var(--color-bg-secondary)",
                color: showSummaryDemo() ? "white" : "var(--color-text-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showSummaryDemo() ? "Hide" : "Show"} Summary Demo
            </button>
          </div>
        </div>

        {/* Quiz Dialog Component */}
        <QuizDialog
          isOpen={currentQuiz() !== null}
          question={currentQuiz()?.question}
          options={currentQuiz()?.options}
          timeRemaining={quizTimeRemaining()}
          totalTime={currentQuiz()?.timeLimit || 15}
          selectedAnswer={selectedAnswer() || undefined}
          correctAnswer={showExplanation() ? currentQuiz()?.correctAnswer : undefined}
          explanation={currentQuiz()?.explanation}
          showExplanation={showExplanation()}
          debugMode={debugMode()}
          onSelectAnswer={handleAnswerSelect}
          onClose={closeQuiz}
        />

        {/* Session Summary Component */}
        <SessionSummary
          isOpen={showSummaryDemo()}
          finalScore={sessionCompleteData()?.score ?? score()}
          totalQuestions={sessionCompleteData()?.totalQuestions ?? 0}
          correctAnswers={sessionCompleteData()?.correctCount ?? 0}
          patternsTesteed={getPatternStats()}
          duration={formattedTime()}
          onPlayAgain={() => {
            setShowSummaryDemo(false);
            startSimulation();
          }}
        />
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
