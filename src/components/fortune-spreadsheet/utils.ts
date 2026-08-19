import type { Sheet, CellMatrix } from '@fortune-sheet/core';

import ExcelJS from 'exceljs';

export interface FortuneCellValue {
  v?: string | number | boolean; // cell value
  m?: string | number; // formatted cell value (for display)
  bg?: string; // background color
  bl?: 0 | 1; // bold
  it?: 0 | 1; // italic
  fc?: string; // font color
  fs?: number; // font size
  ht?: 0 | 1 | 2; // horizontal alignment (0: center, 1: left, 2: right)
  vt?: 0 | 1 | 2; // vertical alignment (0: center, 1: top, 2: bottom)
  cl?: 0 | 1; // strike-through
  un?: 0 | 1; // underline
  f?: string; // formula
  tb?: 0 | 1 | 2; // text wrap (0: overflow, 1: clip, 2: wrap text)
  mc?: { r: number; c: number; rs?: number; cs?: number };
  [key: string]: unknown;
}

export interface FortuneCellData {
  r: number;
  c: number;
  v: FortuneCellValue | string | number | boolean | null;
}

export interface FortuneDataVerification {
  type: 'dropdown' | 'number' | 'text' | 'date' | 'checkbox';
  type2?: string | null;
  value1: string; // Comma separated values e.g. "S,A,B,C,F"
  value2?: string;
  checked?: boolean;
  prohibitInput?: boolean;
  hintShow?: boolean;
  hintValue?: string;
}

