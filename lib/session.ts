import { SessionInfo, SessionName } from '@/types';

interface SessionDef {
  name: SessionName;
  displayName: string;
  startUTC: number;
  endUTC: number;
  weight: number;
  reliability: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  color: string;
}

const SESSIONS: SessionDef[] = [
  { name: 'tokyo', displayName: '東京', startUTC: 0, endUTC: 9, weight: 0.7, reliability: 'LOW', color: '#6B7280' },
  { name: 'london', displayName: 'ロンドン', startUTC: 7, endUTC: 16, weight: 1.2, reliability: 'HIGH', color: '#3B82F6' },
  { name: 'ny', displayName: 'ニューヨーク', startUTC: 13, endUTC: 22, weight: 1.2, reliability: 'HIGH', color: '#22C55E' },
];

export function getCurrentSession(): SessionInfo {
  const now = new Date();
  const utcHour = now.getUTCHours();
  const utcDay = now.getUTCDay();

  const isWeekendRisk = (utcDay === 5 && utcHour >= 17) || utcDay === 6 || utcDay === 0;
  const weekendRiskMessage =
    utcDay === 6
      ? '土曜日 - 市場クローズ中'
      : utcDay === 0
      ? '日曜日 - 市場クローズ中'
      : utcDay === 5 && utcHour >= 17
      ? '週末ギャップリスク高 - 新規エントリー非推奨'
      : '';

  // Check overlap: London + NY both active between 13–16 UTC
  const inLondon = utcHour >= 7 && utcHour < 16;
  const inNY = utcHour >= 13 && utcHour < 22;
  if (inLondon && inNY) {
    return {
      current: 'overlap',
      name: 'ロンドン/NY重複',
      reliability: 'VERY_HIGH',
      weight: 1.5,
      isWeekendRisk,
      weekendRiskMessage,
      color: '#F59E0B',
    };
  }

  for (const s of SESSIONS) {
    if (utcHour >= s.startUTC && utcHour < s.endUTC) {
      return {
        current: s.name,
        name: s.displayName,
        reliability: s.reliability,
        weight: s.weight,
        isWeekendRisk,
        weekendRiskMessage,
        color: s.color,
      };
    }
  }

  return {
    current: 'closed',
    name: 'クローズ中',
    reliability: 'LOW',
    weight: 0.5,
    isWeekendRisk,
    weekendRiskMessage,
    color: '#374151',
  };
}
