import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { NatoPhoneticView } from 'src/sections/nato-phonetic/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `NATO 음성 알파벳 & 무선 통화표 | Dashboard - ${CONFIG.appName}`,
  description: 'ICAO/NATO 음성 알파벳 및 경찰/군용 무선 통화표 변환과 무전 음성 교신 방송',
};

export default function Page() {
  return <NatoPhoneticView />;
}
