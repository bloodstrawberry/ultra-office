import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { VideoMasterVoiceRecordView } from 'src/sections/video-master/view';

export const metadata: Metadata = {
  title: `음성 녹음기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <VideoMasterVoiceRecordView />;
}
