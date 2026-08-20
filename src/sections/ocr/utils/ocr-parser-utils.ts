import { utils, write } from 'xlsx';
import { createWorker } from 'tesseract.js';

export interface ReceiptInfo {
  storeName: string;
  bizNumber: string;
  date: string;
  totalAmount: number;
  taxAmount: number;
  supplyAmount: number;
  rawText: string;
}

export interface BusinessCardInfo {
  name: string;
  company: string;
  department: string;
  phone: string;
  email: string;
  address: string;
  rawText: string;
}

/**
 * Tesseract.js로 이미지에서 텍스트 인식 (한글 + 영문)
 */
export async function performOcr(
  imageSource: File | Blob | string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const worker = await createWorker('kor+eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) {
        onProgress(Math.round((m.progress || 0) * 100));
      }
    },
  });

  const ret = await worker.recognize(imageSource);
  await worker.terminate();
  return ret.data.text;
}

/**
 * 영수증 텍스트에서 주요 항목 추출
 */
export function parseReceiptText(text: string): ReceiptInfo {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let storeName = '';
  let bizNumber = '';
  let date = '';
  let totalAmount = 0;
  let taxAmount = 0;
  let supplyAmount = 0;

  // 1. 상호명 (보통 첫 3줄 내에서 '주식회사' 또는 상호 키워드)
  for (let i = 0; i < Math.min(5, lines.length); i += 1) {
    const l = lines[i];
    if (l.includes('상호') || l.includes('가맹점') || l.includes('매장명')) {
      storeName = l.replace(/(상호명?|가맹점명?|매장명?)[:\s]+/g, '').trim();
      break;
    }
  }
  if (!storeName && lines.length > 0) {
    storeName = lines[0].replace(/[#*]/g, '').trim();
  }

  // 2. 사업자등록번호 (xxx-xx-xxxxx)
  const bizMatch = text.match(/\d{3}[-\s]?\d{2}[-\s]?\d{5}/);
  if (bizMatch) {
    bizNumber = bizMatch[0].replace(/\s+/g, '-');
  }

  // 3. 결제 일시 (YYYY-MM-DD 또는 YYYY/MM/DD 또는 YYYY.MM.DD)
  const dateMatch = text.match(/20\d{2}[-./년]\s*\d{1,2}[-./월]\s*\d{1,2}/);
  if (dateMatch) {
    date = dateMatch[0]
      .replace(/[년월\s]/g, '-')
      .replace(/\./g, '-')
      .replace(/\//g, '-');
  }

  // 4. 금액 (합계, 총액, 승인금액, 부가세, 공급가액)
  lines.forEach((line) => {
    const cleanLine = line.replace(/\s+/g, '');
    const numMatch = cleanLine.match(/[\d,]+/g);
    const lastNumStr = numMatch ? numMatch[numMatch.length - 1].replace(/,/g, '') : '0';
    const parsedNum = parseInt(lastNumStr, 10);

    if (!isNaN(parsedNum) && parsedNum > 0) {
      if (
        cleanLine.includes('합계') ||
        cleanLine.includes('총금액') ||
        cleanLine.includes('결제금액') ||
        cleanLine.includes('받을금액')
      ) {
        if (parsedNum > totalAmount) totalAmount = parsedNum;
      } else if (
        cleanLine.includes('부가세') ||
        cleanLine.includes('세액') ||
        cleanLine.includes('VAT')
      ) {
        taxAmount = parsedNum;
      } else if (cleanLine.includes('공급가액') || cleanLine.includes('과세물품가액')) {
        supplyAmount = parsedNum;
      }
    }
  });

  // 보정: supplyAmount와 taxAmount가 비어있고 totalAmount가 있다면 계산
  if (totalAmount > 0 && supplyAmount === 0 && taxAmount === 0) {
    supplyAmount = Math.round(totalAmount / 1.1);
    taxAmount = totalAmount - supplyAmount;
  }

  return {
    storeName,
    bizNumber,
    date,
    totalAmount,
    taxAmount,
    supplyAmount,
    rawText: text,
  };
}

/**
 * 명함 텍스트에서 인적사항 파싱
 */
export function parseBusinessCard(text: string): BusinessCardInfo {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let name = '';
  let company = '';
  let department = '';
  let phone = '';
  let email = '';
  let address = '';

  // 이메일
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) email = emailMatch[0];

  // 전화번호 (휴대폰 010-xxxx-xxxx 또는 02-xxx-xxxx)
  const phoneMatch = text.match(/(01[016789]|02|0[3-6][1-5])[-.\s]?\d{3,4}[-.\s]?\d{4}/);
  if (phoneMatch) phone = phoneMatch[0].replace(/\s+/g, '-');

  // 회사명 및 이름 추출
  lines.forEach((line) => {
    if (
      line.includes('주식회사') ||
      line.includes('(주)') ||
      line.includes('Inc') ||
      line.includes('Corp') ||
      line.includes('대표')
    ) {
      if (!company) company = line;
    }
    if (
      line.includes('팀') ||
      line.includes('실') ||
      line.includes('본부') ||
      line.includes('부서') ||
      line.includes('직급') ||
      line.includes('매니저') ||
      line.includes('팀장') ||
      line.includes('대표')
    ) {
      if (!department) department = line;
    }
    if (
      line.includes('시') &&
      (line.includes('구') || line.includes('동') || line.includes('로') || line.includes('길'))
    ) {
      if (!address) address = line;
    }
  });

  if (!name && lines.length > 0) {
    // 2~4글자 한글 이름 매칭
    for (let i = 0; i < lines.length; i += 1) {
      const match = lines[i].match(/^[가-힣]{2,4}$/);
      if (match) {
        name = match[0];
        break;
      }
    }
  }

  return {
    name: name || '이름 미인식',
    company: company || '회사명 미인식',
    department: department || '직함/부서 미인식',
    phone,
    email,
    address,
    rawText: text,
  };
}

/**
 * 명함 정보를 vCard (.vcf) 포맷 문자열로 생성
 */
export function generateVCardString(card: BusinessCardInfo): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${card.name}`,
    `ORG:${card.company};${card.department}`,
    `TEL;TYPE=CELL:${card.phone}`,
    `EMAIL;TYPE=WORK:${card.email}`,
    `ADR;TYPE=WORK:;;${card.address};;;;`,
    'END:VCARD',
  ].join('\n');
}

/**
 * 인식된 텍스트 표 데이터를 Excel Blob으로 변환
 */
export function exportTableToExcelBlob(lines: string[]): Blob {
  const data = lines.map((line) => 
    // 탭 또는 2개 이상의 공백으로 분리
     line.split(/\t|\s{2,}/).map((col) => col.trim())
  );

  const ws = utils.aoa_to_sheet(data);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'OCR_Table');

  const buf = write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buf], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
