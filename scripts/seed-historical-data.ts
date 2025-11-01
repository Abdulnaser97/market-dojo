import { drizzle } from "drizzle-orm/d1";
import { historicalData } from "../src/db/schema";
import { randomUUID } from "crypto";

interface CandleConfig {
  symbol: string;
  timeframe: string;
  basePrice: number;
  volatility: number;
  trend: number; // -1 to 1, negative for downtrend, positive for uptrend
  candleCount: number;
  intervalSeconds: number;
}

function generateCandles(config: CandleConfig) {
  const candles = [];
  const now = Date.now();
  const startTime = now - config.candleCount * config.intervalSeconds * 1000;

  let currentPrice = config.basePrice;

  for (let i = 0; i < config.candleCount; i++) {
    const timestamp = startTime + i * config.intervalSeconds * 1000;

    // Add trend bias
    const trendAdjustment = config.trend * config.volatility * 0.1;
    currentPrice += trendAdjustment;

    // Generate OHLC with realistic relationships
    const maxChange = config.volatility;
    const openOffset = (Math.random() - 0.5) * maxChange;
    const closeOffset = (Math.random() - 0.5) * maxChange;

    const open = currentPrice + openOffset;
    const close = currentPrice + closeOffset;

    // High should be above both open and close
    const highBase = Math.max(open, close);
    const high = highBase + Math.random() * maxChange * 0.5;

    // Low should be below both open and close
    const lowBase = Math.min(open, close);
    const low = lowBase - Math.random() * maxChange * 0.5;

    // Volume (random but realistic for crypto)
    const baseVolume = config.symbol.includes("BTC") ? 1000000 : 500000;
    const volume = baseVolume * (0.5 + Math.random());

    candles.push({
      id: `${config.symbol}-${config.timeframe}-${timestamp}`,
      symbol: config.symbol,
      timeframe: config.timeframe,
      timestamp: new Date(timestamp),
      open,
      high,
      low,
      close,
      volume,
    });

    // Update current price for next candle (use close)
    currentPrice = close;
  }

  return candles;
}

async function seedHistoricalData() {
  console.log("Starting historical data seeding...");

  // Note: This would need to be run in the Cloudflare Workers environment
  // For local development, we'll use wrangler
  const db = (global as any).DB; // This would be the D1 binding

  if (!db) {
    console.error("Database binding not found. Run this script with wrangler:");
    console.error("wrangler d1 execute marketdojo_db --local --file=<sql-output>");
    console.log("\nGenerating INSERT statements instead...");
    generateSQLInserts();
    return;
  }

  const datasets: CandleConfig[] = [
    // BTC/USD - 1 hour candles (1000 candles = ~42 days)
    {
      symbol: "BTC/USD",
      timeframe: "1h",
      basePrice: 50000,
      volatility: 1000,
      trend: 0.3,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
    // ETH/USD - 1 hour candles
    {
      symbol: "ETH/USD",
      timeframe: "1h",
      basePrice: 3000,
      volatility: 60,
      trend: 0.2,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
    // SPY - 1 hour candles (stock market, lower volatility)
    {
      symbol: "SPY",
      timeframe: "1h",
      basePrice: 450,
      volatility: 5,
      trend: 0.1,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
    // BTC/USD - 5 minute candles (more granular, 1200 candles = ~4 days)
    {
      symbol: "BTC/USD",
      timeframe: "5m",
      basePrice: 50000,
      volatility: 300,
      trend: 0.1,
      candleCount: 1200,
      intervalSeconds: 300,
    },
  ];

  for (const config of datasets) {
    console.log(`Generating ${config.candleCount} candles for ${config.symbol} (${config.timeframe})...`);
    const candles = generateCandles(config);

    console.log(`Inserting ${candles.length} records...`);
    await db.insert(historicalData).values(candles);
    console.log(`✓ Completed ${config.symbol} ${config.timeframe}`);
  }

  console.log("\n✅ Historical data seeding complete!");
}

async function generateSQLInserts() {
  console.log("\nGenerating SQL INSERT statements...\n");

  const datasets: CandleConfig[] = [
    {
      symbol: "BTC/USD",
      timeframe: "1h",
      basePrice: 50000,
      volatility: 1000,
      trend: 0.3,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
    {
      symbol: "ETH/USD",
      timeframe: "1h",
      basePrice: 3000,
      volatility: 60,
      trend: 0.2,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
    {
      symbol: "SPY",
      timeframe: "1h",
      basePrice: 450,
      volatility: 5,
      trend: 0.1,
      candleCount: 1000,
      intervalSeconds: 3600,
    },
  ];

  const sqlStatements: string[] = [];

  for (const config of datasets) {
    console.log(`Generating ${config.candleCount} candles for ${config.symbol} (${config.timeframe})...`);
    const candles = generateCandles(config);

    for (const candle of candles) {
      const sql = `INSERT INTO historical_data (id, symbol, timeframe, timestamp, open, high, low, close, volume) VALUES ('${candle.id}', '${candle.symbol}', '${candle.timeframe}', ${Math.floor(candle.timestamp.getTime() / 1000)}, ${candle.open.toFixed(2)}, ${candle.high.toFixed(2)}, ${candle.low.toFixed(2)}, ${candle.close.toFixed(2)}, ${candle.volume.toFixed(2)});`;
      sqlStatements.push(sql);
    }
  }

  // Write to file
  const fs = await import("fs");
  const path = await import("path");
  const { fileURLToPath } = await import("url");
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outputPath = path.join(__dirname, "../migrations/seed-historical-data.sql");

  fs.writeFileSync(outputPath, sqlStatements.join("\n"));
  console.log(`✅ SQL file generated: ${outputPath}`);
  console.log(`   Total statements: ${sqlStatements.length}`);
  console.log(`\nRun with: wrangler d1 execute marketdojo_db --local --file=migrations/seed-historical-data.sql`);
}

// Run the seed function
generateSQLInserts().catch(console.error);
