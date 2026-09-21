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
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { DashboardContent } from 'src/layouts/dashboard';

import { fitKnnClassifier } from '../utils/math-ml';
import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateXorClassificationData,
  generateMoonsClassificationData,
  generateCirclesClassificationData,
  generateSeparableClassificationData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlKnnView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [k, setK] = useState(5);
  const [metric, setMetric] = useState<'euclidean' | 'manhattan' | 'chebyshev'>('euclidean');
  const [weights, setWeights] = useState<'uniform' | 'distance'>('uniform');
  const [activeClass, setActiveClass] = useState(0);
  const [preset, setPreset] = useState<'moons' | 'circles' | 'xor' | 'separable'>('moons');

  useEffect(() => {
    setPoints(generateMoonsClassificationData(60, 0.2));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'moons' | 'circles' | 'xor' | 'separable') => {
    setPreset(type);
    if (type === 'moons') setPoints(generateMoonsClassificationData(60, 0.2));
    else if (type === 'circles') setPoints(generateCirclesClassificationData(60));
    else if (type === 'xor') setPoints(generateXorClassificationData(16));
    else if (type === 'separable') setPoints(generateSeparableClassificationData(30));
  };

  const model = useMemo(
    () => fitKnnClassifier(points, k, metric, weights),
    [points, k, metric, weights]
  );

  const decisionFieldRenderer = useMemo(
    () => (x: number, y: number) => {
      const res = model.predict(x, y);
      return res.predictedClass === 1 ? 1 : 0;
    },
    [model]
  );

  const pythonCode = `# Scikit-Learn K-최근접 이웃 (KNN Classifier)
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import classification_report, confusion_matrix

# 1. KNN 분류기 (K = ${k}, Metric = '${metric}', Weights = '${weights}')
knn = KNeighborsClassifier(
    n_neighbors=${k},
    metric='${metric}',
    weights='${weights}'
)
knn.fit(X, y)

# 2. 예측 및 평가
y_pred = knn.predict(X)
print("혼동 행렬:\\n", confusion_matrix(y, y_pred))
print(classification_report(y, y_pred))`;

  const jsCode = `// TypeScript KNN 알고리즘 구현
const distance = (x1, y1, x2, y2) => {
  if (metric === 'manhattan') return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  if (metric === 'chebyshev') return Math.max(Math.abs(x1 - x2), Math.abs(y1 - y2));
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

// 거리 가중치: ${weights === 'distance' ? '1 / (dist + 1e-4)' : '1 (균등 투표)'}
const voteWeight = weights === 'distance' ? 1 / (d + 1e-4) : 1;`;

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
      <MlHeaderNav currentModelId="knn" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="K-최근접 이웃(KNN) 작업 공간"
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
                renderDecisionField={decisionFieldRenderer}
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
                  renderDecisionField={decisionFieldRenderer}
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
                  ⚙️ KNN 파라미터 조절
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
                  <Button
                    size="small"
                    variant={preset === 'xor' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('xor')}
                  >
                    XOR 사분면
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'separable' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('separable')}
                  >
                    단순 분리
                  </Button>
                </Box>

                {/* K Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      이웃 개수 (K Neighbors)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      K = {k}
                    </Typography>
                  </Box>
                  <Slider
                    value={k}
                    min={1}
                    max={21}
                    step={2}
                    marks={[
                      { value: 1, label: '1' },
                      { value: 5, label: '5' },
                      { value: 11, label: '11' },
                      { value: 21, label: '21' },
                    ]}
                    onChange={(_, v) => setK(v as number)}
                  />
                </Box>

                {/* Distance Metric Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  거리 척도 (Distance Metric):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={metric}
                  onChange={(_, v) => v && setMetric(v)}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="euclidean" sx={{ fontWeight: 700 }}>
                    유클리드 (L2)
                  </ToggleButton>
                  <ToggleButton value="manhattan" sx={{ fontWeight: 700 }}>
                    맨해튼 (L1)
                  </ToggleButton>
                  <ToggleButton value="chebyshev" sx={{ fontWeight: 700 }}>
                    체비쇼프 (L∞)
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Weights Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  투표 가중치 (Weights):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={weights}
                  onChange={(_, v) => v && setWeights(v)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="uniform" sx={{ fontWeight: 700 }}>
                    균등 투표 (Uniform)
                  </ToggleButton>
                  <ToggleButton value="distance" sx={{ fontWeight: 700 }}>
                    거리 반비례 (1/Distance)
                  </ToggleButton>
                </ToggleButtonGroup>
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
