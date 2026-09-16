'use client';

import type { Problem } from '../types';
import type { PracticeTable } from '../sqld-lab-data';
import type { QueryResult } from 'src/sections/public/sql/types';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { loadAlaSql } from 'src/utils/alasql-loader';

import { SqlResultTable } from 'src/sections/public/sql/sql-result-table';

import { getPracticeTables, getPracticeQueries, quoteUnicodeIdentifiers } from '../sqld-lab-data';

type AlaSql = ((query: string, params?: unknown[]) => unknown) & {
  databases?: Record<string, unknown>;
};

function quoted(identifier: string) {
  return `[${identifier.replace(/]/g, ']]')}]`;
}

function seedTables(alasql: AlaSql, database: string, tables: PracticeTable[]) {
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

interface Props {
  problem: Problem;
  problemKey: string;
}

export function SqldSqlPractice({ problem, problemKey }: Props) {
  const [open, setOpen] = useState(false);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [engine, setEngine] = useState<AlaSql | null>(null);
  const [error, setError] = useState('');
  const queries = useMemo(() => getPracticeQueries(problem), [problem]);
  const tables = useMemo(() => getPracticeTables(problem), [problem]);
  const database = useMemo(
    () => `sqld_practice_${problemKey.replace(/[^a-zA-Z0-9_]/g, '_')}`,
    [problemKey]
  );

  useEffect(() => {
    setOpen(false);
    setSql(queries[0] || `SELECT * FROM ${tables[0]?.name || 'DUAL'};`);
    setResult(null);
    setError('');
  }, [problemKey, queries, tables]);

  useEffect(() => {
    if (!open || engine) return undefined;
    let active = true;
    loadAlaSql()
      .then((instance) => {
        // AlaSQL itself is callable, so pass a state updater that returns it.
        if (active) setEngine(() => instance as AlaSql);
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      active = false;
    };
  }, [open, engine]);

  useEffect(() => {
    if (!open || !engine) return;
    try {
      seedTables(engine, database, tables);
      setResult(null);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [open, engine, database, tables]);

  const run = () => {
    if (!engine) return;
    const query = sql.trim().replace(/;\s*$/, '');
    if (!query) {
      setError('실행할 SQL을 입력해 주세요.');
      return;
    }
    try {
      engine(`USE ${database}`);
      const started = performance.now();
      const normalized = query
        .replace(/\bMINUS\b/gi, 'EXCEPT')
        .replace(/FETCH\s+FIRST\s+(\d+)\s+ROWS?\s+ONLY/gi, 'LIMIT $1');
      const raw = engine(quoteUnicodeIdentifiers(normalized));
      const rows = Array.isArray(raw)
        ? (raw as Record<string, unknown>[])
        : [{ affected_rows: raw }];
      setResult({
        columns: rows.length && typeof rows[0] === 'object' ? Object.keys(rows[0]) : [],
        rows,
        rowCount: rows.length,
        executionTimeMs: Math.round((performance.now() - started) * 10) / 10,
      });
      setError('');
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const reset = () => {
    if (!engine) return;
    try {
      seedTables(engine, database, tables);
      setSql(queries[0] || `SELECT * FROM ${tables[0]?.name || 'DUAL'};`);
      setResult(null);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  return (
    <Box>
      <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
        SQL 실습
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg" fullWidth scroll="paper">
        <DialogTitle sx={{ fontWeight: 800 }}>SQL 실습</DialogTitle>
        <DialogContent dividers>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              예제 데이터를 확인하고 SQL을 바꿔 실행 결과를 비교해 보세요. 이 실습은 현재 문제의
              임시 데이터에서 실행됩니다.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {tables.map((table) => (
                <Box key={table.name} sx={{ minWidth: 220, maxWidth: '100%', flex: '1 1 220px' }}>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    {table.name} ({table.rows.length}행)
                  </Typography>
                  <TableContainer
                    sx={{ maxHeight: 180, border: 1, borderColor: 'divider', borderRadius: 1 }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {table.columns.map((column) => (
                            <TableCell key={column}>{column}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {table.rows.map((row, index) => (
                          <TableRow key={index}>
                            {table.columns.map((column) => (
                              <TableCell key={column}>
                                {row[column] === null ? 'NULL' : String(row[column])}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
            {queries.length > 1 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {queries.map((query, index) => (
                  <Button
                    key={`${index}-${query}`}
                    size="small"
                    variant="outlined"
                    onClick={() => {
                      setSql(query);
                      setResult(null);
                      setError('');
                    }}
                  >
                    SQL 예시 {index + 1}
                  </Button>
                ))}
              </Box>
            )}
            <TextField
              label="SQL 입력"
              multiline
              minRows={5}
              maxRows={14}
              fullWidth
              value={sql}
              onChange={(event) => setSql(event.target.value)}
              slotProps={{
                htmlInput: { spellCheck: false, style: { fontFamily: 'monospace', fontSize: 13 } },
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                  event.preventDefault();
                  run();
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrowRoundedIcon />}
                disabled={!engine}
                onClick={run}
              >
                실행 (Ctrl + Enter)
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltRoundedIcon />}
                disabled={!engine}
                onClick={reset}
              >
                초기화
              </Button>
            </Box>
            {error && <Alert severity="error">{error}</Alert>}
            <Box sx={{ minHeight: 170 }}>
              <SqlResultTable result={result} />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
