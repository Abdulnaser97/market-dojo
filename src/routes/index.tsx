import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import Nav from "~/components/layout/Nav";

export default function Home() {
  return (
    <main>
      <Title>MarketDojo - Master Trading Through Practice</Title>
      <Nav />

      <div style={{
        "max-width": "1200px",
        margin: "0 auto",
        padding: "4rem 2rem",
        "text-align": "center"
      }}>
        <h1 style={{
          "font-size": "3.5rem",
          "font-weight": "800",
          "margin-bottom": "1.5rem",
          "background": "linear-gradient(to right, #3b82f6, #8b5cf6)",
          "-webkit-background-clip": "text",
          "-webkit-text-fill-color": "transparent",
          "background-clip": "text"
        }}>
          🥋 MarketDojo
        </h1>

        <p style={{
          "font-size": "1.5rem",
          "color": "var(--color-text-secondary)",
          "margin-bottom": "3rem",
          "max-width": "700px",
          "margin-left": "auto",
          "margin-right": "auto"
        }}>
          Master technical analysis and trading psychology through interactive lessons,
          gamified quizzes, and paper trading simulations.
        </p>

        <div style={{
          display: "flex",
          gap: "1rem",
          "justify-content": "center",
          "flex-wrap": "wrap"
        }}>
          <A href="/learn" style={{
            display: "inline-block",
            padding: "1rem 2rem",
            "background-color": "var(--color-primary)",
            color: "white",
            "border-radius": "0.5rem",
            "font-weight": "600",
            "text-decoration": "none",
            transition: "background-color 0.2s"
          }}>
            Start Learning
          </A>

          <A href="/login" style={{
            display: "inline-block",
            padding: "1rem 2rem",
            "background-color": "var(--color-bg-secondary)",
            color: "var(--color-text)",
            border: "1px solid var(--color-border)",
            "border-radius": "0.5rem",
            "font-weight": "600",
            "text-decoration": "none",
            transition: "background-color 0.2s"
          }}>
            Sign In
          </A>
        </div>

        <div style={{
          display: "grid",
          "grid-template-columns": "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "2rem",
          "margin-top": "4rem"
        }}>
          <div style={{
            padding: "2rem",
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)"
          }}>
            <div style={{ "font-size": "2rem", "margin-bottom": "1rem" }}>🧠</div>
            <h3 style={{ "margin-bottom": "0.5rem" }}>Interactive Lessons</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Learn candlestick patterns, chart setups, and price action with visual examples
            </p>
          </div>

          <div style={{
            padding: "2rem",
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)"
          }}>
            <div style={{ "font-size": "2rem", "margin-bottom": "1rem" }}>🎮</div>
            <h3 style={{ "margin-bottom": "0.5rem" }}>Gamified Quizzes</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Test your pattern recognition with timed challenges and adaptive difficulty
            </p>
          </div>

          <div style={{
            padding: "2rem",
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)"
          }}>
            <div style={{ "font-size": "2rem", "margin-bottom": "1rem" }}>💸</div>
            <h3 style={{ "margin-bottom": "0.5rem" }}>Paper Trading</h3>
            <p style={{ color: "var(--color-text-secondary)" }}>
              Practice with simulated accounts and learn risk management safely
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
