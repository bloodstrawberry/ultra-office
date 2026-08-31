/**
 * QWERTY <-> Korean 2-Set (두벌식) Keyboard Typo Recovery Engine
 * Recombines decomposed Jamos into Hangul syllables using a full automata.
 */

// ----------------------------------------------------------------------
// 1. QWERTY to 2-Set Jamo Mapping
// ----------------------------------------------------------------------

export const ENG_TO_KOR_MAP: Record<string, string> = {
  q: 'ㅂ',
  w: 'ㅈ',
  e: 'ㄷ',
  r: 'ㄱ',
  t: 'ㅅ',
  y: 'ㅛ',
  u: 'ㅕ',
  i: 'ㅑ',
  o: 'ㅐ',
  p: 'ㅔ',
  a: 'ㅁ',
  s: 'ㄴ',
  d: 'ㅇ',
  f: 'ㄹ',
  g: 'ㅎ',
  h: 'ㅗ',
  j: 'ㅓ',
  k: 'ㅏ',
  l: 'ㅣ',
  z: 'ㅋ',
  x: 'ㅌ',
  c: 'ㅊ',
  v: 'ㅍ',
  b: 'ㅠ',
  n: 'ㅜ',
  m: 'ㅡ',
  Q: 'ㅃ',
  W: 'ㅉ',
  E: 'ㄸ',
  R: 'ㄲ',
  T: 'ㅆ',
  O: 'ㅒ',
  P: 'ㅖ',
};

// 2-Set Jamo to QWERTY
export const KOR_TO_ENG_MAP: Record<string, string> = {};
Object.entries(ENG_TO_KOR_MAP).forEach(([eng, kor]) => {
  KOR_TO_ENG_MAP[kor] = eng;
});

// Complex vowels assembly (ㅗ+ㅏ = ㅘ, ㅜ+ㅓ = ㅝ, ㅡ+ㅣ = ㅢ 등)
export const COMPOUND_VOWELS: Record<string, string> = {
  ㅗㅏ: 'ㅘ',
  ㅗㅐ: 'ㅙ',
  ㅗㅣ: 'ㅚ',
  ㅜㅓ: 'ㅝ',
  ㅜㅔ: 'ㅞ',
  ㅜㅣ: 'ㅟ',
  ㅡㅣ: 'ㅢ',
};

// Complex final consonants (ㄱ+ㅅ = ㄳ, ㄹ+ㄱ = ㄺ 등)
export const COMPLEX_JONGSUNG: Record<string, string> = {
  ㄱㅅ: 'ㄳ',
  ㄴㅈ: 'ㄵ',
  ㄴㅎ: 'ㄶ',
  ㄹㄱ: 'ㄺ',
  ㄹㅁ: 'ㄻ',
  ㄹㅂ: 'ㄼ',
  ㄹㅅ: 'ㄽ',
  ㄹㅌ: 'ㄾ',
  ㄹㅍ: 'ㄿ',
  ㄹㅎ: 'ㅀ',
  ㅂㅅ: 'ㅄ',
};

