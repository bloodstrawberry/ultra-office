import * as yaml from 'js-yaml';
import Papa from 'papaparse';
import * as xmlJs from 'xml-js';

// ----------------------------------------------------------------------
// 4-Way Data Format Converter (JSON <-> YAML <-> XML <-> CSV)
// ----------------------------------------------------------------------

export type DataFormat = 'json' | 'yaml' | 'xml' | 'csv';

/**
 * Parses input string according to source format into a JavaScript object/array
 */
export function parseDataToJs(input: string, format: DataFormat): unknown {
  const trimmed = input.trim();
  if (!trimmed) return null;

  switch (format) {
    case 'json':
      return JSON.parse(trimmed);

    case 'yaml':
      return yaml.load(trimmed);

    case 'xml': {
      const parsed = xmlJs.xml2js(trimmed, { compact: true });
      return parsed;
    }

    case 'csv': {
      const result = Papa.parse(trimmed, { header: true, dynamicTyping: true });
      if (result.errors && result.errors.length > 0 && result.data.length === 0) {
        throw new Error(result.errors[0].message);
      }
      return result.data;
    }

    default:
      throw new Error(`지원하지 않는 포맷입니다: ${format}`);
  }
}

/**
 * Converts a JavaScript object/array into target format string
 */
export function formatJsToData(data: unknown, format: DataFormat): string {
  if (data === null || data === undefined) return '';

  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);

    case 'yaml':
      return yaml.dump(data, { indent: 2 });

    case 'xml': {
      const obj = typeof data === 'object' && data !== null ? data : { root: { item: data } };
      return xmlJs.js2xml(obj, { compact: true, spaces: 2 });
    }

    case 'csv': {
      if (Array.isArray(data)) {
        return Papa.unparse(data);
      }
      if (typeof data === 'object' && data !== null) {
        return Papa.unparse([data as Record<string, unknown>]);
      }
      return String(data);
    }

    default:
      throw new Error(`지원하지 않는 포맷입니다: ${format}`);
  }
}

/**
 * Converts data between any of JSON, YAML, XML, and CSV
 */
export function convertDataFormat(input: string, from: DataFormat, to: DataFormat): string {
  if (!input.trim()) return '';
  if (from === to) return input;

  const jsObj = parseDataToJs(input, from);
  return formatJsToData(jsObj, to);
}

// ----------------------------------------------------------------------
// TypeScript Interface Generator
// ----------------------------------------------------------------------

export function generateTypeScriptInterface(jsonStr: string, rootName = 'RootObject'): string {
  const parsed = JSON.parse(jsonStr);
  const sample = Array.isArray(parsed) ? parsed[0] : parsed;

  if (!sample || typeof sample !== 'object') {
    return `export type ${rootName} = ${typeof sample};`;
  }

  const interfaces: string[] = [];

  function generateInterface(obj: Record<string, unknown>, name: string): string {
    const lines: string[] = [`export interface ${name} {`];

    Object.entries(obj).forEach(([key, val]) => {
      const sanitizedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;

      if (val === null || val === undefined) {
        lines.push(`  ${sanitizedKey}?: unknown;`);
      } else if (Array.isArray(val)) {
        if (val.length === 0) {
          lines.push(`  ${sanitizedKey}: unknown[];`);
        } else if (typeof val[0] === 'object' && val[0] !== null) {
          const subName = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}Item`;
          generateInterface(val[0] as Record<string, unknown>, subName);
          lines.push(`  ${sanitizedKey}: ${subName}[];`);
        } else {
          lines.push(`  ${sanitizedKey}: ${typeof val[0]}[];`);
        }
      } else if (typeof val === 'object') {
        const subName = `${name}${key.charAt(0).toUpperCase() + key.slice(1)}`;
        generateInterface(val as Record<string, unknown>, subName);
        lines.push(`  ${sanitizedKey}: ${subName};`);
      } else {
        lines.push(`  ${sanitizedKey}: ${typeof val};`);
      }
    });

    lines.push('}');
    const ifaceCode = lines.join('\n');
    interfaces.unshift(ifaceCode);
    return name;
  }

  generateInterface(sample as Record<string, unknown>, rootName);
  return interfaces.join('\n\n');
}

// ----------------------------------------------------------------------
// SQL DDL / DML Generator
// ----------------------------------------------------------------------

export function generateSqlFromData(
  jsonStr: string,
  tableName = 'my_table'
): { createTable: string; insertQueries: string } {
  const parsed = JSON.parse(jsonStr);
  const dataList: Record<string, unknown>[] = Array.isArray(parsed) ? parsed : [parsed];

  if (dataList.length === 0 || typeof dataList[0] !== 'object' || dataList[0] === null) {
    throw new Error('유효한 객체 배열이 아닙니다.');
  }

  const sample = dataList[0];
  const keys = Object.keys(sample);

  // 1. CREATE TABLE
  const colDefs = keys.map((key) => {
    const val = sample[key];
    let colType = 'VARCHAR(255)';

    if (typeof val === 'number') {
      colType = Number.isInteger(val) ? 'INT' : 'DECIMAL(10,2)';
    } else if (typeof val === 'boolean') {
      colType = 'BOOLEAN';
    } else if (val instanceof Date || (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val))) {
      colType = 'TIMESTAMP';
    } else if (typeof val === 'object' && val !== null) {
      colType = 'JSON';
    }

    return `  \`${key}\` ${colType}`;
  });

  const createTable = `CREATE TABLE \`${tableName}\` (\n${colDefs.join(',\n')}\n);`;

  // 2. INSERT STATEMENTS
  const insertLines = dataList.map((row) => {
    const values = keys.map((k) => {
      const v = row[k];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number' || typeof v === 'boolean') return String(v);
      if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'`;
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO \`${tableName}\` (\`${keys.join('`, `')}\`) VALUES (${values.join(', ')});`;
  });

  const insertQueries = insertLines.join('\n');

  return { createTable, insertQueries };
}

// ----------------------------------------------------------------------
// Base64 & Hex Tools
// ----------------------------------------------------------------------

export function encodeStringToBase64(text: string): string {
  const utf8Bytes = new TextEncoder().encode(text);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i += 1) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

export function decodeBase64ToString(base64: string): string {
  const binary = atob(base64.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}
