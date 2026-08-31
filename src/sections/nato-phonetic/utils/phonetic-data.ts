/**
 * NATO / ICAO Phonetic Alphabet & Korean Police/Military Radio Call Sign Table
 */

export interface PhoneticItem {
  char: string;
  word: string;
  pronunciation: string;
  morse: string;
  meaning?: string;
}

// ICAO / NATO Phonetic Alphabet
export const NATO_ALPHABET_MAP: Record<string, PhoneticItem> = {
  A: { char: 'A', word: 'Alfa', pronunciation: 'AL-FAH', morse: '.-' },
  B: { char: 'B', word: 'Bravo', pronunciation: 'BRAH-VOH', morse: '-...' },
  C: { char: 'C', word: 'Charlie', pronunciation: 'CHAR-LEE', morse: '-.-.' },
  D: { char: 'D', word: 'Delta', pronunciation: 'DELL-TAH', morse: '-..' },
  E: { char: 'E', word: 'Echo', pronunciation: 'ECK-OH', morse: '.' },
  F: { char: 'F', word: 'Foxtrot', pronunciation: 'FOKS-TROT', morse: '..-.' },
  G: { char: 'G', word: 'Golf', pronunciation: 'GOLF', morse: '--.' },
  H: { char: 'H', word: 'Hotel', pronunciation: 'HOH-TELL', morse: '....' },
  I: { char: 'I', word: 'India', pronunciation: 'IN-DEE-AH', morse: '..' },
  J: { char: 'J', word: 'Juliett', pronunciation: 'JEW-LEE-ETT', morse: '.---' },
  K: { char: 'K', word: 'Kilo', pronunciation: 'KEY-LOH', morse: '-.-' },
  L: { char: 'L', word: 'Lima', pronunciation: 'LEE-MAH', morse: '.-..' },
  M: { char: 'M', word: 'Mike', pronunciation: 'MIKE', morse: '--' },
  N: { char: 'N', word: 'November', pronunciation: 'NO-VEM-BER', morse: '-.' },
  O: { char: 'O', word: 'Oscar', pronunciation: 'OSS-CAH', morse: '---' },
  P: { char: 'P', word: 'Papa', pronunciation: 'PAH-PAH', morse: '.--.' },
  Q: { char: 'Q', word: 'Quebec', pronunciation: 'KEH-BECK', morse: '--.-' },
  R: { char: 'R', word: 'Romeo', pronunciation: 'ROW-ME-OH', morse: '.-.' },
  S: { char: 'S', word: 'Sierra', pronunciation: 'SEE-AIR-RAH', morse: '...' },
  T: { char: 'T', word: 'Tango', pronunciation: 'TANG-GO', morse: '-' },
  U: { char: 'U', word: 'Uniform', pronunciation: 'YOU-NEE-FORM', morse: '..-' },
  V: { char: 'V', word: 'Victor', pronunciation: 'VIK-TAH', morse: '...-' },
  W: { char: 'W', word: 'Whiskey', pronunciation: 'WISS-KEY', morse: '.--' },
  X: { char: 'X', word: 'X-ray', pronunciation: 'ECKS-RAY', morse: '-..-' },
  Y: { char: 'Y', word: 'Yankee', pronunciation: 'YANG-KEY', morse: '-.--' },
  Z: { char: 'Z', word: 'Zulu', pronunciation: 'ZOO-LOO', morse: '--..' },
};

// Aviation / Military Number Phonetics
export const NATO_NUMBER_MAP: Record<string, PhoneticItem> = {
  '0': { char: '0', word: 'Zero', pronunciation: 'ZE-RO', morse: '-----' },
  '1': { char: '1', word: 'Wun', pronunciation: 'WUN', morse: '.----' },
  '2': { char: '2', word: 'Too', pronunciation: 'TOO', morse: '..---' },
  '3': { char: '3', word: 'Tree', pronunciation: 'TREE', morse: '...--' },
  '4': { char: '4', word: 'Fower', pronunciation: 'FOW-ER', morse: '....-' },
  '5': { char: '5', word: 'Fife', pronunciation: 'FIFE', morse: '.....' },
  '6': { char: '6', word: 'Six', pronunciation: 'SIX', morse: '-....' },
  '7': { char: '7', word: 'Seven', pronunciation: 'SEV-EN', morse: '--...' },
  '8': { char: '8', word: 'Eight', pronunciation: 'AIT', morse: '---..' },
  '9': { char: '9', word: 'Niner', pronunciation: 'NIN-ER', morse: '----.' },
};

