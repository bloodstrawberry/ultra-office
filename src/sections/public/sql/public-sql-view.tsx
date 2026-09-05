'use client';

import type { SqlProblem, QueryResult, VerificationResult } from './types';

import { toast } from 'sonner';
import React, { useState, useCallback } from 'react';
import { Group, Panel } from 'react-resizable-panels';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { ResizableHandle } from 'src/components/resizable';

import { SQLD_PROBLEMS } from './sqld-problems';
import { SQLP_PROBLEMS } from './sqlp-problems';
import { useSqlEngine } from './use-sql-engine';
import { SchemaBrowser } from './schema-browser';
import { SqlEditorPanel } from './sql-editor-panel';
import { SqlResultTable } from './sql-result-table';
import { PRACTICE_PROBLEMS } from './sample-problems';
import { SqlProblemPanel } from './sql-problem-panel';
import { QueryHistoryDialog } from './query-history-dialog';

// ----------------------------------------------------------------------

type ModeTab = 'sqld' | 'sqlp' | 'practice' | 'playground';

interface ModeConfig {
  id: ModeTab;
  label: string;
  icon: React.ReactElement;
  panelTitle: string;
}

const MODES: ModeConfig[] = [
  {
    id: 'sqld',
    label: 'SQLD 예시',
    icon: <AssignmentRoundedIcon sx={{ fontSize: 17 }} />,
    panelTitle: 'SQLD 자격증 예시 문제',
  },
  {
    id: 'sqlp',
    label: 'SQLP 예시',
    icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 17 }} />,
    panelTitle: 'SQLP 자격증 예시 문제',
  },
  {
    id: 'practice',
    label: '연습문제 풀이',
    icon: <SchoolRoundedIcon sx={{ fontSize: 17 }} />,
    panelTitle: '단계별 연습 문제',
  },
  {
    id: 'playground',
    label: '자유 쿼리 샌드박스',
    icon: <CodeRoundedIcon sx={{ fontSize: 17 }} />,
    panelTitle: '데이터베이스 스키마',
  },
];

