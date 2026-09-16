import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SqlSqldView } from 'src/sections/sql/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `SQLD 연습 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <SqlSqldView />;
}
