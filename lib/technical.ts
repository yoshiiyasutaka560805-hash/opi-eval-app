import { OHLCV, TechnicalIndicators, MA } from '@/types';

export function calculateSMA(candles: OHLCV[], period: number): number {
  if (candles.length < period) return 0;
  const slice = candles.slice(-period);
  const sum = slice.reduce((acc, c) => acc + c.close, 0);
  return sum / period;
}

export function calculateEMA(candles: OHLCV[], period: number): number {
  if (candles.length < period) return 0;
  const k = 2 / (period + 1);
  // Seed with SMA of first `period` closes
  let ema = candles.slice(0, period).reduce((acc, c) => acc + c.close, 0) / period;
  for (let i = period; i < candles.length; i++) {
    ema = candles[i].close * k + ema * (1 - k);
  }
  return ema;
}

function calculateEMAFromValues(values: number[], period: number): number {
  if (values.length < period) return 0;
  const k = 2 / (period + 1);
  let ema = values.slice(0, period).reduce((a, v) => a + v, 0) / period;
  for (let i = period; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k);
  }
  return ema;
}

export function calculateRSI(candles: OHLCV[], period: number): number {
  if (candles.length < period + 1) return 50;
  const closes = candles.map(c => c.close);
  let gains = 0;
  let losses = 0;

  // Initial average gain/loss over first `period` changes
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Smoothed RS for remaining candles
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff >= 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

export function calculateMACD(candles: OHLCV[]): { line: number; signal: number; histogram: number } {
  if (candles.length < 35) return { line: 0, signal: 0, histogram: 0 };

  // Build full EMA-12 and EMA-26 series to get MACD line series for signal EMA-9
  const closes = candles.map(c => c.close);

  const k12 = 2 / (12 + 1);
  const k26 = 2 / (26 + 1);

  let ema12 = closes.slice(0, 12).reduce((a, v) => a + v, 0) / 12;
  let ema26 = closes.slice(0, 26).reduce((a, v) => a + v, 0) / 26;

  // Advance ema12 to index 25 to be aligned with ema26 start
  for (let i = 12; i < 26; i++) {
    ema12 = closes[i] * k12 + ema12 * (1 - k12);
  }

  const macdValues: number[] = [];
  macdValues.push(ema12 - ema26);

  for (let i = 26; i < closes.length; i++) {
    ema12 = closes[i] * k12 + ema12 * (1 - k12);
    ema26 = closes[i] * k26 + ema26 * (1 - k26);
    macdValues.push(ema12 - ema26);
  }

  const macdLine = macdValues[macdValues.length - 1];
  const signalLine = calculateEMAFromValues(macdValues, 9);
  const histogram = macdLine - signalLine;

  return { line: macdLine, signal: signalLine, histogram };
}

export function calculateStochastic(
  candles: OHLCV[],
  kPeriod: number = 14,
  dPeriod: number = 3,
  smooth: number = 3
): { k: number; d: number } {
  if (candles.length < kPeriod + dPeriod) return { k: 50, d: 50 };

  // Calculate raw %K values
  const rawKValues: number[] = [];
  for (let i = kPeriod - 1; i < candles.length; i++) {
    const slice = candles.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...slice.map(c => c.high));
    const lowestLow = Math.min(...slice.map(c => c.low));
    const range = highestHigh - lowestLow;
    rawKValues.push(range === 0 ? 50 : ((candles[i].close - lowestLow) / range) * 100);
  }

  // Smooth %K with SMA of `smooth` periods (fast stochastic → slow stochastic)
  const smoothedK: number[] = [];
  for (let i = smooth - 1; i < rawKValues.length; i++) {
    const slice = rawKValues.slice(i - smooth + 1, i + 1);
    smoothedK.push(slice.reduce((a, v) => a + v, 0) / smooth);
  }

  const kValue = smoothedK[smoothedK.length - 1] ?? 50;

  // %D is SMA of smoothed %K over dPeriod
  if (smoothedK.length < dPeriod) return { k: kValue, d: kValue };
  const dSlice = smoothedK.slice(-dPeriod);
  const dValue = dSlice.reduce((a, v) => a + v, 0) / dPeriod;

  return { k: kValue, d: dValue };
}

export function calculateWilliamsR(candles: OHLCV[], period: number = 14): number {
  if (candles.length < period) return -50;
  const slice = candles.slice(-period);
  const highestHigh = Math.max(...slice.map(c => c.high));
  const lowestLow = Math.min(...slice.map(c => c.low));
  const close = candles[candles.length - 1].close;
  const range = highestHigh - lowestLow;
  if (range === 0) return -50;
  return ((highestHigh - close) / range) * -100;
}

