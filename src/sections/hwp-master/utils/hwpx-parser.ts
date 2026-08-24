import type { HwpTable, HwpSection, HwpDocument, HwpParagraph, HwpTableCell } from '../types';

import JSZip from 'jszip';

// ----------------------------------------------------------------------

/**
 * Format bytes to readable string
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Parse HWPX (OWPML XML based ZIP archive)
 */
export async function parseHwpxFile(file: File): Promise<HwpDocument> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  const sections: HwpSection[] = [];
  let totalParagraphs = 0;
  let totalTables = 0;
  const allTextLines: string[] = [];

  // Find section files
  const sectionFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith('Contents/section') && name.endsWith('.xml')
  );

  // If no section files found directly, search any section xml
  const candidateFiles =
    sectionFiles.length > 0
      ? sectionFiles
      : Object.keys(zip.files).filter(
          (name) => name.endsWith('.xml') && !name.includes('manifest')
        );

  const parser = new DOMParser();

  for (let sIdx = 0; sIdx < candidateFiles.length; sIdx++) {
    const filename = candidateFiles[sIdx];
    const xmlText = await zip.files[filename].async('text');
    const doc = parser.parseFromString(xmlText, 'text/xml');

    const paragraphs: HwpParagraph[] = [];
    const tables: HwpTable[] = [];

    // Parse Paragraphs (hp:p or p tags)
    const pElements = doc.querySelectorAll('p, hp\\:p, *|p');
    pElements.forEach((pEl, pIdx) => {
      // Find all text elements (hp:t, t, or text content)
      const tElements = pEl.querySelectorAll('t, hp\\:t, *|t');
      let pText = '';
      if (tElements.length > 0) {
        tElements.forEach((t) => {
          pText += t.textContent || '';
        });
      } else {
        pText = pEl.textContent || '';
      }

      pText = pText.trim();
      if (pText) {
        // Detect heading or title
        const isHeading =
          pText.startsWith('1.') || pText.startsWith('가.') || pText.startsWith('[') || pIdx === 0;
        const headingLevel = pIdx === 0 ? 1 : isHeading ? 2 : undefined;

        paragraphs.push({
          id: `p-${sIdx}-${pIdx}`,
          text: pText,
          isHeading,
          headingLevel,
          align: pIdx === 0 ? 'center' : 'left',
          fontSize: pIdx === 0 ? 18 : isHeading ? 14 : 11,
          isBold: isHeading || pIdx === 0,
        });
        allTextLines.push(pText);
        totalParagraphs++;
      }
    });

    // Parse Tables (hp:tbl, tbl, or table tags)
    const tblElements = doc.querySelectorAll('tbl, hp\\:tbl, *|tbl, table');
    tblElements.forEach((tblEl, tIdx) => {
      const rows: HwpTableCell[][] = [];
      const trElements = tblEl.querySelectorAll('tr, hp\\:tr, *|tr');

      trElements.forEach((trEl, rIdx) => {
        const rowCells: HwpTableCell[] = [];
        const tcElements = trEl.querySelectorAll('tc, hp\\:tc, *|tc, td, th');

        tcElements.forEach((tcEl) => {
          const cellText = tcEl.textContent?.trim() || '';
          rowCells.push({
            text: cellText,
            isHeader: rIdx === 0,
          });
        });

        if (rowCells.length > 0) {
          rows.push(rowCells);
        }
      });

      if (rows.length > 0) {
        tables.push({
          id: `tbl-${sIdx}-${tIdx}`,
          rows,
          caption: `표 ${totalTables + 1}`,
        });
        totalTables++;
      }
    });

    sections.push({
      id: `section-${sIdx}`,
      title: `섹션 ${sIdx + 1}`,
      paragraphs,
      tables,
      rawText: paragraphs.map((p) => p.text).join('\n'),
    });
  }

  const title = sections[0]?.paragraphs[0]?.text || file.name.replace(/\.[^/.]+$/, '');

  return {
    fileName: file.name,
    fileSize: formatBytes(file.size),
    fileType: 'hwpx',
    title,
    lastModified: new Date(file.lastModified).toLocaleString('ko-KR'),
    sections,
    totalParagraphs,
    totalTables,
    fullText: allTextLines.join('\n\n'),
  };
}

/**
 * Fallback binary HWP 5.0 text extractor
 */
export async function parseHwpBinaryFile(file: File): Promise<HwpDocument> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Extract UTF-16LE Korean text strings
  const decoderUtf16 = new TextDecoder('utf-16le');
  const rawDecoded = decoderUtf16.decode(bytes);

  // Clean and filter printable Korean / English strings
  const lines = rawDecoded
    .split(/[\r\n]+/)
    .map((line) => line.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '').trim())
    .filter((line) => line.length > 2 && /[\uAC00-\uD7AF\u1100-\u11FF\w]/.test(line));

  const paragraphs: HwpParagraph[] = lines.map((text, idx) => ({
    id: `bin-p-${idx}`,
    text,
    align: idx === 0 ? 'center' : 'left',
    isHeading: idx === 0 || text.startsWith('1.') || text.startsWith('가.'),
    fontSize: idx === 0 ? 16 : 11,
    isBold: idx === 0,
  }));

  const title = paragraphs[0]?.text || file.name.replace(/\.[^/.]+$/, '');

  return {
    fileName: file.name,
    fileSize: formatBytes(file.size),
    fileType: 'hwp',
    title,
    lastModified: new Date(file.lastModified).toLocaleString('ko-KR'),
    sections: [
      {
        id: 'section-0',
        title: '본문',
        paragraphs,
        tables: [],
        rawText: lines.join('\n'),
      },
    ],
    totalParagraphs: paragraphs.length,
    totalTables: 0,
    fullText: lines.join('\n\n'),
  };
}

/**
 * Universal HWP / HWPX Loader
 */
export async function loadHwpDocument(file: File): Promise<HwpDocument> {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'hwpx') {
    return parseHwpxFile(file);
  }
  // Try HWPX first in case of renamed extension, then fallback to binary
  try {
    return await parseHwpxFile(file);
  } catch {
    return await parseHwpBinaryFile(file);
  }
}

/**
 * Built-in Sample Public, Gov & Military Documents for instant review
 */
