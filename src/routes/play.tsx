import { Title } from "@solidjs/meta";
import { CandlestickData } from "lightweight-charts";
import { createSignal, onMount } from "solid-js";
import Nav from "~/components/layout/Nav";
import ChartView from "~/components/game/ChartView";

export default function Play() {
  const [chartData, setChartData] = createSignal<CandlestickData[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

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

        <div
          style={{
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)",
            padding: "1.5rem",
            "min-height": "600px",
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
          }}
        >
          {loading() ? (
            <div style={{ "text-align": "center" }}>
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
            <div style={{ "text-align": "center" }}>
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
            <ChartView data={chartData()} height={600} />
          )}
        </div>

        <div style={{ "margin-top": "1rem", "text-align": "center" }}>
          <p style={{ "font-size": "0.875rem", color: "var(--color-text-secondary)" }}>
            Phase 4.1: Chart with real historical data from database
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  );
}
