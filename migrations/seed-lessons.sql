-- Seed lessons into the database
-- Run with: pnpm wrangler d1 execute marketdojo_db --local --file=migrations/seed-lessons.sql
-- Or run with: pnpm db:seed

-- Lesson 1: Candlestick Anatomy
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-001', 'candlestick-anatomy', 'Candlestick Anatomy', '# Understanding Candlesticks

Candlesticks are the fundamental building blocks of price charts. Understanding how to read them is essential for any trader.

## What is a Candlestick?

A candlestick represents price movement over a specific time period. Each candlestick shows four key pieces of information:

- **Open**: The price at the start of the period
- **Close**: The price at the end of the period
- **High**: The highest price reached during the period
- **Low**: The lowest price reached during the period

## Candlestick Components

### The Body
The rectangular part of the candlestick is called the **body**. It represents the range between the opening and closing prices.

- **Green/White Body**: The close is higher than the open (bullish)
- **Red/Black Body**: The close is lower than the open (bearish)

### The Wicks (or Shadows)
The thin lines extending from the body are called **wicks** or **shadows**.

- **Upper Wick**: Shows how high the price went above the open/close
- **Lower Wick**: Shows how low the price went below the open/close

Long wicks indicate price rejection at those levels. Short wicks suggest the price stayed close to the open/close.

## Reading the Story

Each candlestick tells a story about buyer and seller behavior:

- A **long green body** with small wicks shows strong buying pressure
- A **long red body** with small wicks shows strong selling pressure
- **Long wicks** with small bodies show indecision and potential reversals

## Timeframes

Candlesticks can represent any time period:
- 1-minute candles for day trading
- 1-hour candles for swing trading
- Daily candles for position trading

The timeframe you choose depends on your trading style.

## Key Takeaways

1. Candlesticks show open, high, low, and close prices
2. The body color indicates whether buyers or sellers were in control
3. Wicks show price rejection and can signal reversals
4. Longer bodies indicate stronger conviction
5. The timeframe determines how much price action is captured

Understanding candlestick anatomy is your first step toward reading market sentiment and identifying trading opportunities.', 'basics', 1, 1, NULL);

-- Lesson 2: Bullish vs Bearish Candles
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-002', 'bullish-vs-bearish', 'Bullish vs Bearish Candles', '# Bullish vs Bearish Candles

Learning to distinguish between bullish and bearish candles is crucial for understanding market direction and momentum.

## Bullish Candles

A **bullish candle** indicates upward price movement during the period.

### Characteristics:
- Close is **higher** than the open
- Usually displayed in **green** or **white**
- Shows buyers were in control
- The longer the body, the stronger the buying pressure

### What It Means:
Bullish candles suggest:
- Buyers are stepping in and pushing prices higher
- Demand is outweighing supply
- Positive market sentiment
- Potential continuation of uptrend (if part of a larger pattern)

## Bearish Candles

A **bearish candle** indicates downward price movement during the period.

### Characteristics:
- Close is **lower** than the open
- Usually displayed in **red** or **black**
- Shows sellers were in control
- The longer the body, the stronger the selling pressure

### What It Means:
Bearish candles suggest:
- Sellers are dominating and pushing prices lower
- Supply is outweighing demand
- Negative market sentiment
- Potential continuation of downtrend (if part of a larger pattern)

## Body Size Matters

The size of the candlestick body is significant:

### Long Bodies
- **Long bullish body**: Very strong buying, high conviction
- **Long bearish body**: Very strong selling, high conviction
- Indicate momentum and trend strength

### Short Bodies
- Indecision between buyers and sellers
- Low volatility during the period
- May signal consolidation or potential reversal

### No Body (Doji)
- Open equals close
- Maximum indecision
- Potential turning point (more on this in the Doji Patterns lesson)

## Context is Critical

A single candle doesn''t tell the whole story. Always consider:

