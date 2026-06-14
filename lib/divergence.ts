import { OHLCV, TechnicalIndicators, DivergenceResult, Timeframe } from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

/**
 * Find the index of the local minimum value in arr over the last `window` elements.
 * Returns { index, value }.
 */
function localMinLast(arr: number[], window: number): { index: number; value: number } {
  const slice = arr.slice(-window);
  let minVal = Infinity, minIdx = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] < minVal) { minVal = slice[i]; minIdx = i; }
  }
  // Convert back to full-array index
  return { index: arr.length - window + minIdx, value: minVal };
}

/**
 * Find the index of the local maximum value in arr over the last `window` elements.
 */
function localMaxLast(arr: number[], window: number): { index: number; value: number } {
  const slice = arr.slice(-window);
  let maxVal = -Infinity, maxIdx = 0;
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] > maxVal) { maxVal = slice[i]; maxIdx = i; }
  }
  return { index: arr.length - window + maxIdx, value: maxVal };
}

// ── core detector ─────────────────────────────────────────────────────────────

/**
 * Check RSI divergence over the last `window` candles.
 * Returns a DivergenceResult (type 'none' when no divergence is found).
 */
function checkRsiDivergence(
  closes: number[],
  highs: number[],
  lows: number[],
  rsiSeries: number[],
  window: number,
  timeframe: Timeframe,
): DivergenceResult {
  const none: DivergenceResult = { type: 'none', indicator: 'RSI', timeframe, description: '' };

  if (rsiSeries.length < window || closes.length < window) return none;

  // Recent extremes in price (closes) and RSI over the window
  const priceHigh = localMaxLast(highs, window);
  const priceLow  = localMinLast(lows,  window);

  // Current values (last element)
  const currPrice    = closes[closes.length - 1];
  const currRsi      = rsiSeries[rsiSeries.length - 1];
  const prevHigh     = priceHigh.value;
  const prevHighRsi  = rsiSeries[priceHigh.index];
  const prevLow      = priceLow.value;
  const prevLowRsi   = rsiSeries[priceLow.index];

  // Guard: do not compare with the current bar itself
  const isAtHigh = priceHigh.index === closes.length - 1;
  const isAtLow  = priceLow.index  === closes.length - 1;

  // Regular Bearish: price HH but RSI LH
  if (!isAtHigh && currPrice >= prevHigh && currRsi < prevHighRsi) {
    return {
      type: 'regular_bearish',
      indicator: 'RSI',
      timeframe,
      description: `RSI レギュラー・ベアリッシュダイバージェンス（価格は高値更新、RSIは切り下げ）— ${timeframe}`,
    };
  }

  // Regular Bullish: price LL but RSI HL
  if (!isAtLow && currPrice <= prevLow && currRsi > prevLowRsi) {
    return {
      type: 'regular_bullish',
      indicator: 'RSI',
      timeframe,
      description: `RSI レギュラー・ブリッシュダイバージェンス（価格は安値更新、RSIは切り上げ）— ${timeframe}`,
    };
  }

  // Hidden Bullish: price HL but RSI LL (continuation of uptrend)
  if (!isAtLow && currPrice > prevLow && currRsi <= prevLowRsi) {
    return {
      type: 'hidden_bullish',
      indicator: 'RSI',
      timeframe,
      description: `RSI ヒドゥン・ブリッシュダイバージェンス（価格は切り上げ、RSIは安値更新）— ${timeframe}`,
    };
  }

  // Hidden Bearish: price LH but RSI HH (continuation of downtrend)
  if (!isAtHigh && currPrice < prevHigh && currRsi >= prevHighRsi) {
    return {
      type: 'hidden_bearish',
      indicator: 'RSI',
      timeframe,
      description: `RSI ヒドゥン・ベアリッシュダイバージェンス（価格は切り下げ、RSIは高値更新）— ${timeframe}`,
    };
  }

  return none;
}

/**
 * Check MACD histogram divergence over the last `window` candles.
 * The MACD histogram acts as the oscillator proxy (single current value provided).
 * We approximate a series by using the current histogram value vs a synthetic
 * previous peak/trough derived from the price move direction.
 */
function checkMacdDivergence(
  closes: number[],
  highs: number[],
  lows: number[],
  macdHistogram: number,
  window: number,
  timeframe: Timeframe,
): DivergenceResult {
  const none: DivergenceResult = { type: 'none', indicator: 'MACD', timeframe, description: '' };

  if (closes.length < window) return none;

  const priceHigh = localMaxLast(highs, window);
  const priceLow  = localMinLast(lows,  window);
  const currPrice = closes[closes.length - 1];

  const isAtHigh = priceHigh.index === closes.length - 1;
  const isAtLow  = priceLow.index  === closes.length - 1;

  // Estimate the MACD histogram at the prior swing using the price-return ratio.
  // This is a heuristic: if price rose X% from the prior high to now but MACD
  // did not confirm (histogram is negative / lower), we call divergence.
  if (!isAtHigh && currPrice >= priceHigh.value && macdHistogram < 0) {
    return {
      type: 'regular_bearish',
      indicator: 'MACD',
      timeframe,
      description: `MACD レギュラー・ベアリッシュダイバージェンス（価格高値更新・MACDヒストグラム弱含み）— ${timeframe}`,
    };
  }

  if (!isAtLow && currPrice <= priceLow.value && macdHistogram > 0) {
    return {
      type: 'regular_bullish',
      indicator: 'MACD',
      timeframe,
      description: `MACD レギュラー・ブリッシュダイバージェンス（価格安値更新・MACDヒストグラム強含み）— ${timeframe}`,
    };
  }

  return none;
}

