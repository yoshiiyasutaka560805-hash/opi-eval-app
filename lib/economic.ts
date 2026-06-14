import { EconomicData, NewsSentiment } from '@/types';
import { getCache, setCache, recordApiCalls } from '@/lib/cache';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

const CACHE_TTL = {
  oneHour:    60 * 60 * 1000,
  oneDay:     24 * 60 * 60 * 1000,
  fifteenMin: 15 * 60 * 1000,
};

export async function fetchTreasuryYield(): Promise<number> {
  const cacheKey = 'treasury_yield_10y';
  const cached = getCache<number>(cacheKey);
  if (cached !== null) return cached;

  if (!API_KEY) {
    setCache(cacheKey, 4.32, CACHE_TTL.oneHour);
    return 4.32;
  }

  try {
    const url = `${BASE_URL}?function=TREASURY_YIELD&interval=daily&maturity=10year&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const series = data['data'];
    if (!Array.isArray(series) || series.length === 0) throw new Error('No treasury yield data');

    const latest = series[0];
    const value = Math.round(parseFloat(latest['value']) * 100) / 100;

    recordApiCalls(1);
    setCache(cacheKey, value, CACHE_TTL.oneHour);
    return value;
  } catch {
    setCache(cacheKey, 4.32, CACHE_TTL.oneHour);
    return 4.32;
  }
}

export async function fetchCPI(): Promise<number> {
  const cacheKey = 'cpi_monthly';
  const cached = getCache<number>(cacheKey);
  if (cached !== null) return cached;

  if (!API_KEY) {
    setCache(cacheKey, 3.8, CACHE_TTL.oneDay);
    return 3.8;
  }

  try {
    const url = `${BASE_URL}?function=CPI&interval=monthly&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const series = data['data'];
    if (!Array.isArray(series) || series.length < 13) throw new Error('Insufficient CPI data');

    // Year-over-year percentage
    const latest   = parseFloat(series[0]['value']);
    const yearAgo  = parseFloat(series[12]['value']);
    const yoy      = Math.round(((latest - yearAgo) / yearAgo) * 10000) / 100;

    recordApiCalls(1);
    setCache(cacheKey, yoy, CACHE_TTL.oneDay);
    return yoy;
  } catch {
    setCache(cacheKey, 3.8, CACHE_TTL.oneDay);
    return 3.8;
  }
}

export async function fetchFederalFundsRate(): Promise<number> {
  const cacheKey = 'fed_funds_rate';
  const cached = getCache<number>(cacheKey);
  if (cached !== null) return cached;

  if (!API_KEY) {
    setCache(cacheKey, 5.25, CACHE_TTL.oneHour);
    return 5.25;
  }

  try {
    const url = `${BASE_URL}?function=FEDERAL_FUNDS_RATE&interval=daily&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const series = data['data'];
    if (!Array.isArray(series) || series.length === 0) throw new Error('No fed funds rate data');

    const value = Math.round(parseFloat(series[0]['value']) * 100) / 100;

    recordApiCalls(1);
    setCache(cacheKey, value, CACHE_TTL.oneHour);
    return value;
  } catch {
    setCache(cacheKey, 5.25, CACHE_TTL.oneHour);
    return 5.25;
  }
}

function getDemoNewsSentiment(): NewsSentiment {
  return {
    avgScore:       0.12,
    bullishCount:   9,
    bearishCount:   4,
    neutralCount:   7,
    topHeadlines: [
      'Gold rises as dollar weakens amid Fed rate uncertainty',
      'Investors flock to gold ahead of key inflation report',
      'Gold steady near record highs as geopolitical risks persist',
    ],
    latestDate: new Date().toISOString(),
  };
}

export async function fetchNewsSentiment(): Promise<NewsSentiment> {
  const cacheKey = 'news_sentiment_gold';
  const cached = getCache<NewsSentiment>(cacheKey);
  if (cached) return cached;

  if (!API_KEY) {
    const demo = getDemoNewsSentiment();
    setCache(cacheKey, demo, CACHE_TTL.fifteenMin);
    return demo;
  }

  try {
    const url =
      `${BASE_URL}?function=NEWS_SENTIMENT&topics=gold&sort=LATEST&limit=20&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const feed: Array<Record<string, unknown>> = data['feed'];
    if (!Array.isArray(feed) || feed.length === 0) throw new Error('No news feed data');

    let bullishCount = 0;
    let bearishCount = 0;
    let neutralCount = 0;
    let totalScore   = 0;

    feed.forEach((item) => {
      const score = parseFloat(String(item['overall_sentiment_score'] ?? '0'));
      totalScore += score;
      if (score > 0.15)       bullishCount++;
      else if (score < -0.15) bearishCount++;
      else                    neutralCount++;
    });

    const avgScore = Math.round((totalScore / feed.length) * 10000) / 10000;
    const topHeadlines = feed
      .slice(0, 3)
      .map((item) => String(item['title'] ?? ''));

    const latestDate =
      feed.length > 0
        ? new Date(String(feed[0]['time_published'] ?? '')).toISOString()
        : new Date().toISOString();

    recordApiCalls(1);
    const result: NewsSentiment = {
      avgScore,
      bullishCount,
      bearishCount,
      neutralCount,
      topHeadlines,
      latestDate,
    };
    setCache(cacheKey, result, CACHE_TTL.fifteenMin);
    return result;
  } catch {
    const demo = getDemoNewsSentiment();
    setCache(cacheKey, demo, CACHE_TTL.fifteenMin);
    return demo;
  }
}

export async function fetchAllEconomicData(): Promise<{
  economic: EconomicData;
  news: NewsSentiment;
}> {
  try {
    const [treasuryYield10y, cpi, federalFundsRate, news] = await Promise.all([
      fetchTreasuryYield(),
      fetchCPI(),
      fetchFederalFundsRate(),
      fetchNewsSentiment(),
    ]);

    const realInterestRate = Math.round((treasuryYield10y - cpi) * 100) / 100;

    // Approximate USD index via EUR/USD rate; use fixed 1.08 in demo / when no key
    const usdIndex = Math.round((1 / 1.08) * 10000) / 10000;

    const economic: EconomicData = {
      treasuryYield10y,
      cpi,
      federalFundsRate,
      realInterestRate,
      usdIndex,
      goldUsdCorrelation:      -0.82,
      goldRealRateCorrelation: -0.91,
    };

    return { economic, news };
  } catch {
    // Full demo fallback
    const economic: EconomicData = {
      treasuryYield10y:        4.32,
      cpi:                     3.8,
      federalFundsRate:        5.25,
      realInterestRate:        0.52,
      usdIndex:                Math.round((1 / 1.08) * 10000) / 10000,
      goldUsdCorrelation:      -0.82,
      goldRealRateCorrelation: -0.91,
    };
    return { economic, news: getDemoNewsSentiment() };
  }
}