1. **Location**: Where is this candle on the chart? At support? Resistance? Mid-trend?
2. **Volume**: High volume confirms the conviction behind the move
3. **Previous candles**: Is this continuing a trend or breaking one?
4. **Timeframe**: What''s happening on higher/lower timeframes?

## Common Patterns to Watch

While we''ll dive deeper into patterns later, be aware of:

- **Series of bullish candles**: Strong uptrend
- **Series of bearish candles**: Strong downtrend
- **Alternating colors**: Indecision, potential consolidation
- **Size changes**: Increasing body size = increasing momentum

## Practice Exercise

As you watch charts, ask yourself:
- Is this candle bullish or bearish?
- How strong is the conviction (body size)?
- Does it align with the overall trend?
- Are the wicks telling a different story than the body?

## Key Takeaways

1. Bullish candles show closes above opens (buying pressure)
2. Bearish candles show closes below opens (selling pressure)
3. Body size indicates strength of the move
4. Context and volume are essential for interpretation
5. No single candle should be analyzed in isolation

Mastering the basics of bullish and bearish candles sets the foundation for recognizing more complex patterns.', 'basics', 2, 1, NULL);

-- Lesson 3: Doji Patterns
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-003', 'doji-patterns', 'Doji Patterns', '# Doji Patterns: Signals of Indecision

The Doji is one of the most important single-candle patterns in technical analysis. It signals indecision in the market and can often precede significant moves.

## What is a Doji?

A **Doji** is a candlestick where the open and close are at (or very near) the same price level.

### Key Characteristics:
- Little to no body (open ≈ close)
- Can have wicks of varying lengths
- Represents equilibrium between buyers and sellers
- Signals indecision and potential reversal

The name "Doji" comes from the Japanese word meaning "the same thing" or "mistake," referring to the rare occurrence of open and close being equal.

## Types of Doji

### 1. Standard Doji
- Open and close are equal
- Upper and lower wicks are similar length
- Pure indecision between buyers and sellers

**Interpretation**: Neither bulls nor bears gained control. A potential pause or reversal point.

### 2. Long-Legged Doji
- Very long upper and lower wicks
- Shows extreme indecision and volatility
- Price moved significantly both ways but returned to opening level

**Interpretation**: Intense battle between buyers and sellers with no winner. Often signals major turning points.

### 3. Dragonfly Doji
- Little to no upper wick
- Long lower wick
- Open, close, and high are all at the same level

**Interpretation**:
- Sellers pushed price down
- Buyers rejected the lows and pushed back to the open
- **Bullish reversal signal** (especially at support)

### 4. Gravestone Doji
- Little to no lower wick
- Long upper wick
- Open, close, and low are all at the same level

**Interpretation**:
- Buyers pushed price up
- Sellers rejected the highs and pushed back to the open
- **Bearish reversal signal** (especially at resistance)

## Trading Doji Patterns

### When to Pay Attention

Doji patterns are most significant when they appear:

1. **After a strong trend**: Signals exhaustion
2. **At key support/resistance levels**: Confirms importance of the level
3. **With high volume**: Shows strong conviction in the indecision
4. **On higher timeframes**: Daily and weekly Dojis are more reliable than intraday

### Confirmation is Key

**Never trade a Doji alone!** Wait for confirmation:

- **Bullish confirmation**: Next candle closes above the Doji''s high
- **Bearish confirmation**: Next candle closes below the Doji''s low

Without confirmation, the Doji might just be noise.

## Common Mistakes

### ❌ Trading Every Doji
Not all Dojis lead to reversals. Many occur in ranging markets with no follow-through.

### ❌ Ignoring Context
A Doji at a random point mid-trend is less significant than one at a key level.

### ❌ Forgetting Volume
Low-volume Dojis are less reliable. Look for increased volume to confirm interest.

### ❌ Wrong Timeframe
Dojis on 1-minute charts are often just noise. Focus on higher timeframes.

## Real-World Example Strategy

**Setup:**
1. Identify a strong uptrend or downtrend
2. Look for a Doji at a key support/resistance level
3. Check that volume is elevated
4. Wait for confirmation candle

