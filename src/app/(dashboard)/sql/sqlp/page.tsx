import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SqlSqlpView } from 'src/sections/sql/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `SQLP 연습 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <SqlSqlpView />;
}
