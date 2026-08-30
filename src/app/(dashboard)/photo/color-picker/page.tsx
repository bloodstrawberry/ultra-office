import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoColorPickerView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `스마트 스포이드/색상 추출 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoColorPickerView />;
}
