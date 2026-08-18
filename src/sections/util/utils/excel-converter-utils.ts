import * as XLSX from 'xlsx';

/**
 * Read all sheet names from an uploaded Excel file (.xlsx, .xls)
 */
export async function readExcelSheetNames(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  return workbook.SheetNames || [];
}

/**
 * Convert Excel (.xlsx, .xls) sheet to CSV text
 */
export async function convertExcelToCsv(
  file: File,
  sheetNameOrIndex: string | number = 0
): Promise<{ csv: string; sheetName: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const targetSheetName =
    typeof sheetNameOrIndex === 'number'
      ? workbook.SheetNames[sheetNameOrIndex] || workbook.SheetNames[0]
      : sheetNameOrIndex;

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error('시트를 찾을 수 없습니다.');
  }

  const csv = XLSX.utils.sheet_to_csv(worksheet);
  return { csv, sheetName: targetSheetName };
}

/**
 * Convert Excel (.xlsx, .xls) sheet to JSON objects array
 */
export async function convertExcelToJson(
  file: File,
  sheetNameOrIndex: string | number = 0
): Promise<{ json: unknown[]; sheetName: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const targetSheetName =
    typeof sheetNameOrIndex === 'number'
      ? workbook.SheetNames[sheetNameOrIndex] || workbook.SheetNames[0]
      : sheetNameOrIndex;

  const worksheet = workbook.Sheets[targetSheetName];
  if (!worksheet) {
    throw new Error('시트를 찾을 수 없습니다.');
  }

  const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  return { json, sheetName: targetSheetName };
}

/**
 * Convert CSV text or JSON object/array to XLSX Blob
 */
export function convertDataToExcelBlob(data: string | unknown[], sheetName = 'Sheet1'): Blob {
  const workbook = XLSX.utils.book_new();
  let worksheet: XLSX.WorkSheet;

  if (typeof data === 'string') {
    // Try JSON first
    const trimmed = data.trim();
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      try {
        const parsed = JSON.parse(trimmed);
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        worksheet = XLSX.utils.json_to_sheet(arrayData);
      } catch {
        // Fallback to CSV parser
        const rows = trimmed.split('\n').map((row) => row.split(','));
        worksheet = XLSX.utils.aoa_to_sheet(rows);
      }
    } else {
      const rows = trimmed.split('\n').map((row) => row.split(','));
      worksheet = XLSX.utils.aoa_to_sheet(rows);
    }
  } else if (Array.isArray(data)) {
    worksheet = XLSX.utils.json_to_sheet(data);
  } else {
    worksheet = XLSX.utils.json_to_sheet([data]);
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}
