import { createEffect, onCleanup, onMount } from "solid-js";
import type { CandlestickData } from "lightweight-charts";

interface ChartViewProps {
  data: CandlestickData[];
  width?: number;
  height?: number;
}

export default function ChartView(props: ChartViewProps) {
  let containerRef: HTMLDivElement | undefined;
  let chart: any;
  let candlestickSeries: any;
  let resizeHandler: (() => void) | undefined;
  let lastUpdateTime: number | null = null;

  // Register cleanup synchronously (before async work)
  onCleanup(() => {
    if (resizeHandler) {
      window.removeEventListener("resize", resizeHandler);
    }
    if (chart) {
      chart.remove();
    }
  });

  onMount(async () => {
    if (!containerRef) return;

    // Dynamically import lightweight-charts (client-side only)
    const LightweightCharts = await import("lightweight-charts");
    const { createChart, CandlestickSeries } = LightweightCharts;

    // Create chart instance
    chart = createChart(containerRef, {
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
    candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e", // Green for bullish
      downColor: "#ef4444", // Red for bearish
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    // Set initial data
    if (props.data.length > 0) {
      candlestickSeries.setData(props.data);
      chart.timeScale().fitContent();
      lastUpdateTime = props.data[props.data.length - 1].time as number;
      console.log("[ChartView] Initial data set:", props.data.length, "candles, last time:", lastUpdateTime);
    }

    // Handle window resize
    resizeHandler = () => {
      if (chart && containerRef) {
        chart.applyOptions({
          width: containerRef.clientWidth,
        });
      }
    };

    window.addEventListener("resize", resizeHandler);
  });

  // Update data when props change - following Lightweight Charts realtime pattern
  createEffect(() => {
    console.log("[ChartView] createEffect fired, data length:", props.data.length);
    console.log("[ChartView] candlestickSeries exists?", !!candlestickSeries);
    console.log("[ChartView] lastUpdateTime:", lastUpdateTime);

    if (!candlestickSeries) {
      console.log("[ChartView] No candlestickSeries, skipping update");
      return;
    }

    const dataLength = props.data.length;

    // If data is empty, clear the chart (but keep ready for updates)
    if (dataLength === 0) {
      candlestickSeries.setData([]);
      lastUpdateTime = -1; // Sentinel: cleared and ready for updates
      console.log("[ChartView] Chart cleared, ready for updates");
      return;
    }

    const lastCandle = props.data[dataLength - 1];
    const candleTime = lastCandle.time as number;
    console.log("[ChartView] Last candle:", lastCandle);

    // After clearing (lastUpdateTime === -1), start using update()
    if (lastUpdateTime === -1) {
      console.log("[ChartView] Calling update() for first candle after clear");
      candlestickSeries.update(lastCandle);
      lastUpdateTime = candleTime;
      console.log("[ChartView] First update after clear, time:", candleTime);
    }
    // If this is a new candle (different timestamp), use update() for realtime addition
    else if (lastUpdateTime !== null && candleTime !== lastUpdateTime) {
      console.log("[ChartView] Calling update() for new candle");
      candlestickSeries.update(lastCandle);
      lastUpdateTime = candleTime;
      console.log("[ChartView] Realtime update - new candle at time:", candleTime);
    }
    // Initial data load
    else if (lastUpdateTime === null) {
      console.log("[ChartView] Calling setData() for initial load");
      candlestickSeries.setData(props.data);
      lastUpdateTime = candleTime;
      if (chart) {
        chart.timeScale().fitContent();
      }
      console.log("[ChartView] Full data load -", dataLength, "candles");
    }
    else {
      console.log("[ChartView] No action taken - same timestamp?");
    }
  });

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: props.height ? `${props.height}px` : "600px",
        position: "relative",
      }}
    />
  );
}
