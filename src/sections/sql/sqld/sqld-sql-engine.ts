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
      table.ddl ||
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
  const tableNames = new Set(tables.map((table) => table.name));
  const aliases = new Set<string>();
  tables.forEach((table) => {
    [table.name.toLowerCase(), table.name.toUpperCase()].forEach((alias) => {
      if (tableNames.has(alias) || aliases.has(alias)) return;
      alasql(`CREATE VIEW ${quoted(alias)} AS SELECT * FROM ${quoted(table.name)}`);
      aliases.add(alias);
    });
  });
  alasql('CREATE TABLE IF NOT EXISTS DUAL (DUMMY STRING)');
  alasql("INSERT INTO DUAL VALUES ('X')");
}

export function readPracticeTables(
  alasql: AlaSql,
  database: string,
  tables: PracticeTable[]
): PracticeTable[] {
  alasql(`USE ${database}`);
  return tables.map((table) => {
    try {
      const rows = alasql(`SELECT * FROM ${quoted(table.name)}`);
      return Array.isArray(rows) ? { ...table, rows: rows as PracticeTable['rows'] } : table;
    } catch {
      return table;
    }
  });
}

export function executePracticeQuery(alasql: AlaSql, database: string, sql: string): QueryResult {
  alasql(`USE ${database}`);
  const started = performance.now();
  const normalized = sql
    .trim()
    .replace(/;\s*$/, '')
    .replace(/\bMINUS\b/gi, 'EXCEPT')
    .replace(/FETCH\s+FIRST\s+(\d+)\s+ROWS?\s+ONLY/gi, 'LIMIT $1');
  // AlaSQL does not parse an alias after the UPDATE target. Remove an unused
  // target alias while keeping the SQL shown in the practice editor intact.
  const queryForEngine = quoteUnicodeIdentifiers(normalized).replace(
    /^UPDATE\s+(\[[^\]]+\]|[A-Za-z_][\w$]*)\s+([A-Za-z_]\w*)\s+SET\b/i,
    (prefix, table: string, alias: string, _offset, statement: string) =>
      new RegExp(`\\b${alias}\\s*\\.`, 'i').test(statement.slice(prefix.length))
        ? prefix
        : `UPDATE ${table} SET`
  );
  const execution = alasql(queryForEngine);
  const raw =
    /;\s*(?:SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)\b/i.test(queryForEngine) &&
    Array.isArray(execution)
      ? execution[execution.length - 1]
      : execution;
  const rows: Record<string, unknown>[] = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : [{ affected_rows: raw }];
  const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  return {
    columns,
    rows: rows.map((row) =>
      Object.fromEntries(columns.map((column) => [column, row[column] ?? null]))
    ),
    rowCount: rows.length,
    executionTimeMs: Math.round((performance.now() - started) * 10) / 10,
  };
}
