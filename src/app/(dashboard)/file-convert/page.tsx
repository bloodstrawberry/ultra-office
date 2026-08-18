import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { FileConvertView } from 'src/sections/file-convert/view';

export const metadata: Metadata = { title: `파일 일괄 변환기 | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return <FileConvertView />;
}
