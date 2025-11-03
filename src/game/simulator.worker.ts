/**
 * Simulator Web Worker
 * Handles tick-by-tick playback of historical candlestick data
 * Runs in separate thread to avoid blocking UI
 */

import type { CandlestickData } from "lightweight-charts";

// Message types for worker communication
export type WorkerMessageType =
  | "INIT"
  | "START"
  | "PAUSE"
  | "RESUME"
  | "STOP"
  | "SET_SPEED"
  | "RESET";

export type MainThreadMessageType =
  | "READY"
  | "TICK"
  | "COMPLETE"
  | "ERROR";

export interface WorkerMessage {
  type: WorkerMessageType;
  payload?: any;
}

export interface MainThreadMessage {
  type: MainThreadMessageType;
  payload?: any;
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
  };

  // Base interval in milliseconds (represents 1x speed)
  // For 1h candles, we'll use a faster playback (1 second per candle at 1x)
  private readonly BASE_INTERVAL = 1000;

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

    // Check if we've reached the end
    if (this.state.currentIndex >= this.state.data.length) {
      console.log("[Worker] Simulation complete");
      this.pause();
      this.sendMessage("COMPLETE", {
        totalCandles: this.state.data.length,
      });
      return;
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
