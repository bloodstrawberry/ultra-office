import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { TranslatorView } from 'src/sections/translator/view';

export const metadata: Metadata = {
  title: `다국어 번역기 (Translator) | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <TranslatorView />;
}
