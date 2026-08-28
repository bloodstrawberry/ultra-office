import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MatlabView } from 'src/sections/matlab/view/matlab-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `MATLAB 랩 (Web Studio) | Dashboard - ${CONFIG.appName}`,
  description: '수치 해석, 행렬 연산, 인터랙티브 2D/3D 플롯 및 신호처리 MATLAB 웹 스튜디오',
};

export default function Page() {
  return <MatlabView />;
}
