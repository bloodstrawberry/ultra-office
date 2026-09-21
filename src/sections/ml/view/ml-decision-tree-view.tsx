'use client';

import type { DataPoint2D, DecisionTreeNode } from '../types';
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

import { fitDecisionTree } from '../utils/math-ml';
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

export function MlDecisionTreeView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [maxDepth, setMaxDepth] = useState(3);
  const [criterion, setCriterion] = useState<'gini' | 'entropy'>('gini');
  const [activeClass, setActiveClass] = useState(0);
  const [preset, setPreset] = useState<'xor' | 'moons' | 'circles' | 'separable'>('xor');

  useEffect(() => {
    setPoints(generateXorClassificationData(15));
    setHasLoaded(true);
  }, []);

  const handlePresetChange = (type: 'xor' | 'moons' | 'circles' | 'separable') => {
    setPreset(type);
    if (type === 'xor') setPoints(generateXorClassificationData(15));
    else if (type === 'moons') setPoints(generateMoonsClassificationData(60, 0.2));
    else if (type === 'circles') setPoints(generateCirclesClassificationData(60));
    else if (type === 'separable') setPoints(generateSeparableClassificationData(30));
  };

  const model = useMemo(
    () => fitDecisionTree(points, maxDepth, criterion),
    [points, maxDepth, criterion]
  );

  const decisionFieldRenderer = useMemo(
    () => (x: number, y: number) => (model.predict(x, y) === 1 ? 1 : 0),
    [model]
  );

  const pythonCode = `# Scikit-Learn 의사결정나무 (Decision Tree)
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.metrics import classification_report

# 1. 의사결정나무 학습 (Max Depth = ${maxDepth}, Criterion = '${criterion}')
clf = DecisionTreeClassifier(max_depth=${maxDepth}, criterion='${criterion}')
clf.fit(X, y)

# 2. 트리 규칙 텍스트 출력
tree_rules = export_text(clf, feature_names=['X', 'Y'])
print(tree_rules)
print(classification_report(y, clf.predict(X)))`;

  const jsCode = `// TypeScript CART 의사결정나무 분할 알고리즘
// 지니 불순도: Gini = 1 - sum(p_i^2)
function calculateGini(pts) {
  const total = pts.length;
  let sumSq = 0;
  for (const count of Object.values(counts)) sumSq += (count / total) ** 2;
  return 1 - sumSq;
}

// 정보 획득량(Gain)이 최대가 되는 특성 및 임계값 탐색
const gain = parentImpurity - (left.length / total) * leftImpurity - (right.length / total) * rightImpurity;`;

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
      <MlHeaderNav currentModelId="decision-tree" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="의사결정나무(Decision Tree) 작업 공간"
        />

        <Grid container spacing={2.5}>
          {/* Main Workspaces */}
          {viewMode === 'canvas' && (
            <Grid size={{ xs: 12, lg: 7 }}>
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
            <Grid size={{ xs: 12, lg: 7 }}>
              <MlSpreadsheetEditor
                points={points}
                onChange={setPoints}
                taskType="classification"
                maxHeight={500}
              />
            </Grid>
          )}

          {viewMode === 'split' && (
            <Grid size={{ xs: 12, lg: 7 }}>
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

          {/* Right Panel: Controls & Tree Hierarchy */}
          <Grid size={{ xs: 12, lg: 5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Controls Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  ⚙️ 의사결정나무 파라미터 조절
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
                    variant={preset === 'xor' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('xor')}
                  >
                    XOR 분할
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
                  <Button
                    size="small"
                    variant={preset === 'separable' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('separable')}
                  >
                    단순 분리
                  </Button>
                </Box>

                {/* Max Depth Slider */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      최대 트리 깊이 (Max Depth)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      Depth = {maxDepth}
                    </Typography>
                  </Box>
                  <Slider
                    value={maxDepth}
                    min={1}
                    max={6}
                    step={1}
                    marks
                    onChange={(_, v) => setMaxDepth(v as number)}
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    * 깊이가 깊을수록 세밀한 사각형 결정 영역으로 과적합될 수 있습니다.
                  </Typography>
                </Box>

                {/* Criterion Toggle */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  분기 기준 (Split Criterion):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={criterion}
                  onChange={(_, v) => v && setCriterion(v)}
                  size="small"
                  fullWidth
                >
                  <ToggleButton value="gini" sx={{ fontWeight: 700 }}>
                    지니 계수 (Gini)
                  </ToggleButton>
                  <ToggleButton value="entropy" sx={{ fontWeight: 700 }}>
                    엔트로피 (Entropy)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Card>

              {/* Tree Structure Visualizer */}
              <Card sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  🌳 트리 분기 구조도 (Decision Tree Nodes)
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
                  <TreeNodeRenderer node={model.root} />
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

function TreeNodeRenderer({ node }: { node?: DecisionTreeNode }) {
  if (!node) return null;

  const indent = node.depth * 16;

  if (node.isLeaf) {
    return (
      <Box sx={{ pl: `${indent}px`, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          └──
        </Typography>
        <Chip
          size="small"
          label={`리프 노드: Class ${node.predictedClass} (샘플 ${node.samples}개)`}
          color={node.predictedClass === 1 ? 'error' : 'primary'}
          variant="soft"
          sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
        />
      </Box>
    );
  }

  const featureName = node.featureIndex === 0 ? 'X좌표' : 'Y좌표';

  return (
    <Box sx={{ pl: `${indent}px`, py: 0.5 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>
          {node.depth > 0 ? '└── ' : '⦿ '}
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary' }}>
          [{featureName} ≤ {(node.threshold ?? 0).toFixed(2)}]
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          불순도: {(node.impurity ?? 0).toFixed(3)} | N={node.samples}
        </Typography>
      </Box>

      {node.left && <TreeNodeRenderer node={node.left} />}
      {node.right && <TreeNodeRenderer node={node.right} />}
    </Box>
  );
}
