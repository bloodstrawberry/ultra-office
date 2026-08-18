import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ColorPickerView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `스포이드 컬러 추출기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ColorPickerView />;
}
