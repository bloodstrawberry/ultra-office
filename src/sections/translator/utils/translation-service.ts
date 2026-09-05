import type { SupportedLanguage } from '../types';

import ISO6391 from 'iso-639-1';
import translateLib from 'translate';

// ----------------------------------------------------------------------
// 1. 주요 언어 및 국기 이모지 정의
// ----------------------------------------------------------------------

const POPULAR_LANG_CODES = [
  'ko', // 한국어 (대한민국)
  'en', // 영어 (미국/영국)
  'ja', // 일본어 (일본)
  'zh', // 중국어 (중국)
  'es', // 스페인어 (스페인/중남미)
  'fr', // 프랑스어 (프랑스)
  'de', // 독일어 (독일)
  'vi', // 베트남어 (베트남)
  'ru', // 러시아어 (러시아)
  'it', // 이탈리아어 (이탈리아)
  'pt', // 포르투갈어 (포르투갈/브라질)
  'th', // 태국어 (태국)
  'id', // 인도네시아어 (인도네시아)
  'ar', // 아랍어 (중동/사우디/UAE)
  'hi', // 힌디어 (인도)
  'tr', // 튀르키예어 (튀르키예)
  'nl', // 네덜란드어 (네덜란드)
  'pl', // 폴란드어 (폴란드)
  'sv', // 스웨덴어 (스웨덴)
  'da', // 덴마크어 (덴마크)
  'fi', // 핀란드어 (핀란드)
  'no', // 노르웨이어 (노르웨이)
  'cs', // 체코어 (체코)
  'el', // 그리스어 (그리스)
  'hu', // 헝가리어 (헝가리)
  'uk', // 우크라이나어 (우크라이나)
  'he', // 히브리어 (이스라엘)
  'fa', // 페르시아어 (이란)
  'ms', // 말레이어 (말레이시아)
  'ro', // 루마니아어 (루마니아)
  'bg', // 불가리아어 (불가리아)
  'sk', // 슬로바키아어 (슬로바키아)
  'hr', // 크로아티아어 (크로아티아)
  'sr', // 세르비아어 (세르비아)
  'sl', // 슬로베니아어 (슬로베니아)
  'et', // 에스토니아어 (에스토니아)
  'lv', // 라트비아어 (라트비아)
  'lt', // 리투아니아어 (리투아니아)
  'tl', // 타갈로그어 (필리핀)
  'mn', // 몽골어 (몽골)
  'my', // 버마어 (미얀마)
  'km', // 크메르어 (캄보디아)
  'lo', // 라오어 (라오스)
  'ne', // 네팔어 (네팔)
  'bn', // 벵골어 (방글라데시)
  'ur', // 우르두어 (파키스탄)
  'ta', // 타밀어 (인도/스리랑카)
  'sw', // 스와힐리어 (케냐/탄자니아)
  'af', // 아프리칸스어 (남아공)
  'is', // 아이슬란드어 (아이슬란드)
  'ga', // 아일랜드어 (아일랜드)
  'ca', // 카탈루냐어 (스페인 바르셀로나)
  'la', // 라틴어 (바티칸)
  'eo', // 에스페란토 (국제어)
];

