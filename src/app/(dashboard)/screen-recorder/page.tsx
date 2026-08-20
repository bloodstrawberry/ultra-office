import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ScreenRecorderView } from 'src/sections/screen-recorder/view';

export const metadata: Metadata = {
  title: `화면 & 웹캠 녹화 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <ScreenRecorderView />;
}
