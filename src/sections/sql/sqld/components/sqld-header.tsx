'use client';

import type { SqldRound } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AppsIcon from '@mui/icons-material/Apps';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import { SqldPagination } from './sqld-pagination';

// ----------------------------------------------------------------------

interface SqldHeaderProps {
  rounds: SqldRound[];
  selectedRoundId: string;
  onSelectRound: (roundId: string) => void;
  currentIndex: number;
  totalProblems: number;
  pageInput: string;
  onPrev: () => void;
  onNext: () => void;
  onPageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPageInputBlur: () => void;
  onPageInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  showAllAnswers: boolean;
  onToggleShowAllAnswers: () => void;
  showMap: boolean;
  onToggleMap: () => void;
  onCopyProblem: () => void;
  onResetRound: () => void;
  onEnterEditor: () => void;
}

export function SqldHeader({
  rounds,
  selectedRoundId,
  onSelectRound,
  currentIndex,
  totalProblems,
  pageInput,
  onPrev,
  onNext,
  onPageInputChange,
  onPageInputBlur,
  onPageInputKeyDown,
  showAllAnswers,
  onToggleShowAllAnswers,
  showMap,
  onToggleMap,
  onCopyProblem,
  onResetRound,
  onEnterEditor,
}: SqldHeaderProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
      {/* 1. Page Title & Round Dropdown Selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              SQLD 연습
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 0.8,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              16개 회차 800문항
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            SQL 개발자(SQLD) 자격검정 대비 기출문제 풀이 및 해설 학습실입니다.
          </Typography>
        </Box>

        {/* Round Selector Dropdown */}
        <FormControl size="small" sx={{ minWidth: 280, width: { xs: '100%', sm: 340 } }}>
          <InputLabel id="sqld-round-select-label">기출문제 회차 선택</InputLabel>
          <Select
            labelId="sqld-round-select-label"
            id="sqld-round-select"
            value={selectedRoundId}
            label="기출문제 회차 선택"
            onChange={(e) => onSelectRound(e.target.value)}
            sx={{ fontWeight: 700 }}
          >
            {rounds.map((r) => (
              <MenuItem key={r.id} value={r.id} sx={{ fontWeight: 600 }}>
                {r.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* 2. Interactive Navigation & Action Toolbar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          p: 1.5,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: (t) => `1px solid ${t.vars.palette.divider}`,
        }}
      >
        {/* Left: Pagination + 50 Question Map Toggle */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <SqldPagination
            variant="header"
            currentIndex={currentIndex}
            totalProblems={totalProblems}
            pageInput={pageInput}
            onPrev={onPrev}
            onNext={onNext}
            onPageInputChange={onPageInputChange}
            onPageInputBlur={onPageInputBlur}
            onPageInputKeyDown={onPageInputKeyDown}
          />

          <Button
            variant={showMap ? 'contained' : 'outlined'}
            color={showMap ? 'primary' : 'inherit'}
            size="small"
            startIcon={<AppsIcon />}
            onClick={onToggleMap}
            sx={{ fontWeight: 700 }}
          >
            50문항 맵 {showMap ? '닫기' : '보기'}
          </Button>
        </Box>

        {/* Right: Study Mode Toggle + Copy + Reset + Edit Mode */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* 정답 ON/OFF Toggle */}
          <Tooltip
            title={showAllAnswers ? '정답 전체 숨기기 (시험 모드)' : '정답 전체 보기 (학습 모드)'}
          >
            <Button
              variant={showAllAnswers ? 'contained' : 'outlined'}
              color={showAllAnswers ? 'warning' : 'inherit'}
              size="small"
              onClick={onToggleShowAllAnswers}
              startIcon={showAllAnswers ? <VisibilityIcon /> : <VisibilityOffIcon />}
              sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              {showAllAnswers ? '정답 ON' : '정답 OFF'}
            </Button>
          </Tooltip>

          <Tooltip title="문제 복사">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onCopyProblem}
              startIcon={<ContentCopyIcon />}
              sx={{ fontWeight: 700 }}
            >
              복사
            </Button>
          </Tooltip>

          <Tooltip title="현재 회차 풀이 초기화">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onResetRound}
              startIcon={<RestartAltIcon />}
              sx={{ fontWeight: 700 }}
            >
              초기화
            </Button>
          </Tooltip>

          {/* Problem Editor Mode Button */}
          <Tooltip title="현재 회차 문제 수정 / 추가 / 삭제 편집기 실행">
            <Button
              variant="contained"
              color="warning"
              size="small"
              onClick={onEnterEditor}
              startIcon={<EditRoundedIcon />}
              sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
            >
              문제 편집
            </Button>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
}
