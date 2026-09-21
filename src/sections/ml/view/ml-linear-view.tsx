'use client';

import type { DataPoint2D } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';

import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { fitSimpleLinearRegression } from '../utils/math-ml';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateSineRegressionData,
  generateLinearRegressionData,
  generateOutlierRegressionData,
  generatePolynomialRegressionData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlLinearView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [preset, setPreset] = useState<'linear' | 'outlier' | 'poly' | 'sine'>('linear');
  const [solver, setSolver] = useState<'ols' | 'gd' | 'sgd'>('ols');
  const [fitIntercept, setFitIntercept] = useState(true);
  const [learningRate, setLearningRate] = useState(0.02);
  const [gdEpochs, setGdEpochs] = useState(120);

  useEffect(() => {
    setPoints(generateLinearRegressionData(35, 1.0, 1.5, 0.5));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'linear' | 'outlier' | 'poly' | 'sine') => {
    setPreset(type);
    if (type === 'linear') setPoints(generateLinearRegressionData(35, 1.0, 1.5, 0.5));
    else if (type === 'outlier') setPoints(generateOutlierRegressionData(35));
    else if (type === 'poly') setPoints(generatePolynomialRegressionData(35, 1.2));
    else if (type === 'sine') setPoints(generateSineRegressionData(40, 0.4));
  };

  // Model Fitting
  const model = useMemo(() => {
    if (solver === 'ols') {
      return fitSimpleLinearRegression(points, fitIntercept);
    }

    let w = 0;
    let b = 0;
    const n = points.length;

    if (n >= 2) {
      if (solver === 'gd') {
        // Batch Gradient Descent
        for (let epoch = 0; epoch < gdEpochs; epoch += 1) {
          let dw = 0;
          let db = 0;
          for (const p of points) {
            const pred = w * p.x + (fitIntercept ? b : 0);
            const diff = pred - p.y;
            dw += diff * p.x;
            if (fitIntercept) db += diff;
          }
          w -= (learningRate * dw) / n;
          if (fitIntercept) b -= (learningRate * db) / n;
        }
      } else {
        // Stochastic Gradient Descent (SGD)
        for (let epoch = 0; epoch < gdEpochs; epoch += 1) {
          for (const p of points) {
            const pred = w * p.x + (fitIntercept ? b : 0);
            const diff = pred - p.y;
            w -= learningRate * diff * p.x;
            if (fitIntercept) b -= learningRate * diff;
          }
        }
      }
    }

    const predict = (x: number) => w * x + (fitIntercept ? b : 0);
    const actualY = points.map((p) => p.y);
    const predY = points.map((p) => predict(p.x));
    const ssRes = actualY.reduce((acc, y, i) => acc + (y - predY[i]) ** 2, 0);
    const meanY = actualY.length ? actualY.reduce((sum, val) => sum + val, 0) / actualY.length : 0;
    const ssTot = actualY.reduce((acc, y) => acc + (y - meanY) ** 2, 0);
    const mse = n > 0 ? ssRes / n : 0;
    const rmse = Math.sqrt(mse);
    const mae = n > 0 ? actualY.reduce((acc, y, i) => acc + Math.abs(y - predY[i]), 0) / n : 0;
    const r2 = ssTot === 0 ? 1 : Math.max(-1, 1 - ssRes / ssTot);
    return { w, b: fitIntercept ? b : 0, predict, metrics: { mse, rmse, mae, r2 } };
  }, [points, solver, fitIntercept, learningRate, gdEpochs]);

  const pythonCode = `# Scikit-Learn 선형 회귀 (Linear Regression)
import numpy as np
from sklearn.linear_model import LinearRegression, SGDRegressor
from sklearn.metrics import mean_squared_error, r2_score

# 1. 모델 선택 (fit_intercept = ${fitIntercept})
${
  solver === 'ols'
    ? `model = LinearRegression(fit_intercept=${fitIntercept})`
    : `model = SGDRegressor(learning_rate='constant', eta0=${learningRate}, max_iter=${gdEpochs}, fit_intercept=${fitIntercept})`
}
model.fit(X, y)

# 2. 파라미터 확인
print(f"기울기 (Slope w): {model.coef_[0]:.4f}")
print(f"절편 (Intercept b): {model.intercept_}")
pred_y = model.predict(X)
print(f"MSE: {mean_squared_error(y, pred_y):.4f}")
print(f"R²: {r2_score(y, pred_y):.4f}")`;

  const jsCode = `// TypeScript / Next.js 선형 회귀 구현
${
  solver === 'ols'
    ? `// OLS 최소자승법: w = sum((x-x_mean)*(y-y_mean)) / sum((x-x_mean)^2)
const res = fitSimpleLinearRegression(points, ${fitIntercept});`
    : `// ${solver === 'gd' ? '배치 경사하강법 (Batch GD)' : '확률적 경사하강법 (SGD)'}
for (let epoch = 0; epoch < ${gdEpochs}; epoch++) {
  // dw = error * x, db = error
  w -= lr * dw;
  ${fitIntercept ? 'b -= lr * db;' : '// 절편 제외 (b=0 고정)'}
}`
}`;

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
      <MlHeaderNav currentModelId="linear" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="선형 모델 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Interactive Workspaces */}
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

          {/* Right Panel: Controls & Hyperparameters */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 모델 하이퍼파라미터 및 솔버
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
                    variant={preset === 'linear' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('linear')}
                  >
                    기본 선형
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
                    variant={preset === 'poly' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('poly')}
                  >
                    3차 곡선
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'sine' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('sine')}
                  >
                    사인 파동
                  </Button>
                </Box>

                {/* Solver Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  학습 최적화 알고리즘 (Solver):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={solver}
                  onChange={(_, v) => v && setSolver(v)}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="ols" sx={{ fontWeight: 700 }}>
                    OLS (최소자승법)
                  </ToggleButton>
                  <ToggleButton value="gd" sx={{ fontWeight: 700 }}>
                    배치 GD
                  </ToggleButton>
                  <ToggleButton value="sgd" sx={{ fontWeight: 700 }}>
                    SGD (확률적)
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Fit Intercept Toggle */}
                <Box sx={{ mb: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={fitIntercept}
                        onChange={(e) => setFitIntercept(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        절편(b) 학습 (Fit Intercept)
                      </Typography>
                    }
                  />
                  {!fitIntercept && (
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                      * 절편을 0으로 고정하여 원점 (0, 0)을 반드시 통과합니다.
                    </Typography>
                  )}
                </Box>

                {solver !== 'ols' && (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      mb: 2,
                      p: 1.5,
                      bgcolor: 'background.neutral',
                      borderRadius: 1.5,
                    }}
                  >
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          학습률 (Learning Rate α)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {learningRate}
                        </Typography>
                      </Box>
                      <Slider
                        value={learningRate}
                        min={0.001}
                        max={0.08}
                        step={0.002}
                        onChange={(_, v) => setLearningRate(v as number)}
                      />
                    </Box>
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          반복 에포크 (Epochs)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {gdEpochs}회
                        </Typography>
                      </Box>
                      <Slider
                        value={gdEpochs}
                        min={10}
                        max={500}
                        step={10}
                        onChange={(_, v) => setGdEpochs(v as number)}
                      />
                    </Box>
                  </Box>
                )}

                {/* Fitted Line Equation */}
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'primary.lighter',
                    border: '1px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.darker', fontWeight: 700, display: 'block' }}
                  >
                    피팅된 회귀 방정식:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.darker' }}>
                    y = {model.w.toFixed(3)}x {fitIntercept ? `+ ${model.b.toFixed(3)}` : ''}
                  </Typography>
                </Box>
              </Card>

              {/* Metrics Panel */}
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
