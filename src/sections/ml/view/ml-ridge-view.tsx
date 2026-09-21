'use client';

import type { DataPoint2D } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { fitRidgeRegression } from '../utils/math-ml';
import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateSineRegressionData,
  generateOutlierRegressionData,
  generatePolynomialRegressionData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlRidgeView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [degree, setDegree] = useState(5);
  const [lambdaL2, setLambdaL2] = useState(1.5);
  const [preset, setPreset] = useState<'poly' | 'outlier' | 'sine'>('poly');

  useEffect(() => {
    setPoints(generatePolynomialRegressionData(35, 1.2));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'poly' | 'outlier' | 'sine') => {
    setPreset(type);
    if (type === 'poly') setPoints(generatePolynomialRegressionData(35, 1.2));
    else if (type === 'outlier') setPoints(generateOutlierRegressionData(35));
    else if (type === 'sine') setPoints(generateSineRegressionData(40, 0.4));
  };

  const model = useMemo(
    () => fitRidgeRegression(points, degree, lambdaL2),
    [points, degree, lambdaL2]
  );

  const pythonCode = `# Scikit-Learn 릿지 회귀 (Ridge Regression)
from sklearn.linear_model import Ridge
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# 1. 다항 특성 확장 (Degree = ${degree}) + Ridge (alpha = ${lambdaL2})
model = make_pipeline(
    PolynomialFeatures(degree=${degree}),
    Ridge(alpha=${lambdaL2})
)
model.fit(X, y)

# 2. 회귀 계수 (L2 규제로 계수 크기가 축소됨)
ridge_coefs = model.named_steps['ridge'].coef_
print("계수:", ridge_coefs)`;

  const jsCode = `// TypeScript 릿지 회귀 정규방정식 (X^T X + lambda * I)^(-1) X^T y
const XtX = matrixMultiply(matrixTranspose(X), X);

// L2 정규화 대각 성분 추가 (절편 제외)
for (let i = 1; i < numFeatures; i++) {
  XtX[i][i] += lambdaL2;
}

const inv = matrixInverse(XtX);
const weights = matrixVectorMultiply(inv, matrixVectorMultiply(matrixTranspose(X), y));`;

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
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <MlHeaderNav currentModelId="ridge" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="릿지 회귀(Ridge) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlCanvas2D
                points={points}
                onPointsChange={setPoints}
                onResetPreset={() => handlePresetChange(preset)}
                mode="regression"
                renderCurve={model.predict}
                height={500}
              />
            </Grid>
          )}

          {viewMode === 'spreadsheet' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlSpreadsheetEditor
                points={points}
                onChange={setPoints}
                taskType="regression"
                maxHeight={500}
              />
            </Grid>
          )}

          {viewMode === 'split' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MlCanvas2D
                  points={points}
                  onPointsChange={setPoints}
                  onResetPreset={() => handlePresetChange(preset)}
                  mode="regression"
                  renderCurve={model.predict}
                  height={380}
                />
                <MlSpreadsheetEditor
                  points={points}
                  onChange={setPoints}
                  taskType="regression"
                  maxHeight={320}
                />
              </Box>
            </Grid>
          )}

          {/* Right Panel: Controls, Weight Shrinkage & Metrics */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 릿지(L2) 규제 파라미터 조절
                </Typography>

                {/* Preset Datasets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  데이터셋 프리셋:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  <Button
                    size="small"
                    variant={preset === 'poly' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('poly')}
                  >
                    다항 곡선
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'outlier' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => handlePresetChange('outlier')}
                  >
                    이상치 포함
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'sine' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('sine')}
                  >
                    사인 파동
                  </Button>
                </Box>

                {/* L2 Lambda Slider */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      L2 규제 강도 (λ / alpha)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {lambdaL2.toFixed(2)}
                    </Typography>
                  </Box>
                  <Slider
                    value={lambdaL2}
                    min={0}
                    max={25}
                    step={0.25}
                    onChange={(_, v) => setLambdaL2(v as number)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    * λ=0이면 순수 OLS, λ가 커질수록 계수가 0에 가깝게 축소되어 부드러운 곡선이
                    됩니다.
                  </Typography>
                </Box>

                {/* Polynomial Degree Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      다항식 차수 (Degree)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      {degree}차 다항식
                    </Typography>
                  </Box>
                  <Slider
                    value={degree}
                    min={1}
                    max={8}
                    step={1}
                    marks
                    onChange={(_, v) => setDegree(v as number)}
                  />
                </Box>

                {/* Weight Shrinkage Visualization */}
                <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    가중치 축소 현황 (Weights Magnitude):
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {model.weights.map((w, idx) => {
                      const mag = Math.min(100, Math.abs(w) * 20);
                      return (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography
                            variant="caption"
                            sx={{ width: 36, fontFamily: 'monospace', fontWeight: 700 }}
                          >
                            {idx === 0 ? 'Bias' : `w${idx}`}
                          </Typography>
                          <Box
                            sx={{
                              flex: 1,
                              height: 8,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                              overflow: 'hidden',
                            }}
                          >
                            <Box
                              sx={{
                                width: `${mag}%`,
                                height: '100%',
                                bgcolor: w >= 0 ? 'primary.main' : 'error.main',
                                transition: 'width 0.15s ease',
                              }}
                            />
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{ width: 44, textAlign: 'right', fontFamily: 'monospace' }}
                          >
                            {w.toFixed(2)}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Card>

              {/* Metrics */}
              <MlMetricsPanel regression={model.metrics} />
            </Box>
          </Grid>

          {/* Bottom Code Snippet */}
          <Grid size={{ xs: 12 }}>
            <MlCodeSnippet pythonCode={pythonCode} jsCode={jsCode} />
          </Grid>
        </Grid>
      </Box>
    </DashboardContent>
  );
}
