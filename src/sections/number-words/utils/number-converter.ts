/**
 * Korean, Hanja (갖은자), and English Currency / Number to Words Engine
 */

const KOR_DIGITS = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const KOR_UNITS = ['', '십', '백', '천'];
const KOR_BIG_UNITS = ['', '만', '억', '조', '경', '해'];

// 위조 방지 한자 (갖은자)
const HANJA_DIGITS = ['', '壹', '貳', '參', '肆', '伍', '六', '柒', '捌', '玖'];
const HANJA_UNITS = ['', '拾', '百', '阡'];
const HANJA_BIG_UNITS = ['', '萬', '億', '兆', '京', '垓'];

/**
 * Converts a positive number / BigInt string into Korean words.
 * (e.g. 123450000 -> "일억 이천삼백사십오만 원정")
 */
export function numberToKoreanWords(numStr: string, suffix = ' 원정', prefix = '금 '): string {
  const cleanStr = numStr.replace(/[^0-9]/g, '');
  if (!cleanStr || cleanStr === '0') return `${prefix}영${suffix}`;

  let result = '';
  const len = cleanStr.length;
  const numChunks = Math.ceil(len / 4);

  for (let i = 0; i < numChunks; i += 1) {
    const chunkStart = Math.max(0, len - (i + 1) * 4);
    const chunkEnd = len - i * 4;
    const chunk = cleanStr.slice(chunkStart, chunkEnd);

    let chunkText = '';
    const chunkLen = chunk.length;

    for (let j = 0; j < chunkLen; j += 1) {
      const digit = parseInt(chunk[j], 10);
      const unitIdx = chunkLen - j - 1;

      if (digit !== 0) {
        // In Korean, '일십' is usually '십', '일백' is '백', '일천' is '천' unless at the start or desired
        const digitWord = digit === 1 && unitIdx > 0 ? '' : KOR_DIGITS[digit];
        chunkText += digitWord + KOR_UNITS[unitIdx];
      }
    }

    if (chunkText) {
      result = `${chunkText}${KOR_BIG_UNITS[i]} ${result}`.trim();
    }
  }

  return `${prefix}${result}${suffix}`;
}

/**
 * Converts a number to Anti-Counterfeit Financial Hanja (갖은자).
 * (e.g. 123450000 -> "金 壹億 貳阡參百四拾五萬 圓整")
 */
export function numberToHanjaWords(numStr: string, suffix = ' 圓整', prefix = '金 '): string {
  const cleanStr = numStr.replace(/[^0-9]/g, '');
  if (!cleanStr || cleanStr === '0') return `${prefix}零${suffix}`;

  let result = '';
  const len = cleanStr.length;
  const numChunks = Math.ceil(len / 4);

  for (let i = 0; i < numChunks; i += 1) {
    const chunkStart = Math.max(0, len - (i + 1) * 4);
    const chunkEnd = len - i * 4;
    const chunk = cleanStr.slice(chunkStart, chunkEnd);

    let chunkText = '';
    const chunkLen = chunk.length;

    for (let j = 0; j < chunkLen; j += 1) {
      const digit = parseInt(chunk[j], 10);
      const unitIdx = chunkLen - j - 1;

      if (digit !== 0) {
        chunkText += HANJA_DIGITS[digit] + HANJA_UNITS[unitIdx];
      }
    }

    if (chunkText) {
      result = `${chunkText}${HANJA_BIG_UNITS[i]} ${result}`.trim();
    }
  }

  return `${prefix}${result}${suffix}`;
}

/**
 * English Number Words Helper.
 */
const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

export function numberToEnglishWords(num: number): string {
  if (num === 0) return 'Zero Dollars';
  if (num < 0) return `Negative ${numberToEnglishWords(-num)}`;

  let words = '';
  let scaleIdx = 0;
  let remaining = num;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk !== 0) {
      const chunkStr = convertThreeDigitChunk(chunk);
      words = `${chunkStr} ${SCALES[scaleIdx]} ${words}`.trim();
    }
    remaining = Math.floor(remaining / 1000);
    scaleIdx += 1;
  }

  return `${words} Dollars`;
}

function convertThreeDigitChunk(num: number): string {
  let str = '';
  const hundreds = Math.floor(num / 100);
  const rest = num % 100;

  if (hundreds > 0) {
    str += `${ONES[hundreds]} Hundred `;
  }

  if (rest > 0) {
    if (rest < 20) {
      str += ONES[rest];
    } else {
      const tens = Math.floor(rest / 10);
      const ones = rest % 10;
      str += `${TENS[tens]}${ones > 0 ? `-${ONES[ones]}` : ''}`;
    }
  }

  return str.trim();
}
