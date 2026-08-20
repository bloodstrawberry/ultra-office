'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import type { LogLevel, GigaFileSummary, GigaFilterOptions, LogEntry } from '../types';

// ----------------------------------------------------------------------

interface GigaQueryToolbarProps {
  summary: GigaFileSummary;
  filters: GigaFilterOptions;
  filteredEntries: LogEntry[];
  onFilterChange: (filters: GigaFilterOptions) => void;
  onExecuteSql: (sql: string) => void;
  onResetFilter: () => void;
}

export function GigaQueryToolbar({
  summary,
  filters,
  filteredEntries,
  onFilterChange,
  onExecuteSql,
  onResetFilter,
}: GigaQueryToolbarProps) {
  const [sqlInput, setSqlInput] = useState<string>("SELECT * FROM ? WHERE level = 'ERROR'");
  const [showSqlBar, setShowSqlBar] = useState<boolean>(false);

  const handleLevelClick = (lvl: LogLevel) => {
    onFilterChange({ ...filters, selectedLevel: lvl });
  };

  const handleExportCsv = () => {
    if (filteredEntries.length === 0) {
      toast.error('내보낼 데이터가 없습니다.');
      return;
    }
    const data = filteredEntries.map((e) => ({
      Line: e.id,
      Level: e.level,
      Timestamp: e.timestamp || '',
      Message: e.message,
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered_${summary.fileName}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${filteredEntries.length}개 로그 라인이 CSV로 저장되었습니다.`);
  };

  return (
    <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Level Filter Chips & Stats */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip
            label={`전체 (${summary.totalLines.toLocaleString()})`}
            color={filters.selectedLevel === 'ALL' ? 'primary' : 'default'}
            onClick={() => handleLevelClick('ALL')}
            clickable
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`ERROR (${summary.errorCount.toLocaleString()})`}
            color={filters.selectedLevel === 'ERROR' ? 'error' : 'default'}
            onClick={() => handleLevelClick('ERROR')}
            clickable
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`WARN (${summary.warnCount.toLocaleString()})`}
            color={filters.selectedLevel === 'WARN' ? 'warning' : 'default'}
            onClick={() => handleLevelClick('WARN')}
            clickable
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`INFO (${summary.infoCount.toLocaleString()})`}
            color={filters.selectedLevel === 'INFO' ? 'info' : 'default'}
            onClick={() => handleLevelClick('INFO')}
            clickable
            sx={{ fontWeight: 800 }}
          />
          <Chip
            label={`DEBUG (${summary.debugCount.toLocaleString()})`}
            color={filters.selectedLevel === 'DEBUG' ? 'secondary' : 'default'}
            onClick={() => handleLevelClick('DEBUG')}
            clickable
            sx={{ fontWeight: 800 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant={showSqlBar ? 'contained' : 'outlined'}
            startIcon={<TerminalRoundedIcon />}
            onClick={() => setShowSqlBar((prev) => !prev)}
          >
            SQL 쿼리 콘솔
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportCsv}
          >
            필터 결과 CSV 내보내기
          </Button>
        </Box>
      </Box>

      {/* 2. Keyword & Regex Search Bar */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr auto auto' },
          gap: 2,
          alignItems: 'center',
        }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="로그 내용 검색 (예: ConnectionTimeout, /api/v2, Redis)..."
          value={filters.searchKeyword}
          onChange={(e) => onFilterChange({ ...filters, searchKeyword: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.isRegex}
              onChange={(e) => onFilterChange({ ...filters, isRegex: e.target.checked })}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              정규표현식(Regex)
            </Typography>
          }
        />

        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={filters.caseSensitive}
              onChange={(e) => onFilterChange({ ...filters, caseSensitive: e.target.checked })}
            />
          }
          label={
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              대소문자 구분
            </Typography>
          }
        />
      </Box>

      {/* 3. SQL Query Console (Collapsible) */}
      {showSqlBar && (
        <Box
          sx={{
            p: 2,
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            border: '1px dashed',
            borderColor: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            브라우저 내장 AlaSQL 쿼리 엔진 (테이블명은 ? 사용)
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              size="small"
              fullWidth
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="SELECT * FROM ? WHERE raw LIKE '%exception%' ORDER BY id DESC"
              InputProps={{ sx: { fontFamily: 'monospace', fontSize: '13px' } }}
            />
            <Button
              variant="contained"
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => onExecuteSql(sqlInput)}
              sx={{ whiteSpace: 'nowrap', fontWeight: 800 }}
            >
              쿼리 실행
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={onResetFilter}
              sx={{ whiteSpace: 'nowrap' }}
            >
              초기화
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
}
