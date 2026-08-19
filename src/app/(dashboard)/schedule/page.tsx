import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ScheduleView } from 'src/sections/schedule/view/schedule-view';

export const metadata: Metadata = { title: `일정 & 간트차트 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ScheduleView />;
}
