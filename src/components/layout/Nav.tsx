import { A, useNavigate, cache, createAsync, revalidate } from "@solidjs/router";
import { Show, createSignal, onMount, onCleanup } from "solid-js";
import { getSession } from "~/lib/auth";

const getUserSession = cache(async () => {
  "use server";
  return await getSession();
}, "nav-user-session");

export default function Nav() {
  const navigate = useNavigate();
  const session = createAsync(() => getUserSession());
  const [dropdownOpen, setDropdownOpen] = createSignal(false);

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-user-menu]')) {
      setDropdownOpen(false);
    }
  };

  // Add/remove click listener (client-side only)
  onMount(() => {
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setDropdownOpen(false);
      revalidate("nav-user-session");
      navigate("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <nav
      style={{
        display: "flex",
        "align-items": "center",
        "justify-content": "space-between",
        padding: "1rem 2rem",
        "border-bottom": "1px solid var(--color-border)",
        "background-color": "var(--color-bg-secondary)",
      }}
    >
      <A
        href="/"
        style={{
          "font-size": "1.5rem",
          "font-weight": "700",
          "text-decoration": "none",
          display: "flex",
          "align-items": "center",
          gap: "0.5rem",
        }}
      >
        <span>🥋</span>
        <span>MarketDojo</span>
      </A>

      <div
        style={{
          display: "flex",
          gap: "2rem",
          "align-items": "center",
        }}
      >
        <A href="/learn" style={{ "font-weight": "500", "text-decoration": "none" }}>
          Learn
        </A>

        <A href="/play" style={{ "font-weight": "500", "text-decoration": "none" }}>
          Play
        </A>

        <Show
          when={session()?.user}
          fallback={
            <A
              href="/login"
              style={{
                padding: "0.5rem 1rem",
                "background-color": "var(--color-primary)",
                color: "white",
                "border-radius": "0.375rem",
                "font-weight": "500",
                "text-decoration": "none",
              }}
            >
              Sign In
            </A>
          }
        >
          {(user) => (
            <div style={{ position: "relative" }} data-user-menu>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen())}
                style={{
                  padding: "0.5rem 1rem",
                  "background-color": "var(--color-bg)",
                  border: "1px solid var(--color-border)",
                  "border-radius": "0.375rem",
                  "font-weight": "500",
                  display: "flex",
                  "align-items": "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                  color: "var(--color-text)",
                }}
              >
                <div
                  style={{
                    width: "2rem",
                    height: "2rem",
                    "border-radius": "50%",
                    "background-color": "var(--color-primary)",
                    color: "white",
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    "font-weight": "600",
                    "font-size": "0.875rem",
                  }}
                >
                  {user().email?.[0]?.toUpperCase() || "U"}
                </div>
                <span>{user().email}</span>
                <svg
                  style={{
                    width: "1rem",
                    height: "1rem",
                    transform: dropdownOpen() ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <Show when={dropdownOpen()}>
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 0.5rem)",
                    right: "0",
                    "background-color": "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    "border-radius": "0.5rem",
                    "box-shadow": "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    "min-width": "200px",
                    overflow: "hidden",
                    "z-index": "50",
                  }}
                >
                  <A
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "0.75rem 1rem",
                      "text-decoration": "none",
                      color: "var(--color-text)",
                      "border-bottom": "1px solid var(--color-border)",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div style={{ display: "flex", "align-items": "center", gap: "0.75rem" }}>
                      <svg
                        style={{ width: "1.25rem", height: "1.25rem" }}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </A>

                  <button
                    onClick={handleSignOut}
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      "text-align": "left",
                      border: "none",
                      "background-color": "transparent",
                      color: "var(--color-danger)",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      display: "flex",
                      "align-items": "center",
                      gap: "0.75rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--color-bg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <svg
                      style={{ width: "1.25rem", height: "1.25rem" }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              </Show>
            </div>
          )}
        </Show>
      </div>
    </nav>
  );
}
