# MarketDojo Build Plan

This document outlines a phased approach to building MarketDojo from scratch.

---

## Phase 1: Foundation & Project Setup

**Goal**: Create a working SolidStart + Cloudflare Workers development environment

### Tasks

1. **Initialize SolidStart Project**
   - Run `pnpm create solid@latest` with Cloudflare Workers preset
   - Configure TypeScript with strict mode
   - Set up path aliases (`@/*` → `src/*`)

2. **Configure Wrangler**
   - Create `wrangler.toml` with D1 and KV bindings
   - Set up local D1 database: `marketdojo_db`
   - Set up local KV namespace: `SESSION_KV`
   - Configure compatibility date and flags

3. **Project Structure**
   ```
   src/
   ├── routes/
   │   ├── index.tsx           # Landing page
   │   ├── login.tsx           # Login/register page
   │   └── api/                # API routes
   ├── components/
   │   ├── ui/                 # Base UI components
   │   └── layout/             # Layout components (Nav, Footer)
   ├── lib/
   │   ├── auth.ts             # Auth helpers
   │   └── env.ts              # Environment utilities
   ├── db/
   │   ├── schema.ts           # Drizzle schema
   │   └── client.ts           # DB client
   └── styles/
       └── global.css
   ```

4. **Development Tooling**
   - Add ESLint + TypeScript ESLint
   - Add Prettier with config
   - Create `.env.example` with required vars
   - Add scripts to `package.json`:
     - `dev`: Run Wrangler dev server
     - `build`: Build for production
     - `deploy`: Deploy to Cloudflare
     - `db:migrate`: Apply migrations locally
     - `db:studio`: Open Drizzle Studio

5. **Basic Routing**
   - Create landing page (`/`)
   - Create placeholder login page (`/login`)
   - Create 404 page
   - Add basic navigation component

**Deliverables**:
- ✅ `pnpm dev` runs successfully
- ✅ Can navigate between pages
- ✅ TypeScript compiles with no errors
- ✅ Wrangler bindings accessible in dev mode

---

## Phase 2: Database & Authentication

**Goal**: Complete auth system with user registration, login, and protected routes

### Tasks

1. **Drizzle Schema Definition**
   - Define all D1 tables in `src/db/schema.ts`:
     - `users` (id, email, password_hash, created_at)
     - `accounts` (Auth.js table)
     - `sessions` (Auth.js table, optional if using JWT-only)
     - `verification_tokens` (Auth.js table)
     - `session_results` (id, user_id, score, patterns_tested, duration, created_at)
     - `pattern_mastery` (id, user_id, pattern_name, accuracy, weight, last_seen)
     - `lessons` (id, slug, title, content, order, category)
     - `lesson_progress` (user_id, lesson_id, completed, last_accessed)
     - `portfolio` (id, user_id, balance, equity, open_positions)
     - `orders` (id, portfolio_id, symbol, type, side, quantity, price, status, created_at)
     - `historical_data` (symbol, timeframe, timestamp, open, high, low, close, volume)

2. **Database Migrations**
   - Create `migrations/` directory
   - Generate initial migration: `drizzle-kit generate:sqlite`
   - Apply to local D1: `wrangler d1 migrations apply marketdojo_db --local`
   - Create script for seeding sample lesson data

3. **Auth.js Setup**
   - Install dependencies: `@auth/core`, `@auth/drizzle-adapter`
   - Create `src/routes/api/auth/[...auth].ts` handler
   - Configure Credentials provider with email/password
   - Set up Drizzle adapter for D1
   - Configure JWT sessions with 1-day expiry
   - Add secure cookie settings (HttpOnly, Secure, SameSite)

4. **Auth Helpers**
   - Create `src/lib/auth.ts`:
     - `getSession()` - Extract session from request
     - `requireAuth()` - Middleware for protected routes
     - `hashPassword()` - bcrypt wrapper
     - `verifyPassword()` - bcrypt compare

5. **Login/Register UI**
   - Build `/login` page with:
     - Email/password form
     - Client-side validation
     - Error handling
     - Loading states
   - Build `/register` page with:
     - Email/password/confirm fields
     - Password strength indicator
     - Terms acceptance checkbox
   - Add redirect logic (authenticated users → `/learn`)