export interface FortuneSheetData {
  name: string;
  id?: string;
  color?: string;
  status?: number;
  order?: number;
  row?: number;
  column?: number;
  data?: CellMatrix | (FortuneCellValue | string | number | boolean | null)[][];
  celldata?: FortuneCellData[];
  dataVerification?: Record<string, FortuneDataVerification>;
  config?: {
    merge?: Record<string, { r: number; c: number; rs: number; cs: number }>;
    rowlen?: Record<string, number>;
    columnlen?: Record<string, number>;
    customHeight?: Record<string, number>;
    customWidth?: Record<string, number>;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export function generateEmptySheet(name = 'Sheet1', rows = 60, cols = 26): FortuneSheetData {
  return {
    name,
    row: rows,
    column: cols,
    status: 1,
    celldata: [],
  };
}

// 1. KPI Template
export function loadKpiTemplate(): FortuneSheetData {
  const celldata: FortuneCellData[] = [
    { r: 0, c: 0, v: { v: '사번', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },
    { r: 0, c: 1, v: { v: '성명', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },
    { r: 0, c: 2, v: { v: '부서', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },
    { r: 0, c: 3, v: { v: '직급', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },
    { r: 0, c: 4, v: { v: 'KPI 달성률', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },
    { r: 0, c: 5, v: { v: '최종 평가', bg: '#e0f2fe', bl: 1, ht: 0, vt: 0, fc: '#0369a1' } },

    { r: 1, c: 0, v: { v: 'EMP2026-001', ht: 0 } },
    { r: 1, c: 1, v: { v: '홍길동', ht: 0, bl: 1 } },
    { r: 1, c: 2, v: { v: '플랫폼개발팀', ht: 0 } },
    { r: 1, c: 3, v: { v: '수석연구원', ht: 0 } },
    { r: 1, c: 4, v: { v: '0.98', m: '98%', ht: 2, fc: '#1d4ed8' } },
    { r: 1, c: 5, v: { v: 'S (우수)', ht: 0, bl: 1, fc: '#15803d', bg: '#dcfce7' } },

    { r: 2, c: 0, v: { v: 'EMP2026-002', ht: 0 } },
    { r: 2, c: 1, v: { v: '이지은', ht: 0, bl: 1 } },
    { r: 2, c: 2, v: { v: '글로벌마케팅팀', ht: 0 } },
    { r: 2, c: 3, v: { v: '책임연구원', ht: 0 } },
    { r: 2, c: 4, v: { v: '0.92', m: '92%', ht: 2, fc: '#1d4ed8' } },
    { r: 2, c: 5, v: { v: 'A (양호)', ht: 0, bl: 1, fc: '#15803d', bg: '#dcfce7' } },

    { r: 3, c: 0, v: { v: 'EMP2026-003', ht: 0 } },
    { r: 3, c: 1, v: { v: '박서준', ht: 0, bl: 1 } },
    { r: 3, c: 2, v: { v: '디자인전략실', ht: 0 } },
    { r: 3, c: 3, v: { v: '선임연구원', ht: 0 } },
    { r: 3, c: 4, v: { v: '0.86', m: '86%', ht: 2 } },
    { r: 3, c: 5, v: { v: 'B (보통)', ht: 0 } },

    { r: 4, c: 0, v: { v: 'EMP2026-004', ht: 0 } },
    { r: 4, c: 1, v: { v: '정유나', ht: 0, bl: 1 } },
    { r: 4, c: 2, v: { v: '인사기획팀', ht: 0 } },
    { r: 4, c: 3, v: { v: '책임연구원', ht: 0 } },
    { r: 4, c: 4, v: { v: '0.96', m: '96%', ht: 2, fc: '#1d4ed8' } },
    { r: 4, c: 5, v: { v: 'S (우수)', ht: 0, bl: 1, fc: '#15803d', bg: '#dcfce7' } },

    { r: 5, c: 0, v: { v: 'EMP2026-005', ht: 0 } },
    { r: 5, c: 1, v: { v: '최동욱', ht: 0, bl: 1 } },
    { r: 5, c: 2, v: { v: '재무회계팀', ht: 0 } },
    { r: 5, c: 3, v: { v: '수석연구원', ht: 0 } },
    { r: 5, c: 4, v: { v: '0.62', m: '62%', ht: 2, fc: '#b91c1c' } },
    { r: 5, c: 5, v: { v: 'C (미흡)', ht: 0, bl: 1, fc: '#b91c1c', bg: '#fee2e2' } },
  ];

  return {
    name: '인사 성과 평가 (KPI)',
    row: 60,
    column: 26,
    status: 1,
    celldata,
  };
}

// 2. Budget Template
export function loadBudgetTemplate(): FortuneSheetData {
  const celldata: FortuneCellData[] = [
    { r: 0, c: 0, v: { v: '구분 (부서명)', bg: '#dcfce7', bl: 1, ht: 0, vt: 0, fc: '#166534' } },
    { r: 0, c: 1, v: { v: '2026 예산 (KRW)', bg: '#dcfce7', bl: 1, ht: 0, vt: 0, fc: '#166534' } },
    { r: 0, c: 2, v: { v: '상반기 집행액', bg: '#dcfce7', bl: 1, ht: 0, vt: 0, fc: '#166534' } },
    { r: 0, c: 3, v: { v: '잔여 예산', bg: '#dcfce7', bl: 1, ht: 0, vt: 0, fc: '#166534' } },
    { r: 0, c: 4, v: { v: '집행률', bg: '#dcfce7', bl: 1, ht: 0, vt: 0, fc: '#166534' } },

    { r: 1, c: 0, v: { v: '연구개발본부', bl: 1 } },
    { r: 1, c: 1, v: { v: 450000000, m: '450,000,000', ht: 2 } },
    { r: 1, c: 2, v: { v: 382000000, m: '382,000,000', ht: 2 } },
    { r: 1, c: 3, v: { v: 68000000, m: '68,000,000', ht: 2, bl: 1, fc: '#1d4ed8' } },
    { r: 1, c: 4, v: { v: '0.849', m: '84.9%', ht: 0, bl: 1 } },

    { r: 2, c: 0, v: { v: '글로벌사업본부', bl: 1 } },
    { r: 2, c: 1, v: { v: 280000000, m: '280,000,000', ht: 2 } },
    { r: 2, c: 2, v: { v: 245000000, m: '245,000,000', ht: 2 } },
    { r: 2, c: 3, v: { v: 35000000, m: '35,000,000', ht: 2, bl: 1, fc: '#1d4ed8' } },
    { r: 2, c: 4, v: { v: '0.875', m: '87.5%', ht: 0, bl: 1 } },

    { r: 3, c: 0, v: { v: '경영전략지원본부', bl: 1 } },
    { r: 3, c: 1, v: { v: 120000000, m: '120,000,000', ht: 2 } },
    { r: 3, c: 2, v: { v: 98000000, m: '98,000,000', ht: 2 } },
    { r: 3, c: 3, v: { v: 22000000, m: '22,000,000', ht: 2, bl: 1, fc: '#1d4ed8' } },
    { r: 3, c: 4, v: { v: '0.817', m: '81.7%', ht: 0, bl: 1 } },

    { r: 4, c: 0, v: { v: '디지털마케팅본부', bl: 1 } },
    { r: 4, c: 1, v: { v: 190000000, m: '190,000,000', ht: 2 } },
    { r: 4, c: 2, v: { v: 181000000, m: '181,000,000', ht: 2 } },
    { r: 4, c: 3, v: { v: 9000000, m: '9,000,000', ht: 2, bl: 1, fc: '#1d4ed8' } },
    { r: 4, c: 4, v: { v: '0.953', m: '95.3%', ht: 0, bl: 1 } },

    { r: 5, c: 0, v: { v: '전사 총합계', bl: 1, bg: '#fef9c3' } },
    { r: 5, c: 1, v: { v: 1040000000, m: '1,040,000,000', ht: 2, bl: 1, bg: '#fef9c3' } },
    { r: 5, c: 2, v: { v: 906000000, m: '906,000,000', ht: 2, bl: 1, bg: '#fef9c3' } },
    {
      r: 5,
      c: 3,
      v: { v: 134000000, m: '134,000,000', ht: 2, bl: 1, fc: '#1d4ed8', bg: '#fef9c3' },
    },
    { r: 5, c: 4, v: { v: '0.871', m: '87.1%', ht: 0, bl: 1, bg: '#fef9c3' } },
  ];

  return {
    name: '부서별 예산 집행현황',
    row: 60,
    column: 26,
    status: 1,
    celldata,
  };
}

// 3. Project WBS Template
export function loadWbsTemplate(): FortuneSheetData {
  const celldata: FortuneCellData[] = [
    { r: 0, c: 0, v: { v: '단계 (WBS)', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },
    { r: 0, c: 1, v: { v: '작업 항목명', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },
    { r: 0, c: 2, v: { v: '담당자', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },
    { r: 0, c: 3, v: { v: '예상 공수 (M/D)', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },
    { r: 0, c: 4, v: { v: '진행 상태', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },
    { r: 0, c: 5, v: { v: '마감 목표일', bg: '#f3e8ff', bl: 1, ht: 0, vt: 0, fc: '#6b21a8' } },

    { r: 1, c: 0, v: { v: '1.0 요구사항', bl: 1 } },
    { r: 1, c: 1, v: { v: '고객 요구사항 인터뷰 및 SRS 정의' } },
    { r: 1, c: 2, v: { v: '김기획' } },
    { r: 1, c: 3, v: { v: 10, ht: 2 } },
    { r: 1, c: 4, v: { v: '완료', bg: '#dcfce7', fc: '#15803d', bl: 1, ht: 0 } },
    { r: 1, c: 5, v: { v: '2026-08-01', ht: 0 } },

    { r: 2, c: 0, v: { v: '2.0 시스템 설계', bl: 1 } },
    { r: 2, c: 1, v: { v: 'UI/UX 디자인 시스템 및 DB 스키마 설계' } },
    { r: 2, c: 2, v: { v: '이설계' } },
    { r: 2, c: 3, v: { v: 15, ht: 2 } },
    { r: 2, c: 4, v: { v: '완료', bg: '#dcfce7', fc: '#15803d', bl: 1, ht: 0 } },
    { r: 2, c: 5, v: { v: '2026-08-10', ht: 0 } },

    { r: 3, c: 0, v: { v: '3.0 코어 개발', bl: 1 } },
    { r: 3, c: 1, v: { v: '프론트엔드 모듈 개발 및 API 연동' } },
    { r: 3, c: 2, v: { v: '박개발' } },
    { r: 3, c: 3, v: { v: 25, ht: 2 } },
    { r: 3, c: 4, v: { v: '진행중 (85%)', bg: '#fef3c7', fc: '#b45309', bl: 1, ht: 0 } },
    { r: 3, c: 5, v: { v: '2026-08-25', ht: 0 } },

    { r: 4, c: 0, v: { v: '4.0 QA & 검증', bl: 1 } },
    { r: 4, c: 1, v: { v: 'E2E 통합 테스트 및 성능 부하 검증' } },
    { r: 4, c: 2, v: { v: '최품질' } },
    { r: 4, c: 3, v: { v: 10, ht: 2 } },
    { r: 4, c: 4, v: { v: '대기', bg: '#f1f5f9', fc: '#64748b', ht: 0 } },
    { r: 4, c: 5, v: { v: '2026-08-31', ht: 0 } },
  ];

  return {
    name: '프로젝트 WBS 일정표',
    row: 60,
    column: 26,
    status: 1,
    celldata,
  };
}

// 4. P&L Statement Template
export function loadPlTemplate(): FortuneSheetData {
  const celldata: FortuneCellData[] = [
    { r: 0, c: 0, v: { v: '계정과목', bg: '#fee2e2', bl: 1, ht: 0, vt: 0, fc: '#991b1b' } },
    { r: 0, c: 1, v: { v: 'Q1 (1분기)', bg: '#fee2e2', bl: 1, ht: 0, vt: 0, fc: '#991b1b' } },
    { r: 0, c: 2, v: { v: 'Q2 (2분기)', bg: '#fee2e2', bl: 1, ht: 0, vt: 0, fc: '#991b1b' } },
    { r: 0, c: 3, v: { v: 'Q3 (3분기)', bg: '#fee2e2', bl: 1, ht: 0, vt: 0, fc: '#991b1b' } },
    { r: 0, c: 4, v: { v: '상반기 합계', bg: '#fee2e2', bl: 1, ht: 0, vt: 0, fc: '#991b1b' } },

    { r: 1, c: 0, v: { v: 'I. 매출액 (Sales)', bl: 1 } },
    { r: 1, c: 1, v: { v: 1250000000, m: '1,250,000,000', ht: 2 } },
    { r: 1, c: 2, v: { v: 1480000000, m: '1,480,000,000', ht: 2 } },
    { r: 1, c: 3, v: { v: 1650000000, m: '1,650,000,000', ht: 2 } },
    { r: 1, c: 4, v: { v: 4380000000, m: '4,380,000,000', ht: 2, bl: 1, fc: '#1d4ed8' } },

    { r: 2, c: 0, v: { v: 'II. 매출원가 (COGS)' } },
    { r: 2, c: 1, v: { v: 520000000, m: '520,000,000', ht: 2 } },
    { r: 2, c: 2, v: { v: 610000000, m: '610,000,000', ht: 2 } },
    { r: 2, c: 3, v: { v: 680000000, m: '680,000,000', ht: 2 } },
    { r: 2, c: 4, v: { v: 1810000000, m: '1,810,000,000', ht: 2 } },

    { r: 3, c: 0, v: { v: 'III. 매출총이익 (Gross Profit)', bl: 1, bg: '#f1f5f9' } },
    { r: 3, c: 1, v: { v: 730000000, m: '730,000,000', ht: 2, bl: 1, bg: '#f1f5f9' } },
    { r: 3, c: 2, v: { v: 870000000, m: '870,000,000', ht: 2, bl: 1, bg: '#f1f5f9' } },
    { r: 3, c: 3, v: { v: 970000000, m: '970,000,000', ht: 2, bl: 1, bg: '#f1f5f9' } },
    {
      r: 3,
      c: 4,
      v: { v: 2570000000, m: '2,570,000,000', ht: 2, bl: 1, bg: '#f1f5f9', fc: '#1d4ed8' },
    },

    { r: 4, c: 0, v: { v: 'IV. 판관비 (SG&A)' } },
    { r: 4, c: 1, v: { v: 340000000, m: '340,000,000', ht: 2 } },
    { r: 4, c: 2, v: { v: 390000000, m: '390,000,000', ht: 2 } },
    { r: 4, c: 3, v: { v: 420000000, m: '420,000,000', ht: 2 } },
    { r: 4, c: 4, v: { v: 1150000000, m: '1,150,000,000', ht: 2 } },

    { r: 5, c: 0, v: { v: 'V. 영업이익 (Operating Profit)', bl: 1, bg: '#fef9c3' } },
    {
      r: 5,
      c: 1,
      v: { v: 390000000, m: '390,000,000', ht: 2, bl: 1, bg: '#fef9c3', fc: '#15803d' },
    },
    {
      r: 5,
      c: 2,
      v: { v: 480000000, m: '480,000,000', ht: 2, bl: 1, bg: '#fef9c3', fc: '#15803d' },
    },
    {
      r: 5,
      c: 3,
      v: { v: 550000000, m: '550,000,000', ht: 2, bl: 1, bg: '#fef9c3', fc: '#15803d' },
    },
    {
      r: 5,
      c: 4,
      v: { v: 1420000000, m: '1,420,000,000', ht: 2, bl: 1, bg: '#fef9c3', fc: '#15803d' },
    },
  ];

  return {
    name: '손익 계산서 (P&L)',
    row: 60,
    column: 26,
    status: 1,
    celldata,
  };
}

// ----------------------------------------------------------------------
// Export & Import Handlers
// ----------------------------------------------------------------------

export interface ExtractGridOptions {
  useFormattedText?: boolean;
}

function extractValueFromCell(cell: unknown, useFormattedText: boolean): string | number {
  if (cell === null || cell === undefined) return '';

  if (typeof cell === 'number') return cell;
  if (typeof cell === 'boolean') return cell ? 'TRUE' : 'FALSE';
  if (typeof cell === 'string') return cell;

  if (typeof cell === 'object') {
    const cObj = cell as Record<string, unknown>;
    if (useFormattedText && cObj.m !== undefined && cObj.m !== null) {
      return String(cObj.m);
    }
    if (cObj.v !== undefined && cObj.v !== null) {
      if (typeof cObj.v === 'number') return cObj.v;
      if (typeof cObj.v === 'boolean') return cObj.v ? 'TRUE' : 'FALSE';
      return String(cObj.v);
    }
    if (cObj.m !== undefined && cObj.m !== null) {
      return String(cObj.m);
    }
    if (cObj.f !== undefined && cObj.f !== null) {
      return String(cObj.f);
    }
  }

  return '';
}

/**
 * Extract a 2D array of (string | number) from FortuneSheetData or Sheet.
 * Handles both `data` (2D matrix) and `celldata` (sparse array),
 * and automatically trims empty trailing rows and columns.
 */
export function extractGridFromSheet(
  sheet: FortuneSheetData | Sheet,
  options: ExtractGridOptions = {}
): (string | number)[][] {
  if (!sheet) return [];

  const { useFormattedText = false } = options;

  let maxR = -1;
  let maxC = -1;
  const cellMap = new Map<string, string | number>();

  // 1. Process 2D matrix (sheet.data) if present
  if (Array.isArray(sheet.data) && sheet.data.length > 0) {
    sheet.data.forEach((row, r) => {
      if (!Array.isArray(row)) return;
      row.forEach((cell, c) => {
        if (cell === null || cell === undefined) return;
        const val = extractValueFromCell(cell, useFormattedText);
        if (val !== '') {
          cellMap.set(`${r}_${c}`, val);
          if (r > maxR) maxR = r;
          if (c > maxC) maxC = c;
        }
      });
    });
  }

  // 2. Process celldata (sparse array) if present (and supplement any missing cells)
  if (Array.isArray(sheet.celldata) && sheet.celldata.length > 0) {
    sheet.celldata.forEach((cell) => {
      if (!cell || cell.r === undefined || cell.c === undefined) return;
      const key = `${cell.r}_${cell.c}`;
      if (!cellMap.has(key)) {
        const val = extractValueFromCell(cell.v, useFormattedText);
        if (val !== '') {
          cellMap.set(key, val);
          if (cell.r > maxR) maxR = cell.r;
          if (cell.c > maxC) maxC = cell.c;
        }
      }
    });
  }

  // If no data exists
  if (maxR === -1 || maxC === -1) {
    return [];
  }

  // Build rectangular grid up to maxR and maxC
  const grid: (string | number)[][] = Array.from({ length: maxR + 1 }, () =>
    Array.from({ length: maxC + 1 }, () => '')
  );

  cellMap.forEach((val, key) => {
    const [rStr, cStr] = key.split('_');
    const r = Number(rStr);
    const c = Number(cStr);
    if (r <= maxR && c <= maxC) {
      grid[r][c] = val;
    }
  });

  return grid;
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export FortuneSheet to CSV file and trigger browser download
 */
export function exportFortuneToCSV(
  sheet: FortuneSheetData | Sheet,
  customFileName?: string
): boolean {
  if (!sheet) return false;

  const grid = extractGridFromSheet(sheet, { useFormattedText: true });
  if (grid.length === 0) {
    return false;
  }

  const csvContent = grid
    .map((row) =>
      row
        .map((val) => {
          const str = String(val ?? '');
          const formatted = str.replace(/"/g, '""');
          return `"${formatted}"`;
        })
        .join(',')
    )
    .join('\r\n');

  // Add UTF-8 BOM so Excel opens Korean text cleanly without encoding issues
  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  });

  const rawName = customFileName || sheet.name || 'spreadsheet';
  const fileName = rawName.endsWith('.csv') ? rawName : `${rawName}.csv`;

  downloadBlob(blob, fileName);
  return true;
}

export function normalizeColorToArgb(color: unknown): string | null {
  if (!color || typeof color !== 'string') return null;
  const str = color.trim();
  if (!str || str === 'none' || str === 'transparent') return null;

  // 1. Hex format
  if (str.startsWith('#')) {
    const hex = str.slice(1);
    if (hex.length === 3) {
      const r = hex[0] + hex[0];
      const g = hex[1] + hex[1];
      const b = hex[2] + hex[2];
      return `FF${r}${g}${b}`.toUpperCase();
    }
    if (hex.length === 6) {
      return `FF${hex}`.toUpperCase();
    }
    if (hex.length === 8) {
      // #RRGGBBAA -> ARGB: AARRGGBB
      const rr = hex.slice(0, 2);
      const gg = hex.slice(2, 4);
      const bb = hex.slice(4, 6);
      const aa = hex.slice(6, 8);
      return `${aa}${rr}${gg}${bb}`.toUpperCase();
    }
    return null;
  }

  // 2. RGB / RGBA format
  const rgbMatch = str.match(
    /^rgba?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)$/i
  );
  if (rgbMatch) {
    const r = Math.min(255, Math.max(0, parseInt(rgbMatch[1], 10)))
      .toString(16)
      .padStart(2, '0');
    const g = Math.min(255, Math.max(0, parseInt(rgbMatch[2], 10)))
      .toString(16)
      .padStart(2, '0');
    const b = Math.min(255, Math.max(0, parseInt(rgbMatch[3], 10)))
      .toString(16)
      .padStart(2, '0');
    let a = 'ff';
    if (rgbMatch[4] !== undefined) {
      const alphaFloat = Math.min(1, Math.max(0, parseFloat(rgbMatch[4])));
      a = Math.round(alphaFloat * 255)
        .toString(16)
        .padStart(2, '0');
    }
    return `${a}${r}${g}${b}`.toUpperCase();
  }

  return null;
}

/**
 * Export single sheet or multiple sheets to XLSX with full styles & metadata using ExcelJS
 */
export async function exportFortuneToXLSX(
  data: (FortuneSheetData | Sheet) | (FortuneSheetData | Sheet)[],
  customFileName?: string
): Promise<boolean> {
  const sheets = Array.isArray(data) ? data : [data];
  if (sheets.length === 0) return false;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Ultra Office';
  workbook.created = new Date();

  let hasValidSheet = false;

  sheets.forEach((sheet, sheetIdx) => {
    if (!sheet) return;

    const rawSheetName = sheet.name || `Sheet${sheetIdx + 1}`;
    const sanitizedSheetName = rawSheetName.replace(/[:\\/?*[\]]/g, '_').substring(0, 31);

    const worksheet = workbook.addWorksheet(sanitizedSheetName);
    hasValidSheet = true;

    // 1. Tab Color
    if (sheet.color) {
      const tabArgb = normalizeColorToArgb(sheet.color);
      if (tabArgb) {
        worksheet.properties.tabColor = { argb: tabArgb };
      }
    }

    // 2. Collect all cells (combining sheet.data 2D and sheet.celldata sparse)
    const cellMap = new Map<string, FortuneCellValue>();
    let maxR = -1;
    let maxC = -1;

    // Process sheet.data (2D)
    if (Array.isArray(sheet.data) && sheet.data.length > 0) {
      sheet.data.forEach((row, r) => {
        if (!Array.isArray(row)) return;
        row.forEach((cell, c) => {
          if (cell === null || cell === undefined) return;
          const cellObj =
            typeof cell === 'object'
              ? (cell as FortuneCellValue)
              : ({ v: cell } as FortuneCellValue);
          if (cellObj.v !== undefined && cellObj.v !== null && cellObj.v !== '') {
            cellMap.set(`${r}_${c}`, cellObj);
            if (r > maxR) maxR = r;
            if (c > maxC) maxC = c;
          } else if (cellObj.bg || cellObj.fc || cellObj.f) {
            cellMap.set(`${r}_${c}`, cellObj);
            if (r > maxR) maxR = r;
            if (c > maxC) maxC = c;
          }
        });
      });
    }

    // Process sheet.celldata (1D)
    if (Array.isArray(sheet.celldata) && sheet.celldata.length > 0) {
      sheet.celldata.forEach((cItem) => {
        if (!cItem || cItem.r === undefined || cItem.c === undefined) return;
        const key = `${cItem.r}_${cItem.c}`;
        if (!cellMap.has(key)) {
          const cellObj =
            typeof cItem.v === 'object' && cItem.v !== null
              ? (cItem.v as FortuneCellValue)
              : ({ v: cItem.v ?? '' } as FortuneCellValue);
          cellMap.set(key, cellObj);
          if (cItem.r > maxR) maxR = cItem.r;
          if (cItem.c > maxC) maxC = cItem.c;
        }
      });
    }

    // 3. Apply cells and their metadata/styles
    cellMap.forEach((cellObj, key) => {
      const [rStr, cStr] = key.split('_');
      const r = Number(rStr); // 0-based
      const c = Number(cStr); // 0-based
      const excelCell = worksheet.getCell(r + 1, c + 1); // 1-based

      // (1) Value & Formula
      if (cellObj.f) {
        const formulaStr = String(cellObj.f).replace(/^=/, '');
        excelCell.value = {
          formula: formulaStr,
          result:
            typeof cellObj.v === 'number' ||
            typeof cellObj.v === 'string' ||
            typeof cellObj.v === 'boolean'
              ? cellObj.v
              : undefined,
        };
      } else if (cellObj.v !== undefined && cellObj.v !== null) {
        if (typeof cellObj.v === 'number') {
          excelCell.value = cellObj.v;
        } else if (typeof cellObj.v === 'boolean') {
          excelCell.value = cellObj.v;
        } else {
          excelCell.value = String(cellObj.v);
        }
      }

      // (2) Background color (Fill)
      if (cellObj.bg) {
        const bgArgb = normalizeColorToArgb(cellObj.bg);
        if (bgArgb) {
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: bgArgb },
          };
        }
      }

      // (3) Font formatting (Color, Size, Bold, Italic, Strike, Underline)
      const fontOpt: Partial<ExcelJS.Font> = {
        name: 'Malgun Gothic',
      };
      let hasFontMod = false;

      if (cellObj.fc) {
        const fcArgb = normalizeColorToArgb(cellObj.fc);
        if (fcArgb) {
          fontOpt.color = { argb: fcArgb };
          hasFontMod = true;
        }
      }

      if (cellObj.fs !== undefined && cellObj.fs !== null) {
        const fsNum =
          typeof cellObj.fs === 'number' ? cellObj.fs : parseInt(String(cellObj.fs), 10);
        if (!isNaN(fsNum) && fsNum > 0) {
          fontOpt.size = fsNum;
          hasFontMod = true;
        }
      } else {
        fontOpt.size = 11;
      }

      if (cellObj.bl === 1 || cellObj.bl === (true as unknown)) {
        fontOpt.bold = true;
        hasFontMod = true;
      }

      if (cellObj.it === 1 || cellObj.it === (true as unknown)) {
        fontOpt.italic = true;
        hasFontMod = true;
      }

      if (cellObj.cl === 1 || cellObj.cl === (true as unknown)) {
        fontOpt.strike = true;
        hasFontMod = true;
      }

      if (cellObj.un === 1 || cellObj.un === (true as unknown)) {
        fontOpt.underline = true;
        hasFontMod = true;
      }

      if (hasFontMod) {
        excelCell.font = fontOpt;
      }

      // (4) Alignment (Horizontal, Vertical, Wrap Text)
      const alignOpt: Partial<ExcelJS.Alignment> = {};
      let hasAlignMod = false;

      if (cellObj.ht !== undefined && cellObj.ht !== null) {
        if (cellObj.ht === 0 || (cellObj.ht as unknown) === '0') alignOpt.horizontal = 'center';
        else if (cellObj.ht === 1 || (cellObj.ht as unknown) === '1') alignOpt.horizontal = 'left';
        else if (cellObj.ht === 2 || (cellObj.ht as unknown) === '2') alignOpt.horizontal = 'right';
        hasAlignMod = true;
      }

      if (cellObj.vt !== undefined && cellObj.vt !== null) {
        if (cellObj.vt === 0 || (cellObj.vt as unknown) === '0') alignOpt.vertical = 'middle';
        else if (cellObj.vt === 1 || (cellObj.vt as unknown) === '1') alignOpt.vertical = 'top';
        else if (cellObj.vt === 2 || (cellObj.vt as unknown) === '2') alignOpt.vertical = 'bottom';
        hasAlignMod = true;
      }

      if (cellObj.tb === 2 || (cellObj.tb as unknown) === '2') {
        alignOpt.wrapText = true;
        hasAlignMod = true;
      }

      if (hasAlignMod) {
        excelCell.alignment = alignOpt;
      }
    });

    // 4. Merged Cells (from sheet.config.merge or cell.mc)
    const mergeConfig = (sheet as Sheet).config?.merge;
    if (mergeConfig && typeof mergeConfig === 'object') {
      Object.values(mergeConfig).forEach((m) => {
        if (
          m &&
          m.r !== undefined &&
          m.c !== undefined &&
          m.rs !== undefined &&
          m.cs !== undefined
        ) {
          try {
            worksheet.mergeCells(m.r + 1, m.c + 1, m.r + m.rs, m.c + m.cs);
          } catch {
            // ignore overlapping merge error
          }
        }
      });
    }

    // 5. Custom Row Heights
    const rowlen = (sheet as Sheet).config?.rowlen;
    if (rowlen && typeof rowlen === 'object') {
      Object.entries(rowlen).forEach(([rStr, pxHeight]) => {
        const r = Number(rStr);
        if (!isNaN(r) && typeof pxHeight === 'number' && pxHeight > 0) {
          worksheet.getRow(r + 1).height = pxHeight * 0.75;
        }
      });
    }

    // 6. Custom Column Widths
    const columnlen = (sheet as Sheet).config?.columnlen;
    if (columnlen && typeof columnlen === 'object') {
      Object.entries(columnlen).forEach(([cStr, pxWidth]) => {
        const c = Number(cStr);
        if (!isNaN(c) && typeof pxWidth === 'number' && pxWidth > 0) {
          worksheet.getColumn(c + 1).width = Math.max(8, pxWidth * 0.13);
        }
      });
    }
  });

  if (!hasValidSheet) {
    return false;
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const rawName =
    customFileName || (sheets.length === 1 && sheets[0]?.name ? sheets[0].name : 'spreadsheet');
  const fileName = rawName.endsWith('.xlsx') ? rawName : `${rawName}.xlsx`;

  downloadBlob(blob, fileName);
  return true;
}

export function importCSVToFortune(csvText: string, sheetName = 'CSV Import'): FortuneSheetData {
  const celldata: FortuneCellData[] = [];
  const lines = csvText.split(/\r?\n/);

  let rowCount = 0;
  let colCount = 0;

  lines.forEach((line, r) => {
    if (!line.trim()) return;

    const cells: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
      if (char === '"') {
        insideQuote = !insideQuote;
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length > colCount) colCount = cells.length;
    rowCount += 1;

    cells.forEach((val, c) => {
      if (val) {
        let cleanVal = val;
        if (cleanVal.startsWith('"') && cleanVal.endsWith('"')) {
          cleanVal = cleanVal.slice(1, -1);
        }
        const numVal = Number(cleanVal);
        const finalVal = !isNaN(numVal) && cleanVal !== '' ? numVal : cleanVal;

        celldata.push({
          r,
          c,
          v: r === 0 ? { v: finalVal, bl: 1, bg: '#f1f5f9', ht: 0 } : { v: finalVal },
        });
      }
    });
  });

  return {
    name: sheetName,
    row: Math.max(60, rowCount + 10),
    column: Math.max(26, colCount + 5),
    status: 1,
    celldata,
  };
}

export async function importXLSXToFortune(file: File): Promise<FortuneSheetData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const worksheet = workbook.worksheets[0];
  const sheetName = worksheet?.name || 'Imported Sheet';
  const celldata: FortuneCellData[] = [];

  let maxRow = 0;
  let maxCol = 0;

  if (worksheet) {
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      const r = rowNumber - 1; // 0-based
      if (r > maxRow) maxRow = r;

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const c = colNumber - 1; // 0-based
        if (c > maxCol) maxCol = c;

        const cellValueObj: FortuneCellValue = {};

        // Extract value
        if (cell.value !== null && cell.value !== undefined) {
          if (typeof cell.value === 'object') {
            if ('formula' in cell.value && cell.value.formula) {
              cellValueObj.f = `=${cell.value.formula}`;
              cellValueObj.v =
                cell.value.result !== undefined
                  ? (cell.value.result as string | number | boolean)
                  : '';
            } else if ('text' in cell.value && cell.value.text) {
              cellValueObj.v = String(cell.value.text);
            } else {
              cellValueObj.v = String(cell.text || '');
            }
          } else {
            cellValueObj.v = cell.value as string | number | boolean;
          }
        }

        // Extract Font
        if (cell.font) {
          if (cell.font.bold) cellValueObj.bl = 1;
          if (cell.font.italic) cellValueObj.it = 1;
          if (cell.font.strike) cellValueObj.cl = 1;
          if (cell.font.underline) cellValueObj.un = 1;
          if (cell.font.size) cellValueObj.fs = cell.font.size;
          if (cell.font.color && 'argb' in cell.font.color && cell.font.color.argb) {
            const argb = String(cell.font.color.argb);
            cellValueObj.fc = `#${argb.length === 8 ? argb.slice(2) : argb}`;
          }
        }

        // Extract Fill (Background)
        if (cell.fill && cell.fill.type === 'pattern' && cell.fill.fgColor) {
          const fg = cell.fill.fgColor;
          if ('argb' in fg && fg.argb) {
            const argb = String(fg.argb);
            cellValueObj.bg = `#${argb.length === 8 ? argb.slice(2) : argb}`;
          }
        }

        // Extract Alignment
        if (cell.alignment) {
          if (cell.alignment.horizontal === 'center') cellValueObj.ht = 0;
          else if (cell.alignment.horizontal === 'left') cellValueObj.ht = 1;
          else if (cell.alignment.horizontal === 'right') cellValueObj.ht = 2;

          if (cell.alignment.vertical === 'middle') cellValueObj.vt = 0;
          else if (cell.alignment.vertical === 'top') cellValueObj.vt = 1;
          else if (cell.alignment.vertical === 'bottom') cellValueObj.vt = 2;
        }

        celldata.push({
          r,
          c,
          v: cellValueObj,
        });
      });
    });
  }

  return {
    name: sheetName,
    row: Math.max(60, maxRow + 15),
    column: Math.max(26, maxCol + 10),
    status: 1,
    celldata,
  };
}

export function applyDropdownValidation(
  sheet: FortuneSheetData,
  startRow: number,
  column: number,
  options: string[],
  prohibitInput = true
): FortuneSheetData {
  const currentVerifications = { ...(sheet.dataVerification || {}) };
  const valString = options.join(',');

  for (let r = startRow; r < (sheet.row || 60); r += 1) {
    currentVerifications[`${r}_${column}`] = {
      type: 'dropdown',
      type2: null,
      value1: valString,
      prohibitInput,
      hintShow: true,
      hintValue: `선택 가능: ${valString}`,
    };
  }

  return {
    ...sheet,
    dataVerification: currentVerifications,
  };
}
