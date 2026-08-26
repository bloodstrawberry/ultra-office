'use client';

import type { AtomNodeData } from '../chemistry/molecule-types';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useChemistryStore } from '../chemistry/use-chemistry-store';
import {
  ALL_ELEMENTS,
  CATEGORY_COLORS,
  getElementBySymbol,
  MAIN_BUILDER_ELEMENTS,
} from '../chemistry/elements-data';

// ----------------------------------------------------------------------

interface MoleculeBuilderPanelProps {
  onNavigateToCodex?: () => void;
}

export function MoleculeBuilderPanel({ onNavigateToCodex }: MoleculeBuilderPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const {
    atoms,
    bonds,
    selectedElement,
    selectedBondOrder,
    selectedAtomId,
    validationResult,
    discoveredModalMolecule,
    setSelectedElement,
    setSelectedBondOrder,
    setSelectedAtomId,
    addAtom,
    addOrToggleBond,
    clearCanvas,
    closeDiscoveryModal,
    loadPresetMolecule,
    loadProgress,
    loadCustomMolecules,
  } = useChemistryStore();

  const [showAllElementsModal, setShowAllElementsModal] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [presetSelection, setPresetSelection] = useState('h2o');

  // Camera & Interaction state
  const cameraRef = useRef<{
    rotX: number;
    rotY: number;
    zoom: number;
    isDragging: boolean;
    dragMode: 'rotate' | 'moveAtom';
    draggedAtomId: string | null;
    lastX: number;
    lastY: number;
  }>({
    rotX: 0.2,
    rotY: 0.4,
    zoom: 80,
    isDragging: false,
    dragMode: 'rotate',
    draggedAtomId: null,
    lastX: 0,
    lastY: 0,
  });

  useEffect(() => {
    loadProgress();
    loadCustomMolecules();
  }, [loadProgress, loadCustomMolecules]);

  // Main 3D Canvas Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const { rotX, rotY, zoom } = cameraRef.current;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project 3D atom positions to 2D screen space
      const projectedAtoms = atoms.map((atom) => {
        const [ax, ay, az] = atom.position;

        // Rotate Y
        const x1 = ax * cosY - az * sinY;
        const z1 = ax * sinY + az * cosY;

        // Rotate X
        const y2 = ay * cosX - z1 * sinX;
        const z2 = ay * sinX + z1 * cosX;

        const screenX = cx + x1 * zoom;
        const screenY = cy - y2 * zoom; // Invert Y for canvas coordinate system

        return {
          ...atom,
          screenX,
          screenY,
          depth: z2,
        };
      });

      const atomMap = new Map(projectedAtoms.map((a) => [a.id, a]));

      // 1. Draw Grid Plane
      ctx.save();
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 6;
      const gridStep = 1.2;
      for (let i = -gridSize; i <= gridSize; i += 1) {
        // Line along Z
        const p1x = i * gridStep * cosY - -gridSize * gridStep * sinY;
        const p1z = i * gridStep * sinY + -gridSize * gridStep * cosY;
        const p1y2 = -1.8 * cosX - p1z * sinX;

        const p2x = i * gridStep * cosY - gridSize * gridStep * sinY;
        const p2z = i * gridStep * sinY + gridSize * gridStep * cosY;
        const p2y2 = -1.8 * cosX - p2z * sinX;

        ctx.beginPath();
        ctx.moveTo(cx + p1x * zoom, cy - p1y2 * zoom);
        ctx.lineTo(cx + p2x * zoom, cy - p2y2 * zoom);
        ctx.stroke();
      }
      ctx.restore();

      // 2. Draw Bonds (Single, Double, Triple)
      bonds.forEach((bond) => {
        const a1 = atomMap.get(bond.atomA);
        const a2 = atomMap.get(bond.atomB);
        if (!a1 || !a2) return;

        const dx = a2.screenX - a1.screenX;
        const dy = a2.screenY - a1.screenY;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        const nx = -dy / len; // Normal vector
        const ny = dx / len;

        ctx.save();
        ctx.lineCap = 'round';

        if (bond.order === 1) {
          ctx.beginPath();
          ctx.moveTo(a1.screenX, a1.screenY);
          ctx.lineTo(a2.screenX, a2.screenY);
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 4;
          ctx.stroke();
        } else if (bond.order === 2) {
          const offset = 4;
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;

          ctx.beginPath();
          ctx.moveTo(a1.screenX + nx * offset, a1.screenY + ny * offset);
          ctx.lineTo(a2.screenX + nx * offset, a2.screenY + ny * offset);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(a1.screenX - nx * offset, a1.screenY - ny * offset);
          ctx.lineTo(a2.screenX - nx * offset, a2.screenY - ny * offset);
          ctx.stroke();
        } else if (bond.order === 3) {
          const offset = 5.5;
          ctx.strokeStyle = '#ec4899';
          ctx.lineWidth = 2.5;

          ctx.beginPath();
          ctx.moveTo(a1.screenX, a1.screenY);
          ctx.lineTo(a2.screenX, a2.screenY);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(a1.screenX + nx * offset, a1.screenY + ny * offset);
          ctx.lineTo(a2.screenX + nx * offset, a2.screenY + ny * offset);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(a1.screenX - nx * offset, a1.screenY - ny * offset);
          ctx.lineTo(a2.screenX - nx * offset, a2.screenY - ny * offset);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 3. Draw Atoms with Depth Sorting (Painter's algorithm)
      const sortedAtoms = [...projectedAtoms].sort((a, b) => a.depth - b.depth);

      sortedAtoms.forEach((atom) => {
        const elData = getElementBySymbol(atom.element);
        const baseColor = elData?.cpkColor || '#94a3b8';
        const isSelected = selectedAtomId === atom.id;

        const scale = Math.max(0.7, (atom.depth + 10) / 10);
        const radius = 22 * scale;

        ctx.save();

        // Selection glowing pulse ring
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(atom.screenX, atom.screenY, radius + 7, 0, Math.PI * 2);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(atom.screenX, atom.screenY, radius + 11, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Atom Sphere Body
        ctx.beginPath();
        ctx.arc(atom.screenX, atom.screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = baseColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        // 3D Specular Shiny Highlight
        ctx.beginPath();
        ctx.arc(
          atom.screenX - radius * 0.3,
          atom.screenY - radius * 0.3,
          radius * 0.35,
          0,
          Math.PI * 2
        );
        ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.fill();

        // Symbol Label badge
        ctx.fillStyle = '#0f172a';
        ctx.font = `bold ${Math.round(13 * scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.element, atom.screenX, atom.screenY);

        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [atoms, bonds, selectedAtomId]);

  // Find clicked atom by screen coordinate
  const findAtomAtScreen = (screenX: number, screenY: number): AtomNodeData | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const { rotX, rotY, zoom } = cameraRef.current;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    for (let i = atoms.length - 1; i >= 0; i -= 1) {
      const a = atoms[i];
      const [ax, ay, az] = a.position;
      const x1 = ax * cosY - az * sinY;
      const z1 = ax * sinY + az * cosY;
      const y2 = ay * cosX - z1 * sinX;
      const sx = cx + x1 * zoom;
      const sy = cy - y2 * zoom;

      if (Math.hypot(screenX - sx, screenY - sy) <= 26) {
        return a;
      }
    }
    return null;
  };

  // Mouse & Touch interaction handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedAtom = findAtomAtScreen(x, y);

    if (clickedAtom) {
      if (e.shiftKey) {
        // Drag to move atom
        cameraRef.current.dragMode = 'moveAtom';
        cameraRef.current.draggedAtomId = clickedAtom.id;
      } else {
        // Bond connect or select
        if (!selectedAtomId) {
          setSelectedAtomId(clickedAtom.id);
        } else if (selectedAtomId === clickedAtom.id) {
          setSelectedAtomId(null);
        } else {
          addOrToggleBond(selectedAtomId, clickedAtom.id);
        }
      }
    } else {
      setSelectedAtomId(null);
      cameraRef.current.dragMode = 'rotate';
    }

    cameraRef.current.isDragging = true;
    cameraRef.current.lastX = e.clientX;
    cameraRef.current.lastY = e.clientY;
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!cameraRef.current.isDragging) return;
    const dx = e.clientX - cameraRef.current.lastX;
    const dy = e.clientY - cameraRef.current.lastY;

    if (cameraRef.current.dragMode === 'rotate') {
      cameraRef.current.rotY += dx * 0.008;
      cameraRef.current.rotX += dy * 0.008;
    }

    cameraRef.current.lastX = e.clientX;
    cameraRef.current.lastY = e.clientY;
  };

  const handleCanvasMouseUp = () => {
    cameraRef.current.isDragging = false;
    cameraRef.current.draggedAtomId = null;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const newZoom = cameraRef.current.zoom - e.deltaY * 0.05;
    cameraRef.current.zoom = Math.max(30, Math.min(160, newZoom));
  };

  const filteredModalElements = ALL_ELEMENTS.filter(
    (el) =>
      !modalSearch.trim() ||
      el.symbol.toLowerCase().includes(modalSearch.toLowerCase()) ||
      el.nameKo.toLowerCase().includes(modalSearch.toLowerCase()) ||
      el.nameEn.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Top Controls Bar */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Status Indicator & Message */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor:
                validationResult.status === 'VALID'
                  ? 'success.main'
                  : validationResult.status === 'INVALID'
                    ? 'error.main'
                    : 'warning.main',
              boxShadow:
                validationResult.status === 'VALID' ? '0 0 10px rgba(34, 197, 94, 0.8)' : 'none',
              flexShrink: 0,
            }}
          />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 800,
              color:
                validationResult.status === 'VALID'
                  ? 'success.main'
                  : validationResult.status === 'INVALID'
                    ? 'error.main'
                    : 'text.primary',
            }}
          >
            {validationResult.message}
          </Typography>
        </Box>

        {/* Bond Order Selector & Canvas Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {/* Preset Selector */}
          <TextField
            select
            size="small"
            value={presetSelection}
            onChange={(e) => {
              const id = e.target.value;
              setPresetSelection(id);
              loadPresetMolecule(id);
            }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="h2o">💧 물 (H₂O)</MenuItem>
            <MenuItem value="co2">💨 이산화탄소 (CO₂)</MenuItem>
            <MenuItem value="ch4">🔥 메탄 (CH₄)</MenuItem>
            <MenuItem value="c2h5oh">🍷 에탄올 (C₂H₅OH)</MenuItem>
            <MenuItem value="c6h12o6">🍬 포도당 (C₆H₁₂O₆)</MenuItem>
          </TextField>

          {/* Single / Double / Triple Bond Toggle */}
          <ButtonGroup size="small" variant="outlined">
            <Button
              variant={selectedBondOrder === 1 ? 'contained' : 'outlined'}
              onClick={() => setSelectedBondOrder(1)}
              sx={{ fontWeight: 800 }}
            >
              단일(-)
            </Button>
            <Button
              variant={selectedBondOrder === 2 ? 'contained' : 'outlined'}
              onClick={() => setSelectedBondOrder(2)}
              sx={{ fontWeight: 800 }}
            >
              이중(=)
            </Button>
            <Button
              variant={selectedBondOrder === 3 ? 'contained' : 'outlined'}
              onClick={() => setSelectedBondOrder(3)}
              sx={{ fontWeight: 800 }}
            >
              삼중(≡)
            </Button>
          </ButtonGroup>

          <Button
            variant="outlined"
            color="error"
            size="small"
            startIcon={<DeleteSweepRoundedIcon />}
            onClick={clearCanvas}
            disabled={atoms.length === 0}
            sx={{ fontWeight: 800 }}
          >
            초기화
          </Button>
        </Box>
      </Card>

      {/* 2. Interactive 3D Canvas */}
      <Card
        sx={{
          height: { xs: 380, sm: 460 },
          bgcolor: '#070b14',
          border: '1.5px solid #1e293b',
          borderRadius: 2.5,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          width={760}
          height={460}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
          onWheel={handleWheel}
          style={{ width: '100%', height: '100%', cursor: 'crosshair' }}
        />

        {/* Guide overlay badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            px: 2,
            py: 1,
            borderRadius: 2,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="caption" sx={{ color: '#fff', fontWeight: 800, display: 'block' }}>
            💡 조립 안내: 원소 팔레트에서 원자를 추가하고, 원자 2개를 차례로 클릭해 결합선을
            연결하세요.
          </Typography>
        </Box>
      </Card>

      {/* 3. Element Palette Bar */}
      <Card sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
            원소 팔레트 (선택 시 조립 공간에 바로 추가됩니다):
          </Typography>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setShowAllElementsModal(true)}
            sx={{ fontWeight: 800 }}
          >
            118개 전체 원소
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
          {MAIN_BUILDER_ELEMENTS.map((sym) => {
            const el = getElementBySymbol(sym);
            if (!el) return null;
            const isSelected = selectedElement === sym;
            return (
              <Box
                key={sym}
                component="button"
                type="button"
                onClick={() => {
                  setSelectedElement(sym);
                  addAtom();
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.75,
                  py: 1,
                  borderRadius: 2,
                  bgcolor: isSelected ? 'primary.main' : 'background.neutral',
                  color: isSelected ? '#ffffff' : 'text.primary',
                  border: '1px solid',
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    bgcolor: el.cpkColor,
                    color: '#0f172a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '11px',
                  }}
                >
                  {sym}
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                    {el.nameKo}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: '9px',
                      color: isSelected ? 'rgba(255,255,255,0.8)' : 'text.secondary',
                    }}
                  >
                    최대 {el.maxBonds}결합
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Card>

      {/* 4. Molecule Discovery Celebration Modal */}
      {discoveredModalMolecule && (
        <Dialog
          open={Boolean(discoveredModalMolecule)}
          onClose={closeDiscoveryModal}
          maxWidth="xs"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              p: 3.5,
              textAlign: 'center',
              bgcolor: 'background.paper',
            },
          }}
        >
          <Typography variant="h3" sx={{ mb: 1 }}>
            🎉
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
            새로운 분자 발견!
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1 }}>
            {discoveredModalMolecule.formula}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
            {discoveredModalMolecule.nameKo} ({discoveredModalMolecule.nameEn})
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
            {discoveredModalMolecule.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={closeDiscoveryModal}
              sx={{ fontWeight: 800 }}
            >
              계속 조립하기
            </Button>
            {onNavigateToCodex && (
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  closeDiscoveryModal();
                  onNavigateToCodex();
                }}
                sx={{ fontWeight: 800 }}
              >
                도감에서 확인
              </Button>
            )}
          </Box>
        </Dialog>
      )}

      {/* 5. 118 Elements Modal */}
      <Dialog
        open={showAllElementsModal}
        onClose={() => setShowAllElementsModal(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 3,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            원소 선택하여 추가
          </Typography>
          <Button size="small" onClick={() => setShowAllElementsModal(false)}>
            닫기
          </Button>
        </Box>

        <TextField
          size="small"
          fullWidth
          placeholder="원소 검색..."
          value={modalSearch}
          onChange={(e) => setModalSearch(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: 1.5,
            overflowY: 'auto',
          }}
        >
          {filteredModalElements.map((el) => (
            <Card
              key={el.atomicNumber}
              variant="outlined"
              onClick={() => {
                setSelectedElement(el.symbol);
                addAtom();
                setShowAllElementsModal(false);
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                textAlign: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: CATEGORY_COLORS[el.category] || '#38bdf8',
                  color: '#0f172a',
                  mx: 'auto',
                  mb: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '12px',
                }}
              >
                {el.symbol}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                {el.nameKo}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '9px' }}>
                No.{el.atomicNumber}
              </Typography>
            </Card>
          ))}
        </Box>
      </Dialog>
    </Box>
  );
}
