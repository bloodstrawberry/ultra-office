'use client';

import type { Problem } from '../types';
import type { PracticeTable } from '../sqld-lab-data';
import type { QueryResult } from 'src/sections/public/sql/types';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { loadAlaSql } from 'src/utils/alasql-loader';

import { KatexMath } from 'src/components/katex';
import { ChartRenderer } from 'src/components/chart';
import { MermaidDiagram } from 'src/components/mermaid';

import { SqlResultTable } from 'src/sections/public/sql/sql-result-table';

import { isRichTextEmpty, RichContentRenderer } from './rich-content-renderer';
import {
  isSqlQuery,
  cleanSqlForInput,
  getPracticeTables,
  getPracticeQueries,
  quoteUnicodeIdentifiers,
} from '../sqld-lab-data';

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
  problemIndex?: number;
}

export function SqldSqlPractice({ problem, problemKey, problemIndex }: Props) {
  const [open, setOpen] = useState(false);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [engine, setEngine] = useState<AlaSql | null>(null);
  const [error, setError] = useState('');
  const [flashFeedback, setFlashFeedback] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const queries = useMemo(() => getPracticeQueries(problem), [problem]);
  const tables = useMemo(() => getPracticeTables(problem), [problem]);
  const database = useMemo(
    () => `sqld_practice_${problemKey.replace(/[^a-zA-Z0-9_]/g, '_')}`,
    [problemKey]
  );

  const problemFormulas = Array.isArray(problem.formulas)
    ? problem.formulas.filter((f) => f && f.trim())
    : problem.formula && problem.formula.trim()
      ? [problem.formula.trim()]
      : [];

  const problemErds = Array.isArray(problem.erds)
    ? problem.erds.filter((e) => e && e.trim())
    : problem.erd && problem.erd.trim()
      ? [problem.erd.trim()]
      : [];

  const problemCharts = Array.isArray(problem.charts)
    ? problem.charts.filter((c) => c && c.trim())
    : problem.chart && problem.chart.trim()
      ? [problem.chart.trim()]
      : [];

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

  const handleSelectSql = useCallback((queryToInsert: string) => {
    const cleaned = cleanSqlForInput(queryToInsert);
    if (!cleaned) return;
    setSql(cleaned);
    setError('');
    setResult(null);
    setFlashFeedback('SQL 입력창에 반영되었습니다.');
    setTimeout(() => {
      setFlashFeedback(null);
    }, 1800);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PlayArrowRoundedIcon />}
        onClick={() => setOpen(true)}
        sx={{ fontWeight: 700 }}
      >
        SQL 실습
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="xl"
        fullWidth
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: 1480,
            height: { xs: '92vh', md: '88vh' },
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            m: { xs: 1, md: 2 },
          },
        }}
      >
        {/* Modal Title */}
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 3 },
            py: 1.75,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
              }}
            >
              {typeof problemIndex === 'number' ? problemIndex + 1 : 'Q'}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              SQL 실습 & 쿼리 검증
            </Typography>
            {problem.hashtags?.map((tag, tIdx) => (
              <Chip
                key={tIdx}
                label={tag}
                size="small"
                color="default"
                variant="outlined"
                sx={{ fontSize: 11, fontWeight: 600, height: 22 }}
              />
            ))}
          </Box>

          <IconButton
            size="small"
            onClick={() => setOpen(false)}
            aria-label="닫기"
            sx={{ color: 'text.secondary' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </DialogTitle>

        {/* Modal Main Content: Left & Right Split */}
        <DialogContent
          dividers
          sx={{
            p: 0,
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            flexGrow: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* ==================== LEFT PANE: Question, Description, Choices ==================== */}
          <Box
            sx={{
              width: { xs: '100%', md: '46%' },
              borderRight: { md: 1 },
              borderBottom: { xs: 1, md: 0 },
              borderColor: 'divider',
              overflowY: 'auto',
              p: { xs: 2, md: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
              bgcolor: (t) => alpha(t.palette.background.default, 0.4),
            }}
          >
            {/* Guide Banner */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                border: (t) => `1px dashed ${alpha(t.palette.primary.main, 0.3)}`,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'primary.main', fontWeight: 700, lineHeight: 1.5 }}
              >
                💡 문제 지문 및 객관식 보기의 <strong>SQL 쿼리를 클릭</strong>하면 오른쪽 입력창에
                바로 입력되어 편리하게 테스트할 수 있습니다.
              </Typography>
            </Box>

            {/* Problem Question */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: 13,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                문제
              </Typography>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 1.5,
                  bgcolor: 'background.paper',
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <RichContentRenderer
                  content={problem.question}
                  idPrefix="modal_question"
                  onSqlClick={handleSelectSql}
                  sx={{
                    '& p': {
                      fontSize: 15,
                      fontWeight: 700,
                      lineHeight: 1.8,
                      color: 'text.primary',
                      m: 0,
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Problem Description (지문 / 표 / 코드 등) */}
            {!isRichTextEmpty(problem.description) && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 800,
                    fontSize: 13,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  지문 / 예제 내용
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'divider',
                  }}
                >
                  <RichContentRenderer
                    content={problem.description}
                    idPrefix="modal_desc"
                    onSqlClick={handleSelectSql}
                  />
                </Box>
              </Box>
            )}

            {/* Formulas if present */}
            {problemFormulas.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <FunctionsRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    수식
                  </Typography>
                </Box>
                {problemFormulas.map((formulaText, fIdx) => (
                  <Box
                    key={fIdx}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: 'background.paper',
                      border: 1,
                      borderColor: 'divider',
                    }}
                  >
                    <KatexMath math={formulaText} />
                  </Box>
                ))}
              </Box>
            )}

            {/* ERD Diagrams if present */}
            {problemErds.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <SchemaRoundedIcon sx={{ fontSize: 18, color: 'info.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'info.main' }}>
                    ERD 다이어그램
                  </Typography>
                </Box>
                {problemErds.map((erdText, eIdx) => (
                  <MermaidDiagram key={eIdx} chart={erdText} idPrefix={`modal_erd_${eIdx}`} />
                ))}
              </Box>
            )}

            {/* Charts if present */}
            {problemCharts.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <BarChartRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                    차트
                  </Typography>
                </Box>
                {problemCharts.map((chartText, cIdx) => (
                  <ChartRenderer key={cIdx} chart={chartText} idPrefix={`modal_chart_${cIdx}`} />
                ))}
              </Box>
            )}

            {/* Choices Section */}
            {problem.choices?.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 800,
                      fontSize: 13,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                    }}
                  >
                    객관식 보기
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
                    SQL 항목 클릭 시 입력창 반영
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {problem.choices.map((choice, cIndex) => {
                    const choiceNum = cIndex + 1;
                    const isSql = isSqlQuery(choice);
                    const cleanedSql = cleanSqlForInput(choice);

                    return (
                      <Box
                        key={cIndex}
                        onClick={() => {
                          if (isSql) {
                            handleSelectSql(cleanedSql);
                          }
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          border: '1.5px solid',
                          borderColor: isSql ? 'primary.main' : 'divider',
                          bgcolor: isSql
                            ? (t) => alpha(t.palette.primary.main, 0.04)
                            : 'background.paper',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 1.5,
                          transition: 'all 0.15s ease',
                          ...(isSql && {
                            cursor: 'pointer',
                            '&:hover': {
                              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                              borderColor: 'primary.dark',
                              transform: 'translateY(-1px)',
                              boxShadow: (t) => t.customShadows?.z4 || 2,
                            },
                          }),
                        }}
                        title={isSql ? '클릭하여 SQL 입력창에 넣기' : undefined}
                      >
                        {/* Choice Number Badge */}
                        <Box
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: '50%',
                            bgcolor: isSql
                              ? 'primary.main'
                              : (t) => alpha(t.palette.grey[500], 0.16),
                            color: isSql ? 'primary.contrastText' : 'text.primary',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                            flexShrink: 0,
                            mt: 0.2,
                          }}
                        >
                          {choiceNum}
                        </Box>

                        {/* Choice Body */}
                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <RichContentRenderer
                            content={choice}
                            idPrefix={`modal_choice_${cIndex}`}
                            inline
                            onSqlClick={handleSelectSql}
                            sx={{
                              '& code': {
                                fontFamily: 'monospace',
                              },
                            }}
                          />

                          {/* Extra choice description if present */}
                          {!isRichTextEmpty(problem.choiceDescriptions?.[cIndex]) && (
                            <Box sx={{ mt: 0.5, color: 'text.secondary', fontSize: 13 }}>
                              <RichContentRenderer
                                content={problem.choiceDescriptions?.[cIndex] || ''}
                                idPrefix={`modal_choice_desc_${cIndex}`}
                                onSqlClick={handleSelectSql}
                              />
                            </Box>
                          )}

                          {/* Extra choice formula if present */}
                          {problem.choiceFormulas?.[cIndex]?.map((fText, fIdx) => (
                            <Box key={fIdx} sx={{ mt: 0.5 }}>
                              <KatexMath math={fText} />
                            </Box>
                          ))}
                        </Box>

                        {/* Action badge/button for SQL choice */}
                        {isSql && (
                          <Tooltip title="클릭하여 SQL 입력창에 넣기">
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 15 }} />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectSql(cleanedSql);
                              }}
                              sx={{
                                flexShrink: 0,
                                fontSize: 11,
                                fontWeight: 700,
                                py: 0.2,
                                px: 1,
                                height: 26,
                                minHeight: 26,
                                boxShadow: 'none',
                              }}
                            >
                              입력
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* ==================== RIGHT PANE: Practice, Query Input & Execution ==================== */}
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              overflowY: 'auto',
              p: { xs: 2, md: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Guide & Table previews */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography variant="body2" color="text.secondary">
                예제 데이터를 확인하고 SQL을 작성하거나 왼쪽에서 쿼리를 선택하여 실행해 보세요.
              </Typography>

              {/* Sample Tables */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {tables.map((table) => (
                  <Box
                    key={table.name}
                    sx={{
                      minWidth: 200,
                      maxWidth: '100%',
                      flex: '1 1 200px',
                      borderRadius: 1.5,
                      border: 1,
                      borderColor: 'divider',
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
                        borderBottom: 1,
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: 12 }}>
                        {table.name}
                      </Typography>
                      <Chip
                        label={`${table.rows.length}행`}
                        size="small"
                        sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                      />
                    </Box>

                    <TableContainer sx={{ maxHeight: 150 }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {table.columns.map((column) => (
                              <TableCell
                                key={column}
                                sx={{ py: 0.5, px: 1, fontSize: 12, fontWeight: 700 }}
                              >
                                {column}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {table.rows.map((row, index) => (
                            <TableRow key={index} hover>
                              {table.columns.map((column) => (
                                <TableCell key={column} sx={{ py: 0.5, px: 1, fontSize: 12 }}>
                                  {row[column] === null ? (
                                    <Box
                                      component="span"
                                      sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                                    >
                                      NULL
                                    </Box>
                                  ) : (
                                    String(row[column])
                                  )}
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
            </Box>

            {/* Quick Practice Queries (Buttons) */}
            {queries.length > 1 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                  빠른 SQL 예시 선택
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {queries.map((query, index) => (
                    <Button
                      key={`${index}-${query}`}
                      size="small"
                      variant={sql.trim() === query.trim() ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => handleSelectSql(query)}
                      sx={{
                        fontSize: 12,
                        py: 0.4,
                        px: 1.2,
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      SQL 예시 {index + 1}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* SQL Input Area */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  SQL 입력
                </Typography>
                {flashFeedback && (
                  <Chip
                    icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                    label={flashFeedback}
                    size="small"
                    color="success"
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: 12, height: 24 }}
                  />
                )}
              </Box>

              <TextField
                inputRef={inputRef}
                multiline
                minRows={5}
                maxRows={12}
                fullWidth
                value={sql}
                onChange={(event) => setSql(event.target.value)}
                placeholder="실행할 SQL 쿼리를 입력하세요..."
                slotProps={{
                  htmlInput: {
                    spellCheck: false,
                    style: { fontFamily: 'monospace', fontSize: 13, lineHeight: 1.6 },
                  },
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    run();
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
                    ...(flashFeedback && {
                      boxShadow: (t) => `0 0 0 2px ${t.palette.primary.main}`,
                    }),
                  },
                }}
              />
            </Box>

            {/* Execution Buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowRoundedIcon />}
                disabled={!engine}
                onClick={run}
                sx={{ fontWeight: 700 }}
              >
                실행 (Ctrl + Enter)
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<RestartAltRoundedIcon />}
                disabled={!engine}
                onClick={reset}
                sx={{ fontWeight: 600 }}
              >
                초기화
              </Button>
            </Box>

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ py: 0.5 }}>
                {error}
              </Alert>
            )}

            {/* Query Result */}
            <Box sx={{ minHeight: 180, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                실행 결과 {result && `(${result.rowCount}행, ${result.executionTimeMs}ms)`}
              </Typography>
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1.5,
                  minHeight: 140,
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                }}
              >
                <SqlResultTable result={result} />
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" color="inherit" onClick={() => setOpen(false)}>
            닫기 (ESC)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
