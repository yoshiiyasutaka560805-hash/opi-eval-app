import { UpcomingEvent } from '@/types';

// Approximate 2026 FOMC meeting end-dates (second day of each 2-day meeting)
const FOMC_DATES_2026 = [
  '2026-01-29',
  '2026-03-19',
  '2026-05-07',
  '2026-06-18',
  '2026-07-30',
  '2026-09-17',
  '2026-10-29',
  '2026-12-10',
];

export function getFirstFriday(year: number, month: number): Date {
  // month is 0-indexed (0 = January)
  const firstDay = new Date(Date.UTC(year, month, 1));
  const dayOfWeek = firstDay.getUTCDay(); // 0 = Sunday, 5 = Friday
  const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
  return new Date(Date.UTC(year, month, 1 + daysUntilFriday));
}

function getNextNFP(from: Date): Date {
  // NFP is released on the first Friday of each month
  let year  = from.getUTCFullYear();
  let month = from.getUTCMonth();

  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = getFirstFriday(year, month);
    // Add 1 hour of buffer so "today" NFP day still shows
    if (candidate.getTime() > from.getTime() - 60 * 60 * 1000) {
      return candidate;
    }
    // Advance one month
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  // Fallback: return next month's first Friday
  const nextMonth = new Date(from);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  return getFirstFriday(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth());
}

function getNextCPI(from: Date): Date {
  // CPI releases around the 10th-15th; use the 12th as estimate
  let year  = from.getUTCFullYear();
  let month = from.getUTCMonth();

  for (let attempt = 0; attempt < 3; attempt++) {
    const candidate = new Date(Date.UTC(year, month, 12, 8, 30, 0)); // 8:30 AM UTC
    if (candidate.getTime() > from.getTime() - 60 * 60 * 1000) {
      return candidate;
    }
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  const nextMonth = new Date(from);
  nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1);
  return new Date(
    Date.UTC(nextMonth.getUTCFullYear(), nextMonth.getUTCMonth(), 12, 8, 30, 0)
  );
}

function getNextPPI(cpiDate: Date): Date {
  // PPI releases approximately 7 days after CPI
  return new Date(cpiDate.getTime() + 7 * 24 * 60 * 60 * 1000);
}

function getNextFOMC(from: Date): Date | null {
  const now = from.getTime();
  for (const dateStr of FOMC_DATES_2026) {
    const candidate = new Date(dateStr + 'T18:00:00Z'); // Statement ~2PM ET / 18:00 UTC
    if (candidate.getTime() > now - 60 * 60 * 1000) {
      return candidate;
    }
  }
  return null;
}

export function getUpcomingEvents(daysAhead: number = 14): UpcomingEvent[] {
  const now    = new Date();
  const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  const events: UpcomingEvent[] = [];

  // NFP
  const nfpDate = getNextNFP(now);
  if (nfpDate <= cutoff) {
    const msUntil    = nfpDate.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);
    const daysUntil  = Math.floor(hoursUntil / 24);
    const isBlackout = hoursUntil >= 0 && hoursUntil <= 2;
    events.push({
      name:      'Non-Farm Payrolls (NFP)',
      date:      nfpDate.toISOString(),
      daysUntil: Math.max(0, daysUntil),
      hoursUntil: Math.max(0, Math.round(hoursUntil * 10) / 10),
      impact:    'HIGH',
      isBlackout,
    });
  }

  // CPI
  const cpiDate = getNextCPI(now);
  if (cpiDate <= cutoff) {
    const msUntil    = cpiDate.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);
    const daysUntil  = Math.floor(hoursUntil / 24);
    const isBlackout = hoursUntil >= 0 && hoursUntil <= 2;
    events.push({
      name:      'Consumer Price Index (CPI)',
      date:      cpiDate.toISOString(),
      daysUntil: Math.max(0, daysUntil),
      hoursUntil: Math.max(0, Math.round(hoursUntil * 10) / 10),
      impact:    'HIGH',
      isBlackout,
    });
  }

  // PPI (7 days after CPI)
  const ppiDate = getNextPPI(cpiDate);
  if (ppiDate <= cutoff) {
    const msUntil    = ppiDate.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);
    const daysUntil  = Math.floor(hoursUntil / 24);
    const isBlackout = hoursUntil >= 0 && hoursUntil <= 2;
    events.push({
      name:      'Producer Price Index (PPI)',
      date:      ppiDate.toISOString(),
      daysUntil: Math.max(0, daysUntil),
      hoursUntil: Math.max(0, Math.round(hoursUntil * 10) / 10),
      impact:    'MEDIUM',
      isBlackout,
    });
  }

  // FOMC
  const fomcDate = getNextFOMC(now);
  if (fomcDate && fomcDate <= cutoff) {
    const msUntil    = fomcDate.getTime() - now.getTime();
    const hoursUntil = msUntil / (1000 * 60 * 60);
    const daysUntil  = Math.floor(hoursUntil / 24);
    const isBlackout = hoursUntil >= 0 && hoursUntil <= 4;
    events.push({
      name:      'FOMC Interest Rate Decision',
      date:      fomcDate.toISOString(),
      daysUntil: Math.max(0, daysUntil),
      hoursUntil: Math.max(0, Math.round(hoursUntil * 10) / 10),
      impact:    'VERY_HIGH',
      isBlackout,
    });
  }

  // Sort by date ascending
  return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function isInsideNewsBlackout(): {
  isBlackout: boolean;
  event?: UpcomingEvent;
  message: string;
} {
  // Check all events within next 14 days for active blackout periods
  const events = getUpcomingEvents(14);

  for (const event of events) {
    if (event.isBlackout) {
      const windowHours = event.impact === 'VERY_HIGH' ? 4 : 2;
      return {
        isBlackout: true,
        event,
        message: `NEWS BLACKOUT: ${event.name} is within ${windowHours} hours. Avoid new trades.`,
      };
    }
  }

  return {
    isBlackout: false,
    message:    'No active news blackout.',
  };
}
