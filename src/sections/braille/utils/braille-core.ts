/**
 * Standard Korean Braille (훈맹정음) & English Braille Engine
 * Maps 6-dot cell bitmasks to Unicode Braille Patterns (U+2800 ~ U+283F)
 *
 * 6-dot numbering:
 * (1) (4)   -> bit 0 (1), bit 3 (8)
 * (2) (5)   -> bit 1 (2), bit 4 (16)
 * (3) (6)   -> bit 2 (4), bit 5 (32)
 */

// ----------------------------------------------------------------------
// 1. Bitmask to Unicode Helper
// ----------------------------------------------------------------------

export function dotsToBrailleChar(dots: number[]): string {
  let mask = 0;
  dots.forEach((dot) => {
    if (dot >= 1 && dot <= 6) {
      mask |= 1 << (dot - 1);
    }
  });
  return String.fromCharCode(0x2800 + mask);
}

export function brailleCharToDots(char: string): number[] {
  const code = char.charCodeAt(0);
  if (code < 0x2800 || code > 0x283f) return [];
  const mask = code - 0x2800;
  const dots: number[] = [];
  for (let i = 0; i < 6; i += 1) {
    if ((mask & (1 << i)) !== 0) {
      dots.push(i + 1);
    }
  }
  return dots;
}

// ----------------------------------------------------------------------
// 2. Korean Braille (훈맹정음) Tables
// ----------------------------------------------------------------------

// 초성 (Initial Consonants)
export const KOREAN_CHOSUNG_BRAILLE: Record<string, string> = {
  ㄱ: dotsToBrailleChar([4]),
  ㄴ: dotsToBrailleChar([1, 4]),
  ㄷ: dotsToBrailleChar([2, 4]),
  ㄹ: dotsToBrailleChar([5]),
  ㅁ: dotsToBrailleChar([1, 5]),
  ㅂ: dotsToBrailleChar([4, 5]),
  ㅅ: dotsToBrailleChar([6]),
  ㅇ: '', // 초성 ㅇ은 점자 표기 생략 (자음 시작)
  ㅈ: dotsToBrailleChar([4, 6]),
  ㅊ: dotsToBrailleChar([5, 6]),
  ㅋ: dotsToBrailleChar([1, 2, 4]),
  ㅌ: dotsToBrailleChar([1, 2, 5]),
  ㅍ: dotsToBrailleChar([1, 4, 5]),
  ㅎ: dotsToBrailleChar([2, 4, 5]),

  // 된소리 (쌍자음): 된소리표(⠠: 6점) + 기본자음
  ㄲ: dotsToBrailleChar([6]) + dotsToBrailleChar([4]),
  ㄸ: dotsToBrailleChar([6]) + dotsToBrailleChar([2, 4]),
  ㅃ: dotsToBrailleChar([6]) + dotsToBrailleChar([4, 5]),
  ㅆ: dotsToBrailleChar([6]) + dotsToBrailleChar([6]),
  ㅉ: dotsToBrailleChar([6]) + dotsToBrailleChar([4, 6]),
};

// 중성 (Vowels)
export const KOREAN_JUNGSUNG_BRAILLE: Record<string, string> = {
  ㅏ: dotsToBrailleChar([1, 2, 6]),
  ㅑ: dotsToBrailleChar([3, 4, 5]),
  ㅓ: dotsToBrailleChar([2, 3, 4]),
  ㅕ: dotsToBrailleChar([1, 5, 6]),
  ㅗ: dotsToBrailleChar([1, 3, 6]),
  ㅛ: dotsToBrailleChar([3, 4, 6]),
  ㅜ: dotsToBrailleChar([1, 2, 3, 4]),
  ㅠ: dotsToBrailleChar([1, 4, 6]),
  ㅡ: dotsToBrailleChar([2, 4, 6]),
  ㅣ: dotsToBrailleChar([1, 3, 5]),
  ㅐ: dotsToBrailleChar([1, 2, 3, 5]),
  ㅔ: dotsToBrailleChar([1, 3, 4, 5]),
  ㅒ: dotsToBrailleChar([3, 4, 5]) + dotsToBrailleChar([1, 2, 3, 5]),
  ㅖ: dotsToBrailleChar([3, 4]),
  ㅘ: dotsToBrailleChar([1, 2, 3, 6]),
  ㅙ: dotsToBrailleChar([1, 2, 3, 6]) + dotsToBrailleChar([1, 2, 3, 5]),
  ㅚ: dotsToBrailleChar([1, 3, 4, 5, 6]),
  ㅝ: dotsToBrailleChar([1, 2, 3, 4, 5]),
  ㅞ: dotsToBrailleChar([1, 2, 3, 4, 5]) + dotsToBrailleChar([1, 2, 3, 5]),
  ㅟ: dotsToBrailleChar([1, 2, 3, 4]) + dotsToBrailleChar([1, 2, 3, 5]),
  ㅢ: dotsToBrailleChar([2, 4, 5, 6]),
};