**Entry:**
- Long: Enter when next candle closes above Doji high
- Short: Enter when next candle closes below Doji low

**Stop Loss:**
- Long: Below the Doji''s low
- Short: Above the Doji''s high

**Target:**
- Aim for at least 2:1 reward-to-risk ratio
- Consider previous swing high/low as targets

## Key Takeaways

1. Doji shows equilibrium between buyers and sellers (indecision)
2. Most significant after trends and at key levels
3. Dragonfly Doji is bullish, Gravestone Doji is bearish
4. Always wait for confirmation before trading
5. Higher timeframes and volume increase reliability

Dojis are powerful when used correctly, but they require patience and confirmation. Master this pattern and you''ll have a valuable tool in your trading arsenal.', 'patterns', 3, 2, NULL);

-- Lesson 4: Hammer & Hanging Man
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-004', 'hammer-hanging-man', 'Hammer & Hanging Man', '# Hammer & Hanging Man Patterns

The Hammer and Hanging Man are single-candle reversal patterns that look identical but appear in different contexts, leading to opposite interpretations.

## The Anatomy

Both patterns share the same structure:

### Physical Characteristics:
- **Small body** at the upper end of the range
- **Little to no upper wick** (less than body length)
- **Long lower wick** (at least 2x the body length)
- Can be bullish or bearish color

The pattern looks like a hammer (or a man hanging from a gallows), hence the names.

## Hammer Pattern (Bullish Reversal)

A **Hammer** appears after a downtrend and signals a potential bullish reversal.

### What It Shows:
1. Sellers pushed price significantly lower (long lower wick)
2. Buyers stepped in and rejected those lows
3. Price closed near the high of the session (small upper wick)
4. Buying pressure overcame selling pressure

### Context:
- Appears at the **end of a downtrend** or at support
- Shows potential bottoming action
- Buyers are starting to gain control

### Confirmation:
Wait for the next candle to close **above** the Hammer''s high. This confirms buyers are in control.

### Strongest When:
- Body is green (bullish)
- Appears at major support level
- Volume is higher than average
- Lower wick is very long (3x+ body size)

## Hanging Man Pattern (Bearish Reversal)

A **Hanging Man** appears after an uptrend and signals a potential bearish reversal.

### What It Shows:
1. Despite being in an uptrend, sellers pushed price lower
2. Buyers defended and brought price back up
3. But the selling pressure is concerning - exhaustion signal
4. Could indicate a top is forming

### Context:
- Appears at the **end of an uptrend** or at resistance
- Shows potential topping action
- Sellers are starting to challenge buyers

### Confirmation:
Wait for the next candle to close **below** the Hanging Man''s low. This confirms sellers have taken control.

### Strongest When:
- Body is red (bearish)
- Appears at major resistance level
- Volume is higher than average
- Next candle gaps down

## Key Differences

| Aspect | Hammer | Hanging Man |
|--------|--------|-------------|
| **Location** | After downtrend | After uptrend |
| **Sentiment** | Bullish reversal | Bearish reversal |
| **Psychology** | Buyers reject lows | Sellers test support |
| **Best Color** | Green body | Red body |
| **Confirmation** | Close above high | Close below low |

## The Psychology Behind It

### Hammer Psychology:
- Market has been falling
- Sellers push for new lows but fail
- Buyers aggressively step in at lower prices
- Close near session high shows buyer strength
- Message: "The downtrend might be ending"

### Hanging Man Psychology:
- Market has been rising
- Despite uptrend, intraday selling appears
- Buyers defend but the selling is concerning
- Long lower wick shows sellers are active
- Message: "Buyers are weakening, be careful"

## Trading Strategy

### For Hammer (Long Setup):
1. **Wait for confirmation**: Next candle closes above Hammer high
2. **Entry**: At the close of confirmation candle
3. **Stop Loss**: Below the Hammer''s low (below the long wick)
4. **Target**: Previous resistance or 2-3x risk

