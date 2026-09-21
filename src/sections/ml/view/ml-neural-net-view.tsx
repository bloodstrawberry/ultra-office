'use client';

import type { DataPoint2D } from '../types';
import type { MlWorkspaceViewMode } from '../components/ml-view-mode-bar';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { SimpleMlpClassifier } from '../utils/math-ml';
import { MlCanvas2D } from '../components/ml-canvas-2d';
import { MlHeaderNav } from '../components/ml-header-nav';
import { MlCodeSnippet } from '../components/ml-code-snippet';
import { MlViewModeBar } from '../components/ml-view-mode-bar';
import { MlSpreadsheetEditor } from '../components/ml-spreadsheet-editor';
import {
  generateSpiralData,
  generateXorClassificationData,
  generateMoonsClassificationData,
  generateCirclesClassificationData,
} from '../utils/datasets';

// ----------------------------------------------------------------------

export function MlNeuralNetView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [points, setPoints] = useState<DataPoint2D[]>([]);
  const [viewMode, setViewMode] = useState<MlWorkspaceViewMode>('split');
  const [h1Dim, setH1Dim] = useState(4);
  const [h2Dim, setH2Dim] = useState(0);
  const [activation, setActivation] = useState<'relu' | 'tanh' | 'sigmoid'>('tanh');
  const [lr, setLr] = useState(0.06);
  const [preset, setPreset] = useState<'spiral' | 'moons' | 'circles' | 'xor'>('spiral');
  const [isPlaying, setIsPlaying] = useState(false);
  const [epoch, setEpoch] = useState(0);
  const [currentLoss, setCurrentLoss] = useState(0.69);

  const mlpRef = useRef<SimpleMlpClassifier | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Initialize MLP instance
  const initMlp = useCallback(() => {
    mlpRef.current = new SimpleMlpClassifier(h1Dim, h2Dim, activation, lr);
    setEpoch(0);
    setCurrentLoss(0.69);
  }, [h1Dim, h2Dim, activation, lr]);

  useEffect(() => {
    setPoints(generateSpiralData(35));
    initMlp();
    setHasLoaded(true);
  }, [initMlp]);

  const handlePresetChange = (type: 'spiral' | 'moons' | 'circles' | 'xor') => {
    setPreset(type);
    setIsPlaying(false);
    if (type === 'spiral') setPoints(generateSpiralData(35));
    else if (type === 'moons') setPoints(generateMoonsClassificationData(60, 0.2));
    else if (type === 'circles') setPoints(generateCirclesClassificationData(60));
    else if (type === 'xor') setPoints(generateXorClassificationData(16));
    initMlp();
  };

  // Step training iteration
  const stepTrain = useCallback(() => {
    if (!mlpRef.current || points.length === 0) return;
    const loss = mlpRef.current.trainEpoch(points);
    setEpoch((e) => e + 1);
    setCurrentLoss(loss);
  }, [points]);

  // Continuous training loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return undefined;
    }

    const loop = () => {
      // Run 3 epochs per frame for smooth speed
      for (let i = 0; i < 3; i += 1) {
        stepTrain();
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, stepTrain]);

  const decisionFieldRenderer = useCallback(
    (x: number, y: number) => {
      if (!mlpRef.current) return 0.5;
      return mlpRef.current.forward(x, y).output;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [epoch]
  );

  const pythonCode = `# Scikit-Learn MLPClassifier (인공신경망 다층 퍼셉트론)
from sklearn.neural_network import MLPClassifier

# 1. MLP 신경망 모델 (은닉층 = [${h1Dim}${h2Dim > 0 ? `, ${h2Dim}` : ''}], 활성화 = '${activation}')
mlp = MLPClassifier(
    hidden_layer_sizes=(${h1Dim},${h2Dim > 0 ? ` ${h2Dim},` : ''}),
    activation='${activation}',
    learning_rate_init=${lr},
    max_iter=1000
)
mlp.fit(X, y)

# 2. 손실값 및 평가
print("최종 손실값 (Loss):", mlp.loss_)
print("학습 정확도:", mlp.score(X, y))`;

  const jsCode = `// TypeScript 역전파 (Backpropagation) 학습
// 순전파: h1 = act(W1 * x + b1), y_hat = sigmoid(W2 * h1 + b2)
const { h1, output } = mlp.forward(x, y);

// 교차 엔트로피 오차 역전파 및 가중치 경사하강 갱신
const dOut = output - target;
for (let j = 0; j < hiddenDim; j++) {
  dH1[j] = dOut * W2[j] * actDeriv(h1[j]);
  W2[j] -= lr * dOut * h1[j];
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
      <MlHeaderNav currentModelId="neural-net" />

      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* View Mode Bar */}
        <MlViewModeBar
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          pointCount={points.length}
          label="다층 퍼셉트론(MLP) 작업 공간"
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

          {/* Right Panel: Controls & Training Panel */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Training Action Card */}
              <Card sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  🧠 신경망 실시간 학습 제어기
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Button
                    variant="contained"
                    color={isPlaying ? 'warning' : 'primary'}
                    startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                    onClick={() => setIsPlaying(!isPlaying)}
                    sx={{ flex: 1, fontWeight: 700 }}
                  >
                    {isPlaying ? '학습 일시정지' : '실시간 학습 시작'}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SkipNextRoundedIcon />}
                    onClick={stepTrain}
                    disabled={isPlaying}
                    sx={{ fontWeight: 700 }}
                  >
                    1단계
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={initMlp}
                    sx={{ fontWeight: 700 }}
                  >
                    <RestartAltRoundedIcon fontSize="small" />
                  </Button>
                </Box>

                {/* Live Training Stats */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 }}>
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
                      학습 에포크 (Epoch)
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {epoch}회
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
                      손실값 (Loss)
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        color: currentLoss < 0.25 ? 'success.main' : 'warning.main',
                      }}
                    >
                      {currentLoss.toFixed(4)}
                    </Typography>
                  </Box>
                </Box>

                {/* Preset Datasets */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  비선형 데이터셋 프리셋:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                  <Button
                    size="small"
                    variant={preset === 'spiral' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('spiral')}
                  >
                    이중 나선 (Spiral)
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
                    variant={preset === 'xor' ? 'contained' : 'outlined'}
                    onClick={() => handlePresetChange('xor')}
                  >
                    XOR
                  </Button>
                </Box>

                {/* Architecture Sliders */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      은닉층 1 뉴런 수 (Layer 1 Neurons)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {h1Dim}개
                    </Typography>
                  </Box>
                  <Slider
                    value={h1Dim}
                    min={2}
                    max={8}
                    step={1}
                    marks
                    onChange={(_, v) => {
                      setH1Dim(v as number);
                      initMlp();
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      은닉층 2 뉴런 수 (Layer 2 Neurons - 0=비활성)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                      {h2Dim === 0 ? '미사용 (1개 은닉층)' : `${h2Dim}개`}
                    </Typography>
                  </Box>
                  <Slider
                    value={h2Dim}
                    min={0}
                    max={6}
                    step={1}
                    marks
                    onChange={(_, v) => {
                      setH2Dim(v as number);
                      initMlp();
                    }}
                  />
                </Box>

                {/* Activation Function */}
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 700, mb: 0.5, display: 'block' }}
                >
                  활성화 함수 (Activation Function):
                </Typography>
                <ToggleButtonGroup
                  exclusive
                  value={activation}
                  onChange={(_, v) => {
                    if (v) {
                      setActivation(v);
                      initMlp();
                    }
                  }}
                  size="small"
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <ToggleButton value="tanh" sx={{ fontWeight: 700 }}>
                    Tanh
                  </ToggleButton>
                  <ToggleButton value="relu" sx={{ fontWeight: 700 }}>
                    ReLU
                  </ToggleButton>
                  <ToggleButton value="sigmoid" sx={{ fontWeight: 700 }}>
                    Sigmoid
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* Learning Rate */}
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      학습률 (Learning Rate α)
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      {lr}
                    </Typography>
                  </Box>
                  <Slider
                    value={lr}
                    min={0.01}
                    max={0.2}
                    step={0.01}
                    onChange={(_, v) => {
                      setLr(v as number);
                      if (mlpRef.current) mlpRef.current.lr = v as number;
                    }}
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
