'use client';

import type { DataPoint2D } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { fitPca2D } from '../utils/math-ml';
import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import { generateCorrelatedPcaData, generateBlobsClusteringData } from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlPcaView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [showProjection, setShowProjection] = useState(true);
  const [angleDeg, setAngleDeg] = useState(35);
  const [lockToPc1, setLockToPc1] = useState(true);
  const [preset, setPreset] = useState<'corr35' | 'corr70' | 'blobs'>('corr35');

  useEffect(() => {
    setPoints(generateCorrelatedPcaData(60, 35));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'corr35' | 'corr70' | 'blobs') => {
    setPreset(type);
    if (type === 'corr35') setPoints(generateCorrelatedPcaData(60, 35));
    else if (type === 'corr70') setPoints(generateCorrelatedPcaData(60, 70));
    else if (type === 'blobs') setPoints(generateBlobsClusteringData(2, 30));
  };

  const model = useMemo(() => fitPca2D(points), [points]);

  // Derived PC1 angle
  const pc1AngleDeg = useMemo(() => {
    const [vx, vy] = model.metrics.eigenvectors[0];
    return Math.round((Math.atan2(vy, vx) * 180) / Math.PI);
  }, [model]);

  const activeAngle = lockToPc1 ? pc1AngleDeg : angleDeg;

  const pcaVectors = useMemo(
    () => ({
      meanX: model.meanX,
      meanY: model.meanY,
      v1: model.metrics.eigenvectors[0],
      v2: model.metrics.eigenvectors[1],
      lambda1: model.metrics.eigenvalues[0],
      lambda2: model.metrics.eigenvalues[1],
    }),
    [model]
  );

  const pcaProjection = useMemo(() => {
    if (!showProjection) return undefined;
    return (x: number, y: number) => {
      const p = model.project1D(x, y, activeAngle);
      return { projX: p.projX, projY: p.projY };
    };
  }, [model, showProjection, activeAngle]);

  const pythonCode = `# Scikit-Learn 주성분 분석 (PCA)
from sklearn.decomposition import PCA

# 1. 2차원 데이터에서 주성분 추출 (n_components = 2)
pca = PCA(n_components=2)
pca.fit(X)

# 2. 고유벡터 및 설명 분산 비율
print("주성분 벡터 (PC1, PC2):\\n", pca.components_)
print("설명 분산 비율 (EVR):", pca.explained_variance_ratio_)

# 3. 1차원 투영 변환
X_1d = pca.transform(X)[:, :1]`;

  const jsCode = `// TypeScript 2D 공분산 행렬 및 고유치 분해
// 1. 공분산 행렬 C = [[covXX, covXY], [covXY, covYY]]
const trace = covXX + covYY;
const det = covXX * covYY - covXY ** 2;

// 2. 특성방정식 det(C - lambda*I) = 0 해 산출
const lambda1 = (trace + Math.sqrt(trace ** 2 - 4 * det)) / 2;
const lambda2 = (trace - Math.sqrt(trace ** 2 - 4 * det)) / 2;

// 3. 고유벡터 v1, v2 정규화 및 설명 분산 비율 계산
const evr1 = lambda1 / (lambda1 + lambda2);`;

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
      <MlHeaderNav currentModelId="pca" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="주성분 분석(PCA) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlCanvas2D
                points={points}
                onPointsChange={setPoints}
                onResetPreset={() => handlePresetChange(preset)}
                mode="pca"
                pcaVectors={pcaVectors}
                pcaProjection={pcaProjection}
                height={500}
              />
            </Grid>
          )}

          {viewMode === 'spreadsheet' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlSpreadsheetEditor
                points={points}
                onChange={setPoints}
                taskType="pca"
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
                  mode="pca"
                  pcaVectors={pcaVectors}
                  pcaProjection={pcaProjection}
                  height={380}
                />
                <MlSpreadsheetEditor
                  points={points}
                  onChange={setPoints}
                  taskType="pca"
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
                  ⚙️ PCA 차원 축소 및 투영 설정
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
                    variant={preset === 'corr35' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('corr35')}
                  >
                    35° 상관 분포
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'corr70' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('corr70')}
                  >
                    70° 상관 분포
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'blobs' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('blobs')}
                  >
                    이중 군집 분포
                  </Button>
                </Box>

                {/* Projection Toggles */}
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={showProjection}
                        onChange={(e) => setShowProjection(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        1차원 축 투영선 표시
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={lockToPc1}
                        onChange={(e) => setLockToPc1(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        제1 주성분(PC1) 축에 투영 고정
                      </Typography>
                    }
                  />
                </Box>

                {!lockToPc1 && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        수동 투영 축 각도
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {angleDeg}°
                      </Typography>
                    </Box>
                    <Slider
                      value={angleDeg}
                      min={0}
                      max={180}
                      step={2}
                      onChange={(_, v) => setAngleDeg(v as number)}
                    />
                  </Box>
                )}

                {/* PC Vector Legend */}
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#06B6D4' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      PC1 (제1 주성분 벡터): 분산 최대화 축
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: '#A855F7' }} />
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      PC2 (제2 주성분 벡터): PC1과 직교하는 축
                    </Typography>
                  </Box>
                </Box>
              </Card>

              {/* Metrics */}
              <MlMetricsPanel pca={model.metrics} />
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
