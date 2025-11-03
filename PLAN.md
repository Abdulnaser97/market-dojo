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

**Implementation Strategy**: Phase 4 will be broken into incremental sub-phases that can be committed independently:

---

### Phase 4.1: Charts & Static Data

**Goal**: Set up charting library and historical data infrastructure

**What it does**: Install charting library, create basic chart display component, seed database with historical price data, and create API to fetch it.

**Tasks**:
1. **Install Lightweight Charts**
   - Add `lightweight-charts` dependency
   - Create TypeScript type definitions if needed

2. **Create Chart Component**
   - Create `src/components/game/ChartView.tsx`
   - Configure chart appearance (dark theme, grid, crosshair)
   - Test with hardcoded static OHLCV data
   - Verify chart renders correctly

3. **Historical Data Seeding**
   - Create migration to seed `historical_data` table
   - Add sample datasets:
     - Multiple symbols (BTC/USD, ETH/USD, SPY, etc.)
     - Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d)
     - At least 1000 candles per dataset
   - Use realistic price data (can be synthetic or from public API)

4. **API Endpoint**
   - Create `GET /api/market-data?symbol=BTC&timeframe=1h`
   - Fetch data from D1
   - Add KV caching for frequently accessed data
   - Return OHLCV format compatible with Lightweight Charts

**Deliverables**:
- ✅ Chart component displays static candlestick data
- ✅ Database contains historical price data
- ✅ API endpoint returns cached market data
- ✅ Chart is styled and responsive

---

### Phase 4.2: Pattern Detection Service

**Goal**: Create standalone pattern recognition algorithms

**What it does**: Build a service that can analyze candlestick data and identify common trading patterns (Doji, Hammer, Engulfing, etc.).

**Tasks**:
1. **Create Pattern Detection Class**
   - Create `src/game/PatternService.ts`
   - Implement detection algorithms for:
     - Doji (all variants: Standard, Long-legged, Dragonfly, Gravestone)
     - Hammer & Hanging Man
     - Shooting Star & Inverted Hammer
     - Bullish/Bearish Engulfing
     - Morning/Evening Star
     - Harami (Bullish/Bearish)
     - Piercing Line & Dark Cloud Cover

2. **Pattern Metadata**
   - Return pattern objects with:
     - `name`: Pattern name
     - `type`: "reversal" | "continuation" | "neutral"
     - `confidence`: 0-100 score
     - `candleIndices`: Array of indices forming pattern
     - `sentiment`: "bullish" | "bearish" | "neutral"

3. **Sliding Window Analysis**
   - Use 3-5 candlestick sliding window
   - Analyze each window for pattern matches
   - Handle edge cases (not enough data, incomplete patterns)

4. **Unit Tests**
   - Test each pattern detection with known examples
   - Verify confidence scores are accurate
   - Test edge cases and false positives

**Deliverables**:
- ✅ Pattern detection algorithms work correctly
- ✅ Can identify 10+ candlestick patterns
- ✅ Returns accurate metadata and confidence scores
- ✅ Unit tests pass for all patterns

---

### Phase 4.3: UI Shell (Game Layout)

**Goal**: Create the visual structure for the game without functionality

**What it does**: Build the `/play` route layout with all UI components (HUD, controls, quiz dialog) as non-functional shells. Like building a stage before the actors arrive.

**Tasks**:
1. **Create /play Route**
   - Create `src/routes/play.tsx`
   - Make it client-only and lazy-loaded
   - Protected route (requires authentication)

2. **Game HUD Component**
   - Create `src/components/game/GameHUD.tsx`
   - Display areas for:
     - Current score (starts at 0)
     - Streak counter (starts at 0)
     - Session timer (00:00)
     - Speed controls (1x, 2x, 5x, 10x buttons - non-functional)
     - Pause button (non-functional)
   - Style with consistent theme

3. **Quiz Dialog Component**
   - Create `src/components/game/QuizDialog.tsx`
   - Modal overlay design
   - Question text area
   - 4 multiple choice buttons
   - Countdown timer display (visual only)
   - Explanation section (hidden initially)
   - Non-functional for now (just UI)

4. **Session Summary Component**
   - Create `src/components/game/SessionSummary.tsx`
   - Display final score
   - Patterns tested breakdown (table/list)
   - Accuracy percentage
   - Mastery level changes (+/- indicators)
   - "Play Again" and "Back to Lessons" buttons

