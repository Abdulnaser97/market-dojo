/**
 * GameHUD - Heads-Up Display for the trading game
 * Shows score, streak, timer, and playback controls
 */

export interface GameHUDProps {
  score?: number;
  streak?: number;
  timer?: string;
  speed?: number;
  isPaused?: boolean;
  hasStarted?: boolean;
  onSpeedChange?: (speed: number) => void;
  onPauseToggle?: () => void;
  onStart?: () => void;
}

export default function GameHUD(props: GameHUDProps) {
  const score = () => props.score ?? 0;
  const streak = () => props.streak ?? 0;
  const timer = () => props.timer ?? "00:00";
  const speed = () => props.speed ?? 1;
  const isPaused = () => props.isPaused ?? false;
  const hasStarted = () => props.hasStarted ?? false;

  const speedOptions = [1, 2, 5, 10];

  // Determine button state and action
  const getButtonConfig = () => {
    if (!hasStarted()) {
      return { label: "▶ Start", color: "var(--color-success)", action: () => props.onStart?.() };
    } else if (isPaused()) {
      return { label: "▶ Resume", color: "var(--color-success)", action: () => props.onPauseToggle?.() };
    } else {
      return { label: "⏸ Pause", color: "var(--color-warning)", action: () => props.onPauseToggle?.() };
    }
  };

  return (
    <div
      style={{
        width: "100%",
        "background-color": "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        "border-radius": "0.5rem",
        padding: "1rem 1.5rem",
        "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.1)",
        display: "flex",
        "align-items": "center",
        gap: "2rem",
        "flex-wrap": "wrap",
      }}
    >
      {/* Stats Section - Horizontal Layout */}
      <div style={{ display: "flex", gap: "2rem", flex: "1", "min-width": "300px" }}>
        {/* Score */}
        <div>
          <div
            style={{
              "font-size": "0.75rem",
              color: "var(--color-text-secondary)",
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-bottom": "0.25rem",
            }}
          >
            Score
          </div>
          <div
            style={{
              "font-size": "1.5rem",
              "font-weight": "bold",
              color: "var(--color-primary)",
            }}
          >
            {score().toLocaleString()}
          </div>
        </div>

        {/* Streak */}
        <div>
          <div
            style={{
              "font-size": "0.75rem",
              color: "var(--color-text-secondary)",
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-bottom": "0.25rem",
            }}
          >
            Streak
          </div>
          <div
            style={{
              "font-size": "1.25rem",
              "font-weight": "600",
              color: streak() >= 3 ? "var(--color-success)" : "var(--color-text-primary)",
            }}
          >
            {streak()} {streak() >= 3 ? "🔥" : ""}
          </div>
        </div>

        {/* Time */}
        <div>
          <div
            style={{
              "font-size": "0.75rem",
              color: "var(--color-text-secondary)",
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-bottom": "0.25rem",
            }}
          >
            Time
          </div>
          <div
            style={{
              "font-size": "1.25rem",
              "font-weight": "600",
              "font-variant-numeric": "tabular-nums",
            }}
          >
            {timer()}
          </div>
        </div>
      </div>

      {/* Vertical Divider */}
      <div
        style={{
          width: "1px",
          height: "3rem",
          "background-color": "var(--color-border)",
        }}
      />

      {/* Controls Section - Horizontal Layout */}
      <div style={{ display: "flex", gap: "1rem", "align-items": "center" }}>
        {/* Speed Controls */}
        <div style={{ display: "flex", gap: "0.5rem", "align-items": "center" }}>
          <span
            style={{
              "font-size": "0.75rem",
              color: "var(--color-text-secondary)",
              "text-transform": "uppercase",
              "letter-spacing": "0.05em",
              "margin-right": "0.25rem",
            }}
          >
            Speed
          </span>
          {speedOptions.map((speedOption) => (
            <button
              onClick={() => props.onSpeedChange?.(speedOption)}
              style={{
                padding: "0.5rem 0.75rem",
                "border-radius": "0.25rem",
                border: "1px solid var(--color-border)",
                "background-color":
                  speed() === speedOption
                    ? "var(--color-primary)"
                    : "var(--color-bg-primary)",
                color:
                  speed() === speedOption
                    ? "white"
                    : "var(--color-text-primary)",
                "font-weight": "600",
                "font-size": "0.875rem",
                cursor: "pointer",
                transition: "all 0.2s",
                "min-width": "3rem",
              }}
              onMouseEnter={(e) => {
                if (speed() !== speedOption) {
                  e.currentTarget.style.backgroundColor = "var(--color-bg-secondary)";
                }
              }}
              onMouseLeave={(e) => {
                if (speed() !== speedOption) {
                  e.currentTarget.style.backgroundColor = "var(--color-bg-primary)";
                }
              }}
            >
              {speedOption}x
            </button>
          ))}
        </div>

        {/* Start/Pause/Resume Button */}
        <button
          onClick={() => getButtonConfig().action()}
          style={{
            padding: "0.5rem 1.5rem",
            "border-radius": "0.25rem",
            border: "1px solid var(--color-border)",
            "background-color": getButtonConfig().color,
            color: "white",
            "font-weight": "600",
            "font-size": "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            "white-space": "nowrap",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = "1";
          }}
        >
          {getButtonConfig().label}
        </button>
      </div>
    </div>
  );
}
