import { json } from "@solidjs/router";
import type { APIEvent } from "@solidjs/start/server";
import { getDbFromContext } from "~/lib/auth";
import { historicalData } from "~/db/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * GET /api/market-data?symbol=BTC/USD&timeframe=1h&limit=1000
 *
 * Fetch historical candlestick data for charting
 */
export async function GET({ request }: APIEvent) {
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol") || "BTC/USD";
  const timeframe = url.searchParams.get("timeframe") || "1h";
  const limit = parseInt(url.searchParams.get("limit") || "1000", 10);

  console.log(`[API market-data] Fetching data for ${symbol} ${timeframe}, limit: ${limit}`);

  try {
    // Get Cloudflare KV binding
    const kv = (globalThis as any).SESSION_KV;

    // Create cache key
    const cacheKey = `market-data:${symbol}:${timeframe}:${limit}`;

    // Try to get from cache first
    if (kv) {
      try {
        const cached = await kv.get(cacheKey, "json");
        if (cached) {
          console.log(`[API market-data] Cache hit for ${cacheKey}`);
          return json({
            success: true,
            data: cached,
            cached: true,
          });
        }
      } catch (kvError) {
        console.warn("[API market-data] KV cache read failed:", kvError);
        // Continue without cache
      }
    }

    // Get database
    const db = getDbFromContext();

    // Fetch data from D1
    const data = await db
      .select()
      .from(historicalData)
      .where(
        and(
          eq(historicalData.symbol, symbol),
          eq(historicalData.timeframe, timeframe)
        )
      )
      .orderBy(desc(historicalData.timestamp))
      .limit(limit);

    console.log(`[API market-data] Fetched ${data.length} candlesticks from database`);

    // Transform to Lightweight Charts format (time must be in seconds)
    const chartData = data
      .map((candle) => ({
        time: Math.floor(new Date(candle.timestamp).getTime() / 1000),
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
      }))
      .reverse(); // Reverse to get chronological order

    // Cache the result (expire after 1 hour)
    if (kv) {
      try {
        await kv.put(cacheKey, JSON.stringify(chartData), {
          expirationTtl: 3600, // 1 hour
        });
        console.log(`[API market-data] Cached result for ${cacheKey}`);
      } catch (kvError) {
        console.warn("[API market-data] KV cache write failed:", kvError);
        // Continue without caching
      }
    }

    return json({
      success: true,
      data: chartData,
      cached: false,
      count: chartData.length,
    });
  } catch (error) {
    console.error("[API market-data] Error fetching data:", error);
    return json(
      {
        success: false,
        error: "Failed to fetch market data",
      },
      { status: 500 }
    );
  }
}
