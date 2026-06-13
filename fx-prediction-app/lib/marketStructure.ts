import { OHLCV, MarketStructure } from '@/types';

interface SwingPoint {
  index: number;
  price: number;
  date: string;
  type: 'high' | 'low';
}

/**
 * Detect local swing highs and lows using a left/right bar comparison.
 * A swing high at index i requires c[i].high to be strictly greater than
 * the `strength` bars on each side.  Swing lows are the mirror image.
 */
function findSwingPoints(candles: OHLCV[], strength: number = 3): SwingPoint[] {
  const points: SwingPoint[] = [];

  for (let i = strength; i < candles.length - strength; i++) {
    const c = candles[i];

    // Swing high
    let isSwingHigh = true;
    for (let k = 1; k <= strength; k++) {
      if (candles[i - k].high >= c.high || candles[i + k].high >= c.high) {
        isSwingHigh = false;
        break;
      }
    }
    if (isSwingHigh) {
      points.push({ index: i, price: c.high, date: c.date, type: 'high' });
      continue; // a candle cannot be both high and low
    }

    // Swing low
    let isSwingLow = true;
    for (let k = 1; k <= strength; k++) {
      if (candles[i - k].low <= c.low || candles[i + k].low <= c.low) {
        isSwingLow = false;
        break;
      }
    }
    if (isSwingLow) {
      points.push({ index: i, price: c.low, date: c.date, type: 'low' });
    }
  }

  return points;
}

/**
 * Classify the last few swing points as HH / HL / LH / LL and derive
 * trend, CHoCH and BOS signals.
 */
export function analyzeMarketStructure(candles: OHLCV[]): MarketStructure {
  if (candles.length < 10) {
    const last = candles[candles.length - 1];
    return {
      trend: 'ranging',
      lastSwingHigh: Math.round(last.high * 100) / 100,
      lastSwingLow: Math.round(last.low * 100) / 100,
      choch: false,
      bos: false,
      description: 'データ不足のため構造分析不可',
    };
  }

  const swings = findSwingPoints(candles, 3);

  // Separate highs and lows, keep only the last several of each
  const swingHighs = swings.filter(s => s.type === 'high').slice(-6);
  const swingLows  = swings.filter(s => s.type === 'low').slice(-6);

  const lastSwingHigh = swingHighs.length > 0 ? swingHighs[swingHighs.length - 1].price : candles[candles.length - 1].high;
  const lastSwingLow  = swingLows.length  > 0 ? swingLows[swingLows.length - 1].price   : candles[candles.length - 1].low;

  const currentPrice = candles[candles.length - 1].close;

  // ── Trend classification ────────────────────────────────────────────────────
  // Requires at least 2 swing highs AND 2 swing lows to determine structure.
  let hhCount = 0, hlCount = 0, lhCount = 0, llCount = 0;

  for (let i = 1; i < swingHighs.length; i++) {
    if (swingHighs[i].price > swingHighs[i - 1].price) hhCount++;
    else lhCount++;
  }
  for (let i = 1; i < swingLows.length; i++) {
    if (swingLows[i].price > swingLows[i - 1].price) hlCount++;
    else llCount++;
  }

  let trend: MarketStructure['trend'] = 'ranging';
  if (hhCount > lhCount && hlCount > llCount) {
    trend = 'uptrend';
  } else if (lhCount > hhCount && llCount > hlCount) {
    trend = 'downtrend';
  }

  // ── BOS (Break of Structure) ────────────────────────────────────────────────
  // Bullish BOS: current price clearly above the last significant swing high.
  // Bearish BOS: current price clearly below the last significant swing low.
  const bosThreshold = 0.001; // 0.1% clearance to avoid noise
  const bos =
    currentPrice > lastSwingHigh * (1 + bosThreshold) ||
    currentPrice < lastSwingLow  * (1 - bosThreshold);

  // ── CHoCH (Change of Character) ────────────────────────────────────────────
  // Detected when the most recent swing high is HIGHER than the previous in a
  // downtrend (first HH), or when the most recent swing low is LOWER than the
  // previous in an uptrend (first LL).
  let choch = false;
  if (trend === 'downtrend' && swingHighs.length >= 2) {
    const lastH  = swingHighs[swingHighs.length - 1].price;
    const prevH  = swingHighs[swingHighs.length - 2].price;
    if (lastH > prevH) choch = true; // first HH in a downtrend → CHoCH
  }
  if (trend === 'uptrend' && swingLows.length >= 2) {
    const lastL = swingLows[swingLows.length - 1].price;
    const prevL = swingLows[swingLows.length - 2].price;
    if (lastL < prevL) choch = true; // first LL in an uptrend → CHoCH
  }

  // ── Human-readable description ──────────────────────────────────────────────
  const parts: string[] = [];

  if (trend === 'uptrend') parts.push('上昇トレンド（HH・HL継続）');
  else if (trend === 'downtrend') parts.push('下降トレンド（LH・LL継続）');
  else parts.push('レンジ相場');

  if (choch) parts.push('CHoCH検出（トレンド転換の兆候）');
  if (bos) {
    if (currentPrice > lastSwingHigh) parts.push(`BOS: 直近高値 ${Math.round(lastSwingHigh * 100) / 100} を上抜き`);
    else parts.push(`BOS: 直近安値 ${Math.round(lastSwingLow * 100) / 100} を下抜き`);
  }

  parts.push(
    `直近スイング高値: ${Math.round(lastSwingHigh * 100) / 100} / 安値: ${Math.round(lastSwingLow * 100) / 100}`
  );

  return {
    trend,
    lastSwingHigh: Math.round(lastSwingHigh * 100) / 100,
    lastSwingLow:  Math.round(lastSwingLow  * 100) / 100,
    choch,
    bos,
    description: parts.join(' | '),
  };
}
