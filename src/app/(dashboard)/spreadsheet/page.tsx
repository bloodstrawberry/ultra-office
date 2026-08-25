import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { SpreadsheetView } from 'src/sections/spreadsheet/view';

export const metadata: Metadata = {
  title: `스프레드시트 (Excel) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <SpreadsheetView />;
}
