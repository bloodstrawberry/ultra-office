import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterSubtitleRemoverView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 자막 지우개 (AI Inpaint) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterSubtitleRemoverView />;
}
