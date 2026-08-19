import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { DiagramView } from 'src/sections/diagram/view/diagram-view';

export const metadata: Metadata = {
  title: `다이어그램 & 문서 스튜디오 (수식, 그래프, 마크다운, ERD) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <DiagramView />;
}
