# 🏗️ MarketDojo Architecture

## Overview

MarketDojo is a **client-heavy, edge-deployed learning platform** built with **SolidStart** and hosted on **Cloudflare Workers**.  
It combines **interactive lessons**, **gamified pattern quizzes**, and a **paper trading simulator**. The system separates **learning pages** (SSR, lightweight) from the **game island** (fully client-rendered and chart-intensive).
APIs are thin, stateless, and edge-native.

## High-Level Components
```bash
User
├─▶ SolidStart Web App (Cloudflare Workers)
│ ├─ Learning Pages (SSR)
│ ├─ Play Route (Client-only island)
│ └─ API Routes (/api/*)
│
├─▶ Cloudflare D1 (SQL database)
├─▶ Cloudflare KV (cache + ephemeral store)
└─▶ Auth.js (email/password, JWT sessions)
```

## Frontend Architecture

### Framework
- **SolidStart (Vite)**: routes, hydration, SSR.
- **Solid Router** for navigation; each “lesson” page uses standard SolidStart SSR.
- The `/play` route lazy-loads a **client-only game bundle** with charts and quiz logic.

### Learning Section
- Server-rendered lessons and visual explanations.
- Markdown/MDX-style content rendered dynamically.
- Linked with quiz results and adaptive recommendations from D1.

### Game Island
- **Lightweight Charts** for OHLCV visualization.
- **Web Worker** running:
  - Simulation loop (replays historical data)
  - Randomized quiz event scheduler (8–45 s)
  - Scoring logic and mastery updates
- Main thread renders:
  - Chart + overlays
  - Timed question dialogs (MCQs)
  - HUD (score, streak, timer)

### Paper Trading Simulator
- Simulates a broker account with configurable starting balance.
- Trades executed against **historical or simulated real-time data**.
- Order types: market, limit, stop, and trailing stop.
- P/L tracked locally, results posted to API on session completion.
- Designed to teach risk management, leverage, and position sizing.

### State
- **Solid signals** for UI reactivity.
- Persistent data (sessions, mastery) synced via API calls.

## Backend / API Layer

### Platform
- Runs on **Cloudflare Workers** or **Pages Functions**.
- Thin **API endpoints** under `/api/*` handle:
  - Auth.js routes (`/api/auth/[...auth]`)
  - `POST /api/session/start` → initialize quiz session
  - `POST /api/session/submit` → persist results
  - `GET /api/user/mastery` → fetch adaptive learning data
  - `POST /api/trade/order` → submit simulated trade (for paper trading)

### Authentication
- **Auth.js (Web runtime)** using **Drizzle Adapter** with D1.
- Strategy: `email + password` (custom credentials) + JWT sessions.
- JWT cookies verified per request in SolidStart loaders/actions.


## Data Layer

### Cloudflare D1 (SQL)
**Tables**
| Table | Purpose |
|--------|----------|
| `users` | Auth.js user accounts |
| `accounts` | OAuth/credentials linkage (Auth.js) |
| `sessions` *(optional)* | DB sessions if not JWT-only |
| `session_results` | Aggregated quiz outcomes |
| `pattern_mastery` | Per-user accuracy/weight scores |
| `lessons` | Static lesson metadata |
| `lesson_progress` | User progress in learning modules |
| `portfolio` | Paper trading positions, balances |
| `orders` | Individual simulated trade orders |
| `historical_data` | Cached OHLCV data (seeded or synthetic) |

### Cloudflare KV
- Short-lived or cached data:
  - Auth token rate-limits
  - Active simulation states
  - Market data snapshots
  - Cached mastery recommendations
  - Pre-computed game seeds
  - Email verification throttles

### ORM
- **Drizzle ORM (SQLite dialect)** → D1.
- Type-safe schema shared between app and migration scripts.

## Trading Simulation Engine

| Component | Responsibility |
|------------|----------------|
| `SimulatorWorker` | Manages tick-by-tick replay of OHLCV data |
| `TradeEngine` | Processes simulated orders and updates balances |
| `ChartSync` | Emits updates to the main thread for rendering |
| `PatternService` | Detects candlestick formations for quizzes |
| `ScoringEngine` | Tracks performance, time pressure, and accuracy |

All simulations run **client-side**.  
Only final session summaries are persisted to D1 to minimize Worker CPU usage.


## Auth Flow

1. User registers via `/login` (email + password).  
2. Auth.js validates credentials using Drizzle Adapter → D1.  
3. JWT cookie set on client (edge-signed).  
4. Each API request verifies JWT via `getToken()` in Auth.js.  
5. User progress, mastery, and trades are scoped to user account ID.


## Deployment Architecture

| Component | Location | Tech |
|------------|-----------|------|
| Frontend + API | Cloudflare Workers / Pages | SolidStart adapter |
| DB | Cloudflare D1 | Serverless SQLite |
| Cache | Cloudflare KV | Key-value store |
| Storage | Cloudflare R2 (future) | OHLCV historical data |
| Auth Secrets | Wrangler Secrets | Stored via `wrangler secret put` |
| Dev Emulation | Miniflare + Wrangler | Local D1 + KV simulation |

---

## Local Development

1. **Wrangler Config**
```toml
[[d1_databases]]
binding = "DB"
database_name = "marketdojo_db"

[[kv_namespaces]]
binding = "SESSION_KV"
id = "marketdojo-kv"
```

2. **Run**
```bash
pnpm dev        # SolidStart edge dev server
wrangler d1 migrations apply marketdojo_db --local
```

3. **Test Auth**
Visit /api/auth/signin (Auth.js route) — logs stored in Miniflare console.


## Security & Privacy
- All secrets managed via `wrangler secret put`.
- Auth cookies `HttpOnly`, `Secure`, `SameSite=Lax`.
- JWT lifespan ≈ 1 day, refresh via Auth.js.
- D1 data limited to educational metrics; no sensitive financial info.
- Cloudflare provides TLS + edge encryption by default.


## Scalability Notes
- D1 + KV free tier easily supports early-stage traffic (<100 users/day).
- All CPU-intensive logic (charting, simulation, scoring) runs client-side.
- APIs are stateless and edge-distributed for near-zero latency.


## Future Extensions
- Add **leaderboards** via KV + Durable Objects.
- Store **historical OHLCV** datasets in R2 or Durable Object storage.
- Integrate **WebSocket** channels for live events or multiplayer modes.
- Utilize **machine learning** for personalized mastery paths.
- Expand **broker simulation** with leverage, slippage, and commissions.
- Expand **Auth providers** (Google, Facebook, Apple).


MarketDojo aims to make trading education interactive, accessible, and fun. It combines the rigor of backtesting with the excitement of gameplay. It helps users practice safely, master technical setups, and grow their trading discipline.