export const SAMPLE_HWP_DOCS: HwpDocument[] = [
  // 1. [군대·전투휴양] 18-3 오키나와 - 미야코지마 여행계획 (실제 군대식 여행계획서 100% 재현)
  {
    id: 'military-okinawa',
    fileName: '[군대·전투휴양] 18-3_오키나와_미야코지마_여행계획.hwpx',
    fileSize: '62.4 KB',
    fileType: 'sample',
    category: 'military',
    tag: '군대 · 여행계획(전투휴양)',
    description:
      '군대 특유의 결재선, 전투휴양/야간전술휴양/국제거리 전술행군/장구류 점검 표준 휴가계획서',
    title: '18-3 오키나와 - 미야코지마 여행계획 (전투휴양)',
    lastModified: '2026-08-20 08:30',
    totalParagraphs: 22,
    totalTables: 7,
    fullText: `18-3 오키나와 - 미야코지마 여행계획

□ 개요 및 목적
○ 타 국가 여행을 통한 식견 함양
○ 타지 여행 간 공동생활을 통한 친목향상
○ 외지시설 이용 간 2개 언어 능력 향상

□ 일 정
○ 여행기간 : 8월 8일 ~ 8월 13일(5박 6일)
○ 세부계획

[1일차 (8/8 수)]
- ~ 07:00 : 김해공항 집합
- 07:00~07:40 : 탑승권 예약 확인 / 개인정비
- 07:40~08:05 : 김해 - 오키나와 발 항공기 탑승장 이동 및 탑승
- 08:05~10:05 : 오키나와 나하 공항 도착
- 10:05~12:30 : 나하 - 미야코지마 탑승권 확인 / 조식 및 개인정비
- 12:30~12:55 : 나하 - 미야코지마 발 항공기 탑승장 이동 및 탑승
- 12:55~13:45 : 미야코지마 공항 도착
- 13:45~18:30 : 중식 및 미야코지마 1일차 관광
- 18:30~19:00 : 게스트 하우스 이동
- 19:00~ : 게스트 하우스 도착 및 짐 정리

[2일차 (8/9 목)]
- 09:00 : 기상 및 조식
- 10:00~12:30 : 전투휴양(1일차)
- 13:00 : 중식
- 14:00~18:30 : 전투휴양(1일차)
- 19:00 : 석식 및 숙소복귀
- 20:00 : 야간전술휴양

[3일차 (8/10 금)]
- 08:30 : 기상 및 조식
- 09:30~ : 전투휴양(2일차)
- 13:00 : 중식
- 14:00~18:30 : 전투휴양(2일차)
- 19:00 : 석식
- 20:00 : 숙소 복귀 또는 야간전술휴양

[4일차 (8/11 토)]
- 08:30 : 기상
- 08:30~11:00 : 본섬 이동 준비 및 조식
- 11:35~11:55 : 미야코지마 - 나하 발 항공기 탑승장 이동 및 탑승
- 11:55~12:45 : 오키나와 나하 공항 도착
- 13:00 : 중식 또는 체크인 중 택 1
- 14:00~18:30 : 전투휴양(3일차)
- 19:00 : 석식
- 20:00 : 숙소 복귀 또는 본섬 야간전술휴양

[5일차 (8/12 일)]
- ~08:00 : 기상 및 아침점호
- 08:00 : 조식
- 09:00 : 국제거리 전술행군
- 12:45 : 토마리 항구(스쿠버다이빙) 이동
- 13:00~17:00 : 스쿠버다이빙 체험
- 17:00~19:00 : 항구 복귀 및 석식
- 20:00 : 복귀 전 점호

[6일차 (8/13 월)]
- 08:00 : 기상
- 08:00~09:00 : 개인 짐 정리 및 장구류 상태 점검
- 09:30~10:45 : 나하 국제공항 이동
- 10:45~11:05 : 오키나와 - 김해 발 항공기 탑승장 이동 및 탑승
- 11:05~13:00 : 김해국제공항 도착
- 14:00 : 여행종료 및 귀가

□ 준 비 품 목
○ 여권
○ 5박 6일 간 의류(속옷 및 양말 포함)
○ 수영복
○ 타월
○ 비치샌들
○ 세면도구
○ 휴대폰 충전기(예비배터리 등)
○ 상비용 돼지코 콘센트
○ 동전지갑 및 넉넉한 자금
○ 지갑 · 담배 · 라이터

□ 행 정 사 항
○ 여행 D-3일 이내 엔화 환전 실시
○ 여권분실 시 대처요령 숙지
   - 분실시점 기준 파악
   - 귀국 비행기 시간 확인
   - 한국영사관 방문 및 임시여권발급 조치
   ※ 준비사항 : 신분증, 여권사진, 수수료(4천엔)
   - 항공권 비상금 1.5만엔 확보
○ 미야코지마 3박 4일 간 택시 이용료 확보
○ 포켓와이파이 준비
   (3층 출국장에서 여권소지 후 방문, 복귀시 1층 입국장 반납)  끝.`,
    sections: [
      {
        id: 'oki-sec-1',
        title: '결재선 및 제목',
        paragraphs: [
          {
            id: 'oki-p-title',
            text: '18-3 오키나와 - 미야코지마 여행계획',
            align: 'center',
            isBold: true,
            fontSize: 22,
            isHeading: true,
            headingLevel: 1,
          },
        ],
        tables: [
          {
            id: 'oki-tbl-approval',
            caption: '지휘 계선 결재선 (검보 : 인사과장)',
            rows: [
              [
                { text: '기  안', isHeader: true },
                { text: '결  재', isHeader: true },
              ],
              [
                { text: '중위(진) 홍길동 (인)', isHeader: false },
                { text: '대위 김태영 (인)', isHeader: false },
              ],
              [
                { text: '검  보', isHeader: true },
                { text: '인사과장 대위 이진호 (확인)', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'oki-sec-2',
        title: '개요 및 목적',
        paragraphs: [
          {
            id: 'oki-p-1',
            text: '□ 개요 및 목적',
            align: 'left',
            isBold: true,
            fontSize: 14,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'oki-p-2',
            text: '○ 타 국가 여행을 통한 식견 함양\n○ 타지 여행 간 공동생활을 통한 친목향상\n○ 외지시설 이용 간 2개 언어 능력 향상',
            align: 'left',
            fontSize: 11,
          },
          {
            id: 'oki-p-3',
            text: '□ 일 정',
            align: 'left',
            isBold: true,
            fontSize: 14,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'oki-p-4',
            text: '○ 여행기간 : 8월 8일 ~ 8월 13일(5박 6일)\n○ 세부계획',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [
          {
            id: 'oki-tbl-day1',
            caption: '1일차 세부 일정 (8/8 수 - 김해 / 오키나와 나하 / 미야코지마 진출)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '1일차 (8/8 수) 세부 일정', isHeader: true },
              ],
              [
                { text: '~ 07:00', isHeader: false },
                { text: '김해공항 집합', isHeader: false },
              ],
              [
                { text: '07:00~07:40', isHeader: false },
                { text: '탑승권 예약 확인 / 개인정비', isHeader: false },
              ],
              [
                { text: '07:40~08:05', isHeader: false },
                { text: '김해 - 오키나와 발 항공기 탑승장 이동 및 탑승', isHeader: false },
              ],
              [
                { text: '08:05~10:05', isHeader: false },
                { text: '오키나와 나하 공항 도착', isHeader: false },
              ],
              [
                { text: '10:05~12:30', isHeader: false },
                { text: '나하 - 미야코지마 탑승권 확인 / 조식 및 개인정비', isHeader: false },
              ],
              [
                { text: '12:30~12:55', isHeader: false },
                { text: '나하 - 미야코지마 발 항공기 탑승장 이동 및 탑승', isHeader: false },
              ],
              [
                { text: '12:55~13:45', isHeader: false },
                { text: '미야코지마 공항 도착', isHeader: false },
              ],
              [
                { text: '13:45~18:30', isHeader: false },
                { text: '중식 및 미야코지마 1일차 관광', isHeader: false },
              ],
              [
                { text: '18:30~19:00', isHeader: false },
                { text: '게스트 하우스 이동', isHeader: false },
              ],
              [
                { text: '19:00~', isHeader: false },
                { text: '게스트 하우스 도착 및 짐 정리', isHeader: false },
              ],
            ],
          },
          {
            id: 'oki-tbl-day2',
            caption: '2일차 세부 일정 (8/9 목 - 미야코지마 전투휴양 및 야간전술휴양)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '2일차 (8/9 목) 세부 일정', isHeader: true },
              ],
              [
                { text: '09:00', isHeader: false },
                { text: '기상 및 조식', isHeader: false },
              ],
              [
                { text: '10:00~12:30', isHeader: false },
                { text: '전투휴양 (1일차)', isHeader: false },
              ],
              [
                { text: '13:00', isHeader: false },
                { text: '중식', isHeader: false },
              ],
              [
                { text: '14:00~18:30', isHeader: false },
                { text: '전투휴양 (1일차)', isHeader: false },
              ],
              [
                { text: '19:00', isHeader: false },
                { text: '석식 및 숙소복귀', isHeader: false },
              ],
              [
                { text: '20:00', isHeader: false },
                { text: '야간전술휴양', isHeader: false },
              ],
            ],
          },
          {
            id: 'oki-tbl-day3',
            caption: '3일차 세부 일정 (8/10 금 - 미야코지마 2일차 전투휴양)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '3일차 (8/10 금) 세부 일정', isHeader: true },
              ],
              [
                { text: '08:30', isHeader: false },
                { text: '기상 및 조식', isHeader: false },
              ],
              [
                { text: '09:30~', isHeader: false },
                { text: '전투휴양 (2일차)', isHeader: false },
              ],
              [
                { text: '13:00', isHeader: false },
                { text: '중식', isHeader: false },
              ],
              [
                { text: '14:00~18:30', isHeader: false },
                { text: '전투휴양 (2일차)', isHeader: false },
              ],
              [
                { text: '19:00', isHeader: false },
                { text: '석식', isHeader: false },
              ],
              [
                { text: '20:00', isHeader: false },
                { text: '숙소 복귀 또는 야간전술휴양', isHeader: false },
              ],
            ],
          },
          {
            id: 'oki-tbl-day4',
            caption: '4일차 세부 일정 (8/11 토 - 오키나와 본섬 이동 및 전투휴양)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '4일차 (8/11 토) 세부 일정', isHeader: true },
              ],
              [
                { text: '08:30', isHeader: false },
                { text: '기상', isHeader: false },
              ],
              [
                { text: '08:30~11:00', isHeader: false },
                { text: '본섬 이동 준비 및 조식', isHeader: false },
              ],
              [
                { text: '11:35~11:55', isHeader: false },
                { text: '미야코지마 - 나하 발 항공기 탑승장 이동 및 탑승', isHeader: false },
              ],
              [
                { text: '11:55~12:45', isHeader: false },
                { text: '오키나와 나하 공항 도착', isHeader: false },
              ],
              [
                { text: '13:00', isHeader: false },
                { text: '중식 또는 체크인 중 택 1', isHeader: false },
              ],
              [
                { text: '14:00~18:30', isHeader: false },
                { text: '전투휴양 (3일차)', isHeader: false },
              ],
              [
                { text: '19:00', isHeader: false },
                { text: '석식', isHeader: false },
              ],
              [
                { text: '20:00', isHeader: false },
                { text: '숙소 복귀 또는 본섬 야간전술휴양', isHeader: false },
              ],
            ],
          },
          {
            id: 'oki-tbl-day5',
            caption: '5일차 세부 일정 (8/12 일 - 국제거리 전술행군 및 스쿠버다이빙)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '5일차 (8/12 일) 세부 일정', isHeader: true },
              ],
              [
                { text: '~08:00', isHeader: false },
                { text: '기상 및 아침점호', isHeader: false },
              ],
              [
                { text: '08:00', isHeader: false },
                { text: '조식', isHeader: false },
              ],
              [
                { text: '09:00', isHeader: false },
                { text: '국제거리 전술행군', isHeader: false },
              ],
              [
                { text: '12:45', isHeader: false },
                { text: '토마리 항구(스쿠버다이빙) 이동', isHeader: false },
              ],
              [
                { text: '13:00~17:00', isHeader: false },
                { text: '스쿠버다이빙 체험', isHeader: false },
              ],
              [
                { text: '17:00~19:00', isHeader: false },
                { text: '항구 복귀 및 석식', isHeader: false },
              ],
              [
                { text: '20:00', isHeader: false },
                { text: '복귀 전 점호', isHeader: false },
              ],
            ],
          },
          {
            id: 'oki-tbl-day6',
            caption: '6일차 세부 일정 (8/13 월 - 장구류 점검 및 김해공항 귀가)',
            rows: [
              [
                { text: '시간', isHeader: true },
                { text: '6일차 (8/13 월) 세부 일정', isHeader: true },
              ],
              [
                { text: '08:00', isHeader: false },
                { text: '기상', isHeader: false },
              ],
              [
                { text: '08:00~09:00', isHeader: false },
                { text: '개인 짐 정리 및 장구류 상태 점검', isHeader: false },
              ],
              [
                { text: '09:30~10:45', isHeader: false },
                { text: '나하 국제공항 이동', isHeader: false },
              ],
              [
                { text: '10:45~11:05', isHeader: false },
                { text: '오키나와 - 김해 발 항공기 탑승장 이동 및 탑승', isHeader: false },
              ],
              [
                { text: '11:05~13:00', isHeader: false },
                { text: '김해국제공항 도착', isHeader: false },
              ],
              [
                { text: '14:00', isHeader: false },
                { text: '여행종료 및 귀가', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'oki-sec-3',
        title: '준비품목 및 행정사항',
        paragraphs: [
          {
            id: 'oki-p-5',
            text: '□ 준 비 품 목',
            align: 'left',
            isBold: true,
            fontSize: 14,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'oki-p-6',
            text: '○ 여권\n○ 5박 6일 간 의류(속옷 및 양말 포함)\n○ 수영복\n○ 타월\n○ 비치샌들\n○ 세면도구\n○ 휴대폰 충전기(예비배터리 등)\n○ 상비용 돼지코 콘센트\n○ 동전지갑 및 넉넉한 자금\n○ 지갑 · 담배 · 라이터',
            align: 'left',
            fontSize: 11,
          },
          {
            id: 'oki-p-7',
            text: '□ 행 정 사 항',
            align: 'left',
            isBold: true,
            fontSize: 14,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'oki-p-8',
            text: '○ 여행 D-3일 이내 엔화 환전 실시\n○ 여권분실 시 대처요령 숙지\n   - 분실시점 기준 파악\n   - 귀국 비행기 시간 확인\n   - 한국영사관 방문 및 임시여권발급 조치\n   ※ 준비사항 : 신분증, 여권사진, 수수료(4천엔)\n   - 항공권 비상금 1.5만엔 확보\n○ 미야코지마 3박 4일 간 택시 이용료 확보\n○ 포켓와이파이 준비\n   (3층 출국장에서 여권소지 후 방문, 복귀시 1층 입국장 반납)  끝.',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [],
        rawText: '',
      },
    ],
  },

  // 2. [군대·당직사령] 당직사령 일일근무일지 및 야간순찰기록표
  {
    id: 'military-duty',
    fileName: '[군대·당직행정] 당직사령_일일근무일지_및_순찰조서.hwpx',
    fileSize: '49.8 KB',
    fileType: 'sample',
    category: 'military',
    tag: '군대 · 당직근무일지',
    description: '대대 당직사령/사관 결재선, 총원 결산, 총기·탄약 수불 및 취약지역 순찰 기록 양식',
    title: '제○○보병대대 당직사령 일일근무일지 및 순찰조서',
    lastModified: '2026-08-20 07:00',
    totalParagraphs: 14,
    totalTables: 3,
    fullText: `당 직 사 령 일 일 근 무 일 지

1. 근무 개요
가. 근무 일시: 2026년 08월 19일 08:30 ~ 08월 20일 08:30 (24시간)
나. 당직 사령: 소령(진) 김태헌 (군번: 15-10234)
다. 당직 사관: 대위 박민재, 중위 이성진, 상사 한상우

2. 인원 결산 보고: 총원 342명 / 사고 0명 / 열외 및 출타 38명 (휴가 28, 입원 2, 출장 8), 현재원 304명

3. 총기 및 탄약 결산: K-2 소총 280정, K-1A 35정, K-5 권총 12정 (이상무 / 봉인 100%)

4. 야간 순찰 및 취약지역 점검: 하단 순찰기록표 참조.  끝.`,
    sections: [
      {
        id: 'duty-sec-1',
        title: '근무일지 두문 및 결재선',
        paragraphs: [
          {
            id: 'duty-p-1',
            text: '당 직 사 령 일 일 근 무 일 지',
            align: 'center',
            isBold: true,
            fontSize: 20,
            isHeading: true,
            headingLevel: 1,
          },
        ],
        tables: [
          {
            id: 'duty-tbl-approval',
            caption: '당직 근무 결재선',
            rows: [
              [
                { text: '당직사령', isHeader: true },
                { text: '작전과장', isHeader: true },
                { text: '대대장(결재)', isHeader: true },
              ],
              [
                { text: '소령(진) 김태헌 (인)', isHeader: false },
                { text: '소령 이진우 (인)', isHeader: false },
                { text: '중령 조상원 (인)', isHeader: false },
              ],
              [
                { text: '2026.08.20 08:30', isHeader: false },
                { text: '2026.08.20 09:00', isHeader: false },
                { text: '2026.08.20 09:30', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'duty-sec-2',
        title: '인원 및 총기 결산',
        paragraphs: [
          {
            id: 'duty-p-2',
            text: '1. 대대 인원 결산 현황',
            align: 'left',
            fontSize: 13,
            isBold: true,
            isHeading: true,
            headingLevel: 2,
          },
        ],
        tables: [
          {
            id: 'duty-tbl-people',
            caption: '중대별 인원 결산 및 출타 현황표',
            rows: [
              [
                { text: '구분', isHeader: true },
                { text: '총원', isHeader: true },
                { text: '현재원', isHeader: true },
                { text: '휴가/외출', isHeader: true },
                { text: '입원/외진', isHeader: true },
                { text: '파견/출장', isHeader: true },
                { text: '사고/이상', isHeader: true },
              ],
              [
                { text: '본부중대', isHeader: false },
                { text: '68명', isHeader: false },
                { text: '60명', isHeader: false },
                { text: '6명', isHeader: false },
                { text: '1명', isHeader: false },
                { text: '1명', isHeader: false },
                { text: '0명', isHeader: false },
              ],
              [
                { text: '제1중대', isHeader: false },
                { text: '92명', isHeader: false },
                { text: '82명', isHeader: false },
                { text: '8명', isHeader: false },
                { text: '0명', isHeader: false },
                { text: '2명', isHeader: false },
                { text: '0명', isHeader: false },
              ],
              [
                { text: '제2중대', isHeader: false },
                { text: '90명', isHeader: false },
                { text: '81명', isHeader: false },
                { text: '7명', isHeader: false },
                { text: '1명', isHeader: false },
                { text: '1명', isHeader: false },
                { text: '0명', isHeader: false },
              ],
              [
                { text: '화기중대', isHeader: false },
                { text: '92명', isHeader: false },
                { text: '81명', isHeader: false },
                { text: '7명', isHeader: false },
                { text: '0명', isHeader: false },
                { text: '4명', isHeader: false },
                { text: '0명', isHeader: false },
              ],
              [
                { text: '합  계', isHeader: true },
                { text: '342명', isHeader: true },
                { text: '304명', isHeader: true },
                { text: '28명', isHeader: true },
                { text: '2명', isHeader: true },
                { text: '8명', isHeader: true },
                { text: '0명 (이상무)', isHeader: true },
              ],
            ],
          },
          {
            id: 'duty-tbl-patrol',
            caption: '야간 취약지역 순찰 및 경계 점검표',
            rows: [
              [
                { text: '순찰 시간', isHeader: true },
                { text: '순찰 구역', isHeader: true },
                { text: '순찰자 (계급/성명)', isHeader: true },
                { text: '점검 결과 및 조치사항', isHeader: true },
              ],
              [
                { text: '22:30~23:15', isHeader: false },
                { text: '탄약고 및 유류고', isHeader: false },
                { text: '당직사령 소령(진) 김태헌', isHeader: false },
                { text: 'CCTV 작동 정상, 시건장치 3중 확인 (이상무)', isHeader: false },
              ],
              [
                { text: '01:00~01:40', isHeader: false },
                { text: '위병소 및 외곽초소', isHeader: false },
                { text: '당직사관 대위 박민재', isHeader: false },
                { text: '초병 경계태세 양호, 수하 암구호 숙지 확인', isHeader: false },
              ],
              [
                { text: '03:30~04:15', isHeader: false },
                { text: '통신실 및 전산서버실', isHeader: false },
                { text: '당직사령 소령(진) 김태헌', isHeader: false },
                { text: '항온항습기 정상 가동, 비인가자 출입 없음', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },

  {
    id: 'gov-draft',
    fileName: '[행정안전부] 2026_표준_공문서_기안문_서식.hwpx',
    fileSize: '48.5 KB',
    fileType: 'sample',
    category: 'gov',
    tag: '공무원 · 기안문',
    description: '행정 효율과 협업 촉진 규정에 따른 두문, 본문, 결재선 표준 기안 양식',
    title: '2026년도 디지털 행정 플랫폼 고도화 및 AI 자동화 추진 계획(안)',
    lastModified: '2026-08-20 09:30',
    totalParagraphs: 14,
    totalTables: 2,
    fullText: `행 정 안 전 부
수신자: 수신자 참조 (내부결재)
(경유)
제목: 2026년도 디지털 행정 플랫폼 고도화 및 AI 자동화 추진 계획(안)

1. 추진 배경 및 필요성
가. 지능형 정부 구현을 위한 공공 행정 업무의 비대면·디지털 전환 요구 증대
나. 대민 행정서비스 처리 속도 향상 및 서류 발급 절차 간소화 필요
다. 공공기관 간 데이터 연계 및 업무 자동화(RPA) 도입을 통한 행정 효율성 극대화

2. 주요 추진 과제
가. [차세대 전산망] 클라우드 기반 공공 협업 오피스 및 무설치 문서 뷰어 도입
나. [스마트 행정] AI 기반 민원 서류 자동 분류 및 광학문자인식(OCR) 적용
다. [개인정보 보호] 공문서 및 증빙자료 내 주민번호·고유식별정보 자동 마스킹 의무화

3. 행정 사항 및 협조 요청
가. 각 실·국별 2026년 정보화 소요 예산안 제출: 2026. 09. 15.(화)한
나. 부서별 전산 보안 책임자 지정 및 보안 서약서 제출 요망

붙임 1. 2026년도 정보화 세부 실행계획서 1부.
붙임 2. 소요 예산 산출내역서 1부.  끝.`,
    sections: [
      {
        id: 'gov-sec-1',
        title: '공문서 두문 및 결재선',
        paragraphs: [
          {
            id: 'gov-p-0',
            text: '행 정 안 전 부',
            align: 'center',
            isBold: true,
            fontSize: 22,
            isHeading: true,
            headingLevel: 1,
          },
          {
            id: 'gov-p-1',
            text: '수신자: 수신자 참조 (내부결재)\n(경유):',
            align: 'left',
            fontSize: 12,
            isBold: false,
          },
        ],
        tables: [
          {
            id: 'gov-tbl-approval',
            caption: '기안 및 검토·결재선',
            rows: [
              [
                { text: '구분', isHeader: true },
                { text: '기안자 (주무관)', isHeader: true },
                { text: '검토자 (팀장)', isHeader: true },
                { text: '결재자 (국장)', isHeader: true },
              ],
              [
                { text: '직급/성명', isHeader: false },
                { text: '행정주사 홍길동', isHeader: false },
                { text: '행정사무관 김철수', isHeader: false },
                { text: '고위공무원 이영희', isHeader: false },
              ],
              [
                { text: '결재일자', isHeader: false },
                { text: '2026. 08. 20.', isHeader: false },
                { text: '2026. 08. 20.', isHeader: false },
                { text: '2026. 08. 20.', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'gov-sec-2',
        title: '본문',
        paragraphs: [
          {
            id: 'gov-p-2',
            text: '제목: 2026년도 디지털 행정 플랫폼 고도화 및 AI 자동화 추진 계획(안)',
            align: 'left',
            isBold: true,
            fontSize: 15,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'gov-p-3',
            text: '1. 추진 배경 및 필요성',
            align: 'left',
            isBold: true,
            fontSize: 13,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'gov-p-4',
            text: '가. 지능형 정부 구현을 위한 공공 행정 업무의 비대면·디지털 전환 요구 증대\n나. 대민 행정서비스 처리 속도 향상 및 서류 발급 절차 간소화 필요\n다. 공공기관 간 데이터 연계 및 업무 자동화(RPA) 도입을 통한 행정 효율성 극대화',
            align: 'left',
            fontSize: 11,
          },
          {
            id: 'gov-p-5',
            text: '2. 주요 추진 과제 및 일정',
            align: 'left',
            isBold: true,
            fontSize: 13,
            isHeading: true,
            headingLevel: 2,
          },
        ],
        tables: [
          {
            id: 'gov-tbl-projects',
            caption: '2026년도 세부 추진과제 및 예산 배정안',
            rows: [
              [
                { text: '과제명', isHeader: true },
                { text: '주요 과업 내용', isHeader: true },
                { text: '소요예산(백만원)', isHeader: true },
                { text: '완료목표', isHeader: true },
              ],
              [
                { text: '웹 문서 마스터 도입', isHeader: false },
                { text: 'HWP/HWPX 무설치 웹 뷰어 및 데이터 추출 체계', isHeader: false },
                { text: '350', isHeader: false },
                { text: '2026. 10.', isHeader: false },
              ],
              [
                { text: '행정서식 OCR 자동화', isHeader: false },
                { text: '신청서 스캔 이미지 텍스트 추출 및 DB 자동화', isHeader: false },
                { text: '280', isHeader: false },
                { text: '2026. 11.', isHeader: false },
              ],
              [
                { text: '전자 직인 날인 시스템', isHeader: false },
                { text: '관공서 전자 인감 생성 및 PDF 위변조 방지', isHeader: false },
                { text: '190', isHeader: false },
                { text: '2026. 12.', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'gov-sec-3',
        title: '결문 및 붙임',
        paragraphs: [
          {
            id: 'gov-p-6',
            text: '3. 행정 사항 및 협조 요청\n가. 각 실·국별 2026년 정보화 소요 예산안 제출: 2026. 09. 15.(화)한\n나. 부서별 전산 보안 책임자 지정 및 보안 서약서 제출 요망\n\n붙임 1. 2026년도 정보화 세부 실행계획서 1부.\n붙임 2. 소요 예산 산출내역서 1부.  끝.',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [],
        rawText: '',
      },
    ],
  },

  // 2. [공무원] 관공서 출장 복명서 및 여비 정산서
  {
    id: 'gov-trip',
    fileName: '[지자체·관공서] 공무출장_복명서_및_여비정산서.hwpx',
    fileSize: '42.1 KB',
    fileType: 'sample',
    category: 'gov',
    tag: '공무원 · 출장복명',
    description: '공무원 여비 규정에 따른 국내/외 출장 업무결과 복명 및 여비정산 명세 양식',
    title: '스마트 행정 선진 지자체 벤치마킹 공무출장 복명서',
    lastModified: '2026-08-19 16:45',
    totalParagraphs: 11,
    totalTables: 2,
    fullText: `공 무 출 장 복 명 서

1. 출장 개요
가. 출 장 자: 기획조정실 행정7급 박민우 (외 1명)
나. 출장 목적: AI 기반 민원 처리 및 디지털 문서 혁신 지자체 우수사례 현장 벤치마킹
다. 출장 기간: 2026. 08. 17.(월) ~ 2026. 08. 18.(화) [1박 2일]
라. 출 장 지: 세종특별자치시 행정안전부 본관 및 정부통합전산센터

2. 주요 복명 내용
가. 클라우드 기반 공공 오피스 도입 현황 및 보안 적합성 검증 절차 청취
나. 모바일 신분증 및 전자문서 지갑 연계 민원 신청 간소화 프로세스 확인
다. 한글(HWP) 및 PDF 전자서명 시스템의 현업 공무원 활용도 및 장애 대응 사례 분석

3. 시사점 및 정책 반영 계획
가. 우리 청 '2026년 업무 혁신 추진 계획'에 웹 기반 무설치 HWP 뷰어 구축 과제 반영
나. 현장 부서 의견 수렴 후 9월 중 시범 사업 추진 계획 수립 예정

4. 여비 정산 내역: 하단 표 참조.  끝.`,
    sections: [
      {
        id: 'trip-sec-1',
        title: '복명서 제목 및 출장자 정보',
        paragraphs: [
          {
            id: 'trip-p-1',
            text: '공 무 출 장 복 명 서',
            align: 'center',
            isBold: true,
            fontSize: 20,
            isHeading: true,
            headingLevel: 1,
          },
        ],
        tables: [
          {
            id: 'trip-tbl-user',
            caption: '출장자 인적 사항',
            rows: [
              [
                { text: '소속', isHeader: true },
                { text: '직급', isHeader: true },
                { text: '성명', isHeader: true },
                { text: '출장 기간', isHeader: true },
                { text: '출장지', isHeader: true },
              ],
              [
                { text: '기획조정실', isHeader: false },
                { text: '행정7급', isHeader: false },
                { text: '박민우', isHeader: false },
                { text: '2026.08.17~08.18 (1박2일)', isHeader: false },
                { text: '세종시 정부청사', isHeader: false },
              ],
              [
                { text: '정보통신과', isHeader: false },
                { text: '전산8급', isHeader: false },
                { text: '최동훈', isHeader: false },
                { text: '2026.08.17~08.18 (1박2일)', isHeader: false },
                { text: '세종시 정부청사', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'trip-sec-2',
        title: '복명 본문 및 여비 정산',
        paragraphs: [
          {
            id: 'trip-p-2',
            text: '1. 출장 목적 및 배경\n가. 차세대 디지털 행정 오피스 우수 사례 벤치마킹\n나. 비설치형 웹 문서 보안 및 대민 행정 연계 방안 모색',
            align: 'left',
            fontSize: 11,
            isBold: false,
          },
          {
            id: 'trip-p-3',
            text: '2. 주요 출장 결과 및 시사점\n가. 무설치 웹 HWP 뷰어 도입 시 라이선스 비용 연간 4,000만원 절감 기대\n나. 현장 공무원의 문서 열람 시간 60% 단축 및 모바일 연계성 우수',
            align: 'left',
            fontSize: 11,
            isBold: false,
          },
          {
            id: 'trip-p-4',
            text: '3. 공무원 여비 정산 명세서',
            align: 'left',
            fontSize: 13,
            isBold: true,
            isHeading: true,
            headingLevel: 2,
          },
        ],
        tables: [
          {
            id: 'trip-tbl-expenses',
            caption: '여비 정산 산출 내역 (공무원 여비 규정 제2호 준용)',
            rows: [
              [
                { text: '구분', isHeader: true },
                { text: '운임(KTX)', isHeader: true },
                { text: '일비 (2일)', isHeader: true },
                { text: '숙박비 (1박)', isHeader: true },
                { text: '식비 (4식)', isHeader: true },
                { text: '합계 금액', isHeader: true },
              ],
              [
                { text: '박민우 (7급)', isHeader: false },
                { text: '57,400원', isHeader: false },
                { text: '50,000원', isHeader: false },
                { text: '70,000원', isHeader: false },
                { text: '40,000원', isHeader: false },
                { text: '217,400원', isHeader: false },
              ],
              [
                { text: '최동훈 (8급)', isHeader: false },
                { text: '57,400원', isHeader: false },
                { text: '50,000원', isHeader: false },
                { text: '70,000원', isHeader: false },
                { text: '40,000원', isHeader: false },
                { text: '217,400원', isHeader: false },
              ],
              [
                { text: '총 계', isHeader: true },
                { text: '114,800원', isHeader: true },
                { text: '100,000원', isHeader: true },
                { text: '140,000원', isHeader: true },
                { text: '80,000원', isHeader: true },
                { text: '434,800원', isHeader: true },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },

  // 3. [공기업] 정보화 사업 과업지시서 (RFP)
  {
    id: 'public-rfp',
    fileName: '[한국공기업] 2026_정보화시스템_구축_과업지시서.hwpx',
    fileSize: '56.8 KB',
    fileType: 'sample',
    category: 'public',
    tag: '공기업 · 과업지시서',
    description: '공공기관 정보화 용역 입찰용 과업내용, 인력투입, 산출물 표준 과업지시서',
    title: '2026년도 클라우드 기반 스마트 업무 포털 고도화 용역 과업지시서',
    lastModified: '2026-08-18 11:20',
    totalParagraphs: 13,
    totalTables: 2,
    fullText: `2026년도 클라우드 기반 스마트 업무 포털 고도화 용역 과업지시서
[한국에너지기술공사 정보전략처]

제1장 총 칙
1.1 사업 개요
가. 사 업 명: 2026년 클라우드 기반 스마트 업무 포털 및 전자 결재 연계 구축
나. 사업 기간: 계약 체결일로부터 6개월간
다. 사업 예산: 금 450,000,000원 (VAT 포함)
라. 계약 방식: 제한경쟁입찰 (협상에 의한 계약)

1.2 추진 목적
가. 본사 및 전국 12개 지사 간 비대면 실시간 문서 공동 편집 환경 구현
나. 외산 소프트웨어 종속 탈피 및 국산 오픈 웹 표준 오피스 플랫폼 도입

제2장 과업 세부 내용
2.1 기능적 요구사항
가. 웹 기반 HWP, HWPX 및 PDF 문서 스트리밍 렌더링 엔진 탑재
나. 사내 그룹웨어 전자결재선 연동 및 투명 전자 직인 도장 날인 기능
다. 100만 행 이상 대용량 로그/CSV 초고속 가상 렌더링 지원

2.2 보안 및 품질 관리
가. 국가정보원 보안적합성 검증 기준 및 공공기관 개인정보보호 지침 철저 준수
나. 소스코드 정적 분석(시큐어 코딩) 100% 결함 제거 및 취약점 점검 실시

붙임: 일정별 주요 마일스톤 및 산출물 관리 표.  끝.`,
    sections: [
      {
        id: 'rfp-sec-1',
        title: '사업 개요',
        paragraphs: [
          {
            id: 'rfp-p-1',
            text: '2026년도 클라우드 기반 스마트 업무 포털 고도화 용역 과업지시서',
            align: 'center',
            isBold: true,
            fontSize: 18,
            isHeading: true,
            headingLevel: 1,
          },
          {
            id: 'rfp-p-2',
            text: '발주기관: 한국에너지기술공사 정보보안처',
            align: 'center',
            fontSize: 12,
            isBold: true,
          },
        ],
        tables: [
          {
            id: 'rfp-tbl-info',
            caption: '용역 사업 기본 정보',
            rows: [
              [
                { text: '사업명', isHeader: true },
                { text: '스마트 업무 포털 및 웹 오피스 구축 용역', isHeader: false },
                { text: '사업기간', isHeader: true },
                { text: '계약일로부터 6개월', isHeader: false },
              ],
              [
                { text: '추정예산', isHeader: true },
                { text: '금 450,000,000원 (VAT 포함)', isHeader: false },
                { text: '입찰방식', isHeader: true },
                { text: '협상에 의한 계약 (기술 90: 가격 10)', isHeader: false },
              ],
              [
                { text: '담당부서', isHeader: true },
                { text: '정보전략처 디지털혁신부', isHeader: false },
                { text: '문의처', isHeader: true },
                { text: '042-860-0000', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'rfp-sec-2',
        title: '산출물 및 추진 일정',
        paragraphs: [
          {
            id: 'rfp-p-3',
            text: '제2장 과업 산출물 및 마일스톤 관리',
            align: 'left',
            isBold: true,
            fontSize: 14,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'rfp-p-4',
            text: '계약상대자는 각 단계별 추진 일정에 맞춰 명시된 필수 산출물을 발주처에 제출하여 검수를 받아야 한다.',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [
          {
            id: 'rfp-tbl-milestones',
            caption: '단계별 추진 일정 및 제출 산출물 목록',
            rows: [
              [
                { text: '단계', isHeader: true },
                { text: '추진 과업', isHeader: true },
                { text: '제출 산출물', isHeader: true },
                { text: '제출 기한', isHeader: true },
              ],
              [
                { text: '착수 단계', isHeader: false },
                { text: '요구사항 분석 및 환경설계', isHeader: false },
                { text: '사업수행계획서, WBS, 보안서약서', isHeader: false },
                { text: '착수 후 14일 이내', isHeader: false },
              ],
              [
                { text: '설계 단계', isHeader: false },
                { text: 'UI/UX 및 아키텍처 설계', isHeader: false },
                { text: '화면설계서, DB ERD, 인터페이스 정의서', isHeader: false },
                { text: '착수 후 2개월', isHeader: false },
              ],
              [
                { text: '구현/테스트', isHeader: false },
                { text: '포털 개발 및 단위/통합 테스트', isHeader: false },
                { text: '단위테스트 결과서, 시큐어코딩 진단서', isHeader: false },
                { text: '착수 후 5개월', isHeader: false },
              ],
              [
                { text: '완료 단계', isHeader: false },
                { text: '시범운영 및 사용자 교육', isHeader: false },
                { text: '완료보고서, 사용자/운영자 매뉴얼', isHeader: false },
                { text: '사업 종료 10일 전', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },

  // 4. [공기업] 지출결의서 및 물품구매 품의서
  {
    id: 'public-expense',
    fileName: '[공공기관] 지출결의서_및_물품구매_검수조서.hwpx',
    fileSize: '39.8 KB',
    fileType: 'sample',
    category: 'public',
    tag: '공기업 · 지출결의',
    description: '공공기관 회계규정에 따른 물품/용역 지출품의서 및 납품 검수조서 양식',
    title: '2026년도 3분기 사무용 전산비품 구매 지출결의서 및 검수조서',
    lastModified: '2026-08-20 10:15',
    totalParagraphs: 10,
    totalTables: 2,
    fullText: `지 출 결 의 서 (품 의 서)

1. 품의 개요
가. 건 명: 2026년 3분기 신규 입사자 및 노후 사무 전산장비 교체 구매
나. 예산 과목: [일반관리비 - 자산취득비 - 사무집기비품]
다. 지출 금액: 금 4,290,000원 (금사백이십구만원 / 부가세 포함)
라. 지출 일자: 2026. 08. 25.
마. 지 급 처: (주)알파오피스시스템 (사업자등록번호: 101-86-12345)

2. 구매 사유 및 필요성
가. 3분기 공채 신규 입사자(4명) 업무용 듀얼 모니터 및 인체공학 키보드/마우스 지급
나. 노후 프린터 토너 및 보조 배터리 소모품 정기 재고 확보

3. 구매 내역 및 검수 확인: 하단 표 참조.  끝.`,
    sections: [
      {
        id: 'exp-sec-1',
        title: '지출결의서 두문 및 결재선',
        paragraphs: [
          {
            id: 'exp-p-1',
            text: '지 출 결 의 서 (품 의 서)',
            align: 'center',
            isBold: true,
            fontSize: 20,
            isHeading: true,
            headingLevel: 1,
          },
        ],
        tables: [
          {
            id: 'exp-tbl-approval',
            caption: '회계 결재선',
            rows: [
              [
                { text: '발의(담당)', isHeader: true },
                { text: '검토(선임)', isHeader: true },
                { text: '심사(팀장)', isHeader: true },
                { text: '승인(본부장)', isHeader: true },
              ],
              [
                { text: '정다은 (인)', isHeader: false },
                { text: '한상우 (인)', isHeader: false },
                { text: '송지훈 (인)', isHeader: false },
                { text: '김진수 (인)', isHeader: false },
              ],
              [
                { text: '2026.08.20', isHeader: false },
                { text: '2026.08.20', isHeader: false },
                { text: '2026.08.20', isHeader: false },
                { text: '2026.08.20', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'exp-sec-2',
        title: '구매 명세 및 검수조서',
        paragraphs: [
          {
            id: 'exp-p-2',
            text: '물품 구매 명세 및 납품 검수 내역',
            align: 'left',
            fontSize: 14,
            isBold: true,
            isHeading: true,
            headingLevel: 2,
          },
          {
            id: 'exp-p-3',
            text: '상기 품목을 정히 검수하고 규격 및 수량에 이상이 없음을 확인합니다.\n검수일자: 2026년 08월 20일  검수자: 경영지원처 정다은 (인)',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [
          {
            id: 'exp-tbl-items',
            caption: '구매 물품 상세 내역서',
            rows: [
              [
                { text: '품목명', isHeader: true },
                { text: '규격/사양', isHeader: true },
                { text: '수량', isHeader: true },
                { text: '단가(원)', isHeader: true },
                { text: '공급가액(원)', isHeader: true },
                { text: '세액(원)', isHeader: true },
                { text: '합계(원)', isHeader: true },
              ],
              [
                { text: '27인치 4K 모니터', isHeader: false },
                { text: 'IPS/USB-C PD 65W', isHeader: false },
                { text: '4대', isHeader: false },
                { text: '450,000', isHeader: false },
                { text: '1,800,000', isHeader: false },
                { text: '180,000', isHeader: false },
                { text: '1,980,000', isHeader: false },
              ],
              [
                { text: '무선 키보드/마우스', isHeader: false },
                { text: '인체공학 블루투스', isHeader: false },
                { text: '4세트', isHeader: false },
                { text: '120,000', isHeader: false },
                { text: '480,000', isHeader: false },
                { text: '48,000', isHeader: false },
                { text: '528,000', isHeader: false },
              ],
              [
                { text: '레이저 복합기 토너', isHeader: false },
                { text: '정품 대용량 검정/컬러', isHeader: false },
                { text: '2세트', isHeader: false },
                { text: '810,000', isHeader: false },
                { text: '1,620,000', isHeader: false },
                { text: '162,000', isHeader: false },
                { text: '1,782,000', isHeader: false },
              ],
              [
                { text: '총 합 계', isHeader: true },
                { text: '-', isHeader: true },
                { text: '10건', isHeader: true },
                { text: '-', isHeader: true },
                { text: '3,900,000', isHeader: true },
                { text: '390,000', isHeader: true },
                { text: '4,290,000', isHeader: true },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },

  // 5. [군대] 육군본부 표준 작전계획 명령서 (OPORD)
  {
    id: 'military-opord',
    fileName: '[육군본부_표준] 제2026-1호_대대_야외기동훈련_작전명령(OPORD).hwpx',
    fileSize: '52.3 KB',
    fileType: 'sample',
    category: 'military',
    tag: '군대 · 작전명령',
    description: '합참/육군 작전명령 5개 단락(상황, 임무, 실시, 근무지원, 지휘통신) 표준 서식',
    title: '제2026-1호 대대 야외 전술기동훈련 작전계획 명령서 (예시)',
    lastModified: '2026-08-20 06:00',
    totalParagraphs: 15,
    totalTables: 2,
    fullText: `[훈련용 비문 예시 / 대외비]
작전명령 제2026-1호
발령부대: 제○○보병사단 제○○여단 제○대대 지휘소
발령일시: 2026년 08월 20일 06:00
작전문서 참조: 2026년도 대대 전투력 측정 및 야외 전술훈련 지침

1. 상 황 (Situation)
가. 적 정: 가상 적 부대 1개 대대 규모가 ○○고지 일대에 방어진지를 구축 중인 것으로 식별됨
나. 아군 상황: 여단 주공부대는 ○○축선을 따라 공격 개시, 대대는 조공으로서 우측방 차단 임무 수행

2. 임 무 (Mission)
대대는 2026년 08월 25일 05:00부로 ○○지점 진출 및 적 퇴로를 차단하고 주공 부대의 공격 기세를 보장한다.

3. 실 시 (Execution)
가. 지휘관 의도: 기습적인 야간 기동과 은밀 침투로 적의 조기 경보를 무력화하고 목표를 선점
나. 단계별 과업:
  - 1단계 (D-1): 부대 정비, 탄약/물자 불출 및 기동로 정찰 완료
  - 2단계 (D-Day 05:00): 공격 개시선 통과 및 목표 진지 격파
  - 3단계 (D-Day 14:00): 목표지점 확보 및 즉각적인 방어진지 재편성

4. 전투근무지원 (Sustainment)
가. 급식 및 보급: 전투식량 2식 휴대, 탄약 1차 기본 휴대량 100% 지급
나. 의무 지원: 대대 구호소 ○○좌표에 전개, 응급환자 발생 시 사단 의무근무대로 즉각 헬기 후송

5. 지휘 및 통신 (Command & Signal)
가. 지휘소 위치: 주 지휘소 [좌표 123-456], 예비 지휘소 [좌표 123-789]
나. 무선 통신: 주파수 예비 3호망 운용, 무선 침묵 원칙 (D-Day 05:00 해제)
다. 암호 및 신호: 피아식별 띠(황색/청색), 일일 음어표 '을호-26' 적용.  끝.`,
    sections: [
      {
        id: 'mil-sec-1',
        title: '명령서 두문 및 전투편성',
        paragraphs: [
          {
            id: 'mil-p-0',
            text: '[ 훈 련 용 / 대 외 비 ]',
            align: 'center',
            isBold: true,
            fontSize: 16,
            isHeading: true,
            headingLevel: 1,
          },
          {
            id: 'mil-p-1',
            text: '작전명령 제2026-1호 (야외 전술기동훈련)\n참조: 2026년도 대대 종합 전투력 측정 계획서',
            align: 'center',
            fontSize: 13,
            isBold: true,
          },
          {
            id: 'mil-p-2',
            text: '1. 부대별 전투편성 및 임무 할당',
            align: 'left',
            fontSize: 13,
            isBold: true,
            isHeading: true,
            headingLevel: 2,
          },
        ],
        tables: [
          {
            id: 'mil-tbl-units',
            caption: '대대 예하 중대별 전투 편성표',
            rows: [
              [
                { text: '부대구분', isHeader: true },
                { text: '배속/배치', isHeader: true },
                { text: '주요 과업', isHeader: true },
                { text: '기동 축선', isHeader: true },
              ],
              [
                { text: '제1중대 (주공)', isHeader: false },
                { text: '화기중대 60mm 박격포 1소대', isHeader: false },
                { text: '○○고지 정면 공격 및 적 진지 격파', isHeader: false },
                { text: 'A축선 (계곡로)', isHeader: false },
              ],
              [
                { text: '제2중대 (조공)', isHeader: false },
                { text: '대전차소대 1분대', isHeader: false },
                { text: '우측 능선 우회 기동 및 적 퇴로 차단', isHeader: false },
                { text: 'B축선 (능선로)', isHeader: false },
              ],
              [
                { text: '제3중대 (예비)', isHeader: false },
                { text: '본부중대 수색분대', isHeader: false },
                { text: '대대 지휘소 경계 및 우발상황 투입', isHeader: false },
                { text: '대대 집결지 대기', isHeader: false },
              ],
              [
                { text: '화기중대', isHeader: false },
                { text: '81mm 박격포소대 2문', isHeader: false },
                { text: '공격준비사격 및 지속 화력지원', isHeader: false },
                { text: '화력진지 ○○좌표', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'mil-sec-2',
        title: '작전 실시 및 안전통제 계획',
        paragraphs: [
          {
            id: 'mil-p-3',
            text: '2. 훈련 간 안전통제 및 비상 구급 계획\n가. 혹서기/야간 훈련 간 온열질환자 및 낙상사고 예방 조치 철저\n나. 실탄/공포탄 수불 시 안전검사관 입회 3중 확인 실시',
            align: 'left',
            fontSize: 11,
          },
        ],
        tables: [
          {
            id: 'mil-tbl-safety',
            caption: '안전통제관 편성 및 의무 지원 계획',
            rows: [
              [
                { text: '통제 구역', isHeader: true },
                { text: '안전통제관 (계급/성명)', isHeader: true },
                { text: '비상 연락망', isHeader: true },
                { text: '구급차 대기 위치', isHeader: true },
              ],
              [
                { text: 'A축선 (기동로)', isHeader: false },
                { text: '대위 이강현 (작전과장)', isHeader: false },
                { text: '비화폰 #201', isHeader: false },
                { text: '1호 구급차 (○○삼거리)', isHeader: false },
              ],
              [
                { text: '화력진지', isHeader: false },
                { text: '상사 김영태 (포대장)', isHeader: false },
                { text: '비화폰 #204', isHeader: false },
                { text: '2호 구급차 (○○고지 진입로)', isHeader: false },
              ],
              [
                { text: '대대 지휘소', isHeader: false },
                { text: '중위 박성민 (군의관)', isHeader: false },
                { text: '비화폰 #209', isHeader: false },
                { text: '대대 구호소 의무텐트', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },

  // 6. [군대] 장병 휴가 신청서 및 출타자 보안서약서
  {
    id: 'military-leave',
    fileName: '[부대행정] 장병_정기휴가_신청서_및_보안서약서.hwpx',
    fileSize: '41.2 KB',
    fileType: 'sample',
    category: 'military',
    tag: '군대 · 휴가신청',
    description: '장병 출타/휴가 신청, 비상연락망, 군사보안 준수 서약 및 복귀 확인 양식',
    title: '장병 정기휴가(연가·포상) 신청서 및 출타자 보안 준수 서약서',
    lastModified: '2026-08-20 08:00',
    totalParagraphs: 12,
    totalTables: 2,
    fullText: `장병 휴가 신청서 및 출타자 보안 준수 서약서

1. 신청자 인적사항 및 휴가 일정
가. 소 속: 제○○보병사단 ○○여단 1대대 1중대 2소대
나. 계급 / 군번: 병장 / 24-71012345
다. 성 명: 김대한
라. 휴가 구분: 정기 연가 (4일) + 대대장 포상휴가 (2일) = 총 6일
마. 휴가 기간: 2026. 08. 26.(수) 08:00 ~ 2026. 08. 31.(월) 20:00 [5박 6일]
바. 행 선 지: 서울특별시 강남구 테헤란로 ○○ (자택)
사. 비상 연락처: 본인 (010-1234-5678), 부친 (010-9876-5432)

2. 출타자 5대 군사보안 및 군기강 준수 서약
하나, 본인은 출타 중 군사 비밀 및 군 내부 작전/부대 관련 사항을 일체 누설하지 않는다.
하나, SNS(인스타그램, 페이스북, 유튜브 등)에 군복 착용 사진 및 영내 시설 사진을 게시하지 않는다.
하나, 대민 마찰, 음주운전, 도박, 폭행 등 군인의 품위를 훼손하는 일체의 행위를 하지 않는다.
하나, 휴가 기간 중 1일 1회 소속 분대장에게 비상연락망을 통해 위치 및 이상 유무를 보고한다.
하나, 복귀 당일 지정된 시간(20:00)까지 단정한 복장으로 귀대할 것을 엄숙히 서약합니다.

2026년 08월 20일  신청인: 병장 김대한 (서명)

붙임: 지휘계선 결재 및 복귀 검문 확인표.  끝.`,
    sections: [
      {
        id: 'leave-sec-1',
        title: '신청서 제목 및 인적사항',
        paragraphs: [
          {
            id: 'leave-p-1',
            text: '장병 휴가 신청서 및 출타자 보안서약서',
            align: 'center',
            isBold: true,
            fontSize: 18,
            isHeading: true,
            headingLevel: 1,
          },
        ],
        tables: [
          {
            id: 'leave-tbl-info',
            caption: '출타 장병 인적사항 및 휴가 일정표',
            rows: [
              [
                { text: '소속 부대', isHeader: true },
                { text: '계급/군번', isHeader: true },
                { text: '성명', isHeader: true },
                { text: '휴가 종별', isHeader: true },
                { text: '휴가 기간', isHeader: true },
              ],
              [
                { text: '1대대 1중대 2소대', isHeader: false },
                { text: '병장 / 24-71012345', isHeader: false },
                { text: '김대한', isHeader: false },
                { text: '정기연가(4)+포상(2)', isHeader: false },
                { text: '2026.08.26~08.31 (5박6일)', isHeader: false },
              ],
              [
                { text: '행선지(주소)', isHeader: true },
                { text: '서울특별시 강남구 테헤란로 123', isHeader: false },
                { text: '비상연락망', isHeader: true },
                { text: '010-1234-5678 (부친 010-9876-5432)', isHeader: false },
                { text: '자택 거주', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
      {
        id: 'leave-sec-2',
        title: '보안 서약 및 결재선',
        paragraphs: [
          {
            id: 'leave-p-2',
            text: '출타자 5대 보안 및 군기강 준수 서약\n1. 군사비밀 누설 금지 및 영내 사진 SNS 업로드 절대 금지\n2. 음주운전, 폭행 등 대민 사고 원천 예방\n3. 1일 1회 이상유무 보고 및 복귀 시간(20:00) 엄수',
            align: 'left',
            fontSize: 11,
          },
          {
            id: 'leave-p-3',
            text: '지휘 계선 승인 및 복귀 확인',
            align: 'left',
            fontSize: 13,
            isBold: true,
            isHeading: true,
            headingLevel: 2,
          },
        ],
        tables: [
          {
            id: 'leave-tbl-approval',
            caption: '지휘관 결재 및 위병소 복귀 확인표',
            rows: [
              [
                { text: '구분', isHeader: true },
                { text: '분대장', isHeader: true },
                { text: '소대장', isHeader: true },
                { text: '중대장', isHeader: true },
                { text: '대대장(승인)', isHeader: true },
                { text: '위병소 복귀 확인', isHeader: true },
              ],
              [
                { text: '성명/서명', isHeader: false },
                { text: '하사 이민수 (인)', isHeader: false },
                { text: '중위 박준호 (인)', isHeader: false },
                { text: '대위 김태영 (인)', isHeader: false },
                { text: '중령 조상원 (인)', isHeader: false },
                { text: '당직사령 (서명)', isHeader: false },
              ],
              [
                { text: '확인일자', isHeader: false },
                { text: '2026. 08. 20.', isHeader: false },
                { text: '2026. 08. 20.', isHeader: false },
                { text: '2026. 08. 21.', isHeader: false },
                { text: '2026. 08. 21.', isHeader: false },
                { text: '2026. 08. 31. 19:40', isHeader: false },
              ],
            ],
          },
        ],
        rawText: '',
      },
    ],
  },
];
