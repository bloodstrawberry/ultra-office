import Papa from 'papaparse';

export type StockPoint = {
  date: string;
  open?: number;
  high?: number;
  low?: number;
  close: number;
  volume?: number;
};

const HEADER_ALIASES: Record<string, string[]> = {
  date: ['date', 'time', 'timestamp', '날짜', '일자', '시간'],
  open: ['open', '시가'],
  high: ['high', '고가'],
  low: ['low', '저가'],
  close: ['close', 'closingprice', '종가', '가격'],
  volume: ['volume', 'vol', '거래량'],
};

function normalized(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s_\-()]/g, '');
}

function parseNumber(value: string | undefined) {
  if (value === undefined || !value.trim()) return undefined;
  const number = Number(value.trim().replace(/,/g, ''));
  return Number.isFinite(number) ? number : NaN;
}

export function parseStockData(input: string): StockPoint[] {
  const parsed = Papa.parse<string[]>(input.trim().replace(/^\uFEFF/, ''), {
    skipEmptyLines: 'greedy',
  });

  if (parsed.errors.length)
    throw new Error(`CSV 형식을 확인해 주세요: ${parsed.errors[0].message}`);

  const rows = parsed.data.map((row) => row.map((cell) => cell.trim()));
  if (!rows.length) throw new Error('주가 데이터를 입력해 주세요.');

  const first = rows[0].map(normalized);
  const hasHeader = first.some((cell) => Object.values(HEADER_ALIASES).flat().includes(cell));
  const columns: Record<string, number> = {};

  if (hasHeader) {
    Object.entries(HEADER_ALIASES).forEach(([key, aliases]) => {
      columns[key] = first.findIndex((cell) => aliases.includes(cell));
    });
  } else if (rows[0].length >= 5) {
    Object.assign(columns, { date: 0, open: 1, high: 2, low: 3, close: 4, volume: 5 });
  } else {
    Object.assign(columns, { date: 0, open: -1, high: -1, low: -1, close: 1, volume: 2 });
  }

  if (columns.date < 0 || columns.close < 0) {
    throw new Error('날짜(date)와 종가(close) 열이 필요합니다.');
  }

  const dataRows = hasHeader ? rows.slice(1) : rows;
  if (!dataRows.length) throw new Error('헤더 아래에 주가 데이터를 입력해 주세요.');
  if (dataRows.length > 1000)
    throw new Error('한 번에 최대 1,000개의 데이터만 표시할 수 있습니다.');

  const points = dataRows.map((row, index) => {
    const line = index + (hasHeader ? 2 : 1);
    const get = (key: string) => (columns[key] >= 0 ? row[columns[key]] : undefined);
    const date = get('date')?.trim() ?? '';
    const close = parseNumber(get('close'));
    const open = parseNumber(get('open'));
    const high = parseNumber(get('high'));
    const low = parseNumber(get('low'));
    const volume = parseNumber(get('volume'));

    if (!date || close === undefined || !Number.isFinite(close) || close < 0) {
      throw new Error(`${line}행의 날짜 또는 종가를 확인해 주세요.`);
    }
    if (
      [open, high, low, volume].some(
        (value) => value !== undefined && (!Number.isFinite(value) || value < 0)
      )
    ) {
      throw new Error(`${line}행에는 0 이상의 숫자를 입력해 주세요.`);
    }
    const ohlc = [open, high, low].filter((value) => value !== undefined);
    if (ohlc.length !== 0 && ohlc.length !== 3) {
      throw new Error(`${line}행의 시가·고가·저가는 모두 입력하거나 모두 비워 주세요.`);
    }
    if (
      ohlc.length === 3 &&
      (high! < Math.max(open!, close) || low! > Math.min(open!, close) || high! < low!)
    ) {
      throw new Error(`${line}행의 고가·저가가 시가·종가 범위와 맞지 않습니다.`);
    }

    return { date, open, high, low, close, volume };
  });

  return points;
}

export const SAMPLE_CSV = `date,open,high,low,close,volume
2026-09-01,102,106,100,104,18200
2026-09-02,104,108,103,107,21500
2026-09-03,107,109,102,103,24300
2026-09-04,103,105,99,101,19800
2026-09-07,101,104,100,103,15600
2026-09-08,103,111,102,109,28600
2026-09-09,109,113,107,112,32100
2026-09-10,112,114,108,110,22400
2026-09-11,110,112,105,106,30100
2026-09-14,106,108,103,105,18500
2026-09-15,105,110,104,109,21300
2026-09-16,109,115,108,113,33800
2026-09-17,113,117,111,116,36400
2026-09-18,116,118,112,114,24200
2026-09-21,114,115,109,111,27800
2026-09-22,111,113,107,108,25900
2026-09-23,108,112,106,111,19700
2026-09-24,111,116,110,115,31300
2026-09-25,115,119,113,118,38200
2026-09-28,118,121,116,120,40500
2026-09-29,120,122,115,117,35200
2026-09-30,117,120,114,119,29100`;
