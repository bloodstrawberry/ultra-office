import type { Metadata } from 'next';

import highlight1 from 'public/classic/highlight1.json';
import highlight2 from 'public/classic/highlight2.json';
import highlight3 from 'public/classic/highlight3.json';
import highlight4 from 'public/classic/highlight4.json';

import { CONFIG } from 'src/global-config';

import { ClassicSearchView } from 'src/sections/classic-search/classic-search-view';

type ClassicDetails = { 카테고리: string[]; 특징: string[]; OST?: string[] };

export const metadata: Metadata = {
  title: `클래식 검색 | Dashboard - ${CONFIG.appName}`,
  description: '클래식 곡명, 카테고리, 특징으로 검색하고 하이라이트 수록 위치 확인',
};

const highlights = [highlight1, highlight2, highlight3, highlight4] as Record<
  string,
  ClassicDetails
>[];

const classics = Object.values(
  highlights.reduce<
    Record<
      string,
      {
        title: string;
        position: number;
        categories: string[];
        features: string[];
        ost: string[];
        highlights: number[];
      }
    >
  >((entries, highlight, index) => {
    Object.entries(highlight).forEach(([title, details], position) => {
      const entry = entries[title] ?? {
        title,
        position: position + 1,
        categories: [],
        features: [],
        ost: [],
        highlights: [],
      };

      entry.categories = [...new Set([...entry.categories, ...details.카테고리])];
      entry.features = [...new Set([...entry.features, ...details.특징])];
      entry.ost = [...new Set([...entry.ost, ...(details.OST ?? [])])];
      entry.highlights.push(index + 1);
      entries[title] = entry;
    });
    return entries;
  }, {})
).sort((a, b) => a.title.localeCompare(b.title, 'ko'));

export default function Page() {
  return <ClassicSearchView classics={classics} />;
}
