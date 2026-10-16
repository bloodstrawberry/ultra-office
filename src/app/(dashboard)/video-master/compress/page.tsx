import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterCompressView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 압축 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterCompressView />;
}