export const FLAG_MAP: Record<string, string> = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  vi: '🇻🇳',
  ru: '🇷🇺',
  it: '🇮🇹',
  pt: '🇧🇷',
  th: '🇹🇭',
  id: '🇮🇩',
  ar: '🇸🇦',
  hi: '🇮🇳',
  tr: '🇹🇷',
  nl: '🇳🇱',
  pl: '🇵🇱',
  sv: '🇸🇪',
  da: '🇩🇰',
  fi: '🇫🇮',
  no: '🇳🇴',
  cs: '🇨🇿',
  el: '🇬🇷',
  hu: '🇭🇺',
  uk: '🇺🇦',
  he: '🇮🇱',
  fa: '🇮🇷',
  ms: '🇲🇾',
  ro: '🇷🇴',
  bg: '🇧🇬',
  sk: '🇸🇰',
  hr: '🇭🇷',
  sr: '🇷🇸',
  sl: '🇸🇮',
  et: '🇪🇪',
  lv: '🇱🇻',
  lt: '🇱🇹',
  tl: '🇵🇭',
  fil: '🇵🇭',
  mn: '🇲🇳',
  my: '🇲🇲',
  km: '🇰🇭',
  lo: '🇱🇦',
  ne: '🇳🇵',
  bn: '🇧🇩',
  ur: '🇵🇰',
  ta: '🇱🇰',
  sw: '🇰🇪',
  af: '🇿🇦',
  is: '🇮🇸',
  ga: '🇮🇪',
  ca: '🇪🇸',
  la: '🇻🇦',
  eo: '🌐',
  cy: '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  eu: '🇪🇸',
  gl: '🇪🇸',
  sq: '🇦🇱',
  mk: '🇲🇰',
  bs: '🇧🇦',
  az: '🇦🇿',
  ka: '🇬🇪',
  hy: '🇦🇲',
  kk: '🇰🇿',
  uz: '🇺🇿',
  ky: '🇰🇬',
  tg: '🇹🇯',
  tk: '🇹🇲',
  am: '🇪🇹',
  so: '🇸🇴',
  ha: '🇳🇬',
  yo: '🇳🇬',
  ig: '🇳🇬',
  zu: '🇿🇦',
  xh: '🇿🇦',
  mg: '🇲🇬',
  si: '🇱🇰',
  gu: '🇮🇳',
  kn: '🇮🇳',
  ml: '🇮🇳',
  mr: '🇮🇳',
  pa: '🇮🇳',
  te: '🇮🇳',
};

export const COUNTRY_NAME_MAP: Record<
  string,
  { country: string; region: 'asia' | 'europe' | 'americas' | 'mideast_africa' | 'other' }
> = {
  ko: { country: '대한민국', region: 'asia' },
  en: { country: '미국/영국', region: 'americas' },
  ja: { country: '일본', region: 'asia' },
  zh: { country: '중국', region: 'asia' },
  es: { country: '스페인/중남미', region: 'europe' },
  fr: { country: '프랑스', region: 'europe' },
  de: { country: '독일', region: 'europe' },
  vi: { country: '베트남', region: 'asia' },
  ru: { country: '러시아', region: 'europe' },
  it: { country: '이탈리아', region: 'europe' },
  pt: { country: '브라질/포르투갈', region: 'americas' },
  th: { country: '태국', region: 'asia' },
  id: { country: '인도네시아', region: 'asia' },
  ar: { country: '사우디/아랍권', region: 'mideast_africa' },
  hi: { country: '인도', region: 'asia' },
  tr: { country: '튀르키예', region: 'europe' },
  nl: { country: '네덜란드', region: 'europe' },
  pl: { country: '폴란드', region: 'europe' },
  sv: { country: '스웨덴', region: 'europe' },
  da: { country: '덴마크', region: 'europe' },
  fi: { country: '핀란드', region: 'europe' },
  no: { country: '노르웨이', region: 'europe' },
  cs: { country: '체코', region: 'europe' },
  el: { country: '그리스', region: 'europe' },
  hu: { country: '헝가리', region: 'europe' },
  uk: { country: '우크라이나', region: 'europe' },
  he: { country: '이스라엘', region: 'mideast_africa' },
  fa: { country: '이란', region: 'mideast_africa' },
  ms: { country: '말레이시아', region: 'asia' },
  ro: { country: '루마니아', region: 'europe' },
  bg: { country: '불가리아', region: 'europe' },
  sk: { country: '슬로바키아', region: 'europe' },
  hr: { country: '크로아티아', region: 'europe' },
  sr: { country: '세르비아', region: 'europe' },
  sl: { country: '슬로베니아', region: 'europe' },
  et: { country: '에스토니아', region: 'europe' },
  lv: { country: '라트비아', region: 'europe' },
  lt: { country: '리투아니아', region: 'europe' },
  tl: { country: '필리핀', region: 'asia' },
  fil: { country: '필리핀', region: 'asia' },
  mn: { country: '몽골', region: 'asia' },
  my: { country: '미얀마', region: 'asia' },
  km: { country: '캄보디아', region: 'asia' },
  lo: { country: '라오스', region: 'asia' },
  ne: { country: '네팔', region: 'asia' },
  bn: { country: '방글라데시', region: 'asia' },
  ur: { country: '파키스탄', region: 'asia' },
  ta: { country: '인도/스리랑카', region: 'asia' },
  sw: { country: '케냐/동아프리카', region: 'mideast_africa' },
  af: { country: '남아프리카', region: 'mideast_africa' },
  is: { country: '아이슬란드', region: 'europe' },
  ga: { country: '아일랜드', region: 'europe' },
  ca: { country: '카탈루냐', region: 'europe' },
  la: { country: '바티칸(라틴)', region: 'europe' },
  eo: { country: '에스페란토', region: 'other' },
  kk: { country: '카자흐스탄', region: 'asia' },
  uz: { country: '우즈베키스탄', region: 'asia' },
  az: { country: '아제르바이잔', region: 'asia' },
  ka: { country: '조지아', region: 'europe' },
  hy: { country: '아르메니아', region: 'europe' },
};