// 종성 (Final Consonants)
export const KOREAN_JONGSUNG_BRAILLE: Record<string, string> = {
  '': '',
  ㄱ: dotsToBrailleChar([1]),
  ㄴ: dotsToBrailleChar([2, 5]),
  ㄷ: dotsToBrailleChar([3, 5]),
  ㄹ: dotsToBrailleChar([2]),
  ㅁ: dotsToBrailleChar([2, 6]),
  ㅂ: dotsToBrailleChar([1, 2]),
  ㅅ: dotsToBrailleChar([3]),
  ㅇ: dotsToBrailleChar([2, 3, 5, 6]),
  ㅈ: dotsToBrailleChar([1, 3]),
  ㅊ: dotsToBrailleChar([2, 3]),
  ㅋ: dotsToBrailleChar([2, 3, 5]),
  ㅌ: dotsToBrailleChar([2, 3, 6]),
  ㅍ: dotsToBrailleChar([2, 5, 6]),
  ㅎ: dotsToBrailleChar([3, 5, 6]),

  // 쌍/겹받침
  ㄲ: dotsToBrailleChar([1]) + dotsToBrailleChar([1]),
  ㄳ: dotsToBrailleChar([1]) + dotsToBrailleChar([3]),
  ㄵ: dotsToBrailleChar([2, 5]) + dotsToBrailleChar([1, 3]),
  ㄶ: dotsToBrailleChar([2, 5]) + dotsToBrailleChar([3, 5, 6]),
  ㄺ: dotsToBrailleChar([2]) + dotsToBrailleChar([1]),
  ㄻ: dotsToBrailleChar([2]) + dotsToBrailleChar([2, 6]),
  ㄼ: dotsToBrailleChar([2]) + dotsToBrailleChar([1, 2]),
  ㄽ: dotsToBrailleChar([2]) + dotsToBrailleChar([3]),
  ㄾ: dotsToBrailleChar([2]) + dotsToBrailleChar([2, 3, 6]),
  ㄿ: dotsToBrailleChar([2]) + dotsToBrailleChar([2, 5, 6]),
  ㅀ: dotsToBrailleChar([2]) + dotsToBrailleChar([3, 5, 6]),
  ㅄ: dotsToBrailleChar([1, 2]) + dotsToBrailleChar([3]),
  ㅆ: dotsToBrailleChar([3, 4]),
};

