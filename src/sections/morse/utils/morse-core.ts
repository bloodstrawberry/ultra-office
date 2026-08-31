/**
 * Morse Code Core Utility
 * Supports Standard Korean Morse (SKATS / 국문 전신 부호),
 * International Morse (국제 모스 부호), Hangul Automata Assembly,
 * Audio Timing calculation, and WAV Audio Generation.
 */

// ----------------------------------------------------------------------
// 1. Hangul Unicode Tables & Constants
// ----------------------------------------------------------------------

export const HANGUL_CHOSUNG = [
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

export const HANGUL_JUNGSUNG = [
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

export const HANGUL_JONGSUNG = [
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

// Complex Jamo Decompositions for standard Morse transmission
export const COMPLEX_JONGSUNG_MAP: Record<string, string[]> = {
  ㄳ: ['ㄱ', 'ㅅ'],
  ㄵ: ['ㄴ', 'ㅈ'],
  ㄶ: ['ㄴ', 'ㅎ'],
  ㄺ: ['ㄹ', 'ㄱ'],
  ㄻ: ['ㄹ', 'ㅁ'],
  ㄼ: ['ㄹ', 'ㅂ'],
  ㄽ: ['ㄹ', 'ㅅ'],
  ㄾ: ['ㄹ', 'ㅌ'],
  ㄿ: ['ㄹ', 'ㅍ'],
  ㅀ: ['ㄹ', 'ㅎ'],
  ㅄ: ['ㅂ', 'ㅅ'],
  ㄲ: ['ㄱ', 'ㄱ'],
  ㅆ: ['ㅅ', 'ㅅ'],
};

// ----------------------------------------------------------------------
// 2. Morse Code Dictionaries
// ----------------------------------------------------------------------

// Standard Korean Morse Table (표준 국문 모스 부호)
export const KOREAN_MORSE_MAP: Record<string, string> = {
  // 기본 자음
  ㄱ: '.-..',
  ㄴ: '..-.',
  ㄷ: '-...',
  ㄹ: '...-',
  ㅁ: '--',
  ㅂ: '.--',
  ㅅ: '--.',
  ㅇ: '-.-',
  ㅈ: '.---',
  ㅊ: '-.-.',
  ㅋ: '-..-',
  ㅌ: '--..',
  ㅍ: '---',
  ㅎ: '.--.',

  // 쌍자음 (단독 부호 또는 연타)
  ㄲ: '.-.. .-..',
  ㄸ: '-... -...',
  ㅃ: '.-- .--',
  ㅆ: '--. --.',
  ㅉ: '.--- .---',

  // 겹받침
  ㄳ: '.-.. --.',
  ㄵ: '..-. .---',
  ㄶ: '..-. .--.',
  ㄺ: '...- .-..',
  ㄻ: '...- --',
  ㄼ: '...- .--',
  ㄽ: '...- --.',
  ㄾ: '...- --..',
  ㄿ: '...- ---',
  ㅀ: '...- .--.',
  ㅄ: '.-- --.',

  // 모음
  ㅏ: '.',
  ㅑ: '..',
  ㅓ: '-',
  ㅕ: '...',
  ㅗ: '.-',
  ㅛ: '-.',
  ㅜ: '....',
  ㅠ: '.-.',
  ㅡ: '-..',
  ㅣ: '..-',
  ㅐ: '--.-',
  ㅔ: '-.-.',
  ㅒ: '.. ..-',
  ㅖ: '... ..-',
  ㅘ: '.- .',
  ㅙ: '.- --.-',
  ㅚ: '.- ..-',
  ㅝ: '.... -',
  ㅞ: '.... - ..-',
  ㅟ: '.... ..-',
  ㅢ: '-.. ..-',
};

// International Morse Table (국제 모스 부호)
export const INTERNATIONAL_MORSE_MAP: Record<string, string> = {
  // English Letters
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',

  // Numbers
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',

  // Symbols & Punctuations
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  "'": '.----.',
  '!': '-.-.--',
  '/': '-..-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '-': '-....-',
  _: '..--.-',
  '"': '.-..-.',
  $: '...-..-',
  '@': '.--.-.',
};

// Reverse lookup table
export const MORSE_TO_CHAR_MAP: Record<string, string> = {};

// Fill English & Numbers first
Object.entries(INTERNATIONAL_MORSE_MAP).forEach(([char, code]) => {
  MORSE_TO_CHAR_MAP[code] = char;
});

// Fill Korean
Object.entries(KOREAN_MORSE_MAP).forEach(([char, code]) => {
  if (!MORSE_TO_CHAR_MAP[code]) {
    MORSE_TO_CHAR_MAP[code] = char;
  }
});
// Disambiguation / aliases for Korean
MORSE_TO_CHAR_MAP['-.--'] = 'ㅆ';
MORSE_TO_CHAR_MAP['. ..-'] = 'ㅐ';
MORSE_TO_CHAR_MAP['- ..-'] = 'ㅔ';

// ----------------------------------------------------------------------
// 3. Hangul Decomposition & Composition Automata
// ----------------------------------------------------------------------

/**
 * Decomposes a Korean Hangul syllable into an array of individual Jamo characters.
 */
export function decomposeHangulChar(char: string): string[] {
  const code = char.charCodeAt(0);
  if (code >= 0xac00 && code <= 0xd7a3) {
    const offset = code - 0xac00;
    const chosungIdx = Math.floor(offset / 588);
    const jungsungIdx = Math.floor((offset % 588) / 28);
    const jongsungIdx = offset % 28;

    const result: string[] = [HANGUL_CHOSUNG[chosungIdx], HANGUL_JUNGSUNG[jungsungIdx]];
    if (jongsungIdx > 0) {
      result.push(HANGUL_JONGSUNG[jongsungIdx]);
    }
    return result;
  }
  return [char];
}

/**
 * Checks if a character is a Hangul consonant.
 */
export function isHangulConsonant(char: string): boolean {
  return HANGUL_CHOSUNG.includes(char) || char in COMPLEX_JONGSUNG_MAP;
}

/**
 * Checks if a character is a Hangul vowel.
 */
export function isHangulVowel(char: string): boolean {
  return HANGUL_JUNGSUNG.includes(char);
}

/**
 * Assembles an array of Jamo characters back into complete Hangul syllables.
 */
export function assembleHangulJamos(jamos: string[]): string {
  let result = '';
  let i = 0;

  while (i < jamos.length) {
    const cur = jamos[i];

    // Check if cur is a valid Chosung
    const chosungIdx = HANGUL_CHOSUNG.indexOf(cur);
    if (chosungIdx !== -1 && i + 1 < jamos.length && isHangulVowel(jamos[i + 1])) {
      const jungsungIdx = HANGUL_JUNGSUNG.indexOf(jamos[i + 1]);
      let jongsungIdx = 0;
      let advance = 2;

      // Look ahead for potential Jongsung
      if (i + 2 < jamos.length && isHangulConsonant(jamos[i + 2])) {
        // If the consonant is followed by another vowel, it belongs to the next syllable as Chosung!
        const nextIsFollowedByVowel = i + 3 < jamos.length && isHangulVowel(jamos[i + 3]);
        if (!nextIsFollowedByVowel) {
          const testJongsung = jamos[i + 2];
          const matchedJongsungIdx = HANGUL_JONGSUNG.indexOf(testJongsung);
          if (matchedJongsungIdx !== -1) {
            jongsungIdx = matchedJongsungIdx;
            advance = 3;
          }
        }
      }

      const unicode = 0xac00 + (chosungIdx * 21 + jungsungIdx) * 28 + jongsungIdx;
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
// 4. Conversion Functions (Text <-> Morse)
// ----------------------------------------------------------------------

export interface MorseFormatOptions {
  dotChar?: string; // Default: '.'
  dashChar?: string; // Default: '-'
  letterSeparator?: string; // Default: ' '
  wordSeparator?: string; // Default: ' / '
}

/**
 * Normalizes input morse string symbols (•, —, ㅡ, · to . and -).
 */
export function normalizeMorseSymbols(morse: string): string {
  return morse
    .replace(/[•·●]/g, '.')
    .replace(/[—–−_━-]/g, '-')
    .replace(/\|/g, '/')
    .trim();
}

/**
 * Checks if the text appears to be Morse Code.
 */
export function isMorseCodeText(text: string): boolean {
  if (!text || text.trim().length === 0) return false;
  const cleaned = text.replace(/[\s./•·—–−_━|-]/g, '');
  return cleaned.length === 0;
}

/**
 * Converts Plain Text (Korean/English/Numbers/Symbols) into Morse Code.
 */
export function textToMorse(text: string, options: MorseFormatOptions = {}): string {
  const { dotChar = '.', dashChar = '-', letterSeparator = ' ', wordSeparator = ' / ' } = options;

  if (!text) return '';

  const lines = text.split('\n');
  const convertedLines = lines.map((line) => {
    const words = line.trim().split(/\s+/);
    if (words.length === 1 && words[0] === '') return '';

    return words
      .map((word) => {
        const letters: string[] = [];

        for (let idx = 0; idx < word.length; idx += 1) {
          const char = word[idx];
          const upper = char.toUpperCase();

          // 1. Check Hangul Syllable
          const charCode = char.charCodeAt(0);
          if (charCode >= 0xac00 && charCode <= 0xd7a3) {
            const jamos = decomposeHangulChar(char);
            jamos.forEach((jamo) => {
              const code = KOREAN_MORSE_MAP[jamo];
              if (code) {
                letters.push(code);
              } else {
                letters.push(jamo);
              }
            });
          }
          // 2. Check Korean standalone Jamo
          else if (KOREAN_MORSE_MAP[char]) {
            letters.push(KOREAN_MORSE_MAP[char]);
          }
          // 3. Check International (English / Numbers / Symbols)
          else if (INTERNATIONAL_MORSE_MAP[upper]) {
            letters.push(INTERNATIONAL_MORSE_MAP[upper]);
          }
          // 4. Unknown character: preserve as-is
          else {
            letters.push(char);
          }
        }

        return letters.join(letterSeparator);
      })
      .join(wordSeparator);
  });

  let rawMorse = convertedLines.join('\n');

  // Custom symbol replacement
  if (dotChar !== '.' || dashChar !== '-') {
    rawMorse = rawMorse
      .split('')
      .map((ch) => {
        if (ch === '.') return dotChar;
        if (ch === '-') return dashChar;
        return ch;
      })
      .join('');
  }

  return rawMorse;
}

/**
 * Converts Morse Code back into Plain Text (Korean / English / Numbers).
 */
export function morseToText(morse: string, options: MorseFormatOptions = {}): string {
  if (!morse) return '';

  const normalized = normalizeMorseSymbols(morse);
  const lines = normalized.split('\n');

  const decodedLines = lines.map((line) => {
    // Split by word separator (/ or multiple spaces)
    const wordTokens = line.split(/\s*[/|]\s*|\s{3,}/);

    const decodedWords = wordTokens.map((wordToken) => {
      const letterTokens = wordToken.trim().split(/\s+/).filter(Boolean);
      const decodedChars: string[] = [];

      letterTokens.forEach((token) => {
        const mapped = MORSE_TO_CHAR_MAP[token];
        if (mapped) {
          decodedChars.push(mapped);
        } else {
          decodedChars.push(token);
        }
      });

      // Assemble any decomposed Hangul Jamos back to Hangul Syllables
      return assembleHangulJamos(decodedChars);
    });

    return decodedWords.join(' ');
  });

  return decodedLines.join('\n');
}

// ----------------------------------------------------------------------
// 5. Audio Timing & Signal Sequences
// ----------------------------------------------------------------------

export interface MorseSignalEvent {
  type: 'on' | 'off';
  durationMs: number;
  symbol?: string; // '.', '-', ' '
  char?: string;
  charIndex?: number;
}

/**
 * Calculates standard Morse audio timing events from a normalized Morse string.
 * @param morse Standard dot/dash morse string (dots as '.', dashes as '-', spaces as ' ', words as '/')
 * @param wpm Words per minute (5 ~ 45, standard 20)
 */
export function getMorseTimingEvents(morse: string, wpm = 20): MorseSignalEvent[] {
  const normalized = normalizeMorseSymbols(morse);
  const unitMs = Math.round(1200 / Math.max(5, Math.min(60, wpm)));

  const dotDuration = unitMs; // 1 unit
  const dashDuration = unitMs * 3; // 3 units
  const intraCharGap = unitMs; // 1 unit
  const interCharGap = unitMs * 3; // 3 units
  const interWordGap = unitMs * 7; // 7 units

  const events: MorseSignalEvent[] = [];
  const words = normalized.split(/\s*[/]\s*|\s{3,}/);

  words.forEach((word, wIdx) => {
    const letters = word.trim().split(/\s+/).filter(Boolean);

    letters.forEach((letter, lIdx) => {
      for (let sIdx = 0; sIdx < letter.length; sIdx += 1) {
        const symbol = letter[sIdx];
        if (symbol === '.') {
          events.push({ type: 'on', durationMs: dotDuration, symbol: '.' });
        } else if (symbol === '-') {
          events.push({ type: 'on', durationMs: dashDuration, symbol: '-' });
        }

        // Intra-character gap (between dots/dashes within same letter)
        if (sIdx < letter.length - 1) {
          events.push({ type: 'off', durationMs: intraCharGap, symbol: '' });
        }
      }

      // Inter-character gap (between letters)
      if (lIdx < letters.length - 1) {
        events.push({ type: 'off', durationMs: interCharGap, symbol: ' ' });
      }
    });

    // Inter-word gap (between words)
    if (wIdx < words.length - 1) {
      events.push({ type: 'off', durationMs: interWordGap, symbol: '/' });
    }
  });

  return events;
}

// ----------------------------------------------------------------------
// 6. WAV File Audio Synthesizer (In-Memory PCM Audio Generation)
// ----------------------------------------------------------------------

/**
 * Generates a valid 16-bit Mono WAV audio file Blob for the given Morse string.
 */
export function generateMorseWavBlob(morse: string, wpm = 20, frequency = 700, volume = 0.8): Blob {
  const events = getMorseTimingEvents(morse, wpm);
  const sampleRate = 44100;

  // Calculate total samples
  const totalMs = events.reduce((acc, ev) => acc + ev.durationMs, 0) + 100; // 100ms trailing padding
  const totalSamples = Math.floor((totalMs / 1000) * sampleRate);

  const samples = new Float32Array(totalSamples);
  let currentSampleIdx = 0;

  const attackReleaseSamples = Math.min(Math.floor(0.005 * sampleRate), 220); // 5ms fade ramp to avoid pops

  events.forEach((ev) => {
    const eventSamples = Math.floor((ev.durationMs / 1000) * sampleRate);

    if (ev.type === 'on') {
      for (let i = 0; i < eventSamples; i += 1) {
        if (currentSampleIdx + i < totalSamples) {
          const t = i / sampleRate;
          let amp = volume * Math.sin(2 * Math.PI * frequency * t);

          // Apply soft Attack envelope
          if (i < attackReleaseSamples) {
            amp *= i / attackReleaseSamples;
          }
          // Apply soft Release envelope
          else if (i > eventSamples - attackReleaseSamples) {
            amp *= (eventSamples - i) / attackReleaseSamples;
          }

          samples[currentSampleIdx + i] = amp;
        }
      }
    }
    // 'off' is silence (already 0.0)

    currentSampleIdx += eventSamples;
  });

  // Convert Float32 samples to 16-bit PCM WAV container
  const wavBuffer = encodeWAV(samples, sampleRate);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

/**
 * Helper to encode Float32 PCM samples into a standard 44-byte RIFF/WAVE ArrayBuffer.
 */
function encodeWAV(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samples.length * 2, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (1 = raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (1 = mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * 2, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * 2, true);

  // Write PCM audio samples
  let offset = 44;
  for (let i = 0; i < samples.length; i += 1) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const intSample = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, intSample, true);
    offset += 2;
  }

  return buffer;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
