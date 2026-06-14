import { Seasonality } from '@/types';

// Historical gold seasonality data based on 20+ years of XAU/USD performance patterns.
// avgReturn values represent average monthly percentage returns.
// reliability reflects consistency of the pattern across historical years.
const GOLD_SEASONALITY: Seasonality[] = [
  {
    month: 1,
    avgReturn: 1.8,
    reliability: 'HIGH',
    note: '1月は年初のポートフォリオ再配分や地政学リスクへの注目でゴールドが強い傾向',
    adjustmentFactor: 1.05,
  },
  {
    month: 2,
    avgReturn: 1.2,
    reliability: 'MEDIUM',
    note: '2月はアジア圏の春節需要と安全資産選好でゴールドが上昇する傾向',
    adjustmentFactor: 1.05,
  },
  {
    month: 3,
    avgReturn: -0.5,
    reliability: 'LOW',
    note: '3月は年度末のポジション調整でゴールドが軟調になる傾向',
    adjustmentFactor: 0.995,
  },
  {
    month: 4,
    avgReturn: 0.3,
    reliability: 'LOW',
    note: '4月はやや強含みだが方向感が出にくい月',
    adjustmentFactor: 1.003,
  },
  {
    month: 5,
    avgReturn: -0.8,
    reliability: 'MEDIUM',
    note: '5月は「Sell in May」効果でゴールドを含むリスク資産全般が軟調',
    adjustmentFactor: 0.992,
  },
  {
    month: 6,
    avgReturn: -0.3,
    reliability: 'LOW',
    note: '6月は夏季前の持ち高調整でゴールドが小幅軟調',
    adjustmentFactor: 0.997,
  },
  {
    month: 7,
    avgReturn: 0.5,
    reliability: 'LOW',
    note: '7月は夏季薄商いで値動きは限定的だが若干強含み',
    adjustmentFactor: 1.005,
  },
  {
    month: 8,
    avgReturn: 1.5,
    reliability: 'HIGH',
    note: '8月はインドの結婚・祭礼シーズンの実需と夏季リスク回避でゴールドが強い',
    adjustmentFactor: 1.05,
  },
  {
    month: 9,
    avgReturn: 2.1,
    reliability: 'HIGH',
    note: '9月は年間最強月。インド祭礼需要のピークと秋の安全資産選好が重なる',
    adjustmentFactor: 1.05,
  },
  {
    month: 10,
    avgReturn: 1.7,
    reliability: 'HIGH',
    note: '10月は中国の国慶節明けの宝飾品需要とQ4ポジション構築でゴールド上昇',
    adjustmentFactor: 1.05,
  },
  {
    month: 11,
    avgReturn: 0.8,
    reliability: 'MEDIUM',
    note: '11月は年末商戦前の小康状態。ドル高局面では上値が重くなる',
    adjustmentFactor: 1.005,
  },
  {
    month: 12,
    avgReturn: 0.2,
    reliability: 'LOW',
    note: '12月は年末の利益確定売りと流動性低下でゴールドは方向感を欠く',
    adjustmentFactor: 1.002,
  },
];

export function getCurrentSeasonality(): Seasonality {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // getMonth() returns 0-indexed
  const seasonality = GOLD_SEASONALITY.find(s => s.month === currentMonth);

  // Fallback to neutral seasonality if not found (should never happen)
  if (!seasonality) {
    return {
      month: currentMonth,
      avgReturn: 0,
      reliability: 'LOW',
      note: 'データなし',
      adjustmentFactor: 1.0,
    };
  }

  return seasonality;
}

export function getSeasonalityByMonth(month: number): Seasonality {
  const normalized = ((month - 1 + 12) % 12) + 1;
  const seasonality = GOLD_SEASONALITY.find(s => s.month === normalized);

  if (!seasonality) {
    return {
      month: normalized,
      avgReturn: 0,
      reliability: 'LOW',
      note: 'データなし',
      adjustmentFactor: 1.0,
    };
  }

  return seasonality;
}

export function getAllSeasonality(): Seasonality[] {
  return [...GOLD_SEASONALITY];
}
