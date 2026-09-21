import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterBgRemoveView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 배경 제거 (AI Video Background Removal) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterBgRemoveView />;
}
