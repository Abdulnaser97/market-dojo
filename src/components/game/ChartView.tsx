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

  // Update data when props change
  createEffect(() => {
    if (candlestickSeries && props.data.length > 0) {
      candlestickSeries.setData(props.data);
      if (chart) {
        chart.timeScale().fitContent();
      }
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
