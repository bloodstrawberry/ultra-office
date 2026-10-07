'use client';

import type { Problem } from '../types';
import type { AlaSql } from '../sqld-sql-engine';
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
import useMediaQuery from '@mui/material/useMediaQuery';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TableContainer from '@mui/material/TableContainer';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

import { loadAlaSql } from 'src/utils/alasql-loader';

import { KatexMath } from 'src/components/katex';
import { ChartRenderer } from 'src/components/chart';
import { MermaidDiagram } from 'src/components/mermaid';
import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { SqlResultTable } from 'src/sections/public/sql/sql-result-table';

import { getSqldLabOverride } from '../sqld-lab-overrides';
import { SqlWalkthroughDialog } from './sql-walkthrough-dialog';
import { isRichTextEmpty, RichContentRenderer } from './rich-content-renderer';
import { readPracticeTables, seedPracticeTables, executePracticeQuery } from '../sqld-sql-engine';
import {
  getPracticeLab,
  cleanSqlForInput,
  getExampleTables,
  getPracticeTables,
  getPracticeQueries,
  extractSqlFromText,
} from '../sqld-lab-data';

interface Props {
  problem: Problem;
  problemKey: string;
  problemIndex?: number;
}

function formatPracticeValue(value: string | number | null): string {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const nearestInteger = Math.round(value);
    if (Math.abs(value - nearestInteger) <= Number.EPSILON * Math.max(1, Math.abs(value)) * 2) {
      return String(nearestInteger);
    }
  }
  return String(value);
}