6. **Protected Routes**
   - Create `src/lib/middleware.ts` for auth checks
   - Protect `/learn`, `/play`, `/profile` routes
   - Add redirect to `/login` for unauthenticated users
   - Create user menu component (avatar, logout)

7. **User Profile**
   - Create `/profile` route
   - Display user stats (lessons completed, quiz accuracy, trading stats)
   - Add settings (change password, delete account)

**Deliverables**:
- ✅ Users can register with email/password
- ✅ Users can login and receive JWT cookie
- ✅ Protected routes redirect unauthenticated users
- ✅ Database schema applied and queryable
- ✅ Session persists across page reloads

**Testing Checklist**:
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login fails with incorrect credentials
- [ ] Access protected route (should work when logged in)
- [ ] Logout clears session
- [ ] Access protected route after logout (should redirect)

---

## Phase 3: Learning Module (SSR Pages)

**Goal**: Build interactive lesson system with progress tracking and basic quizzes

### Tasks

1. **Lesson Content System**
   - Design lesson content format (Markdown with frontmatter or JSON)
   - Create sample lessons:
     - "Introduction to Candlesticks"
     - "Support and Resistance"
     - "Trend Lines and Channels"
     - "Common Reversal Patterns" (Hammer, Shooting Star, Engulfing)
     - "Common Continuation Patterns" (Flags, Pennants)
   - Store lessons in D1 or as static files with DB metadata

2. **Lesson List Page**
   - Create `/learn` route (SSR)
   - Fetch lessons from D1 with progress indicators
   - Group by category (Basics, Patterns, Psychology, Risk Management)
   - Show completion badges
   - Display recommended next lesson (adaptive)

3. **Lesson Detail Page**
   - Create `/learn/[slug]` route (SSR)
   - Render lesson content (Markdown → HTML)
   - Add syntax highlighting for any code examples
   - Include annotated chart images (static PNGs initially)
   - Add previous/next navigation
   - Track `last_accessed` timestamp

4. **Basic Quiz Component**
   - Create `<Quiz>` component for end-of-lesson quizzes
   - Question types:
     - Multiple choice (4 options)
     - Image-based (show chart, identify pattern)
   - Non-timed, static questions
   - Immediate feedback (correct/incorrect)
   - Explanation after each answer

5. **Progress Tracking**
   - Mark lesson as completed when quiz passed (>70% accuracy)
   - Update `lesson_progress` table via API
   - POST `/api/lessons/[id]/complete`
   - Add progress bar to `/learn` page

6. **Adaptive Recommendations**
   - Create recommendation algorithm:
     - Prioritize incomplete lessons
     - Suggest review if pattern mastery is low
     - Factor in time since last review
   - Display "Recommended for You" section on `/learn`

**Deliverables**:
- ✅ Users can browse lesson catalog
- ✅ Lessons render with formatted content and images
- ✅ Quizzes work with immediate feedback
- ✅ Progress is tracked and persisted
- ✅ Recommendations adapt based on user performance

**Sample Lessons to Create**:
1. Candlestick Anatomy (Basics)
2. Bullish vs Bearish Candles (Basics)
3. Doji Patterns (Patterns)
4. Hammer & Hanging Man (Patterns)
5. Engulfing Patterns (Patterns)
6. Morning/Evening Star (Patterns)

---

## Phase 4: Game Island (Interactive Quiz Mode)

**Goal**: Build the `/play` route with real-time chart simulation and timed quizzes

### Tasks

1. **Lightweight Charts Integration**
   - Install `lightweight-charts`
   - Create `<ChartView>` component wrapper
   - Configure chart appearance (dark theme, grid, crosshair)
   - Test with static OHLCV data

2. **Historical Data Management**
   - Seed `historical_data` table with sample datasets:
     - Multiple symbols (BTC/USD, ETH/USD, SPY, etc.)
     - Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
     - At least 1000 candles per dataset
   - Create API: `GET /api/market-data?symbol=BTC&timeframe=1h`
   - Add KV caching for frequently accessed data

3. **Web Worker Setup**
   - Create `src/game/simulator.worker.ts`
   - Implement message protocol:
     - `START` → Initialize simulation
     - `TICK` → Advance one candle
     - `PAUSE` → Pause simulation
     - `RESUME` → Resume simulation
     - `SUBMIT_ANSWER` → Process quiz answer
   - Handle simulation speed control (1x, 2x, 5x, 10x)

