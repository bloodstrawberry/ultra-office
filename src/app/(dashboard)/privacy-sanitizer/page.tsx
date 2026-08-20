import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PrivacySanitizerView } from 'src/sections/privacy-sanitizer/view';

export const metadata: Metadata = {
  title: `개인정보 마스킹 · EXIF 파기 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PrivacySanitizerView />;
}
