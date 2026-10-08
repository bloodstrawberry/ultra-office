import type { SampleImageItem } from 'src/sections/photo/components';

import { NEWS_SAMPLE_IMAGES } from 'src/sections/photo/utils/news-caption-presets';

export const WEBTOON_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'sample-character',
    label: '직장인 캐릭터',
    url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/sample-character.png`,
    subLabel: '캐릭터 전신 일러스트',
  },
  {
    id: 'sample-mvp-frame',
    label: '이달의 우수사원 프레임',
    url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/sample-mvp-frame.png`,
    subLabel: 'Employee MVP 액자 템플릿',
  },
  {
    id: 'sample-office-couple',
    label: '웹툰 장면 (사내 커플)',
    url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/sample-office-couple.jpg`,
    subLabel: '오피스 일상 컷 만화',
  },
  ...NEWS_SAMPLE_IMAGES,
];

export async function loadWebtoonSample(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('예시 이미지를 불러오지 못했습니다.');
  const blob = await response.blob();
  const rawName = url.split('/').pop()?.split('?')[0] || 'sample.png';
  const type =
    blob.type ||
    (rawName.endsWith('.jpg') || rawName.endsWith('.jpeg') ? 'image/jpeg' : 'image/png');
  return new File([blob], rawName, { type });
}