4. **Simulation Engine**
   - `SimulatorWorker` class:
     - Load historical data
     - Replay tick-by-tick with configurable speed
     - Emit `CHART_UPDATE` messages to main thread
     - Track current candle index and timestamp

5. **Pattern Detection Service**
   - Create `PatternService` class (runs in worker):
     - Detect candlestick patterns in real-time:
       - Doji, Hammer, Shooting Star
       - Bullish/Bearish Engulfing
       - Morning/Evening Star
       - Harami, Piercing Line
     - Use sliding window (last 3-5 candles)
     - Return pattern metadata (name, confidence, location)

6. **Quiz Scheduler**
   - Create `QuizScheduler` class (in worker):
     - Random intervals between 8-45 seconds
     - Select pattern based on user mastery weights
     - Higher weight = more frequent appearance
     - Generate question with 4 options (1 correct + 3 distractors)
     - Emit `QUIZ_EVENT` to main thread

7. **Scoring Engine**
   - Create `ScoringEngine` class (in worker):
     - Track current score, streak, and combo multiplier
     - Time pressure bonus (answer within 5s = +50%, within 10s = +20%)
     - Streak multipliers (3+ correct = 1.5x, 5+ = 2x, 10+ = 3x)
     - Update `pattern_mastery` after each answer:
       - Correct answer: increase weight slightly
       - Incorrect answer: increase weight significantly (need more practice)
     - Persist session results to D1 on completion

8. **Game UI Components**
   - Create `/play` route (client-only, lazy loaded)
   - `<GameHUD>` component:
     - Score display
     - Streak counter with animation
     - Timer (session duration)
     - Speed controls (1x, 2x, 5x, 10x)
     - Pause button
   - `<QuizDialog>` component:
     - Timed question overlay (15-30s countdown)
     - 4 multiple choice buttons
     - Immediate visual feedback (green/red)
     - Explanation after answer
     - Auto-dismiss after 3 seconds
   - `<SessionSummary>` component:
     - Final score and accuracy
     - Patterns tested breakdown
     - Mastery level changes
     - "Play Again" button

9. **Game State Management**
   - Use Solid signals for reactive state
   - Sync worker messages with UI:
     - Chart updates → `chartData` signal
     - Quiz events → `currentQuiz` signal
     - Score updates → `score`, `streak` signals
   - Handle pause/resume logic
   - Persist state to KV for session recovery

10. **API Endpoints**
    - `POST /api/session/start`:
      - Create new session record
      - Return session ID
    - `POST /api/session/submit`:
      - Accept session results payload
      - Update `session_results` table
      - Batch update `pattern_mastery` table
      - Return updated mastery stats

**Deliverables**:
- ✅ Chart displays and animates historical data
- ✅ Quizzes appear at random intervals
- ✅ Scoring and streaks work correctly
- ✅ Pattern mastery updates after each session
- ✅ Session results persist to D1
- ✅ Game is performant (60fps chart rendering)

**Performance Targets**:
- Chart renders at 60fps during simulation
- Worker processes quiz answers within 50ms
- Pattern detection completes within 100ms per candle
- Session data persists within 500ms

---

## Phase 5: Paper Trading Simulator

**Goal**: Full-featured simulated broker with order types, P/L tracking, and risk management

### Tasks

1. **Trade Engine Architecture**
   - Create `TradeEngine` class (in worker):
     - Manage simulated portfolio state
     - Process order requests
     - Execute orders against simulation data
     - Calculate P/L in real-time
     - Handle leverage and margin

2. **Order Types**
   - **Market Orders**: Execute immediately at current price
   - **Limit Orders**: Execute when price reaches limit
   - **Stop Orders**: Trigger market order when stop price hit
   - **Trailing Stop**: Dynamic stop that follows price
   - Support long and short positions

3. **Portfolio State**
   - Create `Portfolio` class:
     - Track cash balance
     - Track open positions (symbol, side, quantity, entry price, unrealized P/L)
     - Track equity (balance + unrealized P/L)
     - Calculate margin usage
     - Track realized P/L history

