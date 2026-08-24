'use client';

import type { LogEntry, GigaFileSummary, GigaFilterOptions } from '../types';

import { toast } from 'sonner';
import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { LogStreamViewer } from '../components/log-stream-viewer';
import { GigaQueryToolbar } from '../components/giga-query-toolbar';
import {
  parseLogText,
  executeLogSql,
  filterLogEntries,
  generateSampleLogs,
} from '../utils/giga-data-utils';

// ----------------------------------------------------------------------

const DEFAULT_FILTERS: GigaFilterOptions = {
  searchKeyword: '',
  isRegex: false,
  selectedLevel: 'ALL',
  caseSensitive: false,
};

export function GigaViewerView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allEntries, setAllEntries] = useState<LogEntry[]>([]);
  const [summary, setSummary] = useState<GigaFileSummary | null>(null);
  const [filters, setFilters] = useState<GigaFilterOptions>(DEFAULT_FILTERS);
  const [sqlResultEntries, setSqlResultEntries] = useState<LogEntry[] | null>(null);

  useEffect(() => {
    setHasLoaded(true);
    // Load built-in sample logs for instant interactive demo
    const sampleText = generateSampleLogs();
    const parsed = parseLogText(sampleText, 'production-k8s-cluster.log');
    setAllEntries(parsed.entries);
    setSummary(parsed.summary);
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseLogText(text, file.name);
        setAllEntries(parsed.entries);
        setSummary(parsed.summary);
        setSqlResultEntries(null);
        setFilters(DEFAULT_FILTERS);
        toast.success(
          `'${file.name}' (${parsed.summary.totalLines.toLocaleString()} 라인) 로드 완료`
        );
      } catch {
        toast.error('대용량 로그 파일을 분석하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteSql = async (sql: string) => {
    try {
      const results = await executeLogSql(allEntries, sql);
      setSqlResultEntries(results);
      toast.success(`SQL 쿼리 결과: ${results.length.toLocaleString()}건`);
    } catch (err: unknown) {
      toast.error(`SQL 오류: ${(err as Error)?.message || '문법을 확인하세요.'}`);
    }
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSqlResultEntries(null);
    toast.info('필터가 초기화되었습니다.');
  };

  // Compute final displayed entries
  const displayedEntries = useMemo(() => {
    const base = sqlResultEntries !== null ? sqlResultEntries : allEntries;
    return filterLogEntries(base, filters);
  }, [allEntries, sqlResultEntries, filters]);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <StorageRoundedIcon sx={{ fontSize: 32, color: 'warning.main' }} />
            대용량 로그 & CSV 초고속 뷰어 (Giga Stream Engine)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            수백 MB의 대용량 로그나 데이터 파일도 가상 스크롤(Virtual Scroll)로 멈춤 없이 열고
            SQL/정규식으로 실시간 필터링합니다.
          </Typography>
        </Box>

        {/* Header Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => {
              const sampleText = generateSampleLogs();
              const parsed = parseLogText(sampleText, 'production-k8s-cluster.log');
              setAllEntries(parsed.entries);
              setSummary(parsed.summary);
              setSqlResultEntries(null);
              setFilters(DEFAULT_FILTERS);
              toast.info('대용량 서버 로그 2,500줄 샘플이 생성되었습니다.');
            }}
          >
            2,500행 샘플 로그 로드
          </Button>

          <Button
            variant="contained"
            component="label"
            startIcon={<UploadFileRoundedIcon />}
            sx={{ fontWeight: 700 }}
          >
            로그 / CSV 파일 열기
            <input type="file" hidden accept=".log,.txt,.csv,.json" onChange={handleFileUpload} />
          </Button>
        </Box>
      </Box>

      {/* 2. Main Content Workspace */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          pb: 4,
        }}
      >
        {isLoading ? (
          <Card sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
            <CircularProgress size={40} sx={{ mb: 2 }} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              대용량 파일 스트리밍 파싱 중...
            </Typography>
          </Card>
        ) : summary ? (
          <>
            {/* Toolbar with stats and search */}
            <GigaQueryToolbar
              summary={summary}
              filters={filters}
              filteredEntries={displayedEntries}
              onFilterChange={setFilters}
              onExecuteSql={handleExecuteSql}
              onResetFilter={handleResetFilters}
            />

            {/* Virtual Scroll Terminal Viewer */}
            <LogStreamViewer entries={displayedEntries} highlightKeyword={filters.searchKeyword} />
          </>
        ) : (
          <Card sx={{ p: 8, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              분석할 로그 파일(.log, .txt, .csv)을 업로드해 주세요.
            </Typography>
          </Card>
        )}
      </Box>
    </DashboardContent>
  );
}