const CHOSUNG = [
  'ㄱ',
  'ㄲ',
  'ㄴ',
  'ㄷ',
  'ㄸ',
  'ㄹ',
  'ㅁ',
  'ㅂ',
  'ㅃ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅉ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];
const JUNGSUNG = [
  'ㅏ',
  'ㅐ',
  'ㅑ',
  'ㅒ',
  'ㅓ',
  'ㅔ',
  'ㅕ',
  'ㅖ',
  'ㅗ',
  'ㅘ',
  'ㅙ',
  'ㅚ',
  'ㅛ',
  'ㅜ',
  'ㅝ',
  'ㅞ',
  'ㅟ',
  'ㅠ',
  'ㅡ',
  'ㅢ',
  'ㅣ',
];
const JONGSUNG = [
  '',
  'ㄱ',
  'ㄲ',
  'ㄳ',
  'ㄴ',
  'ㄵ',
  'ㄶ',
  'ㄷ',
  'ㄹ',
  'ㄺ',
  'ㄻ',
  'ㄼ',
  'ㄽ',
  'ㄾ',
  'ㄿ',
  'ㅀ',
  'ㅁ',
  'ㅂ',
  'ㅄ',
  'ㅅ',
  'ㅆ',
  'ㅇ',
  'ㅈ',
  'ㅊ',
  'ㅋ',
  'ㅌ',
  'ㅍ',
  'ㅎ',
];

// ----------------------------------------------------------------------
// 2. Automata: Assemble Jamo Array to Hangul Text
// ----------------------------------------------------------------------

export function assembleJamoArray(jamos: string[]): string {
  let result = '';
  let i = 0;

  while (i < jamos.length) {
    const cur = jamos[i];

    // Check if cur is a valid Chosung
    const choIdx = CHOSUNG.indexOf(cur);
    if (choIdx !== -1 && i + 1 < jamos.length && JUNGSUNG.includes(jamos[i + 1])) {
      let vowel = jamos[i + 1];
      let advance = 2;

      // Check if next 2 vowels can form compound vowel (e.g. ㅗ + ㅏ = ㅘ)
      if (i + 2 < jamos.length && COMPOUND_VOWELS[vowel + jamos[i + 2]]) {
        vowel = COMPOUND_VOWELS[vowel + jamos[i + 2]];
        advance = 3;
      }

      const jungIdx = JUNGSUNG.indexOf(vowel);
      let jongIdx = 0;

      // Check potential Jongsung
      const nextIdx = i + advance;
      if (nextIdx < jamos.length && JONGSUNG.includes(jamos[nextIdx])) {
        // If the consonant is followed by a vowel, it belongs to the next syllable!
        const nextNextIdx = nextIdx + 1;
        const followedByVowel = nextNextIdx < jamos.length && JUNGSUNG.includes(jamos[nextNextIdx]);

        if (!followedByVowel) {
          let testJong = jamos[nextIdx];
          let jongAdvance = 1;

          // Check complex final consonant (e.g. ㄹ + ㄱ = ㄺ)
          if (nextIdx + 1 < jamos.length && COMPLEX_JONGSUNG[testJong + jamos[nextIdx + 1]]) {
            const nextFollowedByVowel =
              nextIdx + 2 < jamos.length && JUNGSUNG.includes(jamos[nextIdx + 2]);
            if (!nextFollowedByVowel) {
              testJong = COMPLEX_JONGSUNG[testJong + jamos[nextIdx + 1]];
              jongAdvance = 2;
            }
          }

          const matchedJongIdx = JONGSUNG.indexOf(testJong);
          if (matchedJongIdx !== -1) {
            jongIdx = matchedJongIdx;
            advance += jongAdvance;
          }
        }
      }

      const unicode = 0xac00 + (choIdx * 21 + jungIdx) * 28 + jongIdx;
      result += String.fromCharCode(unicode);
      i += advance;
    } else {
      result += cur;
      i += 1;
    }
  }

  return result;
}

// ----------------------------------------------------------------------
// 3. Conversion APIs (Eng -> Kor / Kor -> Eng / Auto-Detect)
// ----------------------------------------------------------------------

/**
 * Converts English QWERTY mistyped string to Korean Hangul. (gksrmf -> 한글)
 */
export function engToKor(text: string): string {
  if (!text) return '';

  const jamos: string[] = [];
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (ENG_TO_KOR_MAP[char]) {
      jamos.push(ENG_TO_KOR_MAP[char]);
    } else {
      jamos.push(char);
    }
  }

  return assembleJamoArray(jamos);
}

/**
 * Converts Korean Hangul string to English QWERTY mistyped string. (한글 -> gksrmf)
 */
export function korToEng(text: string): string {
  if (!text) return '';

  let result = '';

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const code = char.charCodeAt(0);

    // Hangul Syllable
    if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const choIdx = Math.floor(offset / 588);
      const jungIdx = Math.floor((offset % 588) / 28);
      const jongIdx = offset % 28;

      const cho = CHOSUNG[choIdx];
      const jung = JUNGSUNG[jungIdx];
      const jong = JONGSUNG[jongIdx];

      result += KOR_TO_ENG_MAP[cho] || cho;

      // Handle compound vowels
      result += KOR_TO_ENG_MAP[jung] || jung;

      // Handle final consonants
      if (jong) {
        result += KOR_TO_ENG_MAP[jong] || jong;
      }
    }
    // Standalone Jamo
    else if (KOR_TO_ENG_MAP[char]) {
      result += KOR_TO_ENG_MAP[char];
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Automatically detects whether input is primarily English QWERTY or Korean Hangul.
 */
export function autoConvertTypo(text: string): {
  converted: string;
  mode: 'eng-to-kor' | 'kor-to-eng';
} {
  let engCount = 0;
  let korCount = 0;

  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    if ((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
      engCount += 1;
    } else if (code >= 0xac00 && code <= 0xd7a3) {
      korCount += 1;
    }
  }

  if (engCount >= korCount) {
    return { converted: engToKor(text), mode: 'eng-to-kor' };
  }
  return { converted: korToEng(text), mode: 'kor-to-eng' };
}
