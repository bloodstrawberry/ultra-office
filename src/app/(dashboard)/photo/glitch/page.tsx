import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoGlitchView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `글리치(Glitch) 효과 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoGlitchView />;
}
