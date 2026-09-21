'use client';

import type { DataPoint2D, DendrogramNode } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { fitHierarchicalClustering } from '../utils/math-ml';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import { generateBlobsClusteringData, generateMoonsClassificationData } from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlHierarchicalView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [numClusters, setNumClusters] = useState(3);
  const [linkage, setLinkage] = useState<'single' | 'complete' | 'average'>('average');
  const [preset, setPreset] = useState<'blobs3' | 'moons'>('blobs3');

  useEffect(() => {
    setPoints(generateBlobsClusteringData(3, 22));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'blobs3' | 'moons') => {
    setPreset(type);
    if (type === 'blobs3') setPoints(generateBlobsClusteringData(3, 22));
    else if (type === 'moons') setPoints(generateMoonsClassificationData(50, 0.2));
  };

  const model = useMemo(
    () => fitHierarchicalClustering(points, numClusters, linkage),
    [points, numClusters, linkage]
  );

  const pythonCode = `# Scikit-Learn 계층적 병합 군집화 (Agglomerative Clustering)
from sklearn.cluster import AgglomerativeClustering
from scipy.cluster.hierarchy import dendrogram, linkage
import matplotlib.pyplot as plt

# 1. 병합 군집 모델 생성 (Linkage = '${linkage}', Clusters = ${numClusters})
cluster = AgglomerativeClustering(n_clusters=${numClusters}, linkage='${linkage}')
labels = cluster.fit_predict(X)

# 2. 덴드로그램 (수형도) 계산
Z = linkage(X, method='${linkage}')
dendrogram(Z)
plt.show()`;

  const jsCode = `// TypeScript 계층적 병합 군집화 (Agglomerative)
// 가장 가까운 두 클러스터를 찾아 순차 병합
while (clusters.length > 1) {
  let minDist = Infinity, bestA = 0, bestB = 1;
  // 단일(Single), 완전(Complete), 평균(Average) 거리 척도로 거리 행렬 계산
  const d = computeClusterDist(c1, c2, linkage);
  // 노드 병합 및 덴드로그램 트리 연결
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
      <MlHeaderNav currentModelId="hierarchical" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="계층적 군집화(Hierarchical) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 7 }}>
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
            <Grid size={{ xs: 12, lg: 7 }}>
              <MlSpreadsheetEditor
                points={model.clusteredPoints}
                onChange={setPoints}
                taskType="clustering"
                maxHeight={500}
              />
            </Grid>
          )}

          {viewMode === 'split' && (
            <Grid size={{ xs: 12, lg: 7 }}>
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

          {/* Right Panel: Controls & Dendrogram Tree */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 계층적 군집화 파라미터 조절
                </Typography>

                {/* Preset Datasets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  데이터셋 프리셋:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    size="small"
                    variant={preset === 'blobs3' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('blobs3')}
                  >
                    3개 블롭 군집
                  </Button>
                  <Button
                    size="small"
                    variant={preset === 'moons' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('moons')}
                  >
                    반달 (Moons)
                  </Button>
                </Box>

                {/* Cluster Count Cut */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      목표 군집 수 (Clusters Cut)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {numClusters}개 군집
                    </Typography>
                  </Box>
                  <Slider
                    value={numClusters}
                    min={2}
                    max={6}
                    step={1}
                    marks
                    onChange={(_, v) => setNumClusters(v as number)}
                  />
                </Box>

                {/* Linkage Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  거리 연결법 (Linkage Method):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={linkage}
                  onChange={(_, v) => v && setLinkage(v)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="average" sx={{ fontWeight: 700 }}>
                    평균 연결 (Average)
                  </ToggleButton>
                  <ToggleButton value="single" sx={{ fontWeight: 700 }}>
                    단일 연결 (Single)
                  </ToggleButton>
                  <ToggleButton value="complete" sx={{ fontWeight: 700 }}>
                    완전 연결 (Complete)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Card>

              {/* Dendrogram Visualization */}
              <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  🌿 덴드로그램 수형도 (Dendrogram Merges)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', mb: 1.5, display: 'block' }}
                >
                  가장 아래의 단일 데이터 포인트들이 거리(Distance)에 따라 상향식으로 병합되어
                  하나의 트리로 수렴합니다.
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    borderRadius: 1.5,
                    maxHeight: 220,
                    overflowY: 'auto',
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                  }}
                >
                  <DendrogramNodeRenderer node={model.dendrogramRoot} />
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

function DendrogramNodeRenderer({
  node,
  depth = 0,
}: {
  node: DendrogramNode | null;
  depth?: number;
}) {
  if (!node) return null;

  const indent = Math.min(160, depth * 16);

  if (!node.left && !node.right) {
    return (
      <Box sx={{ pl: `${indent}px`, py: 0.25 }}>
        <Chip
          size="small"
          variant="outlined"
          label={`Point #${node.pointIndex}`}
          sx={{ height: 18, fontSize: '0.625rem' }}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ pl: `${indent}px`, py: 0.25 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
        ┌── 병합 거리: {node.distance.toFixed(2)} (노드 {node.size}개)
      </Typography>
      {node.left && <DendrogramNodeRenderer node={node.left} depth={depth + 1} />}
      {node.right && <DendrogramNodeRenderer node={node.right} depth={depth + 1} />}
    </Box>
  );
}
