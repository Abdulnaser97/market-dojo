/**
 * PatternHighlight - Visual overlay that highlights pattern candlesticks during quiz
 * Dims the entire chart with a vignette and highlights the pattern area
 */

import { createEffect, createSignal, onCleanup, Show } from "solid-js";
import type { CandlestickData } from "lightweight-charts";
import type { Pattern } from "~/game/PatternService";

export interface PatternHighlightProps {
  pattern: Pattern | null;
  data: CandlestickData[];
  chartContainer: HTMLDivElement | null;
  chart: any; // LightweightCharts instance
  series: any; // Candlestick series
  isActive: boolean;
}

export default function PatternHighlight(props: PatternHighlightProps) {
  const [highlightBox, setHighlightBox] = createSignal<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Calculate highlight position when pattern or chart changes
  createEffect(() => {
    console.log("[PatternHighlight] Effect triggered:", {
      isActive: props.isActive,
      hasPattern: !!props.pattern,
      hasChart: !!props.chart,
      hasSeries: !!props.series,
      hasContainer: !!props.chartContainer,
    });

    if (!props.isActive || !props.pattern || !props.chart || !props.series || !props.chartContainer) {
      setHighlightBox(null);
      return;
    }

    try {
      const pattern = props.pattern;
      const candleIndices = pattern.candleIndices;

      if (!candleIndices || candleIndices.length === 0) {
        console.warn("[PatternHighlight] No candleIndices in pattern");
        setHighlightBox(null);
        return;
      }

      // Get the time values for the pattern candles
      const patternCandles = candleIndices.map((idx) => props.data[idx]).filter(Boolean);

      if (patternCandles.length === 0) {
        console.warn("[PatternHighlight] Could not find pattern candles in data");
        setHighlightBox(null);
        return;
      }

      // Get time range for pattern
      const times = patternCandles.map((c) => c.time as number);
      const minTime = Math.min(...times);
      const maxTime = Math.max(...times);

      // Get price range for pattern
      const highs = patternCandles.map((c) => c.high);
      const lows = patternCandles.map((c) => c.low);
      const maxPrice = Math.max(...highs);
      const minPrice = Math.min(...lows);

      // Convert to pixel coordinates using chart APIs
      const timeScale = props.chart.timeScale();

      // Get pixel positions
      const leftX = timeScale.timeToCoordinate(minTime);
      const rightX = timeScale.timeToCoordinate(maxTime);
      const topY = props.series.priceToCoordinate(maxPrice);
      const bottomY = props.series.priceToCoordinate(minPrice);

      if (leftX === null || rightX === null || topY === null || bottomY === null) {
        console.warn("[PatternHighlight] Could not convert coordinates");
        setHighlightBox(null);
        return;
      }

      // Get chart drawable area dimensions
      const chartWidth = props.chart.timeScale().width();

      // Add padding around the pattern (20px on each side)
      const basePadding = 20;
      const candleWidth = 10; // Approximate candle width

      // Calculate ideal dimensions
      let boxLeft = leftX - basePadding;
      let boxWidth = Math.max(rightX - leftX + candleWidth, 50) + basePadding * 2;

      // Clamp to chart bounds - prevent overflow on right edge
      const chartRight = chartWidth;
      if (boxLeft + boxWidth > chartRight) {
        // Reduce padding or shift left to fit within bounds
        const overflow = (boxLeft + boxWidth) - chartRight;

        // First try reducing right padding
        const reducedWidth = boxWidth - overflow;
        if (reducedWidth >= (rightX - leftX + candleWidth + basePadding)) {
          // Can fit by just reducing right padding
          boxWidth = reducedWidth;
        } else {
          // Need to shift the whole box left
          boxLeft = Math.max(0, chartRight - boxWidth);
          boxWidth = Math.min(boxWidth, chartRight - boxLeft);
        }
      }

      setHighlightBox({
        left: boxLeft,
        top: topY - basePadding,
        width: boxWidth,
        height: Math.max(bottomY - topY, 50) + basePadding * 2,
      });

      console.log("[PatternHighlight] Highlight box:", {
        chartWidth,
        originalLeft: leftX - basePadding,
        clampedLeft: boxLeft,
        originalWidth: Math.max(rightX - leftX + candleWidth, 50) + basePadding * 2,
        clampedWidth: boxWidth,
        patternIndices: candleIndices,
        timeRange: [minTime, maxTime],
        priceRange: [minPrice, maxPrice],
      });
    } catch (error) {
      console.error("[PatternHighlight] Error calculating highlight position:", error);
      setHighlightBox(null);
    }
  });

  return (
    <Show when={props.isActive && highlightBox()}>
      {(box) => {
        const b = box();
        return (
          <>
            {/* Top bar - from screen top to highlight top */}
            <div
              style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                height: `${b.top}px`,
                "background-color": "rgba(0, 0, 0, 0.75)",
                "pointer-events": "none",
                "z-index": "10",
              }}
            />

            {/* Left bar - from highlight top to bottom, screen left to highlight left */}
            <div
              style={{
                position: "absolute",
                top: `${b.top}px`,
                left: "0",
                width: `${b.left}px`,
                height: `${b.height}px`,
                "background-color": "rgba(0, 0, 0, 0.75)",
                "pointer-events": "none",
                "z-index": "10",
              }}
            />

            {/* Right bar - from highlight top to bottom, highlight right to screen right */}
            <div
              style={{
                position: "absolute",
                top: `${b.top}px`,
                left: `${b.left + b.width}px`,
                right: "0",
                height: `${b.height}px`,
                "background-color": "rgba(0, 0, 0, 0.75)",
                "pointer-events": "none",
                "z-index": "10",
              }}
            />

            {/* Bottom bar - from highlight bottom to screen bottom */}
            <div
              style={{
                position: "absolute",
                top: `${b.top + b.height}px`,
                left: "0",
                right: "0",
                bottom: "0",
                "background-color": "rgba(0, 0, 0, 0.75)",
                "pointer-events": "none",
                "z-index": "10",
              }}
            />

            {/* Highlight box */}
            <div
              style={{
                position: "absolute",
                left: `${b.left}px`,
                top: `${b.top}px`,
                width: `${b.width}px`,
                height: `${b.height}px`,
                border: "3px solid rgba(99, 102, 241, 0.8)", // Indigo glow
                "border-radius": "8px",
                "box-shadow": "0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 20px rgba(99, 102, 241, 0.2)",
                "pointer-events": "none",
                "z-index": "11",
                animation: "pulse 0.8s ease-in-out infinite alternate",
              }}
            />

            <style>{`
              @keyframes pulse {
                from {
                  opacity: 0.8;
                  transform: scale(1);
                }
                to {
                  opacity: 1;
                  transform: scale(1.02);
                }
              }
            `}</style>
          </>
        );
      }}
    </Show>
  );
}
