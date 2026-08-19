import type { Metadata } from 'next';

import { HomeView } from 'src/sections/home/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: 'Ultra Office - 올인원 웹 업무 생산성 플랫폼',
  description:
    'AI 에이전트, 스프레드시트, PDF 마스터, 데이터 비교, 스마트 OCR부터 16종 사진 편집기까지 설치 없이 브라우저에서 바로 사용하는 올인원 오피스 도구 모음',
};

export default function Page() {
  return <HomeView />;
}