4. **Risk Management**
   - Configurable settings:
     - Starting balance ($10k, $50k, $100k)
     - Leverage (1x, 2x, 5x, 10x)
     - Max position size (% of equity)
     - Stop loss enforcement
   - Liquidation logic (margin call at 80%, liquidation at 100%)

5. **Trading UI**
   - Extend `/play` route with trading mode toggle
   - `<OrderPanel>` component:
     - Order type selector
     - Side selector (Buy/Sell or Long/Short)
     - Quantity input
     - Price input (for limit/stop orders)
     - Stop loss / Take profit inputs
     - Submit button with validation
   - `<PositionsList>` component:
     - Open positions with current P/L
     - Close position button
     - Modify order button (for pending orders)
   - `<OrderBook>` component (optional):
     - Pending orders list
     - Cancel order button
   - `<PortfolioStats>` component:
     - Balance, equity, margin used
     - Total realized P/L
     - Win rate, avg win/loss
     - Max drawdown

6. **Order Execution Logic**
   - Check if order is valid (sufficient balance/margin)
   - For market orders: execute immediately
   - For limit/stop orders: add to pending queue
   - Check pending orders on each tick:
     - Limit buy: execute if current price <= limit price
     - Limit sell: execute if current price >= limit price
     - Stop loss: execute if price hits stop
     - Trailing stop: adjust stop dynamically
   - Update portfolio state after execution
   - Emit order events to UI

7. **Trade History**
   - Store completed trades in `orders` table
   - Create `/portfolio` route:
     - Trade history table (date, symbol, side, quantity, entry, exit, P/L)
     - Equity curve chart
     - Performance metrics
     - Export to CSV

8. **API Endpoints**
   - `POST /api/portfolio/create`:
     - Initialize new portfolio for user
     - Set starting balance and risk settings
   - `POST /api/trade/order`:
     - Validate and queue order
     - Return order ID
   - `GET /api/trade/history`:
     - Fetch user's trade history
     - Paginated and filterable
   - `GET /api/portfolio/stats`:
     - Return portfolio metrics

**Deliverables**:
- ✅ Users can place market, limit, stop orders
- ✅ Orders execute correctly against simulation
- ✅ P/L calculates accurately in real-time
- ✅ Risk management prevents over-leveraging
- ✅ Trade history persists to D1
- ✅ Portfolio stats display correctly

**Trading Scenarios to Test**:
- [ ] Place market buy, price goes up, close with profit
- [ ] Place market short, price goes down, close with profit
- [ ] Place limit buy, price hits limit, order executes
- [ ] Place stop loss, price hits stop, position closes
- [ ] Trailing stop follows price correctly
- [ ] Liquidation triggers at correct margin level
- [ ] Cannot exceed max position size
- [ ] Cannot over-leverage account

---

## Phase 6: Polish & Production Ready

**Goal**: Prepare for production deployment with monitoring, error handling, and optimizations

### Tasks

1. **Error Handling**
   - Add global error boundary in SolidStart
   - Create user-friendly error pages (500, 503)
   - Add error logging to API routes
   - Implement retry logic for D1 queries
   - Add fallbacks for KV cache misses

2. **Loading States**
   - Add skeleton loaders for lesson list
   - Add chart loading spinner
   - Add quiz loading states
   - Optimize bundle size with code splitting

3. **Performance Optimization**
   - Implement virtual scrolling for long lists
   - Optimize chart rendering (only visible data)
   - Add service worker for offline support
   - Compress historical data in KV (gzip)
   - Add CDN caching headers for static assets

4. **Monitoring**
   - Add Cloudflare Analytics
   - Track key metrics:
     - Session start/completion rate
     - Quiz accuracy by pattern
     - Avg session duration
     - Trade success rate
   - Set up error rate alerts

5. **Security Audit**
   - Review auth implementation (session hijacking, CSRF)
   - Add rate limiting on API routes (use KV)
   - Sanitize user inputs (email, passwords)
   - Add CSP headers
   - Audit dependencies for vulnerabilities

6. **Testing**
   - Unit tests for:
     - Pattern detection algorithms
     - Scoring engine calculations
     - Trade engine order execution
     - P/L calculations
   - Integration tests for:
     - Auth flow (register → login → protected route)
     - Lesson progress tracking
     - Quiz submission and mastery updates
   - E2E tests for critical flows

