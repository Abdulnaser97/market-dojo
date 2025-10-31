# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MarketDojo is a trading education platform built with SolidStart and deployed on Cloudflare Workers. It combines interactive lessons, gamified pattern quizzes, and paper trading simulations to teach technical analysis and trading psychology.

## Tech Stack

- **Frontend**: SolidStart (Solid JS + Vite)
- **Charts**: Lightweight Charts (TradingView)
- **Auth**: Auth.js with email/password credentials and JWT sessions
- **ORM**: Drizzle ORM (SQLite dialect)
- **Database**: Cloudflare D1
- **Cache**: Cloudflare KV
- **Deployment**: Cloudflare Workers/Pages Functions
- **Dev Tools**: Wrangler, Miniflare

## Development Commands

```bash
# Install dependencies
pnpm install

# Set up local environment
cp .env.example .env
wrangler d1 migrations apply marketdojo_db --local
wrangler secret put AUTH_SECRET

# Run development server
pnpm dev

# Build for production
pnpm build

# Deploy to Cloudflare
wrangler deploy
```

## Architecture Overview

### Client-Heavy, Edge-Deployed Design

The platform separates concerns between lightweight SSR pages and intensive client-side game logic:

- **Learning Pages**: Server-rendered lessons with markdown/MDX content, minimal client JS
- **Game Island** (`/play` route): Fully client-rendered with lazy-loaded bundle containing:
  - Lightweight Charts for OHLCV visualization
  - Web Worker for simulation loop, quiz scheduling, and scoring
  - Main thread handles chart rendering, quiz dialogs, and HUD

### API Layer

Thin, stateless edge APIs under `/api/*`:
- `/api/auth/[...auth]` - Auth.js handler
- `/api/session/start` - Initialize quiz session
- `/api/session/submit` - Persist quiz results
- `/api/user/mastery` - Fetch adaptive learning data
- `/api/trade/order` - Submit simulated trades

### Data Architecture

**Cloudflare D1 Tables**:
- `users`, `accounts`, `sessions` - Auth.js tables
- `session_results` - Quiz outcomes
- `pattern_mastery` - Per-user accuracy scores and adaptive weights
- `lessons`, `lesson_progress` - Learning module tracking
- `portfolio`, `orders` - Paper trading state
- `historical_data` - Cached OHLCV data

**Cloudflare KV**: Ephemeral data (rate limits, active simulations, market snapshots, mastery cache, email verification throttles)

### Trading Simulation Engine

Client-side components (all run in browser):
- `SimulatorWorker` - Tick-by-tick OHLCV replay
- `TradeEngine` - Order processing and balance updates
- `ChartSync` - Main thread rendering coordination
- `PatternService` - Candlestick pattern detection for quizzes
- `ScoringEngine` - Performance tracking and mastery updates

Only final session summaries are persisted to D1 to minimize Worker CPU usage.

### Authentication Flow

1. User registers via `/login` with email + password
2. Auth.js validates using Drizzle Adapter → D1
3. JWT cookie set (HttpOnly, Secure, SameSite=Lax)
4. API requests verify JWT via Auth.js `getToken()`
5. User data scoped to account ID

## Key Design Principles

- **Edge-first**: All server logic runs on Cloudflare Workers for global low-latency
- **Client-heavy**: Intensive operations (charting, simulation, scoring) run in browser to minimize Worker costs
- **Stateless APIs**: No server-side session state beyond JWT validation
- **Adaptive learning**: Quiz difficulty and pattern selection based on per-user mastery data
- **Safe practice environment**: Paper trading with configurable risk settings, no real money

## Local Development Notes

- Wrangler provides local emulation of D1 and KV via Miniflare
- D1 migrations must be applied with `--local` flag for dev database
- Auth secrets stored via `wrangler secret put` (not in .env)
- Dev server runs SolidStart in Cloudflare's edge runtime adapter

## Project Structure

```
src/
├── routes/              # SolidStart routes & API endpoints
│   ├── api/
│   │   └── auth/[...auth].ts   # Auth.js handler
│   └── play/            # Client-island game route
├── components/          # UI & reusable components
├── game/                # Simulation engine, quiz logic
├── db/                  # Drizzle schema & client
├── lib/                 # Utilities (auth helpers, env)
└── styles/
migrations/              # SQL migrations for D1
public/
wrangler.toml            # Cloudflare bindings/config
drizzle.config.ts
```

## Wrangler Configuration

Bindings in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "marketdojo_db"

[[kv_namespaces]]
binding = "SESSION_KV"
id = "marketdojo-kv"
```

## Security Practices

- All secrets via `wrangler secret put`
- JWT lifespan ≈ 1 day with Auth.js refresh
- HttpOnly, Secure cookies with SameSite=Lax
- No sensitive financial data stored (educational platform only)
- Cloudflare provides TLS and edge encryption by default
