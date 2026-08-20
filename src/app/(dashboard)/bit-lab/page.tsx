import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { BitLabView } from 'src/sections/bit-lab/view';

export const metadata: Metadata = {
  title: `비트 & IEEE-754 랩 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <BitLabView />;
}
