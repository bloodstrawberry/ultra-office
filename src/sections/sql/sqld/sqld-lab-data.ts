import type { Problem, ChoiceLabTable, SqlPracticeExample } from './types';

import { SAMPLE_DATASETS } from 'src/sections/public/sql/sample-datasets';

import { getSqldLabOverride } from './sqld-lab-overrides';

export type PracticeTable = ChoiceLabTable;

export interface ResolvedPracticeExample extends SqlPracticeExample {
  /** Tables embedded by older choiceLabs records. */
  legacyTables?: PracticeTable[];
}

export interface ResolvedPracticeLab {
  tables: PracticeTable[];
  examples: ResolvedPracticeExample[];
}

const SQL_START =
  /\b(SELECT|WITH|INSERT\s+INTO|INSERT|UPDATE|DELETE\s+FROM|DELETE|MERGE\s+INTO|MERGE|CREATE\s+TABLE|CREATE\s+VIEW|CREATE|ALTER\s+TABLE|ALTER|DROP\s+TABLE|DROP\s+VIEW|DROP|TRUNCATE\s+TABLE|TRUNCATE|SAVEPOINT|ROLLBACK|COMMIT|GRANT|REVOKE|EXPLAIN|DESCRIBE|DESC)\b/i;

function isSqlStatement(query: string): boolean {
  const text = query.trim();
  if (!text) return false;
  if (/^SELECT\s/i.test(text)) {
    return (
      /\bFROM\b/i.test(text) ||
      /^SELECT\s+(?:\*|\d+|'|"|NULL\b|CASE\b|[A-Za-z_][\w$]*\s*\()/i.test(text)
    );
  }
  return /^(?:WITH\s+(?:RECURSIVE\s+)?[A-Za-z_][\w$]*\s+AS\s*\(|INSERT\s+(?:INTO|FIRST)\s+|UPDATE\s+.+?\s+SET\s+|DELETE\s+FROM\s+|MERGE\s+INTO\s+|CREATE\s+(?:TABLE|VIEW)\s+|ALTER\s+TABLE\s+|DROP\s+(?:TABLE|VIEW)\s+|TRUNCATE\s+TABLE\s+|SAVEPOINT\s+|ROLLBACK\b|COMMIT\b|GRANT\s+|REVOKE\s+|EXPLAIN\s+|DESCRIBE\s+|DESC\s+)/is.test(
    text
  );
}

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

export function cleanSql(value: string): string {
  return value
    .replace(/```(?:sql)?/gi, '')
    .split('\n')
    .map((line) => line.replace(/^\s*--\s*[①-⑳\d.()]+\s*/, '').trimEnd())
    .filter((line) => !/^\s*--/.test(line))
    .join('\n')
    .trim();
}

export function cleanSqlForInput(value: string): string {
  if (!value) return '';

  // 1. 마크다운 코드 블록 및 백틱 제거
  let text = value
    .replace(/```(?:sql)?/gi, '')
    .replace(/^`+|`+$/g, '')
    .trim();

  // 2. SQL 쿼리 시작 키워드 탐색 (앞의 '(나) SQL Server\n', '1. ', 'Oracle:' 등의 비-SQL 라벨/텍스트 제거)
  const match = text.match(SQL_START);
  if (match && typeof match.index === 'number') {
    let startIndex = match.index;
    const prefix = text.slice(0, startIndex);

    // 단, prefix 끝부분에 `(` 가 하나 열려있고, 라벨 괄호(예: `(가)`, `(1)`)가 아니라면 서브쿼리 여는 괄호일 수 있음
    if (/\(\s*$/.test(prefix) && !/\([가-힣\d\w\s-]+\)\s*$/u.test(prefix)) {
      startIndex = prefix.lastIndexOf('(');
    }

    text = text.slice(startIndex).trim();
  } else {
    // 키워드가 매칭되지 않은 경우라도 접두사 번호/라벨 제거 시도
    text = text.replace(/^[①-⑳\d]+[\s.)\]\-,:]+/u, '').trim();
    text = text.replace(/^\([가-힣\d\w\s-]+\)[\s:]*/u, '').trim();
    text = text.replace(/^\[(?:SQL|쿼리|보기)?\s*\d*\][\s:]*/i, '').trim();
  }

  // 3. 주석 라인 정리: 줄 단위 주석 중 라벨 주석 제거
  const lines = text
    .split('\n')
    .map((line) => line.replace(/^\s*--\s*[①-⑳\d.()]+\s*/, '').trimEnd())
    .filter((line) => !/^\s*--\s*(?:\([가-힣\d\w]+\)|SQL\s*\d+)/i.test(line));

  text = lines.join('\n').trim();

  // 4. 세미콜론 뒤에 붙은 비-SQL 부가 텍스트 제거 (예: `SELECT ...; (오답 설명)` -> `SELECT ...;`)
  const semicolonIndex = text.indexOf(';');
  if (semicolonIndex !== -1) {
    const afterSemicolon = text.slice(semicolonIndex + 1).trim();
    // 세미콜론 뒤의 내용이 다른 SQL 시작 키워드를 포함하지 않는 설명문인 경우 세미콜론까지만 취함
    if (afterSemicolon && !SQL_START.test(afterSemicolon)) {
      text = text.slice(0, semicolonIndex + 1);
    }
  }

  // 5. 끝에 세미콜론이 없는 단일 라인 쿼리면 세미콜론 붙여주기
  if (text && !text.endsWith(';') && !text.includes('\n')) {
    text = `${text};`;
  }

  return text;
}

export function isSqlQuery(text: string): boolean {
  if (!text) return false;
  const cleaned = cleanSqlForInput(text);
  return isSqlStatement(cleaned);
}

export function extractSqlFromText(text: string): string {
  if (!text) return '';
  const match = text.match(/```(?:sql)?\s*([\s\S]*?)```/i);
  if (match) {
    return cleanSqlForInput(match[1]);
  }
  const inlineMatch = text.match(/`([^`]+)`/);
  if (inlineMatch && isSqlQuery(inlineMatch[1])) {
    return cleanSqlForInput(inlineMatch[1]);
  }
  if (isSqlQuery(text)) {
    return cleanSqlForInput(text);
  }
  return '';
}

export function getPracticeLab(problem: Problem): ResolvedPracticeLab {
  if (problem.practiceLab) {
    return {
      tables: problem.practiceLab.tables || [],
      examples: problem.practiceLab.examples || [],
    };
  }

  const override = getSqldLabOverride(problem);
  if (override) return override;

  return {
    tables: [],
    examples: (problem.choiceLabs || []).map((item, index) => ({
      id: `legacy-${index}`,
      title: item.title || `${item.choiceNum}번 보기 예제`,
      sql: item.sql,
      description: item.table?.description || item.tables?.[0]?.description,
      choiceNum: item.choiceNum,
      legacyTables: item.tables?.length ? item.tables : item.table ? [item.table] : undefined,
    })),
  };
}

export function getExampleTables(
  lab: ResolvedPracticeLab,
  example: ResolvedPracticeExample | null,
  fallbackTables: PracticeTable[]
): PracticeTable[] {
  if (example?.legacyTables?.length) return example.legacyTables;
  if (lab.tables.length) {
    if (!example?.tableNames) return lab.tables;
    return lab.tables.filter((table) =>
      example.tableNames!.some((name) => name.toLowerCase() === table.name.toLowerCase())
    );
  }
  return fallbackTables;
}

export function getPracticeQueries(problem: Problem): string[] {
  const labQueries = getPracticeLab(problem).examples.map((item) => cleanSqlForInput(item.sql));
  const content = [
    problem.question,
    problem.description,
    ...(problem.choiceDescriptions || []),
  ].join('\n');
  const fenced = [...content.matchAll(/```(?:sql)?\s*([\s\S]*?)```/gi)].flatMap((match) => {
    const cleaned = cleanSqlForInput(match[1]);
    // Numbered statements in a single fence are common in SQLD questions.
    return cleaned.includes(';')
      ? cleaned
          .split(';')
          .map((part) => cleanSqlForInput(part))
          .filter(Boolean)
      : [cleaned];
  });
  const choices = problem.choices.map(cleanSqlForInput).filter(isSqlStatement);
  return [...new Set([...labQueries, ...fenced, ...choices].filter(isSqlStatement))];
}

export function isSqlPracticeProblem(problem: Problem): boolean {
  if (problem.sqlPracticeDisabled) return false;
  if (getPracticeLab(problem).examples.length > 0) return true;
  return getPracticeQueries(problem).length > 0;
}

function parseValue(raw: string): string | number | null {
  const value = raw
    .replace(/<[^>]+>/g, '')
    .replace(/\*\*/g, '')
    .replace(/^`|`$/g, '')
    .trim();
  if (/^(NULL|-)$/i.test(value)) return null;
  if (/^-?\d{1,3}(?:,\d{3})+(?:\.\d+)?$/.test(value)) return Number(value.replace(/,/g, ''));
  if (/^-?\d+(?:\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function getPracticeTables(problem: Problem): PracticeTable[] {
  if (problem.practiceLab?.tables?.length) return problem.practiceLab.tables;
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
    if (!columns.length || columns.some((column) => !column)) continue;

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

    if (/결과/.test(heading)) continue;
    const name =
      heading.replace(/^원본\s+/u, '').match(/^([\p{L}_][\p{L}\p{N}_]*)/u)?.[1] ||
      `T${tables.length + 1}`;
    if (rows.length && !tables.some((table) => table.name.toUpperCase() === name.toUpperCase())) {
      tables.push({ name, columns, rows });
    }
    index -= 1;
  }

  if (tables.length) return tables;

  const standard = SAMPLE_DATASETS.find((dataset) => dataset.id === 'sqld_sqlp');
  return (standard?.tables || [])
    .filter((table) => ['emp', 'dept', 'emp_sample', 'null_sample'].includes(table.name))
    .map((table) => ({
      name: table.name,
      columns: table.columns.map((column) => column.name),
      rows: table.initialData as PracticeTable['rows'],
    }));
}
