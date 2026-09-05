import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { PhotoEditorView } from 'src/sections/photo/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `갤럭시 & 아이폰 사진 편집 | Dashboard - ${CONFIG.appName}`,
};

export default function Page() {
  return <PhotoEditorView />;
}
