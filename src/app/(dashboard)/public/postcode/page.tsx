import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PublicPostcodeView } from 'src/sections/public';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `우편번호/주소 검색 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PublicPostcodeView />;
}
