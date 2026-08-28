'use client';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import {
  calculateMean,
  normalQuantile,
  calculateStdDev,
  calculateSkewness,
  boxMullerTransform,
  calculateExcessKurtosis,
} from '../utils/gaussian-math';

// ----------------------------------------------------------------------

type DataType = 'normal' | 'uniform' | 'exponential' | 'heavy-tail';

export function BoxMullerQqPanel() {
  const [dataType, setDataType] = useState<DataType>('normal');
  const sampleCount = 300;

  const bmUniformCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const bmNormalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const qqCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate dataset
  const [points, setPoints] = useState<{ u1: number; u2: number; z0: number; z1: number }[]>([]);
  const [sampleValues, setSampleValues] = useState<number[]>([]);

  const generateData = useCallback(() => {
    const newPoints: { u1: number; u2: number; z0: number; z1: number }[] = [];
    const values: number[] = [];

    for (let i = 0; i < sampleCount; i += 1) {
      const u1 = Math.max(1e-9, Math.random());
      const u2 = Math.random();
      const { z0, z1 } = boxMullerTransform(u1, u2);
      newPoints.push({ u1, u2, z0, z1 });

      if (dataType === 'normal') {
        values.push(z0);
      } else if (dataType === 'uniform') {
        values.push((Math.random() - 0.5) * 3.464);
      } else if (dataType === 'exponential') {
        values.push(-Math.log(Math.max(1e-9, Math.random())) - 1);
      } else if (dataType === 'heavy-tail') {
        const u = Math.random() - 0.5;
        const cauchy = Math.tan(u * Math.PI * 0.9);
        values.push(cauchy);
      }
    }

    setPoints(newPoints);
    setSampleValues(values);
  }, [dataType, sampleCount]);

  useEffect(() => {
    generateData();
  }, [generateData]);

  // Statistics of sample values
  const stats = useMemo(() => {
    if (sampleValues.length === 0) return { mean: 0, stdDev: 0, skewness: 0, kurtosis: 0 };
    return {
      mean: calculateMean(sampleValues),
      stdDev: calculateStdDev(sampleValues, true),
      skewness: calculateSkewness(sampleValues),
      kurtosis: calculateExcessKurtosis(sampleValues),
    };
  }, [sampleValues]);

  // Render Box-Muller 2D Transformation Canvas
  useEffect(() => {
    const uCanvas = bmUniformCanvasRef.current;
    if (uCanvas) {
      const ctx = uCanvas.getContext('2d');
      if (ctx) {
        const w = uCanvas.width;
        const h = uCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(20, 20, w - 40, h - 40);

        points.forEach((p) => {
          const px = 20 + p.u1 * (w - 40);
          const py = h - 20 - p.u2 * (h - 40);
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#38BDF8';
          ctx.fill();
        });
      }
    }

    const nCanvas = bmNormalCanvasRef.current;
    if (nCanvas) {
      const ctx = nCanvas.getContext('2d');
      if (ctx) {
        const w = nCanvas.width;
        const h = nCanvas.height;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;
        const scale = (w - 40) / 7;

        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, cy);
        ctx.lineTo(w - 20, cy);
        ctx.moveTo(cx, 20);
        ctx.lineTo(cx, h - 20);
        ctx.stroke();

        [1, 2, 3].forEach((r) => {
          ctx.beginPath();
          ctx.arc(cx, cy, r * scale, 0, Math.PI * 2);
          ctx.strokeStyle = '#334155';
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        });

        points.forEach((p) => {
          const px = cx + p.z0 * scale;
          const py = cy - p.z1 * scale;
          if (px >= 10 && px <= w - 10 && py >= 10 && py <= h - 10) {
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = '#EC4899';
            ctx.fill();
          }
        });
      }
    }
  }, [points]);

  // Render Q-Q Plot Canvas
  useEffect(() => {
    const canvas = qqCanvasRef.current;
    if (!canvas || sampleValues.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const margin = 40;
    const plotW = width - margin * 2;
    const plotH = height - margin * 2;

    const mean = stats.mean;
    const s = Math.max(0.001, stats.stdDev);
    const sortedZ = [...sampleValues].map((v) => (v - mean) / s).sort((a, b) => a - b);

    const qMin = -3.5;
    const qMax = 3.5;
    const qRange = qMax - qMin;

    const toPx = (q: number) => margin + ((q - qMin) / qRange) * plotW;
    const toPy = (z: number) => height - margin - ((z - qMin) / qRange) * plotH;

    ctx.strokeStyle = '#EF4444';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(toPx(qMin), toPy(qMin));
    ctx.lineTo(toPx(qMax), toPy(qMax));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin, height - margin);
    ctx.lineTo(width - margin, height - margin);
    ctx.moveTo(margin, margin);
    ctx.lineTo(margin, height - margin);
    ctx.stroke();

    const N = sortedZ.length;
    sortedZ.forEach((zVal, i) => {
      const p = (i + 0.5) / N;
      const theoreticalQ = normalQuantile(p, 0, 1);

      if (theoreticalQ >= qMin && theoreticalQ <= qMax && zVal >= qMin && zVal <= qMax) {
        const px = toPx(theoreticalQ);
        const py = toPy(zVal);

        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
      }
    });

    ctx.fillStyle = '#94A3B8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      '이론적 정규분포 분위수 (Theoretical Normal Quantiles)',
      margin + plotW / 2,
      height - 12
    );

    ctx.save();
    ctx.translate(14, margin + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('표본 데이터 표준 분위수 (Sample Quantiles)', 0, 0);
    ctx.restore();
  }, [sampleValues, stats]);

  const isNormal = dataType === 'normal';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Top Section: Box-Muller Transformation */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, color: 'primary.main' }}>
          ① Box-Muller 변환: 균등 난수(U) → 2차원 가우스 정규분포(Z)
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          컴퓨터는 완벽한 정규분포 난수를 직접 만들기 어렵기 때문에, 2개의 독립 균등 난수 (U₁, U₂)에
          극좌표 변환 R = √(-2 ln U₁), θ = 2π U₂을 적용하여 2개의 표준정규 난수 (Z₀, Z₁)를 고속
          생성합니다.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 0.4fr 1fr' },
            gap: 2.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#38BDF8' }}>
              균등 난수 공간 [0, 1]²
            </Typography>
            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
              <canvas
                ref={bmUniformCanvasRef}
                width={280}
                height={220}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              textAlign: 'center',
            }}
          >
            <Chip label="Box-Muller 변환" color="secondary" size="small" />
            <Typography variant="h5" sx={{ color: 'text.secondary' }}>
              ➔
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              Z₀ = R cos(θ)
              <br />
              Z₁ = R sin(θ)
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#EC4899' }}>
              2D 독립 정규분포 궤적 N(0, I)
            </Typography>
            <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
              <canvas
                ref={bmNormalCanvasRef}
                width={280}
                height={220}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>
          </Box>
        </Box>
      </Card>

      {/* 2. Bottom Section: Q-Q Plot Normality Diagnostic */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main' }}>
              ② 정규 Q-Q 플롯 (Normal Quantile-Quantile Plot) 시각 진단
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              데이터 점들이 붉은색 45도 점선(y = x) 위에 나란히 놓일수록 완벽한 정규분포임을
              입증합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="datatype-label">검정 데이터 유형</InputLabel>
              <Select
                labelId="datatype-label"
                value={dataType}
                label="검정 데이터 유형"
                onChange={(e) => setDataType(e.target.value as DataType)}
              >
                <MenuItem value="normal">1. 정규분포 데이터 (Normal)</MenuItem>
                <MenuItem value="uniform">2. 균등분포 (S자 굴곡)</MenuItem>
                <MenuItem value="exponential">3. 지수분포 (비대칭 곡선)</MenuItem>
                <MenuItem value="heavy-tail">4. 두터운 꼬리 / 이상치 (Heavy Tail)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<RefreshRoundedIcon />}
              onClick={generateData}
            >
              새 표본 생성
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
            gap: 2.5,
            alignItems: 'start',
          }}
        >
          {/* Left: Q-Q Canvas */}
          <Box sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider' }}>
            <canvas
              ref={qqCanvasRef}
              width={520}
              height={320}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Right: Diagnosis & Interpretation */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: isNormal ? 'success.lighter' : 'warning.lighter',
                border: 1,
                borderColor: isNormal ? 'success.main' : 'warning.main',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    color: isNormal ? 'success.dark' : 'warning.dark',
                  }}
                >
                  {isNormal
                    ? '✅ 정규성 만족 (Normal Distribution)'
                    : '⚠️ 비정규 분포 (Non-Normal)'}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: 'text.primary', display: 'block', lineHeight: 1.5 }}
              >
                {dataType === 'normal' &&
                  '점들이 대각선 기준선(y=x)에 정렬되어 표본이 정규성을 완벽히 만족합니다.'}
                {dataType === 'uniform' && '양 끝단 꼬리가 얇아 Q-Q 플롯이 S자 형태로 꺾입니다.'}
                {dataType === 'exponential' &&
                  '오른쪽 꼬리가 길어 왜도가 크며 곡선 형태로 벗어납니다.'}
                {dataType === 'heavy-tail' &&
                  '극단적 이상치(Outlier)로 인해 양 끝단이 기준선에서 크게 이탈합니다.'}
              </Typography>
            </Paper>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  왜도 (Skewness)
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {stats.skewness.toFixed(3)}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.2, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  초과 첨도 (Kurtosis)
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {stats.kurtosis.toFixed(3)}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
              >
                💡 <b>Q-Q Plot 활용 팁</b>: 실제 머신러닝/선형회귀 잔차(Residual) 분석 시 데이터의
                정규성 가정을 검증할 때 가장 강력하고 널리 쓰이는 표준 시각화 기법입니다.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
