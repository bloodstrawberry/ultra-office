'use client';

import type { SqldRound } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import DeleteIcon from '@mui/icons-material/Delete';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

import { SqldPagination } from './sqld-pagination';

// ----------------------------------------------------------------------

interface SqldEditorHeaderProps {
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
  onExitEditor: () => void;
  onAddProblem: () => void;
  onDuplicateProblem: () => void;
  onRemoveProblem: () => void;
  onSave: () => void;
  onExportJson: () => void;
  onResetToDefault: () => void;
}

export function SqldEditorHeader({
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
  onExitEditor,
  onAddProblem,
  onDuplicateProblem,
  onRemoveProblem,
  onSave,
  onExportJson,
  onResetToDefault,
}: SqldEditorHeaderProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
      {/* 1. Top Bar: Return to Practice Button & Title & Round Selector */}
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: '14px !important' }} />}
            onClick={onExitEditor}
            sx={{ fontWeight: 700 }}
          >
            풀이 모드로
          </Button>

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                SQLD 문제 편집기
              </Typography>
              <Box
                sx={{
                  px: 1,
                  py: 0.25,
                  borderRadius: 0.8,
                  bgcolor: 'warning.main',
                  color: 'warning.contrastText',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                편집 모드
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
              기출문제 내용, 지문, ERD, 4지선다 보기 및 정답/해설을 직접 수정·추가합니다.
            </Typography>
          </Box>
        </Box>

        {/* Round Selector Dropdown */}
        <FormControl size="small" sx={{ minWidth: 280, width: { xs: '100%', sm: 340 } }}>
          <InputLabel id="sqld-editor-round-select-label">기출문제 회차 선택</InputLabel>
          <Select
            labelId="sqld-editor-round-select-label"
            id="sqld-editor-round-select"
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

      {/* 2. Editor Action Toolbar */}
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
        {/* Left: Pagination + Add / Duplicate / Delete Problem */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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

          <Tooltip title="새 문제 추가">
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={onAddProblem}
              sx={{ fontWeight: 700 }}
            >
              문제 추가
            </Button>
          </Tooltip>

          <Tooltip title="현재 문제 복제">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={onDuplicateProblem}
              sx={{ fontWeight: 700 }}
            >
              복제
            </Button>
          </Tooltip>

          <Tooltip title="현재 문제 삭제">
            <span>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                disabled={totalProblems <= 1}
                onClick={() => setDeleteDialogOpen(true)}
                sx={{ fontWeight: 700 }}
              >
                삭제
              </Button>
            </span>
          </Tooltip>
        </Box>

        {/* Right: Export JSON + Reset to Default + Save */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Tooltip title="수정된 전체 problem.json 파일 다운로드">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<FileDownloadIcon />}
              onClick={onExportJson}
              sx={{ fontWeight: 700 }}
            >
              JSON 내보내기
            </Button>
          </Tooltip>

          <Tooltip title="편집 내역을 삭제하고 원본 problem.json으로 롤백">
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => setResetDialogOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              원본 복원
            </Button>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<SaveIcon />}
            onClick={onSave}
            sx={{ fontWeight: 800, px: 2 }}
          >
            저장
          </Button>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>문제 삭제 확인</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentIndex + 1}번 문제를 정말로 삭제하시겠습니까? 삭제 후 복원할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            취소
          </Button>
          <Button
            onClick={() => {
              setDeleteDialogOpen(false);
              onRemoveProblem();
            }}
            color="error"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            삭제
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reset to Default Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>원본 데이터로 복원</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            모든 사용자 편집 내용이 삭제되고 public/sqld/problem.json 원본 상태로 복원됩니다.
            계속하시겠습니까?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)} color="inherit">
            취소
          </Button>
          <Button
            onClick={() => {
              setResetDialogOpen(false);
              onResetToDefault();
            }}
            color="warning"
            variant="contained"
            sx={{ fontWeight: 700 }}
          >
            원본으로 복원
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
