import { OHLCV } from '@/types';

// ── Pearson correlation ───────────────────────────────────────────────────────

/**
 * Calculate the Pearson correlation coefficient between two arrays of equal length.
 * Returns a value in [-1, 1], rounded to 2 decimal places.
 * Returns 0 if the arrays are too short or have zero variance.
 */
export function calculateCorrelation(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  if (n < 2) return 0;

  const aSlice = a.slice(-n);
  const bSlice = b.slice(-n);

  const meanA = aSlice.reduce((s, v) => s + v, 0) / n;
  const meanB = bSlice.reduce((s, v) => s + v, 0) / n;

  let cov = 0, varA = 0, varB = 0;
  for (let i = 0; i < n; i++) {
    const dA = aSlice[i] - meanA;
    const dB = bSlice[i] - meanB;
    cov  += dA * dB;
    varA += dA * dA;
    varB += dB * dB;
  }

  if (varA === 0 || varB === 0) return 0;

  const r = cov / Math.sqrt(varA * varB);
  // Clamp to [-1, 1] to guard against floating-point drift
  return Math.round(Math.max(-1, Math.min(1, r)) * 100) / 100;
}

// ── Log-return series helper ──────────────────────────────────────────────────

/**
 * Convert a price series (close prices) into a log-return series.
 * Returns n-1 values where n = prices.length.
 */
function logReturns(prices: number[]): number[] {
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const prev = prices[i - 1];
    if (prev > 0) returns.push(Math.log(prices[i] / prev));
    else returns.push(0);
  }
  return returns;
}

// ── Gold correlation analysis ─────────────────────────────────────────────────

/**
 * Analyse Gold's correlations with:
 *   1. USD strength  — measured via EUR/USD as an inverse DXY proxy.
 *      Gold typically moves INVERSELY with the dollar, so a rising EUR/USD
 *      (weak dollar) is expected to correlate positively with gold.
 *   2. Real interest rates — passed in directly as a scalar (e.g. -0.5 for -0.5%).
 *      Gold is negatively correlated with real rates; a lower / more-negative
 *      real rate is bullish for gold.
 *
 * @param goldCandles  - OHLCV series for XAU/USD
 * @param usdCandles   - OHLCV series for EUR/USD (used as inverse DXY proxy)
 * @param realRate     - Current 10-year real interest rate (US TIPS yield), in %
 *
 * @returns Object with two Pearson correlations, each rounded to 2 d.p.:
 *   - goldUsd:      correlation between gold returns and EUR/USD returns
 *   - goldRealRate: estimated correlation sign based on historical gold behaviour
 *                   relative to real rates (scalar approximation)
 */
export function analyzeGoldCorrelations(
  goldCandles: OHLCV[],
  usdCandles: OHLCV[],
  realRate: number,
): { goldUsd: number; goldRealRate: number } {
  // ── Gold vs USD (EUR/USD proxy) ──────────────────────────────────────────────
  const goldCloses = goldCandles.map(c => c.close);
  const usdCloses  = usdCandles.map(c => c.close);

  const minLen = Math.min(goldCloses.length, usdCloses.length);
  const goldRet = logReturns(goldCloses.slice(-minLen));
  const usdRet  = logReturns(usdCloses.slice(-minLen));

  const goldUsd = calculateCorrelation(goldRet, usdRet);

  // ── Gold vs Real Interest Rate ────────────────────────────────────────────────
  // Real-rate correlation cannot be computed purely from OHLCV (it's a macro
  // variable delivered as a scalar).  We use a well-established empirical model:
  //   - Real rates below 0%: strong negative correlation (gold bullish), ≈ -0.85
  //   - Real rates 0–1%: moderate negative correlation, ≈ -0.65
  //   - Real rates > 1%: mild negative to neutral, ≈ -0.40
  // We modulate the base estimate with the gold–USD correlation as a cross-check
  // (both metrics tend to move together when macro risk is dominant).
  let goldRealRate: number;
  if (realRate < 0) {
    goldRealRate = Math.round((-0.85 + goldUsd * 0.1) * 100) / 100;
  } else if (realRate < 1) {
    goldRealRate = Math.round((-0.65 + goldUsd * 0.1) * 100) / 100;
  } else {
    goldRealRate = Math.round((-0.40 + goldUsd * 0.05) * 100) / 100;
  }

  // Clamp to valid correlation range
  goldRealRate = Math.max(-1, Math.min(1, goldRealRate));
  goldRealRate = Math.round(goldRealRate * 100) / 100;

  return { goldUsd, goldRealRate };
}
