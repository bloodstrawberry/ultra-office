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

import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlMetricsPanel } from '../components/ml-metrics-panel';
import { fitKMeans, computeElbowCurve } from '../utils/math-ml';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import { generateBlobsClusteringData, generateMoonsClassificationData } from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlKmeansView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [k, setK] = useState(3);
  const [initMethod, setInitMethod] = useState<'kmeans++' | 'random'>('kmeans++');
  const [preset, setPreset] = useState<'blobs3' | 'blobs5' | 'moons'>('blobs3');
  const [refreshSeed, setRefreshSeed] = useState(0);

  useEffect(() => {
    setPoints(generateBlobsClusteringData(3, 30));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'blobs3' | 'blobs5' | 'moons') => {
    setPreset(type);
    if (type === 'blobs3') setPoints(generateBlobsClusteringData(3, 30));
    else if (type === 'blobs5') setPoints(generateBlobsClusteringData(5, 20));
    else if (type === 'moons') setPoints(generateMoonsClassificationData(70, 0.2));
  };

  const model = useMemo(
    () => fitKMeans(points, k, initMethod, 30),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [points, k, initMethod, refreshSeed]
  );

  const elbowData = useMemo(() => computeElbowCurve(points, 7), [points]);

  const pythonCode = `# Scikit-Learn K-평균 군집화 (K-Means)
from sklearn.cluster import KMeans

# 1. K-Means 모델 생성 (K = ${k}, Init = '${initMethod}')
kmeans = KMeans(n_clusters=${k}, init='${initMethod}', random_state=42)
kmeans.fit(X)

# 2. 결과 확인
labels = kmeans.labels_
centroids = kmeans.cluster_centers_
inertia = kmeans.inertia_

print(f"군집 내 오차제곱합 (Inertia/WCSS): {inertia:.2f}")
print("클러스터 중심점 좌표:\\n", centroids)`;

  const jsCode = `// TypeScript Lloyd's 알고리즘 (K-Means)
// 1. 센트로이드와 각 점 간의 거리 계산 후 가장 가까운 클러스터 배정
clustered = points.map(p => {
  let minDist = Infinity, bestC = 0;
  centroids.forEach((c, idx) => {
    const d = (p.x - c.x) ** 2 + (p.y - c.y) ** 2;
    if (d < minDist) { minDist = d; bestC = idx; }
  });
  return { ...p, cluster: bestC };
});

// 2. 배정된 점들의 평균으로 센트로이드 갱신`;

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
      <MlHeaderNav currentModelId="kmeans" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="K-평균 군집화(K-Means) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlCanvas2D
                points={model.clusteredPoints}
                onPointsChange={setPoints}
                onResetPreset={() => handlePresetChange(preset)}
                mode="clustering"
                centroids={model.centroids}
                height={500}
              />
            </Grid>
          )}

          {viewMode === 'spreadsheet' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <MlSpreadsheetEditor
                points={model.clusteredPoints}
                onChange={setPoints}
                taskType="clustering"
                maxHeight={500}
              />
            </Grid>
          )}

          {viewMode === 'split' && (
            <Grid size={{ xs: 12, lg: 8 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <MlCanvas2D
                  points={model.clusteredPoints}
                  onPointsChange={setPoints}
                  onResetPreset={() => handlePresetChange(preset)}
                  mode="clustering"
                  centroids={model.centroids}
                  height={380}
                />
                <MlSpreadsheetEditor
                  points={model.clusteredPoints}
                  onChange={setPoints}
                  taskType="clustering"
                  maxHeight={320}
                />
              </Box>
            </Grid>
          )}

          {/* Right Panel: Controls & Elbow Method */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ K-평균 군집화 파라미터 조절
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
                    variant={preset === 'blobs3' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('blobs3')}
                  >
                    3개 블롭
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'blobs5' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('blobs5')}
                  >
                    5개 블롭
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'moons' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('moons')}
                  >
                    반달 (비구형 한계)
                  </Button>
                </Box>

                {/* K Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      클러스터 개수 (K)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      K = {k}
                    </Typography>
                  </Box>
                  <Slider
                    value={k}
                    min={2}
                    max={7}
                    step={1}
                    marks
                    onChange={(_, v) => setK(v as number)}
                  />
                </Box>

                {/* Init Method Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  센트로이드 초기화 (Init Method):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={initMethod}
                  onChange={(_, v) => v && setInitMethod(v)}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="kmeans++" sx={{ fontWeight: 700 }}>
                    K-Means++ (거리 시딩)
                  </ToggleButton>
                  <ToggleButton value="random" sx={{ fontWeight: 700 }}>
                    랜덤 (Random)
                  </ToggleButton>
                </ToggleButtonGroup>

                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => setRefreshSeed((s) => s + 1)}
                  sx={{ fontWeight: 700 }}
                >
                  🔄 초기 중심 재배치 및 다시 학습
                </Button>
              </Card>

              {/* Elbow Method Chart */}
              <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  📈 최적의 K 탐색: 엘보우 차트 (Elbow Method)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}
                >
                  Inertia(군집 내 분산)의 감소폭이 완만해지는 팔꿈치 지점이 최적의 클러스터
                  개수입니다.
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    height: 100,
                    gap: 1,
                    pt: 1,
                    px: 1,
                    bgcolor: 'background.neutral',
                    borderRadius: 1.5,
                  }}
                >
                  {elbowData.map((item) => {
                    const maxInertia = elbowData[0]?.inertia || 1;
                    const barHeight = Math.max(12, Math.min(90, (item.inertia / maxInertia) * 90));
                    const isCurrent = item.k === k;
                    return (
                      <Box
                        key={item.k}
                        sx={{
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          height: '100%',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.625rem',
                            color: isCurrent ? 'primary.main' : 'text.disabled',
                            fontWeight: 700,
                          }}
                        >
                          {Math.round(item.inertia)}
                        </Typography>
                        <Box
                          sx={{
                            width: '100%',
                            height: `${barHeight}%`,
                            bgcolor: isCurrent ? 'primary.main' : 'action.active',
                            borderRadius: '4px 4px 0 0',
                            transition: 'height 0.2s',
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            fontWeight: isCurrent ? 800 : 500,
                            color: isCurrent ? 'primary.main' : 'text.secondary',
                          }}
                        >
                          K={item.k}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Card>

              {/* Metrics */}
              <MlMetricsPanel clustering={model.metrics} />
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
