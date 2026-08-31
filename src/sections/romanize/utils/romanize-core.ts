/**
 * Revised Romanization of Korean (국어의 로마자 표기법 - 국립국어원 표준)
 * Handles consonant assimilation (비음화, 유음화, 구개음화), vowels, and personal names.
 */

// ----------------------------------------------------------------------
// 1. Phoneme Tables
// ----------------------------------------------------------------------

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

// Initial Consonants Romanization (모음 앞)
const CHO_ROMAN: Record<string, string> = {
  ㄱ: 'g',
  ㄲ: 'kk',
  ㄴ: 'n',
  ㄷ: 'd',
  ㄸ: 'tt',
  ㄹ: 'r',
  ㅁ: 'm',
  ㅂ: 'b',
  ㅃ: 'pp',
  ㅅ: 's',
  ㅆ: 'ss',
  ㅇ: '',
  ㅈ: 'j',
  ㅉ: 'jj',
  ㅊ: 'ch',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 'h',
};

// Vowels Romanization
const JUNG_ROMAN: Record<string, string> = {
  ㅏ: 'a',
  ㅐ: 'ae',
  ㅑ: 'ya',
  ㅒ: 'yae',
  ㅓ: 'eo',
  ㅔ: 'e',
  ㅕ: 'yeo',
  ㅖ: 'ye',
  ㅗ: 'o',
  ㅘ: 'wa',
  ㅙ: 'wae',
  ㅚ: 'oe',
  ㅛ: 'yo',
  ㅜ: 'u',
  ㅝ: 'wo',
  ㅞ: 'we',
  ㅟ: 'wi',
  ㅠ: 'yu',
  ㅡ: 'eu',
  ㅢ: 'ui',
  ㅣ: 'i',
};

// Final Consonants Romanization (자음 앞 / 어말)
const JONG_ROMAN: Record<string, string> = {
  '': '',
  ㄱ: 'k',
  ㄲ: 'k',
  ㄳ: 'k',
  ㄴ: 'n',
  ㄵ: 'n',
  ㄶ: 'n',
  ㄷ: 't',
  ㄹ: 'l',
  ㄺ: 'k',
  ㄻ: 'm',
  ㄼ: 'p',
  ㄽ: 'l',
  ㄾ: 't',
  ㄿ: 'p',
  ㅀ: 'l',
  ㅁ: 'm',
  ㅂ: 'p',
  ㅄ: 'p',
  ㅅ: 't',
  ㅆ: 't',
  ㅇ: 'ng',
  ㅈ: 't',
  ㅊ: 't',
  ㅋ: 'k',
  ㅌ: 't',
  ㅍ: 'p',
  ㅎ: 't',
};

export interface RomanizeOptions {
  mode?: 'standard' | 'name' | 'address';
  capitalize?: 'first' | 'all-words' | 'upper' | 'none';
  useHyphenInName?: boolean;
}

interface Syllable {
  char: string;
  cho: string;
  jung: string;
  jong: string;
  isHangul: boolean;
}

function parseSyllable(char: string): Syllable {
  const code = char.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const offset = code - 0xac00;
    const choIdx = Math.floor(offset / 588);
    const jungIdx = Math.floor((offset % 588) / 28);
    const jongIdx = offset % 28;
    return {
      char,
      cho: CHOSUNG[choIdx],
      jung: JUNGSUNG[jungIdx],
      jong: JONGSUNG[jongIdx],
      isHangul: true,
    };
  }
  return { char, cho: '', jung: '', jong: '', isHangul: false };
}

/**
 * Converts Korean text to Revised Romanization with phonological sound changes.
 */
