'use client';

import type { Matrix2x2, TransformationStats } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { invertMatrix2x2, TRANSFORMATION_PRESETS } from '../utils/matrix-math';

// ----------------------------------------------------------------------

interface MatrixCalculatorPanelProps {
  matrix: Matrix2x2;
  stats: TransformationStats;
  onChangeMatrix: (matrix: Matrix2x2) => void;
}

export function MatrixCalculatorPanel({
  matrix,
  stats,
  onChangeMatrix,
}: MatrixCalculatorPanelProps) {
  const inverse = invertMatrix2x2(matrix);

  const handleCellChange = (r: 0 | 1, c: 0 | 1, val: string) => {
    const num = parseFloat(val);
    const updated: Matrix2x2 = [[...matrix[0]], [...matrix[1]]];
    updated[r][c] = isNaN(num) ? 0 : num;
    onChangeMatrix(updated);
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Presets */}
      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
        변환 행렬(Transformation Matrix) 설정
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {TRANSFORMATION_PRESETS.map((p) => (
          <Chip
            key={p.name}
            label={p.name}
            clickable
            variant="outlined"
            onClick={() => onChangeMatrix(p.matrix)}
            sx={{ fontWeight: 700 }}
          />
        ))}
      </Box>

      {/* 2. 2x2 Matrix Input Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '80px 80px',
          gap: 1.5,
          p: 2,
          bgcolor: 'background.neutral',
          borderRadius: 2,
          border: '1.5px solid',
          borderColor: 'divider',
          width: 'fit-content',
        }}
      >
        <TextField
          size="small"
          type="number"
          value={matrix[0][0]}
          onChange={(e) => handleCellChange(0, 0, e.target.value)}
          InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
        />
        <TextField
          size="small"
          type="number"
          value={matrix[0][1]}
          onChange={(e) => handleCellChange(0, 1, e.target.value)}
          InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
        />
        <TextField
          size="small"
          type="number"
          value={matrix[1][0]}
          onChange={(e) => handleCellChange(1, 0, e.target.value)}
          InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
        />
        <TextField
          size="small"
          type="number"
          value={matrix[1][1]}
          onChange={(e) => handleCellChange(1, 1, e.target.value)}
          InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
        />
      </Box>

      {/* 3. Mathematical Properties Report */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {/* Determinant */}
        <Card
          variant="outlined"
          sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            행렬식 (Determinant, det):
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, color: stats.isSingular ? 'error.main' : 'primary.main' }}
          >
            {stats.det}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {stats.isSingular ? '차원 붕괴 (면적 = 0)' : `면적 ${stats.areaScale}배 확대`}
          </Typography>
        </Card>

        {/* Trace */}
        <Card
          variant="outlined"
          sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            대각합 (Trace):
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>
            {stats.trace}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            a + d = {matrix[0][0]} + {matrix[1][1]}
          </Typography>
        </Card>
      </Box>

      {/* 4. Inverse Matrix Display */}
      <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
        <Typography
          variant="caption"
          sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}
        >
          역행렬 (Inverse Matrix, A⁻¹):
        </Typography>
        {inverse ? (
          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
            [[ {inverse[0][0]}, {inverse[0][1]} ], [ {inverse[1][0]}, {inverse[1][1]} ]]
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ fontWeight: 800, color: 'error.main' }}>
            역행렬이 존재하지 않습니다 (det = 0, 특이행렬)
          </Typography>
        )}
      </Card>
    </Card>
  );
}
