/**
 * Unix Timestamp & Timezone World Clock Utilities
 */

export interface TimeZoneCity {
  city: string;
  country: string;
  zone: string;
  flag: string;
}

export const WORLD_CITIES: TimeZoneCity[] = [
  { city: '서울 (Seoul)', country: '대한민국', zone: 'Asia/Seoul', flag: '🇰🇷' },
  { city: '도쿄 (Tokyo)', country: '일본', zone: 'Asia/Tokyo', flag: '🇯🇵' },
  { city: '싱가포르 (Singapore)', country: '싱가포르', zone: 'Asia/Singapore', flag: '🇸🇬' },
  { city: '런던 (London)', country: '영국', zone: 'Europe/London', flag: '🇬🇧' },
  { city: '파리 (Paris)', country: '프랑스', zone: 'Europe/Paris', flag: '🇫🇷' },
  { city: '베를린 (Berlin)', country: '독일', zone: 'Europe/Berlin', flag: '🇩🇪' },
  { city: '뉴욕 (New York)', country: '미국 (동부)', zone: 'America/New_York', flag: '🇺🇸' },
  { city: '로스앤젤레스 (LA)', country: '미국 (서부)', zone: 'America/Los_Angeles', flag: '🇺🇸' },
  { city: '시드니 (Sydney)', country: '호주', zone: 'Australia/Sydney', flag: '🇦🇺' },
  { city: '두바이 (Dubai)', country: 'UAE', zone: 'Asia/Dubai', flag: '🇦🇪' },
  { city: 'UTC (협정세계시)', country: '표준시', zone: 'UTC', flag: '🌐' },
];

export function formatTimeInZone(date: Date, timeZone: string): { dateStr: string; timeStr: string; fullStr: string } {
  try {
    const formatterDate = new Intl.DateTimeFormat('ko-KR', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    });
    const formatterTime = new Intl.DateTimeFormat('ko-KR', {
      timeZone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const dateStr = formatterDate.format(date);
    const timeStr = formatterTime.format(date);
    return { dateStr, timeStr, fullStr: `${dateStr} ${timeStr}` };
  } catch {
    return { dateStr: date.toDateString(), timeStr: date.toTimeString(), fullStr: date.toISOString() };
  }
}

export function formatRelativeTime(date: Date): string {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);

  if (Math.abs(diffSec) < 60) {
    return diffSec >= 0 ? `${diffSec}초 후` : `${Math.abs(diffSec)}초 전`;
  }
  const diffMin = Math.round(diffSec / 60);
  if (Math.abs(diffMin) < 60) {
    return diffMin >= 0 ? `${diffMin}분 후` : `${Math.abs(diffMin)}분 전`;
  }
  const diffHour = Math.round(diffMin / 60);
  if (Math.abs(diffHour) < 24) {
    return diffHour >= 0 ? `${diffHour}시간 후` : `${Math.abs(diffHour)}시간 전`;
  }
  const diffDay = Math.round(diffHour / 24);
  return diffDay >= 0 ? `${diffDay}일 후` : `${Math.abs(diffDay)}일 전`;
}
