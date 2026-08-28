'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

import { normalPdf } from '../utils/gaussian-math';

// ----------------------------------------------------------------------

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  currentRow: number;
  targetBin: number;
  color: string;
  hasSettled: boolean;
}

interface Pin {
  x: number;
  y: number;
  row: number;
  col: number;
}

const BALL_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#06B6D4', '#10B981'];

export function GaltonBoardCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Settings
  const [rows, setRows] = useState<number>(12); // Number of pin rows (8-16)
  const [biasP, setBiasP] = useState<number>(0.5); // Right deflection prob (0.1 - 0.9)
  const [dropSpeed, setDropSpeed] = useState<number>(5); // Balls per spawn
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Statistics
  const [totalDropped, setTotalDropped] = useState<number>(0);
  const [binCounts, setBinCounts] = useState<number[]>(() => new Array(13).fill(0));

  // Audio Context ref
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Animation Refs
  const ballsRef = useRef<Ball[]>([]);
  const binsRef = useRef<number[]>(new Array(13).fill(0));
  const droppedCountRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(false);
  isRunningRef.current = isRunning;

  // Sync binsRef with rows
  useEffect(() => {
    const numBins = rows + 1;
    binsRef.current = new Array(numBins).fill(0);
    setBinCounts(new Array(numBins).fill(0));
    ballsRef.current = [];
    droppedCountRef.current = 0;
    setTotalDropped(0);
  }, [rows]);

  const playClickSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400 + Math.random() * 200, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.015, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.04);
    } catch {
      // Audio autoplay policy fallback
    }
  }, [soundEnabled]);

  // Reset simulation
  const handleReset = useCallback(() => {
    setIsRunning(false);
    ballsRef.current = [];
    binsRef.current = new Array(rows + 1).fill(0);
    droppedCountRef.current = 0;
    setTotalDropped(0);
    setBinCounts(new Array(rows + 1).fill(0));
  }, [rows]);

  // Spawn balls
  const spawnBalls = useCallback(
    (count: number, canvasWidth: number) => {
      const startX = canvasWidth / 2;
      const startY = 30;

      for (let i = 0; i < count; i += 1) {
        let bin = 0;
        for (let r = 0; r < rows; r += 1) {
          if (Math.random() < biasP) {
            bin += 1;
          }
        }

        const ball: Ball = {
          x: startX + (Math.random() - 0.5) * 12,
          y: startY - Math.random() * 20,
          vx: (Math.random() - 0.5) * 0.8,
          vy: 2 + Math.random() * 1.5,
          currentRow: -1,
          targetBin: bin,
          color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
          hasSettled: false,
        };
        ballsRef.current.push(ball);
        droppedCountRef.current += 1;
      }
      setTotalDropped(droppedCountRef.current);
    },
    [rows, biasP]
  );

  // Fast forward instant batch
  const handleInstantBatch = useCallback(
    (count: number) => {
      const newBins = [...binsRef.current];
      for (let i = 0; i < count; i += 1) {
        let bin = 0;
        for (let r = 0; r < rows; r += 1) {
          if (Math.random() < biasP) {
            bin += 1;
          }
        }
        newBins[bin] += 1;
      }
      binsRef.current = newBins;
      droppedCountRef.current += count;
      setBinCounts([...newBins]);
      setTotalDropped(droppedCountRef.current);
      playClickSound();
    },
    [rows, biasP, playClickSound]
  );

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const width = canvas.width;
      const height = canvas.height;

      // Layout Geometry
      const topPadding = 50;
      const bottomHeight = 160;
      const pinAreaHeight = height - topPadding - bottomHeight;
      const rowSpacing = pinAreaHeight / (rows + 1);
      const colSpacing = (width * 0.75) / (rows + 1);
      const pinRadius = 3.5;
      const ballRadius = 3;

      // 1. Calculate Pin Positions
      const pins: Pin[] = [];
      for (let r = 0; r < rows; r += 1) {
        const pinCount = r + 1;
        const rowY = topPadding + (r + 1) * rowSpacing;
        const startX = width / 2 - ((pinCount - 1) * colSpacing) / 2;
        for (let c = 0; c < pinCount; c += 1) {
          pins.push({
            x: startX + c * colSpacing,
            y: rowY,
            row: r,
            col: c,
          });
        }
      }

      // 2. Spawn balls if running
      if (isRunningRef.current && ballsRef.current.length < 400) {
        spawnBalls(dropSpeed, width);
      }

      // 3. Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Background styling
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      // Draw Funnel Top
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 40, 10);
      ctx.lineTo(width / 2 - 12, topPadding - 10);
      ctx.lineTo(width / 2 - 12, topPadding + 10);
      ctx.moveTo(width / 2 + 40, 10);
      ctx.lineTo(width / 2 + 12, topPadding - 10);
      ctx.lineTo(width / 2 + 12, topPadding + 10);
      ctx.stroke();

      // 4. Draw Pins
      pins.forEach((pin) => {
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pinRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#94A3B8';
        ctx.fill();
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 5. Draw Bin Dividers
      const numBins = rows + 1;
      const binStartY = height - bottomHeight;
      const binWidth = (width * 0.75) / numBins;
      const binStartX = width / 2 - (numBins * binWidth) / 2;

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      for (let b = 0; b <= numBins; b += 1) {
        const bx = binStartX + b * binWidth;
        ctx.beginPath();
        ctx.moveTo(bx, binStartY);
        ctx.lineTo(bx, height - 20);
        ctx.stroke();
      }

      // Base line
      ctx.beginPath();
      ctx.moveTo(binStartX - 10, height - 20);
      ctx.lineTo(binStartX + numBins * binWidth + 10, height - 20);
      ctx.stroke();

      // 6. Update and Draw Balls in Physics
      const gravity = 280;
      const activeBalls: Ball[] = [];
      let soundPlayedThisFrame = false;

      ballsRef.current.forEach((ball) => {
        if (ball.hasSettled) return;

        // Apply gravity
        ball.vy += gravity * dt;
        ball.y += ball.vy * dt;
        ball.x += ball.vx * dt;

        // Air drag
        ball.vx *= 0.98;

        // Check Pin collisions
        pins.forEach((pin) => {
          const dx = ball.x - pin.x;
          const dy = ball.y - pin.y;
          const dist = Math.hypot(dx, dy);

          if (dist < pinRadius + ballRadius) {
            const pushDir = Math.random() < biasP ? 1 : -1;
            ball.vx = pushDir * (30 + Math.random() * 25);
            ball.vy = Math.max(20, ball.vy * 0.45);
            ball.y = pin.y + pinRadius + ballRadius + 1;

            if (!soundPlayedThisFrame && Math.random() < 0.15) {
              playClickSound();
              soundPlayedThisFrame = true;
            }
          }
        });

        // Guide ball towards target bin slot
        if (ball.y >= binStartY - 30) {
          const targetX = binStartX + ball.targetBin * binWidth + binWidth / 2;
          ball.x += (targetX - ball.x) * 0.15;
        }

        // Check if ball reached bottom bin
        if (ball.y >= height - 26) {
          ball.hasSettled = true;
          const binIndex = Math.max(0, Math.min(numBins - 1, ball.targetBin));
          binsRef.current[binIndex] += 1;
        } else {
          activeBalls.push(ball);

          ctx.beginPath();
          ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
          ctx.fillStyle = ball.color;
          ctx.shadowColor = ball.color;
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      ballsRef.current = activeBalls;

      // 7. Draw Bin Histogram Bars
      const currentBins = binsRef.current;
      const maxCount = Math.max(1, ...currentBins);
      const barMaxHeight = bottomHeight - 35;

      currentBins.forEach((count, b) => {
        const bx = binStartX + b * binWidth;
        const barHeight = Math.min(barMaxHeight, (count / (maxCount * 1.15)) * barMaxHeight);
        const barY = height - 20 - barHeight;

        const gradient = ctx.createLinearGradient(0, barY, 0, height - 20);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#1E3A8A');

        ctx.fillStyle = gradient;
        ctx.fillRect(bx + 2, barY, binWidth - 4, barHeight);

        if (count > 0) {
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(count.toString(), bx + binWidth / 2, barY - 4);
        }

        ctx.fillStyle = '#64748B';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(b.toString(), bx + binWidth / 2, height - 6);
      });

      // 8. Draw Theoretical Normal / Binomial Curve
      if (droppedCountRef.current > 0) {
        const n = rows;
        const p = biasP;
        const theoMean = n * p;
        const theoStdDev = Math.sqrt(n * p * (1 - p));

        ctx.beginPath();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 3]);

        for (let b = 0; b <= numBins * 10; b += 1) {
          const xVal = b / 10;
          const px = binStartX + xVal * binWidth;
          const pdfVal = normalPdf(xVal, theoMean, theoStdDev);
          const curveHeight = pdfVal * droppedCountRef.current * (binWidth / 1.15);
          const py =
            height -
            20 -
            Math.min(barMaxHeight * 1.1, (curveHeight / (maxCount * 1.15)) * barMaxHeight);

          if (b === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('── 이론적 가우스/이항 정규 곡선', binStartX, topPadding + 15);
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    const syncInterval = setInterval(() => {
      setBinCounts([...binsRef.current]);
      setTotalDropped(droppedCountRef.current);
    }, 150);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      clearInterval(syncInterval);
    };
  }, [rows, biasP, dropSpeed, spawnBalls, playClickSound]);

  // Statistical calculations
  const theoreticalMean = rows * biasP;
  const theoreticalStdDev = Math.sqrt(rows * biasP * (1 - biasP));

  let actualMean = 0;
  let actualVariance = 0;
  if (totalDropped > 0) {
    let sum = 0;
    binCounts.forEach((count, b) => {
      sum += b * count;
    });
    actualMean = sum / totalDropped;

    let sqDiffSum = 0;
    binCounts.forEach((count, b) => {
      sqDiffSum += count * (b - actualMean) ** 2;
    });
    actualVariance = sqDiffSum / totalDropped;
  }
  const actualStdDev = Math.sqrt(actualVariance);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Main Canvas & Control Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas */}
        <Card
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                골턴 보드 물리 시뮬레이션 (Galton Board / Quincunx)
              </Typography>
              <Chip
                label={isRunning ? '시뮬레이션 가동 중' : '일시정지'}
                size="small"
                color={isRunning ? 'success' : 'default'}
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title={soundEnabled ? '효과음 켜짐' : '효과음 꺼짐'}>
                <Button
                  size="small"
                  variant={soundEnabled ? 'contained' : 'outlined'}
                  color={soundEnabled ? 'primary' : 'inherit'}
                  onClick={() => setSoundEnabled((prev) => !prev)}
                  startIcon={soundEnabled ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />}
                >
                  소리
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Canvas Element */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 720,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={700}
              height={520}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Quick Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              mt: 2,
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
            }}
          >
            <Button
              variant={isRunning ? 'outlined' : 'contained'}
              color={isRunning ? 'warning' : 'primary'}
              startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
              onClick={() => setIsRunning((prev) => !prev)}
            >
              {isRunning ? '일시정지 (Pause)' : '연속 방출 (Start)'}
            </Button>

            <Button
              variant="outlined"
              color="info"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleInstantBatch(100)}
            >
              +100개 즉시 누적
            </Button>

            <Button
              variant="outlined"
              color="secondary"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleInstantBatch(1000)}
            >
              +1,000개 고속 생성
            </Button>

            <Button
              variant="outlined"
              color="error"
              startIcon={<RefreshRoundedIcon />}
              onClick={handleReset}
            >
              초기화 (Reset)
            </Button>
          </Box>
        </Card>

        {/* Right: Controls & Real-time Analytics */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Control Panel */}
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              시뮬레이션 파라미터 제어
            </Typography>

            {/* 1. Rows (Pins) Slider */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  핀 단수 (Rows): {rows}단
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  빈 개수: {rows + 1}개
                </Typography>
              </Box>
              <Slider
                value={rows}
                min={8}
                max={16}
                step={1}
                marks
                disabled={isRunning}
                onChange={(_, val) => setRows(val as number)}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                * 핀 층수가 많을수록 이항분포가 부드러운 정규분포 곡선으로 수렴합니다.
              </Typography>
            </Box>

            {/* 2. Bias Probability Slider */}
            <Box sx={{ mb: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  우측 튕김 확률 (p): {(biasP * 100).toFixed(0)}%
                </Typography>
                <Chip
                  size="small"
                  label={biasP === 0.5 ? '대칭 정규분포' : biasP > 0.5 ? '우측 편향' : '좌측 편향'}
                  color={biasP === 0.5 ? 'primary' : 'warning'}
                />
              </Box>
              <Slider
                value={biasP}
                min={0.1}
                max={0.9}
                step={0.05}
                marks={[
                  { value: 0.1, label: '0.1' },
                  { value: 0.5, label: '0.5 (대칭)' },
                  { value: 0.9, label: '0.9' },
                ]}
                onChange={(_, val) => setBiasP(val as number)}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                * p=0.5일 때 완벽한 좌우 대칭 종 모양 곡선(Bell Curve)이 만들어집니다.
              </Typography>
            </Box>

            {/* 3. Spawn Speed Slider */}
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  방출 속도: 프레임당 {dropSpeed}개
                </Typography>
              </Box>
              <Slider
                value={dropSpeed}
                min={1}
                max={15}
                step={1}
                onChange={(_, val) => setDropSpeed(val as number)}
              />
            </Box>
          </Card>

          {/* Real-time Statistics Card */}
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5 }}>
              실시간 통계 및 이론값 대조
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2 }}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  누적 구슬 수
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {totalDropped.toLocaleString()}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  측정 평균 (μ)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 800, color: 'info.main' }}>
                  {actualMean.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  (이론: {theoreticalMean.toFixed(2)})
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  측정 표준편차 (σ)
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                  {actualStdDev.toFixed(2)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  (이론: {theoreticalStdDev.toFixed(2)})
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  오차율 (Error)
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color:
                      totalDropped === 0
                        ? 'text.secondary'
                        : Math.abs(actualMean - theoreticalMean) < 0.1
                          ? 'success.main'
                          : 'warning.main',
                  }}
                >
                  {totalDropped > 0
                    ? `${(Math.abs((actualMean - theoreticalMean) / (theoreticalMean || 1)) * 100).toFixed(1)}%`
                    : '-'}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                💡 골턴 보드(Quincunx)의 원리
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
              >
                구슬이 각 핀에 닿을 때마다 좌/우 50% 독립 확률(베르누이 시행)로 튕깁니다. n단의 핀을
                통과하는 과정은 이항분포 B(n, p)를 따르며, 구슬 수가 많아질수록 드무아브르-라플라스
                정리에 의해 정규분포 N(np, np(1-p))로 완벽하게 수렴합니다.
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
