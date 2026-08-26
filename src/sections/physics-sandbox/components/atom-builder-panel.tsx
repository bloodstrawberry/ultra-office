'use client';

import type { ElementData } from '../chemistry/molecule-types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import {
  ALL_ELEMENTS,
  CATEGORY_COLORS,
  getElementByNumber,
  getElementBySymbol,
} from '../chemistry/elements-data';

// ----------------------------------------------------------------------

const QUICK_ELEMENT_SYMBOLS = ['H', 'He', 'C', 'N', 'O', 'Na', 'Fe', 'Cu', 'Au', 'U', 'Og'];

interface AtomBuilderPanelProps {
  initialAtomicNumber?: number;
  onNavigateToMoleculeBuilder?: (symbol: string) => void;
}

export function AtomBuilderPanel({
  initialAtomicNumber = 6,
  onNavigateToMoleculeBuilder,
}: AtomBuilderPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [protons, setProtons] = useState<number>(initialAtomicNumber);
  const [neutrons, setNeutrons] = useState<number>(6);
  const [electrons, setElectrons] = useState<number>(6);
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  // 3D Orbit Drag Rotation state
  const rotRef = useRef<{
    x: number;
    y: number;
    isDragging: boolean;
    lastX: number;
    lastY: number;
  }>({
    x: 0.3,
    y: 0.5,
    isDragging: false,
    lastX: 0,
    lastY: 0,
  });

  const handleSelectElement = (el: ElementData) => {
    const z = el.atomicNumber;
    const stdNeutrons = Math.max(0, Math.round(el.atomicMass) - z);
    setProtons(z);
    setNeutrons(stdNeutrons);
    setElectrons(z);
  };

  useEffect(() => {
    if (initialAtomicNumber) {
      const el = getElementByNumber(initialAtomicNumber);
      if (el) handleSelectElement(el);
    }
  }, [initialAtomicNumber]);

  const currentElement = getElementByNumber(protons);

  // Status Calculations
  const netCharge = protons - electrons;
  const ionStatus =
    netCharge === 0
      ? '중성 원자 (Neutral)'
      : netCharge > 0
        ? `+${netCharge} 양이온 (Cation)`
        : `${netCharge} 음이온 (Anion)`;

  const massNumber = protons + neutrons;
  const standardNeutrons = currentElement
    ? Math.round(currentElement.atomicMass) - protons
    : protons;
  const isotopeStatus =
    neutrons === standardNeutrons
      ? '안정 동위원소 (Stable)'
      : Math.abs(neutrons - standardNeutrons) <= 2
        ? '희귀 동위원소 (Rare Isotope)'
        : '불안정 / 방사성 (Radioactive)';

  const categoryColor = currentElement
    ? CATEGORY_COLORS[currentElement.category] || '#38bdf8'
    : '#38bdf8';

  // 3D Canvas Rendering Loop
  useEffect(() => {
    let animId: number;
    let autoAngle = 0;

    // Electron Shells (K=2, L=8, M=18, N=32, O=32, P=18, Q=8)
    const capacities = [2, 8, 18, 32, 32, 18, 8];
    const shells: number[] = [];
    let remaining = electrons;
    for (const cap of capacities) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, cap);
      shells.push(count);
      remaining -= count;
    }

    // Nucleus Particles calculation
    const totalNucleus = Math.min(protons + neutrons, 70);
    const protonRatio = protons / (protons + neutrons || 1);
    const displayProtons = Math.round(totalNucleus * protonRatio);
    const nucleusParticles: { isProton: boolean; x: number; y: number; z: number }[] = [];

    const nucleusRadius = Math.max(14, Math.min(36, Math.cbrt(totalNucleus) * 9));

    for (let i = 0; i < totalNucleus; i += 1) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalNucleus);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = nucleusRadius * (0.35 + 0.65 * ((Math.sin(i * 12.7) + 1) / 2));
      nucleusParticles.push({
        isProton: i < displayProtons,
        x: r * Math.sin(phi) * Math.cos(theta),
        y: r * Math.sin(phi) * Math.sin(theta),
        z: r * Math.cos(phi),
      });
    }

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      autoAngle += 0.018;

      const userRotY = rotRef.current.y;
      const userRotX = rotRef.current.x;

      // 1. Draw 3D Electron Shells & Orbiting Electrons
      shells.forEach((countInShell, shellIdx) => {
        const ringRadius = 55 + shellIdx * 24;
        const tiltX = userRotX + 0.3 * (shellIdx + 1);
        const tiltY = userRotY + 0.4 * (shellIdx + 1);

        // Orbital Ring
        ctx.save();
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.08) {
          const rx = ringRadius * Math.cos(a);
          const ry = ringRadius * Math.sin(a) * Math.cos(tiltX);
          const px = cx + rx * Math.cos(tiltY) - ry * Math.sin(tiltY);
          const py = cy + rx * Math.sin(tiltY) + ry * Math.cos(tiltY);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Orbiting Electrons
        for (let eIdx = 0; eIdx < countInShell; eIdx += 1) {
          const eAngle = (eIdx / countInShell) * Math.PI * 2 + autoAngle * (1 + shellIdx * 0.25);
          const rx = ringRadius * Math.cos(eAngle);
          const ry = ringRadius * Math.sin(eAngle) * Math.cos(tiltX);
          const ex = cx + rx * Math.cos(tiltY) - ry * Math.sin(tiltY);
          const ey = cy + rx * Math.sin(tiltY) + ry * Math.cos(tiltY);

          // Golden Electron core
          ctx.beginPath();
          ctx.arc(ex, ey, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#facc15';
          ctx.fill();

          // Electron Outer Glow
          ctx.beginPath();
          ctx.arc(ex, ey, 7, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.fill();
        }
        ctx.restore();
      });

      // 2. Draw Nucleus Cluster Particles with 3D Matrix Projection & Painter's Depth Sorting
      const combinedAngleY = userRotY + autoAngle * 0.4;
      const combinedAngleX = userRotX;

      const cosY = Math.cos(combinedAngleY);
      const sinY = Math.sin(combinedAngleY);
      const cosX = Math.cos(combinedAngleX);
      const sinX = Math.sin(combinedAngleX);

      const projectedNucleus = nucleusParticles
        .map((p) => {
          // Rotate Y
          const x1 = p.x * cosY - p.z * sinY;
          const z1 = p.x * sinY + p.z * cosY;

          // Rotate X
          const y2 = p.y * cosX - z1 * sinX;
          const z2 = p.y * sinX + z1 * cosX;

          return {
            isProton: p.isProton,
            screenX: cx + x1,
            screenY: cy + y2,
            depth: z2,
          };
        })
        .sort((a, b) => a.depth - b.depth);

      projectedNucleus.forEach((p) => {
        const scale = (p.depth + 140) / 140;
        const radius = Math.max(3, 5.5 * scale);

        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isProton ? '#ef4444' : '#3b82f6';
        ctx.fill();

        // 3D Specular Highlight
        ctx.beginPath();
        ctx.arc(p.screenX - radius * 0.3, p.screenY - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [protons, neutrons, electrons]);

  // Drag interaction for 3D canvas
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    rotRef.current.isDragging = true;
    rotRef.current.lastX = e.clientX;
    rotRef.current.lastY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!rotRef.current.isDragging) return;
    const dx = e.clientX - rotRef.current.lastX;
    const dy = e.clientY - rotRef.current.lastY;
    rotRef.current.y += dx * 0.01;
    rotRef.current.x += dy * 0.01;
    rotRef.current.lastX = e.clientX;
    rotRef.current.lastY = e.clientY;
  };

  const handleMouseUp = () => {
    rotRef.current.isDragging = false;
  };

  const filteredPickerElements = ALL_ELEMENTS.filter(
    (el) =>
      !pickerSearch.trim() ||
      el.symbol.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      el.nameKo.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      el.nameEn.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      String(el.atomicNumber).includes(pickerSearch)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
      {/* Left: 3D Atom Simulator Viewport */}
      <Card
        sx={{
          flex: { xs: '1 1 auto', lg: '1 1 55%' },
          height: { xs: 380, sm: 480, lg: 560 },
          bgcolor: '#070b14',
          border: '1.5px solid #1e293b',
          borderRadius: 2.5,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          width={640}
          height={560}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'grab',
          }}
        />

        {/* Top-Left: Real-time particle legend overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 14,
            left: 14,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            pointerEvents: 'none',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>
              양성자 {protons}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#3b82f6' }} />
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>
              중성자 {neutrons}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: '#facc15' }} />
            <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800 }}>
              전자 {electrons}
            </Typography>
          </Box>
        </Box>

        {/* Bottom-Left: Drag Hint */}
        <Typography
          variant="caption"
          sx={{
            position: 'absolute',
            bottom: 12,
            left: 14,
            color: '#64748b',
            fontWeight: 700,
            pointerEvents: 'none',
          }}
        >
          💡 3D 공간을 마우스로 드래그하여 원자를 360° 회전할 수 있습니다.
        </Typography>
      </Card>

      {/* Right: Controller & Metrics Panel */}
      <Card
        sx={{
          flex: { xs: '1 1 auto', lg: '1 1 45%' },
          p: 3,
          borderRadius: 2.5,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: 2.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Top: 118 Elements Modal Trigger & Navigation */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIosNewRoundedIcon sx={{ fontSize: '12px !important' }} />}
              disabled={protons <= 1}
              onClick={() => {
                const prevZ = Math.max(1, protons - 1);
                const el = getElementByNumber(prevZ);
                if (el) handleSelectElement(el);
              }}
              sx={{ fontWeight: 800, flexShrink: 0 }}
            >
              No.{Math.max(1, protons - 1)}
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="small"
              fullWidth
              startIcon={<SearchRoundedIcon />}
              onClick={() => setIsPickerOpen(true)}
              sx={{ fontWeight: 800 }}
            >
              주기율표 원소 선택 (118종)
            </Button>

            <Button
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardIosRoundedIcon sx={{ fontSize: '12px !important' }} />}
              disabled={protons >= 118}
              onClick={() => {
                const nextZ = Math.min(118, protons + 1);
                const el = getElementByNumber(nextZ);
                if (el) handleSelectElement(el);
              }}
              sx={{ fontWeight: 800, flexShrink: 0 }}
            >
              No.{Math.min(118, protons + 1)}
            </Button>
          </Box>

          {/* Quick Element Selection Chips */}
          <Box sx={{ display: 'flex', gap: 0.75, overflowX: 'auto', pb: 0.5 }}>
            {QUICK_ELEMENT_SYMBOLS.map((sym) => {
              const el = getElementBySymbol(sym);
              if (!el) return null;
              const isSelected = protons === el.atomicNumber;
              return (
                <Chip
                  key={sym}
                  label={`${el.symbol} ${el.nameKo}`}
                  size="small"
                  clickable
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? 'primary' : 'default'}
                  onClick={() => handleSelectElement(el)}
                  sx={{ fontWeight: 800, flexShrink: 0 }}
                />
              );
            })}
          </Box>

          {/* Current Element Status Banner */}
          <Card
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 2,
                bgcolor: categoryColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <Typography
                sx={{
                  fontSize: '9px',
                  fontFamily: 'monospace',
                  fontWeight: 900,
                  color: '#0f172a',
                  lineHeight: 1,
                }}
              >
                No.{protons}
              </Typography>
              <Typography
                sx={{ fontSize: '22px', fontWeight: 900, color: '#090d16', lineHeight: 1 }}
              >
                {currentElement ? currentElement.symbol : `Z=${protons}`}
              </Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 900 }}>
              {currentElement ? currentElement.nameKo : '미지의 원소'} (
              {currentElement?.nameEn || 'Unknown'})
            </Typography>

            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              원자 번호(Z): No.{protons} | 질량수(A): {massNumber} | 표준원자량:{' '}
              {currentElement?.atomicMass ?? '-'} u
            </Typography>

            {/* Badges: Ion and Isotope */}
            <Box
              sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mt: 0.5 }}
            >
              <Chip
                label={ionStatus}
                size="small"
                color={netCharge === 0 ? 'success' : 'secondary'}
                sx={{ fontWeight: 800 }}
              />
              <Chip
                label={isotopeStatus}
                size="small"
                color={isotopeStatus.includes('Stable') ? 'primary' : 'warning'}
                sx={{ fontWeight: 800 }}
              />
            </Box>
          </Card>

          {/* Sliders: Protons, Neutrons, Electrons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* 1. Protons */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                  🔴 양성자 (Protons, 원자번호)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  No.{protons}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    const nextVal = Math.max(1, protons - 1);
                    setProtons(nextVal);
                    setElectrons(nextVal);
                  }}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Slider
                  size="small"
                  value={protons}
                  min={1}
                  max={118}
                  onChange={(_, val) => {
                    const z = val as number;
                    setProtons(z);
                    const el = getElementByNumber(z);
                    if (el) setNeutrons(Math.max(0, Math.round(el.atomicMass) - z));
                    setElectrons(z);
                  }}
                  color="error"
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    const nextVal = Math.min(118, protons + 1);
                    setProtons(nextVal);
                    setElectrons(nextVal);
                  }}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* 2. Neutrons */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  🔵 중성자 (Neutrons, 동위원소)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  {neutrons}개
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setNeutrons((p) => Math.max(0, p - 1))}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Slider
                  size="small"
                  value={neutrons}
                  min={0}
                  max={180}
                  onChange={(_, val) => setNeutrons(val as number)}
                  color="primary"
                />
                <IconButton
                  size="small"
                  onClick={() => setNeutrons((p) => Math.min(180, p + 1))}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* 3. Electrons */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'warning.main' }}>
                  🟡 전자 (Electrons, 이온 전하)
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 900, fontFamily: 'monospace' }}>
                  {electrons}개
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <IconButton
                  size="small"
                  onClick={() => setElectrons((p) => Math.max(0, p - 1))}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <RemoveRoundedIcon fontSize="small" />
                </IconButton>
                <Slider
                  size="small"
                  value={electrons}
                  min={0}
                  max={118}
                  onChange={(_, val) => setElectrons(val as number)}
                  color="warning"
                />
                <IconButton
                  size="small"
                  onClick={() => setElectrons((p) => Math.min(118, p + 1))}
                  sx={{ border: '1px solid', borderColor: 'divider' }}
                >
                  <AddRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Bottom Actions */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => {
              if (currentElement) handleSelectElement(currentElement);
            }}
            sx={{ fontWeight: 800 }}
          >
            {currentElement?.nameKo ?? `No.${protons}`} 표준 상태로 맞추기
          </Button>

          {onNavigateToMoleculeBuilder && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (currentElement) onNavigateToMoleculeBuilder(currentElement.symbol);
              }}
              sx={{ fontWeight: 800 }}
            >
              🧪 {currentElement?.symbol} 분자 조립기로 가져가기
            </Button>
          )}
        </Box>
      </Card>

      {/* 118 Elements Picker Modal */}
      <Dialog
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 3,
            bgcolor: 'background.paper',
            maxHeight: '85vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            원소 선택 (118종 전체)
          </Typography>
          <Button size="small" onClick={() => setIsPickerOpen(false)}>
            닫기
          </Button>
        </Box>

        <TextField
          size="small"
          fullWidth
          placeholder="원소 기호, 한글/영문 이름, 원자번호 검색..."
          value={pickerSearch}
          onChange={(e) => setPickerSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(3, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(6, 1fr)',
            },
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          {filteredPickerElements.map((el) => (
            <Card
              key={el.atomicNumber}
              variant="outlined"
              onClick={() => {
                handleSelectElement(el);
                setIsPickerOpen(false);
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                textAlign: 'center',
                gap: 0.5,
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  transform: 'scale(1.03)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: CATEGORY_COLORS[el.category] || '#38bdf8',
                  color: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '13px',
                }}
              >
                {el.symbol}
              </Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '12px' }}>
                {el.nameKo}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                No.{el.atomicNumber}
              </Typography>
            </Card>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
}
