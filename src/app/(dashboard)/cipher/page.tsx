import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { CipherView } from 'src/sections/cipher/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `고전 암호학 스튜디오 (Cipher Studio) | Dashboard - ${CONFIG.appName}`,
  description:
    '카이사르(시저), 비제네르, ROT13, 앳배쉬, 레일 펜스 암호화 및 전수 조사 브루트포스 해독기',
};

export default function Page() {
  return <CipherView />;
}