7. **Documentation**
   - Write API documentation
   - Create deployment guide
   - Document environment variables
   - Add troubleshooting guide
   - Create contributor guide

8. **Production Deployment**
   - Create production D1 database
   - Create production KV namespace
   - Set production secrets via `wrangler secret put`
   - Deploy to Cloudflare Pages/Workers
   - Set up custom domain
   - Configure analytics and monitoring

**Deliverables**:
- ✅ Production deployment is stable
- ✅ Error handling prevents crashes
- ✅ Performance meets targets (<3s initial load, 60fps charts)
- ✅ Security vulnerabilities addressed
- ✅ Tests cover critical paths

---

## Phase 7: Future Enhancements (Post-MVP)

These features can be added after core functionality is stable and deployed.

### Leaderboards
- Global leaderboard (top scores, win rates)
- Friends leaderboard
- Weekly/monthly competitions
- Use KV + Durable Objects for real-time updates

### Live Events
- WebSocket integration for live multiplayer quizzes
- Scheduled tournaments with prizes
- Live market data (via WebSocket to data provider)

### Social Features
- User profiles (public stats, badges)
- Follow/friend system
- Share trades and quiz results
- Comment on lessons

### Advanced Trading
- Multiple portfolios per user
- Slippage simulation
- Commission/fee modeling
- Options trading simulation
- Backtesting framework (test strategy against historical data)

### Machine Learning
- Personalized mastery paths
- Predictive difficulty adjustment
- Pattern recognition assistance (show hints)
- Trading strategy suggestions

### Mobile App
- React Native or Capacitor wrapper
- Push notifications for quiz reminders
- Offline mode for lessons

### Additional Auth Providers
- Google OAuth
- Apple Sign In
- GitHub OAuth

### Content Expansion
- Video lessons
- Interactive chart drawing tools
- Community-submitted patterns
- Psychology modules with scenario-based learning

---

## Estimated Timeline

**Phase 1**: 2-4 hours
**Phase 2**: 6-8 hours
**Phase 3**: 8-12 hours
**Phase 4**: 16-24 hours (most complex)
**Phase 5**: 12-16 hours
**Phase 6**: 8-12 hours

**Total MVP**: ~50-75 hours

**Phase 7**: Ongoing, add features incrementally

---

## Dependencies & Tools Checklist

### Core Framework
- [ ] `solid-js`
- [ ] `@solidjs/start`
- [ ] `@solidjs/router`
- [ ] `vinxi` (SolidStart bundler)

### Cloudflare
- [ ] `wrangler`
- [ ] `miniflare` (local dev)
- [ ] `@cloudflare/workers-types`

### Database & ORM
- [ ] `drizzle-orm`
- [ ] `drizzle-kit`

### Auth
- [ ] `@auth/core`
- [ ] `@auth/drizzle-adapter`
- [ ] `bcryptjs` (password hashing)

### Charts
- [ ] `lightweight-charts`

### Utilities
- [ ] `zod` (validation)
- [ ] `date-fns` (date utilities)

### Dev Tools
- [ ] `typescript`
- [ ] `eslint`
- [ ] `prettier`
- [ ] `vitest` (testing)

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Cloudflare D1 free tier limits | High | Monitor usage, optimize queries, add caching |
| Worker CPU time limits | Medium | Move intensive work to client (charts, simulation) |
| Pattern detection accuracy | Medium | Test with diverse datasets, iterate on algorithms |
| Chart rendering performance | High | Use virtual rendering, optimize data structures |
| Auth security vulnerabilities | High | Follow Auth.js best practices, security audit |
| Historical data availability | Low | Generate synthetic data, cache aggressively |

---

## Success Metrics (Post-Launch)

- **Engagement**: Avg session duration > 10 minutes
- **Retention**: 30-day retention > 40%
- **Learning**: Quiz accuracy improves > 15% after 10 sessions
- **Trading**: Paper trading win rate > 50% for active users
- **Performance**: 95th percentile page load < 3s
- **Stability**: Error rate < 1%

---

## Next Steps

1. Review this plan and adjust priorities
2. Begin Phase 1: Foundation setup
3. After each phase, test thoroughly before proceeding
4. Iterate based on feedback and performance metrics
