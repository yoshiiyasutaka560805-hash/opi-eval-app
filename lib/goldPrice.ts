import { OHLCV, GoldPriceResponse, Timeframe } from '@/types';
import { getCache, setCache, recordApiCalls } from '@/lib/cache';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';

// Cache TTLs in milliseconds
const CACHE_TTL = {
  '5min':     5 * 60 * 1000,
  '15min':   10 * 60 * 1000,
  '30min':   15 * 60 * 1000,
  '1h':      15 * 60 * 1000,
  '4h':      30 * 60 * 1000,
  'daily':   30 * 60 * 1000,
  'realtime': 60 * 1000,
};

export function generateDemoOHLCV(
  basePrice: number,
  count: number,
  intervalMinutes: number
): OHLCV[] {
  const candles: OHLCV[] = [];
  const now = new Date();
  let price = basePrice;

  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);

    // Sine wave with period of 48 candles + random noise
    const sineComponent = Math.sin((i / 48) * 2 * Math.PI) * basePrice * 0.015;
    const noise = (Math.random() - 0.5) * basePrice * 0.008;
    price = Math.max(basePrice * 0.97, Math.min(basePrice * 1.03, basePrice + sineComponent + noise));

    const volatility = basePrice * 0.003;
    const open = Math.round((price + (Math.random() - 0.5) * volatility) * 100) / 100;
    const close = Math.round((price + (Math.random() - 0.5) * volatility) * 100) / 100;
    const high = Math.round((Math.max(open, close) + Math.random() * volatility) * 100) / 100;
    const low = Math.round((Math.min(open, close) - Math.random() * volatility) * 100) / 100;

    candles.push({
      date: date.toISOString(),
      open,
      high,
      low,
      close,
    });
  }

  return candles;
}