// 약자 (Korean Contractions)
export const KOREAN_ABBREVIATIONS: Record<string, string> = {
  가: dotsToBrailleChar([1, 2, 4, 6]),
  사: dotsToBrailleChar([1, 2, 3]),
  나: dotsToBrailleChar([1, 4]),
  다: dotsToBrailleChar([2, 4]),
  마: dotsToBrailleChar([1, 5]),
  바: dotsToBrailleChar([4, 5]),
  자: dotsToBrailleChar([4, 6]),
  카: dotsToBrailleChar([1, 2, 4]),
  타: dotsToBrailleChar([1, 2, 5]),
  파: dotsToBrailleChar([1, 4, 5]),
  하: dotsToBrailleChar([2, 4, 5]),
  것: dotsToBrailleChar([4, 5, 6]) + dotsToBrailleChar([2, 3, 4]),
  억: dotsToBrailleChar([1, 4, 5, 6]),
  언: dotsToBrailleChar([2, 4, 5, 6]),
  얼: dotsToBrailleChar([2, 3, 4, 5, 6]),
  연: dotsToBrailleChar([1, 6]),
  열: dotsToBrailleChar([1, 2, 5, 6]),
  영: dotsToBrailleChar([1, 2, 4, 5, 6]),
  옥: dotsToBrailleChar([1, 3, 4, 6]),
  온: dotsToBrailleChar([1, 2, 3, 5, 6]),
  옹: dotsToBrailleChar([1, 2, 3, 4, 5, 6]),
  운: dotsToBrailleChar([1, 2, 4, 5]),
  울: dotsToBrailleChar([1, 2, 3, 4, 6]),
  은: dotsToBrailleChar([1, 3, 5, 6]),
  을: dotsToBrailleChar([2, 3, 4, 6]),
  인: dotsToBrailleChar([1, 3, 4, 5]),
};

// English Letters (A-Z)
export const ENGLISH_BRAILLE: Record<string, string> = {
  A: dotsToBrailleChar([1]),
  B: dotsToBrailleChar([1, 2]),
  C: dotsToBrailleChar([1, 4]),
  D: dotsToBrailleChar([1, 4, 5]),
  E: dotsToBrailleChar([1, 5]),
  F: dotsToBrailleChar([1, 2, 4]),
  G: dotsToBrailleChar([1, 2, 4, 5]),
  H: dotsToBrailleChar([1, 2, 5]),
  I: dotsToBrailleChar([2, 4]),
  J: dotsToBrailleChar([2, 4, 5]),
  K: dotsToBrailleChar([1, 3]),
  L: dotsToBrailleChar([1, 2, 3]),
  M: dotsToBrailleChar([1, 3, 4]),
  N: dotsToBrailleChar([1, 3, 4, 5]),
  O: dotsToBrailleChar([1, 3, 5]),
  P: dotsToBrailleChar([1, 2, 3, 4]),
  Q: dotsToBrailleChar([1, 2, 3, 4, 5]),
  R: dotsToBrailleChar([1, 2, 3, 5]),
  S: dotsToBrailleChar([2, 3, 4]),
  T: dotsToBrailleChar([2, 3, 4, 5]),
  U: dotsToBrailleChar([1, 3, 6]),
  V: dotsToBrailleChar([1, 2, 3, 6]),
  W: dotsToBrailleChar([2, 4, 5, 6]),
  X: dotsToBrailleChar([1, 3, 4, 6]),
  Y: dotsToBrailleChar([1, 3, 4, 5, 6]),
  Z: dotsToBrailleChar([1, 3, 5, 6]),
};

// Numbers (0-9 with Number Indicator ⠼: 3,4,5,6)
export const NUMBER_SIGN = dotsToBrailleChar([3, 4, 5, 6]);
export const CAPITAL_SIGN = dotsToBrailleChar([6]); // 대문자표
export const ROMAN_SIGN = dotsToBrailleChar([3, 5, 6]); // 로마자표

export const NUMBER_BRAILLE: Record<string, string> = {
  '1': dotsToBrailleChar([1]),
  '2': dotsToBrailleChar([1, 2]),
  '3': dotsToBrailleChar([1, 4]),
  '4': dotsToBrailleChar([1, 4, 5]),
  '5': dotsToBrailleChar([1, 5]),
  '6': dotsToBrailleChar([1, 2, 4]),
  '7': dotsToBrailleChar([1, 2, 4, 5]),
  '8': dotsToBrailleChar([1, 2, 5]),
  '9': dotsToBrailleChar([2, 4]),
  '0': dotsToBrailleChar([2, 4, 5]),
};

// Punctuation
export const PUNCTUATION_BRAILLE: Record<string, string> = {
  '.': dotsToBrailleChar([2, 5, 6]),
  ',': dotsToBrailleChar([5]),
  '?': dotsToBrailleChar([2, 3, 6]),
  '!': dotsToBrailleChar([2, 3, 5]),
  ':': dotsToBrailleChar([2, 5]),
  ';': dotsToBrailleChar([2, 3]),
  '-': dotsToBrailleChar([3, 6]),
  '(': dotsToBrailleChar([2, 3, 6]),
  ')': dotsToBrailleChar([3, 5, 6]),
  '"': dotsToBrailleChar([2, 3, 5, 6]),
  ' ': ' ',
};

