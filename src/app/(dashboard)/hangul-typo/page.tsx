import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { HangulTypoView } from 'src/sections/hangul-typo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `한영 타자 오타 자동 복원기 | Dashboard - ${CONFIG.appName}`,
  description: '영타 및 한타 오타 실시간 감지 및 두벌식 한글 오토마타 복원 변환기',
};

export default function Page() {
  return <HangulTypoView />;
}
