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
}

export function MatlabFigureViewer({
  figures,
  activeFigureId,
  onSelectFigure,
  onClearFigures,
}: MatlabFigureViewerProps) {
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
        bgcolor: '#181b20',
        color: '#e0e6ed',
        borderRadius: 1,
        border: '1px solid #2b313d',
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
          bgcolor: '#1e222b',
          borderBottom: '1px solid #2b313d',
          px: 1,
          minHeight: 38,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mr: 1, pl: 0.5 }}>
            <AutoGraphRoundedIcon sx={{ fontSize: 18, color: '#38bdf8' }} />
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
                  color: '#94a3b8',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: '#282e3b',
                    color: '#38bdf8',
                    fontWeight: 600,
                    borderTop: '2px solid #38bdf8',
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
            <Typography sx={{ fontSize: '11px', color: '#64748b', fontStyle: 'italic' }}>
              플롯 출력 대기 중...
            </Typography>
          )}
        </Box>

        {/* Toolbar Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {activeFigure && (
            <Tooltip title="PNG 이미지 저장">
              <IconButton size="small" onClick={handleExportPng} sx={{ color: '#94a3b8' }}>
                <DownloadRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title={isFullscreen ? '전체화면 해제' : '전체화면'}>
            <IconButton
              size="small"
              onClick={() => setIsFullscreen((prev) => !prev)}
              sx={{ color: '#94a3b8' }}
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
                plot_bgcolor: '#121418',
                font: { color: '#e2e8f0', family: 'Inter, sans-serif', size: 11 },
                margin: { l: 48, r: 24, t: 36, b: 36 },
                xaxis: {
                  gridcolor: '#2d3748',
                  zerolinecolor: '#4a5568',
                  ...activeFigure.layout?.xaxis,
                },
                yaxis: {
                  gridcolor: '#2d3748',
                  zerolinecolor: '#4a5568',
                  ...activeFigure.layout?.yaxis,
                },
                scene: {
                  xaxis: { gridcolor: '#2d3748' },
                  yaxis: { gridcolor: '#2d3748' },
                  zaxis: { gridcolor: '#2d3748' },
                  ...activeFigure.layout?.scene,
                },
                title: activeFigure.layout?.title || {
                  text: activeFigure.title,
                  font: { size: 13, color: '#f1f5f9' },
                },
                showlegend: activeFigure.layout?.showlegend ?? activeFigure.traces.length > 1,
                legend: {
                  bgcolor: 'rgba(24, 27, 32, 0.8)',
                  bordercolor: '#334155',
                  borderwidth: 1,
                  font: { color: '#e2e8f0', size: 10 },
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
              color: '#64748b',
              textAlign: 'center',
              p: 3,
            }}
          >
            <AutoGraphRoundedIcon sx={{ fontSize: 44, color: '#334155' }} />
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8' }}>
              현재 활성화된 플롯(Figure)이 없습니다
            </Typography>
            <Typography sx={{ fontSize: '12px', maxWidth: 360, color: '#64748b' }}>
              스크립트에서 <code>plot(x, y)</code>, <code>surf(X, Y, Z)</code>,{' '}
              <code>scatter()</code> 명령을 실행하거나 상단의 <b>PLOTS</b> 탭을 클릭하세요.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
