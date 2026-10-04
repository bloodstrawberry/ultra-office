import type { PracticeTable } from './sqld-lab-data';
import type { QueryResult } from 'src/sections/public/sql/types';

import { quoteUnicodeIdentifiers } from './sqld-lab-data';

export type AlaSql = (query: string, params?: unknown[]) => unknown;

function quoted(identifier: string) {
  return `[${identifier.replace(/]/g, ']]')}]`;
}

export function seedPracticeTables(alasql: AlaSql, database: string, tables: PracticeTable[]) {
  alasql(`DROP DATABASE IF EXISTS ${database}`);
  alasql(`CREATE DATABASE ${database}`);
  alasql(`USE ${database}`);
  tables.forEach((table) => {
    alasql(
      `CREATE TABLE ${quoted(table.name)} (${table.columns.map((column) => `${quoted(column)} STRING`).join(', ')})`
    );
    table.rows.forEach((row) => {
      const values = table.columns.map((column) => row[column]);
      alasql(
        `INSERT INTO ${quoted(table.name)} VALUES (${values.map(() => '?').join(', ')})`,
        values
      );
    });
  });
  alasql('CREATE TABLE IF NOT EXISTS DUAL (DUMMY STRING)');
  alasql("INSERT INTO DUAL VALUES ('X')");
}

export function executePracticeQuery(alasql: AlaSql, database: string, sql: string): QueryResult {
  alasql(`USE ${database}`);
  const started = performance.now();
  const normalized = sql
    .trim()
    .replace(/;\s*$/, '')
    .replace(/\bMINUS\b/gi, 'EXCEPT')
    .replace(/FETCH\s+FIRST\s+(\d+)\s+ROWS?\s+ONLY/gi, 'LIMIT $1');
  const raw = alasql(quoteUnicodeIdentifiers(normalized));
  const rows = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [{ affected_rows: raw }];
  return {
    columns: rows.length && typeof rows[0] === 'object' ? Object.keys(rows[0]) : [],
    rows,
    rowCount: rows.length,
    executionTimeMs: Math.round((performance.now() - started) * 10) / 10,
  };
}
