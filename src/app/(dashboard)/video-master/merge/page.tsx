import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterMergeView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 붙이기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterMergeView />;
}
