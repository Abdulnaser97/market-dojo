import { Title } from "@solidjs/meta";
import { A, useNavigate } from "@solidjs/router";
import { createSignal, Show } from "solid-js";
import Nav from "~/components/layout/Nav";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [name, setName] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal(false);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!email() || !password()) {
      setError("Email and password are required");
      return;
    }

    if (password() !== confirmPassword()) {
      setError("Passwords do not match");
      return;
    }

    if (password().length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email(),
          password: password(),
          name: name() || undefined,
        }),
      });

      const data = (await response.json()) as { success?: boolean; error?: string; message?: string };

      if (!response.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/login?registered=true");
      }, 1500);
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <main>
      <Title>Sign Up - MarketDojo</Title>
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
            "max-width": "450px",
            padding: "2rem",
            "background-color": "var(--color-bg-secondary)",
            "border-radius": "0.75rem",
            border: "1px solid var(--color-border)",
          }}
        >
          <h1 style={{ "margin-bottom": "1rem", "text-align": "center" }}>
            Create Your Account
          </h1>

          <p
            style={{
              "text-align": "center",
              color: "var(--color-text-secondary)",
              "margin-bottom": "2rem",
            }}
          >
            Start your trading education journey
          </p>

          <Show when={success()}>
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
              Account created! Redirecting to login...
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
                Name (optional)
              </label>
              <input
                type="text"
                placeholder="Your name"
                value={name()}
                onInput={(e) => setName(e.currentTarget.value)}
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
                Email *
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
                Password *
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
              <small
                style={{
                  display: "block",
                  "margin-top": "0.5rem",
                  color: "var(--color-text-secondary)",
                  "font-size": "0.875rem",
                }}
              >
                At least 8 characters
              </small>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  "margin-bottom": "0.5rem",
                  "font-weight": "500",
                }}
              >
                Confirm Password *
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword()}
                onInput={(e) => setConfirmPassword(e.currentTarget.value)}
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
              {loading() ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p
            style={{
              "margin-top": "1.5rem",
              "text-align": "center",
              color: "var(--color-text-secondary)",
            }}
          >
            Already have an account?{" "}
            <A href="/login" style={{ color: "var(--color-primary)" }}>
              Sign in
            </A>
          </p>
        </div>
      </div>
    </main>
  );
}
