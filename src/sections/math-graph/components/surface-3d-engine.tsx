'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Slider from '@mui/material/Slider';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ThreeDRotationRoundedIcon from '@mui/icons-material/ThreeDRotationRounded';

import { createMathEvaluator } from '../utils/math-eval';
import { downloadCanvas } from '../utils/export-helpers';

// ----------------------------------------------------------------------

type ColorMapType = 'viridis' | 'plasma' | 'coolwarm' | 'rainbow' | 'ocean' | 'fire';

interface Surface3DEngineProps {
  initialFormula?: string;
}

export function Surface3DEngine({
  initialFormula = 'sin(sqrt(x*x + y*y)) / (sqrt(x*x + y*y) + 0.0001)',
}: Surface3DEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [formula, setFormula] = useState<string>(initialFormula);
  const [gridSize, setGridSize] = useState<number>(36);
  const [xyRange, setXyRange] = useState<number>(5);
  const [colorMap, setColorMap] = useState<ColorMapType>('viridis');
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [showContours, setShowContours] = useState<boolean>(true);

  // Rotation angles (degrees)
  const [rotX, setRotX] = useState<number>(35);
  const [rotY, setRotY] = useState<number>(45);
  const [zoom, setZoom] = useState<number>(1.2);

  // Time evolution animation
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [time, setTime] = useState<number>(0);
  const animReqRef = useRef<number | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Colormap generator helper
  const getColor = (t: number, cmap: ColorMapType): string => {
    // clamp t between 0 and 1
    const val = Math.max(0, Math.min(1, t));

    if (cmap === 'viridis') {
      const r = Math.round(255 * (0.2 + 0.8 * Math.pow(val, 2)));
      const g = Math.round(255 * (0.1 + 0.9 * Math.sin(val * Math.PI)));
      const b = Math.round(255 * (0.5 + 0.5 * Math.cos(val * Math.PI)));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (cmap === 'plasma') {
      const r = Math.round(255 * Math.sin(val * Math.PI * 0.8));
      const g = Math.round(255 * Math.pow(val, 3));
      const b = Math.round(255 * (0.9 - 0.7 * val));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (cmap === 'coolwarm') {
      const r = Math.round(255 * val);
      const g = Math.round(255 * (1 - Math.abs(val - 0.5) * 1.5));
      const b = Math.round(255 * (1 - val));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (cmap === 'fire') {
      const r = Math.round(255 * Math.min(1, val * 1.5));
      const g = Math.round(255 * Math.max(0, val * 1.5 - 0.5));
      const b = Math.round(255 * Math.max(0, val * 3 - 2));
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (cmap === 'ocean') {
      const r = Math.round(255 * (0.1 * val));
      const g = Math.round(255 * (0.3 + 0.7 * val));
      const b = Math.round(255 * (0.6 + 0.4 * val));
      return `rgb(${r}, ${g}, ${b})`;
    }
    // Rainbow
    const h = (1 - val) * 240;
    return `hsl(${h}, 90%, 50%)`;
  };

  // Main 3D Render Loop
  const render3D = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const evaluator = createMathEvaluator(formula);

    // Compute grid vertex points
    const N = gridSize;
    const range = xyRange;
    const step = (range * 2) / N;

    interface Point3D {
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;
      depth: number;
    }

    const grid: Point3D[][] = [];
    let minZ = Infinity;
    let maxZ = -Infinity;

    // 3D Projection math
    const radX = (rotX * Math.PI) / 180;
    const radY = (rotY * Math.PI) / 180;
    const cosX = Math.cos(radX);
    const sinX = Math.sin(radX);
    const cosY = Math.cos(radY);
    const sinY = Math.sin(radY);

    const scale = (Math.min(width, height) / (range * 3.5)) * zoom;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i <= N; i++) {
      grid[i] = [];
      const x = -range + i * step;
      for (let j = 0; j <= N; j++) {
        const y = -range + j * step;
        const z = evaluator(x, { y, t: time });

        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;

        // Rotate around Y axis then X axis
        const x1 = x * cosY + y * sinY;
        const y1 = -x * sinY + y * cosY;
        const z1 = z;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Orthographic/weak perspective projection
        const px = cx + x2 * scale;
        const py = cy - y2 * scale;

        grid[i][j] = {
          x,
          y,
          z,
          px,
          py,
          depth: z2,
        };
      }
    }

    const zSpan = maxZ === minZ ? 1 : maxZ - minZ;

    // Build Polygons for painter's depth sort
    interface PolygonFace {
      p0: Point3D;
      p1: Point3D;
      p2: Point3D;
      p3: Point3D;
      avgZ: number;
      avgDepth: number;
    }

    const faces: PolygonFace[] = [];
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        const p00 = grid[i][j];
        const p10 = grid[i + 1][j];
        const p11 = grid[i + 1][j + 1];
        const p01 = grid[i][j + 1];

        const avgDepth = (p00.depth + p10.depth + p11.depth + p01.depth) / 4;
        const avgZ = (p00.z + p10.z + p11.z + p01.z) / 4;

        faces.push({
          p0: p00,
          p1: p10,
          p2: p11,
          p3: p01,
          avgZ,
          avgDepth,
        });
      }
    }

    // Sort faces from farthest to nearest (Painters algorithm)
    faces.sort((a, b) => a.avgDepth - b.avgDepth);

    // Draw coordinate axes box
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;

    // Render faces
    faces.forEach((face) => {
      const normZ = (face.avgZ - minZ) / zSpan;
      const fillColor = getColor(normZ, colorMap);

      ctx.beginPath();
      ctx.moveTo(face.p0.px, face.p0.py);
      ctx.lineTo(face.p1.px, face.p1.py);
      ctx.lineTo(face.p2.px, face.p2.py);
      ctx.lineTo(face.p3.px, face.p3.py);
      ctx.closePath();

      // Shaded face fill
      ctx.fillStyle = fillColor;
      ctx.fill();

      // Wireframe overlay
      if (showWireframe) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      // Contour isoclines
      if (showContours) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 0.5;
        // Simple internal contour line
        ctx.beginPath();
        ctx.moveTo((face.p0.px + face.p1.px) / 2, (face.p0.py + face.p1.py) / 2);
        ctx.lineTo((face.p2.px + face.p3.px) / 2, (face.p2.py + face.p3.py) / 2);
        ctx.stroke();
      }
    });

    // Draw HUD text overlay
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '12px monospace';
    ctx.fillText(`z_min: ${minZ.toFixed(2)} | z_max: ${maxZ.toFixed(2)}`, 16, height - 20);
    ctx.fillText(`rotX: ${rotX}° | rotY: ${rotY}° | zoom: ${zoom.toFixed(2)}x`, 16, height - 36);
  }, [formula, gridSize, xyRange, colorMap, showWireframe, showContours, rotX, rotY, zoom, time]);

  // Animation frame loop
  useEffect(() => {
    if (isAnimating) {
      const tick = () => {
        setTime((prev) => prev + 0.05);
        animReqRef.current = requestAnimationFrame(tick);
      };
      animReqRef.current = requestAnimationFrame(tick);
    } else if (animReqRef.current) {
      cancelAnimationFrame(animReqRef.current);
      animReqRef.current = null;
    }
    return () => {
      if (animReqRef.current) cancelAnimationFrame(animReqRef.current);
    };
  }, [isAnimating]);

  // Sync canvas size and redraw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth || 700;
      canvas.height = Math.max(450, parent.clientHeight || 450);
    }
    render3D();
  }, [render3D]);

  // Mouse drag handlers for 3D rotation
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePosRef.current.x;
    const dy = e.clientY - lastMousePosRef.current.y;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };

    setRotY((prev) => (prev + dx * 0.7) % 360);
    setRotX((prev) => Math.max(-85, Math.min(85, prev + dy * 0.7)));
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((prev) => Math.max(0.3, Math.min(4.0, prev * factor)));
  };

  const handleResetView = () => {
    setRotX(35);
    setRotY(45);
    setZoom(1.2);
    setTime(0);
  };

  const handleCapture = () => {
    if (canvasRef.current) {
      downloadCanvas(canvasRef.current, '3d-surface-graph.png');
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
        minHeight: 560,
      }}
    >
      {/* 3D Formula Input and Controls */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
          mb: 1.5,
          flexWrap: 'wrap',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            minWidth: 160,
          }}
        >
          <ThreeDRotationRoundedIcon color="secondary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            3D 곡면 수식 z = f(x, y)
          </Typography>
        </Box>

        <TextField
          size="small"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          placeholder="예: sin(sqrt(x^2 + y^2)) / sqrt(x^2 + y^2), (x^2 - y^2)/4"
          sx={{ flexGrow: 1, minWidth: 240 }}
          slotProps={{
            input: {
              sx: { fontFamily: 'monospace', fontWeight: 600 },
            },
          }}
        />

        {/* Color Map Selector */}
        <Select
          size="small"
          value={colorMap}
          onChange={(e) => setColorMap(e.target.value as ColorMapType)}
          sx={{ minWidth: 120, height: 40 }}
        >
          <MenuItem value="viridis">Viridis</MenuItem>
          <MenuItem value="plasma">Plasma</MenuItem>
          <MenuItem value="coolwarm">Cool-Warm</MenuItem>
          <MenuItem value="fire">Fire Heat</MenuItem>
          <MenuItem value="ocean">Ocean</MenuItem>
          <MenuItem value="rainbow">Rainbow</MenuItem>
        </Select>

        {/* Animation Play/Pause */}
        <Button
          size="small"
          variant={isAnimating ? 'contained' : 'outlined'}
          color={isAnimating ? 'secondary' : 'primary'}
          startIcon={isAnimating ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          onClick={() => setIsAnimating((prev) => !prev)}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
        >
          {isAnimating ? '4D 파동 정지' : '4D 파동 재생 (t)'}
        </Button>

        <Tooltip title="시점 초기화" arrow>
          <IconButton size="small" onClick={handleResetView}>
            <RestartAltRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>

        <Button
          size="small"
          variant="contained"
          startIcon={<CameraAltRoundedIcon fontSize="small" />}
          onClick={handleCapture}
          sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
        >
          3D 캡처
        </Button>
      </Box>

      {/* Surface Settings Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          pb: 1.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showWireframe}
                onChange={(e) => setShowWireframe(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                와이어프레임
              </Typography>
            }
          />

          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showContours}
                onChange={(e) => setShowContours(e.target.checked)}
              />
            }
            label={
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                등고선 (Contours)
              </Typography>
            }
          />
        </Box>

        {/* Mesh Density Slider */}
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
            격자 해상도: {gridSize}x{gridSize}
          </Typography>
          <Slider
            size="small"
            value={gridSize}
            min={16}
            max={50}
            step={2}
            onChange={(_, val) => setGridSize(val as number)}
            sx={{ flexGrow: 1 }}
          />
        </Box>

        {/* Range Slider */}
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
            XY 범위: ±{xyRange}
          </Typography>
          <Slider
            size="small"
            value={xyRange}
            min={2}
            max={12}
            step={1}
            onChange={(_, val) => setXyRange(val as number)}
            sx={{ flexGrow: 1 }}
          />
        </Box>
      </Box>

      {/* 3D Canvas Rendering Area */}
      <Box
        sx={{
          flexGrow: 1,
          width: '100%',
          minHeight: 460,
          position: 'relative',
          borderRadius: 1.5,
          overflow: 'hidden',
          mt: 1.5,
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </Box>
    </Card>
  );
}
