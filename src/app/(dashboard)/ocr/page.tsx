import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { OcrView } from 'src/sections/ocr/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `스마트 OCR 스캐너 | 영수증 · 명함 · 표 인식 - ${CONFIG.appName}`,
  description: 'AI 기반 고성능 영수증, 명함, 서식 표 데이터 자동 추출 및 엑셀/CSV 내보내기',
};

export default function Page() {
  return <OcrView />;
}