// ----------------------------------------------------------------------
// 3. Translation Functions (Text -> Braille & Braille -> Text)
// ----------------------------------------------------------------------

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];
const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

export function textToBraille(text: string): string {
  if (!text) return '';

  let result = '';
  let inNumberMode = false;
  let inRomanMode = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // 1. Korean Hangul Syllable
    if (code >= 0xac00 && code <= 0xd7a3) {
      inNumberMode = false;
      inRomanMode = false;

      // Check abbreviation first (e.g. 가, 사, 나, 것, 영 등)
      if (KOREAN_ABBREVIATIONS[char]) {
        result += KOREAN_ABBREVIATIONS[char];
        continue;
      }

      const offset = code - 0xac00;
      const choIdx = Math.floor(offset / 588);
      const jungIdx = Math.floor((offset % 588) / 28);
      const jongIdx = offset % 28;

      const cho = CHOSUNG[choIdx];
      const jung = JUNGSUNG[jungIdx];
      const jong = JONGSUNG[jongIdx];

      // Korean special rule: '나, 다, 마, 바, 자, 카, 타, 파, 하' abbreviation + Jongsung
      const choJung = String.fromCharCode(0xac00 + (choIdx * 21 + 0) * 28);
      if (jung === 'ㅏ' && KOREAN_ABBREVIATIONS[choJung] && jongIdx > 0) {
        result += KOREAN_ABBREVIATIONS[choJung] + (KOREAN_JONGSUNG_BRAILLE[jong] || '');
        continue;
      }

      result +=
        (KOREAN_CHOSUNG_BRAILLE[cho] || '') +
        (KOREAN_JUNGSUNG_BRAILLE[jung] || '') +
        (KOREAN_JONGSUNG_BRAILLE[jong] || '');
    }
    // 2. Numbers (0-9)
    else if (char >= '0' && char <= '9') {
      if (!inNumberMode) {
        result += NUMBER_SIGN;
        inNumberMode = true;
      }
      inRomanMode = false;
      result += NUMBER_BRAILLE[char] || '';
    }
    // 3. English Alphabet (A-Z, a-z)
    else if ((char >= 'a' && char <= 'z') || (char >= 'A' && char <= 'Z')) {
      inNumberMode = false;
      if (!inRomanMode) {
        result += ROMAN_SIGN;
        inRomanMode = true;
      }
      const upper = char.toUpperCase();
      if (char >= 'A' && char <= 'Z') {
        result += CAPITAL_SIGN;
      }
      result += ENGLISH_BRAILLE[upper] || '';
    }
    // 4. Standalone Hangul Jamo
    else if (KOREAN_CHOSUNG_BRAILLE[char]) {
      inNumberMode = false;
      inRomanMode = false;
      result += KOREAN_CHOSUNG_BRAILLE[char];
    } else if (KOREAN_JUNGSUNG_BRAILLE[char]) {
      inNumberMode = false;
      inRomanMode = false;
      result += KOREAN_JUNGSUNG_BRAILLE[char];
    }
    // 5. Punctuations & Spaces
    else if (PUNCTUATION_BRAILLE[char]) {
      inNumberMode = false;
      inRomanMode = false;
      result += PUNCTUATION_BRAILLE[char];
    }
    // 6. Whitespace / Newline
    else if (char === '\n') {
      inNumberMode = false;
      inRomanMode = false;
      result += '\n';
    } else {
      inNumberMode = false;
      inRomanMode = false;
      result += char;
    }
  }

  return result;
}

/**
 * Checks if input is braille Unicode characters.
 */
export function isBrailleText(text: string): boolean {
  if (!text.trim()) return false;
  let brailleCount = 0;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if (code >= 0x2800 && code <= 0x283f) {
      brailleCount += 1;
    }
  }
  return brailleCount > text.trim().length * 0.4;
}
