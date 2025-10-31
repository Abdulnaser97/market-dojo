import { sqliteTable, text, integer, real, primaryKey } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// ============================================
// Auth.js Tables
// ============================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  passwordHash: text("password_hash"),
  name: text("name"),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const accounts = sqliteTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = sqliteTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: integer("expires", { mode: "timestamp" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ============================================
// Learning System Tables
// ============================================

export const lessons = sqliteTable("lessons", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(), // "basics", "patterns", "psychology", "risk"
  order: integer("order").notNull(),
  difficulty: integer("difficulty").notNull().default(1), // 1-5
  imageUrl: text("image_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const lessonProgress = sqliteTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completed: integer("completed", { mode: "boolean" }).notNull().default(false),
    score: integer("score"), // Quiz score 0-100
    lastAccessed: integer("last_accessed", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (lp) => ({
    compoundKey: primaryKey({ columns: [lp.userId, lp.lessonId] }),
  })
);

// ============================================
// Quiz & Pattern Recognition Tables
// ============================================

export const sessionResults = sqliteTable("session_results", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  accuracy: real("accuracy").notNull(), // 0.0 - 1.0
  patternsTestedCount: integer("patterns_tested_count").notNull(),
  duration: integer("duration").notNull(), // seconds
  maxStreak: integer("max_streak").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const patternMastery = sqliteTable(
  "pattern_mastery",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    patternName: text("pattern_name").notNull(), // "doji", "hammer", "engulfing", etc.
    correctCount: integer("correct_count").notNull().default(0),
    incorrectCount: integer("incorrect_count").notNull().default(0),
    accuracy: real("accuracy").notNull().default(0), // 0.0 - 1.0
    weight: real("weight").notNull().default(1.0), // Higher = needs more practice
    lastSeen: integer("last_seen", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (pm) => ({
    compoundKey: primaryKey({ columns: [pm.userId, pm.patternName] }),
  })
);

// ============================================
// Paper Trading Tables
// ============================================

export const portfolios = sqliteTable("portfolios", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Default Portfolio"),
  startingBalance: real("starting_balance").notNull().default(10000),
  currentBalance: real("current_balance").notNull(),
  equity: real("equity").notNull(), // balance + unrealized P/L
  leverage: real("leverage").notNull().default(1.0),
  maxPositionSize: real("max_position_size").notNull().default(0.1), // % of equity
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  portfolioId: text("portfolio_id")
    .notNull()
    .references(() => portfolios.id, { onDelete: "cascade" }),
  symbol: text("symbol").notNull(),
  type: text("type").notNull(), // "market", "limit", "stop", "trailing_stop"
  side: text("side").notNull(), // "long", "short"
  quantity: real("quantity").notNull(),
  entryPrice: real("entry_price"),
  exitPrice: real("exit_price"),
  limitPrice: real("limit_price"),
  stopPrice: real("stop_price"),
  trailingStopDistance: real("trailing_stop_distance"),
  status: text("status").notNull(), // "pending", "open", "closed", "cancelled"
  realizedPnL: real("realized_pnl"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

// ============================================
// Market Data Tables
// ============================================

export const historicalData = sqliteTable("historical_data", {
  id: text("id").primaryKey(),
  symbol: text("symbol").notNull(),
  timeframe: text("timeframe").notNull(), // "1m", "5m", "15m", "1h", "4h", "1d"
  timestamp: integer("timestamp", { mode: "timestamp" }).notNull(),
  open: real("open").notNull(),
  high: real("high").notNull(),
  low: real("low").notNull(),
  close: real("close").notNull(),
  volume: real("volume").notNull(),
});

// ============================================
// Type exports for use in application
// ============================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;

export type SessionResult = typeof sessionResults.$inferSelect;
export type NewSessionResult = typeof sessionResults.$inferInsert;

export type PatternMastery = typeof patternMastery.$inferSelect;
export type NewPatternMastery = typeof patternMastery.$inferInsert;

export type Portfolio = typeof portfolios.$inferSelect;
export type NewPortfolio = typeof portfolios.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type HistoricalData = typeof historicalData.$inferSelect;
export type NewHistoricalData = typeof historicalData.$inferInsert;