### For Hanging Man (Short Setup):
1. **Wait for confirmation**: Next candle closes below Hanging Man low
2. **Entry**: At the close of confirmation candle
3. **Stop Loss**: Above the Hanging Man''s high
4. **Target**: Previous support or 2-3x risk

## Common Mistakes

### ❌ Confusing the Two
Same shape, different context! Always check: uptrend or downtrend?

### ❌ Trading Without Confirmation
The pattern alone isn''t enough. Wait for the next candle to confirm.

### ❌ Ignoring Wick Length
A true Hammer/Hanging Man needs a **long** lower wick (2-3x body). Short wicks don''t count.

### ❌ Wrong Stop Placement
Your stop should be below (Hammer) or above (Hanging Man) the entire pattern, including wicks.

## Pro Tips

1. **Check multiple timeframes**: Is the daily showing a Hammer while the 4H shows continued downtrend? Context matters.

2. **Volume matters**: Higher volume on these patterns increases reliability.

3. **Color preference**: Green Hammers and Red Hanging Men are slightly more reliable, but confirmation is more important than color.

4. **Combine with support/resistance**: These patterns are most powerful at key levels.

5. **Watch for follow-through**: The best setups see strong movement in the reversal direction after confirmation.

## Key Takeaways

1. Same shape, different context = different meaning
2. Hammer = bullish reversal after downtrend
3. Hanging Man = bearish reversal after uptrend
4. Long lower wick (2-3x body) is critical
5. Always wait for confirmation before trading
6. Higher timeframes and volume increase reliability

Master these patterns and you''ll have powerful tools for spotting potential reversals. Remember: context is everything, and confirmation is mandatory!', 'patterns', 4, 2, NULL);

-- Lesson 5: Engulfing Patterns
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-005', 'engulfing-patterns', 'Engulfing Patterns', '# Engulfing Patterns: Powerful Reversal Signals

Engulfing patterns are two-candle reversal patterns that signal a potential shift in market direction. They''re among the most reliable candlestick patterns when identified correctly.

## What is an Engulfing Pattern?

An engulfing pattern occurs when a candle''s body completely "engulfs" or covers the previous candle''s body.

### Key Requirements:
1. **Two candles** are needed
2. The second candle''s body must **completely cover** the first candle''s body
3. The colors must be **opposite** (bullish after bearish, or vice versa)
4. The wicks don''t need to be engulfed (only bodies matter)

## Bullish Engulfing Pattern

A **Bullish Engulfing** pattern signals a potential reversal from downtrend to uptrend.

### Structure:
- **Candle 1**: Small to medium bearish (red) candle
- **Candle 2**: Larger bullish (green) candle that completely engulfs Candle 1''s body

### What It Shows:
1. First day: Sellers are in control (red candle)
2. Second day: Buyers overwhelm sellers with force
3. Not only do buyers push past the previous open, they push significantly higher
4. Complete rejection of bearish sentiment

### Psychology:
- Bears were in control but exhausted
- Bulls aggressively stepped in
- Strong buying pressure overcame selling pressure
- Message: "The downtrend is likely ending, buyers are taking over"

### Strongest When:
- Appears after a clear downtrend
- Occurs at a major support level
- Second candle has very high volume
- Second candle is much larger than the first
- Appears on higher timeframes (daily, weekly)

## Bearish Engulfing Pattern

A **Bearish Engulfing** pattern signals a potential reversal from uptrend to downtrend.

### Structure:
- **Candle 1**: Small to medium bullish (green) candle
- **Candle 2**: Larger bearish (red) candle that completely engulfs Candle 1''s body

### What It Shows:
1. First day: Buyers are in control (green candle)
2. Second day: Sellers overwhelm buyers with force
3. Not only do sellers push past the previous open, they push significantly lower
4. Complete rejection of bullish sentiment

### Psychology:
- Bulls were in control but exhausted
- Bears aggressively stepped in
- Strong selling pressure overcame buying pressure
- Message: "The uptrend is likely ending, sellers are taking over"

