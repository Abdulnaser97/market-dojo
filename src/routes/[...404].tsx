import { Title } from "@solidjs/meta";
import { A } from "@solidjs/router";
import { HttpStatusCode } from "@solidjs/start";

export default function NotFound() {
  return (
    <main>
      <Title>404 - Page Not Found</Title>
      <HttpStatusCode code={404} />

      <div style={{
        display: "flex",
        "flex-direction": "column",
        "align-items": "center",
        "justify-content": "center",
        "min-height": "100vh",
        padding: "2rem",
        "text-align": "center"
      }}>
        <h1 style={{
          "font-size": "6rem",
          "font-weight": "800",
          "margin-bottom": "1rem",
          color: "var(--color-text-secondary)"
        }}>
          404
        </h1>

        <h2 style={{ "margin-bottom": "1rem" }}>
          Page Not Found
        </h2>

        <p style={{
          color: "var(--color-text-secondary)",
          "margin-bottom": "2rem"
        }}>
          The page you're looking for doesn't exist.
        </p>

        <A href="/" style={{
          display: "inline-block",
          padding: "0.75rem 1.5rem",
          "background-color": "var(--color-primary)",
          color: "white",
          "border-radius": "0.5rem",
          "font-weight": "600",
          "text-decoration": "none"
        }}>
          Go Home
        </A>
      </div>
    </main>
  );
}
