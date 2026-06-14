import { NextResponse } from 'next/server';
import { fetchAllTimeframes } from '@/lib/goldPrice';
import { fetchAllEconomicData } from '@/lib/economic';
import { fetchCOTData } from '@/lib/cot';
import { getUpcomingEvents } from '@/lib/eventCalendar';
import { generatePrediction } from '@/lib/predict';

/**
 * Lightweight auto-check endpoint for background polling.
 *
 * Returns the full prediction only when:
 *   - tradeSignal is LONG or SHORT (not WAIT)
 *   - confidence >= threshold (default 75)
 *   - mtfScore >= mtfThreshold (default 7)
 *
 * Otherwise returns { signal: 'skip' } so the frontend suppresses the
 * notification and avoids unnecessary UI updates.
 *
 * Query params:
 *   threshold    — minimum confidence (0-100), default 75
 *   mtfThreshold — minimum MTF score (0-10), default 7
 */
export async function GET(request: Request) {
  try {
    const url          = new URL(request.url);
    const threshold    = Number(url.searchParams.get('threshold') ?? '75');
    const mtfThreshold = Number(url.searchParams.get('mtfThreshold') ?? '7');

    // Fetch all data sources in parallel
    const [priceData, { economic }, cotData, upcomingEvents] = await Promise.all([
      fetchAllTimeframes(),
      fetchAllEconomicData(),
      fetchCOTData(),
      Promise.resolve(getUpcomingEvents(14)),
    ]);

    // Generate prediction
    const prediction = await generatePrediction(
      priceData,
      economic,
      cotData,
      upcomingEvents,
    );

    // Skip if signal is WAIT
    if (prediction.tradeSetup.signal === 'WAIT') {
      return NextResponse.json({ signal: 'skip', reason: 'WAIT signal' });
    }

    // Skip if confidence below threshold
    if (prediction.confidence < threshold) {
      return NextResponse.json({
        signal: 'skip',
        reason: `Confidence ${prediction.confidence} < threshold ${threshold}`,
      });
    }

    // Skip if MTF score below threshold
    const mtfScore = Math.abs(prediction.mtfScore);
    if (mtfScore < mtfThreshold) {
      return NextResponse.json({
        signal: 'skip',
        reason: `MTF score ${mtfScore} < threshold ${mtfThreshold}`,
      });
    }

    // All criteria met — return full prediction
    return NextResponse.json({ signal: 'alert', prediction });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Auto-check failed', details: message },
      { status: 500 }
    );
  }
}
