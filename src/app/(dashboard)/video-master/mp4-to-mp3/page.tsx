import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterMp4ToMp3View } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `MP4 → MP3 변환 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterMp4ToMp3View />;
}
