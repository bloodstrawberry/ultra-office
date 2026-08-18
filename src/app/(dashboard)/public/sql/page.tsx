import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SqlPracticeView } from 'src/sections/public/sql/sql-practice-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `SQL 연습 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <SqlPracticeView />;
}