/**
 * 180+ 개국 전체 지원 언어 목록 생성 (인기 언어 우선 정렬)
 */
export function getAllSupportedLanguages(): SupportedLanguage[] {
  const allCodes = ISO6391.getAllCodes();

  const popularSet = new Set(POPULAR_LANG_CODES);
  const popularList: SupportedLanguage[] = POPULAR_LANG_CODES.map((code) => {
    const meta = COUNTRY_NAME_MAP[code];
    return {
      code,
      name: ISO6391.getName(code) || code,
      nativeName: ISO6391.getNativeName(code) || code,
      flagEmoji: FLAG_MAP[code] || '🌐',
      countryName: meta?.country,
      region: meta?.region || 'other',
    };
  });

  const othersList: SupportedLanguage[] = allCodes
    .filter((code) => !popularSet.has(code))
    .map((code) => {
      const meta = COUNTRY_NAME_MAP[code];
      return {
        code,
        name: ISO6391.getName(code) || code,
        nativeName: ISO6391.getNativeName(code) || code,
        flagEmoji: FLAG_MAP[code] || '🌐',
        countryName: meta?.country,
        region: meta?.region || 'other',
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...popularList, ...othersList];
}

// ----------------------------------------------------------------------
// 2. 언어 자동 감지 휴리스틱
// ----------------------------------------------------------------------

export function detectLanguage(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return 'ko';

  // 한글 감지
  if (/[\uac00-\ud7af\u1100-\u11ff]/.test(trimmed)) {
    return 'ko';
  }
  // 일본어 히라가나/가타카나 감지
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(trimmed)) {
    return 'ja';
  }
  // 한자 감지 (일본어 가나가 없는 경우 중국어로 판별)
  if (/[\u4e00-\u9fa5]/.test(trimmed)) {
    return 'zh';
  }
  // 키릴 문자 (러시아어 등)
  if (/[\u0400-\u04ff]/.test(trimmed)) {
    return 'ru';
  }
  // 아랍 문자
  if (/[\u0600-\u06ff]/.test(trimmed)) {
    return 'ar';
  }
  // 태국 문자
  if (/[\u0e00-\u0e7f]/.test(trimmed)) {
    return 'th';
  }
  // 베트남어 특수 악센트
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(trimmed)) {
    return 'vi';
  }
  // 독일어 움라우트
  if (/[äöüß]/i.test(trimmed)) {
    return 'de';
  }
  // 스페인어/프랑스어 악센트
  if (/[ñ¿¡]/i.test(trimmed)) {
    return 'es';
  }
  if (/[çœæ]/i.test(trimmed)) {
    return 'fr';
  }

  // 기본 라틴 텍스트인 경우 영문(en)
  return 'en';
}