5. **Layout Integration**
   - Arrange components on `/play` page:
     - Chart takes center stage (large)
     - HUD overlaid in top-right corner
     - Quiz dialog appears centered over chart
     - Session summary appears at end
   - Ensure responsive layout works on different screen sizes

**Deliverables**:
- ✅ /play route is accessible and protected
- ✅ All UI components render with placeholder content
- ✅ Layout is responsive and visually polished
- ✅ No functionality yet, but everything looks ready

---

### Phase 4.4: Simulation Engine

**Goal**: Make historical chart data "play back" like a live market

**What it does**: Creates a Web Worker that replays historical candlestick data tick-by-tick, making the chart animate as if the market is happening in real-time. Like playing a recorded football game.

**Tasks**:
1. **Web Worker Setup**
   - Create `src/game/simulator.worker.ts`
   - Set up message protocol between worker and main thread:
     - `START` → Initialize simulation with data
     - `TICK` → Send next candlestick to chart
     - `PAUSE` → Pause simulation
     - `RESUME` → Resume simulation
     - `STOP` → End simulation
     - `SET_SPEED` → Change playback speed (1x, 2x, 5x, 10x)

2. **Simulation Engine Class**
   - Create `SimulatorWorker` class inside worker:
     - `loadData(symbol, timeframe)` - Fetch historical data from API
     - `start()` - Begin playback
     - `tick()` - Advance to next candlestick
     - `pause()` / `resume()` - Control playback
     - `setSpeed(multiplier)` - Adjust playback speed
   - Track state:
     - Current candlestick index
     - Playback speed multiplier
     - Pause/play status
     - Loaded data array

3. **Tick Loop**
   - Use `setInterval` or `setTimeout` for ticking
   - Calculate interval based on speed: `baseInterval / speedMultiplier`
   - Emit `CHART_UPDATE` message with candlestick data each tick
   - Auto-stop when all candlesticks are played

4. **Main Thread Integration**
   - Connect worker to `/play` route
   - Listen for `CHART_UPDATE` messages
   - Update chart data signal reactively
   - Wire up HUD controls (speed, pause/resume)
   - Display chart animating in real-time

**Deliverables**:
- ✅ Chart animates candlestick-by-candlestick
- ✅ Speed controls work (1x, 2x, 5x, 10x)
- ✅ Pause/resume works correctly
- ✅ Simulation runs smoothly at 60fps
- ✅ Worker doesn't block UI thread

---

### Phase 4.5: Quiz System

**Goal**: Interrupt chart playback with timed pattern recognition quizzes

**What it does**: While the chart animates (from Phase 4.4), randomly schedule quiz questions that ask users to identify patterns. Includes visual highlighting of the pattern being tested.

**Tasks**:
1. **Quiz Scheduler (in Worker)**
   - Create `QuizScheduler` class inside worker
   - Schedule quizzes at random intervals (8-45 seconds)
   - Use pattern detection (Phase 4.2) to find patterns in current chart data
   - Select pattern based on user mastery weights (fetch from API)
   - Higher weight = more frequent appearance (adaptive difficulty)

2. **Quiz Generation**
   - When quiz scheduled:
     - Detect pattern using `PatternService`
     - Generate question: "What pattern is forming here?"
     - Generate 4 options:
       - 1 correct answer (detected pattern)
       - 3 distractors (random other pattern names)
     - Include explanation text for after answer
   - Emit `QUIZ_EVENT` message to main thread with quiz data

3. **Visual Highlighting System**
   - When quiz appears on screen:
     - Semi-transparent dark overlay (75% opacity) dims entire chart
     - Bright highlight box with glow around pattern candlesticks
     - Calculate pixel coordinates for pattern location
     - Use pattern metadata `candleIndices` to position highlight
   - Highlight effects:
     - Subtle pulsing animation to draw attention
     - Color-coded border (category color or primary)
     - Clear visual separation from dimmed chart
   - Remove overlay when quiz dismissed

4. **Quiz Dialog Integration**
   - Listen for `QUIZ_EVENT` in main thread
   - Show `QuizDialog` component with question
   - Display 15-30 second countdown timer
   - Pause chart simulation while quiz is active
   - Render chart highlight overlay

