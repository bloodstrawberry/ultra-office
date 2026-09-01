import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterAiWatermarkView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 AI 워터마크 각인 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterAiWatermarkView />;
}
