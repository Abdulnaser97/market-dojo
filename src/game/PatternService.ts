/**
 * PatternService - Candlestick pattern recognition
 *
 * Detects common trading patterns from OHLCV data
 */

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface Pattern {
  name: string;
  type: "reversal" | "continuation" | "neutral";
  confidence: number; // 0-100
  candleIndices: number[]; // Indices of candles forming the pattern
  sentiment: "bullish" | "bearish" | "neutral";
}

/**
 * Helper functions for candle analysis
 */
class CandleAnalyzer {
  /**
   * Calculate the body size of a candle
   */
  static bodySize(candle: Candle): number {
    return Math.abs(candle.close - candle.open);
  }

  /**
   * Calculate the full range (high to low)
   */
  static fullRange(candle: Candle): number {
    return candle.high - candle.low;
  }

  /**
   * Calculate upper shadow (wick above body)
   */
  static upperShadow(candle: Candle): number {
    return candle.high - Math.max(candle.open, candle.close);
  }

  /**
   * Calculate lower shadow (wick below body)
   */
  static lowerShadow(candle: Candle): number {
    return Math.min(candle.open, candle.close) - candle.low;
  }

  /**
   * Check if candle is bullish (close > open)
   */
  static isBullish(candle: Candle): boolean {
    return candle.close > candle.open;
  }

  /**
   * Check if candle is bearish (close < open)
   */
  static isBearish(candle: Candle): boolean {
    return candle.close < candle.open;
  }

  /**
   * Calculate body/range ratio
   */
  static bodyRatio(candle: Candle): number {
    const range = this.fullRange(candle);
    if (range === 0) return 0;
    return this.bodySize(candle) / range;
  }

  /**
   * Check if body is small relative to range
   */
  static hasSmallBody(candle: Candle, threshold = 0.3): boolean {
    return this.bodyRatio(candle) < threshold;
  }

  /**
   * Check if body is large relative to range
   */
  static hasLargeBody(candle: Candle, threshold = 0.7): boolean {
    return this.bodyRatio(candle) > threshold;
  }

  /**
   * Calculate average body size of multiple candles
   */
  static averageBodySize(candles: Candle[]): number {
    if (candles.length === 0) return 0;
    const sum = candles.reduce((acc, c) => acc + this.bodySize(c), 0);
    return sum / candles.length;
  }

  /**
   * Calculate average range of multiple candles
   */
  static averageRange(candles: Candle[]): number {
    if (candles.length === 0) return 0;
    const sum = candles.reduce((acc, c) => acc + this.fullRange(c), 0);
    return sum / candles.length;
  }
}

/**
 * Main Pattern Detection Service
 */
export class PatternService {
  /**
   * Detect all patterns in a sliding window
   */
  static detectPatterns(candles: Candle[], startIndex: number): Pattern[] {
    if (startIndex < 0 || startIndex >= candles.length) return [];

    const patterns: Pattern[] = [];

    // Single candle patterns (need at least 1 candle)
    if (startIndex >= 0) {
      const doji = this.detectDoji(candles, startIndex);
      if (doji) patterns.push(doji);

      const hammer = this.detectHammer(candles, startIndex);
      if (hammer) patterns.push(hammer);

      const shootingStar = this.detectShootingStar(candles, startIndex);
      if (shootingStar) patterns.push(shootingStar);
    }

    // Two candle patterns (need at least 2 candles)
    if (startIndex >= 1) {
      const engulfing = this.detectEngulfing(candles, startIndex);
      if (engulfing) patterns.push(engulfing);

      const harami = this.detectHarami(candles, startIndex);
      if (harami) patterns.push(harami);

      const piercingLine = this.detectPiercingLine(candles, startIndex);
      if (piercingLine) patterns.push(piercingLine);

      const darkCloudCover = this.detectDarkCloudCover(candles, startIndex);
      if (darkCloudCover) patterns.push(darkCloudCover);
    }

    // Three candle patterns (need at least 3 candles)
    if (startIndex >= 2) {
      const morningStar = this.detectMorningStar(candles, startIndex);
      if (morningStar) patterns.push(morningStar);

      const eveningStar = this.detectEveningStar(candles, startIndex);
      if (eveningStar) patterns.push(eveningStar);
    }

    return patterns;
  }