5. **Answer Handling**
   - User selects answer (A/B/C/D)
   - Send `SUBMIT_ANSWER` message to worker
   - Worker validates answer
   - Immediate visual feedback:
     - Green checkmark for correct
     - Red X for incorrect
   - Show explanation text
   - Auto-dismiss after 3 seconds
   - Resume chart simulation
   - Remove highlight overlay

6. **Game State Synchronization**
   - Use Solid signals for reactive state:
     - `currentQuiz` - Current quiz data or null
     - `quizActive` - Boolean for showing dialog
     - `highlightPattern` - Pattern indices to highlight
   - Update signals when worker sends messages

**Deliverables**:
- ✅ Quizzes appear at random intervals during simulation
- ✅ Pattern is visually highlighted with vignette effect
- ✅ Countdown timer works
- ✅ Answer validation provides immediate feedback
- ✅ Chart pauses during quiz, resumes after
- ✅ Explanation displays after answer
- ✅ Highlight overlay removes cleanly

**Visual Highlighting Specification**:
- **Vignette overlay**: Semi-transparent black (rgba(0,0,0,0.75)) covering full chart
- **Highlight cutout**: Clear window around pattern candlesticks
- **Highlight border**: 2-3px colored glow/border around pattern
- **Animation**: Subtle pulse (0.8s duration, ease-in-out)
- **Positioning**: Calculate from candlestick indices and chart dimensions
- **Responsive**: Adjust highlight size based on chart zoom/scale

---

### Phase 4.6: Scoring & Persistence

**Goal**: Track performance, calculate scores with multipliers, and save session results

**What it does**: Implements the scoring system with streak bonuses and time pressure, updates pattern mastery based on performance, and persists session results to the database.

**Tasks**:
1. **Scoring Engine (in Worker)**
   - Create `ScoringEngine` class inside worker
   - Track metrics:
     - Current score (starts at 0)
     - Current streak (consecutive correct answers)
     - Combo multiplier (based on streak)
     - Total questions answered
     - Correct/incorrect counts

2. **Score Calculation Rules**
   - Base points per question: 100
   - Time pressure bonus:
     - Answer within 5s: +50% (150 points)
     - Answer within 10s: +20% (120 points)
     - Answer after 10s: base 100 points
   - Streak multipliers:
     - 3+ correct in a row: 1.5x multiplier
     - 5+ correct in a row: 2x multiplier
     - 10+ correct in a row: 3x multiplier
   - Incorrect answer: 0 points, reset streak

3. **Pattern Mastery Updates**
   - After each answer, update mastery weights:
     - Correct answer: decrease weight slightly (user knows this pattern)
     - Incorrect answer: increase weight significantly (needs more practice)
   - Weights affect future quiz scheduling
   - Track per-pattern accuracy over time

4. **Session Summary Calculation**
   - At end of simulation:
     - Calculate final score
     - Calculate overall accuracy (correct / total)
     - Generate patterns tested breakdown (count per pattern type)
     - Calculate mastery changes (before/after weights)

5. **API Endpoints**
   - `POST /api/session/start`
     - Create new session record in `session_results` table
     - Return session ID
   - `POST /api/session/submit`
     - Accept payload:
       - Session ID
       - Final score
       - Accuracy
       - Patterns tested (array)
       - Duration
     - Update `session_results` table
     - Batch update `pattern_mastery` table
     - Return updated mastery stats

6. **Session Summary Component**
   - Wire up with real data from scoring engine
   - Display all calculated metrics
   - Show mastery level changes with +/- indicators
   - "Play Again" button resets and starts new session
   - "Back to Lessons" navigates to `/lessons`

7. **Integration**
   - Connect scoring engine to quiz answer handler
   - Update HUD score/streak displays in real-time
   - Emit score updates to main thread after each answer
   - Persist to database when simulation ends
   - Display session summary when complete

**Deliverables**:
- ✅ Scoring works with time bonuses and streak multipliers
- ✅ Pattern mastery updates based on performance
- ✅ Session results persist to database
- ✅ Session summary shows accurate statistics
- ✅ HUD displays update in real-time
- ✅ Can play multiple sessions (data saves correctly)

---

**Overall Phase 4 Deliverables**:
- ✅ Chart displays and animates historical data (4.1, 4.4)
- ✅ Quizzes appear at random intervals with visual highlighting (4.5)
- ✅ Scoring and streaks work correctly (4.6)
- ✅ Pattern mastery updates after each session (4.6)
- ✅ Session results persist to D1 (4.6)
- ✅ Game is performant (60fps chart rendering) (4.4)

