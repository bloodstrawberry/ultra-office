// ----------------------------------------------------------------------

export interface GifSampleItem {
  id: string;
  label: string;
  url: string;
  subLabel: string;
  filename: string;
  tag: string;
  description: string;
}

export const GIF_SAMPLE_LIST: GifSampleItem[] = [
  {
    id: 'sample-gif-dahyun',
    label: '✨ 다현 트와이스 움짤',
    url: '/gif-example/dahyun.GIF',
    subLabel: '4.0MB • 인물 모션 GIF',
    filename: 'dahyun.GIF',
    tag: '아이돌/인물',
    description: '고화질 아이돌 댄스 및 인물 모션 애니메이션',
  },
  {
    id: 'sample-gif-sunglasses',
    label: '🕶️ 선글라스 리액션 밈',
    url: '/gif-example/shocked-sunglasses.gif',
    subLabel: '3.3MB • 표정 & 애니메이션 밈',
    filename: 'shocked-sunglasses.gif',
    tag: '표정/밈',
    description: '다이내믹한 표정 변화와 깜짝 리액션 밈 움짤',
  },
  {
    id: 'sample-gif-table',
    label: '🪑 다이내믹 테이블 액션',
    url: '/gif-example/table.GIF',
    subLabel: '8.0MB • 액션 애니메이션 GIF',
    filename: 'table.GIF',
    tag: '액션/모션',
    description: '역동적인 테이블 뒤집기 & 모션 애니메이션',
  },
];

/**
 * public 폴더의 예시 GIF 파일을 Fetch하여 File 객체로 변환합니다.
 */
export async function fetchSampleGifFile(sample: GifSampleItem): Promise<File> {
  const response = await fetch(sample.url);
  if (!response.ok) {
    throw new Error(`샘플 파일을 불러오지 못했습니다: ${sample.label}`);
  }
  const blob = await response.blob();
  return new File([blob], sample.filename, { type: 'image/gif' });
}