  /**
   * SINGLE CANDLE PATTERNS
   */

  /**
   * Detect Doji patterns (all variants)
   * Doji has very small body, indicates indecision
   */
  static detectDoji(candles: Candle[], index: number): Pattern | null {
    if (index < 0 || index >= candles.length) return null;

    const candle = candles[index];
    const bodySize = CandleAnalyzer.bodySize(candle);
    const range = CandleAnalyzer.fullRange(candle);

    // Body must be very small (< 5% of range)
    if (range === 0 || bodySize / range > 0.05) return null;

    const upperShadow = CandleAnalyzer.upperShadow(candle);
    const lowerShadow = CandleAnalyzer.lowerShadow(candle);

    let dojiType = "Doji";
    let confidence = 70;

    // Dragonfly Doji - long lower shadow, no upper shadow
    if (lowerShadow > range * 0.6 && upperShadow < range * 0.1) {
      dojiType = "Dragonfly Doji";
      confidence = 80;
    }
    // Gravestone Doji - long upper shadow, no lower shadow
    else if (upperShadow > range * 0.6 && lowerShadow < range * 0.1) {
      dojiType = "Gravestone Doji";
      confidence = 80;
    }
    // Long-legged Doji - both shadows are long
    else if (upperShadow > range * 0.3 && lowerShadow > range * 0.3) {
      dojiType = "Long-legged Doji";
      confidence = 75;
    }

    return {
      name: dojiType,
      type: "neutral",
      confidence,
      candleIndices: [index],
      sentiment: "neutral",
    };
  }

  /**
   * Detect Hammer pattern
   * Bullish reversal: small body at top, long lower shadow
   */
  static detectHammer(candles: Candle[], index: number): Pattern | null {
    if (index < 0 || index >= candles.length) return null;

    const candle = candles[index];
    const bodySize = CandleAnalyzer.bodySize(candle);
    const range = CandleAnalyzer.fullRange(candle);
    const lowerShadow = CandleAnalyzer.lowerShadow(candle);
    const upperShadow = CandleAnalyzer.upperShadow(candle);

    if (range === 0) return null;

    // Lower shadow should be at least 2x body size
    if (lowerShadow < bodySize * 2) return null;

    // Upper shadow should be small
    if (upperShadow > bodySize * 0.5) return null;

    // Body should be in upper part of range
    const bodyTop = Math.max(candle.open, candle.close);
    if ((candle.high - bodyTop) > range * 0.15) return null;

    // Check if we're in a downtrend (look at previous candles)
    let isDowntrend = false;
    if (index >= 2) {
      const prevCandle = candles[index - 1];
      const prevPrevCandle = candles[index - 2];
      isDowntrend = prevCandle.close < prevPrevCandle.close;
    }

    const confidence = isDowntrend ? 85 : 70;

    // Hammer is typically bullish, but if it appears after uptrend it's a Hanging Man (bearish)
    const isHangingMan = index >= 2 && candles[index - 1].close > candles[index - 2].close;

    if (isHangingMan) {
      return {
        name: "Hanging Man",
        type: "reversal",
        confidence,
        candleIndices: [index],
        sentiment: "bearish",
      };
    }

    return {
      name: "Hammer",
      type: "reversal",
      confidence,
      candleIndices: [index],
      sentiment: "bullish",
    };
  }

  /**
   * Detect Shooting Star pattern
   * Bearish reversal: small body at bottom, long upper shadow
   */
  static detectShootingStar(candles: Candle[], index: number): Pattern | null {
    if (index < 0 || index >= candles.length) return null;

    const candle = candles[index];
    const bodySize = CandleAnalyzer.bodySize(candle);
    const range = CandleAnalyzer.fullRange(candle);
    const upperShadow = CandleAnalyzer.upperShadow(candle);
    const lowerShadow = CandleAnalyzer.lowerShadow(candle);

    if (range === 0) return null;

    // Upper shadow should be at least 2x body size
    if (upperShadow < bodySize * 2) return null;

    // Lower shadow should be small
    if (lowerShadow > bodySize * 0.5) return null;

    // Body should be in lower part of range
    const bodyBottom = Math.min(candle.open, candle.close);
    if ((bodyBottom - candle.low) > range * 0.15) return null;

    // Check if we're in an uptrend
    let isUptrend = false;
    if (index >= 2) {
      const prevCandle = candles[index - 1];
      const prevPrevCandle = candles[index - 2];
      isUptrend = prevCandle.close > prevPrevCandle.close;
    }

    const confidence = isUptrend ? 85 : 70;

    // Shooting Star is bearish, but if after downtrend it's an Inverted Hammer (bullish)
    const isInvertedHammer = index >= 2 && candles[index - 1].close < candles[index - 2].close;

    if (isInvertedHammer) {
      return {
        name: "Inverted Hammer",
        type: "reversal",
        confidence,
        candleIndices: [index],
        sentiment: "bullish",
      };
    }

    return {
      name: "Shooting Star",
      type: "reversal",
      confidence,
      candleIndices: [index],
      sentiment: "bearish",
    };
  }