**Performance Targets**:
- Chart renders at 60fps during simulation
- Worker processes quiz answers within 50ms
- Pattern detection completes within 100ms per candle
- Session data persists within 500ms
- Visual highlighting renders smoothly without jank

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

### Adaptive Pattern Training (Proficiency-Based Chart Generation)

**Goal**: Dynamically generate or select chart data that contains specific patterns tailored to each user's learning level and mastery gaps.

**Current State**: Quiz system uses random historical data and looks for patterns that happen to exist. Pattern selection is random from whatever patterns are detected.

**Enhancement Vision**: Intelligently seed simulation data with patterns the user needs to practice, creating a personalized training experience.

#### Implementation Strategy

1. **User Proficiency Tracking**
   - Extend `pattern_mastery` table with proficiency levels:
     - `proficiency_level`: "beginner" | "intermediate" | "advanced" | "expert"
     - `attempts`: Total quiz attempts for this pattern
     - `recent_accuracy`: Rolling accuracy over last 10 attempts
     - `first_seen_at`: When user first learned about this pattern in lessons
     - `last_practiced_at`: Most recent quiz on this pattern
   - Track which lessons user has completed to determine "unlocked" patterns
   - Calculate mastery score (0-100) based on accuracy, consistency, speed

2. **Pattern Difficulty Classification**
   - **Beginner Patterns**:
     - Clear, textbook examples (Doji, Hammer, Bullish Engulfing)
     - High contrast with surrounding candles
     - Minimal noise or ambiguity
   - **Intermediate Patterns**:
     - Less obvious examples with some market noise
     - Patterns in moderate volatility conditions
     - Multi-candle patterns (Harami, Piercing Line)
   - **Advanced Patterns**:
     - Subtle patterns in complex market conditions
     - 3-candle patterns (Morning Star, Evening Star)
     - Patterns during trend reversals with confounding signals
   - **Expert Patterns**:
     - Near-miss patterns (looks like pattern but isn't)
     - Patterns with multiple valid interpretations
     - Rare or variant patterns (Dragonfly Doji, Long-legged Doji)

3. **Synthetic Chart Data Generation**
   - Create `ChartGenerator` class with pattern-seeding algorithms:
     ```typescript
     class ChartGenerator {
       // Generate candles that form a specific pattern
       seedPattern(
         baseData: CandlestickData[],
         pattern: PatternType,
         difficulty: 'beginner' | 'intermediate' | 'advanced',
         position: number
       ): CandlestickData[]

       // Mix of realistic market movement + intentional pattern placement
       generateTrainingChart(
         userMastery: MasteryData[],
         sessionLength: number
       ): CandlestickData[]
     }
     ```
   - Algorithms for creating realistic candles:
     - Doji: Set `open ≈ close` (within 1-5% of range based on difficulty)
     - Hammer: Long lower shadow (2-3x body), small upper shadow, body at top
     - Engulfing: Second candle completely engulfs first with opposite color
     - Blend synthetic patterns into historical base data for realism

4. **Adaptive Quiz Scheduling**
   - API endpoint: `POST /api/quiz/generate-session`
     - Accepts user ID
     - Returns chart data + scheduled quiz points with target patterns
   - Scheduling rules:
     - Prioritize patterns where `accuracy < 70%`
     - Weight by recency (patterns not seen in 7+ days get higher priority)
     - Progressive unlocking (don't quiz on patterns from incomplete lessons)
     - Spaced repetition (review mastered patterns periodically)
   - Example weighting algorithm:
     ```typescript
     weight = (1 - accuracy) * recencyMultiplier * difficultyMultiplier
     where:
       recencyMultiplier = min(daysSinceLastSeen / 7, 2)
       difficultyMultiplier = userLevel === 'beginner' ? 0.5 : 1.5
     ```

5. **Session Difficulty Calibration**
   - Track user's overall proficiency across all patterns
   - Adjust session difficulty:
     - **Beginner** (avg mastery < 50%): 70% beginner, 25% intermediate, 5% advanced
     - **Intermediate** (50-75%): 20% beginner, 60% intermediate, 20% advanced
     - **Advanced** (75-90%): 10% beginner, 30% intermediate, 60% advanced
     - **Expert** (>90%): 5% beginner, 20% intermediate, 50% advanced, 25% expert
   - Prevent frustration: Cap difficulty spikes (no more than 2 levels above mastery)
   - Prevent boredom: Introduce challenge patterns even for experts

6. **Pattern Curriculum Paths**
   - Define learning progression:
     ```
     Level 1: Basic single candles (Doji, Hammer, Shooting Star)
     Level 2: Reversal candles (Hanging Man, Inverted Hammer)
     Level 3: Two-candle patterns (Engulfing, Harami)
     Level 4: Advanced two-candle (Piercing Line, Dark Cloud Cover)
     Level 5: Three-candle patterns (Morning Star, Evening Star)
     Level 6: Pattern variations and edge cases
     ```
   - Unlock next level when: `avg_mastery_current_level > 80%`
   - Show progress bars and achievement badges

7. **Quality Metrics & Validation**
   - Ensure generated patterns pass `PatternService` detection with high confidence
   - Validate chart realism (no impossible price movements)
   - A/B test synthetic vs historical data for engagement metrics
   - Monitor: Time to mastery, frustration rate (repeated failures), retention

#### Database Changes

```sql
-- Add proficiency tracking
ALTER TABLE pattern_mastery ADD COLUMN proficiency_level TEXT DEFAULT 'beginner';
ALTER TABLE pattern_mastery ADD COLUMN attempts INTEGER DEFAULT 0;
ALTER TABLE pattern_mastery ADD COLUMN recent_accuracy REAL DEFAULT 0;
ALTER TABLE pattern_mastery ADD COLUMN first_seen_at INTEGER;
ALTER TABLE pattern_mastery ADD COLUMN last_practiced_at INTEGER;

-- Track curriculum progress
CREATE TABLE curriculum_progress (
  user_id INTEGER NOT NULL,
  level INTEGER NOT NULL,
  unlocked_at INTEGER,
  mastered_at INTEGER,
  PRIMARY KEY (user_id, level),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cache generated training charts
CREATE TABLE training_charts (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  chart_data TEXT, -- JSON OHLCV array
  target_patterns TEXT, -- JSON array of {pattern, index}
  difficulty TEXT,
  created_at INTEGER,
  used_at INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### API Endpoints

```typescript
// Generate personalized training chart
POST /api/quiz/generate-chart
Body: { userId, sessionLength?, difficulty? }
Response: { chartData, quizPoints: [{pattern, index}] }

// Get user's proficiency profile
GET /api/user/proficiency
Response: {
  overallLevel: 'beginner' | 'intermediate' | 'advanced',
  patterns: [{name, mastery, proficiency, attempts}],
  unlockedLevels: [1, 2, 3],
  recommendations: ['Focus on Engulfing', 'Review Doji']
}

// Get curriculum progress
GET /api/user/curriculum
Response: {
  currentLevel: 3,
  progress: 0.65,
  nextUnlock: { level: 4, requiresMastery: 0.80, currentMastery: 0.65 }
}
```

#### User Experience Flow

1. User completes "Candlestick Patterns 101" lesson
2. System unlocks Level 1 patterns (Doji, Hammer, Shooting Star)
3. User starts quiz session
4. System generates chart with 3-5 seeded beginner patterns
5. Quiz appears with clear, textbook examples
6. User answers correctly → mastery increases
7. After 80% mastery on Level 1, system unlocks Level 2
8. User sees congratulations modal: "You've mastered basic patterns! 🎉"
9. Next session includes mixed Level 1 + Level 2 patterns
10. As mastery grows, system introduces subtle variations and edge cases

#### Benefits

- **Faster Learning**: Users practice what they struggle with, not random patterns
- **Reduced Frustration**: No impossible questions on patterns they haven't learned
- **Gamification**: Clear progression path with unlocks and achievements
- **Engagement**: Personalized content keeps users challenged but not overwhelmed
- **Data Insights**: Track which patterns are hardest to learn, optimize lessons
- **Scalability**: Easy to add new patterns and difficulty tiers

#### Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Synthetic data feels unrealistic | Blend with historical data, validate with traders |
| Pattern seeding creates obvious tells | Add noise, randomize placement, vary difficulty |
| Users game the system (memorize charts) | Rotate chart data, regenerate weekly |
| Chart generation is CPU intensive | Pre-generate charts, cache in D1, limit to 100 per user |
| Difficulty calibration is too hard/easy | A/B test thresholds, collect user feedback |

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
