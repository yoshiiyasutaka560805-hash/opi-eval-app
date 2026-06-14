import { OHLCV, TechnicalIndicators, TimeframeAnalysis, Direction, SessionInfo, Timeframe } from '@/types';
import { calculateAllIndicators } from '@/lib/technical';
import { detectRegime } from '@/lib/regime';

// MTF weights — relative importance of each timeframe before session multiplier
const TF_WEIGHTS: Record<Timeframe, number> = {
  daily:  3,
  '4h':   2,
  '1h':   2,
  '30min': 1,
  '15min': 1,
  '5min':  1,
};

/**
 * Determine directional bias for a single timeframe based on its indicators.
 * Returns 'up', 'down', or 'flat'.
 */
function determineTFDirection(indicators: TechnicalIndicators): Direction {
  const { bullishSignals, bearishSignals } = indicators;
  const total = bullishSignals + bearishSignals;
  if (total === 0) return 'flat';

  const bullRatio = bullishSignals / total;

  if (bullRatio >= 0.6) return 'up';
  if (bullRatio <= 0.4) return 'down';
  return 'flat';
}

/**
 * Calculate weighted MTF alignment score and overall direction.
 *
 * Score range: -10 to +10
 *   +10 = all timeframes fully bullish (weighted max)
 *   -10 = all timeframes fully bearish
 *
 * Each timeframe contributes its raw weight × session multiplier, scaled
 * proportionally so that the sum of positive weights yields +10 and the
 * sum of negative weights yields -10.
 *
 * @param candles     - OHLCV candles for each timeframe
 * @param sessionInfo - Current session with weight multiplier
 */
export function analyzeMultiTimeframe(
  candles: Record<Timeframe, OHLCV[]>,
  sessionInfo: SessionInfo,
): { analyses: TimeframeAnalysis[]; totalScore: number; direction: Direction } {
  const timeframes = Object.keys(TF_WEIGHTS) as Timeframe[];

  // Calculate raw weighted contributions
  const analyses: TimeframeAnalysis[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const tf of timeframes) {
    const tfCandles = candles[tf];
    if (!tfCandles || tfCandles.length === 0) continue;

    const indicators = calculateAllIndicators(tfCandles);
    const direction  = determineTFDirection(indicators);
    const regime     = detectRegime(indicators);
    const baseWeight = TF_WEIGHTS[tf];

    // Apply session weight multiplier
    const effectiveWeight = baseWeight * sessionInfo.weight;

    // Direction score: +1 for up, -1 for down, 0 for flat
    const dirScore = direction === 'up' ? 1 : direction === 'down' ? -1 : 0;

    // Weighted score contribution for this timeframe
    const contribution = dirScore * effectiveWeight;

    weightedSum  += contribution;
    totalWeight  += effectiveWeight;

    analyses.push({
      timeframe:  tf,
      candles:    tfCandles,
      indicators,
      direction,
      weight:     Math.round(effectiveWeight * 100) / 100,
      score:      Math.round(contribution * 100) / 100,
      regime,
    });
  }

  // Normalise to [-10, +10]
  const maxPossibleScore = totalWeight; // when all timeframes = up
  const totalScore = maxPossibleScore > 0
    ? Math.round((weightedSum / maxPossibleScore) * 10 * 100) / 100
    : 0;

  // Clamp to [-10, +10]
  const clampedScore = Math.max(-10, Math.min(10, totalScore));

  let direction: Direction;
  if (clampedScore > 2) direction = 'up';
  else if (clampedScore < -2) direction = 'down';
  else direction = 'flat';

  return {
    analyses,
    totalScore: clampedScore,
    direction,
  };
}
