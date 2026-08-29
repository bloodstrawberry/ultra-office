import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ColorPickerView } from 'src/sections/photo/view';

export const metadata: Metadata = { title: `Color Picker | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <ColorPickerView />;
}
