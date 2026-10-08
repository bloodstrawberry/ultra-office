import type { Metadata } from 'next';

import { CONFIG } from 'src/global-config';

import { StockChartView } from 'src/sections/stock-chart/stock-chart-view';

export const metadata: Metadata = {
  title: `주식 차트 | Dashboard - ${CONFIG.appName}`,
  description: '주가 데이터를 여러 차트로 보고, 시세가 한 시점씩 그려지는 과정을 재생합니다.',
};

export default function Page() {
  return <StockChartView />;
}
