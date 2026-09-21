'use client';

import type { DataPoint2D } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { fitLassoRegression } from '../utils/math-ml';
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

export function MlLassoView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [degree, setDegree] = useState(5);
  const [lambdaL1, setLambdaL1] = useState(0.8);
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
    () => fitLassoRegression(points, degree, lambdaL1),
    [points, degree, lambdaL1]
  );

  const zeroWeightsCount = model.weights.slice(1).filter((w) => Math.abs(w) < 1e-5).length;

  const pythonCode = `# Scikit-Learn 라쏘 회귀 (Lasso Regression)
from sklearn.linear_model import Lasso
from sklearn.preprocessing import PolynomialFeatures
from sklearn.pipeline import make_pipeline

# 1. 다항 특성 확장 (Degree = ${degree}) + Lasso (alpha = ${lambdaL1})
model = make_pipeline(
    PolynomialFeatures(degree=${degree}),
    Lasso(alpha=${lambdaL1}, max_iter=2000)
)
model.fit(X, y)

# 2. 회귀 계수 (L1 규제로 불필요한 계수가 정확히 0이 됨)
lasso_coefs = model.named_steps['lasso'].coef_
print("계수:", lasso_coefs)
print(f"0이 된 특성 수: {sum(lasso_coefs == 0)}개")`;

  const jsCode = `// TypeScript 라쏘 회귀 좌표 하강법 (Coordinate Descent)
// Soft-thresholding: sign(rho) * max(0, |rho| - lambda * n)
function softThreshold(z, lambda) {
  if (z > lambda) return z - lambda;
  if (z < -lambda) return z + lambda;
  return 0;
}

// 각 가중치를 순차적으로 갱신하며 수렴
weights[j] = softThreshold(rho, lambdaL1 * n) / colNormSq[j];`;

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
      <MlHeaderNav currentModelId="lasso" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="라쏘 회귀(Lasso L1) 작업 공간"
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

          {/* Right Panel: Controls, Sparsity & Metrics */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 라쏘(L1) 규제 파라미터 조절
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

                {/* L1 Lambda Slider */}
                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      L1 규제 강도 (λ / alpha)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                      {lambdaL1.toFixed(2)}
                    </Typography>
                  </Box>
                  <Slider
                    value={lambdaL1}
                    min={0}
                    max={6}
                    step={0.1}
                    onChange={(_, v) => setLambdaL1(v as number)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    * L1 패널티는 가중치 절댓값의 합을 규제하여 중요하지 않은 특성을 정확히 0으로
                    소멸시킵니다.
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

                {/* Sparsity Badge */}
                <Box
                  sx={{
                    mb: 2,
                    p: 1.5,
                    bgcolor: 'error.lighter',
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'error.light',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 700 }}>
                      희소성(Sparsity) 특성 선택:
                    </Typography>
                    <Chip
                      size="small"
                      color="error"
                      label={`0이 된 계수: ${zeroWeightsCount}/${degree}개`}
                      sx={{ fontWeight: 800, fontSize: '0.6875rem' }}
                    />
                  </Box>
                </Box>

                {/* Weights List */}
                <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 1 }}
                  >
                    회귀 계수 목록:
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {model.weights.map((w, idx) => {
                      const isZero = Math.abs(w) < 1e-5;
                      return (
                        <Box
                          key={idx}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'monospace', fontWeight: 700 }}
                          >
                            {idx === 0 ? 'Bias' : `w${idx} (x^${idx})`}
                          </Typography>
                          {isZero ? (
                            <Chip
                              size="small"
                              variant="soft"
                              color="default"
                              label="0.0000 (제거됨)"
                              sx={{ height: 20, fontSize: '0.6875rem' }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: 'monospace',
                                fontWeight: 800,
                                color: 'primary.main',
                              }}
                            >
                              {w.toFixed(4)}
                            </Typography>
                          )}
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
