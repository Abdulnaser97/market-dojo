# 🥋 MarketDojo

**MarketDojo** is a trading education platform that helps users learn technical analysis, patterns, chart setups, and trading psychology through a mix of **interactive lessons**, **real-time quizzes**, and **paper trading simulations**.

Learn, practice, and level up your pattern recognition skills. Develop an intuition for market behavior and hone your ruleset in a safe, supportive environment.

## 🚀 Core Features

### 🧠 Learning Modules
- Concise, interactive lessons that explain trading concepts and price action patterns.
- Visual examples with annotated candlestick charts.
- Adaptive follow-up quizzes reinforce each topic.

### 🎮 Gamified Quizzes
- Randomized, timed challenges that appear during chart simulations.
- Multiple-choice recognition tasks (identify patterns/setups).
- Scoring system with streaks, levels, and mastery progression.
- AI-assisted adaptive difficulty that focuses on your weak spots.

### 💸 Paper Trading Simulator
- Simulated brokerage accounts with configurable **starting balance**, **risk settings**, and **leverage**.
- Historical or real-time market data playback (via Lightweight Charts).
- Users can open, modify, and close trades — tracking P/L and equity in real time.
- Perfect for learning risk management, order types, and emotional discipline.

### 🔐 Authentication
- **Email + password** login via [Auth.js (Web runtime)](https://authjs.dev) with **JWT sessions**.

### 🗄️ Data Storage
- **Cloudflare D1**: persistent user, session, and portfolio data.
- **Cloudflare KV**: ephemeral session caches, rate limits, and historical data seeds.

### ☁️ Deployment
- Fully hosted on **Cloudflare Workers** for edge-speed performance.


## 🧩 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | [SolidStart](https://start.solidjs.com) (Solid JS + Vite) |
| Charts | [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) |
| Auth | [Auth.js (Web)](https://authjs.dev) with email + password |
| ORM | [Drizzle ORM](https://orm.drizzle.team) (SQLite) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) via [Drizzle ORM](https://orm.drizzle.team) |
| Cache / KV Store | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| Deployment | [Cloudflare Workers / Pages Functions](https://developers.cloudflare.com/workers/) |
| Dev tools | [Wrangler](https://developers.cloudflare.com/workers/wrangler/), Miniflare |

---

## 🛠️ Local Development

1. Install dependencies
```bash
pnpm install
```
2. Set up environment
```bash
cp .env.example .env
wrangler d1 migrations apply marketdojo_db --local
wrangler secret put AUTH_SECRET
```
3. Run dev server
```bash
pnpm dev
```
This starts SolidStart in Cloudflare’s edge runtime with local emulation of D1 and KV via Miniflare.

🧱 Folder Structure
```bash
marketdojo/
├── src/
│   ├── routes/                # SolidStart routes & API endpoints
│   │   ├── api/
│   │   │   └── auth/[...auth].ts   # Auth.js handler
│   │   └── play/              # Client-island game route
│   ├── components/            # UI & reusable components
│   ├── game/                  # Simulation engine, quiz logic
│   ├── db/                    # Drizzle schema & client
│   ├── lib/                   # Utilities (auth helpers, env)
│   └── styles/
├── migrations/                # SQL migrations for D1
├── public/
├── wrangler.toml              # CF bindings/config
├── drizzle.config.ts
└── package.json
```

### How does `market-dojo` work under the hood?

Check out this interactive walkthrough of the `market-dojo` codebase on CodeCanvas [here](https://www.code-canvas.com/?session=unauthenticatedGithub&repo=market-dojo&owner=mrjpsilver&branch=main&OnboardingTutorial=true).

To refine existing dataflow simulation or create new ones, follow the quick tutorial [here](https://docs.code-canvas.com/updating-diagram).

<img width="1916" alt="CodeCanvas Screenshot" src="https://codecanvas-media-public.s3.amazonaws.com/images/codecanvas-readme-screenshot.png" />


🧪 Deployment
```bash
pnpm build
wrangler deploy
```
Cloudflare Workers automatically bind D1 and KV namespaces from wrangler.toml.