// Korean Police / Military Radio Call Sign Table (국문 경찰 및 군 무선 통화표)
export const KOREAN_PHONETIC_MAP: Record<string, PhoneticItem> = {
  // 자음
  ㄱ: { char: 'ㄱ', word: '기러기', pronunciation: '기러기', morse: '.-..' },
  ㄴ: { char: 'ㄴ', word: '나비', pronunciation: '나비', morse: '..-.' },
  ㄷ: { char: 'ㄷ', word: '도라지', pronunciation: '도라지', morse: '-...' },
  ㄹ: { char: 'ㄹ', word: '로마', pronunciation: '로마', morse: '...-' },
  ㅁ: { char: 'ㅁ', word: '미나리', pronunciation: '미나리', morse: '--' },
  ㅂ: { char: 'ㅂ', word: '바가지', pronunciation: '바가지', morse: '.--' },
  ㅅ: { char: 'ㅅ', word: '서울', pronunciation: '서울', morse: '--.' },
  ㅇ: { char: 'ㅇ', word: '잉어', pronunciation: '잉어', morse: '-.-' },
  ㅈ: { char: 'ㅈ', word: '지게', pronunciation: '지게', morse: '.---' },
  ㅊ: { char: 'ㅊ', word: '치마', pronunciation: '치마', morse: '-.-.' },
  ㅋ: { char: 'ㅋ', word: '키다리', pronunciation: '키다리', morse: '-..-' },
  ㅌ: { char: 'ㅌ', word: '통일', pronunciation: '통일', morse: '--..' },
  ㅍ: { char: 'ㅍ', word: '파고다', pronunciation: '파고다', morse: '---' },
  ㅎ: { char: 'ㅎ', word: '한강', pronunciation: '한강', morse: '.--.' },

  // 모음
  ㅏ: { char: 'ㅏ', word: '아버지', pronunciation: '아버지', morse: '.' },
  ㅑ: { char: 'ㅑ', word: '야구', pronunciation: '야구', morse: '..' },
  ㅓ: { char: 'ㅓ', word: '어머니', pronunciation: '어머니', morse: '-' },
  ㅕ: { char: 'ㅕ', word: '연못', pronunciation: '연못', morse: '...' },
  ㅗ: { char: 'ㅗ', word: '오징어', pronunciation: '오징어', morse: '.-' },
  ㅛ: { char: 'ㅛ', word: '요지', pronunciation: '요지', morse: '-.' },
  ㅜ: { char: 'ㅜ', word: '우체국', pronunciation: '우체국', morse: '....' },
  ㅠ: { char: 'ㅠ', word: '유달산', pronunciation: '유달산', morse: '.-.' },
  ㅡ: { char: 'ㅡ', word: '은하수', pronunciation: '은하수', morse: '-..' },
  ㅣ: { char: 'ㅣ', word: '이순신', pronunciation: '이순신', morse: '..-' },
  ㅐ: { char: 'ㅐ', word: '앵무새', pronunciation: '앵무새', morse: '--.-' },
  ㅔ: { char: 'ㅔ', word: '엑스레이', pronunciation: '엑스레이', morse: '-.-.' },
};

// Korean Number Call Signs
export const KOREAN_NUMBER_MAP: Record<string, PhoneticItem> = {
  '0': { char: '0', word: '공 (영)', pronunciation: '공', morse: '-----' },
  '1': { char: '1', word: '하나 (일)', pronunciation: '하나', morse: '.----' },
  '2': { char: '2', word: '둘 (이)', pronunciation: '둘', morse: '..---' },
  '3': { char: '3', word: '삼 (셋)', pronunciation: '삼', morse: '...--' },
  '4': { char: '4', word: '넷 (사)', pronunciation: '넷', morse: '....-' },
  '5': { char: '5', word: '다섯 (오)', pronunciation: '다섯', morse: '.....' },
  '6': { char: '6', word: '여섯 (육)', pronunciation: '여섯', morse: '-....' },
  '7': { char: '7', word: '칠 (일곱)', pronunciation: '칠', morse: '--...' },
  '8': { char: '8', word: '팔 (여덟)', pronunciation: '팔', morse: '---..' },
  '9': { char: '9', word: '아홉 (구)', pronunciation: '아홉', morse: '----.' },
};

const CHOSUNG = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
const JUNGSUNG = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
];
const JONGSUNG = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];

/**
 * Converts text string to sequence of Phonetic items.
 */
export function textToPhoneticList(text: string): PhoneticItem[] {
  const result: PhoneticItem[] = [];

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const upper = char.toUpperCase();
    const code = char.charCodeAt(0);

    // 1. English
    if (NATO_ALPHABET_MAP[upper]) {
      result.push(NATO_ALPHABET_MAP[upper]);
    }
    // 2. Numbers
    else if (NATO_NUMBER_MAP[char]) {
      result.push(NATO_NUMBER_MAP[char]);
    }
    // 3. Korean Hangul Syllable
    else if (code >= 0xac00 && code <= 0xd7a3) {
      const offset = code - 0xac00;
      const choIdx = Math.floor(offset / 588);
      const jungIdx = Math.floor((offset % 588) / 28);
      const jongIdx = offset % 28;

      const cho = CHOSUNG[choIdx];
      const jung = JUNGSUNG[jungIdx];
      const jong = JONGSUNG[jongIdx];

      if (KOREAN_PHONETIC_MAP[cho]) result.push(KOREAN_PHONETIC_MAP[cho]);
      if (KOREAN_PHONETIC_MAP[jung]) result.push(KOREAN_PHONETIC_MAP[jung]);
      if (jong && KOREAN_PHONETIC_MAP[jong]) result.push(KOREAN_PHONETIC_MAP[jong]);
    }
    // 4. Standalone Jamo
    else if (KOREAN_PHONETIC_MAP[char]) {
      result.push(KOREAN_PHONETIC_MAP[char]);
    }
    // 5. Space
    else if (char === ' ') {
      result.push({ char: ' ', word: '[공백]', pronunciation: '', morse: '/' });
    }
    // 6. Other symbols
    else {
      result.push({ char, word: char, pronunciation: char, morse: '' });
    }
  }

  return result;
}