export function calculateCCI(candles: OHLCV[], period: number = 20): number {
  if (candles.length < period) return 0;
  const slice = candles.slice(-period);
  const typicalPrices = slice.map(c => (c.high + c.low + c.close) / 3);
  const meanTP = typicalPrices.reduce((a, v) => a + v, 0) / period;
  const meanDeviation = typicalPrices.reduce((a, v) => a + Math.abs(v - meanTP), 0) / period;
  if (meanDeviation === 0) return 0;
  const latestTP = typicalPrices[typicalPrices.length - 1];
  return (latestTP - meanTP) / (0.015 * meanDeviation);
}

export function calculateROC(candles: OHLCV[], period: number = 10): number {
  if (candles.length < period + 1) return 0;
  const current = candles[candles.length - 1].close;
  const past = candles[candles.length - 1 - period].close;
  if (past === 0) return 0;
  return ((current - past) / past) * 100;
}

export function calculateBollingerBands(
  candles: OHLCV[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number; middle: number; lower: number; bandwidth: number; position: number } {
  if (candles.length < period) {
    const price = candles[candles.length - 1]?.close ?? 0;
    return { upper: price, middle: price, lower: price, bandwidth: 0, position: 0.5 };
  }
  const slice = candles.slice(-period);
  const closes = slice.map(c => c.close);
  const middle = closes.reduce((a, v) => a + v, 0) / period;
  const variance = closes.reduce((a, v) => a + Math.pow(v - middle, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  const upper = middle + stdDevMultiplier * stdDev;
  const lower = middle - stdDevMultiplier * stdDev;
  const bandwidth = middle > 0 ? (upper - lower) / middle : 0;
  const currentClose = candles[candles.length - 1].close;
  const range = upper - lower;
  const position = range > 0 ? (currentClose - lower) / range : 0.5;
  return { upper, middle, lower, bandwidth, position };
}

export function calculateATR(candles: OHLCV[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trValues: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trValues.push(tr);
  }
  if (trValues.length < period) {
    return trValues.reduce((a, v) => a + v, 0) / trValues.length;
  }
  // Wilder smoothing
  let atr = trValues.slice(0, period).reduce((a, v) => a + v, 0) / period;
  for (let i = period; i < trValues.length; i++) {
    atr = (atr * (period - 1) + trValues[i]) / period;
  }
  return atr;
}

export function calculateADX(candles: OHLCV[], period: number = 14): number {
  if (candles.length < period * 2) return 0;

  const trValues: number[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevHigh = candles[i - 1].high;
    const prevLow = candles[i - 1].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trValues.push(tr);

    const upMove = high - prevHigh;
    const downMove = prevLow - low;

    plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
    minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
  }

  // Wilder smooth TR, +DM, -DM
  let smoothTR = trValues.slice(0, period).reduce((a, v) => a + v, 0);
  let smoothPlusDM = plusDM.slice(0, period).reduce((a, v) => a + v, 0);
  let smoothMinusDM = minusDM.slice(0, period).reduce((a, v) => a + v, 0);

  const dxValues: number[] = [];

  const firstPlusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
  const firstMinusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;
  const firstDISum = firstPlusDI + firstMinusDI;
  dxValues.push(firstDISum > 0 ? (Math.abs(firstPlusDI - firstMinusDI) / firstDISum) * 100 : 0);

  for (let i = period; i < trValues.length; i++) {
    smoothTR = smoothTR - smoothTR / period + trValues[i];
    smoothPlusDM = smoothPlusDM - smoothPlusDM / period + plusDM[i];
    smoothMinusDM = smoothMinusDM - smoothMinusDM / period + minusDM[i];

    const plusDI = smoothTR > 0 ? (smoothPlusDM / smoothTR) * 100 : 0;
    const minusDI = smoothTR > 0 ? (smoothMinusDM / smoothTR) * 100 : 0;
    const diSum = plusDI + minusDI;
    dxValues.push(diSum > 0 ? (Math.abs(plusDI - minusDI) / diSum) * 100 : 0);
  }

  if (dxValues.length < period) {
    return dxValues.reduce((a, v) => a + v, 0) / dxValues.length;
  }

  // ADX = smoothed DX
  let adx = dxValues.slice(0, period).reduce((a, v) => a + v, 0) / period;
  for (let i = period; i < dxValues.length; i++) {
    adx = (adx * (period - 1) + dxValues[i]) / period;
  }
  return adx;
}

export function calculateParabolicSAR(candles: OHLCV[]): { value: number; isUptrend: boolean } {
  if (candles.length < 5) {
    return { value: candles[candles.length - 1]?.close ?? 0, isUptrend: true };
  }

  const afStep = 0.02;
  const afMax = 0.2;

  let isUptrend = candles[1].close > candles[0].close;
  let af = afStep;
  let ep = isUptrend ? candles[0].high : candles[0].low;
  let sar = isUptrend ? candles[0].low : candles[0].high;

  for (let i = 1; i < candles.length; i++) {
    const prevSAR = sar;
    sar = prevSAR + af * (ep - prevSAR);

    if (isUptrend) {
      // SAR cannot be above prior two lows
      sar = Math.min(sar, candles[i - 1].low);
      if (i >= 2) sar = Math.min(sar, candles[i - 2].low);

      if (candles[i].low < sar) {
        isUptrend = false;
        sar = ep;
        ep = candles[i].low;
        af = afStep;
      } else {
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + afStep, afMax);
        }
      }
    } else {
      // SAR cannot be below prior two highs
      sar = Math.max(sar, candles[i - 1].high);
      if (i >= 2) sar = Math.max(sar, candles[i - 2].high);

      if (candles[i].high > sar) {
        isUptrend = true;
        sar = ep;
        ep = candles[i].high;
        af = afStep;
      } else {
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + afStep, afMax);
        }
      }
    }
  }

  return { value: sar, isUptrend };
}