export async function fetchRealtimePrice(): Promise<{ price: number; previousClose: number }> {
  if (!API_KEY) {
    return { price: 2345.67, previousClose: 2338.20 };
  }

  const cacheKey = 'realtime_gold';
  const cached = getCache<{ price: number; previousClose: number }>(cacheKey);
  if (cached) return cached;

  try {
    const url = `${BASE_URL}?function=CURRENCY_EXCHANGE_RATE&from_currency=XAU&to_currency=USD&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data['Note']) throw new Error(`APIレート制限: 1日25回の上限に達しました`);
    if (data['Information']) throw new Error(`APIプレミアム必要: ${data['Information'].slice(0, 80)}`);
    if (data['Error Message']) throw new Error(`APIエラー: ${data['Error Message'].slice(0, 80)}`);

    const rate = data['Realtime Currency Exchange Rate'];
    if (!rate) throw new Error('No exchange rate data');

    const price = Math.round(parseFloat(rate['5. Exchange Rate']) * 100) / 100;
    // Alpha Vantage CURRENCY_EXCHANGE_RATE doesn't return previous close directly;
    // approximate it with a small fixed offset as a fallback
    const previousClose = Math.round((price * 0.997) * 100) / 100;

    recordApiCalls(1);
    const result = { price, previousClose };
    setCache(cacheKey, result, CACHE_TTL['realtime']);
    return result;
  } catch {
    return { price: 2345.67, previousClose: 2338.20 };
  }
}

export async function fetchIntradayCandles(
  interval: '5min' | '15min' | '30min' | '60min'
): Promise<OHLCV[]> {
  const timeframeKey = interval === '60min' ? '1h' : interval as Timeframe;
  const cacheKey = `intraday_${interval}`;
  const cached = getCache<OHLCV[]>(cacheKey);
  if (cached) return cached;

  if (!API_KEY) {
    const intervalMinutes = interval === '60min' ? 60 : parseInt(interval);
    const demo = generateDemoOHLCV(2345.67, 200, intervalMinutes);
    setCache(cacheKey, demo, CACHE_TTL[timeframeKey]);
    return demo;
  }

  try {
    const url =
      `${BASE_URL}?function=FX_INTRADAY&from_symbol=XAU&to_symbol=USD` +
      `&interval=${interval}&outputsize=full&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data['Note']) throw new Error(`APIレート制限: 1日25回の上限に達しました`);
    if (data['Information']) throw new Error(`APIプレミアム必要`);
    if (data['Error Message']) throw new Error(`APIエラー: ${data['Error Message'].slice(0, 80)}`);

    const seriesKey = `Time Series FX (${interval})`;
    const series = data[seriesKey];
    if (!series) throw new Error('No time series data (seriesKey not found in response)');

    const candles: OHLCV[] = Object.entries(series)
      .map(([dateStr, values]) => {
        const v = values as Record<string, string>;
        return {
          date: new Date(dateStr).toISOString(),
          open:  Math.round(parseFloat(v['1. open'])  * 100) / 100,
          high:  Math.round(parseFloat(v['2. high'])  * 100) / 100,
          low:   Math.round(parseFloat(v['3. low'])   * 100) / 100,
          close: Math.round(parseFloat(v['4. close']) * 100) / 100,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-200);

    recordApiCalls(1);
    setCache(cacheKey, candles, CACHE_TTL[timeframeKey]);
    return candles;
  } catch {
    const intervalMinutes = interval === '60min' ? 60 : parseInt(interval);
    const demo = generateDemoOHLCV(2345.67, 200, intervalMinutes);
    setCache(cacheKey, demo, CACHE_TTL[timeframeKey]);
    return demo;
  }
}

export async function fetchDailyCandles(): Promise<OHLCV[]> {
  const cacheKey = 'daily_gold';
  const cached = getCache<OHLCV[]>(cacheKey);
  if (cached) return cached;

  if (!API_KEY) {
    const demo = generateDemoOHLCV(2345.67, 200, 1440);
    setCache(cacheKey, demo, CACHE_TTL['daily']);
    return demo;
  }

  try {
    const url =
      `${BASE_URL}?function=FX_DAILY&from_symbol=XAU&to_symbol=USD&outputsize=full&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data['Note']) throw new Error(`APIレート制限: 1日25回の上限に達しました`);
    if (data['Information']) throw new Error(`APIプレミアム必要`);
    if (data['Error Message']) throw new Error(`APIエラー: ${data['Error Message'].slice(0, 80)}`);

    const series = data['Time Series FX (Daily)'];
    if (!series) throw new Error('No daily time series data');

    const candles: OHLCV[] = Object.entries(series)
      .map(([dateStr, values]) => {
        const v = values as Record<string, string>;
        return {
          date: new Date(dateStr).toISOString(),
          open:  Math.round(parseFloat(v['1. open'])  * 100) / 100,
          high:  Math.round(parseFloat(v['2. high'])  * 100) / 100,
          low:   Math.round(parseFloat(v['3. low'])   * 100) / 100,
          close: Math.round(parseFloat(v['4. close']) * 100) / 100,
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-200);

    recordApiCalls(1);
    setCache(cacheKey, candles, CACHE_TTL['daily']);
    return candles;
  } catch {
    const demo = generateDemoOHLCV(2345.67, 200, 1440);
    setCache(cacheKey, demo, CACHE_TTL['daily']);
    return demo;
  }
}

export function aggregateTo4H(hourlyCandles: OHLCV[]): OHLCV[] {
  const result: OHLCV[] = [];
  for (let i = 0; i + 3 < hourlyCandles.length; i += 4) {
    const group = hourlyCandles.slice(i, i + 4);
    result.push({
      date:  group[0].date,
      open:  group[0].open,
      high:  Math.round(Math.max(...group.map(c => c.high)) * 100) / 100,
      low:   Math.round(Math.min(...group.map(c => c.low))  * 100) / 100,
      close: group[3].close,
    });
  }
  return result;
}

export async function fetchAllTimeframes(): Promise<GoldPriceResponse> {
  const cacheKey = 'all_timeframes';
  const cached = getCache<GoldPriceResponse>(cacheKey);
  if (cached) return cached;

  if (!API_KEY) {
    throw new Error('ALPHA_VANTAGE_API_KEY が設定されていません。Vercel環境変数を確認してください。');
  }

  try {
    const { price, previousClose } = await fetchRealtimePrice();

    const [tf5min, tf15min, tf30min, tf1h, tfDaily] = await Promise.all([
      fetchIntradayCandles('5min'),
      fetchIntradayCandles('15min'),
      fetchIntradayCandles('30min'),
      fetchIntradayCandles('60min'),
      fetchDailyCandles(),
    ]);
    const tf4h = aggregateTo4H(tf1h);

    const change    = Math.round((price - previousClose) * 100) / 100;
    const changePct = Math.round((change / previousClose) * 10000) / 100;

    const response: GoldPriceResponse = {
      currentPrice:  price,
      previousClose,
      change,
      changePct,
      timeframes: {
        '5min':  tf5min,
        '15min': tf15min,
        '30min': tf30min,
        '1h':    tf1h,
        '4h':    tf4h,
        'daily': tfDaily,
      },
      lastUpdated: new Date().toISOString(),
      isDemo: false,
    };

    setCache(cacheKey, response, CACHE_TTL['5min']);
    return response;
  } catch {
    // Full fallback: generate all demo data
    const price         = 2345.67;
    const previousClose = 2338.20;
    const tf1h          = generateDemoOHLCV(price, 800, 60);

    const response: GoldPriceResponse = {
      currentPrice:  price,
      previousClose,
      change:     Math.round((price - previousClose) * 100) / 100,
      changePct:  Math.round(((price - previousClose) / previousClose) * 10000) / 100,
      timeframes: {
        '5min':  generateDemoOHLCV(price, 200, 5),
        '15min': generateDemoOHLCV(price, 200, 15),
        '30min': generateDemoOHLCV(price, 200, 30),
        '1h':    generateDemoOHLCV(price, 200, 60),
        '4h':    aggregateTo4H(tf1h),
        'daily': generateDemoOHLCV(price, 200, 1440),
      },
      lastUpdated: new Date().toISOString(),
      isDemo: true,
    };

    setCache(cacheKey, response, CACHE_TTL['5min']);
    return response;
  }
}
