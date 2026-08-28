'use client';

import type { PopulationType } from '../types';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

import {
  normalPdf,
  calculateMean,
  calculateStdDev,
  calculateSkewness,
  POPULATION_DEFINITIONS,
  calculateExcessKurtosis,
  drawSampleAndCalculateMean,
} from '../utils/gaussian-math';

// ----------------------------------------------------------------------

const SAMPLE_SIZES = [1, 2, 5, 10, 30, 50, 100];

export function CltSimulator() {
  const [popType, setPopType] = useState<PopulationType>('uniform');
  const [sampleSize, setSampleSize] = useState<number>(30); // n
  const [sampleMeans, setSampleMeans] = useState<number[]>([]);
  const [latestSampleValues, setLatestSampleValues] = useState<number[]>([]);
  const [isAutoRunning, setIsAutoRunning] = useState<boolean>(false);

  const histCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const popCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const popInfo = POPULATION_DEFINITIONS[popType];

  // Draw batch of samples
  const handleDrawSamples = useCallback(
    (count: number) => {
      const newMeans: number[] = [];
      let lastSample: number[] = [];

      for (let i = 0; i < count; i += 1) {
        const { sampleValues, sampleMean } = drawSampleAndCalculateMean(popType, sampleSize);
        newMeans.push(sampleMean);
        if (i === count - 1) {
          lastSample = sampleValues;
        }
      }

      setSampleMeans((prev) => [...prev, ...newMeans]);
      if (lastSample.length > 0) {
        setLatestSampleValues(lastSample);
      }
    },
    [popType, sampleSize]
  );

  // Reset samples
  const handleReset = useCallback(() => {
    setIsAutoRunning(false);
    setSampleMeans([]);
    setLatestSampleValues([]);
  }, []);

  // Handle auto running
  useEffect(() => {
    if (isAutoRunning) {
      autoIntervalRef.current = setInterval(() => {
        handleDrawSamples(5);
      }, 100);
    } else if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
    }
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [isAutoRunning, handleDrawSamples]);

  // When population type or sample size changes, reset samples
  useEffect(() => {
    handleReset();
  }, [popType, sampleSize, handleReset]);

  // Statistics of accumulated sample means
  const stats = useMemo(() => {
    if (sampleMeans.length === 0) {
      return {
        count: 0,
        meanOfMeans: 0,
        stdError: 0,
        skewness: 0,
        kurtosis: 0,
      };
    }
    return {
      count: sampleMeans.length,
      meanOfMeans: calculateMean(sampleMeans),
      stdError: calculateStdDev(sampleMeans, true),
      skewness: calculateSkewness(sampleMeans),
      kurtosis: calculateExcessKurtosis(sampleMeans),
    };
  }, [sampleMeans]);

  const theoMean = popInfo.theoreticalMean;
  const theoStdError = popInfo.theoreticalStdDev / Math.sqrt(sampleSize);

  // Render Population Canvas
  useEffect(() => {
    const canvas = popCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;

    const margin = 20;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;

    ctx.beginPath();
    ctx.moveTo(margin, height - margin);

    const steps = 100;
    for (let i = 0; i <= steps; i += 1) {
      const xVal = (i / steps) * 100;
      let density = 0;

      if (popType === 'uniform') {
        density = 0.01;
      } else if (popType === 'exponential') {
        density = 0.04 * Math.exp(-0.04 * xVal);
      } else if (popType === 'bernoulli') {
        density = xVal < 5 || xVal > 95 ? 0.05 : 0.001;
      } else if (popType === 'dice') {
        const dVal = (xVal / 100) * 6;
        density = dVal >= 0.5 && dVal <= 6.5 ? 1 / 6 : 0;
      } else if (popType === 'bimodal') {
        density = 0.5 * normalPdf(xVal, 25, 8) + 0.5 * normalPdf(xVal, 75, 8);
      } else if (popType === 'u-shaped') {
        const uVal = xVal / 100;
        density =
          uVal > 0.01 && uVal < 0.99 ? 1 / (Math.PI * Math.sqrt(uVal * (1 - uVal)) * 100) : 0.05;
      }

      const maxD = popType === 'exponential' ? 0.04 : popType === 'bimodal' ? 0.03 : 0.015;
      const py = height - margin - Math.min(plotH, (density / maxD) * plotH * 0.85);
      const px = margin + (i / steps) * plotW;

      ctx.lineTo(px, py);
    }

    ctx.lineTo(width - margin, height - margin);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Axis line
    ctx.strokeStyle = '#64748B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    // Mean Marker
    const meanPx = margin + (theoMean / (popType === 'dice' ? 7 : 100)) * plotW;
    ctx.strokeStyle = '#EF4444';
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(meanPx, margin);
    ctx.lineTo(meanPx, height - margin);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#EF4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`μ = ${theoMean.toFixed(1)}`, meanPx + 4, margin + 12);
  }, [popType, theoMean]);

  // Render Histogram Canvas of Sample Means
  useEffect(() => {
    const canvas = histCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const margin = 30;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;

    const isDice = popType === 'dice';
    const domainMin = isDice ? 1 : 0;
    const domainMax = isDice ? 6 : 100;
    const domainRange = domainMax - domainMin;

    const numBins = 40;
    const binWidth = domainRange / numBins;
    const bins = new Array(numBins).fill(0);

    sampleMeans.forEach((val) => {
      const idx = Math.min(numBins - 1, Math.max(0, Math.floor((val - domainMin) / binWidth)));
      bins[idx] += 1;
    });

    const maxBinCount = Math.max(1, ...bins);

    // Draw Histogram Bars
    bins.forEach((count, i) => {
      if (count === 0) return;
      const bx = margin + (i / numBins) * plotW;
      const bw = plotW / numBins;
      const barH = (count / (maxBinCount * 1.15)) * plotH;
      const by = height - margin - barH;

      const gradient = ctx.createLinearGradient(0, by, 0, height - margin);
      gradient.addColorStop(0, '#10B981');
      gradient.addColorStop(1, '#065F46');

      ctx.fillStyle = gradient;
      ctx.fillRect(bx + 1, by, Math.max(1, bw - 2), barH);
    });

    // Draw Theoretical Normal Distribution Curve N(mu, sigma^2/n)
    if (sampleMeans.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;

      const curveSteps = 150;
      for (let i = 0; i <= curveSteps; i += 1) {
        const xVal = domainMin + (i / curveSteps) * domainRange;
        const px = margin + (i / curveSteps) * plotW;

        const pdfVal = normalPdf(xVal, theoMean, theoStdError);
        const expCount = pdfVal * binWidth * sampleMeans.length;
        const py = height - margin - Math.min(plotH, (expCount / (maxBinCount * 1.15)) * plotH);

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    }

    // Grid & Axis labels
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    for (let step = 0; step <= 5; step += 1) {
      const val = domainMin + (step / 5) * domainRange;
      const lx = margin + (step / 5) * plotW;
      ctx.fillText(val.toFixed(0), lx, height - 12);
    }
  }, [sampleMeans, popType, theoMean, theoStdError]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Top Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.5fr 2fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Population Selector */}
          <FormControl fullWidth size="small">
            <InputLabel id="pop-select-label">모집단 원래 분포 선택</InputLabel>
            <Select
              labelId="pop-select-label"
              value={popType}
              label="모집단 원래 분포 선택"
              onChange={(e) => setPopType(e.target.value as PopulationType)}
            >
              <MenuItem value="uniform">1. 균등 분포 (Uniform)</MenuItem>
              <MenuItem value="exponential">2. 지수 분포 (Exponential - 극심한 우측 꼬리)</MenuItem>
              <MenuItem value="bernoulli">3. 베르누이 (동전 던지기 0 or 100)</MenuItem>
              <MenuItem value="bimodal">4. 쌍봉 분포 (Bimodal - 2개 집단 혼합)</MenuItem>
              <MenuItem value="u-shaped">5. U자형 분포 (U-shaped)</MenuItem>
              <MenuItem value="dice">6. 주사위 눈금 분포 (1~6)</MenuItem>
            </Select>
          </FormControl>

          {/* Sample Size (n) Selector */}
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                표본 크기 (n): {sampleSize}개씩 추출
              </Typography>
              <Chip
                size="small"
                label={sampleSize >= 30 ? '대규모 표본 (CLT 성립)' : '소규모 표본'}
                color={sampleSize >= 30 ? 'success' : 'warning'}
              />
            </Box>
            <Slider
              value={sampleSize}
              min={1}
              max={100}
              step={null}
              marks={SAMPLE_SIZES.map((n) => ({ value: n, label: `n=${n}` }))}
              onChange={(_, val) => setSampleSize(val as number)}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CasinoRoundedIcon />}
              onClick={() => handleDrawSamples(1)}
            >
              1회 추출
            </Button>

            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDrawSamples(100)}
            >
              +100회
            </Button>

            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleDrawSamples(1000)}
            >
              +1,000회 고속
            </Button>

            <Button
              variant={isAutoRunning ? 'outlined' : 'contained'}
              color={isAutoRunning ? 'warning' : 'success'}
              size="small"
              startIcon={isAutoRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setIsAutoRunning((prev) => !prev)}
            >
              {isAutoRunning ? '중지' : '연속 자동'}
            </Button>

            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleReset}
            >
              초기화
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. Visualizations Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left Side: Population & Recent Sample */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* 1. Population Shape Card */}
          <Card sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
              ① 모집단 원래 분포 형태 (Population)
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}
            >
              {popInfo.description}
            </Typography>

            <Box
              sx={{
                borderRadius: 1.5,
                overflow: 'hidden',
                border: 1,
                borderColor: 'divider',
                mb: 1.5,
              }}
            >
              <canvas
                ref={popCanvasRef}
                width={340}
                height={140}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                bgcolor: 'background.neutral',
                p: 1,
                borderRadius: 1,
              }}
            >
              <Typography variant="caption">
                모평균(μ): <b>{popInfo.theoreticalMean.toFixed(2)}</b>
              </Typography>
              <Typography variant="caption">
                모표준편차(σ): <b>{popInfo.theoreticalStdDev.toFixed(2)}</b>
              </Typography>
            </Box>
          </Card>

          {/* 2. Currently Drawn Sample View */}
          <Card sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5, color: 'info.main' }}>
              ② 최근 1회 추출된 표본 데이터 (n={sampleSize})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
              표본평균(X̄):{' '}
              <b style={{ color: '#0284C7' }}>
                {latestSampleValues.length > 0
                  ? (
                      latestSampleValues.reduce((a, b) => a + b, 0) / latestSampleValues.length
                    ).toFixed(2)
                  : '-'}
              </b>
            </Typography>

            <Box
              sx={{
                maxHeight: 120,
                overflowY: 'auto',
                p: 1,
                bgcolor: 'background.neutral',
                borderRadius: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
              }}
            >
              {latestSampleValues.length === 0 ? (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  추출 버튼을 눌러 표본을 뽑아보세요.
                </Typography>
              ) : (
                latestSampleValues.map((v, i) => (
                  <Chip
                    key={i}
                    size="small"
                    label={v.toFixed(1)}
                    sx={{ fontSize: '0.65rem', height: 20 }}
                  />
                ))
              )}
            </Box>
          </Card>
        </Box>

        {/* Right Side: Sample Means Histogram & CLT Proof */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main' }}>
                ③ 표본평균들의 분포 (Sampling Distribution of Means)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                누적 추출 횟수: <b>{stats.count.toLocaleString()}회</b> | 녹색 막대: 실측
                히스토그램, 주황 실선: 이론적 정규분포 N(μ, σ²/n)
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              borderRadius: 1.5,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <canvas
              ref={histCanvasRef}
              width={680}
              height={280}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Statistics Comparison Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
              gap: 1.5,
              mb: 2,
            }}
          >
            <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                표본평균의 평균 E(X̄)
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {stats.count > 0 ? stats.meanOfMeans.toFixed(2) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (이론값: {theoMean.toFixed(2)})
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                표준오차 SE(X̄) = σ/√n
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'info.main' }}>
                {stats.count > 0 ? stats.stdError.toFixed(2) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (이론값: {theoStdError.toFixed(2)})
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                왜도 (Skewness)
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: Math.abs(stats.skewness) < 0.2 ? 'success.main' : 'warning.main',
                }}
              >
                {stats.count > 3 ? stats.skewness.toFixed(3) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (정규분포 기준: 0)
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                초과 첨도 (Kurtosis)
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: Math.abs(stats.kurtosis) < 0.5 ? 'success.main' : 'warning.main',
                }}
              >
                {stats.count > 3 ? stats.kurtosis.toFixed(3) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (정규분포 기준: 0)
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              💡 <b>중심극한정리(CLT)의 핵심 증명</b>: 모집단이 지수분포나 U자형처럼 아무리
              비정규적이고 왜곡되어 있더라도, 표본 크기 n이 증가함에 따라 표본평균들의 분포는
              놀랍게도 좌우 대칭인 정규분포 N(μ, σ²/n)로 급격히 수렴하며 왜도와 첨도가 0에
              가까워집니다.
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
