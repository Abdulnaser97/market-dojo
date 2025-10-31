import { Title } from "@solidjs/meta";
import Nav from "~/components/layout/Nav";

export default function Learn() {
  return (
    <main>
      <Title>Learning Center - MarketDojo</Title>
      <Nav />

      <div style={{
        "max-width": "1200px",
        margin: "0 auto",
        padding: "2rem"
      }}>
        <h1 style={{ "margin-bottom": "2rem" }}>Learning Center</h1>

        <p style={{
          "font-size": "1.125rem",
          color: "var(--color-text-secondary)",
          "margin-bottom": "3rem"
        }}>
          Interactive lessons will be implemented in Phase 3
        </p>

        <div style={{
          display: "grid",
          "grid-template-columns": "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "1.5rem"
        }}>
          {["Candlestick Basics", "Support & Resistance", "Trend Lines", "Reversal Patterns", "Continuation Patterns", "Risk Management"].map((lesson) => (
            <div style={{
              padding: "1.5rem",
              "background-color": "var(--color-bg-secondary)",
              "border-radius": "0.75rem",
              border: "1px solid var(--color-border)",
              cursor: "pointer"
            }}>
              <h3 style={{ "margin-bottom": "0.5rem" }}>{lesson}</h3>
              <p style={{
                color: "var(--color-text-secondary)",
                "font-size": "0.875rem"
              }}>
                Coming soon...
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
