import type { SampleImageItem } from 'src/sections/photo/components';

export const WEBTOON_SAMPLE_IMAGES: SampleImageItem[] = [
  {
    id: 'webtoon-example',
    label: '웹툰 장면 예시',
    url: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/webtoon/sample.png`,
    subLabel: '말풍선과 싸인을 바로 시험해 보세요',
  },
];

export async function loadWebtoonSample(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('예시 이미지를 불러오지 못했습니다.');
  return new File([await response.blob()], 'webtoon-example.png', { type: 'image/png' });
}