export function calculateIchimoku(candles: OHLCV[]): {
  tenkanSen: number;
  kijunSen: number;
  senkouSpanA: number;
  senkouSpanB: number;
  aboveCloud: boolean;
  chikouSpan: number;
} {
  const highLowMid = (period: number, offset: number = 0): number => {
    const end = candles.length - offset;
    const start = end - period;
    if (start < 0) return candles[candles.length - 1].close;
    const slice = candles.slice(start, end);
    const high = Math.max(...slice.map(c => c.high));
    const low = Math.min(...slice.map(c => c.low));
    return (high + low) / 2;
  };

  const tenkanSen = highLowMid(9);
  const kijunSen = highLowMid(26);
  const senkouSpanA = (tenkanSen + kijunSen) / 2;
  const senkouSpanB = highLowMid(52);

  const currentClose = candles[candles.length - 1].close;
  const aboveCloud = currentClose > Math.max(senkouSpanA, senkouSpanB);

  // Chikou span: current close plotted 26 periods back (compare current close to price 26 bars ago)
  const chikouIndex = candles.length - 1 - 26;
  const chikouSpan = chikouIndex >= 0 ? candles[chikouIndex].close : currentClose;

  return { tenkanSen, kijunSen, senkouSpanA, senkouSpanB, aboveCloud, chikouSpan };
}

function buildSMAHistory(candles: OHLCV[], period: number): number[] {
  const result: number[] = [];
  if (candles.length < period) return result;
  let sum = candles.slice(0, period).reduce((a, c) => a + c.close, 0);
  result.push(sum / period);
  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push(sum / period);
  }
  return result;
}

export function detectCrossovers(
  sma5Series: number[],
  sma21Series: number[],
  sma70Series: number[],
  sma200Series: number[]
): {
  goldenCross: { sma5x21: boolean; sma21x70: boolean; sma70x200: boolean };
  deadCross: { sma5x21: boolean; sma21x70: boolean; sma70x200: boolean };
} {
  const crossedUp = (a: number[], b: number[]): boolean => {
    const len = Math.min(a.length, b.length);
    if (len < 2) return false;
    return a[len - 2] <= b[len - 2] && a[len - 1] > b[len - 1];
  };
  const crossedDown = (a: number[], b: number[]): boolean => {
    const len = Math.min(a.length, b.length);
    if (len < 2) return false;
    return a[len - 2] >= b[len - 2] && a[len - 1] < b[len - 1];
  };

  return {
    goldenCross: {
      sma5x21: crossedUp(sma5Series, sma21Series),
      sma21x70: crossedUp(sma21Series, sma70Series),
      sma70x200: crossedUp(sma70Series, sma200Series),
    },
    deadCross: {
      sma5x21: crossedDown(sma5Series, sma21Series),
      sma21x70: crossedDown(sma21Series, sma70Series),
      sma70x200: crossedDown(sma70Series, sma200Series),
    },
  };
}

