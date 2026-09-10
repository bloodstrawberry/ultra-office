import type { SudokuMultiOcrResult } from '../utils/sudoku-multi-ocr';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface SudokuOcrComparisonCardProps {
  result: SudokuMultiOcrResult;
  isSelected: boolean;
  onSelect: (result: SudokuMultiOcrResult) => void;
  diffCount?: number;
}

export function SudokuOcrComparisonCard({
  result,
  isSelected,
  onSelect,
  diffCount,
}: SudokuOcrComparisonCardProps) {
  const { name, badge, description, board, digitCount, conflicts, isSolvable, executionTimeMs } =
    result;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          isSelected
            ? theme.palette.mode === 'dark'
              ? 'rgba(0, 167, 111, 0.08)'
              : 'rgba(0, 167, 111, 0.04)'
            : 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.2,
        minWidth: 220,
        maxWidth: 260,
        flex: 1,
        transition: 'all 0.2s ease-in-out',
        boxShadow: isSelected ? (theme) => theme.shadows[4] : 'none',
        '&:hover': {
          borderColor: isSelected ? 'primary.main' : 'text.disabled',
        },
      }}
    >
      {/* Header with Engine Badge and Time */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Chip
          size="small"
          label={badge}
          color={result.color}
          sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
        />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
          ⏱️ {executionTimeMs}ms
        </Typography>
      </Box>

      {/* Engine Name and Subtitle */}
      <Box sx={{ minHeight: 38 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 800, fontSize: '0.85rem', lineHeight: 1.2 }}
        >
          {name}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontSize: '0.68rem',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </Typography>
      </Box>

      {/* Status & Validity Badges */}
      <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          variant="outlined"
          label={`숫자 ${digitCount}개`}
          sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
        />

        {conflicts.size > 0 ? (
          <Chip
            size="small"
            color="error"
            icon={<ErrorOutlineRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
            label={`충돌 ${conflicts.size}개`}
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        ) : isSolvable ? (
          <Chip
            size="small"
            color="success"
            icon={<CheckCircleRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
            label="해 완성 가능"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        ) : digitCount > 0 ? (
          <Chip
            size="small"
            color="warning"
            icon={<WarningAmberRoundedIcon sx={{ fontSize: '0.85rem !important' }} />}
            label="해 없음(오인식)"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        ) : (
          <Chip
            size="small"
            color="default"
            label="미검출"
            sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }}
          />
        )}
      </Box>

      {/* Mini 9x9 Sudoku Board */}
      <Box
        sx={{
          width: 140,
          height: 140,
          alignSelf: 'center',
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 1fr)',
          gridTemplateRows: 'repeat(9, 1fr)',
          border: '1.5px solid',
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'grey.50',
        }}
      >
        {board.map((row, r) =>
          row.map((val, c) => {
            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? '1.5px solid' : '0.5px solid';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? '1.5px solid' : '0.5px solid';
            const isConflicted = conflicts.has(`${r}-${c}`);

            return (
              <Box
                key={`mini-${r}-${c}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRight,
                  borderBottom,
                  borderColor: isConflicted ? 'error.main' : 'divider',
                  bgcolor: isConflicted
                    ? 'rgba(255, 86, 48, 0.25)'
                    : val !== 0
                      ? 'action.selected'
                      : 'transparent',
                }}
              >
                <Typography
                  sx={{
                    fontSize: '0.56rem',
                    fontWeight: val !== 0 ? 800 : 400,
                    lineHeight: 1,
                    color: isConflicted ? 'error.main' : val !== 0 ? 'text.primary' : 'transparent',
                  }}
                >
                  {val !== 0 ? val : ''}
                </Typography>
              </Box>
            );
          })
        )}
      </Box>

      {/* Diff Count Information if available */}
      {typeof diffCount === 'number' && (
        <Typography
          variant="caption"
          sx={{
            textAlign: 'center',
            fontSize: '0.68rem',
            color: diffCount === 0 ? 'success.main' : 'text.secondary',
            fontWeight: 600,
          }}
        >
          {diffCount === 0 ? '현재 판과 100% 동일' : `현재 판과 ${diffCount}개 셀 다름`}
        </Typography>
      )}

      {/* Action Select Button */}
      <Button
        variant={isSelected ? 'contained' : 'outlined'}
        color={isSelected ? 'primary' : 'inherit'}
        size="small"
        fullWidth
        onClick={() => onSelect(result)}
        sx={{
          mt: 'auto',
          fontSize: '0.75rem',
          py: 0.4,
          fontWeight: 800,
        }}
      >
        {isSelected ? '✓ 선택됨 (적용 완료)' : '이 결과 적용하기'}
      </Button>
    </Card>
  );
}
