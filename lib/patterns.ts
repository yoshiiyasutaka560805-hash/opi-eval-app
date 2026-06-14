import { OHLCV } from '@/types';

// ── helpers ──────────────────────────────────────────────────────────────────

function avg(arr: number[]): number {
  return arr.reduce((s, v) => s + v, 0) / arr.length;
}

function withinPct(a: number, b: number, pct: number): boolean {
  return Math.abs(a - b) / ((a + b) / 2) < pct;
}

function bodySize(c: OHLCV): number {
  return Math.abs(c.close - c.open);
}

function range(c: OHLCV): number {
  return c.high - c.low;
}

function isBullish(c: OHLCV): boolean {
  return c.close > c.open;
}

function isBearish(c: OHLCV): boolean {
  return c.close < c.open;
}

// ── Double Top / Double Bottom ────────────────────────────────────────────────

function detectDoubleTop(candles: OHLCV[]): string | null {
  const n = candles.length;
  if (n < 20) return null;

  const window = candles.slice(-40);
  const highs = window.map(c => c.high);

  // Find two local maxima that are within 5% of each other with a valley between
  for (let i = 2; i < highs.length - 2; i++) {
    const leftPeak = Math.max(highs[i - 2], highs[i - 1], highs[i]);
    for (let j = i + 5; j < highs.length - 2; j++) {
      const rightPeak = Math.max(highs[j - 1], highs[j], highs[j + 1] ?? highs[j]);
      if (withinPct(leftPeak, rightPeak, 0.05)) {
        // Ensure valley between peaks is meaningfully lower
        const valleySlice = highs.slice(i + 1, j);
        const valleyLow = Math.min(...valleySlice);
        if ((leftPeak - valleyLow) / leftPeak > 0.01) {
          return 'ダブルトップ（反転シグナル）';
        }
      }
    }
  }
  return null;
}

function detectDoubleBottom(candles: OHLCV[]): string | null {
  const n = candles.length;
  if (n < 20) return null;

  const window = candles.slice(-40);
  const lows = window.map(c => c.low);

  for (let i = 2; i < lows.length - 2; i++) {
    const leftTrough = Math.min(lows[i - 2], lows[i - 1], lows[i]);
    for (let j = i + 5; j < lows.length - 2; j++) {
      const rightTrough = Math.min(lows[j - 1], lows[j], lows[j + 1] ?? lows[j]);
      if (withinPct(leftTrough, rightTrough, 0.05)) {
        const peakSlice = lows.slice(i + 1, j);
        const peakHigh = Math.max(...peakSlice);
        if ((peakHigh - leftTrough) / leftTrough > 0.01) {
          return 'ダブルボトム（反転シグナル）';
        }
      }
    }
  }
  return null;
}

// ── Head and Shoulders ───────────────────────────────────────────────────────

function detectHeadAndShoulders(candles: OHLCV[]): string | null {
  if (candles.length < 30) return null;

  const window = candles.slice(-50);
  const highs = window.map(c => c.high);
  const lows  = window.map(c => c.low);

  // Find three peaks: left shoulder < head > right shoulder
  for (let head = 10; head < highs.length - 10; head++) {
    const headH = highs[head];
    // left shoulder in [head-10, head-3]
    let lsH = -Infinity, lsIdx = -1;
    for (let i = head - 10; i < head - 2; i++) {
      if (highs[i] > lsH) { lsH = highs[i]; lsIdx = i; }
    }
    // right shoulder in [head+3, head+10]
    let rsH = -Infinity, rsIdx = -1;
    for (let i = head + 3; i < Math.min(head + 11, highs.length); i++) {
      if (highs[i] > rsH) { rsH = highs[i]; rsIdx = i; }
    }
    if (lsIdx < 0 || rsIdx < 0) continue;
    if (headH > lsH && headH > rsH && withinPct(lsH, rsH, 0.05)) {
      return 'ヘッド・アンド・ショルダーズ（天井反転シグナル）';
    }
  }

  // Inverse: three troughs for Inverse H&S
  for (let head = 10; head < lows.length - 10; head++) {
    const headL = lows[head];
    let lsL = Infinity;
    for (let i = head - 10; i < head - 2; i++) {
      if (lows[i] < lsL) lsL = lows[i];
    }
    let rsL = Infinity;
    for (let i = head + 3; i < Math.min(head + 11, lows.length); i++) {
      if (lows[i] < rsL) rsL = lows[i];
    }
    if (headL < lsL && headL < rsL && withinPct(lsL, rsL, 0.05)) {
      return '逆ヘッド・アンド・ショルダーズ（底値反転シグナル）';
    }
  }

  return null;
}

