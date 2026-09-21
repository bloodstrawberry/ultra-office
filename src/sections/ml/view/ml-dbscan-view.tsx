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

import { fitDbscan } from '../utils/math-ml';
import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateBlobsClusteringData,
  generateMoonsClassificationData,
  generateCirclesClassificationData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlDbscanView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [eps, setEps] = useState(1.1);
  const [minPts, setMinPts] = useState(4);
  const [preset, setPreset] = useState<'moons' | 'circles' | 'blobs'>('moons');

  useEffect(() => {
    setPoints(generateMoonsClassificationData(80, 0.2));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'moons' | 'circles' | 'blobs') => {
    setPreset(type);
    if (type === 'moons') setPoints(generateMoonsClassificationData(80, 0.2));
    else if (type === 'circles') setPoints(generateCirclesClassificationData(80));
    else if (type === 'blobs') setPoints(generateBlobsClusteringData(3, 25));
  };

  const model = useMemo(() => fitDbscan(points, eps, minPts), [points, eps, minPts]);

  const pythonCode = `# Scikit-Learn DBSCAN (밀도 기반 군집화)
from sklearn.cluster import DBSCAN

# 1. DBSCAN 모델 생성 (eps = ${eps}, min_samples = ${minPts})
dbscan = DBSCAN(eps=${eps}, min_samples=${minPts})
labels = dbscan.fit_predict(X)

# 2. 노이즈 및 군집 확인 (-1은 이상치/노이즈)
n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = list(labels).count(-1)

print(f"발견된 군집 수: {n_clusters}개")
print(f"이상치(Noise) 포인트 수: {n_noise}개")`;

  const jsCode = `// TypeScript DBSCAN 밀도 기반 알고리즘
// 1. epsilon 반경 내 이웃 데이터 검색
const neighbors = points.filter(other => dist(p, other) <= eps);

// 2. 이웃 수가 minPts 이상이면 핵심 포인트(Core Point)로 지정 및 군집 확장
if (neighbors.length >= minPts) {
  expandCluster(p, neighbors, currentCluster);
} else {
  isNoise[p.id] = true; // 경계 포인트가 아니면 노이즈 처리
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
      <MlHeaderNav currentModelId="dbscan" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="DBSCAN 밀도 군집화 작업 공간"
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

          {/* Right Panel: Controls & Density Stats */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ DBSCAN 밀도 파라미터 조절
                </Typography>

                {/* Preset Datasets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  데이터셋 프리셋 (비구형 클러스터):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  <Button
                    size="small"
                    variant={preset === 'moons' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('moons')}
                  >
                    두 개의 반달 (Moons)
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'circles' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('circles')}
                  >
                    동심원 (Concentric Rings)
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'blobs' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('blobs')}
                  >
                    일반 블롭
                  </Button>
                </Box>

                {/* Epsilon Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      이웃 반경 (Epsilon ε)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      ε = {eps.toFixed(2)}
                    </Typography>
                  </Box>
                  <Slider
                    value={eps}
                    min={0.4}
                    max={2.5}
                    step={0.05}
                    onChange={(_, v) => setEps(v as number)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    * ε가 너무 작으면 대부분이 노이즈가 되고, 너무 크면 모든 데이터가 하나의
                    군집으로 합쳐집니다.
                  </Typography>
                </Box>

                {/* MinPts Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      최소 이웃 수 (MinPts)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      MinPts = {minPts}개
                    </Typography>
                  </Box>
                  <Slider
                    value={minPts}
                    min={2}
                    max={10}
                    step={1}
                    marks
                    onChange={(_, v) => setMinPts(v as number)}
                  />
                </Box>
              </Card>

              {/* Density Classification Breakdown Card */}
              <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  🎯 포인트 밀도 분류 통계
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: 'primary.lighter',
                      border: '1px solid',
                      borderColor: 'primary.light',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'primary.darker' }}>
                      발견된 군집 수
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.darker' }}>
                      {model.clusterCount}개 클러스터
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      이상치/노이즈 (Noise)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'error.main' }}>
                      {model.noiseCount}개
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      핵심 포인트 (Core)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {model.coreCount}개
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      경계 포인트 (Border)
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 800 }}>
                      {model.borderCount}개
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Chip
                    size="small"
                    label="● 유효 군집"
                    color="primary"
                    sx={{ fontSize: '0.6875rem' }}
                  />
                  <Chip
                    size="small"
                    label="✕ 노이즈 (이상치)"
                    variant="outlined"
                    color="default"
                    sx={{ fontSize: '0.6875rem' }}
                  />
                </Box>
              </Card>
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
