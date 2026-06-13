import { OHLCV, OrderBlock, Timeframe } from '@/types';

/**
 * Detect ICT-style Order Blocks from the candle series.
 *
 * An Order Block is the candle immediately BEFORE a strong impulsive move:
 *   - Bullish OB: a bearish candle that precedes a strong bullish impulse.
 *   - Bearish OB: a bullish candle that precedes a strong bearish impulse.
 *
 * "Strong move" is defined as the next candle's range exceeding ATR * 1.5.
 *
 * A block is "untested" if the current price has NOT returned into the OB zone
 * after the impulse moved away.  We return up to 3 of the most recent untested
 * blocks of each polarity.
 */
export function detectOrderBlocks(
  candles: OHLCV[],
  atr: number,
  timeframe: Timeframe,
): OrderBlock[] {
  if (candles.length < 3 || atr <= 0) return [];

  const threshold = atr * 1.5;
  const currentPrice = candles[candles.length - 1].close;

  const bullishOBs: OrderBlock[] = [];
  const bearishOBs: OrderBlock[] = [];

  // Scan all candles except the last (needs a "next" candle to evaluate the move)
  for (let i = 0; i < candles.length - 1; i++) {
    const ob   = candles[i];     // potential order block candle
    const next = candles[i + 1]; // the strong impulse candle

    const nextRange = next.high - next.low;
    if (nextRange < threshold) continue; // not a strong enough move

    const isBullishMove = next.close > next.open;
    const isBearishMove = next.close < next.open;
    const isObBearish   = ob.close < ob.open;
    const isObBullish   = ob.close > ob.open;

    // ── Bullish OB: bearish OB candle before a strong bullish impulse ──────
    if (isBullishMove && isObBearish) {
      // The OB zone spans the full body/wick of the OB candle
      const obHigh = ob.high;
      const obLow  = ob.low;

      // Untested: price has NOT returned to the OB zone after the impulse
      // We check every candle from i+2 onwards to see if it dipped into the zone
      let tested = false;
      for (let k = i + 2; k < candles.length; k++) {
        if (candles[k].low <= obHigh && candles[k].high >= obLow) {
          tested = true;
          break;
        }
      }

      bullishOBs.push({
        type: 'bullish',
        high: Math.round(obHigh * 100) / 100,
        low:  Math.round(obLow  * 100) / 100,
        timeframe,
        untested: !tested,
        date: ob.date,
      });
    }

    // ── Bearish OB: bullish OB candle before a strong bearish impulse ──────
    if (isBearishMove && isObBullish) {
      const obHigh = ob.high;
      const obLow  = ob.low;

      let tested = false;
      for (let k = i + 2; k < candles.length; k++) {
        if (candles[k].low <= obHigh && candles[k].high >= obLow) {
          tested = true;
          break;
        }
      }

      bearishOBs.push({
        type: 'bearish',
        high: Math.round(obHigh * 100) / 100,
        low:  Math.round(obLow  * 100) / 100,
        timeframe,
        untested: !tested,
        date: ob.date,
      });
    }
  }

  // Keep only untested blocks, take the 3 most recent of each type
  const recentUntested = (blocks: OrderBlock[]) =>
    blocks.filter(b => b.untested).slice(-3).reverse();

  return [...recentUntested(bullishOBs), ...recentUntested(bearishOBs)];
}
