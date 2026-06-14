import { OHLCV, FairValueGap, Timeframe } from '@/types';

/**
 * Detect Fair Value Gaps (FVGs) using the classic 3-candle pattern.
 *
 * Bullish FVG:  candle[i].high  < candle[i+2].low
 *   → gap exists between top of candle i and bottom of candle i+2.
 *   → the FVG zone: lower = candle[i].high, upper = candle[i+2].low
 *
 * Bearish FVG:  candle[i].low   > candle[i+2].high
 *   → gap exists between bottom of candle i and top of candle i+2.
 *   → the FVG zone: lower = candle[i+2].high, upper = candle[i].low
 *
 * A gap is "filled" when price has subsequently traded through the full zone.
 * We return up to 5 most recent unfilled FVGs.
 */
export function detectFVGs(candles: OHLCV[], timeframe: Timeframe): FairValueGap[] {
  if (candles.length < 3) return [];

  const currentPrice = candles[candles.length - 1].close;
  const fvgs: FairValueGap[] = [];

  for (let i = 0; i < candles.length - 2; i++) {
    const c1 = candles[i];
    const c3 = candles[i + 2];

    // ── Bullish FVG ──────────────────────────────────────────────────────────
    if (c1.high < c3.low) {
      const lower    = c1.high;
      const upper    = c3.low;
      const midpoint = (upper + lower) / 2;

      // Check if price has ever traded down through the zone after c3
      let filled = false;
      for (let k = i + 3; k < candles.length; k++) {
        if (candles[k].low <= lower) { // price passed through bottom of the gap
          filled = true;
          break;
        }
      }

      fvgs.push({
        type: 'bullish',
        upper:    Math.round(upper    * 100) / 100,
        lower:    Math.round(lower    * 100) / 100,
        midpoint: Math.round(midpoint * 100) / 100,
        timeframe,
        filled,
        date: c1.date,
      });
    }

    // ── Bearish FVG ──────────────────────────────────────────────────────────
    if (c1.low > c3.high) {
      const lower    = c3.high;
      const upper    = c1.low;
      const midpoint = (upper + lower) / 2;

      // Check if price has ever traded up through the zone after c3
      let filled = false;
      for (let k = i + 3; k < candles.length; k++) {
        if (candles[k].high >= upper) { // price passed through top of the gap
          filled = true;
          break;
        }
      }

      fvgs.push({
        type: 'bearish',
        upper:    Math.round(upper    * 100) / 100,
        lower:    Math.round(lower    * 100) / 100,
        midpoint: Math.round(midpoint * 100) / 100,
        timeframe,
        filled,
        date: c1.date,
      });
    }
  }

  // Return only unfilled FVGs, most recent first, capped at 5
  return fvgs
    .filter(f => !f.filled)
    .reverse()   // most recent at the front
    .slice(0, 5);
}
