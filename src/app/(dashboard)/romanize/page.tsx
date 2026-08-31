import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { RomanizeView } from 'src/sections/romanize/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `국립국어원 표준 로마자 표기 변환기 | Dashboard - ${CONFIG.appName}`,
  description:
    '국어의 로마자 표기법 고시 표준 기반 여권 인명, 도로명 주소 및 음운 변동 자동 반영 변환기',
};

export default function Page() {
  return <RomanizeView />;
}
