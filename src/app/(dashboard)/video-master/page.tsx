import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `동영상 편집 스튜디오 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterView />;
}
