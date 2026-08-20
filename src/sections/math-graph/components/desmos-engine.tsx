'use client';

import type { CurveConfig } from '../types';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import PresentToAllRoundedIcon from '@mui/icons-material/PresentToAllRounded';

// ----------------------------------------------------------------------

interface DesmosCalculatorInstance {
  setExpression: (expr: { id: string; latex: string; color?: string; hidden?: boolean }) => void;
  removeExpression: (expr: { id: string }) => void;
  setExpressions: (
    exprs: { id: string; latex: string; color?: string; hidden?: boolean }[]
  ) => void;
  getState: () => Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
  asyncScreenshot: (
    options: { width?: number; height?: number; targetPixelRatio?: number },
    callback: (dataUri: string) => void
  ) => void;
  destroy: () => void;
  updateSettings: (settings: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    Desmos?: {
      GraphingCalculator: (
        element: HTMLElement,
        options?: Record<string, unknown>
      ) => DesmosCalculatorInstance;
    };
  }
}

interface DesmosEngineProps {
  curves: CurveConfig[];
}

export function DesmosEngine({ curves }: DesmosEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calculatorRef = useRef<DesmosCalculatorInstance | null>(null);
  const curvesRef = useRef(curves);
  const [loading, setLoading] = useState<boolean>(true);
  const [projectorMode, setProjectorMode] = useState<boolean>(false);
  const [keypad, setKeypad] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    curvesRef.current = curves;
  }, [curves]);

  // Dynamic script loader for Desmos API
  useEffect(() => {
    let isMounted = true;
    const scriptId = 'desmos-api-script';

    const initCalculator = () => {
      if (!isMounted || !containerRef.current || !window.Desmos) return;

      // Clean up previous instance if exists
      if (calculatorRef.current) {
        try {
          calculatorRef.current.destroy();
        } catch (e) {
          console.warn('Desmos destroy notice:', e);
        }
        calculatorRef.current = null;
      }

      containerRef.current.innerHTML = '';

      try {
        const calc = window.Desmos.GraphingCalculator(containerRef.current, {
          keypad,
          graphpaper: true,
          expressions: true,
          settingsMenu: true,
          zoomButtons: true,
          projectorMode,
          fontSize: 14,
          border: false,
        });

        calculatorRef.current = calc;

        // Populate initial expressions from active curves
        const exprs = curvesRef.current
          .filter((c) => c.fn.trim() !== '')
          .map((c, index) => {
            let latex = `y = ${c.fn}`;
            if (c.fnType === 'polar') {
              latex = `r = ${c.fn.replace(/x/g, '\\theta')}`;
            }
            return {
              id: `curve_${c.id || index}`,
              latex,
              color: c.color,
              hidden: !c.visible,
            };
          });

        if (exprs.length > 0) {
          calc.setExpressions(exprs);
        }

        setLoading(false);
      } catch (err: unknown) {
        console.error('Failed to initialize Desmos:', err);
        setError('Desmos 계산기 초기화에 실패했습니다.');
        setLoading(false);
      }
    };

    if (window.Desmos) {
      initCalculator();
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src =
        'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        initCalculator();
      };
      script.onerror = () => {
        if (isMounted) {
          setError('Desmos API 스크립트 다운로드에 실패했습니다. 네트워크 연결을 확인하세요.');
          setLoading(false);
        }
      };
      document.head.appendChild(script);
    } else {
      const existingScript = document.getElementById(scriptId) as HTMLScriptElement;
      if (existingScript) {
        existingScript.addEventListener('load', initCalculator);
      }
    }

    return () => {
      isMounted = false;
      if (calculatorRef.current) {
        try {
          calculatorRef.current.destroy();
        } catch (e) {
          console.warn('Desmos cleanup notice:', e);
        }
        calculatorRef.current = null;
      }
    };
  }, [keypad, projectorMode]);

  // Sync curves into Desmos when curves change
  const syncCurvesToDesmos = useCallback(() => {
    if (!calculatorRef.current) return;

    curves.forEach((c, index) => {
      if (!c.fn.trim()) return;
      let latex = `y = ${c.fn}`;
      if (c.fnType === 'polar') {
        latex = `r = ${c.fn.replace(/x/g, '\\theta')}`;
      }
      calculatorRef.current?.setExpression({
        id: `curve_${c.id || index}`,
        latex,
        color: c.color,
        hidden: !c.visible,
      });
    });
  }, [curves]);

  const handlePushCurrentCurves = () => {
    syncCurvesToDesmos();
  };

  const handleScreenshot = () => {
    if (!calculatorRef.current) return;
    calculatorRef.current.asyncScreenshot(
      {
        width: 1200,
        height: 800,
        targetPixelRatio: 2,
      },
      (dataUri: string) => {
        const link = document.createElement('a');
        link.download = 'desmos-graph.png';
        link.href = dataUri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
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
        minHeight: 560,
      }}
    >
      {/* Top Header Controls */}
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
            Desmos Pro Graphing Calculator
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            (다중 수식, 슬라이더, 표, 부등식, 통계 지원)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={projectorMode}
                onChange={(e) => setProjectorMode(e.target.checked)}
              />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                <PresentToAllRoundedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  프로젝터 모드
                </Typography>
              </Box>
            }
          />

          <FormControlLabel
            control={
              <Switch size="small" checked={keypad} onChange={(e) => setKeypad(e.target.checked)} />
            }
            label={
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                <KeyboardRoundedIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  키패드
                </Typography>
              </Box>
            }
          />

          <Tooltip title="상단 수식 레이어를 Desmos로 동기화" arrow>
            <Button
              size="small"
              variant="outlined"
              startIcon={<RefreshRoundedIcon fontSize="small" />}
              onClick={handlePushCurrentCurves}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
            >
              수식 동기화
            </Button>
          </Tooltip>

          <Button
            size="small"
            variant="contained"
            startIcon={<CameraAltRoundedIcon fontSize="small" />}
            onClick={handleScreenshot}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
          >
            고해상도 캡처
          </Button>
        </Box>
      </Box>

      {/* Desmos Graph Container */}
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: 480,
          position: 'relative',
          borderRadius: 1.5,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          bgcolor: '#fff',
        }}
      >
        {loading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1.5,
              bgcolor: 'background.paper',
              zIndex: 2,
            }}
          >
            <CircularProgress size={36} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Desmos API 스크립트 및 계산기를 준비 중입니다...
            </Typography>
          </Box>
        )}

        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              p: 3,
              textAlign: 'center',
              bgcolor: 'background.paper',
              zIndex: 3,
            }}
          >
            <Typography variant="body1" sx={{ color: 'error.main', fontWeight: 600, mb: 1 }}>
              {error}
            </Typography>
            <Button variant="outlined" onClick={() => window.location.reload()}>
              새로고침
            </Button>
          </Box>
        )}

        <Box
          ref={containerRef}
          sx={{
            width: '100%',
            height: '100%',
            minHeight: 480,
          }}
        />
      </Box>
    </Card>
  );
}
