import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterSubtitleView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `자막 편집기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterSubtitleView />;
}
