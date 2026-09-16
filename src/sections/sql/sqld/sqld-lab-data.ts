import type { Problem } from './types';

import { SAMPLE_DATASETS } from 'src/sections/public/sql/sample-datasets';

export interface PracticeTable {
  name: string;
  columns: string[];
  rows: Record<string, string | number | null>[];
}

const SQL_START = /^(SELECT|WITH|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|MERGE)\b/i;
const SQL_TOPIC =
  /\b(SELECT|WHERE|GROUP BY|HAVING|ORDER BY|JOIN|UNION|INSERT|UPDATE|DELETE|CREATE TABLE|ALTER TABLE|DROP TABLE|NULL|NVL|COUNT|SUM|AVG|RANK|ROWNUM|SUBSTR|CASE|SQL)\b/i;

// AlaSQL accepts Unicode column names only when they are bracket quoted.
// Keep literals, existing quoted identifiers, and comments untouched.
export function quoteUnicodeIdentifiers(query: string): string {
  return query.replace(
    /'(?:''|[^'])*'|"(?:""|[^"])*"|\[[^\]]*\]|--[^\n]*|\/\*[\s\S]*?\*\/|[\p{L}_][\p{L}\p{N}_$]*/gu,
    (token) =>
      /^[\p{L}_]/u.test(token) && [...token].some((character) => character.codePointAt(0)! > 127)
        ? `[${token}]`
        : token
  );
}

function cleanSql(value: string): string {
  return value
    .replace(/```(?:sql)?/gi, '')
    .split('\n')
    .map((line) => line.replace(/^\s*--\s*[①-⑳\d.()]+\s*/, '').trimEnd())
    .filter((line) => !/^\s*--/.test(line))
    .join('\n')
    .trim();
}

export function getPracticeQueries(problem: Problem): string[] {
  const content = [problem.question, problem.description].join('\n');
  const fenced = [...content.matchAll(/```(?:sql)?\s*([\s\S]*?)```/gi)].flatMap((match) => {
    const cleaned = cleanSql(match[1]);
    // Numbered statements in a single fence are common in SQLD questions.
    return cleaned.includes(';') ? cleaned.split(';').map((part) => part.trim()) : [cleaned];
  });
  const choices = problem.choices.map(cleanSql).filter((choice) => SQL_START.test(choice));
  return [...new Set([...fenced, ...choices].filter((query) => SQL_START.test(query)))];
}

export function isSqlPracticeProblem(problem: Problem): boolean {
  if (getPracticeQueries(problem).length > 0) return true;
  return SQL_TOPIC.test([problem.question, problem.description, ...problem.choices].join(' '));
}

function parseValue(raw: string): string | number | null {
  const value = raw
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/^`|`$/g, '')
    .trim();
  if (/^(NULL|-)$/i.test(value)) return null;
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function getPracticeTables(problem: Problem): PracticeTable[] {
  const lines = problem.description.split('\n');
  const tables: PracticeTable[] = [];
  let heading = '';

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    const bold = line.match(/^\*\*(.+?)\*\*$/);
    if (bold) heading = bold[1];
    if (!line.startsWith('|') || !lines[index + 1]?.trim().match(/^\|[\s|:-]+\|$/)) continue;

    const columns = line
      .split('|')
      .slice(1, -1)
      .map((part) => part.trim().replace(/`/g, ''));
    if (!columns.length || columns.some((column) => !/^[\p{L}_][\p{L}\p{N}_]*$/u.test(column)))
      continue;

    const rows: PracticeTable['rows'] = [];
    index += 2;
    while (index < lines.length && lines[index].trim().startsWith('|')) {
      const values = lines[index].trim().split('|').slice(1, -1);
      if (values.length === columns.length) {
        rows.push(
          Object.fromEntries(
            columns.map((column, columnIndex) => [column, parseValue(values[columnIndex])])
          )
        );
      }
      index += 1;
    }

    const name = heading.match(/^([\p{L}_][\p{L}\p{N}_]*)/u)?.[1] || `T${tables.length + 1}`;
    if (rows.length && !tables.some((table) => table.name.toUpperCase() === name.toUpperCase())) {
      tables.push({ name, columns, rows });
    }
    index -= 1;
  }

  if (tables.length) return tables;

  const standard = SAMPLE_DATASETS.find((dataset) => dataset.id === 'sqld_sqlp');
  return (standard?.tables || [])
    .filter((table) => ['emp', 'dept', 'emp_sample'].includes(table.name))
    .map((table) => ({
      name: table.name,
      columns: table.columns.map((column) => column.name),
      rows: table.initialData as PracticeTable['rows'],
    }));
}
