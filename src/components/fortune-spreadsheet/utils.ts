import * as XLSX from 'xlsx';

export interface FortuneCellValue {
  v: string | number; // cell value
  m?: string; // formatted cell value (for display)
  bg?: string; // background color
  bl?: 0 | 1; // bold
  it?: 0 | 1; // italic
  fc?: string; // font color
  fs?: number; // font size
  ht?: 0 | 1 | 2; // horizontal alignment (0: center, 1: left, 2: right)
  vt?: 0 | 1 | 2; // vertical alignment (0: center, 1: top, 2: bottom)
  cl?: 0 | 1; // strike-through
  un?: 0 | 1; // underline
}

export interface FortuneCellData {
  r: number;
  c: number;
  v: FortuneCellValue | string | number | null;
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
  status?: number;
  order?: number;
  row?: number;
  column?: number;
  celldata?: FortuneCellData[];
  dataVerification?: Record<string, FortuneDataVerification>;
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

export function exportFortuneToCSV(sheet: FortuneSheetData): void {
  if (!sheet.celldata || sheet.celldata.length === 0) return;

  let maxR = 0;
  let maxC = 0;
  sheet.celldata.forEach((cell) => {
    if (cell.r > maxR) maxR = cell.r;
    if (cell.c > maxC) maxC = cell.c;
  });

  const grid: string[][] = Array.from({ length: maxR + 1 }, () =>
    Array.from({ length: maxC + 1 }, () => '')
  );

  sheet.celldata.forEach((cell) => {
    let valStr = '';
    if (cell.v !== null && cell.v !== undefined) {
      if (typeof cell.v === 'object') {
        const cellValObj = cell.v as FortuneCellValue;
        valStr = cellValObj.m !== undefined ? String(cellValObj.m) : String(cellValObj.v ?? '');
      } else {
        valStr = String(cell.v);
      }
    }
    grid[cell.r][cell.c] = valStr;
  });

  const csvContent = grid
    .map((row) =>
      row
        .map((val) => {
          const formatted = val.replace(/"/g, '""');
          return `"${formatted}"`;
        })
        .join(',')
    )
    .join('\n');

  const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvContent], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sheet.name || 'spreadsheet'}_export.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportFortuneToXLSX(sheet: FortuneSheetData): void {
  if (!sheet.celldata || sheet.celldata.length === 0) return;

  let maxR = 0;
  let maxC = 0;
  sheet.celldata.forEach((cell) => {
    if (cell.r > maxR) maxR = cell.r;
    if (cell.c > maxC) maxC = cell.c;
  });

  const grid: Array<Array<string | number>> = Array.from({ length: maxR + 1 }, () =>
    Array.from({ length: maxC + 1 }, () => '')
  );

  sheet.celldata.forEach((cell) => {
    let val: string | number = '';
    if (cell.v !== null && cell.v !== undefined) {
      if (typeof cell.v === 'object') {
        const cellValObj = cell.v as FortuneCellValue;
        val = cellValObj.v ?? '';
      } else {
        val = cell.v;
      }
    }
    grid[cell.r][cell.c] = val;
  });

  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(grid);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name || 'Sheet1');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sheet.name || 'spreadsheet'}_export.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
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
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0] || 'Imported Sheet';
  const worksheet = workbook.Sheets[sheetName];

  const celldata: FortuneCellData[] = [];
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

  for (let r = range.s.r; r <= range.e.r; r += 1) {
    for (let c = range.s.c; c <= range.e.c; c += 1) {
      const cellAddress = XLSX.utils.encode_cell({ r, c });
      const cell = worksheet[cellAddress];
      if (cell && cell.v !== undefined && cell.v !== null) {
        celldata.push({
          r,
          c,
          v: r === 0 ? { v: cell.v, bl: 1, bg: '#e0f2fe', ht: 0 } : { v: cell.v },
        });
      }
    }
  }

  return {
    name: sheetName,
    row: Math.max(60, range.e.r + 15),
    column: Math.max(26, range.e.c + 10),
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
