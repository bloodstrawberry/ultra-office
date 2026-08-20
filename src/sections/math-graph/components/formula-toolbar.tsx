'use client';

import type { EngineMode, CurveConfig } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FormControlLabel from '@mui/material/FormControlLabel';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';

import { LatexPreview } from './latex-preview';

// ----------------------------------------------------------------------

const MATH_SYMBOLS = [
  { label: 'x²', insert: '^2', tip: '제곱' },
  { label: 'xʸ', insert: '^', tip: '거듭제곱' },
  { label: '√x', insert: 'sqrt()', tip: '제곱근' },
  { label: 'π', insert: 'PI', tip: '원주율 (Pi)' },
  { label: 'e', insert: 'E', tip: '자연상수 e' },
  { label: 'sin', insert: 'sin()', tip: '사인 함수' },
  { label: 'cos', insert: 'cos()', tip: '코사인 함수' },
  { label: 'tan', insert: 'tan()', tip: '탄젠트 함수' },
  { label: 'ln', insert: 'ln()', tip: '자연로그' },
  { label: 'exp', insert: 'exp()', tip: '지수함수 e^x' },
  { label: '|x|', insert: 'abs()', tip: '절댓값' },
  { label: '1/x', insert: '1/', tip: '분수' },
];

const PRESET_COLORS = [
  '#2563eb', // Blue
  '#dc2626', // Red
  '#16a34a', // Green
  '#9333ea', // Purple
  '#ea580c', // Orange
  '#0891b2', // Cyan
  '#db2777', // Pink
];

interface FormulaToolbarProps {
  curves: CurveConfig[];
  activeCurveId: string;
  engine: EngineMode;
  onSelectCurve: (id: string) => void;
  onUpdateCurve: (id: string, updates: Partial<CurveConfig>) => void;
  onAddCurve: () => void;
  onRemoveCurve: (id: string) => void;
  onOpenPresets: () => void;
}

