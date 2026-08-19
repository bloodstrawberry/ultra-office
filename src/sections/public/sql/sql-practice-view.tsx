'use client';

import type { SqlProblem, QueryResult, VerificationResult } from './types';

import React, { useState, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
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
    alert(`[${currentDataset.name}] 데이터베이스가 초기 상태로 리셋되었습니다.`);
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
      {/* Top Header Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          mb: 2,
          flexShrink: 0,
        }}
      >
        {/* Title & Mode Switcher */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StorageRoundedIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              SQL 연습실
            </Typography>
          </Box>

          <Tabs
            value={mode}
            onChange={handleModeChange}
            sx={{
              minHeight: 40,
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
              p: 0.5,
              '& .MuiTab-root': {
                minHeight: 32,
                borderRadius: 1,
                py: 0.5,
                px: 2,
                fontWeight: 'bold',
                fontSize: 13,
                '&.Mui-selected': {
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.customShadows?.z1 || '0 1px 3px rgba(0,0,0,0.1)',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab
              value="challenges"
              icon={<SchoolRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="연습 문제 풀이"
            />
            <Tab
              value="playground"
              icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="자유 쿼리 샌드박스"
            />
          </Tabs>
        </Box>

        {/* Global Controls: Dataset Selector, Reset DB, History */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel id="dataset-select-label">데이터베이스 선택</InputLabel>
            <Select
              labelId="dataset-select-label"
              value={currentDatasetId}
              label="데이터베이스 선택"
              onChange={(e) => setCurrentDatasetId(e.target.value)}
              sx={{ fontSize: 13 }}
            >
              {datasets.map((ds) => (
                <MenuItem key={ds.id} value={ds.id} sx={{ fontSize: 13 }}>
                  {ds.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Tooltip title="데이터베이스를 초기 샘플 데이터로 복원합니다.">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleResetDb}
              sx={{ height: 38 }}
            >
              DB 초기화
            </Button>
          </Tooltip>

          <Tooltip title="쿼리 실행 기록">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<HistoryRoundedIcon />}
              onClick={() => setHistoryOpen(true)}
              sx={{ height: 38 }}
            >
              실행 기록 ({queryHistory.length})
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* Main Workspace Panels */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: mode === 'challenges' ? '380px 1fr' : '320px 1fr',
          },
          gap: 2,
          width: '100%',
        }}
      >
        {/* Left Panel: Problem List or Schema Browser */}
        <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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

        {/* Right Panel: Editor (Top) & Result Table (Bottom) */}
        <Box
          sx={{
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Editor Top (45% height) */}
          <Box sx={{ flex: '1 1 45%', minHeight: 180, display: 'flex' }}>
            <SqlEditorPanel
              value={editorSql}
              onChange={setEditorSql}
              onRun={handleRunQuery}
              onSubmit={mode === 'challenges' ? handleSubmitChallenge : undefined}
              isChallengeMode={mode === 'challenges'}
              datasetName={currentDataset.name}
            />
          </Box>

          {/* Result Table Bottom (55% height) */}
          <Box sx={{ flex: '1 1 55%', minHeight: 200, display: 'flex' }}>
            <SqlResultTable
              result={queryResult}
              title={mode === 'challenges' ? '내 쿼리 실행 결과' : '실행 결과'}
            />
          </Box>
        </Box>
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
