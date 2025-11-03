/**
 * Simulator Web Worker
 * Handles tick-by-tick playback of historical candlestick data
 * Runs in separate thread to avoid blocking UI
 */

import type { CandlestickData } from "lightweight-charts";
import { PatternService, type Pattern } from "./PatternService";

// Message types for worker communication
export type WorkerMessageType =
  | "INIT"
  | "START"
  | "PAUSE"
  | "RESUME"
  | "STOP"
  | "SET_SPEED"
  | "RESET"
  | "SUBMIT_ANSWER";

export type MainThreadMessageType =
  | "READY"
  | "TICK"
  | "COMPLETE"
  | "ERROR"
  | "QUIZ_EVENT";

export interface WorkerMessage {
  type: WorkerMessageType;
  payload?: any;
}

export interface MainThreadMessage {
  type: MainThreadMessageType;
  payload?: any;
}

export interface QuizData {
  question: string;
  options: Array<{ label: string; value: string }>;
  correctAnswer: string;
  explanation: string;
  pattern: Pattern;
  timeLimit: number;
}

/**
 * Simulation state
 */
interface SimulationState {
  data: CandlestickData[];
  currentIndex: number;
  speed: number;
  isPlaying: boolean;
  intervalId: number | null;
  nextQuizAt: number | null; // Index at which next quiz should appear
  quizActive: boolean;
}

/**
 * SimulatorWorker class - manages playback state and tick loop
 */
class SimulatorWorker {
  private state: SimulationState = {
    data: [],
    currentIndex: 0,
    speed: 1,
    isPlaying: false,
    intervalId: null,
    nextQuizAt: null,
    quizActive: false,
  };

  // Base interval in milliseconds (represents 1x speed)
  // For 1h candles, we'll use a faster playback (1 second per candle at 1x)
  private readonly BASE_INTERVAL = 1000;

  // Quiz interval range (in number of candles)
  private readonly MIN_QUIZ_INTERVAL = 8;
  private readonly MAX_QUIZ_INTERVAL = 45;