// ── Ascending / Descending Triangle ──────────────────────────────────────────

function detectTriangle(candles: OHLCV[]): string | null {
  if (candles.length < 20) return null;

  const window = candles.slice(-30);
  const highs = window.map(c => c.high);
  const lows  = window.map(c => c.low);

  const recentHighs = highs.slice(-15);
  const recentLows  = lows.slice(-15);

  const maxHigh = Math.max(...recentHighs);
  const minHigh = Math.min(...recentHighs);
  const maxLow  = Math.max(...recentLows);
  const minLow  = Math.min(...recentLows);

  // Ascending triangle: flat top (highs within 1%), rising lows
  const topFlat   = (maxHigh - minHigh) / maxHigh < 0.01;
  const lowRising = maxLow > minLow * 1.005;
  if (topFlat && lowRising) return '上昇トライアングル（ブレイクアウト待ち）';

  // Descending triangle: flat bottom, falling highs
  const bottomFlat  = (maxLow - minLow) / maxLow < 0.01;
  const highFalling = minHigh < maxHigh * 0.995;
  if (bottomFlat && highFalling) return '下降トライアングル（ブレイクダウン待ち）';

  return null;
}

// ── Bull / Bear Flag ─────────────────────────────────────────────────────────

function detectFlag(candles: OHLCV[]): string | null {
  if (candles.length < 15) return null;

  const pole = candles.slice(-15, -5);
  const flag = candles.slice(-5);

  // Bull flag: strong up move in pole, then slight pullback
  const poleMove = pole[pole.length - 1].close - pole[0].open;
  const flagMove = flag[flag.length - 1].close - flag[0].open;
  const poleRange = avg(pole.map(c => range(c)));

  if (poleMove > poleRange * 3 && flagMove < 0 && Math.abs(flagMove) < Math.abs(poleMove) * 0.5) {
    return '上昇フラッグ（上昇継続シグナル）';
  }

  // Bear flag: strong down move, then slight bounce
  if (poleMove < -poleRange * 3 && flagMove > 0 && Math.abs(flagMove) < Math.abs(poleMove) * 0.5) {
    return '下降フラッグ（下落継続シグナル）';
  }

  return null;
}

// ── Pennant ───────────────────────────────────────────────────────────────────

function detectPennant(candles: OHLCV[]): string | null {
  if (candles.length < 20) return null;

  const pole   = candles.slice(-20, -8);
  const pennant = candles.slice(-8);

  const poleMove = Math.abs(pole[pole.length - 1].close - pole[0].open);
  const poleRange = avg(pole.map(c => range(c)));

  if (poleMove < poleRange * 2) return null; // No strong initial move

  const pennantHighs = pennant.map(c => c.high);
  const pennantLows  = pennant.map(c => c.low);

  // Pennant: contracting highs AND contracting lows (converging)
  const highContracting = pennantHighs[pennantHighs.length - 1] < pennantHighs[0];
  const lowContracting  = pennantLows[pennantLows.length - 1]   > pennantLows[0];

  if (highContracting && lowContracting) {
    const poleDir = pole[pole.length - 1].close - pole[0].open;
    return poleDir > 0 ? '上昇ペナント（継続シグナル）' : '下降ペナント（継続シグナル）';
  }

  return null;
}

// ── public API ────────────────────────────────────────────────────────────────

export function detectPatterns(candles: OHLCV[]): string[] {
  const detected: string[] = [];

  const dt = detectDoubleTop(candles);
  if (dt) detected.push(dt);

  const db = detectDoubleBottom(candles);
  if (db) detected.push(db);

  const hs = detectHeadAndShoulders(candles);
  if (hs) detected.push(hs);

  const tri = detectTriangle(candles);
  if (tri) detected.push(tri);

  const flag = detectFlag(candles);
  if (flag) detected.push(flag);

  const pennant = detectPennant(candles);
  if (pennant) detected.push(pennant);

  return detected;
}
