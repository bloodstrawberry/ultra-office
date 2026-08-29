'use client';

import type { MatlabFigure } from '../types';

import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';

import { DEFAULT_THEME_ID, getThemeById } from 'src/sections/code-runner/core/editor-themes';

// Dynamically import Plotly component with plotly.js-dist-min
const Plot = dynamic(
  async () => {
    const Plotly = await import('plotly.js-dist-min');
    const createPlotlyComponent = (await import('react-plotly.js/factory')).default;
    return createPlotlyComponent((Plotly as any).default || Plotly);
  },
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'text.secondary',
          fontSize: '13px',
        }}
      >
        차트 렌더러 로딩 중...
      </Box>
    ),
  }
);

// ----------------------------------------------------------------------

interface MatlabFigureViewerProps {
  figures: MatlabFigure[];
  activeFigureId: string | null;
  onSelectFigure: (id: string) => void;
  onClearFigures: () => void;
  themeId?: string;
}

export function MatlabFigureViewer({
  figures,
  activeFigureId,
  onSelectFigure,
  onClearFigures,
  themeId = DEFAULT_THEME_ID,
}: MatlabFigureViewerProps) {
  const activeTheme = getThemeById(themeId);
  const isLightTheme = !activeTheme.isDark;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const activeFigure =
    figures.find((f) => f.id === activeFigureId) || (figures.length > 0 ? figures[0] : null);

  const handleExportPng = () => {
    if (!activeFigure) return;
    // Plotly export trigger or direct canvas download
    const gd = document.getElementById(`matlab-plotly-chart-${activeFigure.id}`);
    if (gd && (window as any).Plotly) {
      (window as any).Plotly.downloadImage(gd, {
        format: 'png',
        width: 1000,
        height: 700,
        filename: `${activeFigure.title || 'matlab_figure'}.png`,
      });
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: activeTheme.uiColors.surface,
        color: activeTheme.uiColors.text,
        borderRadius: 1,
        border: `1px solid ${activeTheme.uiColors.border}`,
        overflow: 'hidden',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        right: isFullscreen ? 0 : 'auto',
        bottom: isFullscreen ? 0 : 'auto',
        zIndex: isFullscreen ? 9999 : 'auto',
      }}
    >
      {/* Figure Top Bar / Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: activeTheme.uiColors.card,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          px: 1,
          minHeight: 38,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 1, pl: 0.5 }}>
            <AutoGraphRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography sx={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px' }}>
              FIGURES
            </Typography>
          </Box>

          {figures.length > 0 ? (
            <Tabs
              value={activeFigure?.id || figures[0].id}
              onChange={(_, val) => onSelectFigure(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.5,
                  px: 1.5,
                  fontSize: '12px',
                  color: activeTheme.uiColors.textMuted,
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: activeTheme.uiColors.surface,
                    color: 'primary.main',
                    fontWeight: 600,
                    borderTop: '2px solid',
                    borderColor: 'primary.main',
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {figures.map((fig) => (
                <Tab
                  key={fig.id}
                  value={fig.id}
                  label={fig.title || `Figure ${fig.figureNumber}`}
                />
              ))}
            </Tabs>
          ) : (
            <Typography
              sx={{ fontSize: '11px', color: activeTheme.uiColors.textMuted, fontStyle: 'italic' }}
            >
              플롯 출력 대기 중...
            </Typography>
          )}
        </Box>

        {/* Toolbar Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {activeFigure && (
            <Tooltip title="PNG 이미지 저장">
              <IconButton
                size="small"
                onClick={handleExportPng}
                sx={{ color: activeTheme.uiColors.textMuted }}
              >
                <DownloadRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={isFullscreen ? '전체화면 해제' : '전체화면'}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen((prev) => !prev)}
              sx={{ color: activeTheme.uiColors.textMuted }}
            >
              {isFullscreen ? (
                <FullscreenExitRoundedIcon sx={{ fontSize: 17 }} />
              ) : (
                <FullscreenRoundedIcon sx={{ fontSize: 17 }} />
              )}
            </IconButton>
          </Tooltip>

          {figures.length > 0 && (
            <Tooltip title="피규어 모두 닫기 (clf)">
              <IconButton size="small" onClick={onClearFigures} sx={{ color: '#ef4444' }}>
                <ClearRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Plot Area */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          height: 'calc(100% - 38px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          p: 0.5,
          bgcolor: isLightTheme ? '#ffffff' : activeTheme.uiColors.bg,
        }}
      >
        {isClient && activeFigure && activeFigure.traces.length > 0 ? (
          <Box
            id={`matlab-plotly-chart-${activeFigure.id}`}
            sx={{
              width: '100%',
              height: '100%',
              '& .plot-container': {
                width: '100% !important',
                height: '100% !important',
              },
            }}
          >
            <Plot
              data={activeFigure.traces as any}
              layout={{
                autosize: true,
                paper_bgcolor: 'transparent',
                plot_bgcolor: isLightTheme ? '#f8fafc' : activeTheme.uiColors.bg,
                font: {
                  color: isLightTheme ? '#1e293b' : activeTheme.uiColors.text,
                  family: 'Inter, sans-serif',
                  size: 11,
                },
                margin: { l: 48, r: 24, t: 36, b: 36 },
                xaxis: {
                  gridcolor: isLightTheme ? '#e2e8f0' : activeTheme.uiColors.border,
                  zerolinecolor: isLightTheme ? '#94a3b8' : activeTheme.uiColors.textMuted,
                  ...activeFigure.layout?.xaxis,
                },
                yaxis: {
                  gridcolor: isLightTheme ? '#e2e8f0' : activeTheme.uiColors.border,
                  zerolinecolor: isLightTheme ? '#94a3b8' : activeTheme.uiColors.textMuted,
                  ...activeFigure.layout?.yaxis,
                },
                scene: {
                  xaxis: { gridcolor: isLightTheme ? '#e2e8f0' : activeTheme.uiColors.border },
                  yaxis: { gridcolor: isLightTheme ? '#e2e8f0' : activeTheme.uiColors.border },
                  zaxis: { gridcolor: isLightTheme ? '#e2e8f0' : activeTheme.uiColors.border },
                  ...activeFigure.layout?.scene,
                },
                title: activeFigure.layout?.title || {
                  text: activeFigure.title,
                  font: {
                    size: 13,
                    color: isLightTheme ? '#0f172a' : activeTheme.uiColors.text,
                  },
                },
                showlegend: activeFigure.layout?.showlegend ?? activeFigure.traces.length > 1,
                legend: {
                  bgcolor: isLightTheme ? 'rgba(255, 255, 255, 0.9)' : 'rgba(24, 27, 32, 0.8)',
                  bordercolor: isLightTheme ? '#cbd5e1' : activeTheme.uiColors.border,
                  borderwidth: 1,
                  font: {
                    color: isLightTheme ? '#1e293b' : activeTheme.uiColors.text,
                    size: 10,
                  },
                },
                ...activeFigure.layout,
              }}
              config={{
                responsive: true,
                displayModeBar: true,
                displaylogo: false,
                modeBarButtonsToRemove: ['sendDataToCloud'],
                toImageButtonOptions: {
                  format: 'png',
                  filename: activeFigure.title || 'matlab_plot',
                  height: 600,
                  width: 800,
                  scale: 2,
                },
                ...activeFigure.config,
              }}
              style={{ width: '100%', height: '100%' }}
              useResizeHandler
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              color: activeTheme.uiColors.textMuted,
              textAlign: 'center',
              p: 3,
            }}
          >
            <AutoGraphRoundedIcon sx={{ fontSize: 44, color: activeTheme.uiColors.border }} />
            <Typography
              sx={{ fontSize: '13px', fontWeight: 600, color: activeTheme.uiColors.text }}
            >
              현재 활성화된 플롯(Figure)이 없습니다
            </Typography>
            <Typography
              sx={{ fontSize: '12px', maxWidth: 360, color: activeTheme.uiColors.textMuted }}
            >
              스크립트에서 <code>plot(x, y)</code>, <code>surf(X, Y, Z)</code>,{' '}
              <code>scatter()</code> 명령을 실행하거나 상단의 <b>PLOTS</b> 탭을 클릭하세요.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
