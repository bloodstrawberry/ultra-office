'use client';

import type { EngineMode, PresetItem, CurveConfig, DomainRange } from '../types';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { DesmosEngine } from '../components/desmos-engine';
import { PresetDialog } from '../components/preset-dialog';
import { TableOfValues } from '../components/table-of-values';
import { EngineSwitcher } from '../components/engine-switcher';
import { FormulaToolbar } from '../components/formula-toolbar';
import { CalculusStudio } from '../components/calculus-studio';
import { Surface3DEngine } from '../components/surface-3d-engine';
import { FunctionPlotEngine } from '../components/function-plot-engine';

// ----------------------------------------------------------------------

const DEFAULT_CURVES: CurveConfig[] = [
  {
    id: 'curve-1',
    fn: 'x^2 - 4',
    color: '#2563eb',
    visible: true,
    derivative: false,
  },
  {
    id: 'curve-2',
    fn: '2*x + 1',
    color: '#dc2626',
    visible: false,
    derivative: false,
  },
];

const DEFAULT_DOMAIN: DomainRange = {
  xMin: -6,
  xMax: 6,
  yMin: -6,
  yMax: 6,
};

export function MathGraphView() {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [engine, setEngine] = useState<EngineMode>('function-plot');
  const [curves, setCurves] = useState<CurveConfig[]>(DEFAULT_CURVES);
  const [activeCurveId, setActiveCurveId] = useState<string>('curve-1');
  const [domain, setDomain] = useState<DomainRange>(DEFAULT_DOMAIN);
  const [showTable, setShowTable] = useState<boolean>(false);
  const [presetDialogOpen, setPresetDialogOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Hydration protection & initial state load
  useEffect(() => {
    setHasLoaded(true);
  }, []);

  const activeCurve = curves.find((c) => c.id === activeCurveId) || curves[0];

  // Update a single curve property
  const handleUpdateCurve = useCallback((id: string, updates: Partial<CurveConfig>) => {
    setCurves((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  }, []);

  // Add new curve
  const handleAddCurve = useCallback(() => {
    if (curves.length >= 6) {
      toast.warning('최대 6개의 수식까지 추가할 수 있습니다.');
      return;
    }
    const colors = ['#16a34a', '#9333ea', '#ea580c', '#0891b2', '#db2777'];
    const nextColor = colors[curves.length % colors.length];
    const newId = `curve-${Date.now()}`;
    const newCurve: CurveConfig = {
      id: newId,
      fn: 'sin(x)',
      color: nextColor,
      visible: true,
      derivative: false,
    };
    setCurves((prev) => [...prev, newCurve]);
    setActiveCurveId(newId);
    toast.success('새 수식이 추가되었습니다.');
  }, [curves.length]);

  // Remove a curve
  const handleRemoveCurve = useCallback(
    (id: string) => {
      if (curves.length <= 1) return;
      setCurves((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        if (activeCurveId === id && filtered.length > 0) {
          setActiveCurveId(filtered[0].id);
        }
        return filtered;
      });
    },
    [curves.length, activeCurveId]
  );

  // Select Preset handler
  const handleSelectPreset = useCallback((preset: PresetItem) => {
    setEngine(preset.engine);

    if (preset.domain) {
      setDomain(preset.domain);
    }

    if (preset.engine === 'surface-3d') {
      toast.success(`3D 곡면 프리셋 '${preset.title}'이 적용되었습니다.`);
      return;
    }

    if (preset.formula || preset.xParam) {
      setCurves([
        {
          id: `curve-${Date.now()}`,
          fn: preset.formula,
          xParam: preset.xParam,
          yParam: preset.yParam,
          fnType:
            preset.type === 'polar'
              ? 'polar'
              : preset.type === 'parametric'
                ? 'parametric'
                : 'linear',
          color: '#2563eb',
          visible: true,
          derivative: preset.engine === 'calculus',
          tangentPoint: preset.engine === 'calculus' ? 1 : undefined,
        },
      ]);
      setActiveCurveId(`curve-${Date.now()}`);
    }

    toast.success(`프리셋 '${preset.title}'이 적용되었습니다.`);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  if (!hasLoaded) {
    return (
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          수식 그래프 시각화 시스템을 로드하는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: { xs: 'auto', md: 'calc(100vh - 120px)' },
        maxHeight: { xs: 'none', md: 'calc(100vh - 120px)' },
        overflowY: 'auto',
        p: { xs: 1.5, md: 2.5 },
        pb: 4,
      }}
    >
      {/* 1. Top Engine Switcher and Global Actions */}
      <EngineSwitcher
        currentEngine={engine}
        showTable={showTable}
        isFullscreen={isFullscreen}
        onChangeEngine={setEngine}
        onToggleTable={() => setShowTable((prev) => !prev)}
        onToggleFullscreen={handleToggleFullscreen}
        onOpenPresets={() => setPresetDialogOpen(true)}
      />

      {/* 2. Formula Input Toolbar (For 2D & Calculus modes) */}
      {engine !== 'surface-3d' && (
        <FormulaToolbar
          curves={curves}
          activeCurveId={activeCurveId}
          engine={engine}
          onSelectCurve={setActiveCurveId}
          onUpdateCurve={handleUpdateCurve}
          onAddCurve={handleAddCurve}
          onRemoveCurve={handleRemoveCurve}
          onOpenPresets={() => setPresetDialogOpen(true)}
        />
      )}

      {/* 3. Main Engine Visualization Canvas */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 480,
        }}
      >
        {engine === 'function-plot' && (
          <FunctionPlotEngine curves={curves} domain={domain} onUpdateDomain={setDomain} />
        )}

        {engine === 'desmos' && <DesmosEngine curves={curves} />}

        {engine === 'surface-3d' && <Surface3DEngine />}

        {engine === 'calculus' && (
          <CalculusStudio formula={activeCurve?.fn || 'x^2 - 4'} domain={domain} />
        )}
      </Box>

      {/* 4. Optional Table of Values Panel */}
      {showTable && activeCurve && <TableOfValues formula={activeCurve.fn} />}

      {/* 5. Preset Modal Dialog */}
      <PresetDialog
        open={presetDialogOpen}
        onClose={() => setPresetDialogOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </Box>
  );
}