/**
 * Check Stochastic divergence over the last `window` candles.
 */
function checkStochasticDivergence(
  closes: number[],
  highs: number[],
  lows: number[],
  stochK: number,
  window: number,
  timeframe: Timeframe,
): DivergenceResult {
  const none: DivergenceResult = { type: 'none', indicator: 'Stochastic', timeframe, description: '' };

  if (closes.length < window) return none;

  const priceHigh = localMaxLast(highs, window);
  const priceLow  = localMinLast(lows,  window);
  const currPrice = closes[closes.length - 1];

  const isAtHigh = priceHigh.index === closes.length - 1;
  const isAtLow  = priceLow.index  === closes.length - 1;

  // Stochastic overbought/oversold thresholds as proxy for prior oscillator peak/trough
  // Regular Bearish: price HH, stoch is not overbought (i.e., lower than 80)
  if (!isAtHigh && currPrice >= priceHigh.value && stochK < 75) {
    return {
      type: 'regular_bearish',
      indicator: 'Stochastic',
      timeframe,
      description: `ストキャスティクス レギュラー・ベアリッシュダイバージェンス（価格高値更新・ストキャス弱含み）— ${timeframe}`,
    };
  }

  // Regular Bullish: price LL, stoch is not oversold (i.e., above 25)
  if (!isAtLow && currPrice <= priceLow.value && stochK > 25) {
    return {
      type: 'regular_bullish',
      indicator: 'Stochastic',
      timeframe,
      description: `ストキャスティクス レギュラー・ブリッシュダイバージェンス（価格安値更新・ストキャス強含み）— ${timeframe}`,
    };
  }

  // Hidden Bullish: price HL but stoch makes LL (stoch < 20 in uptrend pullback)
  if (!isAtLow && currPrice > priceLow.value && stochK < 20) {
    return {
      type: 'hidden_bullish',
      indicator: 'Stochastic',
      timeframe,
      description: `ストキャスティクス ヒドゥン・ブリッシュダイバージェンス（価格切り上げ・ストキャス過売れ）— ${timeframe}`,
    };
  }

  // Hidden Bearish: price LH but stoch makes HH (stoch > 80 in downtrend bounce)
  if (!isAtHigh && currPrice < priceHigh.value && stochK > 80) {
    return {
      type: 'hidden_bearish',
      indicator: 'Stochastic',
      timeframe,
      description: `ストキャスティクス ヒドゥン・ベアリッシュダイバージェンス（価格切り下げ・ストキャス過買い）— ${timeframe}`,
    };
  }

  return none;
}

// ── public API ────────────────────────────────────────────────────────────────

export function detectDivergence(
  candles: OHLCV[],
  indicators: TechnicalIndicators,
  timeframe: Timeframe,
): DivergenceResult[] {
  const WINDOW = 20;

  const closes = candles.map(c => c.close);
  const highs   = candles.map(c => c.high);
  const lows    = candles.map(c => c.low);

  // Build an approximate RSI series using the last WINDOW close values.
  // (Only the current RSI value is available in TechnicalIndicators, so we
  //  approximate the prior pivot RSI by scaling with the price ratio.)
  const rsi14 = indicators.rsi14;
  // We create a pseudo-series: all values are rsi14 except we simulate a
  // divergence-detectable "prior" by using the price-momentum heuristic.
  // For real accuracy a full RSI series would be needed, but we detect based
  // on current RSI relative to overbought/oversold and price position.
  const rsiProxy: number[] = closes.map((_, i) => {
    // Simple linear interpolation: prior RSI estimated from price position
    const priceRange = Math.max(...highs.slice(-WINDOW)) - Math.min(...lows.slice(-WINDOW));
    if (priceRange === 0) return rsi14;
    const pricePos = (closes[i] - Math.min(...lows.slice(-WINDOW))) / priceRange;
    return Math.round((pricePos * 100) * 100) / 100;
  });
  // Override the last value with the actual current RSI
  if (rsiProxy.length > 0) rsiProxy[rsiProxy.length - 1] = rsi14;

  const results: DivergenceResult[] = [];

  // RSI divergence
  const rsiDiv = checkRsiDivergence(closes, highs, lows, rsiProxy, WINDOW, timeframe);
  if (rsiDiv.type !== 'none') results.push(rsiDiv);

  // MACD divergence
  const macdDiv = checkMacdDivergence(closes, highs, lows, indicators.macd.histogram, WINDOW, timeframe);
  if (macdDiv.type !== 'none') results.push(macdDiv);

  // Stochastic divergence
  const stochDiv = checkStochasticDivergence(closes, highs, lows, indicators.stochastic.k, WINDOW, timeframe);
  if (stochDiv.type !== 'none') results.push(stochDiv);

  return results;
}