  // List of all pattern names for generating distractors
  private readonly PATTERN_NAMES = [
    "Doji",
    "Dragonfly Doji",
    "Gravestone Doji",
    "Long-legged Doji",
    "Hammer",
    "Hanging Man",
    "Shooting Star",
    "Inverted Hammer",
    "Bullish Engulfing",
    "Bearish Engulfing",
    "Bullish Harami",
    "Bearish Harami",
    "Piercing Line",
    "Dark Cloud Cover",
    "Morning Star",
    "Evening Star",
  ];

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.tick = this.tick.bind(this);
  }

  /**
   * Initialize worker with data
   */
  init(data: CandlestickData[]) {
    console.log("[Worker] Initializing with", data.length, "candles");
    this.state.data = data;
    this.state.currentIndex = 0;
    this.state.speed = 1;
    this.state.isPlaying = false;

    this.sendMessage("READY", {
      totalCandles: data.length,
    });
  }

  /**
   * Start the simulation
   */
  start() {
    if (this.state.data.length === 0) {
      this.sendMessage("ERROR", { message: "No data loaded" });
      return;
    }

    console.log("[Worker] Starting simulation");
    this.state.isPlaying = true;
    this.state.currentIndex = 0;
    this.state.quizActive = false;

    // Schedule the first quiz
    this.scheduleNextQuiz();

    this.startTickLoop();
  }

  /**
   * Pause the simulation
   */
  pause() {
    console.log("[Worker] Pausing simulation");
    this.state.isPlaying = false;
    this.stopTickLoop();
  }

  /**
   * Resume the simulation
   */
  resume() {
    console.log("[Worker] Resuming simulation");
    this.state.isPlaying = true;
    this.startTickLoop();
  }

  /**
   * Stop and reset the simulation
   */
  stop() {
    console.log("[Worker] Stopping simulation");
    this.state.isPlaying = false;
    this.state.currentIndex = 0;
    this.stopTickLoop();
  }

  /**
   * Reset to beginning
   */
  reset() {
    console.log("[Worker] Resetting simulation");
    this.stop();
    this.state.currentIndex = 0;
  }

  /**
   * Change playback speed
   */
  setSpeed(speed: number) {
    console.log("[Worker] Setting speed to", speed, "x");
    this.state.speed = speed;

    // Restart tick loop with new speed if playing
    if (this.state.isPlaying) {
      this.stopTickLoop();
      this.startTickLoop();
    }
  }

  /**
   * Schedule the next quiz at a random future index
   */
  private scheduleNextQuiz() {
    const randomInterval =
      Math.floor(Math.random() * (this.MAX_QUIZ_INTERVAL - this.MIN_QUIZ_INTERVAL + 1)) +
      this.MIN_QUIZ_INTERVAL;

    this.state.nextQuizAt = this.state.currentIndex + randomInterval;
    console.log(
      "[Worker] Next quiz scheduled at index",
      this.state.nextQuizAt,
      `(in ${randomInterval} candles)`
    );
  }

  /**
   * Generate a quiz based on detected patterns
   */
  private generateQuiz(): QuizData | null {
    // Need at least 3 candles for pattern detection
    if (this.state.currentIndex < 3) {
      console.log("[Worker] Not enough candles for pattern detection, currentIndex:", this.state.currentIndex);
      return null;
    }

    // Get the visible data up to current point
    const visibleData = this.state.data.slice(0, this.state.currentIndex + 1);
    console.log("[Worker] Detecting patterns in", visibleData.length, "candles");

    // Look backwards through the last 10 candles to find a pattern
    let pattern: any = null;
    const lookbackWindow = 10;
    const startIndex = Math.max(3, this.state.currentIndex - lookbackWindow);

    for (let i = this.state.currentIndex; i >= startIndex && !pattern; i--) {
      const patterns = PatternService.detectPatterns(visibleData, i);
      if (patterns.length > 0) {
        // Pick the pattern with highest confidence
        pattern = patterns.reduce((best, current) =>
          current.confidence > best.confidence ? current : best
        );
        console.log("[Worker] Found pattern at index", i, ":", pattern.name, "confidence:", pattern.confidence);
        break;
      }
    }

    if (!pattern) {
      console.log("[Worker] No patterns detected in lookback window");
      return null;
    }

    // Generate quiz question
    const question = "What candlestick pattern is forming here?";
    const correctAnswer = pattern.name;
    const distractors = this.generateDistractors(correctAnswer, 3);

    // Shuffle options
    const options = [
      { label: "A", value: correctAnswer },
      { label: "B", value: distractors[0] },
      { label: "C", value: distractors[1] },
      { label: "D", value: distractors[2] },
    ];

    // Fisher-Yates shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    // Re-assign labels after shuffle
    options.forEach((opt, idx) => {
      opt.label = String.fromCharCode(65 + idx); // A, B, C, D
    });

    // Generate explanation
    const explanation = this.generateExplanation(pattern);

    return {
      question,
      options,
      correctAnswer,
      explanation,
      pattern,
      timeLimit: 15, // 15 seconds to answer
    };
  }

  /**
   * Generate distractor answers (wrong options)
   */
  private generateDistractors(correctAnswer: string, count: number): string[] {
    const available = this.PATTERN_NAMES.filter((name) => name !== correctAnswer);
    const distractors: string[] = [];

    // Randomly select distractors
    while (distractors.length < count && available.length > 0) {
      const randomIndex = Math.floor(Math.random() * available.length);
      distractors.push(available[randomIndex]);
      available.splice(randomIndex, 1);
    }

    return distractors;
  }

  /**
   * Generate explanation text for a pattern
   */
  private generateExplanation(pattern: Pattern): string {
    const sentimentText =
      pattern.sentiment === "bullish"
        ? "typically signals a bullish reversal"
        : pattern.sentiment === "bearish"
          ? "typically signals a bearish reversal"
          : "indicates indecision in the market";

    return `The ${pattern.name} pattern ${sentimentText}. This is a ${pattern.type} pattern with ${pattern.confidence}% confidence based on the candlestick formation.`;
  }

  /**
   * Start the tick loop
   */
  private startTickLoop() {
    this.stopTickLoop(); // Clear any existing interval

    const interval = this.BASE_INTERVAL / this.state.speed;
    console.log("[Worker] Starting tick loop with interval:", interval, "ms (speed:", this.state.speed, "x)");

    this.state.intervalId = self.setInterval(() => {
      this.tick();
    }, interval) as unknown as number;
  }

  /**
   * Stop the tick loop
   */
  private stopTickLoop() {
    if (this.state.intervalId !== null) {
      self.clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }

  /**
   * Advance one tick (one candlestick)
   */
  private tick() {
    if (!this.state.isPlaying) {
      console.log("[Worker] tick() called but not playing");
      return;
    }

    // Skip ticks if quiz is active
    if (this.state.quizActive) {
      return;
    }

    // Check if we've reached the end
    if (this.state.currentIndex >= this.state.data.length) {
      console.log("[Worker] Simulation complete");
      this.pause();
      this.sendMessage("COMPLETE", {
        totalCandles: this.state.data.length,
      });
      return;
    }

    // Check if it's time for a quiz
    if (
      this.state.nextQuizAt !== null &&
      this.state.currentIndex >= this.state.nextQuizAt
    ) {
      console.log("[Worker] Quiz time! Current index:", this.state.currentIndex, "Quiz at:", this.state.nextQuizAt);
      const quiz = this.generateQuiz();
      if (quiz) {
        console.log("[Worker] Triggering quiz at index", this.state.currentIndex);
        this.state.quizActive = true;
        this.sendMessage("QUIZ_EVENT", quiz);
        return; // Don't advance candle while quiz is active
      } else {
        // Failed to generate quiz, schedule next one
        console.log("[Worker] Failed to generate quiz, rescheduling");
        this.scheduleNextQuiz();
      }
    }

    // Get the current candle and send it to main thread
    const candle = this.state.data[this.state.currentIndex];

    console.log("[Worker] Sending TICK", this.state.currentIndex, "/", this.state.data.length);
    this.sendMessage("TICK", {
      candle,
      index: this.state.currentIndex,
      total: this.state.data.length,
      progress: (this.state.currentIndex / this.state.data.length) * 100,
    });

    // Move to next candle
    this.state.currentIndex++;
  }

  /**
   * Handle messages from main thread
   */
  handleMessage(event: MessageEvent<WorkerMessage>) {
    const { type, payload } = event.data;

    switch (type) {
      case "INIT":
        this.init(payload.data);
        break;
      case "START":
        this.start();
        break;
      case "PAUSE":
        this.pause();
        break;
      case "RESUME":
        this.resume();
        break;
      case "STOP":
        this.stop();
        break;
      case "SET_SPEED":
        this.setSpeed(payload.speed);
        break;
      case "RESET":
        this.reset();
        break;
      case "SUBMIT_ANSWER":
        // User submitted an answer, deactivate quiz and schedule next one
        this.state.quizActive = false;
        this.scheduleNextQuiz();
        console.log("[Worker] Answer submitted, quiz deactivated");
        break;
      default:
        console.warn("[Worker] Unknown message type:", type);
    }
  }

  /**
   * Send message to main thread
   */
  private sendMessage(type: MainThreadMessageType, payload?: any) {
    const message: MainThreadMessage = { type, payload };
    self.postMessage(message);
  }
}

// Create worker instance and set up message listener
const worker = new SimulatorWorker();
self.addEventListener("message", worker.handleMessage);

// Export empty object to make TypeScript happy
export {};