### Strongest When:
- Appears after a clear uptrend
- Occurs at a major resistance level
- Second candle has very high volume
- Second candle is much larger than the first
- Appears on higher timeframes (daily, weekly)

## Size Matters

The relative sizes of the candles affect reliability:

### Ideal Setup:
- **First candle**: Small to medium body (shows weakness)
- **Second candle**: Large body that dwarfs the first (shows strength)
- **Ratio**: Second body should be 1.5x - 3x the first body

### Why Size Matters:
- Small first candle = trend is losing momentum
- Large second candle = new trend has strong conviction
- Bigger difference = more reliable signal

## Trading Engulfing Patterns

### Entry Strategies:

**Conservative (Recommended):**
1. Wait for pattern to complete (close of second candle)
2. Enter on a pullback or at the close of a confirmation candle
3. Increases win rate but may miss some moves

**Aggressive:**
1. Enter immediately at the close of the engulfing candle
2. Higher risk but captures full move
3. Requires strict stop loss

### Stop Loss Placement:

**For Bullish Engulfing:**
- Place stop below the low of the engulfing candle
- Some traders use the low of the entire pattern

**For Bearish Engulfing:**
- Place stop above the high of the engulfing candle
- Some traders use the high of the entire pattern

### Profit Targets:

1. **Measured Move**: Height of the engulfing candle projected from entry
2. **Key Levels**: Previous swing high/low
3. **Risk Ratio**: 2:1 or 3:1 minimum
4. **Trailing Stop**: Let winners run with trailing stops

## Advanced Tips

### 1. Context is Critical
- Stronger at key support/resistance levels
- More reliable after extended trends (exhaustion)
- Less reliable in ranging/choppy markets

### 2. Volume Confirmation
- Second candle should have above-average volume
- Volume shows conviction behind the reversal
- Low volume = questionable pattern

### 3. Multiple Timeframe Analysis
- Daily engulfing + 4H trend = high probability
- Intraday engulfing alone = lower reliability
- Zoom out to confirm the bigger picture

### 4. Combine with Other Signals
- Oversold/overbought indicators (RSI, Stochastic)
- Fibonacci retracement levels
- Trendline breaks
- Round number levels

## Common Mistakes to Avoid

### ❌ Ignoring the Trend
Engulfing patterns work best as **reversal** patterns. Don''t trade them in the middle of strong trends without context.

### ❌ Trading Every Pattern
Not all engulfing patterns work. Filter for:
- Clear preceding trend
- Strong volume on second candle
- Appearance at key levels
- Size differential

### ❌ Poor Stop Placement
Stops too tight = stopped out on normal volatility
Stops too wide = excessive risk
Use the pattern''s structure for logical stops

### ❌ Overtrading Intraday Patterns
Hourly and sub-hourly engulfing patterns are less reliable. Focus on 4H, daily, and weekly patterns.

## Real-World Example

**Setup:**
- Stock in downtrend for 3 weeks
- Approaches major support at $50
- Small red candle forms at $50.50
- Next day: Large green candle opens at $49.80, closes at $52.00
- **Bullish Engulfing confirmed!**

**Trade:**
- Entry: $52.00 (close of engulfing candle)
- Stop: $49.50 (below engulfing candle low)
- Risk: $2.50 per share
- Target: $57.50 (previous resistance, 2.2:1 R:R)

**Result:** Price rallies to $56.80 in 5 days (good, not perfect)

## Key Takeaways

1. Engulfing = one candle''s body completely covers another
2. Bullish engulfing signals upside reversal (after downtrend)
3. Bearish engulfing signals downside reversal (after uptrend)
4. Larger second candle = stronger signal
5. Volume, context, and location matter immensely
6. Works best on higher timeframes at key levels
7. Always use proper risk management

Engulfing patterns are powerful, reliable signals when used in the right context. Master them, and you''ll spot many high-probability trading opportunities!', 'patterns', 5, 3, NULL);