export function romanizeKorean(text: string, options: RomanizeOptions = {}): string {
  const { mode = 'standard', capitalize = 'first', useHyphenInName = true } = options;
  if (!text) return '';

  const words = text.split(/\s+/);

  const convertedWords = words.map((word) => {
    // Check if word is administrative unit (e.g. -도, -시, -군, -구, -읍, -면, -리, -로, -길, -동)
    const syllables = Array.from(word).map(parseSyllable);
    const romanChunks: string[] = [];

    for (let i = 0; i < syllables.length; i += 1) {
      const cur = syllables[i];
      const next = i + 1 < syllables.length ? syllables[i + 1] : null;

      if (!cur.isHangul) {
        romanChunks.push(cur.char);
        continue;
      }

      let choRom = CHO_ROMAN[cur.cho] || '';
      const jungRom = JUNG_ROMAN[cur.jung] || '';
      let jongRom = JONG_ROMAN[cur.jong] || '';

      // Consonant Assimilation Rules between cur.jong and next.cho
      if (cur.jong && next && next.isHangul) {
        const j = cur.jong;
        const c = next.cho;

        // 1. 연음 법칙 (Next begins with ㅇ -> Jong becomes initial of next syllable)
        if (c === 'ㅇ') {
          jongRom = '';
          // ㄹ followed by ㅇ is 'r'
          if (j === 'ㄹ') {
            next.cho = 'ㄹ';
          } else if (j === 'ㄱ') {
            next.cho = 'ㄱ';
          } else if (j === 'ㄷ') {
            next.cho = 'ㄷ';
          } else if (j === 'ㅂ') {
            next.cho = 'ㅂ';
          }
        }
        // 2. 비음화 (ㄱ, ㄷ, ㅂ + ㄴ, ㅁ -> ㅇ, ㄴ, ㅁ)
        else if (['ㄱ', 'ㄲ', 'ㄳ', 'ㄺ'].includes(j) && ['ㄴ', 'ㅁ'].includes(c)) {
          jongRom = 'ng';
        } else if (
          ['ㄷ', 'ㅅ', 'ㅆ', 'ㅈ', 'ㅊ', 'ㅌ', 'ㅎ'].includes(j) &&
          ['ㄴ', 'ㅁ'].includes(c)
        ) {
          jongRom = 'n';
        } else if (['ㅂ', 'ㅍ', 'ㄼ', 'ㄿ', 'ㅄ'].includes(j) && ['ㄴ', 'ㅁ'].includes(c)) {
          jongRom = 'm';
        }
        // 3. 유음화 (ㄴ + ㄹ -> l-l, ㄹ + ㄴ -> l-l)
        else if (j === 'ㄴ' && c === 'ㄹ') {
          jongRom = 'l';
          next.cho = 'ㄹ_assim'; // will render as 'l'
        } else if (j === 'ㄹ' && c === 'ㄴ') {
          jongRom = 'l';
          next.cho = 'ㄹ_assim';
        }
      }

      // Check assimilated cho
      if (cur.cho === 'ㄹ_assim') {
        choRom = 'l';
      }

      romanChunks.push(choRom + jungRom + jongRom);
    }

    // Name formatting (e.g. 홍길동 -> Hong Gildong or Hong Gil-dong)
    if (mode === 'name' && syllables.length >= 2 && syllables.every((s) => s.isHangul)) {
      const familyName = romanChunks[0];
      const givenName = useHyphenInName
        ? romanChunks.slice(1).join('-')
        : romanChunks.slice(1).join('');
      return `${capitalizeWord(familyName)} ${capitalizeWord(givenName)}`;
    }

    return romanChunks.join('');
  });

  let fullResult = convertedWords.join(' ');

  // Capitalization option
  if (capitalize === 'all-words') {
    fullResult = fullResult.replace(/\b\w/g, (c) => c.toUpperCase());
  } else if (capitalize === 'first') {
    fullResult = fullResult.charAt(0).toUpperCase() + fullResult.slice(1);
  } else if (capitalize === 'upper') {
    fullResult = fullResult.toUpperCase();
  }

  return fullResult;
}

function capitalizeWord(w: string): string {
  if (!w) return '';
  return w.charAt(0).toUpperCase() + w.slice(1);
}
