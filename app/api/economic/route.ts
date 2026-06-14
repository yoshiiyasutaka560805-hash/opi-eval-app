import { NextResponse } from 'next/server';
import { fetchAllEconomicData } from '@/lib/economic';
import { fetchCOTData } from '@/lib/cot';
import { getUpcomingEvents, isInsideNewsBlackout } from '@/lib/eventCalendar';

export async function GET() {
  try {
    // Fetch all economic data, COT, and calendar events in parallel
    const [{ economic, news }, cotData, upcomingEvents] = await Promise.all([
      fetchAllEconomicData(),
      fetchCOTData(),
      Promise.resolve(getUpcomingEvents(14)),
    ]);

    const blackoutInfo = isInsideNewsBlackout();

    return NextResponse.json({
      economic,
      news,
      cot: cotData,
      events: upcomingEvents,
      blackout: {
        isBlackout: blackoutInfo.isBlackout,
        message:    blackoutInfo.message,
        event:      blackoutInfo.event ?? null,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch economic data', details: message },
      { status: 500 }
    );
  }
}