  /**
   * TWO CANDLE PATTERNS
   */

  /**
   * Detect Engulfing patterns
   * Strong reversal: second candle completely engulfs first
   */
  static detectEngulfing(candles: Candle[], index: number): Pattern | null {
    if (index < 1 || index >= candles.length) return null;

    const current = candles[index];
    const previous = candles[index - 1];

    const currentIsBullish = CandleAnalyzer.isBullish(current);
    const previousIsBullish = CandleAnalyzer.isBullish(previous);

    // Must be opposite colors
    if (currentIsBullish === previousIsBullish) return null;

    const currentBody = CandleAnalyzer.bodySize(current);
    const previousBody = CandleAnalyzer.bodySize(previous);

    // Current body should be significantly larger
    if (currentBody < previousBody * 1.5) return null;

    // Check if current engulfs previous
    const currentTop = Math.max(current.open, current.close);
    const currentBottom = Math.min(current.open, current.close);
    const previousTop = Math.max(previous.open, previous.close);
    const previousBottom = Math.min(previous.open, previous.close);

    const engulfs = currentTop > previousTop && currentBottom < previousBottom;
    if (!engulfs) return null;

    if (currentIsBullish) {
      return {
        name: "Bullish Engulfing",
        type: "reversal",
        confidence: 85,
        candleIndices: [index - 1, index],
        sentiment: "bullish",
      };
    } else {
      return {
        name: "Bearish Engulfing",
        type: "reversal",
        confidence: 85,
        candleIndices: [index - 1, index],
        sentiment: "bearish",
      };
    }
  }

  /**
   * Detect Harami patterns
   * Reversal: small candle inside previous large candle
   */
  static detectHarami(candles: Candle[], index: number): Pattern | null {
    if (index < 1 || index >= candles.length) return null;

    const current = candles[index];
    const previous = candles[index - 1];

    const currentIsBullish = CandleAnalyzer.isBullish(current);
    const previousIsBullish = CandleAnalyzer.isBullish(previous);

    // Should be opposite colors
    if (currentIsBullish === previousIsBullish) return null;

    const currentBody = CandleAnalyzer.bodySize(current);
    const previousBody = CandleAnalyzer.bodySize(previous);

    // Current should be smaller
    if (currentBody > previousBody * 0.7) return null;

    // Check if current is inside previous body
    const currentTop = Math.max(current.open, current.close);
    const currentBottom = Math.min(current.open, current.close);
    const previousTop = Math.max(previous.open, previous.close);
    const previousBottom = Math.min(previous.open, previous.close);

    const isInside = currentTop < previousTop && currentBottom > previousBottom;
    if (!isInside) return null;

    if (currentIsBullish) {
      return {
        name: "Bullish Harami",
        type: "reversal",
        confidence: 75,
        candleIndices: [index - 1, index],
        sentiment: "bullish",
      };
    } else {
      return {
        name: "Bearish Harami",
        type: "reversal",
        confidence: 75,
        candleIndices: [index - 1, index],
        sentiment: "bearish",
      };
    }
  }

