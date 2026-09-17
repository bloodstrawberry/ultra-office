import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

export const metadata: Metadata = { title: `베리 하드 퍼즐 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return null;
}
