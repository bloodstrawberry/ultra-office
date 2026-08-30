'use client';

import * as math from 'mathjs';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { getThemeById, DEFAULT_THEME_ID } from 'src/sections/code-runner/core/editor-themes';

// ----------------------------------------------------------------------

interface MatlabAppsDialogProps {
  appType: 'linalg' | 'fft' | 'ode' | null;
  open: boolean;
  onClose: () => void;
  onInsertCode: (code: string) => void;
  themeId?: string;
}

export function MatlabAppsDialog({
  appType,
  open,
  onClose,
  onInsertCode,
  themeId = DEFAULT_THEME_ID,
}: MatlabAppsDialogProps) {
  const activeTheme = getThemeById(themeId);
  // Linear Algebra App state
  const [matrixStr, setMatrixStr] = useState('4 1 2; 1 3 0; 2 0 5');
  const [linalgResult, setLinalgResult] = useState<any>(null);

  // FFT App state
  const [fs, setFs] = useState(1000);
  const [f1, setF1] = useState(60);
  const [f2, setF2] = useState(180);
  const [noiseLevel, setNoiseLevel] = useState(1.5);

  // ODE App state
  const [sigma, setSigma] = useState(10);
  const [rho, setRho] = useState(28);
  const [beta, setBeta] = useState(2.667);

  const handleComputeLinalg = () => {
    try {
      // Parse matrix
      const rows = matrixStr
        .split(';')
        .map((r) => r.trim().split(/\s+|,/).filter(Boolean).map(Number));
      const detVal = math.det(rows);
      let invMat: any = null;
      try {
        invMat = math.inv(rows);
      } catch {
        invMat = 'Singular matrix (No inverse)';
      }
      let eigs: any = null;
      try {
        eigs = math.eigs(rows);
      } catch {
        eigs = null;
      }
      const tr = math.trace(rows);

      setLinalgResult({
        matrix: rows,
        det: detVal,
        inv: invMat,
        trace: tr,
        eigs,
      });
    } catch {
      alert('행렬 입력 형식을 확인하세요. (예: 4 1 2; 1 3 0; 2 0 5)');
    }
  };

  const handleInsertLinalgCode = () => {
    const code = `% Linear Algebra Analysis Generated\nA = [${matrixStr}];\n[V, D] = eig(A);\ndisp('Matrix A:'); disp(A);\ndisp('Determinant:'); disp(det(A));\ndisp('Eigenvalues:'); disp(D);\ndisp('Eigenvectors:'); disp(V);\n`;
    onInsertCode(code);
    onClose();
  };

  const handleInsertFftCode = () => {
    const code = `% FFT Signal Spectrum Generated\nFs = ${fs};\nt = 0:1/Fs:1;\nx = sin(2*pi*${f1}*t) + 1.2*sin(2*pi*${f2}*t) + ${noiseLevel}*randn(size(t));\nfigure(1);\nplot(1000*t(1:150), x(1:150));\ntitle('Time Domain Signal (${f1}Hz + ${f2}Hz)');\nxlabel('Time (ms)'); ylabel('Amplitude');\n\nfigure(2);\nY = fft(x);\nL = length(x);\nP2 = abs(Y/L);\nP1 = P2(1:floor(L/2)+1);\nP1(2:end-1) = 2*P1(2:end-1);\nf = Fs*(0:(L/2))/L;\nplot(f, P1);\ntitle('Single-Sided Amplitude Spectrum');\nxlabel('Frequency (Hz)'); ylabel('|P1(f)|');\ngrid on;\n`;
    onInsertCode(code);
    onClose();
  };

  const handleInsertOdeCode = () => {
    const code = `% Lorenz Attractor ODE Simulation Generated\nsigma = ${sigma};\nrho = ${rho};\nbeta = ${beta};\nnumSteps = 2500; dt = 0.01;\nx = zeros(1, numSteps); y = zeros(1, numSteps); z = zeros(1, numSteps);\nx(1) = 0.1; y(1) = 0.0; z(1) = 0.0;\nfor i = 1:numSteps-1\n  cx = x(i); cy = y(i); cz = z(i);\n  x(i+1) = cx + dt * (sigma * (cy - cx));\n  y(i+1) = cy + dt * (cx * (rho - cz) - cy);\n  z(i+1) = cz + dt * (cx * cy - beta * cz);\nend\nfigure(1);\nplot3(x, y, z);\ntitle('Lorenz Attractor (\\sigma=${sigma}, \\rho=${rho}, \\beta=${beta.toFixed(2)})');\n`;
    onInsertCode(code);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: activeTheme.uiColors.surface,
          color: activeTheme.uiColors.text,
          border: `1px solid ${activeTheme.uiColors.border}`,
          borderRadius: 1.5,
          maxHeight: 650,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: activeTheme.uiColors.card,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          px: 2.5,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {appType === 'linalg' && <MemoryRoundedIcon sx={{ fontSize: 20, color: '#38bdf8' }} />}
          {appType === 'fft' && <WavesRoundedIcon sx={{ fontSize: 20, color: '#a3e635' }} />}
          {appType === 'ode' && <ScienceRoundedIcon sx={{ fontSize: 20, color: '#f59e0b' }} />}
          <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>
            {appType === 'linalg' && '선형대수 & 고유값 Studio (Linear Algebra App)'}
            {appType === 'fft' && '신호처리 & FFT 스펙트럼 분석기 (Signal Analyzer)'}
            {appType === 'ode' && '미분방정식 & 카오스 ODE45 솔버 (ODE Studio)'}
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Body Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 3 }}>
        {/* --- 1. Linear Algebra Studio --- */}
        {appType === 'linalg' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', mb: 1 }}>
                행렬 A 입력 (세미콜론으로 행 구분):
              </Typography>
              <Box
                component="input"
                value={matrixStr}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMatrixStr(e.target.value)}
                placeholder="4 1 2; 1 3 0; 2 0 5"
                sx={{
                  width: '100%',
                  bgcolor: '#1c202a',
                  border: '1px solid #334155',
                  borderRadius: 1,
                  p: 1.25,
                  fontSize: '13px',
                  color: '#38bdf8',
                  fontFamily: 'monospace',
                  outline: 'none',
                  '&:focus': { borderColor: '#38bdf8' },
                }}
              />
            </Box>

            {/* Quick preset buttons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ fontSize: '11px', color: '#64748b' }}>프리셋:</Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setMatrixStr('4 1 2; 1 3 0; 2 0 5')}
                sx={{ fontSize: '11px', py: 0.25, color: '#94a3b8', borderColor: '#334155' }}
              >
                3x3 대칭 행렬
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setMatrixStr('2 1; 1 2')}
                sx={{ fontSize: '11px', py: 0.25, color: '#94a3b8', borderColor: '#334155' }}
              >
                2x2 양의 정부호
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setMatrixStr('1 2 3; 4 5 6; 7 8 9')}
                sx={{ fontSize: '11px', py: 0.25, color: '#94a3b8', borderColor: '#334155' }}
              >
                3x3 특이행렬 (Rank 2)
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="contained"
                onClick={handleComputeLinalg}
                startIcon={<PlayArrowRoundedIcon />}
                sx={{ bgcolor: '#0284c7', '&:hover': { bgcolor: '#0369a1' }, fontSize: '12px' }}
              >
                즉시 행렬 분해 및 고유값 분석
              </Button>

              <Button
                variant="outlined"
                onClick={handleInsertLinalgCode}
                sx={{ borderColor: '#38bdf8', color: '#38bdf8', fontSize: '12px' }}
              >
                MATLAB 스크립트로 내보내기
              </Button>
            </Box>

            {linalgResult && (
              <Box
                sx={{
                  bgcolor: '#0e1014',
                  border: '1px solid #242933',
                  borderRadius: 1,
                  p: 2,
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 'bold', marginBottom: '8px' }}>
                  📊 선형대수 분석 결과:
                </div>
                <div>• 행렬식 det(A) = {Number(linalgResult.det).toFixed(4)}</div>
                <div>• 대각합 trace(A) = {Number(linalgResult.trace).toFixed(4)}</div>
                <div style={{ marginTop: '6px' }}>
                  • 고유값 (Eigenvalues):
                  <div style={{ color: '#a3e635', marginLeft: '12px' }}>
                    {linalgResult.eigs?.values
                      ? JSON.stringify(linalgResult.eigs.values)
                      : '계산 불가'}
                  </div>
                </div>
                <div style={{ marginTop: '6px' }}>
                  • 역행렬 inv(A):
                  <div style={{ color: '#cbd5e1', marginLeft: '12px' }}>
                    {typeof linalgResult.inv === 'string'
                      ? linalgResult.inv
                      : JSON.stringify(linalgResult.inv)}
                  </div>
                </div>
              </Box>
            )}
          </Box>
        )}

        {/* --- 2. FFT & Signal Analyzer --- */}
        {appType === 'fft' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                샘플링 주파수 Fs: <b>{fs} Hz</b>
              </Typography>
              <Slider
                min={200}
                max={5000}
                step={100}
                value={fs}
                onChange={(_, v) => setFs(v as number)}
                sx={{ color: '#a3e635' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                1차 정현파 주파수 f1: <b>{f1} Hz</b>
              </Typography>
              <Slider
                min={10}
                max={500}
                step={5}
                value={f1}
                onChange={(_, v) => setF1(v as number)}
                sx={{ color: '#38bdf8' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                2차 정현파 주파수 f2: <b>{f2} Hz</b>
              </Typography>
              <Slider
                min={10}
                max={500}
                step={5}
                value={f2}
                onChange={(_, v) => setF2(v as number)}
                sx={{ color: '#f59e0b' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                가우시안 백색잡음 진폭: <b>{noiseLevel}</b>
              </Typography>
              <Slider
                min={0}
                max={5}
                step={0.1}
                value={noiseLevel}
                onChange={(_, v) => setNoiseLevel(v as number)}
                sx={{ color: '#f87171' }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleInsertFftCode}
              startIcon={<WavesRoundedIcon />}
              sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' }, fontSize: '12px' }}
            >
              이 파라미터로 FFT MATLAB 스크립트 생성 및 실행
            </Button>
          </Box>
        )}

        {/* --- 3. ODE45 Chaos Studio --- */}
        {appType === 'ode' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                Prandtl 수 (sigma, σ): <b>{sigma}</b>
              </Typography>
              <Slider
                min={1}
                max={30}
                step={0.5}
                value={sigma}
                onChange={(_, v) => setSigma(v as number)}
                sx={{ color: '#38bdf8' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                Rayleigh 수 (rho, ρ - 카오스 분기점): <b>{rho}</b>
              </Typography>
              <Slider
                min={1}
                max={60}
                step={1}
                value={rho}
                onChange={(_, v) => setRho(v as number)}
                sx={{ color: '#f59e0b' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '12px', color: '#94a3b8', mb: 0.5 }}>
                기하 파라미터 (beta, β): <b>{beta.toFixed(3)}</b>
              </Typography>
              <Slider
                min={0.5}
                max={5.0}
                step={0.1}
                value={beta}
                onChange={(_, v) => setBeta(v as number)}
                sx={{ color: '#a3e635' }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={handleInsertOdeCode}
              startIcon={<ScienceRoundedIcon />}
              sx={{ bgcolor: '#d97706', '&:hover': { bgcolor: '#b45309' }, fontSize: '12px' }}
            >
              로렌츠 3D 어트랙터 MATLAB 스크립트 생성 및 실행
            </Button>
          </Box>
        )}
      </Box>
    </Dialog>
  );
}
