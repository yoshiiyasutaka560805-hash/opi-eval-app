import { OHLCV, LiquidityZone } from '@/types';

/**
 * Detect liquidity zones from equal highs / equal lows.
 *
 * Equal Highs:
 *   - Find groups of candle highs that are within 0.3% of each other.
 *   - Requires at least 2 touches.
 *   - "Swept" = price later moved ABOVE the equal high then closed BELOW it.
 *
 * Equal Lows:
 *   - Find groups of candle lows within 0.3% of each other.
 *   - "Swept" = price moved BELOW the equal low then closed ABOVE it.
 */
export function detectLiquidityZones(candles: OHLCV[]): LiquidityZone[] {
  if (candles.length < 5) return [];

  const TOLERANCE = 0.003; // 0.3%
  const zones: LiquidityZone[] = [];

  // ── Helper: group values by proximity ────────────────────────────────────────
  interface PricedCandle { price: number; index: number; date: string }

  function groupByProximity(points: PricedCandle[]): PricedCandle[][] {
    const used = new Set<number>();
    const groups: PricedCandle[][] = [];

    for (let i = 0; i < points.length; i++) {
      if (used.has(i)) continue;
      const group: PricedCandle[] = [points[i]];
      used.add(i);
      for (let j = i + 1; j < points.length; j++) {
        if (used.has(j)) continue;
        if (Math.abs(points[i].price - points[j].price) / points[i].price < TOLERANCE) {
          group.push(points[j]);
          used.add(j);
        }
      }
      if (group.length >= 2) groups.push(group);
    }
    return groups;
  }

  // ── Equal Highs ───────────────────────────────────────────────────────────────
  const highPoints: PricedCandle[] = candles.map((c, i) => ({ price: c.high, index: i, date: c.date }));
  const highGroups = groupByProximity(highPoints);

  for (const group of highGroups) {
    const levelPrice = group.reduce((s, g) => s + g.price, 0) / group.length;
    const lastIdx    = Math.max(...group.map(g => g.index));

    // Check for a sweep: any candle after the last touch that went above the
    // level but then closed below it.
    let swept     = false;
    let sweepDate: string | undefined;

    for (let k = lastIdx + 1; k < candles.length; k++) {
      if (candles[k].high > levelPrice && candles[k].close < levelPrice) {
        swept     = true;
        sweepDate = candles[k].date;
        break;
      }
    }

    zones.push({
      type:       'equal_highs',
      price:      Math.round(levelPrice * 100) / 100,
      touchCount: group.length,
      swept,
      sweepDate,
    });
  }

  // ── Equal Lows ────────────────────────────────────────────────────────────────
  const lowPoints: PricedCandle[] = candles.map((c, i) => ({ price: c.low, index: i, date: c.date }));
  const lowGroups = groupByProximity(lowPoints);

  for (const group of lowGroups) {
    const levelPrice = group.reduce((s, g) => s + g.price, 0) / group.length;
    const lastIdx    = Math.max(...group.map(g => g.index));

    let swept     = false;
    let sweepDate: string | undefined;

    for (let k = lastIdx + 1; k < candles.length; k++) {
      if (candles[k].low < levelPrice && candles[k].close > levelPrice) {
        swept     = true;
        sweepDate = candles[k].date;
        break;
      }
    }

    zones.push({
      type:       'equal_lows',
      price:      Math.round(levelPrice * 100) / 100,
      touchCount: group.length,
      swept,
      sweepDate,
    });
  }

  // Sort by touch count descending, then by recency (higher index = more recent)
  return zones.sort((a, b) => b.touchCount - a.touchCount);
}
