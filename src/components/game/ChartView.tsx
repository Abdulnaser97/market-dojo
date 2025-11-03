import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import type { CandlestickData } from "lightweight-charts";
import type { Pattern } from "~/game/PatternService";
import PatternHighlight from "./PatternHighlight";

interface ChartViewProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
  highlightPattern?: Pattern | null;
  showHighlight?: boolean;
}

// Dimmed colors for non-pattern candles
const DIMMED_UP_COLOR = "#1a4d2e"; // Dark muted green
const DIMMED_DOWN_COLOR = "#4d1a1a"; // Dark muted red
const DIMMED_BORDER_UP = "#1a4d2e";
const DIMMED_BORDER_DOWN = "#4d1a1a";
const DIMMED_WICK_UP = "#1a4d2e";
const DIMMED_WICK_DOWN = "#4d1a1a";

export default function ChartView(props: ChartViewProps) {
  let containerRef: HTMLDivElement | undefined;
  const [chart, setChart] = createSignal<any>(null);
  const [candlestickSeries, setCandlestickSeries] = createSignal<any>(null);
  let resizeHandler: (() => void) | undefined;
  let lastUpdateTime: number | null = null;

  // Register cleanup synchronously (before async work)
  onCleanup(() => {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }
    const chartInstance = chart();
    if (chartInstance) {
      chartInstance.remove();
    }
  });

  onMount(async () => {
    if (!containerRef) return;

    // Dynamically import lightweight-charts (client-side only)
    const LightweightCharts = await import("lightweight-charts");
    const { createChart, CandlestickSeries } = LightweightCharts;

    // Create chart instance
    const chartInstance = createChart(containerRef, {
      width: props.width || containerRef.clientWidth,
      height: props.height || 600,
      layout: {
        background: { color: "#18181b" }, // Dark background
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#27272a" },
        horzLines: { color: "#27272a" },
      },
      crosshair: {
        mode: 1, // Normal crosshair
        vertLine: {
          color: "#6366f1",
          width: 1,
          style: 2, // Dashed
          labelBackgroundColor: "#6366f1",
        },
        horzLine: {
          color: "#6366f1",
          width: 1,
          style: 2,
          labelBackgroundColor: "#6366f1",
        },
      },
      timeScale: {
        borderColor: "#27272a",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#27272a",
      },
    });

    // Add candlestick series (API v5 uses addSeries instead of addCandlestickSeries)
    const seriesInstance = chartInstance.addSeries(CandlestickSeries, {
      upColor: "#22c55e", // Green for bullish
      downColor: "#ef4444", // Red for bearish
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // Set initial data
    if (props.data.length > 0) {
      seriesInstance.setData(props.data);
      chartInstance.timeScale().fitContent();
      lastUpdateTime = props.data[props.data.length - 1].time as number;
      console.log("[ChartView] Initial data set:", props.data.length, "candles, last time:", lastUpdateTime);
    }

    // Handle window resize
    resizeHandler = () => {
      const currentChart = chart();
      if (currentChart && containerRef) {
        currentChart.applyOptions({
          width: containerRef.clientWidth,
        });
      }
    };

    window.addEventListener("resize", resizeHandler);

    // Set signals to make them reactive
    setChart(chartInstance);
    setCandlestickSeries(seriesInstance);
  });

  // Update data when props change - following Lightweight Charts realtime pattern
  createEffect(() => {
    const series = candlestickSeries();

    if (!series) {
      return;
    }

    const dataLength = props.data.length;

    // If data is empty, clear the chart (but keep ready for updates)
    if (dataLength === 0) {
      series.setData([]);
      lastUpdateTime = -1; // Sentinel: cleared and ready for updates
      return;
    }

    const lastCandle = props.data[dataLength - 1];
    const candleTime = lastCandle.time as number;

    // After clearing (lastUpdateTime === -1), start using update()
    if (lastUpdateTime === -1) {
      series.update(lastCandle);
      lastUpdateTime = candleTime;
    }
    // If this is a new candle (different timestamp), use update() for realtime addition
    else if (lastUpdateTime !== null && candleTime !== lastUpdateTime) {
      series.update(lastCandle);
      lastUpdateTime = candleTime;
    }
    // Initial data load
    else if (lastUpdateTime === null) {
      series.setData(props.data);
      lastUpdateTime = candleTime;
      const currentChart = chart();
      if (currentChart) {
        currentChart.timeScale().fitContent();
      }
    }
  });

  // Apply dimmed colors when quiz is active
  createEffect(() => {
    const series = candlestickSeries();
    if (!series || props.data.length === 0) return;

    const patternIndices = props.highlightPattern?.candleIndices || [];
    const isActive = props.showHighlight;

    if (isActive && patternIndices.length > 0) {
      // Apply dimmed colors to all candles except pattern candles
      const updatedData = props.data.map((candle, index) => {
        const isPatternCandle = patternIndices.includes(index);

        if (isPatternCandle) {
          // Pattern candles: remove custom colors to use series defaults (bright)
          const { color, wickColor, borderColor, ...cleanCandle } = candle as any;
          return cleanCandle;
        } else {
          // Non-pattern candles: apply dimmed colors
          const isBullish = candle.close >= candle.open;
          return {
            ...candle,
            color: isBullish ? DIMMED_UP_COLOR : DIMMED_DOWN_COLOR,
            wickColor: isBullish ? DIMMED_WICK_UP : DIMMED_WICK_DOWN,
            borderColor: isBullish ? DIMMED_BORDER_UP : DIMMED_BORDER_DOWN,
          };
        }
      });

      series.setData(updatedData);
    } else {
      // Quiz inactive: restore original colors by removing custom color properties
      const restoredData = props.data.map((candle) => {
        const { color, wickColor, borderColor, ...cleanCandle } = candle as any;
        return cleanCandle;
      });

      series.setData(restoredData);
    }
  });

  return (
    <div
      style={{
        width: "100%",
        height: props.height ? `${props.height}px` : "600px",
        position: "relative",
      }}
    >
      {/* Chart canvas */}
      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />

      {/* Pattern highlight overlay */}
      <PatternHighlight
        pattern={props.highlightPattern ?? null}
        data={props.data}
        chartContainer={containerRef ?? null}
        chart={chart()}
        series={candlestickSeries()}
        isActive={props.showHighlight ?? false}
      />
    </div>
  );
}
