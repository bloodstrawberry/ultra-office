import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { PostcodeView } from 'src/sections/public/postcode-view';

// ----------------------------------------------------------------------

export const metadata: Metadata = { title: `주소 검색 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <PostcodeView />;
}
