import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { MorseView } from 'src/sections/morse/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `모스 부호 변환기 & 스튜디오 | Dashboard - ${CONFIG.appName}`,
  description:
    '한국어(국문), 영어(국제), 숫자, 특수기호 모스 부호 실시간 양방향 변환, 오디오/불빛 신호 송신 및 인터랙티브 전건 키어',
};

export default function Page() {
  return <MorseView />;
}
