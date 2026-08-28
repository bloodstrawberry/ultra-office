'use client';

import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

import { normalPdf } from '../utils/gaussian-math';

// ----------------------------------------------------------------------

type ExperimentType = 'dice' | 'coin';

export function DiceCoinSimulator() {
  const [experimentType, setExperimentType] = useState<ExperimentType>('dice');
  const [itemCount, setItemCount] = useState<number>(3);
  const [sumCounts, setSumCounts] = useState<Record<number, number>>({});
  const [totalRolls, setTotalRolls] = useState<number>(0);
  const [isAutoRolling, setIsAutoRolling] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const autoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const minSum = experimentType === 'dice' ? itemCount : 0;
  const maxSum = experimentType === 'dice' ? itemCount * 6 : itemCount;

  const theoMean = useMemo(() => {
    if (experimentType === 'dice') return itemCount * 3.5;
    return itemCount * 0.5;
  }, [experimentType, itemCount]);

  const theoStdDev = useMemo(() => {
    if (experimentType === 'dice') return Math.sqrt(itemCount * (35 / 12));
    return Math.sqrt(itemCount * 0.25);
  }, [experimentType, itemCount]);

  const handleReset = useCallback(() => {
    setIsAutoRolling(false);
    setSumCounts({});
    setTotalRolls(0);
  }, []);

  useEffect(() => {
    handleReset();
  }, [experimentType, itemCount, handleReset]);

  const handleRollBatch = useCallback(
    (count: number) => {
      setSumCounts((prev) => {
        const next = { ...prev };
        for (let i = 0; i < count; i += 1) {
          let sum = 0;
          for (let d = 0; d < itemCount; d += 1) {
            if (experimentType === 'dice') {
              sum += Math.floor(Math.random() * 6) + 1;
            } else {
              sum += Math.random() < 0.5 ? 0 : 1;
            }
          }
          next[sum] = (next[sum] || 0) + 1;
        }
        return next;
      });
      setTotalRolls((prev) => prev + count);
    },
    [experimentType, itemCount]
  );

  useEffect(() => {
    if (isAutoRolling) {
      autoIntervalRef.current = setInterval(() => {
        handleRollBatch(20);
      }, 80);
    } else if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
    }
    return () => {
      if (autoIntervalRef.current) clearInterval(autoIntervalRef.current);
    };
  }, [isAutoRolling, handleRollBatch]);

  const { empiricalMean, empiricalStdDev } = useMemo(() => {
    if (totalRolls === 0) return { empiricalMean: 0, empiricalStdDev: 0 };
    let sum = 0;
    Object.entries(sumCounts).forEach(([k, count]) => {
      sum += Number(k) * count;
    });
    const mean = sum / totalRolls;

    let sqDiffSum = 0;
    Object.entries(sumCounts).forEach(([k, count]) => {
      sqDiffSum += count * (Number(k) - mean) ** 2;
    });
    const stdDev = Math.sqrt(sqDiffSum / totalRolls);
    return { empiricalMean: mean, empiricalStdDev: stdDev };
  }, [sumCounts, totalRolls]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const margin = { top: 30, right: 30, bottom: 50, left: 40 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const totalBins = maxSum - minSum + 1;
    const binW = plotW / totalBins;

    const maxCount = Math.max(1, ...Object.values(sumCounts));

    for (let s = minSum; s <= maxSum; s += 1) {
      const count = sumCounts[s] || 0;
      const bx = margin.left + (s - minSum) * binW;
      const barH = (count / (maxCount * 1.15)) * plotH;
      const by = height - margin.bottom - barH;

      const gradient = ctx.createLinearGradient(0, by, 0, height - margin.bottom);
      gradient.addColorStop(0, '#8B5CF6');
      gradient.addColorStop(1, '#4C1D95');

      ctx.fillStyle = gradient;
      ctx.fillRect(bx + 1, by, Math.max(1, binW - 2), barH);

      if (totalBins <= 30 || s % 2 === 0) {
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(s.toString(), bx + binW / 2, height - margin.bottom + 14);
      }
    }

    if (totalRolls > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;

      const steps = 150;
      for (let i = 0; i <= steps; i += 1) {
        const xVal = minSum + (i / steps) * (maxSum - minSum);
        const px = margin.left + (i / steps) * plotW;
        const pdfVal = normalPdf(xVal, theoMean, theoStdDev);
        const expCount = pdfVal * 1.0 * totalRolls;
        const py = height - margin.bottom - Math.min(plotH, (expCount / (maxCount * 1.15)) * plotH);

        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(margin.left, height - margin.bottom);
    ctx.lineTo(width - margin.right, height - margin.bottom);
    ctx.stroke();
  }, [sumCounts, totalRolls, minSum, maxSum, theoMean, theoStdDev]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Control Toolbar */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.3fr 2fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          {/* Experiment Type Selector */}
          <FormControl component="fieldset">
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', fontWeight: 600, mb: 0.5 }}
            >
              실험 도구 선택
            </Typography>
            <RadioGroup
              row
              value={experimentType}
              onChange={(e) => setExperimentType(e.target.value as ExperimentType)}
            >
              <FormControlLabel
                value="dice"
                control={<Radio size="small" />}
                label="주사위 (1~6)"
              />
              <FormControlLabel
                value="coin"
                control={<Radio size="small" />}
                label="동전 앞면 (0/1)"
              />
            </RadioGroup>
          </FormControl>

          {/* Count Slider */}
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                동시 시행 개수 (k): {itemCount}개 {experimentType === 'dice' ? '주사위' : '동전'}{' '}
                합계
              </Typography>
              <Chip
                size="small"
                label={
                  itemCount === 1
                    ? 'k=1: 균등 분포'
                    : itemCount === 2
                      ? 'k=2: 삼각 분포'
                      : 'k≥3: 정규분포 수렴'
                }
                color={itemCount >= 3 ? 'success' : 'warning'}
              />
            </Box>
            <Slider
              value={itemCount}
              min={1}
              max={experimentType === 'dice' ? 10 : 30}
              step={1}
              marks
              onChange={(_, val) => setItemCount(val as number)}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<CasinoRoundedIcon />}
              onClick={() => handleRollBatch(1)}
            >
              1회 굴리기
            </Button>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRollBatch(100)}
            >
              +100회
            </Button>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRollBatch(1000)}
            >
              +1,000회 고속
            </Button>
            <Button
              variant={isAutoRolling ? 'outlined' : 'contained'}
              color={isAutoRolling ? 'warning' : 'success'}
              size="small"
              startIcon={isAutoRolling ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setIsAutoRolling((prev) => !prev)}
            >
              {isAutoRolling ? '중지' : '연속 자동'}
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

      {/* 2. Visual Canvas & Result Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'secondary.main' }}>
              {itemCount}개 {experimentType === 'dice' ? '주사위' : '동전'} 눈금 합계(Sum)의 누적
              분포
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              누적 시행: <b>{totalRolls.toLocaleString()}회</b>
            </Typography>
          </Box>

          <Box
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              mb: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={680}
              height={300}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
            * 보라색 막대: {itemCount}개 합산 실측 빈도 | 주황색 실선: 이론적 정규분포 곡선 N(μ=
            {theoMean.toFixed(1)}, σ={theoStdDev.toFixed(2)})
          </Typography>
        </Card>

        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            height: '100%',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
            합계 통계 지표 대조
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                실측 합계 평균
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                {totalRolls > 0 ? empiricalMean.toFixed(2) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (이론: {theoMean.toFixed(2)})
              </Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                실측 표준편차
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'secondary.main' }}>
                {totalRolls > 0 ? empiricalStdDev.toFixed(2) : '-'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                (이론: {theoStdDev.toFixed(2)})
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              🎲 주사위 합계의 정규분포 수렴 원리
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              주사위 1개일 때는 1~6이 균등하게 나오는 평평한 분포이지만, 2개를 더하면 7을 정점으로
              하는 삼각형 분포가 되고, 3개 이상을 더하는 순간부터 완벽에 가까운 종 모양 가우스 정규
              곡선이 형성됩니다. 독립적인 무작위 요인들의 합산이 정규분포를 만든다는 직관적
              증거입니다.
            </Typography>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
