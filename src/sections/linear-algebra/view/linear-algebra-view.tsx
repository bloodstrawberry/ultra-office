'use client';

import React, { useState, useEffect, useMemo } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid4x4RoundedIcon from '@mui/icons-material/Grid4x4Rounded';

import { DashboardContent } from 'src/layouts/dashboard';

import type { Matrix2x2 } from '../types';
import { calculateMatrixStats } from '../utils/matrix-math';
import { TransformationCanvas } from '../components/transformation-canvas';
import { MatrixCalculatorPanel } from '../components/matrix-calculator-panel';

// ----------------------------------------------------------------------

const INITIAL_MATRIX: Matrix2x2 = [
  [1, 1],
  [0, 1],
];

export function LinearAlgebraView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [matrix, setMatrix] = useState<Matrix2x2>(INITIAL_MATRIX);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  const stats = useMemo(() => calculateMatrixStats(matrix), [matrix]);

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
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Grid4x4RoundedIcon sx={{ fontSize: 32, color: 'secondary.main' }} />
          선형대수 & 2D 기하 변환 랩 (Linear Algebra & Matrix Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          2x2 행렬을 입력하여 기저벡터(î, ĵ)와 공간 격자가 회전/전단/신축되는 왜곡 애니메이션과
          행렬식(Determinant), 역행렬을 시각적으로 탐구합니다.
        </Typography>
      </Box>

      {/* 2. Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
          gap: 3,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          pb: 4,
        }}
      >
        <MatrixCalculatorPanel matrix={matrix} stats={stats} onChangeMatrix={(m) => setMatrix(m)} />

        <TransformationCanvas matrix={matrix} />
      </Box>
    </DashboardContent>
  );
}