export function calculateAllIndicators(candles: OHLCV[]): TechnicalIndicators {
  // Use up to 200 candles for calculation accuracy
  const data = candles.length > 200 ? candles.slice(-200) : candles;

  // SMA values
  const sma5 = calculateSMA(data, 5);
  const sma21 = calculateSMA(data, 21);
  const sma70 = calculateSMA(data, 70);
  const sma200 = calculateSMA(data, 200);

  const sma: MA = { ma5: sma5, ma21: sma21, ma70: sma70, ma200: sma200 };

  // EMA values
  const ema5 = calculateEMA(data, 5);
  const ema21 = calculateEMA(data, 21);
  const ema70 = calculateEMA(data, 70);
  const ema200 = calculateEMA(data, 200);

  const ema: MA = { ma5: ema5, ma21: ema21, ma70: ema70, ma200: ema200 };

  // SMA history series for crossover detection
  const sma5Series = buildSMAHistory(data, 5);
  const sma21Series = buildSMAHistory(data, 21);
  const sma70Series = buildSMAHistory(data, 70);
  const sma200Series = buildSMAHistory(data, 200);

  const { goldenCross, deadCross } = detectCrossovers(sma5Series, sma21Series, sma70Series, sma200Series);

  // MACD
  const macd = calculateMACD(data);

  // Parabolic SAR
  const parabolicSar = calculateParabolicSAR(data);

  // Ichimoku
  const ichimoku = calculateIchimoku(data);

  // RSI
  const rsi7 = calculateRSI(data, 7);
  const rsi14 = calculateRSI(data, 14);

  // Stochastic (14, 3, 3)
  const stochastic = calculateStochastic(data, 14, 3, 3);

  // Williams %R
  const williamsR = calculateWilliamsR(data, 14);

  // CCI
  const cci20 = calculateCCI(data, 20);

  // ROC
  const roc10 = calculateROC(data, 10);

  // Bollinger Bands
  const bollingerBands = calculateBollingerBands(data, 20, 2);

  // ATR
  const atr14 = calculateATR(data, 14);

  // ADX
  const adx14 = calculateADX(data, 14);

  const currentClose = data[data.length - 1].close;

  // Count bullish and bearish signals
  let bullishSignals = 0;
  let bearishSignals = 0;

  // SMA trend signals
  if (sma5 > sma21) bullishSignals++; else bearishSignals++;
  if (sma21 > sma70) bullishSignals++; else bearishSignals++;
  if (sma70 > sma200) bullishSignals++; else bearishSignals++;

  // EMA trend signals
  if (ema5 > ema21) bullishSignals++; else bearishSignals++;
  if (ema21 > ema70) bullishSignals++; else bearishSignals++;

  // MACD
  if (macd.histogram > 0) bullishSignals++; else bearishSignals++;
  if (macd.line > 0) bullishSignals++; else bearishSignals++;

  // Parabolic SAR
  if (parabolicSar.isUptrend) bullishSignals++; else bearishSignals++;

  // Ichimoku
  if (ichimoku.aboveCloud) bullishSignals++; else bearishSignals++;
  if (ichimoku.tenkanSen > ichimoku.kijunSen) bullishSignals++; else bearishSignals++;
  if (currentClose > ichimoku.chikouSpan) bullishSignals++; else bearishSignals++;

  // RSI
  if (rsi14 > 50) bullishSignals++; else bearishSignals++;
  if (rsi14 < 30) bullishSignals++; // oversold = potential bullish
  if (rsi14 > 70) bearishSignals++; // overbought = potential bearish

  // Stochastic
  if (stochastic.k > stochastic.d && stochastic.k < 80) bullishSignals++;
  if (stochastic.k < stochastic.d && stochastic.k > 20) bearishSignals++;
  if (stochastic.k < 20) bullishSignals++; // oversold
  if (stochastic.k > 80) bearishSignals++; // overbought

  // Williams %R
  if (williamsR > -50) bullishSignals++; else bearishSignals++;
  if (williamsR < -80) bullishSignals++; // oversold
  if (williamsR > -20) bearishSignals++; // overbought

  // CCI
  if (cci20 > 0) bullishSignals++; else bearishSignals++;
  if (cci20 < -100) bullishSignals++; // oversold
  if (cci20 > 100) bearishSignals++; // overbought

  // ROC
  if (roc10 > 0) bullishSignals++; else bearishSignals++;

  // Bollinger Bands position
  if (bollingerBands.position > 0.5) bullishSignals++; else bearishSignals++;
  if (bollingerBands.position < 0.2) bullishSignals++; // near lower band
  if (bollingerBands.position > 0.8) bearishSignals++; // near upper band

  // Golden/Dead cross bonus signals
  if (goldenCross.sma5x21 || goldenCross.sma21x70 || goldenCross.sma70x200) bullishSignals += 2;
  if (deadCross.sma5x21 || deadCross.sma21x70 || deadCross.sma70x200) bearishSignals += 2;

  return {
    sma,
    ema,
    goldenCross,
    deadCross,
    macd,
    parabolicSar,
    ichimoku,
    rsi7,
    rsi14,
    stochastic,
    williamsR,
    cci20,
    roc10,
    bollingerBands,
    atr14,
    adx14,
    bullishSignals,
    bearishSignals,
  };
}
