import { OHLCV, FibonacciData, FibLevel, FibConfluence, Timeframe } from '@/types';

const FIB_RATIOS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0];

// Find swing high and low from last N candles using zigzag approach
function findSwingHighLow(candles: OHLCV[], lookback: number = 90): { high: number; low: number; highDate: string; lowDate: string } {
  const recent = candles.slice(-lookback);
  let high = -Infinity, low = Infinity;
  let highDate = '', lowDate = '';
  for (const c of recent) {
    if (c.high > high) { high = c.high; highDate = c.date; }
    if (c.low < low) { low = c.low; lowDate = c.date; }
  }
  return { high, low, highDate, lowDate };
}

// Calculate Fibonacci levels from swing
function calcFibLevels(swingHigh: number, swingLow: number, currentPrice: number, isUpswing: boolean): FibLevel[] {
  return FIB_RATIOS.map(ratio => {
    const price = isUpswing
      ? swingHigh - (swingHigh - swingLow) * ratio
      : swingLow + (swingHigh - swingLow) * ratio;
    const isNear = Math.abs(price - currentPrice) / currentPrice < 0.005; // within 0.5%
    return { ratio, price: Math.round(price * 100) / 100, isNear };
  });
}

// Calculate classic pivot points from previous day OHLC
function calcPivotPoints(prevHigh: number, prevLow: number, prevClose: number) {
  const pp = (prevHigh + prevLow + prevClose) / 3;
  return {
    pp: Math.round(pp * 100) / 100,
    r1: Math.round((2 * pp - prevLow) * 100) / 100,
    r2: Math.round((pp + prevHigh - prevLow) * 100) / 100,
    r3: Math.round((prevHigh + 2 * (pp - prevLow)) * 100) / 100,
    s1: Math.round((2 * pp - prevHigh) * 100) / 100,
    s2: Math.round((pp - prevHigh + prevLow) * 100) / 100,
    s3: Math.round((prevLow - 2 * (prevHigh - pp)) * 100) / 100,
  };
}

export function calculateFibonacci(candles: OHLCV[], currentPrice: number, timeframe: Timeframe = 'daily'): FibonacciData {
  const { high, low } = findSwingHighLow(candles);
  const isUpswing = currentPrice > (high + low) / 2;
  const levels = calcFibLevels(high, low, currentPrice, isUpswing);

  const prev = candles[candles.length - 2] || candles[candles.length - 1];
  const pivotPoints = calcPivotPoints(prev.high, prev.low, prev.close);

  // Find nearest support and resistance
  const supportLevels = levels.filter(l => l.price < currentPrice).map(l => l.price);
  const resistanceLevels = levels.filter(l => l.price > currentPrice).map(l => l.price);
  const nearestSupport = supportLevels.length > 0 ? Math.max(...supportLevels) : low;
  const nearestResistance = resistanceLevels.length > 0 ? Math.min(...resistanceLevels) : high;

  return {
    swingHigh: Math.round(high * 100) / 100,
    swingLow: Math.round(low * 100) / 100,
    isUpswing,
    levels,
    pivotPoints,
    nearestSupport: Math.round(nearestSupport * 100) / 100,
    nearestResistance: Math.round(nearestResistance * 100) / 100,
    confluenceZones: [], // populated when multi-TF data available
  };
}

export function findFibConfluence(fibsByTimeframe: Record<Timeframe, FibonacciData>): FibConfluence[] {
  const allLevels: Array<{ price: number; timeframe: Timeframe; type: 'support' | 'resistance' }> = [];

  for (const [tf, fib] of Object.entries(fibsByTimeframe) as [Timeframe, FibonacciData][]) {
    for (const level of fib.levels) {
      allLevels.push({ price: level.price, timeframe: tf, type: level.price < fib.swingLow ? 'support' : 'resistance' });
    }
  }

  const confluences: FibConfluence[] = [];
  const tolerance = 0.003; // 0.3% tolerance for confluence

  for (let i = 0; i < allLevels.length; i++) {
    const zone: typeof allLevels = [allLevels[i]];
    for (let j = i + 1; j < allLevels.length; j++) {
      if (Math.abs(allLevels[i].price - allLevels[j].price) / allLevels[i].price < tolerance) {
        zone.push(allLevels[j]);
      }
    }
    if (zone.length >= 2) {
      const prices = zone.map(z => z.price);
      const uniqueTFs = [...new Set(zone.map(z => z.timeframe))];
      if (!confluences.some(c => Math.abs(c.priceZone.lower - Math.min(...prices)) < 1)) {
        confluences.push({
          priceZone: { lower: Math.round(Math.min(...prices) * 100) / 100, upper: Math.round(Math.max(...prices) * 100) / 100 },
          timeframes: uniqueTFs,
          strength: uniqueTFs.length,
          type: zone[0].type,
        });
      }
    }
  }

  return confluences.sort((a, b) => b.strength - a.strength);
}
