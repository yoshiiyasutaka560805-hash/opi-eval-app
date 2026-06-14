import { PredictionRecord, PredictionAccuracy } from '@/types';

// LocalStorage key for persisted prediction history
const STORAGE_KEY = 'gold_predictions';

// ── Storage helpers ──────────────────────────────────────────────────────────

/**
 * Persist a new prediction record to localStorage.
 * No-op when running server-side (window not available).
 */
export function savePrediction(record: PredictionRecord): void {
  if (typeof window === 'undefined') return;

  try {
    const existing = getPredictions();
    existing.push(record);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch {
    // Storage may be full or unavailable — fail silently
  }
}

/**
 * Retrieve all stored prediction records.
 * Returns an empty array when running server-side or on parse error.
 */
export function getPredictions(): PredictionRecord[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as PredictionRecord[];
  } catch {
    return [];
  }
}

/**
 * Update the outcome and exit price for an existing prediction by ID.
 * If the prediction is not found the operation is a no-op.
 */
export function updateOutcome(
  id: string,
  outcome: PredictionRecord['outcome'],
  exitPrice: number,
): void {
  if (typeof window === 'undefined') return;

  try {
    const predictions = getPredictions();
    const idx = predictions.findIndex(p => p.id === id);
    if (idx === -1) return;

    predictions[idx] = {
      ...predictions[idx],
      outcome,
      exitPrice: Math.round(exitPrice * 100) / 100,
      resolvedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  } catch {
    // Fail silently
  }
}

// ── Cooldown check ────────────────────────────────────────────────────────────

/**
 * Check whether a trading cooldown is required.
 * A cooldown is triggered when the three most-recent resolved predictions
 * all resulted in a stop-loss hit (SL_HIT).
 */
export function checkCooldown(predictions: PredictionRecord[]): { required: boolean; reason: string } {
  const resolved = predictions
    .filter(p => p.outcome && p.outcome !== 'PENDING' && p.outcome !== 'EXPIRED')
    .slice(-3);

  if (resolved.length < 3) {
    return { required: false, reason: '' };
  }

  const allSlHit = resolved.every(p => p.outcome === 'SL_HIT');
  if (allSlHit) {
    return {
      required: true,
      reason: '直近3回連続でストップロスが発動しました。クールダウン期間中は新規エントリーを見送ってください。',
    };
  }

  return { required: false, reason: '' };
}

// ── Accuracy statistics ───────────────────────────────────────────────────────

/**
 * Calculate accuracy statistics over the last `limit` resolved predictions.
 * Defaults to the most recent 20.
 */
export function calculateAccuracy(
  predictions: PredictionRecord[],
  limit: number = 20,
): PredictionAccuracy {
  const resolved = predictions
    .filter(p => p.outcome && p.outcome !== 'PENDING' && p.outcome !== 'EXPIRED')
    .slice(-limit);

  const total = resolved.length;

  if (total === 0) {
    return {
      total: 0,
      tp1HitRate: 0,
      tp2HitRate: 0,
      slHitRate:  0,
      pendingCount: predictions.filter(p => !p.outcome || p.outcome === 'PENDING').length,
      averageRRachieved: 0,
    };
  }

  const tp1Count = resolved.filter(p => p.outcome === 'TP1_HIT' || p.outcome === 'TP2_HIT').length;
  const tp2Count = resolved.filter(p => p.outcome === 'TP2_HIT').length;
  const slCount  = resolved.filter(p => p.outcome === 'SL_HIT').length;

  // Estimate average RR achieved: TP2 = full RR, TP1 = half RR, SL = -1
  let rrSum = 0;
  for (const p of resolved) {
    if (p.outcome === 'TP2_HIT') {
      const riskPips   = Math.abs(p.entryPrice - p.stopLoss);
      const rewardPips = Math.abs(p.takeProfit2 - p.entryPrice);
      rrSum += riskPips > 0 ? Math.round((rewardPips / riskPips) * 100) / 100 : 2;
    } else if (p.outcome === 'TP1_HIT') {
      const riskPips   = Math.abs(p.entryPrice - p.stopLoss);
      const rewardPips = Math.abs(p.takeProfit1 - p.entryPrice);
      rrSum += riskPips > 0 ? Math.round((rewardPips / riskPips) * 100) / 100 : 1;
    } else if (p.outcome === 'SL_HIT') {
      rrSum -= 1;
    }
  }

  return {
    total,
    tp1HitRate:       Math.round((tp1Count / total) * 10000) / 100,
    tp2HitRate:       Math.round((tp2Count / total) * 10000) / 100,
    slHitRate:        Math.round((slCount  / total) * 10000) / 100,
    pendingCount:     predictions.filter(p => !p.outcome || p.outcome === 'PENDING').length,
    averageRRachieved: Math.round((rrSum / total) * 100) / 100,
  };
}

// ── Auto-resolve pending predictions ─────────────────────────────────────────

/**
 * Inspect all PENDING predictions and resolve them if the current price
 * has crossed their TP1, TP2, or SL levels.
 *
 * Resolution priority:
 *   1. If current price hit TP2 → TP2_HIT
 *   2. Else if current price hit TP1 → TP1_HIT
 *   3. Else if current price hit SL  → SL_HIT
 *
 * For LONG: price ≥ TPx to hit, price ≤ SL to trigger
 * For SHORT: price ≤ TPx to hit, price ≥ SL to trigger
 *
 * Returns the updated array (caller is responsible for saving).
 */
export function autoResolvePending(
  predictions: PredictionRecord[],
  currentPrice: number,
): PredictionRecord[] {
  if (typeof window === 'undefined') return predictions;

  let changed = false;

  const updated = predictions.map(p => {
    if (p.outcome && p.outcome !== 'PENDING') return p;

    const isLong  = p.signal === 'LONG';
    const isShort = p.signal === 'SHORT';

    if (!isLong && !isShort) return p; // WAIT signals — never resolve

    let outcome: PredictionRecord['outcome'] | undefined;

    if (isLong) {
      if (currentPrice >= p.takeProfit2) {
        outcome = 'TP2_HIT';
      } else if (currentPrice >= p.takeProfit1) {
        outcome = 'TP1_HIT';
      } else if (currentPrice <= p.stopLoss) {
        outcome = 'SL_HIT';
      }
    } else {
      // SHORT
      if (currentPrice <= p.takeProfit2) {
        outcome = 'TP2_HIT';
      } else if (currentPrice <= p.takeProfit1) {
        outcome = 'TP1_HIT';
      } else if (currentPrice >= p.stopLoss) {
        outcome = 'SL_HIT';
      }
    }

    if (outcome) {
      changed = true;
      return {
        ...p,
        outcome,
        exitPrice: Math.round(currentPrice * 100) / 100,
        resolvedAt: new Date().toISOString(),
      };
    }

    return p;
  });

  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // Fail silently
    }
  }

  return updated;
}
