'use client';

import type { AreaCalculationType } from '../types';

import React, { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { normalPdf, normalCdf, NORMAL_PRESETS, calculateZScore } from '../utils/gaussian-math';

// ----------------------------------------------------------------------

export function NormalCalcPanel() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Normal Parameters
  const [mean, setMean] = useState<number>(100);
  const [stdDev, setStdDev] = useState<number>(15);
  const [calcType, setCalcType] = useState<AreaCalculationType>('between');
  const [lowerBound, setLowerBound] = useState<number>(85);
  const [upperBound, setUpperBound] = useState<number>(115);
  const [sigmaK, setSigmaK] = useState<number>(1);
  const [showCdf, setShowCdf] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iq-score');

  // Handle Preset selection
  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = NORMAL_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setMean(preset.mean);
      setStdDev(preset.stdDev);
      setLowerBound(preset.lowerBound);
      setUpperBound(preset.upperBound);
      setCalcType('between');
    }
  };

  // Probability calculations
  const { probability, zLower, zUpper } = useMemo(() => {
    const s = Math.max(0.0001, stdDev);
    let p = 0;
    let zl = calculateZScore(lowerBound, mean, s);
    let zu = calculateZScore(upperBound, mean, s);

    if (calcType === 'lessThan') {
      p = normalCdf(upperBound, mean, s);
      zl = -Infinity;
      zu = calculateZScore(upperBound, mean, s);
    } else if (calcType === 'greaterThan') {
      p = 1 - normalCdf(lowerBound, mean, s);
      zl = calculateZScore(lowerBound, mean, s);
      zu = Infinity;
    } else if (calcType === 'between') {
      const pLow = normalCdf(Math.min(lowerBound, upperBound), mean, s);
      const pHigh = normalCdf(Math.max(lowerBound, upperBound), mean, s);
      p = pHigh - pLow;
      zl = calculateZScore(Math.min(lowerBound, upperBound), mean, s);
      zu = calculateZScore(Math.max(lowerBound, upperBound), mean, s);
    } else if (calcType === 'outside') {
      const pLow = normalCdf(Math.min(lowerBound, upperBound), mean, s);
      const pHigh = normalCdf(Math.max(lowerBound, upperBound), mean, s);
      p = pLow + (1 - pHigh);
      zl = calculateZScore(Math.min(lowerBound, upperBound), mean, s);
      zu = calculateZScore(Math.max(lowerBound, upperBound), mean, s);
    } else if (calcType === 'sigmaRule') {
      const low = mean - sigmaK * s;
      const high = mean + sigmaK * s;
      p = normalCdf(high, mean, s) - normalCdf(low, mean, s);
      zl = -sigmaK;
      zu = sigmaK;
    }

    return {
      probability: Math.max(0, Math.min(1, p)),
      zLower: zl,
      zUpper: zu,
    };
  }, [mean, stdDev, calcType, lowerBound, upperBound, sigmaK]);

  // Render Interactive Curve on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const margin = { top: 30, right: 35, bottom: 65, left: 55 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const s = Math.max(0.0001, stdDev);
    const xMin = mean - 4 * s;
    const xMax = mean + 4 * s;
    const xRange = xMax - xMin;

    const maxPdf = normalPdf(mean, mean, s);
    const yMax = maxPdf * 1.15;

    // 1. Grid Lines
    if (showGrid) {
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;

      for (let k = -3; k <= 3; k += 1) {
        const xVal = mean + k * s;
        const px = margin.left + ((xVal - xMin) / xRange) * plotW;
        ctx.beginPath();
        ctx.moveTo(px, margin.top);
        ctx.lineTo(px, margin.top + plotH);
        ctx.stroke();
      }

      for (let row = 1; row <= 4; row += 1) {
        const py = margin.top + (row / 5) * plotH;
        ctx.beginPath();
        ctx.moveTo(margin.left, py);
        ctx.lineTo(margin.left + plotW, py);
        ctx.stroke();
      }
    }

    const toPx = (x: number) => margin.left + ((x - xMin) / xRange) * plotW;
    const toPy = (y: number) => margin.top + plotH - (y / yMax) * plotH;

    // 2. Shaded Integration Area
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.beginPath();

    const lowX = calcType === 'sigmaRule' ? mean - sigmaK * s : Math.min(lowerBound, upperBound);
    const highX = calcType === 'sigmaRule' ? mean + sigmaK * s : Math.max(lowerBound, upperBound);

    const steps = 300;
    let started = false;

    for (let i = 0; i <= steps; i += 1) {
      const xVal = xMin + (i / steps) * xRange;
      let inRegion = false;

      if (calcType === 'lessThan') {
        inRegion = xVal <= upperBound;
      } else if (calcType === 'greaterThan') {
        inRegion = xVal >= lowerBound;
      } else if (calcType === 'between' || calcType === 'sigmaRule') {
        inRegion = xVal >= lowX && xVal <= highX;
      } else if (calcType === 'outside') {
        inRegion = xVal <= lowX || xVal >= highX;
      }

      const px = toPx(xVal);
      const py = toPy(normalPdf(xVal, mean, s));

      if (inRegion) {
        if (!started) {
          ctx.moveTo(px, margin.top + plotH);
          ctx.lineTo(px, py);
          started = true;
        } else {
          ctx.lineTo(px, py);
        }
      } else if (started && calcType !== 'outside') {
        ctx.lineTo(px, margin.top + plotH);
        started = false;
      }
    }

    if (started) {
      ctx.lineTo(toPx(xMax), margin.top + plotH);
    }
    ctx.closePath();
    ctx.fill();

    // 3. Draw Normal PDF Bell Curve
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 3;

    for (let i = 0; i <= steps; i += 1) {
      const xVal = xMin + (i / steps) * xRange;
      const px = toPx(xVal);
      const py = toPy(normalPdf(xVal, mean, s));
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // 4. Optional CDF Curve
    if (showCdf) {
      ctx.beginPath();
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);

      for (let i = 0; i <= steps; i += 1) {
        const xVal = xMin + (i / steps) * xRange;
        const px = toPx(xVal);
        const cdfVal = normalCdf(xVal, mean, s);
        const py = margin.top + plotH - cdfVal * plotH;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 5. Mean line marker
    const meanPx = toPx(mean);
    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    ctx.moveTo(meanPx, margin.top);
    ctx.lineTo(meanPx, margin.top + plotH);
    ctx.stroke();
    ctx.setLineDash([]);

    // 6. Lower / Upper Bound Vertical Markers
    if (
      calcType === 'lessThan' ||
      calcType === 'between' ||
      calcType === 'outside' ||
      calcType === 'sigmaRule'
    ) {
      const upPx = toPx(calcType === 'sigmaRule' ? mean + sigmaK * s : upperBound);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(upPx, margin.top + 10);
      ctx.lineTo(upPx, margin.top + plotH);
      ctx.stroke();
    }
    if (
      calcType === 'greaterThan' ||
      calcType === 'between' ||
      calcType === 'outside' ||
      calcType === 'sigmaRule'
    ) {
      const lowPx = toPx(calcType === 'sigmaRule' ? mean - sigmaK * s : lowerBound);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(lowPx, margin.top + 10);
      ctx.lineTo(lowPx, margin.top + plotH);
      ctx.stroke();
    }

    // 7. Axes & Labels
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // X Axis
    ctx.moveTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    // Y Axis
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left + plotH, margin.top + plotH);
    ctx.stroke();

    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';

    for (let k = -3; k <= 3; k += 1) {
      const xVal = mean + k * s;
      const px = toPx(xVal);

      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(xVal % 1 === 0 ? xVal.toString() : xVal.toFixed(1), px, margin.top + plotH + 16);

      ctx.fillStyle = '#64748B';
      const zLabel = k === 0 ? 'μ (0)' : k > 0 ? `+${k}σ` : `${k}σ`;
      ctx.fillText(zLabel, px, margin.top + plotH + 32);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '데이터 값 (X) / 표준화 Z-Score',
      margin.left + plotW / 2,
      margin.top + plotH + 50
    );

    ctx.textAlign = 'left';
    ctx.fillStyle = '#38BDF8';
    ctx.fillText('── 확률밀도함수 (PDF)', margin.left + 10, margin.top + 15);

    if (showCdf) {
      ctx.fillStyle = '#EC4899';
      ctx.fillText('⋯⋯ 누적분포함수 (CDF)', margin.left + 160, margin.top + 15);
    }
  }, [mean, stdDev, calcType, lowerBound, upperBound, sigmaK, showCdf, showGrid]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Presets Toolbar */}
      <Card sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <AutoAwesomeRoundedIcon fontSize="small" color="primary" />
            실생활 정규분포 프리셋:
          </Typography>
          {NORMAL_PRESETS.map((preset) => (
            <Chip
              key={preset.id}
              label={preset.title}
              clickable
              color={selectedPresetId === preset.id ? 'primary' : 'default'}
              variant={selectedPresetId === preset.id ? 'filled' : 'outlined'}
              onClick={() => handleSelectPreset(preset.id)}
            />
          ))}
        </Box>
      </Card>

      {/* 2. Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas Curve & Probability Banner */}
        <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                가우스 정규분포 곡선 및 면적 적분 (PDF Explorer)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                N(μ = {mean}, σ = {stdDev})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showCdf}
                    onChange={(e) => setShowCdf(e.target.checked)}
                  />
                }
                label={<Typography variant="caption">누적 CDF 보기</Typography>}
              />
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                  />
                }
                label={<Typography variant="caption">격자선</Typography>}
              />
            </Box>
          </Box>

          {/* Canvas */}
          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              mb: 2.5,
            }}
          >
            <canvas
              ref={canvasRef}
              width={680}
              height={320}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Probability Result Banner */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: 2,
              borderColor: 'primary.main',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  구간 적분 확률 (Probability / Area)
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {(probability * 100).toFixed(4)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  소수점 값: <b>{probability.toFixed(6)}</b>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  📊 표준화 Z-점수 (Z-Score):
                </Typography>
                {calcType === 'lessThan' && (
                  <Typography variant="caption">
                    Z ≤ <b>{zUpper.toFixed(3)}</b> (하위 {(probability * 100).toFixed(2)}%)
                  </Typography>
                )}
                {calcType === 'greaterThan' && (
                  <Typography variant="caption">
                    Z ≥ <b>{zLower.toFixed(3)}</b> (상위 {(probability * 100).toFixed(2)}%)
                  </Typography>
                )}
                {(calcType === 'between' || calcType === 'sigmaRule') && (
                  <Typography variant="caption">
                    <b>{zLower.toFixed(3)}</b> ≤ Z ≤ <b>{zUpper.toFixed(3)}</b>
                  </Typography>
                )}
                {calcType === 'outside' && (
                  <Typography variant="caption">
                    Z &lt; <b>{zLower.toFixed(3)}</b> 또는 Z &gt; <b>{zUpper.toFixed(3)}</b>
                  </Typography>
                )}
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  공식: Z = (X - μ) / σ = (X - {mean}) / {stdDev}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Card>

        {/* Right: Parameter Controls & Area Selector */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 1. Distribution Parameter Card */}
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              모수 조절 (Parameters)
            </Typography>

            {/* Mean Slider & Input */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  평균 (μ - Center): {mean}
                </Typography>
              </Box>
              <Slider
                value={mean}
                min={0}
                max={200}
                step={0.5}
                onChange={(_, val) => setMean(val as number)}
              />
            </Box>

            {/* StdDev Slider & Input */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  표준편차 (σ - Spread): {stdDev}
                </Typography>
              </Box>
              <Slider
                value={stdDev}
                min={1}
                max={50}
                step={0.5}
                onChange={(_, val) => setStdDev(val as number)}
              />
            </Box>
          </Card>

          {/* 2. Calculation Mode Card */}
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              확률 구간 계산 유형
            </Typography>

            <FormControl component="fieldset" fullWidth sx={{ mb: 2 }}>
              <RadioGroup
                value={calcType}
                onChange={(e) => setCalcType(e.target.value as AreaCalculationType)}
              >
                <FormControlLabel
                  value="between"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">사이 구간: P(a ≤ X ≤ b)</Typography>}
                />
                <FormControlLabel
                  value="lessThan"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">좌측 꼬리 / 백분위: P(X ≤ b)</Typography>}
                />
                <FormControlLabel
                  value="greaterThan"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">우측 꼬리 / 상위: P(X ≥ a)</Typography>}
                />
                <FormControlLabel
                  value="sigmaRule"
                  control={<Radio size="small" />}
                  label={<Typography variant="body2">경험적 규칙: P(|X-μ| ≤ kσ)</Typography>}
                />
                <FormControlLabel
                  value="outside"
                  control={<Radio size="small" />}
                  label={
                    <Typography variant="body2">
                      양측 꼬리 / 기각역: P(X &lt; a or X &gt; b)
                    </Typography>
                  }
                />
              </RadioGroup>
            </FormControl>

            {/* Specific Inputs based on calcType */}
            {calcType === 'sigmaRule' ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {[1, 2, 3].map((k) => (
                  <Button
                    key={k}
                    fullWidth
                    variant={sigmaK === k ? 'contained' : 'outlined'}
                    onClick={() => setSigmaK(k)}
                    size="small"
                  >
                    ±{k}σ ({k === 1 ? '68.27%' : k === 2 ? '95.45%' : '99.73%'})
                  </Button>
                ))}
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                {(calcType === 'between' ||
                  calcType === 'greaterThan' ||
                  calcType === 'outside') && (
                  <TextField
                    label="하한값 (a)"
                    type="number"
                    size="small"
                    value={lowerBound}
                    onChange={(e) => setLowerBound(Number(e.target.value))}
                  />
                )}
                {(calcType === 'between' || calcType === 'lessThan' || calcType === 'outside') && (
                  <TextField
                    label="상한값 (b)"
                    type="number"
                    size="small"
                    value={upperBound}
                    onChange={(e) => setUpperBound(Number(e.target.value))}
                  />
                )}
              </Box>
            )}
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
