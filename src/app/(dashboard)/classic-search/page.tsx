import type { Metadata } from 'next';

import classicData from 'public/classic/classic.json';

import { CONFIG } from 'src/global-config';

import { ClassicSearchView } from 'src/sections/classic-search/classic-search-view';

type OstUse = { 작품: string; 근거: string };
type ClassicDetails = { 번호: string; 카테고리: string[]; 특징: string[]; OST?: OstUse[] };

export const metadata: Metadata = {
  title: `클래식 검색 | Dashboard - ${CONFIG.appName}`,
  description: '클래식 400곡을 곡명, 카테고리, 특징, OST, 메모로 검색',
};

const classics = Object.entries(classicData as Record<string, ClassicDetails>).map(
  ([title, details]) => ({
    title,
    position: Number(details.번호),
    categories: details.카테고리,
    features: details.특징,
    ost: details.OST ?? [],
  })
);

export default function Page() {
  return <ClassicSearchView classics={classics} />;
}
