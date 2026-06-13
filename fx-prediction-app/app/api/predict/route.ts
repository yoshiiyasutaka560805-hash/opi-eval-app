import { NextResponse } from 'next/server';
import { fetchAllTimeframes } from '@/lib/goldPrice';
import { fetchAllEconomicData } from '@/lib/economic';
import { fetchCOTData } from '@/lib/cot';
import { getUpcomingEvents } from '@/lib/eventCalendar';
import { generatePrediction } from '@/lib/predict';

export async function POST() {
  try {
    // Fetch all required data sources in parallel
    const [priceData, { economic, news: _news }, cotData, upcomingEvents] = await Promise.all([
      fetchAllTimeframes(),
      fetchAllEconomicData(),
      fetchCOTData(),
      Promise.resolve(getUpcomingEvents(14)),
    ]);

    // Generate the AI prediction
    const prediction = await generatePrediction(
      priceData,
      economic,
      cotData,
      upcomingEvents,
    );

    return NextResponse.json({ prediction });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate prediction', details: message },
      { status: 500 }
    );
  }
}
