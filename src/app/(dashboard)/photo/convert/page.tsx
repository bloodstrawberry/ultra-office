import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ConvertView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `확장자 일괄 변환 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ConvertView />;
}
