export interface CalendarTask {
  id: string;
  title: string;
  start: string; // YYYY-MM-DD
  end?: string; // YYYY-MM-DD
  backgroundColor?: string;
  description?: string;
  assignee?: string;
  progress?: number; // 0 ~ 100
}

/**
 * Tasks 목록을 iCalendar (.ics) 포맷 문자열로 변환
 */
export function exportToIcs(tasks: CalendarTask[]): Blob {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ultra Office//Schedule Studio//KO',
    'CALSCALE:GREGORIAN',
  ];

  tasks.forEach((t) => {
    const startFormatted = t.start.replace(/-/g, '');
    const endFormatted = t.end ? t.end.replace(/-/g, '') : startFormatted;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${t.id}@ultraoffice.local`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    lines.push(`DTSTART;VALUE=DATE:${startFormatted}`);
    lines.push(`DTEND;VALUE=DATE:${endFormatted}`);
    lines.push(`SUMMARY:${t.title}`);
    if (t.description) lines.push(`DESCRIPTION:${t.description}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8;' });
}

/**
 * 스마트 당직 / 교대근무 스케줄 생성
 */
export function generateShiftSchedule(
  members: string[],
  startDate: string,
  daysCount: number,
  shiftTypes: { name: string; color: string }[]
): CalendarTask[] {
  const generated: CalendarTask[] = [];
  const start = new Date(startDate);

  let memberIndex = 0;

  for (let i = 0; i < daysCount; i += 1) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];

    const currentMember = members[memberIndex % members.length];
    const currentShift = shiftTypes[i % shiftTypes.length];

    generated.push({
      id: `shift-${i}-${Date.now()}`,
      title: `[${currentShift.name}] ${currentMember}`,
      start: dateStr,
      backgroundColor: currentShift.color,
      assignee: currentMember,
      description: `${currentMember}님 ${currentShift.name} 근무`,
    });

    memberIndex += 1;
  }

  return generated;
}