export function PublicSqlView() {
  const {
    datasets,
    currentDatasetId,
    setCurrentDatasetId,
    currentDataset,
    runQuery,
    verifySolution,
    resetCurrentDb,
    solvedProblemIds,
    queryHistory,
    setQueryHistory,
  } = useSqlEngine();

  const [mode, setMode] = useState<ModeTab>('practice');
  const [selectedProblem, setSelectedProblem] = useState<SqlProblem | null>(
    PRACTICE_PROBLEMS[0] || null
  );
  const [editorSql, setEditorSql] = useState<string>(PRACTICE_PROBLEMS[0]?.initialQuery || '');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Helper to get problems by mode
  const getProblemsForMode = useCallback((targetMode: ModeTab): SqlProblem[] => {
    switch (targetMode) {
      case 'sqld':
        return SQLD_PROBLEMS;
      case 'sqlp':
        return SQLP_PROBLEMS;
      case 'practice':
        return PRACTICE_PROBLEMS;
      case 'playground':
      default:
        return [];
    }
  }, []);

  // When problem is changed
  const handleSelectProblem = useCallback(
    (prob: SqlProblem) => {
      setSelectedProblem(prob);
      setEditorSql(
        prob.initialQuery ||
          `SELECT *\nFROM ${
            prob.datasetId === 'ecommerce'
              ? 'customers'
              : prob.datasetId === 'hr'
                ? 'employees'
                : prob.datasetId === 'sqld_sqlp'
                  ? 'emp'
                  : 'students'
          };\n`
      );
      setQueryResult(null);
      setVerificationResult(null);
      if (prob.datasetId !== currentDatasetId) {
        setCurrentDatasetId(prob.datasetId);
      }
    },
    [currentDatasetId, setCurrentDatasetId]
  );

  // Switch mode tab (SQLD 예시 | SQLP 예시 | 연습문제 풀이 | 자유 쿼리 샌드박스)
  const handleModeChange = (newMode: ModeTab) => {
    setMode(newMode);
    setQueryResult(null);
    setVerificationResult(null);

    if (newMode === 'playground') {
      setSelectedProblem(null);
      setEditorSql('SELECT *\nFROM customers\nLIMIT 10;\n');
      return;
    }

    const modeProblems = getProblemsForMode(newMode);
    if (modeProblems.length > 0) {
      const firstProb = modeProblems[0];
      handleSelectProblem(firstProb);
    } else {
      setSelectedProblem(null);
      const modeLabel = MODES.find((m) => m.id === newMode)?.label || '예시';
      setEditorSql(
        `-- [${modeLabel}] 등록된 예시 문제가 준비 중입니다.\n-- 자유롭게 쿼리를 작성하고 실행해 보세요.\nSELECT *\nFROM customers\nLIMIT 10;\n`
      );
    }
  };

  // Run query in current editor
  const handleRunQuery = () => {
    const res = runQuery(editorSql);
    setQueryResult(res);
  };

  // Submit and verify solution in challenge mode
  const handleSubmitChallenge = () => {
    if (!selectedProblem) {
      toast.error('채점할 문제가 선택되지 않았습니다.');
      return;
    }
    const verification = verifySolution(editorSql, selectedProblem);
    setVerificationResult(verification);
    if (verification.userResult) {
      setQueryResult(verification.userResult);
    }
  };

  // Insert query from schema browser or template
  const handleInsertQuery = (query: string) => {
    setEditorSql(query);
  };

  // Insert and immediately execute query
  const handleInsertAndRunQuery = (query: string) => {
    setEditorSql(query);
    const res = runQuery(query);
    setQueryResult(res);
  };

  // Reset database with feedback
  const handleResetDb = () => {
    resetCurrentDb();
    setQueryResult(null);
    setVerificationResult(null);
    toast.success(`[${currentDataset.name}] 데이터베이스가 초기 샘플 데이터로 복원되었습니다.`);
  };

  const isChallengeMode = mode !== 'playground' && Boolean(selectedProblem);
  const currentModeConfig = MODES.find((m) => m.id === mode) || MODES[2];
  const activeProblems = getProblemsForMode(mode);

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        pb: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}
    >
      {/* 1. Header Title & Description */}
      <Box
        sx={{
          mb: 1.75,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              SQL 연습실
            </Typography>
            <Chip
              label="In-Memory SQLite"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            브라우저 로컬 엔진 기반 실시간 쿼리 실행 • SQLD/SQLP 자격증 예시 및 단계별 연습문제
            풀이, 인터랙티브 샌드박스
          </Typography>
        </Box>
      </Box>

      {/* 2. Controls Toolbar Bar (SQLD 예시, SQLP 예시, 연습문제 풀이, 자유 쿼리 샌드박스, DB 선택, DB 초기화, 실행기록) */}
      <Card
        sx={{
          px: 2,
          py: 1.25,
          mb: 2,
          flexShrink: 0,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          bgcolor: 'background.paper',
          border: (theme) => `1px solid ${theme.vars.palette.divider}`,
        }}
      >
        {/* Left: Mode Switcher Segmented Control */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: '3px',
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            border: (theme) => `1px solid ${theme.vars.palette.divider}`,
            gap: '4px',
            height: 38,
            boxSizing: 'border-box',
            flexWrap: 'nowrap',
            overflowX: 'auto',
          }}
        >
          {MODES.map((tab) => {
            const isActive = mode === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                onClick={() => handleModeChange(tab.id)}
                startIcon={tab.icon}
                sx={{
                  height: 30,
                  px: 1.5,
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  borderRadius: 1,
                  whiteSpace: 'nowrap',
                  bgcolor: isActive ? 'background.paper' : 'transparent',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  boxShadow: isActive
                    ? (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)'
                    : 'none',
                  '&:hover': {
                    bgcolor: isActive ? 'background.paper' : 'action.hover',
                  },
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>

        {/* Right: DB Selector, Reset DB, Query History */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="dataset-select-label" sx={{ fontSize: '0.85rem' }}>
              데이터베이스 선택
            </InputLabel>
            <Select
              labelId="dataset-select-label"
              value={currentDatasetId}
              label="데이터베이스 선택"
              onChange={(e) => setCurrentDatasetId(e.target.value)}
              sx={{ fontSize: '0.875rem', height: 38, fontWeight: 600 }}
            >
              {datasets.map((ds) => (
                <MenuItem key={ds.id} value={ds.id} sx={{ fontSize: '0.875rem' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <StorageRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {ds.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      ({ds.tables.length}개)
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="현재 데이터베이스를 초기 샘플 데이터로 복원합니다.">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleResetDb}
              sx={{ height: 38, px: 1.75, fontWeight: 600, borderRadius: 1.5 }}
            >
              DB 초기화
            </Button>
          </Tooltip>

          <Tooltip title="이전에 실행한 쿼리 히스토리를 확인합니다.">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<HistoryRoundedIcon />}
              onClick={() => setHistoryOpen(true)}
              sx={{ height: 38, px: 1.75, fontWeight: 600, borderRadius: 1.5 }}
            >
              실행기록 ({queryHistory.length})
            </Button>
          </Tooltip>
        </Box>
      </Card>

      {/* Resizable Workspace Layout */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          overflow: 'hidden',
        }}
      >
        <Group orientation="horizontal" style={{ width: '100%', height: '100%' }}>
          {/* Left Column: SQL Editor (Top) & Result Table (Bottom) */}
          <Panel
            id="left-column"
            defaultSize={65}
            minSize={30}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Group orientation="vertical" style={{ width: '100%', height: '100%' }}>
              {/* Top: SQL Editor */}
              <Panel
                id="sql-editor"
                defaultSize={45}
                minSize={20}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  minHeight: 0,
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    minWidth: 0,
                    display: 'flex',
                    flex: 1,
                  }}
                >
                  <SqlEditorPanel
                    value={editorSql}
                    onChange={setEditorSql}
                    onRun={handleRunQuery}
                    onSubmit={isChallengeMode ? handleSubmitChallenge : undefined}
                    isChallengeMode={isChallengeMode}
                    datasetName={currentDataset.name}
                  />
                </Box>
              </Panel>

              {/* Horizontal Separator */}
              <ResizableHandle direction="vertical" tooltipText="상하 높이 조절" />

              {/* Bottom: Result Table */}
              <Panel
                id="sql-result"
                defaultSize={55}
                minSize={20}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  minHeight: 0,
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    minHeight: 0,
                    minWidth: 0,
                    display: 'flex',
                    flex: 1,
                  }}
                >
                  <SqlResultTable
                    result={queryResult}
                    title={isChallengeMode ? '내 쿼리 실행 결과' : '실행 결과'}
                  />
                </Box>
              </Panel>
            </Group>
          </Panel>

          {/* Vertical Separator */}
          <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

          {/* Right Column: Problem List or Schema Browser */}
          <Panel
            id="right-column"
            defaultSize={35}
            minSize={20}
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              minHeight: 0,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                minHeight: 0,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
              }}
            >
              {mode === 'playground' ? (
                <SchemaBrowser dataset={currentDataset} onInsertQuery={handleInsertQuery} />
              ) : (
                <SqlProblemPanel
                  title={currentModeConfig.panelTitle}
                  problems={activeProblems}
                  selectedProblem={selectedProblem}
                  onSelectProblem={handleSelectProblem}
                  solvedProblemIds={solvedProblemIds}
                  verificationResult={verificationResult}
                  onInsertSolution={handleInsertQuery}
                  onInsertAndRun={handleInsertAndRunQuery}
                />
              )}
            </Box>
          </Panel>
        </Group>
      </Box>

      {/* Query History Dialog */}
      <QueryHistoryDialog
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={queryHistory}
        onSelectQuery={handleInsertQuery}
        onClearHistory={() => setQueryHistory([])}
      />
    </DashboardContent>
  );
}
