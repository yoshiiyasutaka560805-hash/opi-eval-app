import { COTData } from '@/types';
import { getCache, setCache } from '@/lib/cache';

const COT_URL   = 'https://publicreporting.cftc.gov/resource/jun7-fc8e.json';
const GOLD_CODE = '088691'; // GOLD - COMMODITY EXCHANGE INC.

const CACHE_TTL_6H = 6 * 60 * 60 * 1000;

function getDemoCOTData(): COTData {
  return {
    reportDate: new Date().toISOString(),
    commercial: {
      long:  120000,
      short: 200000,
      net:   -80000,
    },
    nonCommercial: {
      long:  285000,
      short: 100000,
      net:   185000,
    },
    netPositionChange:    12500,
    netPositionPercentile: 62,
    commercialPercentile:  35,
    commercialExtreme: {
      isExtremeShort: false,
      isExtremeLong:  false,
    },
    conflictSignal:            true,
    sentiment:                'Moderately Bullish',
    commercialSentiment:      'Moderately Bearish (Hedging)',
    nonCommercialSentiment:   'Moderately Bullish',
  };
}

function calculatePercentile(value: number, series: number[]): number {
  if (series.length === 0) return 50;
  const below = series.filter((v) => v < value).length;
  return Math.round((below / series.length) * 100);
}

function deriveSentiment(net: number, percentile: number): string {
  if (percentile >= 80) return net > 0 ? 'Extremely Bullish' : 'Extremely Bearish';
  if (percentile >= 60) return net > 0 ? 'Moderately Bullish' : 'Moderately Bearish';
  if (percentile <= 20) return net > 0 ? 'Mildly Bullish' : 'Mildly Bearish';
  return 'Neutral';
}

function deriveCommercialSentiment(net: number, percentile: number): string {
  const base = net > 0 ? 'Net Long (Unusual — potential floor)' : 'Moderately Bearish (Hedging)';
  if (percentile >= 80) return `Extreme Short ${base}`;
  if (percentile <= 20) return `Extreme Long ${base}`;
  return base;
}

export async function fetchCOTData(): Promise<COTData> {
  const cacheKey = 'cot_gold';
  const cached = getCache<COTData>(cacheKey);
  if (cached) return cached;

  try {
    const url =
      `${COT_URL}?cftc_commodity_code=${GOLD_CODE}` +
      `&$limit=52&$order=report_date_as_yyyy_mm_dd+DESC`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const rows: Array<Record<string, string>> = await res.json();
    if (!Array.isArray(rows) || rows.length === 0) throw new Error('No COT data returned');

    const latest   = rows[0];
    const previous = rows[1] ?? rows[0];

    const commLong    = parseInt(latest['comm_positions_long_all']    ?? '0', 10);
    const commShort   = parseInt(latest['comm_positions_short_all']   ?? '0', 10);
    const ncLong      = parseInt(latest['noncomm_positions_long_all'] ?? '0', 10);
    const ncShort     = parseInt(latest['noncomm_positions_short_all']?? '0', 10);

    const commNet     = commLong  - commShort;
    const ncNet       = ncLong    - ncShort;

    const prevNcNet   =
      parseInt(previous['noncomm_positions_long_all']  ?? '0', 10) -
      parseInt(previous['noncomm_positions_short_all'] ?? '0', 10);

    const netPositionChange = ncNet - prevNcNet;

    // Build historical net series for percentile calculation
    const ncNetSeries: number[] = rows.map(
      (r) =>
        parseInt(r['noncomm_positions_long_all']  ?? '0', 10) -
        parseInt(r['noncomm_positions_short_all'] ?? '0', 10)
    );
    const commNetSeries: number[] = rows.map(
      (r) =>
        parseInt(r['comm_positions_long_all']  ?? '0', 10) -
        parseInt(r['comm_positions_short_all'] ?? '0', 10)
    );

    const netPositionPercentile  = calculatePercentile(ncNet,   ncNetSeries);
    const commercialPercentile   = calculatePercentile(commNet, commNetSeries);

    const isExtremeShort = commercialPercentile > 80;
    const isExtremeLong  = commercialPercentile < 20;

    // Conflict: commercial and nonCommercial nets have opposite signs
    const conflictSignal =
      (commNet > 0 && ncNet < 0) || (commNet < 0 && ncNet > 0);

    const reportDate =
      latest['report_date_as_yyyy_mm_dd']
        ? new Date(latest['report_date_as_yyyy_mm_dd']).toISOString()
        : new Date().toISOString();

    const result: COTData = {
      reportDate,
      commercial: {
        long:  commLong,
        short: commShort,
        net:   commNet,
      },
      nonCommercial: {
        long:  ncLong,
        short: ncShort,
        net:   ncNet,
      },
      netPositionChange,
      netPositionPercentile,
      commercialPercentile,
      commercialExtreme: { isExtremeShort, isExtremeLong },
      conflictSignal,
      sentiment:               deriveSentiment(ncNet, netPositionPercentile),
      commercialSentiment:     deriveCommercialSentiment(commNet, commercialPercentile),
      nonCommercialSentiment:  deriveSentiment(ncNet, netPositionPercentile),
    };

    setCache(cacheKey, result, CACHE_TTL_6H);
    return result;
  } catch {
    const demo = getDemoCOTData();
    setCache(cacheKey, demo, CACHE_TTL_6H);
    return demo;
  }
}