export function FormulaToolbar({
  curves,
  activeCurveId,
  engine,
  onSelectCurve,
  onUpdateCurve,
  onAddCurve,
  onRemoveCurve,
  onOpenPresets,
}: FormulaToolbarProps) {
  const activeCurve = curves.find((c) => c.id === activeCurveId) || curves[0];

  const handleSymbolClick = (insertStr: string) => {
    if (!activeCurve) return;
    const currentFn = activeCurve.fn;
    let nextFn = '';
    if (insertStr.endsWith('()')) {
      nextFn = currentFn + insertStr.slice(0, -1) + 'x)';
    } else {
      nextFn = currentFn + insertStr;
    }
    onUpdateCurve(activeCurve.id, { fn: nextFn });
  };

  const getLatexForFormula = (fn: string): string => {
    if (!fn) return '';
    const tex = fn
      .replace(/\*/g, ' \\cdot ')
      .replace(/PI/g, '\\pi')
      .replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}')
      .replace(/exp\(([^)]+)\)/g, 'e^{$1}')
      .replace(/sin\(([^)]+)\)/g, '\\sin($1)')
      .replace(/cos\(([^)]+)\)/g, '\\cos($1)')
      .replace(/tan\(([^)]+)\)/g, '\\tan($1)')
      .replace(/ln\(([^)]+)\)/g, '\\ln($1)')
      .replace(/abs\(([^)]+)\)/g, '|$1|')
      .replace(/\^([0-9a-zA-Z]+)/g, '^{$1}');
    return `f(x) = ${tex}`;
  };

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 2,
        boxShadow: (theme) => theme.shadows[2],
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      {/* Top Header: Curves List & Action */}
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
          <FunctionsRoundedIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            수식 레이어 ({curves.length})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
            onClick={onOpenPresets}
            sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
          >
            수식 프리셋 갤러리
          </Button>

          {engine === 'function-plot' && (
            <Button
              size="small"
              variant="contained"
              startIcon={<AddRoundedIcon fontSize="small" />}
              onClick={onAddCurve}
              disabled={curves.length >= 6}
              sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
            >
              함수 추가
            </Button>
          )}
        </Box>
      </Box>

      {/* Curve Selection Tabs / Pills */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: 1,
          overflowX: 'auto',
          pb: 1,
          mb: 1.5,
        }}
      >
        {curves.map((c, index) => {
          const isSelected = c.id === activeCurve?.id;
          return (
            <Box
              key={c.id}
              onClick={() => onSelectCurve(c.id)}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.7,
                borderRadius: 2,
                cursor: 'pointer',
                border: (theme) => `2px solid ${isSelected ? c.color : theme.palette.divider}`,
                bgcolor: isSelected ? `${c.color}15` : 'background.default',
                transition: 'all 0.2s',
                '&:hover': {
                  bgcolor: `${c.color}25`,
                },
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: c.color,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? 'text.primary' : 'text.secondary',
                  whiteSpace: 'nowrap',
                }}
              >
                f_{index + 1}(x) = {c.fn.length > 12 ? `${c.fn.slice(0, 12)}...` : c.fn || '0'}
              </Typography>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateCurve(c.id, { visible: !c.visible });
                }}
                sx={{ p: 0.3, ml: 0.5 }}
              >
                {c.visible ? (
                  <VisibilityRoundedIcon sx={{ fontSize: 16, color: c.color }} />
                ) : (
                  <VisibilityOffRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                )}
              </IconButton>

              {curves.length > 1 && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveCurve(c.id);
                  }}
                  sx={{ p: 0.3 }}
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Active Formula Input & KaTeX Preview */}
      {activeCurve && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              label="함수 수식 f(x)"
              value={activeCurve.fn}
              onChange={(e) => onUpdateCurve(activeCurve.id, { fn: e.target.value })}
              placeholder="예: x^2 - 4, sin(x), 1/(x^2 + 1)"
              variant="outlined"
              slotProps={{
                input: {
                  sx: {
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    fontSize: '1rem',
                  },
                },
              }}
            />

            {/* Color Palette Selector */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center' }}>
              {PRESET_COLORS.map((col) => (
                <Box
                  key={col}
                  onClick={() => onUpdateCurve(activeCurve.id, { color: col })}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    bgcolor: col,
                    cursor: 'pointer',
                    border: activeCurve.color === col ? '3px solid #000' : '2px solid transparent',
                    boxShadow: activeCurve.color === col ? '0 0 0 2px #fff inset' : 'none',
                    transition: 'transform 0.15s',
                    '&:hover': { transform: 'scale(1.2)' },
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Quick Math Symbols Palette */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 0.8,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, mr: 0.5 }}
            >
              빠른 기호:
            </Typography>
            {MATH_SYMBOLS.map((sym) => (
              <Tooltip key={sym.label} title={sym.tip} arrow>
                <Chip
                  label={sym.label}
                  size="small"
                  onClick={() => handleSymbolClick(sym.insert)}
                  clickable
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                    '&:hover': { bgcolor: 'primary.light', color: 'primary.contrastText' },
                  }}
                />
              </Tooltip>
            ))}
          </Box>

          {/* KaTeX LaTeX Realtime Rendering Display */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            }}
          >
            <LatexPreview
              latex={getLatexForFormula(activeCurve.fn)}
              color={activeCurve.color}
              fontSize="1.1rem"
            />
          </Box>

          {/* Advanced Calculus Overlays (Function-Plot & Calculus Engine) */}
          {(engine === 'function-plot' || engine === 'calculus') && (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
                pt: 1,
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={!!activeCurve.derivative}
                      onChange={(e) =>
                        onUpdateCurve(activeCurve.id, { derivative: e.target.checked })
                      }
                      color="secondary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      도함수 f&apos;(x) 표시
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={activeCurve.tangentPoint !== undefined}
                      onChange={(e) =>
                        onUpdateCurve(activeCurve.id, {
                          tangentPoint: e.target.checked ? 1 : undefined,
                        })
                      }
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      접선 (Tangent Line)
                    </Typography>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={!!activeCurve.closed}
                      onChange={(e) => onUpdateCurve(activeCurve.id, { closed: e.target.checked })}
                      color="info"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      면적 음영 채우기
                    </Typography>
                  }
                />
              </Box>

              {/* Tangent point slider when enabled */}
              {activeCurve.tangentPoint !== undefined && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1.5,
                    minWidth: 200,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                    접점 x₀ = {activeCurve.tangentPoint.toFixed(2)}
                  </Typography>
                  <Slider
                    size="small"
                    value={activeCurve.tangentPoint}
                    min={-5}
                    max={5}
                    step={0.1}
                    onChange={(_, val) =>
                      onUpdateCurve(activeCurve.id, { tangentPoint: val as number })
                    }
                    sx={{ flexGrow: 1 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}
    </Card>
  );
}
