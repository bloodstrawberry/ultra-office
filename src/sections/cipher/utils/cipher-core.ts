/**
 * Classical Cryptography & Cipher Algorithms Engine
 * Supports Caesar, ROT13, Atbash, Vigenère, Rail Fence, and Brute-Force cracker.
 */

// ----------------------------------------------------------------------
// 1. Caesar & ROT13
// ----------------------------------------------------------------------

export function caesarCipher(text: string, shift: number, mode: 'encrypt' | 'decrypt' = 'encrypt'): string {
  const effectiveShift = mode === 'encrypt' ? (shift % 26 + 26) % 26 : ((-shift % 26) + 26) % 26;

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      // Uppercase A-Z
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + effectiveShift) % 26) + 65);
      }
      // Lowercase a-z
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + effectiveShift) % 26) + 97);
      }
      // Korean Hangul Syllable shift (0xAC00 ~ 0xD7A3, 11,172 characters)
      if (code >= 0xac00 && code <= 0xd7a3) {
        const total = 11172;
        const hangulShift = mode === 'encrypt' ? (shift % total + total) % total : ((-shift % total) + total) % total;
        return String.fromCharCode(((code - 0xac00 + hangulShift) % total) + 0xac00);
      }

      return char;
    })
    .join('');
}

export function rot13Cipher(text: string): string {
  return caesarCipher(text, 13, 'encrypt');
}

// ----------------------------------------------------------------------
// 2. Atbash Cipher (A <-> Z, B <-> Y)
// ----------------------------------------------------------------------

export function atbashCipher(text: string): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(90 - (code - 65));
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(122 - (code - 97));
      }
      if (code >= 0xac00 && code <= 0xd7a3) {
        return String.fromCharCode(0xd7a3 - (code - 0xac00));
      }
      return char;
    })
    .join('');
}

// ----------------------------------------------------------------------
// 3. Vigenère Cipher (다중 치환 암호)
// ----------------------------------------------------------------------

export function vigenereCipher(text: string, key: string, mode: 'encrypt' | 'decrypt' = 'encrypt'): string {
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) return text;

  let keyIndex = 0;

  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;

      if (isUpper || isLower) {
        const base = isUpper ? 65 : 97;
        const kShift = cleanKey.charCodeAt(keyIndex % cleanKey.length) - 65;
        const shift = mode === 'encrypt' ? kShift : -kShift;
        keyIndex += 1;

        const newChar = String.fromCharCode(((code - base + shift + 26) % 26) + base);
        return newChar;
      }

      return char;
    })
    .join('');
}

// ----------------------------------------------------------------------
// 4. Rail Fence Cipher (지그재그 울타리 전위 암호)
// ----------------------------------------------------------------------

export function railFenceEncrypt(text: string, rails = 3): string {
  if (rails <= 1 || text.length <= rails) return text;

  const fence: string[][] = Array.from({ length: rails }, () => []);
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < text.length; i += 1) {
    fence[rail].push(text[i]);
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  return fence.map((r) => r.join('')).join('');
}

export function railFenceDecrypt(cipher: string, rails = 3): string {
  if (rails <= 1 || cipher.length <= rails) return cipher;

  // Determine zigzag pattern positions
  const pattern: number[] = [];
  let rail = 0;
  let direction = 1;

  for (let i = 0; i < cipher.length; i += 1) {
    pattern.push(rail);
    rail += direction;
    if (rail === rails - 1 || rail === 0) {
      direction = -direction;
    }
  }

  // Count chars per rail
  const railCounts: number[] = Array(rails).fill(0);
  pattern.forEach((r) => {
    railCounts[r] += 1;
  });

  // Split ciphertext into rails
  const fence: string[][] = [];
  let currentIdx = 0;
  for (let r = 0; r < rails; r += 1) {
    fence.push(cipher.slice(currentIdx, currentIdx + railCounts[r]).split(''));
    currentIdx += railCounts[r];
  }

  // Reconstruct original text
  let result = '';
  pattern.forEach((r) => {
    result += fence[r].shift() || '';
  });

  return result;
}

// ----------------------------------------------------------------------
// 5. Caesar Brute-Force Cracker
// ----------------------------------------------------------------------

export interface BruteForceResult {
  shift: number;
  decrypted: string;
}

export function bruteForceCaesar(ciphertext: string): BruteForceResult[] {
  const results: BruteForceResult[] = [];
  for (let s = 0; s < 26; s += 1) {
    results.push({
      shift: s,
      decrypted: caesarCipher(ciphertext, s, 'decrypt'),
    });
  }
  return results;
}
