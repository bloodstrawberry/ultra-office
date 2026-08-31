import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';
import { NumberWordsView } from 'src/sections/number-words/view';

// ----------------------------------------------------------------------

export const metadata: Metadata = {
  title: `금액 한글/한자 표기 변환기 | Dashboard - ${CONFIG.appName}`,
  description: '숫자 및 금액 한글 표기(일억 원정), 위조방지 한자 갖은자(壹億 圓整) 및 세금계산서 공급가액/VAT 분리 계산기',
};

export default function Page() {
  return <NumberWordsView />;
}
