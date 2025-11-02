import { Title } from "@solidjs/meta";
import { CandlestickData } from "lightweight-charts";
import { createSignal, onMount } from "solid-js";
import Nav from "~/components/layout/Nav";
import ChartView from "~/components/game/ChartView";
import GameHUD from "~/components/game/GameHUD";
import QuizDialog from "~/components/game/QuizDialog";
import SessionSummary from "~/components/game/SessionSummary";

export default function Play() {
  const [chartData, setChartData] = createSignal<CandlestickData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Demo state for UI components (Phase 4.3 - non-functional)
  const [showQuizDemo, setShowQuizDemo] = createSignal(false);
  const [showSummaryDemo, setShowSummaryDemo] = createSignal(false);
  const [demoScore, setDemoScore] = createSignal(1250);
  const [demoStreak, setDemoStreak] = createSignal(5);
  const [demoSpeed, setDemoSpeed] = createSignal(1);
  const [demoPaused, setDemoPaused] = createSignal(false);

  onMount(async () => {
    try {
      setLoading(true);
      console.log("[Play] Fetching market data...");

      const response = await fetch("/api/market-data?symbol=BTC/USD&timeframe=1h&limit=1000");
      const result = await response.json();

      console.log("[Play] API response:", result);

      if (result.success) {
        setChartData(result.data);
        console.log(`[Play] Loaded ${result.data.length} candlesticks (cached: ${result.cached})`);
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
                  score={demoScore()}
                  streak={demoStreak()}
                  timer="05:32"
                  speed={demoSpeed()}
                  isPaused={demoPaused()}
                  onSpeedChange={(speed) => setDemoSpeed(speed)}
                  onPauseToggle={() => setDemoPaused(!demoPaused())}
                />
              </div>
              {/* Chart below HUD */}
              <div style={{ padding: "1.5rem" }}>
                <ChartView data={chartData()} height={600} />
              </div>
            </>
          )}
        </div>

        {/* Demo Controls - Phase 4.3 UI Shell */}
        <div style={{ "margin-top": "1.5rem", "text-align": "center" }}>
          <p
            style={{
              "font-size": "0.875rem",
              color: "var(--color-text-secondary)",
              "margin-bottom": "1rem",
            }}
          >
            Phase 4.3: UI Shell Demo (non-functional components)
          </p>
          <div style={{ display: "flex", gap: "1rem", "justify-content": "center", "flex-wrap": "wrap" }}>
            <button
              onClick={() => setShowQuizDemo(!showQuizDemo())}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-primary)",
                "background-color": showQuizDemo()
                  ? "var(--color-primary)"
                  : "var(--color-bg-secondary)",
                color: showQuizDemo() ? "white" : "var(--color-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showQuizDemo() ? "Hide" : "Show"} Quiz Dialog
            </button>
            <button
              onClick={() => setShowSummaryDemo(!showSummaryDemo())}
              style={{
                padding: "0.75rem 1.5rem",
                "border-radius": "0.5rem",
                border: "2px solid var(--color-primary)",
                "background-color": showSummaryDemo()
                  ? "var(--color-primary)"
                  : "var(--color-bg-secondary)",
                color: showSummaryDemo() ? "white" : "var(--color-primary)",
                "font-weight": "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {showSummaryDemo() ? "Hide" : "Show"} Session Summary
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
          finalScore={demoScore()}
          totalQuestions={12}
          correctAnswers={9}
          onPlayAgain={() => {
            setShowSummaryDemo(false);
            console.log("Play Again clicked");
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
