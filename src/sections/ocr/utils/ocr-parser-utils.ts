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

/**
 * 1-클릭 테스트용 샘플 영수증 이미지 생성 (DataURL)
 */
export function createSampleReceiptImage(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 600;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 600, 700);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('(주)울트라커피 강남점', 300, 60);

  ctx.font = '18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('상호명: (주)울트라커피', 50, 110);
  ctx.fillText('사업자등록번호: 123-45-67890', 50, 145);
  ctx.fillText('결제일자: 2026-08-29 14:30', 50, 180);

  ctx.strokeStyle = '#D1D5DB';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, 210);
  ctx.lineTo(550, 210);
  ctx.stroke();

  ctx.font = '18px sans-serif';
  ctx.fillText('아메리카노 (Ice)     2개     9,000', 50, 250);
  ctx.fillText('카페라떼 (Hot)       1개     5,500', 50, 285);
  ctx.fillText('치즈 케이크           1개     6,500', 50, 320);

  ctx.beginPath();
  ctx.moveTo(50, 355);
  ctx.lineTo(550, 355);
  ctx.stroke();

  ctx.font = '19px sans-serif';
  ctx.fillText('공급가액: 19,091 원', 50, 400);
  ctx.fillText('부가세(VAT): 1,909 원', 50, 435);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillStyle = '#2563EB';
  ctx.fillText('합계금액: 21,000 원', 50, 490);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('감사합니다. 좋은 하루 되세요!', 300, 580);

  return canvas.toDataURL('image/png');
}

/**
 * 1-클릭 테스트용 샘플 비즈니스 명함 이미지 생성 (DataURL)
 */
export function createSampleCardImage(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 650;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 650, 400);

  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 644, 394);

  ctx.fillStyle = '#1E3A8A';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('(주)울트라소프트웨어', 45, 65);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText('홍길동 수석', 45, 135);

  ctx.fillStyle = '#475569';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText('AI 플랫폼 개발본부 / 팀장', 45, 175);

  ctx.fillStyle = '#1E293B';
  ctx.font = '17px monospace';
  ctx.fillText('TEL: 010-1234-5678', 45, 235);
  ctx.fillText('EMAIL: gildong.hong@ultrasoft.co.kr', 45, 270);
  ctx.fillText('ADDR: 서울특별시 강남구 테헤란로 152', 45, 305);

  return canvas.toDataURL('image/png');
}

/**
 * 1-클릭 테스트용 샘플 표/데이터 이미지 생성 (DataURL)
 */
export function createSampleTableImage(): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 650;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 650, 360);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('2026 분기별 부서 매출 집계표', 40, 50);

  ctx.font = '16px monospace';
  ctx.fillStyle = '#1E293B';

  const rows = [
    '부서명\t1분기\t2분기\t3분기\t합계',
    'AI솔루션팀\t120\t145\t180\t445',
    '클라우드팀\t95\t110\t130\t335',
    '데이터팀\t80\t95\t115\t290',
    '디자인팀\t50\t65\t70\t185',
  ];

  let y = 100;
  rows.forEach((row, idx) => {
    if (idx === 0) {
      ctx.fillStyle = '#2563EB';
      ctx.font = 'bold 17px monospace';
    } else {
      ctx.fillStyle = '#1E293B';
      ctx.font = '16px monospace';
    }
    ctx.fillText(row, 40, y);
    y += 40;
  });

  return canvas.toDataURL('image/png');
}
