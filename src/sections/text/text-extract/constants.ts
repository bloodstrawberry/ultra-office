export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'kor', label: '한국어' },
  { value: 'eng', label: '영어' },
  { value: 'jpn', label: '일본어' },
  { value: 'chi_tra', label: '한자 (번체)' },
  { value: 'chi_sim', label: '한자 (간체)' },
  { value: 'fra', label: '프랑스어' },
  { value: 'deu', label: '독일어' },
  { value: 'spa', label: '스페인어' },
  { value: 'rus', label: '러시아어' },
  { value: 'vie', label: '베트남어' },
  { value: 'tha', label: '태국어' },
  { value: 'ara', label: '아랍어' },
  { value: 'por', label: '포르투갈어' },
  { value: 'ita', label: '이탈리아어' },
  { value: 'hin', label: '힌디어' },
];

export const LANGUAGE_LABEL_MAP: Record<string, string> = Object.fromEntries(
  LANGUAGE_OPTIONS.map(({ value, label }) => [value, label])
);

export const PSM_OPTIONS = [
  { value: '3', label: '3: 자동 (기본)' },
  { value: '1', label: '1: 자동 + 레이아웃 분석' },
  { value: '4', label: '4: 단일 열 가변 크기' },
  { value: '6', label: '6: 단일 텍스트 블록' },
  { value: '7', label: '7: 단일 텍스트 줄' },
  { value: '11', label: '11: 산재된 텍스트 (Sparse)' },
];

export const OEM_OPTIONS = [
  { value: '3', label: '3: 기본 엔진 (지능형)' },
  { value: '1', label: '1: LSTM 전용 (속도 빠름)' },
  { value: '2', label: '2: LSTM + 레거시 결합' },
];
