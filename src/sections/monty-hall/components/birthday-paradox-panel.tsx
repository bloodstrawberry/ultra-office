'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CakeRoundedIcon from '@mui/icons-material/CakeRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import FastForwardRoundedIcon from '@mui/icons-material/FastForwardRounded';

import { calculateBirthdayProbability } from '../utils/monty-math';

// ----------------------------------------------------------------------

interface Person {
  id: number;
  dayOfYear: number;
  month: number;
  day: number;
  isShared: boolean;
}

export function BirthdayParadoxPanel() {
  const [groupSize, setGroupSize] = useState<number>(23);
  const [people, setPeople] = useState<Person[]>([]);
  const [hasCollision, setHasCollision] = useState<boolean>(false);
  const [sharedDays, setSharedDays] = useState<number[]>([]);

  // Simulation batch stats
  const [simRuns, setSimRuns] = useState<number>(0);
  const [simCollisionCount, setSimCollisionCount] = useState<number>(0);

  const curveCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate a random room of people
  const generateRoom = useCallback(
    (n: number = groupSize) => {
      const newPeople: Person[] = [];
      const dayCounts: Record<number, number> = {};

      for (let i = 0; i < n; i += 1) {
        const dayOfYear = Math.floor(Math.random() * 365) + 1;
        dayCounts[dayOfYear] = (dayCounts[dayOfYear] || 0) + 1;

        // Approximate month and day
        const date = new Date(2024, 0, dayOfYear);
        newPeople.push({
          id: i + 1,
          dayOfYear,
          month: date.getMonth() + 1,
          day: date.getDate(),
          isShared: false,
        });
      }

      const collisions = Object.keys(dayCounts)
        .filter((k) => dayCounts[Number(k)] > 1)
        .map(Number);

      newPeople.forEach((p) => {
        if (collisions.includes(p.dayOfYear)) {
          p.isShared = true;
        }
      });

      setPeople(newPeople);
      setHasCollision(collisions.length > 0);
      setSharedDays(collisions);
    },
    [groupSize]
  );

  useEffect(() => {
    generateRoom(groupSize);
  }, [groupSize, generateRoom]);

  // Run Batch Simulation
  const handleRunBatch = (batches: number) => {
    let collisions = 0;
    for (let b = 0; b < batches; b += 1) {
      const set = new Set<number>();
      let collisionInRun = false;
      for (let i = 0; i < groupSize; i += 1) {
        const d = Math.floor(Math.random() * 365);
        if (set.has(d)) {
          collisionInRun = true;
          break;
        }
        set.add(d);
      }
      if (collisionInRun) collisions += 1;
    }
    setSimRuns((prev) => prev + batches);
    setSimCollisionCount((prev) => prev + collisions);
  };

  const handleResetSim = () => {
    setSimRuns(0);
    setSimCollisionCount(0);
  };

  const theoProb = calculateBirthdayProbability(groupSize);
  const simProb = simRuns > 0 ? (simCollisionCount / simRuns) * 100 : theoProb * 100;

  // Render Theoretical Curve Canvas
  useEffect(() => {
    const canvas = curveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    const margin = { top: 20, right: 25, bottom: 40, left: 45 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    // Grid lines
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 1;
    [0.25, 0.5, 0.75, 1.0].forEach((p) => {
      const py = margin.top + plotH - p * plotH;
      ctx.beginPath();
      ctx.moveTo(margin.left, py);
      ctx.lineTo(margin.left + plotW, py);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${(p * 100).toFixed(0)}%`, margin.left - 6, py + 3);
    });

    // 50% line highlight
    const halfY = margin.top + plotH - 0.5 * plotH;
    ctx.strokeStyle = '#334155';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(margin.left, halfY);
    ctx.lineTo(margin.left + plotW, halfY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Curve: N from 1 to 80
    ctx.beginPath();
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 2.5;

    const maxN = 80;
    for (let n = 1; n <= maxN; n += 1) {
      const p = calculateBirthdayProbability(n);
      const px = margin.left + ((n - 1) / (maxN - 1)) * plotW;
      const py = margin.top + plotH - p * plotH;

      if (n === 1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Mark current group size (N)
    if (groupSize <= maxN) {
      const currentPx = margin.left + ((groupSize - 1) / (maxN - 1)) * plotW;
      const currentPy = margin.top + plotH - theoProb * plotH;

      ctx.beginPath();
      ctx.arc(currentPx, currentPy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`N=${groupSize} (${(theoProb * 100).toFixed(1)}%)`, currentPx, currentPy - 10);
    }

    // X Axis
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top + plotH);
    ctx.lineTo(margin.left + plotW, margin.top + plotH);
    ctx.stroke();

    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    [1, 23, 40, 60, 80].forEach((n) => {
      const lx = margin.left + ((n - 1) / (maxN - 1)) * plotW;
      ctx.fillText(`N=${n}`, lx, margin.top + plotH + 15);
    });
  }, [groupSize, theoProb]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top Controls */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.4fr 1.6fr' },
            gap: 2.5,
            alignItems: 'center',
          }}
        >
          <Box sx={{ px: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                모임 인원 수 (N): {groupSize}명
              </Typography>
              <Chip
                label={
                  groupSize === 23
                    ? '23명: 50.7% (골든 넘버)'
                    : groupSize >= 70
                      ? '99.9% 겹침'
                      : `확률 ${(theoProb * 100).toFixed(1)}%`
                }
                color={theoProb >= 0.5 ? 'success' : 'default'}
                size="small"
              />
            </Box>
            <Slider
              value={groupSize}
              min={2}
              max={80}
              step={1}
              marks={[
                { value: 10, label: '10명' },
                { value: 23, label: '23명 (50%)' },
                { value: 50, label: '50명 (97%)' },
                { value: 70, label: '70명 (99.9%)' },
              ]}
              onChange={(_, val) => setGroupSize(val as number)}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: { xs: 'start', md: 'end' },
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => generateRoom(groupSize)}
            >
              새 무작위 모임 생성
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<FastForwardRoundedIcon />}
              onClick={() => handleRunBatch(1000)}
            >
              +1,000회 시뮬레이션
            </Button>
            <Button variant="outlined" color="error" size="small" onClick={handleResetSim}>
              리셋
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Interactive Room People Grid */}
        <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              생일 공유자 모임 룸 (Room View)
            </Typography>
            <Chip
              icon={<CakeRoundedIcon />}
              label={
                hasCollision
                  ? `🎉 생일 일치 발생 (${sharedDays.length}개 날짜)`
                  : '❌ 생일 겹침 없음'
              }
              color={hasCollision ? 'success' : 'default'}
              variant={hasCollision ? 'filled' : 'outlined'}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))',
              gap: 1,
              maxHeight: 280,
              overflowY: 'auto',
              p: 1.5,
              bgcolor: 'background.neutral',
              borderRadius: 2,
              mb: 2,
            }}
          >
            {people.map((person) => (
              <Paper
                key={person.id}
                elevation={person.isShared ? 4 : 0}
                sx={{
                  p: 1,
                  textAlign: 'center',
                  borderRadius: 1.5,
                  border: 1,
                  borderColor: person.isShared ? 'success.main' : 'divider',
                  bgcolor: person.isShared ? 'success.lighter' : 'background.paper',
                  transition: 'all 0.2s',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem' }}
                >
                  #{person.id}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 800, color: person.isShared ? 'success.dark' : 'text.primary' }}
                >
                  {person.month}/{person.day}
                </Typography>
              </Paper>
            ))}
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              💡 <b>생일 역설의 해설</b>: 1년이 365일인데도 겨우 23명만 모이면 생일이 같을 확률이
              50%를 넘는 이유는, 나 자신과 같은 사람을 찾는 것이 아니라{' '}
              <b>23명이 서로 짝을 짓는 경우의 수</b>가 23 × 22 / 2 = 253쌍이나 되기 때문입니다!
            </Typography>
          </Box>
        </Card>

        {/* Right: Curve & Stats */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}
            >
              인원수(N)에 따른 생일 충돌 확률 곡선
            </Typography>

            <Box
              sx={{ borderRadius: 2, overflow: 'hidden', border: 1, borderColor: 'divider', mb: 2 }}
            >
              <canvas
                ref={curveCanvasRef}
                width={400}
                height={200}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  이론적 충돌 확률
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {(theoProb * 100).toFixed(2)}%
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.5, textAlign: 'center', borderRadius: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  시뮬레이션 실측 ({simRuns.toLocaleString()}회)
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'secondary.main' }}>
                  {simRuns > 0 ? `${simProb.toFixed(2)}%` : '-'}
                </Typography>
              </Paper>
            </Box>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