-- Lesson 6: Morning Star & Evening Star
INSERT INTO lessons (id, slug, title, content, category, `order`, difficulty, image_url)
VALUES ('lesson-006', 'morning-evening-star', 'Morning Star & Evening Star', '# Morning Star & Evening Star: Three-Candle Reversals

The Morning Star and Evening Star are three-candle reversal patterns that signal potential trend changes. They''re considered among the most reliable reversal patterns in technical analysis.

## Pattern Structure

Both patterns consist of three distinct candles that tell a story of trend exhaustion and reversal.

### Common Elements:
- **Three candles** (not two, not four)
- Middle candle shows **indecision** (small body)
- Third candle **confirms** the reversal
- Can span 2-3 trading sessions

## Morning Star (Bullish Reversal)

The **Morning Star** appears after a downtrend and signals a potential bullish reversal.

### Three-Candle Sequence:

**Candle 1: The Decline**
- Large bearish (red) body
- Continuation of downtrend
- Sellers still in control

**Candle 2: The Star (Indecision)**
- Small body (can be bullish or bearish)
- Often gaps down from Candle 1
- Shows selling momentum is weakening
- Can be a Doji (even stronger signal)

**Candle 3: The Reversal**
- Large bullish (green) body
- Closes well into Candle 1''s body (ideally above midpoint)
- Confirms buyer strength
- Often gaps up from Candle 2

### What The Pattern Shows:

1. **Day 1**: Bears in full control, pushing lower
2. **Day 2**: Momentum slows, indecision appears, potential bottom forming
3. **Day 3**: Bulls take over aggressively, closing strongly higher

### Psychology:
- Sellers exhausted their selling pressure (Day 1)
- Equilibrium reached at lower prices (Day 2)
- Buyers stepped in with conviction (Day 3)
- Message: "The bottom is in, time to buy"

### Strongest When:
- Appears after a strong, prolonged downtrend
- Occurs at a major support level or round number
- Middle candle gaps down significantly
- Third candle closes above 50% of first candle
- High volume on third candle

## Evening Star (Bearish Reversal)

The **Evening Star** appears after an uptrend and signals a potential bearish reversal.

### Three-Candle Sequence:

**Candle 1: The Rally**
- Large bullish (green) body
- Continuation of uptrend
- Buyers still in control

**Candle 2: The Star (Indecision)**
- Small body (can be bullish or bearish)
- Often gaps up from Candle 1
- Shows buying momentum is weakening
- Can be a Doji (even stronger signal)

**Candle 3: The Reversal**
- Large bearish (red) body
- Closes well into Candle 1''s body (ideally below midpoint)
- Confirms seller strength
- Often gaps down from Candle 2

### What The Pattern Shows:

1. **Day 1**: Bulls in full control, pushing higher
2. **Day 2**: Momentum slows, indecision appears, potential top forming
3. **Day 3**: Bears take over aggressively, closing strongly lower

### Psychology:
- Buyers exhausted their buying pressure (Day 1)
- Equilibrium reached at higher prices (Day 2)
- Sellers stepped in with conviction (Day 3)
- Message: "The top is in, time to sell"

### Strongest When:
- Appears after a strong, prolonged uptrend
- Occurs at a major resistance level or round number
- Middle candle gaps up significantly
- Third candle closes below 50% of first candle
- High volume on third candle

## The Middle Candle (The "Star")

The middle candle is crucial. It can be:

### Doji Star
- Open equals close (or nearly)
- **Strongest signal** of indecision
- Most reliable version of the pattern

### Spinning Top
- Small body with wicks on both sides
- Shows indecision but less than Doji
- Still valid, slightly less reliable

### Small Body
- Any small body (bullish or bearish)
- Shows momentum loss
- Acceptable but confirmation is critical

**Key Point**: The smaller the middle candle, the stronger the pattern!

## Gap Requirements

Traditional Japanese candlestick analysis requires gaps:

### Morning Star:
- Gap down from Candle 1 to Candle 2
- Gap up from Candle 2 to Candle 3

### Evening Star:
- Gap up from Candle 1 to Candle 2
- Gap down from Candle 2 to Candle 3

**Modern Markets**: In 24/7 markets (crypto, forex), gaps are rare. Pattern still valid without gaps, but slightly less powerful.

## Trading the Patterns

### Entry Strategies:

**Conservative:**
- Wait for the pattern to complete (close of third candle)
- Enter on a pullback or retest
- Confirmation: Fourth candle continues in the reversal direction

**Aggressive:**
- Enter at the close of the third candle
- Requires confidence in the setup
- Higher risk, higher reward

### Stop Loss:

**For Morning Star (Long):**
- Below the low of the middle candle (Star)
- Or below the low of the entire three-candle pattern

**For Evening Star (Short):**
- Above the high of the middle candle (Star)
- Or above the high of the entire three-candle pattern

### Profit Targets:

1. **Swing Target**: Previous swing high (Morning Star) or low (Evening Star)
2. **Measured Move**: Height of first candle projected from entry
3. **Key Levels**: Fibonacci levels, support/resistance zones
4. **Risk Ratio**: Minimum 2:1, aim for 3:1

## Advanced Considerations

### Volume Profile:
- **Ideal**: Declining volume on Days 1-2, increasing on Day 3
- High volume on third candle confirms conviction
- Low volume = questionable reversal

### Market Context:
- **Oversold/Overbought**: RSI confirmation strengthens signal
- **Trendlines**: Breaking a trendline adds confluence
- **Moving Averages**: Bouncing off key MAs (50-day, 200-day)

### Multiple Timeframes:
- Daily pattern + 4H trend alignment = high probability
- Weekly Morning Star = very powerful long-term signal
- Intraday patterns = less reliable, use with caution

## Common Mistakes

### ❌ Trading Without Full Pattern
Don''t anticipate! Wait for all three candles to form.

### ❌ Ignoring Candle Size
First and third candles should be significant. Tiny candles = weak signal.

### ❌ No Context
These are reversal patterns. They need a trend to reverse!

### ❌ Weak Middle Candle
Middle candle should be noticeably smaller than first/third.

### ❌ Poor Location
Random mid-trend patterns don''t work. Look for key support/resistance.

## Comparison to Other Patterns

| Pattern | Candles | Strength | Frequency |
|---------|---------|----------|-----------|
| **Morning/Evening Star** | 3 | Very High | Rare |
| **Engulfing** | 2 | High | Common |
| **Hammer/Hanging Man** | 1 | Medium | Common |
| **Doji** | 1 | Low-Medium | Very Common |

## Real-World Example

**Morning Star on Bitcoin:**

- **Day 1**: BTC drops from $42K to $38K, large red candle
- **Day 2**: Small Doji at $38K, gaps slightly lower
- **Day 3**: Strong rally to $40.5K, large green candle
- **Pattern confirmed!**

**Trade Execution:**
- Entry: $40.5K (close of third candle)
- Stop: $37.5K (below pattern low)
- Risk: $3K per BTC
- Target: $44K (previous resistance)
- Reward:Risk = 1.17:1 (too low!)

**Adjustment:**
- Target: $46K (next major resistance)
- Reward:Risk = 1.83:1 (better!)

**Result**: Price reached $45.2K within 1 week (winner!)

## Key Takeaways

1. Three-candle reversal patterns (Morning Star = bullish, Evening Star = bearish)
2. Middle candle shows indecision (smaller is better, Doji is ideal)
3. Third candle confirms reversal (closes into first candle''s body)
4. Appear after extended trends at key levels
5. Gaps strengthen the pattern but aren''t required in modern markets
6. Volume should increase on third candle
7. Combine with other indicators for highest probability
8. Wait for complete pattern before trading

Morning Stars and Evening Stars are some of the most powerful reversal patterns you can find. When they appear in the right context with proper confirmation, they offer excellent risk-reward opportunities. Master these patterns, and you''ll catch significant reversals!', 'patterns', 6, 3, NULL);