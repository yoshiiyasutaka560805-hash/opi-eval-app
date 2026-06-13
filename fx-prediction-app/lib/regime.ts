import { TechnicalIndicators, MarketRegime } from '@/types';

/**
 * Detect market regime using ADX + Bollinger bandwidth + SMA trend direction.
 *
 * Rules (in priority order):
 *   ADX > 25 + SMA5 > SMA21  → trending_bull
 *   ADX > 25 + SMA5 < SMA21  → trending_bear
 *   BB bandwidth > 4 + ADX < 20 → volatile
 *   else                      → ranging
 */
export function detectRegime(indicators: TechnicalIndicators): MarketRegime {
  const { adx14, sma, bollingerBands } = indicators;
  const { ma5, ma21 } = sma;
  const { bandwidth } = bollingerBands;

  if (adx14 > 25) {
    return ma5 > ma21 ? 'trending_bull' : 'trending_bear';
  }

  // Bollinger bandwidth is expressed as a ratio (e.g. 0.04 = 4%)
  // Multiply by 100 if stored as raw fraction, or compare directly if already in %
  // From technical.ts: bandwidth = (upper - lower) / middle — so it's a fraction like 0.02
  // BB bandwidth > 0.04 corresponds to > 4% relative spread
  const bandwidthPct = bandwidth * 100;
  if (bandwidthPct > 4 && adx14 < 20) {
    return 'volatile';
  }

  return 'ranging';
}

/**
 * Return indicator weight multipliers for Claude prompt based on market regime.
 * Higher weight = Claude should pay more attention to that indicator family.
 */
export function getRegimeWeights(regime: MarketRegime): { macd: number; rsi: number; bb: number } {
  switch (regime) {
    case 'trending_bull':
    case 'trending_bear':
      // Trend-following: MACD momentum matters most; RSI matters; BB less so
      return { macd: 1.5, rsi: 1.0, bb: 0.7 };

    case 'volatile':
      // High volatility: BB width very informative; RSI for extremes; MACD whipsaws
      return { macd: 0.7, rsi: 1.2, bb: 1.5 };

    case 'ranging':
      // Mean-reversion: RSI overbought/oversold most reliable; BB band extremes also useful
      return { macd: 0.8, rsi: 1.5, bb: 1.3 };

    default:
      return { macd: 1.0, rsi: 1.0, bb: 1.0 };
  }
}

/**
 * Human-readable regime description in Japanese, incorporating ADX value.
 */
export function describeRegime(regime: MarketRegime, adx: number): string {
  const adxStr = `ADX=${Math.round(adx * 100) / 100}`;

  switch (regime) {
    case 'trending_bull':
      return `上昇トレンド相場（強いトレンド継続中）| ${adxStr} — トレンドフォロー戦略が有効`;

    case 'trending_bear':
      return `下降トレンド相場（強い下落トレンド継続中）| ${adxStr} — トレンドフォロー戦略が有効`;

    case 'volatile':
      return `高ボラティリティ相場（方向感なく価格変動が大きい）| ${adxStr} — ブレイクアウト戦略に注意、損切り幅を広めに`;

    case 'ranging':
      return `レンジ相場（方向感なし、均衡状態）| ${adxStr} — 平均回帰戦略が有効、サポート/レジスタンス重視`;

    default:
      return `不明なレジーム | ${adxStr}`;
  }
}