// ----------------------------------------------------------------------
// 3. Fallback 번역 엔진 (MyMemory API)
// ----------------------------------------------------------------------

async function translateWithMyMemory(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const source = fromLang === 'auto' ? detectLanguage(text) : fromLang;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source}|${toLang}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`MyMemory API error: HTTP ${response.status}`);
  }

  const data = await response.json();
  if (data?.responseData?.translatedText) {
    // HTML 엔티티 치환 (예: &quot; -> ", &#39; -> ')
    const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
    if (parser) {
      const doc = parser.parseFromString(data.responseData.translatedText, 'text/html');
      return doc.body.textContent || data.responseData.translatedText;
    }
    return data.responseData.translatedText;
  }

  throw new Error('Invalid response from MyMemory API');
}

// ----------------------------------------------------------------------
// 4. 메인 번역 함수
// ----------------------------------------------------------------------

export interface TranslateOptions {
  from?: string;
  to?: string;
  engine?: 'auto' | 'translate' | 'mymemory' | 'deepl' | 'google';
  apiKey?: string;
}

export async function translateText(text: string, options: TranslateOptions = {}): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';

  const rawFrom = options.from || 'auto';
  const to = options.to || 'en';

  const from = rawFrom === 'auto' ? detectLanguage(trimmed) : rawFrom;

  // 출발어와 도착어가 같으면 그대로 반환
  if (from === to) {
    return trimmed;
  }

  // 1차 시도: npm 'translate' 패키지 사용
  try {
    // translate 라이브러리 함수 및 엔진 안전 참조
    const translateFn =
      typeof translateLib === 'function'
        ? translateLib
        : (translateLib as any).default || translateLib;

    if (options.apiKey && options.engine === 'deepl') {
      translateFn.engine = 'deepl';
      translateFn.key = options.apiKey;
    } else if (options.apiKey && options.engine === 'google') {
      translateFn.engine = 'google';
      translateFn.key = options.apiKey;
    } else {
      translateFn.engine = 'google';
    }

    const result = await translateFn(trimmed, { from, to });
    if (result && typeof result === 'string' && result.trim()) {
      return result;
    }
  } catch (err) {
    console.warn('Translate package fallback triggered:', err);
  }

  // 2차 시도: MyMemory 무료 글로벌 번역 엔드포인트 Fallback
  try {
    const fallbackResult = await translateWithMyMemory(trimmed, from, to);
    if (fallbackResult && fallbackResult.trim()) {
      return fallbackResult;
    }
  } catch (secondErr) {
    console.warn('MyMemory fallback failed:', secondErr);
  }

  // 3차 시도: 대량 텍스트인 경우 줄바꿈 기준으로 문단 분할 번역 시도
  if (trimmed.includes('\n')) {
    const paragraphs = trimmed.split('\n');
    const translatedParagraphs: string[] = [];

    for (const para of paragraphs) {
      if (!para.trim()) {
        translatedParagraphs.push('');
        continue;
      }
      try {
        const pResult = await translateWithMyMemory(para, from, to);
        translatedParagraphs.push(pResult);
      } catch {
        translatedParagraphs.push(para);
      }
    }
    return translatedParagraphs.join('\n');
  }

  throw new Error(
    '번역 서비스 연결에 실패하였습니다. 네트워크 상태 또는 언어 설정을 확인해 주세요.'
  );
}

// ----------------------------------------------------------------------
// 5. 다국어 동시 번역 함수
// ----------------------------------------------------------------------

export async function translateToMultiple(
  text: string,
  fromLang: string,
  targetLangs: string[]
): Promise<Array<{ code: string; text: string; error?: string }>> {
  const from = fromLang === 'auto' ? detectLanguage(text) : fromLang;

  const promises = targetLangs.map(async (langCode) => {
    try {
      const translated = await translateText(text, { from, to: langCode });
      return { code: langCode, text: translated };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '번역 실패';
      return { code: langCode, text: '', error: msg };
    }
  });

  return Promise.all(promises);
}
