import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PublicSqlView } from 'src/sections/public/sql';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `SQL 실습 및 자격검정 대비기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PublicSqlView />;
}
