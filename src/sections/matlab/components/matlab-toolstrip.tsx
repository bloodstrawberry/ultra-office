'use client';

import type { MatlabToolstripTab, MatlabLayoutPreset } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import WavesRoundedIcon from '@mui/icons-material/WavesRounded';
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import TerrainRoundedIcon from '@mui/icons-material/TerrainRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import ScatterPlotRoundedIcon from '@mui/icons-material/ScatterPlotRounded';

// ----------------------------------------------------------------------

interface MatlabToolstripProps {
  activeTab: MatlabToolstripTab;
  onTabChange: (tab: MatlabToolstripTab) => void;
  isRunning: boolean;
  onRunScript: () => void;
  onRunSection: () => void;
  onStop: () => void;
  onNewScript: () => void;
  onSaveScript: () => void;
  onClearWorkspace: () => void;
  onClearConsole: () => void;
  onQuickPlot: (plotType: string) => void;
  selectedVarName: string | null;
  currentLayout: MatlabLayoutPreset;
  onLayoutChange: (layout: MatlabLayoutPreset) => void;
  onOpenApp: (appType: 'linalg' | 'fft' | 'ode') => void;
  onOpenHelp: () => void;
  onInsertSnippet: (snippetCode: string) => void;
}

export function MatlabToolstrip({
  activeTab,
  onTabChange,
  isRunning,
  onRunScript,
  onRunSection,
  onStop,
  onNewScript,
  onSaveScript,
  onClearWorkspace,
  onClearConsole,
  onQuickPlot,
  selectedVarName,
  currentLayout,
  onLayoutChange,
  onOpenApp,
  onOpenHelp,
  onInsertSnippet,
}: MatlabToolstripProps) {
  const [layoutMenuAnchor, setLayoutMenuAnchor] = React.useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#191d24',
        borderBottom: '1px solid #282f3d',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Top Tabs (HOME, PLOTS, APPS, EDITOR, HELP) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          bgcolor: '#13161c',
          borderBottom: '1px solid #232834',
          minHeight: 32,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 1.5 }}>
            <CalculateRoundedIcon sx={{ fontSize: 19, color: '#38bdf8' }} />
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.5px',
                color: '#f8fafc',
              }}
            >
              MATLAB <span style={{ color: '#38bdf8' }}>WEB STUDIO</span>
            </Typography>
          </Box>

          <Tabs
            value={activeTab}
            onChange={(_, val) => onTabChange(val)}
            sx={{
              minHeight: 32,
              '& .MuiTab-root': {
                minHeight: 32,
                py: 0.25,
                px: 1.75,
                fontSize: '11px',
                fontWeight: 700,
                color: '#94a3b8',
                letterSpacing: '0.5px',
                textTransform: 'none',
                '&.Mui-selected': {
                  bgcolor: '#191d24',
                  color: '#38bdf8',
                  borderTop: '2px solid #38bdf8',
                },
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            <Tab value="HOME" label="HOME" />
            <Tab value="PLOTS" label="PLOTS" />
            <Tab value="APPS" label="APPS" />
            <Tab value="EDITOR" label="EDITOR" />
            <Tab value="HELP" label="HELP" />
          </Tabs>
        </Box>

        {/* Quick Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace' }}>
            R2024b MathJS Wasm
          </Typography>
        </Box>
      </Box>

      {/* Toolstrip Ribbon Body */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.75,
          gap: 2,
          minHeight: 56,
          overflowX: 'auto',
        }}
      >
        {/* --- 1. HOME TAB --- */}
        {activeTab === 'HOME' && (
          <>
            {/* File Group */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onNewScript}
                startIcon={<AddBoxRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#f8fafc',
                  fontSize: '11px',
                  fontWeight: 600,
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                }}
              >
                New Script
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={onSaveScript}
                startIcon={<SaveRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#f8fafc',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                }}
              >
                Save
              </Button>
            </Box>

            <Box sx={{ width: '1px', height: 36, bgcolor: '#282f3d' }} />

            {/* Run / Execution Group */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                onClick={onRunScript}
                disabled={isRunning}
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 18 }} />}
                sx={{
                  bgcolor: '#0284c7',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: 700,
                  py: 0.6,
                  px: 1.75,
                  '&:hover': { bgcolor: '#0369a1' },
                }}
              >
                Run (F5)
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={onRunSection}
                disabled={isRunning}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#38bdf8',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                }}
              >
                Run Section (Ctrl+Enter)
              </Button>

              {isRunning && (
                <Button
                  variant="contained"
                  size="small"
                  color="error"
                  onClick={onStop}
                  startIcon={<StopRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{ fontSize: '11px', py: 0.5, px: 1.25 }}
                >
                  Stop
                </Button>
              )}
            </Box>

            <Box sx={{ width: '1px', height: 36, bgcolor: '#282f3d' }} />

            {/* Clear / Workspace Group */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={onClearWorkspace}
                startIcon={<DeleteSweepRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#94a3b8',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#f87171', color: '#f87171' },
                }}
              >
                Clear Workspace
              </Button>

              <Button
                variant="outlined"
                size="small"
                onClick={onClearConsole}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#94a3b8',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                }}
              >
                Clear Command (clc)
              </Button>
            </Box>

            <Box sx={{ width: '1px', height: 36, bgcolor: '#282f3d' }} />

            {/* Layout Presets */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => setLayoutMenuAnchor(e.currentTarget)}
                startIcon={<GridViewRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: '#202633',
                  borderColor: '#2f384a',
                  color: '#f8fafc',
                  fontSize: '11px',
                  py: 0.5,
                  px: 1.25,
                  '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                }}
              >
                Layout: {currentLayout}
              </Button>

              <Menu
                anchorEl={layoutMenuAnchor}
                open={Boolean(layoutMenuAnchor)}
                onClose={() => setLayoutMenuAnchor(null)}
                sx={{
                  '& .MuiPaper-root': {
                    bgcolor: '#1a1f28',
                    color: '#e2e8f0',
                    border: '1px solid #2d3748',
                  },
                }}
              >
                <MenuItem
                  onClick={() => {
                    onLayoutChange('standard');
                    setLayoutMenuAnchor(null);
                  }}
                  selected={currentLayout === 'standard'}
                >
                  Standard (Folder/Workspace + Editor + Figure/Console)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onLayoutChange('wide-plot');
                    setLayoutMenuAnchor(null);
                  }}
                  selected={currentLayout === 'wide-plot'}
                >
                  Wide Plot (Figure 중심)
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    onLayoutChange('editor-focus');
                    setLayoutMenuAnchor(null);
                  }}
                  selected={currentLayout === 'editor-focus'}
                >
                  Editor Focus (코드 작성 중심)
                </MenuItem>
              </Menu>
            </Box>
          </>
        )}

        {/* --- 2. PLOTS TAB --- */}
        {activeTab === 'PLOTS' && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Tooltip title="2D 선 플롯 (plot)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('plot')}
                  startIcon={<ShowChartRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#f8fafc',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  plot
                </Button>
              </Tooltip>

              <Tooltip title="2D 산점도 (scatter)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('scatter')}
                  startIcon={<ScatterPlotRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#f8fafc',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  scatter
                </Button>
              </Tooltip>

              <Tooltip title="막대 그래프 (bar)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('bar')}
                  startIcon={<BarChartRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#f8fafc',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  bar
                </Button>
              </Tooltip>

              <Tooltip title="이산 신호 스템 플롯 (stem)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('stem')}
                  startIcon={<AutoGraphRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#f8fafc',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  stem
                </Button>
              </Tooltip>

              <Tooltip title="히스토그램 분포 (histogram)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('histogram')}
                  startIcon={<BarChartRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#f8fafc',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  histogram
                </Button>
              </Tooltip>
            </Box>

            <Box sx={{ width: '1px', height: 36, bgcolor: '#282f3d' }} />

            {/* 3D Plots */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Tooltip title="3D 곡면 플롯 (surf)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('surf')}
                  startIcon={<TerrainRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 600,
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  surf 3D
                </Button>
              </Tooltip>

              <Tooltip title="3D 등고선도 (contour)">
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => onQuickPlot('contour')}
                  startIcon={<LayersRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#202633',
                    borderColor: '#2f384a',
                    color: '#38bdf8',
                    fontSize: '11px',
                    py: 0.5,
                    px: 1.25,
                    '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
                  }}
                >
                  contour
                </Button>
              </Tooltip>
            </Box>

            {selectedVarName && (
              <Box sx={{ ml: 1, color: '#38bdf8', fontSize: '11px', fontWeight: 600 }}>
                선택 변수: <code>{selectedVarName}</code>
              </Box>
            )}
          </>
        )}

        {/* --- 3. APPS TAB --- */}
        {activeTab === 'APPS' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => onOpenApp('linalg')}
              startIcon={<MemoryRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
              }}
            >
              선형대수 & 고유값 Studio
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => onOpenApp('fft')}
              startIcon={<WavesRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#a3e635',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#293243', borderColor: '#a3e635' },
              }}
            >
              신호처리 & FFT 분석기
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => onOpenApp('ode')}
              startIcon={<ScienceRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#f59e0b',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#293243', borderColor: '#f59e0b' },
              }}
            >
              미분방정식 & ODE45 솔버
            </Button>
          </Box>
        )}

        {/* --- 4. EDITOR TAB --- */}
        {activeTab === 'EDITOR' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                onInsertSnippet(
                  `[X, Y] = meshgrid(-5:0.25:5, -5:0.25:5);\nZ = sin(sqrt(X.^2 + Y.^2));\nsurf(X, Y, Z);\n`
                )
              }
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#f8fafc',
                fontSize: '11px',
                py: 0.5,
                px: 1.25,
              }}
            >
              + 3D Meshgrid 스니펫
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                onInsertSnippet(
                  `Fs = 1000;\nt = 0:1/Fs:1-1/Fs;\nx = cos(2*pi*100*t) + randn(size(t));\nplot(t(1:100), x(1:100));\n`
                )
              }
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#f8fafc',
                fontSize: '11px',
                py: 0.5,
                px: 1.25,
              }}
            >
              + FFT 신호 생성 스니펫
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() =>
                onInsertSnippet(
                  `A = [4 1 2; 1 3 0; 2 0 5];\n[V, D] = eig(A);\ndisp(V);\ndisp(D);\n`
                )
              }
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#f8fafc',
                fontSize: '11px',
                py: 0.5,
                px: 1.25,
              }}
            >
              + 행렬 고유값 스니펫
            </Button>
          </Box>
        )}

        {/* --- 5. HELP TAB --- */}
        {activeTab === 'HELP' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={onOpenHelp}
              startIcon={<HelpOutlineRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{
                bgcolor: '#202633',
                borderColor: '#2f384a',
                color: '#38bdf8',
                fontSize: '11px',
                fontWeight: 600,
                py: 0.6,
                px: 1.5,
                '&:hover': { bgcolor: '#293243', borderColor: '#38bdf8' },
              }}
            >
              MATLAB 문법 & 함수 레퍼런스 가이드
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
