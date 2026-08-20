'use client';

import type { CurveConfig, DomainRange } from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import GridOnRoundedIcon from '@mui/icons-material/GridOnRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import GridOffRoundedIcon from '@mui/icons-material/GridOffRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { downloadSvg, downloadSvgAsPng } from '../utils/export-helpers';

// ----------------------------------------------------------------------

interface FunctionPlotEngineProps {
  curves: CurveConfig[];
  domain: DomainRange;
  onUpdateDomain?: (newDomain: DomainRange) => void;
}

declare global {
  interface Window {
    functionPlot?: (options: Record<string, unknown>) => unknown;
  }
}

export function FunctionPlotEngine({ curves, domain, onUpdateDomain }: FunctionPlotEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [currentDomain, setCurrentDomain] = useState<DomainRange>(domain);

  // Dynamic script loader for function-plot
  useEffect(() => {
    let isMounted = true;
    const scriptId = 'function-plot-cdn-script';

    if (window.functionPlot) {
      setScriptLoaded(true);
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/function-plot@1.25.4/dist/function-plot.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (isMounted) setScriptLoaded(true);
      };
      script.onerror = () => {
        if (isMounted) setErrorMessage('Function-Plot 라이브러리 스크립트 로드에 실패했습니다.');
      };
      document.head.appendChild(script);
    } else {
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
      if (existingScript) {
        existingScript.addEventListener('load', () => {
          if (isMounted) setScriptLoaded(true);
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync domain prop changes
  useEffect(() => {
    setCurrentDomain(domain);
  }, [domain]);

  // Render function plot
  const renderPlot = useCallback(() => {
    if (!containerRef.current || !window.functionPlot || !scriptLoaded) {
      return;
    }

    try {
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.max(300, Math.floor(rect.width));
      const height = Math.max(250, Math.floor(rect.height || 450));

      const visibleCurves = curves.filter((c) => c.visible && c.fn.trim() !== '');

      const dataItems: Record<string, unknown>[] = visibleCurves.map((c) => {
        // Format function for function-plot
        const cleanFn = c.fn
          .replace(/Math\.sin/g, 'sin')
          .replace(/Math\.cos/g, 'cos')
          .replace(/Math\.tan/g, 'tan')
          .replace(/Math\.sqrt/g, 'sqrt')
          .replace(/Math\.exp/g, 'exp')
          .replace(/Math\.log/g, 'log')
          .replace(/Math\.PI/g, 'PI')
          .replace(/Math\.E/g, 'E');

        const item: Record<string, unknown> = {
          fn: cleanFn,
          color: c.color,
          graphType: 'polyline',
        };

        if (c.fnType === 'polar') {
          item.fnType = 'polar';
          item.r = cleanFn;
        } else if (c.fnType === 'parametric') {
          item.fnType = 'parametric';
          item.x = c.xParam || 'sin(t)';
          item.y = c.yParam || 'cos(t)';
        }

        if (c.derivative) {
          item.derivative = {
            fn: cleanFn,
            updateOnMouseMove: true,
          };
        }

        if (c.closed) {
          item.closed = true;
        }

        return item;
      });

      // Clear container previous svg if needed
      containerRef.current.innerHTML = '';

      window.functionPlot({
        target: containerRef.current,
        width,
        height,
        grid: showGrid,
        xAxis: {
          domain: [currentDomain.xMin, currentDomain.xMax],
          label: 'x',
        },
        yAxis: {
          domain: [currentDomain.yMin, currentDomain.yMax],
          label: 'y',
        },
        tip: {
          xLine: true,
          yLine: true,
          renderer: (x: number, y: number) => `x: ${x.toFixed(3)}, y: ${y.toFixed(3)}`,
        },
        data: dataItems,
      });

      setErrorMessage(null);
    } catch (err: unknown) {
      console.warn('Function plot render notice:', err);
      const errMsg = err instanceof Error ? err.message : '수식 문법을 확인해 주세요.';
      setErrorMessage(errMsg);
    }
  }, [curves, currentDomain, showGrid, scriptLoaded]);

  // Trigger render on dependency changes
  useEffect(() => {
    renderPlot();
  }, [renderPlot]);

  // ResizeObserver for responsive redraws
  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return () => {};
    }
    const observer = new ResizeObserver(() => {
      renderPlot();
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [renderPlot]);

  const handleZoom = (factor: number) => {
    const xMid = (currentDomain.xMin + currentDomain.xMax) / 2;
    const yMid = (currentDomain.yMin + currentDomain.yMax) / 2;
    const xHalf = ((currentDomain.xMax - currentDomain.xMin) * factor) / 2;
    const yHalf = ((currentDomain.yMax - currentDomain.yMin) * factor) / 2;

    const nextDomain: DomainRange = {
      xMin: Number((xMid - xHalf).toFixed(2)),
      xMax: Number((xMid + xHalf).toFixed(2)),
      yMin: Number((yMid - yHalf).toFixed(2)),
      yMax: Number((yMid + yHalf).toFixed(2)),
    };
    setCurrentDomain(nextDomain);
    onUpdateDomain?.(nextDomain);
  };

  const handleReset = () => {
    setCurrentDomain(domain);
    onUpdateDomain?.(domain);
  };

  const handleExportPng = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      downloadSvgAsPng(svg, 'function-plot-2d.png', 2);
    }
  };

  const handleExportSvg = () => {
    if (!containerRef.current) return;
    const svg = containerRef.current.querySelector('svg');
    if (svg) {
      downloadSvg(svg, 'function-plot-2d.svg');
    }
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[2],
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 480,
      }}
    >
      {/* Engine Controls Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1.5,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Function-Plot 2D Viewer
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            (마우스 휠/드래그로 확대·이동 가능)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="격자선 토글" arrow>
            <IconButton size="small" onClick={() => setShowGrid((prev) => !prev)}>
              {showGrid ? (
                <GridOnRoundedIcon fontSize="small" />
              ) : (
                <GridOffRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="확대 (+)" arrow>
            <IconButton size="small" onClick={() => handleZoom(0.7)}>
              <ZoomInRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="축소 (-)" arrow>
            <IconButton size="small" onClick={() => handleZoom(1.4)}>
              <ZoomOutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="뷰 초기화" arrow>
            <IconButton size="small" onClick={handleReset}>
              <RestartAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            size="small"
            variant="outlined"
            startIcon={<CameraAltRoundedIcon fontSize="small" />}
            onClick={handleExportPng}
            sx={{ textTransform: 'none', borderRadius: 1.5, ml: 1, fontWeight: 600 }}
          >
            PNG 저장
          </Button>

          <Button
            size="small"
            variant="text"
            onClick={handleExportSvg}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
          >
            SVG
          </Button>
        </Box>
      </Box>

      {/* Plot Canvas / SVG Container */}
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: 400,
          position: 'relative',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.4)' : 'rgba(248,250,252,0.8)',
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': {
            width: '100% !important',
            height: '100% !important',
          },
          '& .origin': {
            stroke: 'text.secondary',
          },
          '& .axis': {
            stroke: 'text.disabled',
          },
        }}
      >
        {!scriptLoaded && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            <CircularProgress size={32} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Function-Plot 엔진을 로드하는 중...
            </Typography>
          </Box>
        )}

        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {errorMessage && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 12,
              left: 12,
              px: 1.5,
              py: 0.8,
              borderRadius: 1,
              bgcolor: 'rgba(239, 68, 68, 0.9)',
              color: '#fff',
              fontSize: '0.8rem',
              fontWeight: 600,
              boxShadow: 2,
              zIndex: 10,
            }}
          >
            {errorMessage}
          </Box>
        )}
      </Box>
    </Card>
  );
}
