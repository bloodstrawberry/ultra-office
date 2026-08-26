'use client';

import type { ElementData } from '../chemistry/molecule-types';

import React, { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ScienceRoundedIcon from '@mui/icons-material/ScienceRounded';
import BiotechRoundedIcon from '@mui/icons-material/BiotechRounded';

import { CATEGORY_NAMES, CATEGORY_COLORS } from '../chemistry/elements-data';

// ----------------------------------------------------------------------

interface ElementDetailDialogProps {
  element: ElementData | null;
  onClose: () => void;
  onNavigateToAtomBuilder?: (atomicNumber: number) => void;
  onNavigateToMoleculeBuilder?: (symbol: string) => void;
}

export function ElementDetailDialog({
  element,
  onClose,
  onNavigateToAtomBuilder,
  onNavigateToMoleculeBuilder,
}: ElementDetailDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 3D Canvas Atom Model with Protons/Neutrons nucleus & Electron Shells
  useEffect(() => {
    if (!element) return undefined;

    let animId: number;
    let angle = 0;

    const protons = element.atomicNumber;
    const neutrons = Math.max(0, Math.round(element.atomicMass) - protons);
    const electrons = protons;

    // Electron shells: K=2, L=8, M=18, N=32, O=32, P=18, Q=8
    const capacities = [2, 8, 18, 32, 32, 18, 8];
    const shells: number[] = [];
    let remaining = electrons;
    for (const cap of capacities) {
      if (remaining <= 0) break;
      const count = Math.min(remaining, cap);
      shells.push(count);
      remaining -= count;
    }

    // Precalculate nucleus particles
    const totalNucleus = Math.min(protons + neutrons, 60);
    const protonRatio = protons / (protons + neutrons || 1);
    const displayProtons = Math.round(totalNucleus * protonRatio);
    const nucleusParticles: { isProton: boolean; x: number; y: number; z: number }[] = [];

    const nucleusRadius = Math.max(12, Math.min(32, Math.cbrt(totalNucleus) * 8));

    for (let i = 0; i < totalNucleus; i += 1) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / totalNucleus);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = nucleusRadius * (0.4 + 0.6 * ((Math.sin(i * 12.3) + 1) / 2));
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

      angle += 0.02;

      // 1. Draw electron orbital rings and electrons
      shells.forEach((countInShell, shellIdx) => {
        const ringRadius = 45 + shellIdx * 20;
        const tiltX = 0.35 * (shellIdx + 1);
        const tiltY = 0.45 * (shellIdx + 1);

        // Ring
        ctx.save();
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const rx = ringRadius * Math.cos(a);
          const ry = ringRadius * Math.sin(a) * Math.cos(tiltX);
          const px = cx + rx * Math.cos(tiltY) - ry * Math.sin(tiltY);
          const py = cy + rx * Math.sin(tiltY) + ry * Math.cos(tiltY);
          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Orbiting electrons
        for (let eIdx = 0; eIdx < countInShell; eIdx += 1) {
          const eAngle = (eIdx / countInShell) * Math.PI * 2 + angle * (1 + shellIdx * 0.3);
          const rx = ringRadius * Math.cos(eAngle);
          const ry = ringRadius * Math.sin(eAngle) * Math.cos(tiltX);
          const ex = cx + rx * Math.cos(tiltY) - ry * Math.sin(tiltY);
          const ey = cy + rx * Math.sin(tiltY) + ry * Math.cos(tiltY);

          ctx.beginPath();
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#facc15';
          ctx.fill();

          // Glow
          ctx.beginPath();
          ctx.arc(ex, ey, 6, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
          ctx.fill();
        }
        ctx.restore();
      });

      // 2. Draw Nucleus particles with 3D rotation & depth sorting
      const cosA = Math.cos(angle * 0.5);
      const sinA = Math.sin(angle * 0.5);

      const sortedNucleus = nucleusParticles
        .map((p) => {
          const rotX = p.x * cosA - p.z * sinA;
          const rotZ = p.x * sinA + p.z * cosA;
          return {
            isProton: p.isProton,
            screenX: cx + rotX,
            screenY: cy + p.y,
            depth: rotZ,
          };
        })
        .sort((a, b) => a.depth - b.depth);

      sortedNucleus.forEach((p) => {
        const scale = (p.depth + 100) / 100;
        const radius = Math.max(2.5, 4.5 * scale);

        ctx.beginPath();
        ctx.arc(p.screenX, p.screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isProton ? '#ef4444' : '#3b82f6';
        ctx.fill();

        // Shiny highlight
        ctx.beginPath();
        ctx.arc(p.screenX - radius * 0.3, p.screenY - radius * 0.3, radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [element]);

  if (!element) return null;

  const categoryColor = CATEGORY_COLORS[element.category] || '#38bdf8';
  const categoryName = CATEGORY_NAMES[element.category] || element.category;

  return (
    <Dialog
      open={Boolean(element)}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 3,
          bgcolor: 'background.paper',
          p: { xs: 2.5, sm: 3.5 },
          position: 'relative',
          overflowY: 'auto',
          maxHeight: '90vh',
        },
      }}
    >
      {/* Close button */}
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', top: 16, right: 16, color: 'text.secondary' }}
      >
        <CloseRoundedIcon />
      </IconButton>

      {/* Header Info */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 3 }}>
        {/* Left: 3D Atom Canvas */}
        <Box
          sx={{
            width: { xs: '100%', sm: 260 },
            height: 240,
            bgcolor: '#090d16',
            borderRadius: 2.5,
            border: '1.5px solid rgba(255, 255, 255, 0.1)',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <canvas
            ref={canvasRef}
            width={260}
            height={240}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Symbol Overlay badge */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              bgcolor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              px: 1.5,
              py: 0.5,
              borderRadius: 1.5,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: categoryColor,
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#fff' }}>
              No.{element.atomicNumber} {element.symbol}
            </Typography>
          </Box>
        </Box>

        {/* Right: Core Element Attributes */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={categoryName}
              size="small"
              sx={{
                bgcolor: `${categoryColor}22`,
                color: categoryColor,
                borderColor: `${categoryColor}55`,
                fontWeight: 800,
                border: '1px solid',
              }}
            />
            <Chip
              label={`${element.period}주기 · ${element.group}족`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={`최대 ${element.maxBonds}결합`}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Box>

          <Box>
            <Typography variant="h4" sx={{ fontWeight: 900, color: 'text.primary' }}>
              {element.nameKo} ({element.nameEn})
            </Typography>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              전자배치: <code>{element.electronConfiguration}</code>
            </Typography>
          </Box>

          {/* Quick Metrics Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 1.5,
              bgcolor: 'background.neutral',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                표준 원자량
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {element.atomicMass} u
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                전기음성도 (Pauling)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {element.electronegativity ?? '해당 없음'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                녹는점 / 끓는점
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {element.meltingPoint ? `${element.meltingPoint} K` : '-'} /{' '}
                {element.boilingPoint ? `${element.boilingPoint} K` : '-'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                밀도
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                {element.density ? `${element.density} g/cm³` : '-'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Description & Real Life Use */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}>
            📖 원소 개요 및 특성
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {element.description}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'success.dark' }}>
            💡 실생활 및 산업적 활용
          </Typography>
          <Typography variant="body2" sx={{ color: 'success.darker', lineHeight: 1.6 }}>
            {element.realLifeUse}
          </Typography>
        </Box>
      </Box>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
        }}
      >
        {onNavigateToMoleculeBuilder && (
          <Button
            variant="outlined"
            color="primary"
            startIcon={<BiotechRoundedIcon />}
            onClick={() => {
              onNavigateToMoleculeBuilder(element.symbol);
              onClose();
            }}
            sx={{ fontWeight: 800 }}
          >
            {element.symbol} 분자 조립기로 보내기
          </Button>
        )}

        {onNavigateToAtomBuilder && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<ScienceRoundedIcon />}
            onClick={() => {
              onNavigateToAtomBuilder(element.atomicNumber);
              onClose();
            }}
            sx={{ fontWeight: 800 }}
          >
            3D 원소 빌더에서 탐구하기
          </Button>
        )}

        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ fontWeight: 700 }}>
          닫기
        </Button>
      </Box>
    </Dialog>
  );
}
