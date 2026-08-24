'use client';

import type { SqlProblem, QueryResult, VerificationResult } from './types';

import { toast } from 'sonner';
import React, { useState, useCallback } from 'react';
import { Group, Panel, Separator } from 'react-resizable-panels';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
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

import { DashboardContent } from 'src/layouts/dashboard';

import { useSqlEngine } from './use-sql-engine';
import { SchemaBrowser } from './schema-browser';
import { SqlEditorPanel } from './sql-editor-panel';
import { SqlResultTable } from './sql-result-table';
import { SAMPLE_PROBLEMS } from './sample-problems';
import { SqlProblemPanel } from './sql-problem-panel';
import { QueryHistoryDialog } from './query-history-dialog';

// ----------------------------------------------------------------------

type ModeTab = 'challenges' | 'playground';

export function SqlPracticeView() {
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

  const [mode, setMode] = useState<ModeTab>('challenges');
  const [selectedProblem, setSelectedProblem] = useState<SqlProblem>(SAMPLE_PROBLEMS[0]);
  const [editorSql, setEditorSql] = useState<string>(SAMPLE_PROBLEMS[0].initialQuery || '');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // When problem is changed in challenge mode
  const handleSelectProblem = useCallback(
    (prob: SqlProblem) => {
      setSelectedProblem(prob);
      setEditorSql(
        prob.initialQuery ||
          `SELECT *\nFROM ${prob.datasetId === 'ecommerce' ? 'customers' : prob.datasetId === 'hr' ? 'employees' : 'students'};\n`
      );
      setQueryResult(null);
      setVerificationResult(null);
      if (prob.datasetId !== currentDatasetId) {
        setCurrentDatasetId(prob.datasetId);
      }
    },
    [currentDatasetId, setCurrentDatasetId]
  );

  // Switch mode tab
  const handleModeChange = (_: React.SyntheticEvent, newMode: ModeTab) => {
    setMode(newMode);
    setQueryResult(null);
    setVerificationResult(null);
    if (newMode === 'challenges') {
      handleSelectProblem(selectedProblem);
    } else {
      setEditorSql('SELECT *\nFROM customers\nLIMIT 10;\n');
    }
  };

  // Run query in current editor
  const handleRunQuery = () => {
    const res = runQuery(editorSql);
    setQueryResult(res);
  };

  // Submit and verify solution in challenge mode
  const handleSubmitChallenge = () => {
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

  // Reset database with feedback
  const handleResetDb = () => {
    resetCurrentDb();
    setQueryResult(null);
    setVerificationResult(null);
    toast.success(`[${currentDataset.name}] 데이터베이스가 초기 샘플 데이터로 복원되었습니다.`);
  };

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
            브라우저 로컬 엔진 기반 실시간 쿼리 실행 • SQLD/SQLP 대비 단계별 연습문제 풀이 및
            인터랙티브 샌드박스
          </Typography>
        </Box>
      </Box>

      {/* 2. Controls Toolbar Bar (연습문제 풀이, 자유 쿼리 샌드박스, DB 선택, DB 초기화, 실행기록) */}
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
          }}
        >
          <Button
            size="small"
            onClick={() => handleModeChange(null as any, 'challenges')}
            startIcon={<SchoolRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              height: 30,
              px: 1.5,
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 1,
              bgcolor: mode === 'challenges' ? 'background.paper' : 'transparent',
              color: mode === 'challenges' ? 'primary.main' : 'text.secondary',
              boxShadow:
                mode === 'challenges'
                  ? (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)'
                  : 'none',
              '&:hover': {
                bgcolor: mode === 'challenges' ? 'background.paper' : 'action.hover',
              },
            }}
          >
            연습문제 풀이
          </Button>
          <Button
            size="small"
            onClick={() => handleModeChange(null as any, 'playground')}
            startIcon={<CodeRoundedIcon sx={{ fontSize: 17 }} />}
            sx={{
              height: 30,
              px: 1.5,
              fontSize: '0.8125rem',
              fontWeight: 700,
              borderRadius: 1,
              bgcolor: mode === 'playground' ? 'background.paper' : 'transparent',
              color: mode === 'playground' ? 'primary.main' : 'text.secondary',
              boxShadow:
                mode === 'playground'
                  ? (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)'
                  : 'none',
              '&:hover': {
                bgcolor: mode === 'playground' ? 'background.paper' : 'action.hover',
              },
            }}
          >
            자유 쿼리 샌드박스
          </Button>
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
                    onSubmit={mode === 'challenges' ? handleSubmitChallenge : undefined}
                    isChallengeMode={mode === 'challenges'}
                    datasetName={currentDataset.name}
                  />
                </Box>
              </Panel>

              {/* Horizontal Separator (----------) */}
              <Separator
                style={{
                  height: 10,
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'row-resize',
                  position: 'relative',
                  zIndex: 5,
                  outline: 'none',
                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '1px',
                      bgcolor: 'divider',
                      transition: (theme) =>
                        theme.transitions.create(['background-color', 'height']),
                    },
                    '&:hover::before, &:active::before': {
                      bgcolor: 'primary.main',
                      height: '2px',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 40,
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'text.disabled',
                      opacity: 0.4,
                      transition: (theme) =>
                        theme.transitions.create(['background-color', 'opacity', 'width']),
                      '&:hover, &:active': {
                        bgcolor: 'primary.main',
                        opacity: 1,
                        width: 52,
                      },
                    }}
                  />
                </Box>
              </Separator>

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
                    title={mode === 'challenges' ? '내 쿼리 실행 결과' : '실행 결과'}
                  />
                </Box>
              </Panel>
            </Group>
          </Panel>

          {/* Vertical Separator (|) */}
          <Separator
            style={{
              width: 10,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              position: 'relative',
              zIndex: 5,
              outline: 'none',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  width: '1px',
                  bgcolor: 'divider',
                  transition: (theme) => theme.transitions.create(['background-color', 'width']),
                },
                '&:hover::before, &:active::before': {
                  bgcolor: 'primary.main',
                  width: '2px',
                },
              }}
            >
              <Box
                sx={{
                  height: 40,
                  width: 4,
                  borderRadius: 2,
                  bgcolor: 'text.disabled',
                  opacity: 0.4,
                  transition: (theme) =>
                    theme.transitions.create(['background-color', 'opacity', 'height']),
                  '&:hover, &:active': {
                    bgcolor: 'primary.main',
                    opacity: 1,
                    height: 52,
                  },
                }}
              />
            </Box>
          </Separator>

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
              {mode === 'challenges' ? (
                <SqlProblemPanel
                  problems={SAMPLE_PROBLEMS}
                  selectedProblem={selectedProblem}
                  onSelectProblem={handleSelectProblem}
                  solvedProblemIds={solvedProblemIds}
                  verificationResult={verificationResult}
                  onInsertSolution={handleInsertQuery}
                />
              ) : (
                <SchemaBrowser dataset={currentDataset} onInsertQuery={handleInsertQuery} />
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