  /**
   * Detect Piercing Line pattern
   * Bullish reversal: bearish followed by bullish that closes above midpoint
   */
  static detectPiercingLine(candles: Candle[], index: number): Pattern | null {
    if (index < 1 || index >= candles.length) return null;

    const current = candles[index];
    const previous = candles[index - 1];

    // Previous must be bearish, current must be bullish
    if (!CandleAnalyzer.isBearish(previous) || !CandleAnalyzer.isBullish(current)) {
      return null;
    }

    // Current should open below previous close
    if (current.open >= previous.close) return null;

    // Current should close above midpoint of previous body
    const previousMidpoint = (previous.open + previous.close) / 2;
    if (current.close < previousMidpoint) return null;

    // But not completely engulf (that's a different pattern)
    if (current.close >= previous.open) return null;

    return {
      name: "Piercing Line",
      type: "reversal",
      confidence: 80,
      candleIndices: [index - 1, index],
      sentiment: "bullish",
    };
  }

  /**
   * Detect Dark Cloud Cover pattern
   * Bearish reversal: bullish followed by bearish that closes below midpoint
   */
  static detectDarkCloudCover(candles: Candle[], index: number): Pattern | null {
    if (index < 1 || index >= candles.length) return null;

    const current = candles[index];
    const previous = candles[index - 1];

    // Previous must be bullish, current must be bearish
    if (!CandleAnalyzer.isBullish(previous) || !CandleAnalyzer.isBearish(current)) {
      return null;
    }

    // Current should open above previous close
    if (current.open <= previous.close) return null;

    // Current should close below midpoint of previous body
    const previousMidpoint = (previous.open + previous.close) / 2;
    if (current.close > previousMidpoint) return null;

    // But not completely engulf
    if (current.close <= previous.open) return null;

    return {
      name: "Dark Cloud Cover",
      type: "reversal",
      confidence: 80,
      candleIndices: [index - 1, index],
      sentiment: "bearish",
    };
  }

  /**
   * THREE CANDLE PATTERNS
   */

  /**
   * Detect Morning Star pattern
   * Bullish reversal: bearish, small body, bullish
   */
  static detectMorningStar(candles: Candle[], index: number): Pattern | null {
    if (index < 2 || index >= candles.length) return null;

    const first = candles[index - 2];
    const second = candles[index - 1];
    const third = candles[index];

    // First should be bearish
    if (!CandleAnalyzer.isBearish(first)) return null;

    // Third should be bullish
    if (!CandleAnalyzer.isBullish(third)) return null;

    // Second should have small body (star)
    if (!CandleAnalyzer.hasSmallBody(second, 0.3)) return null;

    // Second should gap down from first
    const secondTop = Math.max(second.open, second.close);
    const firstBottom = Math.min(first.open, first.close);
    if (secondTop >= firstBottom) return null;

    // Third should close well into first's body
    const firstMidpoint = (first.open + first.close) / 2;
    if (third.close < firstMidpoint) return null;

    return {
      name: "Morning Star",
      type: "reversal",
      confidence: 85,
      candleIndices: [index - 2, index - 1, index],
      sentiment: "bullish",
    };
  }

  /**
   * Detect Evening Star pattern
   * Bearish reversal: bullish, small body, bearish
   */
  static detectEveningStar(candles: Candle[], index: number): Pattern | null {
    if (index < 2 || index >= candles.length) return null;

    const first = candles[index - 2];
    const second = candles[index - 1];
    const third = candles[index];

    // First should be bullish
    if (!CandleAnalyzer.isBullish(first)) return null;

    // Third should be bearish
    if (!CandleAnalyzer.isBearish(third)) return null;

    // Second should have small body (star)
    if (!CandleAnalyzer.hasSmallBody(second, 0.3)) return null;

    // Second should gap up from first
    const secondBottom = Math.min(second.open, second.close);
    const firstTop = Math.max(first.open, first.close);
    if (secondBottom <= firstTop) return null;

    // Third should close well into first's body
    const firstMidpoint = (first.open + first.close) / 2;
    if (third.close > firstMidpoint) return null;

    return {
      name: "Evening Star",
      type: "reversal",
      confidence: 85,
      candleIndices: [index - 2, index - 1, index],
      sentiment: "bearish",
    };
  }

  /**
   * Analyze chart data with sliding window
   * Returns all detected patterns with their positions
   */
  static analyzeChart(candles: Candle[]): Pattern[] {
    const allPatterns: Pattern[] = [];

    // Start from index 2 to allow for 3-candle patterns
    for (let i = 2; i < candles.length; i++) {
      const patterns = this.detectPatterns(candles, i);
      allPatterns.push(...patterns);
    }

    return allPatterns;
  }
}