export function SqldSqlPractice({ problem, problemKey, problemIndex }: Props) {
  const isWide = useMediaQuery((theme) => theme.breakpoints.up('md'));
  const [open, setOpen] = useState(false);
  const [walkthroughOpen, setWalkthroughOpen] = useState(false);
  const [sql, setSql] = useState('');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [engine, setEngine] = useState<AlaSql | null>(null);
  const [error, setError] = useState('');
  const [flashFeedback, setFlashFeedback] = useState<string | null>(null);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState(-1);
  const [selectedExampleId, setSelectedExampleId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  const lab = useMemo(() => getPracticeLab(problem), [problem]);
  // Original dialect SQL can differ from the executable AlaSQL example.
  const hasLabOverride = Boolean(getSqldLabOverride(problem));
  const selectableChoices = useMemo(
    () =>
      problem.choices.map((choice, index) =>
        Boolean(
          lab.examples.some((example) => example.choiceNum === index + 1) ||
            extractSqlFromText(choice) ||
            extractSqlFromText(problem.choiceDescriptions?.[index] || '')
        )
      ),
    [lab, problem]
  );
  const hasSelectableChoices = selectableChoices.some(Boolean);
  const activeExample = lab.examples.find((example) => example.id === selectedExampleId) || null;

  const queries = useMemo(() => getPracticeQueries(problem), [problem]);
  const defaultTables = useMemo(() => getPracticeTables(problem), [problem]);
  const displayTables = useMemo(
    () => getExampleTables(lab, activeExample, defaultTables),
    [lab, activeExample, defaultTables]
  );
  const [previewTables, setPreviewTables] = useState<PracticeTable[]>(displayTables);

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
    setWalkthroughOpen(false);
    const firstExample = lab.examples[0];
    setSelectedExampleId(firstExample?.id || null);
    setSelectedChoiceIndex(firstExample?.choiceNum ? firstExample.choiceNum - 1 : -1);
    setSql(
      firstExample
        ? cleanSqlForInput(firstExample.sql)
        : queries[0] || `SELECT * FROM ${defaultTables[0]?.name || 'DUAL'};`
    );
    setResult(null);
    setError('');
  }, [problemKey, queries, defaultTables, lab]);

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
      seedPracticeTables(engine, database, displayTables);
      setPreviewTables(readPracticeTables(engine, database, displayTables));
      setResult(null);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, [open, engine, database, displayTables]);

  useEffect(() => {
    if (!flashFeedback) return undefined;
    const timer = setTimeout(() => setFlashFeedback(null), 1800);
    return () => clearTimeout(timer);
  }, [flashFeedback]);

  const handleSelectExample = useCallback(
    (exampleId: string) => {
      const example = lab.examples.find((item) => item.id === exampleId);
      if (!example) return;
      setSelectedExampleId(example.id);
      setSelectedChoiceIndex(example.choiceNum ? example.choiceNum - 1 : -1);
      setSql(cleanSqlForInput(example.sql));
      setError('');
      setResult(null);
      setFlashFeedback(`${example.title} 예제가 반영되었습니다.`);
      inputRef.current?.focus();
    },
    [lab]
  );

  const handleSelectChoice = useCallback(
    (cIndex: number) => {
      if (!selectableChoices[cIndex]) return;
      setSelectedChoiceIndex(cIndex);
      const example = lab.examples.find((item) => item.choiceNum === cIndex + 1);
      if (example) {
        handleSelectExample(example.id);
      } else {
        setSelectedExampleId(null);
        const choice = problem.choices[cIndex];
        const choiceDesc = problem.choiceDescriptions?.[cIndex] || '';
        const choiceSql = extractSqlFromText(choice) || extractSqlFromText(choiceDesc);
        if (choiceSql) {
          setSql(choiceSql);
          setFlashFeedback(`${cIndex + 1}번 보기의 SQL이 반영되었습니다.`);
        } else {
          setSql('');
          setFlashFeedback(`${cIndex + 1}번 보기를 선택했습니다. SQL을 입력해 보세요.`);
        }
      }
      setError('');
      setResult(null);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [lab, handleSelectExample, selectableChoices, problem]
  );

  const handleSelectSql = useCallback((queryToInsert: string) => {
    const cleaned = cleanSqlForInput(queryToInsert);
    if (!cleaned) return;
    setSql(cleaned);
    setError('');
    setResult(null);
    setFlashFeedback('SQL 입력창에 반영되었습니다.');
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
      const nextResult = executePracticeQuery(engine, database, query);
      setResult(nextResult);
      setPreviewTables(readPracticeTables(engine, database, displayTables));
      setError('');
    } catch (cause) {
      setResult(null);
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const reset = () => {
    if (!engine) return;
    try {
      seedPracticeTables(engine, database, displayTables);
      setPreviewTables(readPracticeTables(engine, database, displayTables));
      if (activeExample) {
        setSql(cleanSqlForInput(activeExample.sql));
      } else {
        setSql(queries[0] || `SELECT * FROM ${displayTables[0]?.name || 'DUAL'};`);
      }
      setResult(null);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    }
  };

  const openPractice = () => {
    const firstExample = lab.examples[0];
    setSelectedExampleId(firstExample?.id || null);
    setSelectedChoiceIndex(firstExample?.choiceNum ? firstExample.choiceNum - 1 : -1);
    setPreviewTables(getExampleTables(lab, firstExample || null, defaultTables));
    setSql(
      firstExample
        ? cleanSqlForInput(firstExample.sql)
        : queries[0] || `SELECT * FROM ${defaultTables[0]?.name || 'DUAL'};`
    );
    setResult(null);
    setError('');
    setFlashFeedback(null);
    setOpen(true);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PlayArrowRoundedIcon />}
        onClick={openPractice}
        sx={{ fontWeight: 700 }}
      >
        SQL 실습
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullScreen
        scroll="paper"
        sx={{
          '& .MuiDialog-paper': {
            width: '100%',
            maxWidth: 'none',
            height: '100dvh',
            maxHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 0,
            m: 0,
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
            flexGrow: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          <ResizablePanelGroup
            key={isWide ? 'wide' : 'narrow'}
            orientation={isWide ? 'horizontal' : 'vertical'}
            autoSaveId={`sqld-practice-main-${isWide ? 'wide' : 'narrow'}`}
          >
            {/* ==================== LEFT PANE: Question, Description, Choices ==================== */}
            <ResizablePanel id="sqld-problem" defaultSize={isWide ? 46 : 45} minSize={25}>
              <ResizablePanelGroup
                orientation="vertical"
                autoSaveId="sqld-practice-problem-sections"
              >
                <ResizablePanel id="sqld-problem-content" defaultSize={60} minSize={20}>
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 0,
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
                        {!hasSelectableChoices
                          ? '💡 오른쪽의 SQL 예제를 실행하고 결과를 확인해 보세요. 객관식 보기에는 입력할 SQL이 없습니다.'
                          : '💡 보기를 클릭하면 연결된 SQL 예제가 선택됩니다. 오른쪽에서 다른 예제를 고르거나 SQL을 직접 수정해 실행할 수 있습니다.'}
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
                          onSqlClick={hasLabOverride ? undefined : handleSelectSql}
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
                            onSqlClick={hasLabOverride ? undefined : handleSelectSql}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Formulas if present */}
                    {problemFormulas.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <FunctionsRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'text.secondary' }}
                          >
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
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'info.main' }}
                          >
                            ERD 다이어그램
                          </Typography>
                        </Box>
                        {problemErds.map((erdText, eIdx) => (
                          <MermaidDiagram
                            key={eIdx}
                            chart={erdText}
                            idPrefix={`modal_erd_${eIdx}`}
                          />
                        ))}
                      </Box>
                    )}

                    {/* Charts if present */}
                    {problemCharts.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                          <BarChartRoundedIcon sx={{ fontSize: 18, color: 'success.main' }} />
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'success.main' }}
                          >
                            차트
                          </Typography>
                        </Box>
                        {problemCharts.map((chartText, cIdx) => (
                          <ChartRenderer
                            key={cIdx}
                            chart={chartText}
                            idPrefix={`modal_chart_${cIdx}`}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                </ResizablePanel>

                <ResizableHandle
                  direction="vertical"
                  tooltipText="문제 내용과 보기 높이 조절"
                  showGrip={false}
                />

                <ResizablePanel id="sqld-problem-choices" defaultSize={40} minSize={20}>
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 0,
                      overflowY: 'auto',
                      p: { xs: 2, md: 2.5 },
                      bgcolor: (t) => alpha(t.palette.background.default, 0.4),
                    }}
                  >
                    {/* Choices Section */}
                    {problem.choices?.length > 0 && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
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
                            {!hasSelectableChoices
                              ? '객관식 보기'
                              : '객관식 보기 (클릭 시 연결된 예제 선택)'}
                          </Typography>
                          {hasSelectableChoices && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary', fontSize: 11 }}
                            >
                              {selectedChoiceIndex >= 0
                                ? `${selectedChoiceIndex + 1}번 보기 선택됨`
                                : '공통 예제 선택됨'}
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {problem.choices.map((choice, cIndex) => {
                            const choiceNum = cIndex + 1;
                            const canSelect = selectableChoices[cIndex];
                            const isSelected = canSelect && selectedChoiceIndex === cIndex;

                            return (
                              <Box
                                key={cIndex}
                                onClick={canSelect ? () => handleSelectChoice(cIndex) : undefined}
                                sx={{
                                  p: 1.5,
                                  borderRadius: 1.5,
                                  border: isSelected ? '2px solid' : '1.5px solid',
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  bgcolor: isSelected
                                    ? (t) => alpha(t.palette.primary.main, 0.08)
                                    : 'background.paper',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  ...(!canSelect
                                    ? {}
                                    : {
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        '&:hover': {
                                          bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
                                          borderColor: isSelected
                                            ? 'primary.main'
                                            : 'primary.light',
                                          transform: 'translateY(-1px)',
                                          boxShadow: (t) => t.customShadows?.z4 || 2,
                                        },
                                      }),
                                }}
                              >
                                {/* Choice Number Badge */}
                                <Box
                                  sx={{
                                    width: 28,
                                    height: 28,
                                    borderRadius: '50%',
                                    bgcolor: isSelected
                                      ? 'primary.main'
                                      : (t) => alpha(t.palette.grey[500], 0.16),
                                    color: isSelected ? 'primary.contrastText' : 'text.primary',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: 13,
                                    flexShrink: 0,
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
                                    sx={{
                                      '& p': {
                                        m: 0,
                                        fontWeight: isSelected ? 800 : 500,
                                        fontSize: 14,
                                        color: isSelected ? 'primary.dark' : 'text.primary',
                                      },
                                    }}
                                  />
                                </Box>

                                {canSelect && (
                                  <Chip
                                    size="small"
                                    label={isSelected ? '선택됨' : '선택'}
                                    color={isSelected ? 'primary' : 'default'}
                                    variant={isSelected ? 'filled' : 'outlined'}
                                    sx={{
                                      fontSize: 11,
                                      fontWeight: 700,
                                      height: 22,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle
              direction={isWide ? 'horizontal' : 'vertical'}
              tooltipText={isWide ? '문제와 실습 영역 너비 조절' : '문제와 실습 영역 높이 조절'}
              showGrip={false}
            />

            {/* ==================== RIGHT PANE: Practice, Query Input & Execution ==================== */}
            <ResizablePanel id="sqld-practice" defaultSize={isWide ? 54 : 55} minSize={25}>
              <ResizablePanelGroup orientation="vertical" autoSaveId="sqld-practice-work-sections">
                <ResizablePanel id="sqld-practice-data" defaultSize={38} minSize={15}>
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 0,
                      overflowY: 'auto',
                      p: { xs: 2, md: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {/* Guide & Table previews */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 800,
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                          }}
                        >
                          📌 {activeExample?.title || '실습 예제 데이터 테이블'}
                        </Typography>
                        {activeExample?.description ? (
                          <Chip
                            size="small"
                            color="primary"
                            variant="soft"
                            label={activeExample.description}
                            sx={{ fontSize: 11, fontWeight: 700, height: 22 }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                            예제 데이터를 확인하고 SQL을 직접 작성하거나 실행해 보세요.
                          </Typography>
                        )}
                      </Box>

                      {/* Sample Tables */}
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {previewTables.map((table) => (
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
                              <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: 800, fontSize: 12 }}
                              >
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
                                        <TableCell
                                          key={column}
                                          sx={{ py: 0.5, px: 1, fontSize: 12 }}
                                        >
                                          {row[column] === null ? (
                                            <Box
                                              component="span"
                                              sx={{ color: 'text.disabled', fontStyle: 'italic' }}
                                            >
                                              NULL
                                            </Box>
                                          ) : (
                                            formatPracticeValue(row[column])
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

                    {/* Explicit examples keep their SQL and fixture selection together. */}
                    {lab.examples.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, color: 'text.secondary' }}
                        >
                          실행 예제 선택
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                          {lab.examples.map((example) => (
                            <Button
                              key={example.id}
                              size="small"
                              variant={activeExample?.id === example.id ? 'contained' : 'outlined'}
                              onClick={() => handleSelectExample(example.id)}
                              sx={{ fontSize: 12, textTransform: 'none' }}
                            >
                              {example.title}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    ) : (
                      queries.length > 1 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                          <Typography
                            variant="caption"
                            sx={{ fontWeight: 800, color: 'text.secondary' }}
                          >
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
                      )
                    )}
                  </Box>
                </ResizablePanel>

                <ResizableHandle
                  direction="vertical"
                  tooltipText="예제 데이터와 SQL 입력 높이 조절"
                  showGrip={false}
                />

                <ResizablePanel id="sqld-practice-editor" defaultSize={34} minSize={15}>
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 0,
                      overflowY: 'auto',
                      p: { xs: 2, md: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}
                  >
                    {/* SQL Input Area */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            SQL 입력
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<MenuBookRoundedIcon fontSize="small" />}
                            disabled={!sql.trim()}
                            onClick={() => setWalkthroughOpen(true)}
                            sx={{ fontWeight: 700, whiteSpace: 'nowrap', px: 1 }}
                          >
                            원리 보기
                          </Button>
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            ml: 'auto',
                            minWidth: 0,
                          }}
                        >
                          {flashFeedback && (
                            <Chip
                              icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                              label={flashFeedback}
                              size="small"
                              color="success"
                              variant="soft"
                              sx={{ fontWeight: 700, fontSize: 12, height: 24, minWidth: 0 }}
                            />
                          )}
                          <Tooltip title="실행 (Ctrl + Enter)">
                            <span>
                              <IconButton
                                size="small"
                                disabled={!engine}
                                onClick={run}
                                aria-label="SQL 실행 (Ctrl + Enter)"
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'primary.contrastText',
                                  '&:hover': { bgcolor: 'primary.dark' },
                                  '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                  },
                                }}
                              >
                                <PlayArrowRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="SQL 초기화">
                            <span>
                              <IconButton
                                size="small"
                                disabled={!engine}
                                onClick={reset}
                                aria-label="SQL 초기화"
                                sx={{ border: 1, borderColor: 'divider' }}
                              >
                                <RestartAltRoundedIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Box>
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

                    {/* Error Message */}
                    {error && (
                      <Alert severity="error" sx={{ py: 0.5 }}>
                        {error}
                      </Alert>
                    )}
                  </Box>
                </ResizablePanel>

                <ResizableHandle
                  direction="vertical"
                  tooltipText="SQL 입력과 실행 결과 높이 조절"
                  showGrip={false}
                />

                <ResizablePanel id="sqld-practice-result" defaultSize={28} minSize={15}>
                  <Box
                    sx={{
                      height: '100%',
                      minHeight: 0,
                      p: { xs: 2, md: 2.5 },
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {/* Query Result */}
                    <Box
                      sx={{
                        minHeight: 0,
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Box
                        sx={{
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1.5,
                          flex: 1,
                          minHeight: 0,
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                        }}
                      >
                        <SqlResultTable result={result} />
                      </Box>
                    </Box>
                  </Box>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </DialogContent>

        {/* Modal Actions */}
        <DialogActions sx={{ px: { xs: 2, md: 3 }, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
          <Button variant="outlined" color="inherit" onClick={() => setOpen(false)}>
            닫기 (ESC)
          </Button>
        </DialogActions>
      </Dialog>
      {walkthroughOpen && (
        <SqlWalkthroughDialog sql={sql} onClose={() => setWalkthroughOpen(false)} />
      )}
    </Box>
  );
}
