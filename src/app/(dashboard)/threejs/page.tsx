import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { ThreeJsView } from 'src/sections/threejs/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `Three.js 3D 랩 (WebGL Studio) | Dashboard - ${CONFIG.appName}`,
  description:
    'WebGL 기반의 26종 인터랙티브 3D 그래픽스 쇼케이스, PBR 셰이더, 파티클 FX, 물리 시뮬레이션 및 코드 생성기',
};

export default function Page() {
  return <ThreeJsView />;
}
