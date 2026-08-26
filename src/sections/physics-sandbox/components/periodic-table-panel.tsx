'use client';

import type { ElementData, ElementCategory } from '../chemistry/molecule-types';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';

import { ElementDetailDialog } from './element-detail-dialog';
import { ALL_ELEMENTS, CATEGORY_NAMES, CATEGORY_COLORS } from '../chemistry/elements-data';

// ----------------------------------------------------------------------

type HeatmapMode = 'category' | 'electronegativity' | 'atomicMass' | 'meltingPoint';
type BlockFilter = 'all' | 's' | 'p' | 'd' | 'f';

interface PeriodicTablePanelProps {
  onNavigateToAtomBuilder?: (atomicNumber: number) => void;
  onNavigateToMoleculeBuilder?: (symbol: string) => void;
}

export function PeriodicTablePanel({
  onNavigateToAtomBuilder,
  onNavigateToMoleculeBuilder,
}: PeriodicTablePanelProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<BlockFilter>('all');
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('category');
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getElementBlock = (el: ElementData): 's' | 'p' | 'd' | 'f' => {
    if (el.atomicNumber === 1 || el.atomicNumber === 2) return 's';
    if (el.category === 'lanthanide' || el.category === 'actinide') return 'f';
    if (el.group >= 1 && el.group <= 2) return 's';
    if (el.group >= 3 && el.group <= 12) return 'd';
    if (el.group >= 13 && el.group <= 18) return 'p';
    return 'd';
  };

  const isElementVisible = (el: ElementData): boolean => {
    const matchesCategory = selectedCategory === 'all' || el.category === selectedCategory;
    const matchesBlock = selectedBlock === 'all' || getElementBlock(el) === selectedBlock;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      el.nameKo.toLowerCase().includes(q) ||
      el.nameEn.toLowerCase().includes(q) ||
      el.symbol.toLowerCase().includes(q) ||
      String(el.atomicNumber).includes(q);

    return matchesCategory && matchesBlock && matchesSearch;
  };

  const lanthanides = useMemo(
    () => ALL_ELEMENTS.filter((e) => e.atomicNumber >= 57 && e.atomicNumber <= 71),
    []
  );
  const actinides = useMemo(
    () => ALL_ELEMENTS.filter((e) => e.atomicNumber >= 89 && e.atomicNumber <= 103),
    []
  );

  const mainGridElements = useMemo(
    () =>
      ALL_ELEMENTS.filter(
        (e) =>
          !(e.atomicNumber >= 57 && e.atomicNumber <= 71) &&
          !(e.atomicNumber >= 89 && e.atomicNumber <= 103)
      ),
    []
  );

  const getTileBackgroundColor = (el: ElementData): string => {
    if (heatmapMode === 'category') {
      return CATEGORY_COLORS[el.category] || '#64748b';
    }
    if (heatmapMode === 'electronegativity') {
      if (el.electronegativity === null) return '#334155';
      const ratio = Math.min(Math.max((el.electronegativity - 0.7) / 3.3, 0), 1);
      const r = Math.round(239 * ratio + 30 * (1 - ratio));
      const g = Math.round(68 * ratio + 144 * (1 - ratio));
      const b = Math.round(68 * ratio + 255 * (1 - ratio));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (heatmapMode === 'atomicMass') {
      const ratio = Math.min(el.atomicMass / 294, 1);
      const r = Math.round(168 * ratio + 50 * (1 - ratio));
      const g = Math.round(85 * ratio + 180 * (1 - ratio));
      const b = Math.round(247 * ratio + 240 * (1 - ratio));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (heatmapMode === 'meltingPoint') {
      if (el.meltingPoint === null) return '#334155';
      const ratio = Math.min(el.meltingPoint / 3800, 1);
      const r = Math.round(245 * ratio + 40 * (1 - ratio));
      const g = Math.round(158 * ratio + 100 * (1 - ratio));
      const b = Math.round(11 * ratio + 200 * (1 - ratio));
      return `rgb(${r}, ${g}, ${b})`;
    }
    return CATEGORY_COLORS[el.category];
  };

  const renderElementTile = (el: ElementData) => {
    const visible = isElementVisible(el);
    const bg = getTileBackgroundColor(el);
    const displayName = el.nameKo.split('(')[0]?.trim() || el.nameKo;

    return (
      <Box
        key={el.atomicNumber}
        component="button"
        type="button"
        onClick={() => setSelectedElement(el)}
        sx={{
          width: '100%',
          height: '100%',
          minHeight: { xs: 58, sm: 66 },
          p: 0.75,
          borderRadius: 1.5,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          bgcolor: bg,
          opacity: visible ? 1 : 0.2,
          cursor: visible ? 'pointer' : 'default',
          transition: 'all 0.15s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'center',
          outline: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          ...(visible && {
            '&:hover': {
              transform: 'scale(1.08)',
              zIndex: 10,
              boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
              borderColor: '#ffffff',
            },
            '&:active': {
              transform: 'scale(0.96)',
            },
          }),
        }}
        title={`${el.nameKo} (${el.nameEn}) - No.${el.atomicNumber}`}
      >
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '9px',
            fontWeight: 800,
            fontFamily: 'monospace',
            color: '#0f172a',
            lineHeight: 1,
          }}
        >
          <span>{el.atomicNumber}</span>
          <span style={{ fontSize: '8px', opacity: 0.8 }}>
            {el.atomicMass.toFixed(el.atomicMass >= 100 ? 0 : 1)}
          </span>
        </Box>

        <Typography
          sx={{
            fontSize: { xs: '14px', sm: '17px' },
            fontWeight: 900,
            color: '#090d16',
            lineHeight: 1,
            my: 0.2,
          }}
        >
          {el.symbol}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: '8px', sm: '9px' },
            fontWeight: 800,
            color: '#1e293b',
            lineHeight: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            width: '100%',
          }}
        >
          {displayName}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Filter and Search Control Bar */}
      <Card sx={{ p: 2.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          {/* Search Box */}
          <TextField
            size="small"
            placeholder="118개 원소 검색 (기호, 이름, 원자번호)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />

          {/* Block Filters (s, p, d, f) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
              오비탈 블록:
            </Typography>
            <ButtonGroup size="small" variant="outlined">
              {(['all', 's', 'p', 'd', 'f'] as BlockFilter[]).map((blk) => (
                <Button
                  key={blk}
                  variant={selectedBlock === blk ? 'contained' : 'outlined'}
                  onClick={() => setSelectedBlock(blk)}
                  sx={{ fontWeight: 700 }}
                >
                  {blk === 'all' ? '전체' : `${blk}-block`}
                </Button>
              ))}
            </ButtonGroup>
          </Box>

          {/* Heatmap Mode */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <PaletteRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
            <ButtonGroup size="small" variant="outlined">
              <Button
                variant={heatmapMode === 'category' ? 'contained' : 'outlined'}
                onClick={() => setHeatmapMode('category')}
                sx={{ fontWeight: 700 }}
              >
                범주
              </Button>
              <Button
                variant={heatmapMode === 'electronegativity' ? 'contained' : 'outlined'}
                onClick={() => setHeatmapMode('electronegativity')}
                sx={{ fontWeight: 700 }}
              >
                전기음성도
              </Button>
              <Button
                variant={heatmapMode === 'atomicMass' ? 'contained' : 'outlined'}
                onClick={() => setHeatmapMode('atomicMass')}
                sx={{ fontWeight: 700 }}
              >
                원자량
              </Button>
              <Button
                variant={heatmapMode === 'meltingPoint' ? 'contained' : 'outlined'}
                onClick={() => setHeatmapMode('meltingPoint')}
                sx={{ fontWeight: 700 }}
              >
                녹는점
              </Button>
            </ButtonGroup>
          </Box>
        </Box>

        {/* Category Chips Bar */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Chip
            label={`전체 (${ALL_ELEMENTS.length})`}
            size="small"
            clickable
            variant={selectedCategory === 'all' ? 'filled' : 'outlined'}
            color={selectedCategory === 'all' ? 'primary' : 'default'}
            onClick={() => setSelectedCategory('all')}
            sx={{ fontWeight: 800 }}
          />
          {(Object.keys(CATEGORY_NAMES) as ElementCategory[]).map((cat) => (
            <Chip
              key={cat}
              label={CATEGORY_NAMES[cat]}
              size="small"
              clickable
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(cat)}
              sx={{
                fontWeight: 700,
                ...(selectedCategory === cat && {
                  bgcolor: CATEGORY_COLORS[cat],
                  color: '#0f172a',
                }),
              }}
            />
          ))}
        </Box>
      </Card>

      {/* 2. Main 118 Elements Periodic Table Grid */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          bgcolor: '#090d16',
          border: '1.5px solid #1e293b',
          overflowX: 'auto',
        }}
      >
        <Box sx={{ minWidth: 940, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Group 1~18 Headers */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '32px repeat(18, minmax(0, 1fr))',
              gap: 1,
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '11px',
              fontFamily: 'monospace',
              color: 'text.secondary',
              pb: 1,
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ fontSize: '10px', color: '#94a3b8' }}>주기\족</Box>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => (
              <Box
                key={g}
                sx={{
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor:
                    g <= 2
                      ? 'rgba(239, 68, 68, 0.1)'
                      : g <= 12
                        ? 'rgba(59, 130, 246, 0.1)'
                        : 'rgba(234, 179, 8, 0.1)',
                  color: g <= 2 ? '#fca5a5' : g <= 12 ? '#93c5fd' : '#fde047',
                }}
              >
                {g}
              </Box>
            ))}
          </Box>

          {/* Main 7 Periods Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '32px repeat(18, minmax(0, 1fr))',
              gridTemplateRows: 'repeat(7, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            {/* Period Labels 1~7 */}
            {[1, 2, 3, 4, 5, 6, 7].map((p) => (
              <Box
                key={`p-${p}`}
                sx={{
                  gridColumnStart: 1,
                  gridRowStart: p,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#94a3b8',
                  bgcolor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: 1.5,
                }}
              >
                {p}
              </Box>
            ))}

            {/* Lanthanide Placeholder (57-71) */}
            <Box
              onClick={() => setSelectedCategory('lanthanide')}
              sx={{
                gridColumnStart: 4,
                gridRowStart: 6,
                borderRadius: 1.5,
                bgcolor: 'rgba(244, 63, 94, 0.15)',
                border: '1px dashed #f43f5e',
                color: '#fda4af',
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': { bgcolor: 'rgba(244, 63, 94, 0.3)' },
              }}
            >
              <Typography sx={{ fontSize: '9px', fontWeight: 800 }}>57-71</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 900 }}>La-Lu</Typography>
              <Typography sx={{ fontSize: '8px' }}>란타넘족 ↓</Typography>
            </Box>

            {/* Actinide Placeholder (89-103) */}
            <Box
              onClick={() => setSelectedCategory('actinide')}
              sx={{
                gridColumnStart: 4,
                gridRowStart: 7,
                borderRadius: 1.5,
                bgcolor: 'rgba(139, 92, 246, 0.15)',
                border: '1px dashed #8b5cf6',
                color: '#c4b5fd',
                p: 0.5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                textAlign: 'center',
                '&:hover': { bgcolor: 'rgba(139, 92, 246, 0.3)' },
              }}
            >
              <Typography sx={{ fontSize: '9px', fontWeight: 800 }}>89-103</Typography>
              <Typography sx={{ fontSize: '12px', fontWeight: 900 }}>Ac-Lr</Typography>
              <Typography sx={{ fontSize: '8px' }}>악티늄족 ↓</Typography>
            </Box>

            {/* Main Elements Tiles */}
            {mainGridElements.map((el) => (
              <Box
                key={el.atomicNumber}
                sx={{
                  gridColumnStart: el.group + 1,
                  gridRowStart: el.period,
                }}
              >
                {renderElementTile(el)}
              </Box>
            ))}
          </Box>

          {/* Block Boundaries Label */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '32px repeat(18, minmax(0, 1fr))',
              gap: 1,
              textAlign: 'center',
              fontSize: '10px',
              fontWeight: 800,
              pt: 0.5,
            }}
          >
            <Box />
            <Box
              sx={{
                gridColumn: 'span 2',
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(239, 68, 68, 0.1)',
                color: '#fca5a5',
              }}
            >
              s-block
            </Box>
            <Box
              sx={{
                gridColumn: 'span 10',
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(59, 130, 246, 0.1)',
                color: '#93c5fd',
              }}
            >
              d-block (전이 금속)
            </Box>
            <Box
              sx={{
                gridColumn: 'span 6',
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(234, 179, 8, 0.1)',
                color: '#fde047',
              }}
            >
              p-block (비금속/준금속/할로겐)
            </Box>
          </Box>

          {/* 3. f-block Lanthanides and Actinides */}
          <Box
            sx={{
              mt: 1.5,
              p: 2,
              borderRadius: 2,
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#94a3b8' }}>
              ⚛️ f-block 희토류 및 방사성 원소 (란타넘족 57~71 & 악티늄족 89~103)
            </Typography>

            {/* Lanthanides Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '32px repeat(18, minmax(0, 1fr))',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  gridColumn: 'span 3',
                  textAlign: 'right',
                  pr: 1.5,
                  color: '#fda4af',
                  fontWeight: 900,
                  fontSize: '11px',
                }}
              >
                란타넘족 (57-71)
              </Box>
              {lanthanides.map((el) => (
                <Box key={el.atomicNumber}>{renderElementTile(el)}</Box>
              ))}
            </Box>

            {/* Actinides Row */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '32px repeat(18, minmax(0, 1fr))',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  gridColumn: 'span 3',
                  textAlign: 'right',
                  pr: 1.5,
                  color: '#c4b5fd',
                  fontWeight: 900,
                  fontSize: '11px',
                }}
              >
                악티늄족 (89-103)
              </Box>
              {actinides.map((el) => (
                <Box key={el.atomicNumber}>{renderElementTile(el)}</Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Card>

      {/* 3. Element Detail Dialog Modal */}
      <ElementDetailDialog
        element={selectedElement}
        onClose={() => setSelectedElement(null)}
        onNavigateToAtomBuilder={onNavigateToAtomBuilder}
        onNavigateToMoleculeBuilder={onNavigateToMoleculeBuilder}
      />
    </Box>
  );
}
