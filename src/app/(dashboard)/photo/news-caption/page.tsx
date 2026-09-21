import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoNewsCaptionView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `뉴스 & 인간극장 자막 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoNewsCaptionView />;
}
