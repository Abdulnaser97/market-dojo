import { Title } from "@solidjs/meta";
import { CandlestickData } from "lightweight-charts";
import { createSignal, onMount, onCleanup } from "solid-js";
import Nav from "~/components/layout/Nav";
import ChartView from "~/components/game/ChartView";
import GameHUD from "~/components/game/GameHUD";
import QuizDialog from "~/components/game/QuizDialog";
import SessionSummary from "~/components/game/SessionSummary";
import type { WorkerMessage, MainThreadMessage } from "~/game/simulator.worker";
// @ts-ignore - Vite handles worker imports
import SimulatorWorker from "~/game/simulator.worker?worker";

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

  // Game state (Phase 4.3 demo values, will be real in Phase 4.6)
  const [score, setScore] = createSignal(0);
  const [streak, setStreak] = createSignal(0);
  const [elapsedSeconds, setElapsedSeconds] = createSignal(0);

  // UI demo state
  const [showQuizDemo, setShowQuizDemo] = createSignal(false);
  const [showSummaryDemo, setShowSummaryDemo] = createSignal(false);

  // Worker instance
  let worker: Worker | null = null;
  let timerInterval: number | null = null;

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
      const result = await response.json();

      console.log("[Play] API response:", result);

      if (result.success) {
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
  });

  onCleanup(() => {
    // Clean up worker and timer
    if (worker) {
      worker.terminate();
    }
    if (timerInterval !== null) {
      clearInterval(timerInterval);
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
          console.log("[Play] Simulation complete");
          setIsPlaying(false);
          setIsPaused(false);
          stopTimer();
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
  function startSimulation() {
    if (!worker) return;

    console.log("[Play] Starting simulation");
    setAnimatedData([]);
    setElapsedSeconds(0);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setIsPaused(false);
    setHasStarted(true);

    const message: WorkerMessage = { type: "START" };
    worker.postMessage(message);

    startTimer();
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

  return (
    <main>
      <Title>Play - MarketDojo</Title>
      <Nav />

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
              onClick={() => setShowQuizDemo(!showQuizDemo())}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-border)",
                "background-color": showQuizDemo()
                  ? "var(--color-primary)"
                  : "var(--color-bg-secondary)",
                color: showQuizDemo() ? "white" : "var(--color-text-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showQuizDemo() ? "Hide" : "Show"} Quiz Demo
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
          isOpen={showQuizDemo()}
          question="What candlestick pattern is forming here?"
          options={[
            { label: "A", value: "Doji" },
            { label: "B", value: "Hammer" },
            { label: "C", value: "Bullish Engulfing" },
            { label: "D", value: "Shooting Star" },
          ]}
          timeRemaining={12}
          totalTime={15}
          onSelectAnswer={(answer) => console.log("Selected:", answer)}
          onClose={() => setShowQuizDemo(false)}
        />

        {/* Session Summary Component */}
        <SessionSummary
          isOpen={showSummaryDemo()}
          finalScore={score()}
          totalQuestions={12}
          correctAnswers={9}
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
