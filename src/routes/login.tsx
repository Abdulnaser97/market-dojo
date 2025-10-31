import { Title } from "@solidjs/meta";
import { A, useNavigate, useSearchParams, revalidate } from "@solidjs/router";
import { createSignal, Show, onMount } from "solid-js";
import Nav from "~/components/layout/Nav";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [showRegistered, setShowRegistered] = createSignal(false);

  onMount(() => {
    if (searchParams.registered) {
      setShowRegistered(true);
      setTimeout(() => setShowRegistered(false), 5000);
    }
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    if (!email() || !password()) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email(),
          password: password(),
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string; user?: any };

      if (!response.ok) {
        setError(data.error || "Invalid email or password");
        setLoading(false);
        return;
      }

      // Successful login - revalidate session cache and redirect
      revalidate("nav-user-session");
      navigate("/profile");
    } catch (err) {
      console.error("Login error:", err);
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main>
      <Title>Sign In - MarketDojo</Title>
      <Nav />

      <div
        style={{
          display: "flex",
          "align-items": "center",
          "justify-content": "center",
          "min-height": "80vh",
          padding: "2rem",
        }}
      >
        <div
          style={{
            width: "100%",
            "max-width": "400px",
            padding: "2rem",
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h1 style={{ "margin-bottom": "2rem", "text-align": "center" }}>
            Sign In to MarketDojo
          </h1>

          <Show when={showRegistered()}>
            <div
              style={{
                padding: "1rem",
                "background-color": "rgba(16, 185, 129, 0.1)",
                border: "1px solid var(--color-success)",
                "border-radius": "0.5rem",
                "margin-bottom": "1.5rem",
                color: "var(--color-success)",
              }}
            >
              Account created successfully! Please sign in.
            </div>
          </Show>

          <Show when={error()}>
            <div
              style={{
                padding: "1rem",
                "background-color": "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--color-danger)",
                "border-radius": "0.5rem",
                "margin-bottom": "1.5rem",
                color: "var(--color-danger)",
              }}
            >
              {error()}
            </div>
          </Show>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", "flex-direction": "column", gap: "1.5rem" }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  "margin-bottom": "0.5rem",
                  "font-weight": "500",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email()}
                onInput={(e) => setEmail(e.currentTarget.value)}
                required
                disabled={loading()}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  "background-color": "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  "border-radius": "0.5rem",
                  color: "var(--color-text)",
                  "font-size": "1rem",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  "margin-bottom": "0.5rem",
                  "font-weight": "500",
                }}
              >
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password()}
                onInput={(e) => setPassword(e.currentTarget.value)}
                required
                disabled={loading()}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  "background-color": "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  "border-radius": "0.5rem",
                  color: "var(--color-text)",
                  "font-size": "1rem",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading()}
              style={{
                width: "100%",
                padding: "0.75rem",
                "background-color": loading()
                  ? "var(--color-border)"
                  : "var(--color-primary)",
                color: "white",
                border: "none",
                "border-radius": "0.5rem",
                "font-size": "1rem",
                "font-weight": "600",
                cursor: loading() ? "not-allowed" : "pointer",
              }}
            >
              {loading() ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              "margin-top": "1.5rem",
              "text-align": "center",
              color: "var(--color-text-secondary)",
            }}
          >
            Don't have an account?{" "}
            <A href="/register" style={{ color: "var(--color-primary)" }}>
              Sign up
            </A>
          </p>
        </div>
      </div>
    </main>
  );
}
