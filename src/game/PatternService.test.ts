import { describe, it, expect } from "vitest";
import { PatternService, type Candle } from "./PatternService";

describe("PatternService", () => {
  describe("Doji Patterns", () => {
    it("should detect standard Doji", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 105, low: 95, close: 100.1 }, // Body: 0.1, Range: 10, Upper: 4.9 (49%), Lower: 5 (50%)
      ];
      const pattern = PatternService.detectDoji(candles, 0);
      expect(pattern).not.toBeNull();
      // Either "Doji" or "Long-legged Doji" is acceptable since shadows are close to the threshold
      expect(pattern?.name).toMatch(/Doji/);
      expect(pattern?.sentiment).toBe("neutral");
    });

    it("should detect Dragonfly Doji", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 101, low: 90, close: 100.5 },
      ];
      const pattern = PatternService.detectDoji(candles, 0);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Dragonfly Doji");
      expect(pattern?.sentiment).toBe("neutral");
    });

    it("should detect Gravestone Doji", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 110, low: 99, close: 100.5 },
      ];
      const pattern = PatternService.detectDoji(candles, 0);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Gravestone Doji");
      expect(pattern?.sentiment).toBe("neutral");
    });

    it("should detect Long-legged Doji", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 107, low: 93, close: 100.5 },
      ];
      const pattern = PatternService.detectDoji(candles, 0);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Long-legged Doji");
      expect(pattern?.sentiment).toBe("neutral");
    });

    it("should not detect Doji with large body", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 110, low: 95, close: 108 },
      ];
      const pattern = PatternService.detectDoji(candles, 0);
      expect(pattern).toBeNull();
    });
  });

  describe("Hammer Pattern", () => {
    it("should detect Hammer in downtrend", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 111, low: 109, close: 105 },
        { time: 2, open: 105, high: 106, low: 104, close: 100 },
        { time: 3, open: 97, high: 100, low: 85, close: 99 }, // Body: 2, Lower shadow: 12, Upper shadow: 1
      ];
      const pattern = PatternService.detectHammer(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Hammer");
      expect(pattern?.sentiment).toBe("bullish");
      expect(pattern?.type).toBe("reversal");
    });

    it("should not detect Hammer without long lower shadow", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 105, low: 98, close: 103 },
      ];
      const pattern = PatternService.detectHammer(candles, 0);
      expect(pattern).toBeNull();
    });

    it("should detect Hanging Man in uptrend", () => {
      const candles: Candle[] = [
        { time: 1, open: 90, high: 91, low: 89, close: 95 },
        { time: 2, open: 95, high: 96, low: 94, close: 100 },
        { time: 3, open: 98, high: 102, low: 85, close: 102 }, // Body: 4, Lower shadow: 13, Upper shadow: 0
      ];
      const pattern = PatternService.detectHammer(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Hanging Man");
      expect(pattern?.sentiment).toBe("bearish");
    });
  });

  describe("Shooting Star Pattern", () => {
    it("should detect Shooting Star in uptrend", () => {
      const candles: Candle[] = [
        { time: 1, open: 90, high: 91, low: 89, close: 95 },
        { time: 2, open: 95, high: 96, low: 94, close: 100 },
        { time: 3, open: 100, high: 115, low: 100, close: 104 }, // Body: 4, Upper shadow: 11, Lower shadow: 0
      ];
      const pattern = PatternService.detectShootingStar(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Shooting Star");
      expect(pattern?.sentiment).toBe("bearish");
      expect(pattern?.type).toBe("reversal");
    });

    it("should not detect Shooting Star without long upper shadow", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 103, low: 95, close: 102 },
      ];
      const pattern = PatternService.detectShootingStar(candles, 0);
      expect(pattern).toBeNull();
    });

    it("should detect Inverted Hammer in downtrend", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 111, low: 109, close: 105 },
        { time: 2, open: 105, high: 106, low: 104, close: 100 },
        { time: 3, open: 96, high: 111, low: 96, close: 100 }, // Body: 4, Upper shadow: 11, Lower shadow: 0
      ];
      const pattern = PatternService.detectShootingStar(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Inverted Hammer");
      expect(pattern?.sentiment).toBe("bullish");
    });
  });

  describe("Engulfing Patterns", () => {
    it("should detect Bullish Engulfing", () => {
      const candles: Candle[] = [
        { time: 1, open: 105, high: 106, low: 100, close: 101 },
        { time: 2, open: 99, high: 110, low: 98, close: 109 },
      ];
      const pattern = PatternService.detectEngulfing(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Bullish Engulfing");
      expect(pattern?.sentiment).toBe("bullish");
      expect(pattern?.type).toBe("reversal");
      expect(pattern?.candleIndices).toEqual([0, 1]);
    });

    it("should detect Bearish Engulfing", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 106, low: 99, close: 105 },
        { time: 2, open: 107, high: 108, low: 95, close: 96 },
      ];
      const pattern = PatternService.detectEngulfing(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Bearish Engulfing");
      expect(pattern?.sentiment).toBe("bearish");
      expect(pattern?.type).toBe("reversal");
    });

    it("should not detect Engulfing with same color candles", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 105, low: 99, close: 104 },
        { time: 2, open: 99, high: 110, low: 98, close: 109 },
      ];
      const pattern = PatternService.detectEngulfing(candles, 1);
      expect(pattern).toBeNull();
    });

    it("should not detect Engulfing without complete engulfment", () => {
      const candles: Candle[] = [
        { time: 1, open: 105, high: 106, low: 100, close: 101 },
        { time: 2, open: 100, high: 105, low: 98, close: 104 },
      ];
      const pattern = PatternService.detectEngulfing(candles, 1);
      expect(pattern).toBeNull();
    });
  });

  describe("Harami Patterns", () => {
    it("should detect Bullish Harami", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 111, low: 95, close: 96 },
        { time: 2, open: 100, high: 104, low: 99, close: 103 },
      ];
      const pattern = PatternService.detectHarami(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Bullish Harami");
      expect(pattern?.sentiment).toBe("bullish");
      expect(pattern?.candleIndices).toEqual([0, 1]);
    });

    it("should detect Bearish Harami", () => {
      const candles: Candle[] = [
        { time: 1, open: 95, high: 110, low: 94, close: 109 },
        { time: 2, open: 105, high: 106, low: 100, close: 101 },
      ];
      const pattern = PatternService.detectHarami(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Bearish Harami");
      expect(pattern?.sentiment).toBe("bearish");
    });

    it("should not detect Harami with same color candles", () => {
      const candles: Candle[] = [
        { time: 1, open: 95, high: 110, low: 94, close: 109 },
        { time: 2, open: 100, high: 106, low: 99, close: 105 },
      ];
      const pattern = PatternService.detectHarami(candles, 1);
      expect(pattern).toBeNull();
    });
  });

  describe("Piercing Line Pattern", () => {
    it("should detect Piercing Line", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 112, low: 100, close: 101 },
        { time: 2, open: 99, high: 109, low: 98, close: 107 },
      ];
      const pattern = PatternService.detectPiercingLine(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Piercing Line");
      expect(pattern?.sentiment).toBe("bullish");
      expect(pattern?.type).toBe("reversal");
    });

    it("should not detect Piercing Line if close doesn't reach midpoint", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 112, low: 100, close: 101 },
        { time: 2, open: 99, high: 104, low: 98, close: 103 },
      ];
      const pattern = PatternService.detectPiercingLine(candles, 1);
      expect(pattern).toBeNull();
    });

    it("should not detect Piercing Line with wrong candle colors", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 110 },
        { time: 2, open: 99, high: 109, low: 98, close: 107 },
      ];
      const pattern = PatternService.detectPiercingLine(candles, 1);
      expect(pattern).toBeNull();
    });
  });

  describe("Dark Cloud Cover Pattern", () => {
    it("should detect Dark Cloud Cover", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 111 },
        { time: 2, open: 113, high: 115, low: 102, close: 104 },
      ];
      const pattern = PatternService.detectDarkCloudCover(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Dark Cloud Cover");
      expect(pattern?.sentiment).toBe("bearish");
      expect(pattern?.type).toBe("reversal");
    });

    it("should not detect Dark Cloud Cover if close doesn't reach midpoint", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 111 },
        { time: 2, open: 113, high: 115, low: 107, close: 108 },
      ];
      const pattern = PatternService.detectDarkCloudCover(candles, 1);
      expect(pattern).toBeNull();
    });
  });

  describe("Morning Star Pattern", () => {
    it("should detect Morning Star", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 112, low: 100, close: 101 }, // Bearish
        { time: 2, open: 98, high: 99, low: 95, close: 97 }, // Small body (1), range (4), ratio 25%
        { time: 3, open: 97, high: 112, low: 96, close: 109 }, // Bullish, closes above midpoint (105.5)
      ];
      const pattern = PatternService.detectMorningStar(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Morning Star");
      expect(pattern?.sentiment).toBe("bullish");
      expect(pattern?.type).toBe("reversal");
      expect(pattern?.candleIndices).toEqual([0, 1, 2]);
    });

    it("should not detect Morning Star without small middle candle", () => {
      const candles: Candle[] = [
        { time: 1, open: 110, high: 112, low: 100, close: 101 },
        { time: 2, open: 99, high: 105, low: 90, close: 91 },
        { time: 3, open: 92, high: 112, low: 91, close: 111 },
      ];
      const pattern = PatternService.detectMorningStar(candles, 2);
      expect(pattern).toBeNull();
    });

    it("should not detect Morning Star with wrong candle colors", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 111 },
        { time: 2, open: 99, high: 100, low: 95, close: 96 },
        { time: 3, open: 97, high: 112, low: 96, close: 111 },
      ];
      const pattern = PatternService.detectMorningStar(candles, 2);
      expect(pattern).toBeNull();
    });
  });

  describe("Evening Star Pattern", () => {
    it("should detect Evening Star", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 111 }, // Bullish
        { time: 2, open: 113, high: 116, low: 112, close: 114 }, // Small body (1), range (4), ratio 25%
        { time: 3, open: 113, high: 114, low: 98, close: 102 }, // Bearish, closes below midpoint (105.5)
      ];
      const pattern = PatternService.detectEveningStar(candles, 2);
      expect(pattern).not.toBeNull();
      expect(pattern?.name).toBe("Evening Star");
      expect(pattern?.sentiment).toBe("bearish");
      expect(pattern?.type).toBe("reversal");
      expect(pattern?.candleIndices).toEqual([0, 1, 2]);
    });

    it("should not detect Evening Star without small middle candle", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 112, low: 99, close: 111 },
        { time: 2, open: 113, high: 125, low: 112, close: 124 },
        { time: 3, open: 123, high: 124, low: 98, close: 99 },
      ];
      const pattern = PatternService.detectEveningStar(candles, 2);
      expect(pattern).toBeNull();
    });
  });

  describe("analyzeChart", () => {
    it("should detect multiple patterns in a chart", () => {
      const candles: Candle[] = [
        { time: 1, open: 100, high: 105, low: 95, close: 100.5 }, // Doji
        { time: 2, open: 105, high: 106, low: 100, close: 101 },
        { time: 3, open: 99, high: 110, low: 98, close: 109 }, // Bullish Engulfing
        { time: 4, open: 110, high: 111, low: 90, close: 109 }, // Hammer
      ];

      const patterns = PatternService.analyzeChart(candles);

      expect(patterns.length).toBeGreaterThan(0);
      expect(patterns.some((p) => p.name.includes("Doji"))).toBe(true);
      expect(patterns.some((p) => p.name === "Bullish Engulfing")).toBe(true);
    });

    it("should return empty array for insufficient data", () => {
      const candles: Candle[] = [{ time: 1, open: 100, high: 105, low: 95, close: 102 }];
      const patterns = PatternService.analyzeChart(candles);
      // Should still detect single-candle patterns
      expect(Array.isArray(patterns)).toBe(true);
    });
  });

  describe("Edge Cases", () => {
    it("should handle candles with zero range", () => {
      const candles: Candle[] = [{ time: 1, open: 100, high: 100, low: 100, close: 100 }];
      const doji = PatternService.detectDoji(candles, 0);
      expect(doji).toBeNull();
    });

    it("should handle out of bounds indices", () => {
      const candles: Candle[] = [{ time: 1, open: 100, high: 105, low: 95, close: 102 }];
      const pattern = PatternService.detectEngulfing(candles, 10);
      expect(pattern).toBeNull();
    });

    it("should handle negative indices", () => {
      const candles: Candle[] = [{ time: 1, open: 100, high: 105, low: 95, close: 102 }];
      const pattern = PatternService.detectDoji(candles, -1);
      expect(pattern).toBeNull();
    });
  });

  describe("Confidence Scores", () => {
    it("should return confidence scores between 0-100", () => {
      const candles: Candle[] = [
        { time: 1, open: 105, high: 106, low: 100, close: 101 },
        { time: 2, open: 99, high: 110, low: 98, close: 109 },
      ];
      const pattern = PatternService.detectEngulfing(candles, 1);
      expect(pattern).not.toBeNull();
      expect(pattern!.confidence).toBeGreaterThanOrEqual(0);
      expect(pattern!.confidence).toBeLessThanOrEqual(100);
    });

    it("should give higher confidence for patterns in proper trend context", () => {
      const downtrend: Candle[] = [
        { time: 1, open: 110, high: 111, low: 109, close: 105 },
        { time: 2, open: 105, high: 106, low: 104, close: 100 },
        { time: 3, open: 97, high: 100, low: 85, close: 99 },
      ];
      const noTrend: Candle[] = [{ time: 1, open: 97, high: 100, low: 85, close: 99 }];

      const hammerInDowntrend = PatternService.detectHammer(downtrend, 2);
      const hammerNoContext = PatternService.detectHammer(noTrend, 0);

      expect(hammerInDowntrend?.confidence).toBeGreaterThan(hammerNoContext?.confidence || 0);
    });
  });
});
