import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterBatchView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 일괄 변환기 (Batch) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterBatchView />;
}
