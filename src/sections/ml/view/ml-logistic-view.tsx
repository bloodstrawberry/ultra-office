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

import { MlCanvas2D } from '../components/ml-canvas-2d';
import { fitLogisticRegression } from '../utils/math-ml';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateMoonsClassificationData,
  generateCirclesClassificationData,
  generateSeparableClassificationData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlLogisticView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [activeClass, setActiveClass] = useState<number>(0);
  const [preset, setPreset] = useState<'separable' | 'moons' | 'circles'>('separable');
  const [decisionThreshold, setDecisionThreshold] = useState(0.5);
  const [learningRate, setLearningRate] = useState(0.08);
  const [epochs, setEpochs] = useState(250);

  useEffect(() => {
    setPoints(generateSeparableClassificationData(30));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'separable' | 'moons' | 'circles') => {
    setPreset(type);
    if (type === 'separable') setPoints(generateSeparableClassificationData(30));
    else if (type === 'moons') setPoints(generateMoonsClassificationData(60, 0.25));
    else if (type === 'circles') setPoints(generateCirclesClassificationData(60));
  };

  const model = useMemo(
    () => fitLogisticRegression(points, learningRate, epochs, decisionThreshold),
    [points, learningRate, epochs, decisionThreshold]
  );

  const pythonCode = `# Scikit-Learn 로지스틱 회귀 (Logistic Regression)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix

# 1. 2D 데이터 분류기 학습
model = LogisticRegression()
model.fit(X, y)

# 2. 결정 임계값(${decisionThreshold}) 기반 예측
probs = model.predict_proba(X)[:, 1]
y_pred = (probs >= ${decisionThreshold}).astype(int)

print("혼동 행렬:\\n", confusion_matrix(y, y_pred))
print(classification_report(y, y_pred))`;

  const jsCode = `// TypeScript 로지스틱 회귀 및 커스텀 결정 임계값
const sigmoid = (z) => 1 / (1 + Math.exp(-z));
const prob = sigmoid(w1 * x + w2 * y + b);

// 결정 임계값: 기본 0.5에서 ${decisionThreshold}로 조정
const predictClass = (x, y) => prob >= ${decisionThreshold} ? 1 : 0;`;

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
      <MlHeaderNav currentModelId="logistic" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="로지스틱 회귀(Logistic) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlCanvas2D
                points={points}
                onPointsChange={setPoints}
                onResetPreset={() => handlePresetChange(preset)}
                mode="classification"
                activeClass={activeClass}
                onActiveClassChange={setActiveClass}
                renderDecisionField={model.predictProb}
                height={500}
              />
            </Grid>
          )}

          {viewMode === 'spreadsheet' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlSpreadsheetEditor
                points={points}
                onChange={setPoints}
                taskType="classification"
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
                  mode="classification"
                  activeClass={activeClass}
                  onActiveClassChange={setActiveClass}
                  renderDecisionField={model.predictProb}
                  height={380}
                />
                <MlSpreadsheetEditor
                  points={points}
                  onChange={setPoints}
                  taskType="classification"
                  maxHeight={320}
                />
              </Box>
            </Grid>
          )}

          {/* Right Panel: Controls & Metrics */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 로지스틱 회귀 파라미터 조절
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
                    variant={preset === 'separable' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('separable')}
                  >
                    선형 분리 가능
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'moons' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('moons')}
                  >
                    반달 (Moons)
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'circles' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('circles')}
                  >
                    동심원 (Circles)
                  </Button>
                </Box>

                {/* Decision Threshold Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      결정 임계값 (Decision Threshold)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      P ≥ {decisionThreshold.toFixed(2)}
                    </Typography>
                  </Box>
                  <Slider
                    value={decisionThreshold}
                    min={0.1}
                    max={0.9}
                    step={0.05}
                    marks={[
                      { value: 0.1, label: '0.1' },
                      { value: 0.5, label: '0.5' },
                      { value: 0.9, label: '0.9' },
                    ]}
                    onChange={(_, v) => setDecisionThreshold(v as number)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    * 임계값을 올리면 정밀도(Precision)가 올라가고, 내리면 재현율(Recall)이
                    올라갑니다.
                  </Typography>
                </Box>

                {/* Learning Rate */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      학습률 (Learning Rate α)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      {learningRate.toFixed(3)}
                    </Typography>
                  </Box>
                  <Slider
                    value={learningRate}
                    min={0.01}
                    max={0.25}
                    step={0.01}
                    onChange={(_, v) => setLearningRate(v as number)}
                  />
                </Box>

                {/* Epochs */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      반복 에포크 (Epochs)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {epochs}회
                    </Typography>
                  </Box>
                  <Slider
                    value={epochs}
                    min={50}
                    max={600}
                    step={25}
                    onChange={(_, v) => setEpochs(v as number)}
                  />
                </Box>

                {/* Boundary Equation */}
                <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontWeight: 700, display: 'block' }}
                  >
                    결정 경계면 (w₁x + w₂y + b = 0):
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.dark' }}
                  >
                    {model.w1.toFixed(3)}·x + {model.w2.toFixed(3)}·y + {model.b.toFixed(3)} = 0
                  </Typography>
                </Box>
              </Card>

              {/* Metrics */}
              <MlMetricsPanel classification={model.metrics} />
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
