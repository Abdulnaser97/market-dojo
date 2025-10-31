/**
 * Quiz questions for each lesson
 * Multiple choice questions to test understanding
 */

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option (0-based)
  explanation: string;
}

export interface LessonQuiz {
  lessonId: string;
  questions: QuizQuestion[];
}

export const lessonQuizzes: LessonQuiz[] = [
  // Lesson 1: Candlestick Anatomy
  {
    lessonId: "lesson-001",
    questions: [
      {
        id: "q1-1",
        question: "What four pieces of information does a candlestick show?",
        options: [
          "Open, Close, High, Low",
          "Buy, Sell, Volume, Price",
          "Support, Resistance, Trend, Range",
          "Moving Average, RSI, MACD, Volume",
        ],
        correctAnswer: 0,
        explanation: "A candlestick shows the Open, Close, High, and Low prices for a specific time period.",
      },
      {
        id: "q1-2",
        question: "What does a long upper wick (shadow) indicate?",
        options: [
          "Strong buying pressure",
          "Price rejection at higher levels",
          "Low volatility",
          "Trend continuation",
        ],
        correctAnswer: 1,
        explanation: "A long upper wick shows that price went higher but was rejected, indicating sellers pushing the price back down.",
      },
      {
        id: "q1-3",
        question: "The rectangular part of a candlestick is called the:",
        options: ["Wick", "Shadow", "Body", "Range"],
        correctAnswer: 2,
        explanation: "The body is the rectangular part showing the range between open and close prices.",
      },
    ],
  },
  // Lesson 2: Bullish vs Bearish Candles
  {
    lessonId: "lesson-002",
    questions: [
      {
        id: "q2-1",
        question: "A bullish candle indicates:",
        options: [
          "Close is lower than the open",
          "Close is higher than the open",
          "Open equals close",
          "Price is falling",
        ],
        correctAnswer: 1,
        explanation: "A bullish candle shows the close is higher than the open, indicating upward price movement and buying pressure.",
      },
      {
        id: "q2-2",
        question: "What does a long bearish body indicate?",
        options: [
          "Weak selling pressure",
          "Market indecision",
          "Strong selling pressure",
          "Bullish reversal",
        ],
        correctAnswer: 2,
        explanation: "A long bearish body shows very strong selling pressure with sellers in firm control during the period.",
      },
      {
        id: "q2-3",
        question: "A candle with a very small body suggests:",
        options: [
          "Strong trend continuation",
          "Indecision between buyers and sellers",
          "High volatility",
          "Clear market direction",
        ],
        correctAnswer: 1,
        explanation: "A small body indicates low volatility and indecision, with neither buyers nor sellers gaining significant control.",
      },
    ],
  },
  // Lesson 3: Doji Patterns
  {
    lessonId: "lesson-003",
    questions: [
      {
        id: "q3-1",
        question: "What is the key characteristic of a Doji pattern?",
        options: [
          "Very long body",
          "Open and close are at or near the same level",
          "No wicks present",
          "Always appears at market tops",
        ],
        correctAnswer: 1,
        explanation: "A Doji has little to no body because the open and close prices are at or very near the same level.",
      },
      {
        id: "q3-2",
        question: "A Dragonfly Doji is characterized by:",
        options: [
          "Long upper wick, no lower wick",
          "Long lower wick, little to no upper wick",
          "Equal wicks on both sides",
          "No wicks at all",
        ],
        correctAnswer: 1,
        explanation: "A Dragonfly Doji has a long lower wick showing sellers pushed price down, but buyers rejected the lows. It's typically bullish.",
      },
      {
        id: "q3-3",
        question: "When is a Doji most significant?",
        options: [
          "In the middle of a ranging market",
          "After a strong trend at key support/resistance",
          "On low volume days only",
          "Only on 1-minute charts",
        ],
        correctAnswer: 1,
        explanation: "Dojis are most significant after extended trends and at key levels, especially with confirmation from the next candle.",
      },
    ],
  },
  // Lesson 4: Hammer & Hanging Man
  {
    lessonId: "lesson-004",
    questions: [
      {
        id: "q4-1",
        question: "What distinguishes a Hammer from a Hanging Man?",
        options: [
          "Their shape is different",
          "The context: Hammer after downtrend, Hanging Man after uptrend",
          "The color of the candle",
          "The length of the wicks",
        ],
        correctAnswer: 1,
        explanation: "They look identical but appear in different contexts. Hammers signal bullish reversal after downtrends, Hanging Men signal bearish reversal after uptrends.",
      },
      {
        id: "q4-2",
        question: "Both Hammer and Hanging Man patterns require:",
        options: [
          "A green body only",
          "Very long upper wicks",
          "Long lower wick (2-3x body) with small upper wick",
          "No confirmation candle",
        ],
        correctAnswer: 2,
        explanation: "Both patterns need a long lower wick (at least 2x the body length) with little to no upper wick, regardless of body color.",
      },
      {
        id: "q4-3",
        question: "What confirms a Hammer pattern?",
        options: [
          "The next candle closes below the Hammer's low",
          "The next candle closes above the Hammer's high",
          "Volume decreases",
          "No confirmation needed",
        ],
        correctAnswer: 1,
        explanation: "A Hammer is confirmed when the next candle closes above the Hammer's high, showing buyers have taken control.",
      },
    ],
  },
  // Lesson 5: Engulfing Patterns
  {
    lessonId: "lesson-005",
    questions: [
      {
        id: "q5-1",
        question: "What defines an engulfing pattern?",
        options: [
          "One candle's body completely covers the previous candle's body",
          "Three candles in a row of the same color",
          "A candle with no wicks",
          "Two candles with equal bodies",
        ],
        correctAnswer: 0,
        explanation: "An engulfing pattern requires the second candle's body to completely engulf or cover the first candle's body.",
      },
      {
        id: "q5-2",
        question: "A Bullish Engulfing pattern consists of:",
        options: [
          "Large green candle followed by small red candle",
          "Small red candle followed by larger green candle",
          "Two green candles in a row",
          "Small green candle followed by larger red candle",
        ],
        correctAnswer: 1,
        explanation: "A Bullish Engulfing has a bearish (red) first candle followed by a larger bullish (green) candle that engulfs it.",
      },
      {
        id: "q5-3",
        question: "Engulfing patterns are strongest when:",
        options: [
          "They appear mid-trend with low volume",
          "After extended trends at key levels with high volume",
          "On 1-minute charts only",
          "The second candle is only slightly larger",
        ],
        correctAnswer: 1,
        explanation: "Engulfing patterns work best after clear trends, at support/resistance levels, with strong volume confirming conviction.",
      },
    ],
  },
  // Lesson 6: Morning Star & Evening Star
  {
    lessonId: "lesson-006",
    questions: [
      {
        id: "q6-1",
        question: "How many candles form a Morning Star pattern?",
        options: ["One", "Two", "Three", "Four"],
        correctAnswer: 2,
        explanation: "Morning Star and Evening Star patterns both require exactly three candles to form.",
      },
      {
        id: "q6-2",
        question: "In a Morning Star, the middle candle (the 'star') should be:",
        options: [
          "A large bullish candle",
          "A large bearish candle",
          "A small-bodied candle showing indecision",
          "Always a Doji",
        ],
        correctAnswer: 2,
        explanation: "The middle candle should have a small body (can be any color) showing weakening momentum. A Doji is ideal but not required.",
      },
      {
        id: "q6-3",
        question: "An Evening Star pattern signals:",
        options: [
          "Bullish reversal after downtrend",
          "Bearish reversal after uptrend",
          "Trend continuation",
          "Market consolidation",
        ],
        correctAnswer: 1,
        explanation: "An Evening Star appears after uptrends and signals a potential bearish reversal, warning that the top may be in.",
      },
    ],
  },
];

export function getQuizForLesson(lessonId: string): LessonQuiz | undefined {
  return lessonQuizzes.find((quiz) => quiz.lessonId === lessonId);
}
