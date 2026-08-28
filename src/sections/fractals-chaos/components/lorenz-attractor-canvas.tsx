'use client';

import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// ----------------------------------------------------------------------

interface Point3D {
  x: number;
  y: number;
  z: number;
}

export function LorenzAttractorCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [sigma, setSigma] = useState<number>(10);
  const [rho, setRho] = useState<number>(28);
  const [beta, setBeta] = useState<number>(2.667);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Trajectories
  const traj1Ref = useRef<Point3D[]>([{ x: 0.1, y: 0.1, z: 0.1 }]);
  const traj2Ref = useRef<Point3D[]>([{ x: 0.1001, y: 0.1, z: 0.1 }]); // 0.0001 difference!
  const angleRef = useRef<number>(0);
  const animationFrameId = useRef<number | null>(null);
  const isRunningRef = useRef<boolean>(isRunning);
  isRunningRef.current = isRunning;

  // Reset trajectories
  const handleReset = () => {
    traj1Ref.current = [{ x: 0.1, y: 0.1, z: 0.1 }];
    traj2Ref.current = [{ x: 0.1001, y: 0.1, z: 0.1 }];
    angleRef.current = 0;
  };

  // Step Lorenz equations (RK4 or Euler with small dt)
  const stepLorenz = (p: Point3D, dt: number = 0.008): Point3D => {
    const dx = sigma * (p.y - p.x);
    const dy = p.x * (rho - p.z) - p.y;
    const dz = p.x * p.y - beta * p.z;
    return {
      x: p.x + dx * dt,
      y: p.y + dy * dt,
      z: p.z + dz * dt,
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return () => {};
    const ctx = canvas.getContext('2d');
    if (!ctx) return () => {};

    const maxHistory = 3000;

    const render = () => {
      if (isRunningRef.current) {
        // Integrate 4 sub-steps per frame for smoothness
        for (let s = 0; s < 4; s += 1) {
          const last1 = traj1Ref.current[traj1Ref.current.length - 1];
          const last2 = traj2Ref.current[traj2Ref.current.length - 1];

          const next1 = stepLorenz(last1);
          const next2 = stepLorenz(last2);

          traj1Ref.current.push(next1);
          traj2Ref.current.push(next2);

          if (traj1Ref.current.length > maxHistory) traj1Ref.current.shift();
          if (traj2Ref.current.length > maxHistory) traj2Ref.current.shift();
        }

        angleRef.current += 0.005; // slow 3D rotation
      }

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 30;
      const scale = 7.5;
      const angle = angleRef.current;

      // 3D Projection Helper
      const project = (p: Point3D): { px: number; py: number } => {
        // Rotate around Y axis
        const rx = p.x * Math.cos(angle) + p.y * Math.sin(angle);
        const ry = -p.x * Math.sin(angle) + p.y * Math.cos(angle);
        const rz = p.z - 25; // center Z around 25

        const px = cx + rx * scale;
        const py = cy - rz * scale + ry * scale * 0.2;
        return { px, py };
      };

      // Draw Trajectory 1 (Cyan)
      if (traj1Ref.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        traj1Ref.current.forEach((pt, i) => {
          const { px, py } = project(pt);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // Draw Trajectory 2 (Neon Pink / Red)
      if (traj2Ref.current.length > 1) {
        ctx.beginPath();
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 1.5;
        traj2Ref.current.forEach((pt, i) => {
          const { px, py } = project(pt);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();
      }

      // Draw Heads
      const head1 = traj1Ref.current[traj1Ref.current.length - 1];
      const head2 = traj2Ref.current[traj2Ref.current.length - 1];
      if (head1 && head2) {
        const p1 = project(head1);
        const p2 = project(head2);

        ctx.beginPath();
        ctx.arc(p1.px, p1.py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#38BDF8';
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p2.px, p2.py, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#F43F5E';
        ctx.fill();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    animationFrameId.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigma, rho, beta]);

  // Current distance between the two trajectories
  const currentHead1 = traj1Ref.current[traj1Ref.current.length - 1];
  const currentHead2 = traj2Ref.current[traj2Ref.current.length - 1];
  const currentDistance =
    currentHead1 && currentHead2
      ? Math.hypot(
          currentHead1.x - currentHead2.x,
          currentHead1.y - currentHead2.y,
          currentHead1.z - currentHead2.z
        )
      : 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: 3D Canvas */}
        <Card
          sx={{
            p: 2.5,
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
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'secondary.main' }}>
              로렌츠 어트랙터 3D 나비 효과 (Lorenz Attractor)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant={isRunning ? 'outlined' : 'contained'}
                color={isRunning ? 'warning' : 'primary'}
                startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                onClick={() => setIsRunning((prev) => !prev)}
              >
                {isRunning ? '일시정지' : '재생'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                startIcon={<RefreshRoundedIcon />}
                onClick={handleReset}
              >
                궤적 초기화
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: 680,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={640}
              height={420}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* Distance Indicator */}
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 1.5, px: 1 }}
          >
            <Typography variant="caption" sx={{ color: '#38BDF8' }}>
              ● 궤적 1: 초기 위치 (0.1000, 0.1, 0.1)
            </Typography>
            <Typography variant="caption" sx={{ color: '#F43F5E' }}>
              ● 궤적 2: 초기 위치 (0.1001, 0.1, 0.1) [Δ=0.0001]
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: currentDistance > 5 ? 'error.main' : 'warning.main' }}
            >
              두 궤적 간 현재 유클리드 거리: {currentDistance.toFixed(2)}
            </Typography>
          </Box>
        </Card>

        {/* Right: Lorenz Differential Equations & Parameters */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
              로렌츠 비선형 미분방정식 모수
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                σ (프란틀 수, Prandtl): {sigma}
              </Typography>
              <Slider
                value={sigma}
                min={5}
                max={20}
                step={0.5}
                onChange={(_, v) => setSigma(v as number)}
              />
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ρ (레일리 수, Rayleigh): {rho}
              </Typography>
              <Slider
                value={rho}
                min={10}
                max={50}
                step={0.5}
                onChange={(_, v) => setRho(v as number)}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                β (기하 비율, Beta): {beta.toFixed(3)}
              </Typography>
              <Slider
                value={beta}
                min={1}
                max={5}
                step={0.1}
                onChange={(_, v) => setBeta(v as number)}
              />
            </Box>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: 'error.main' }}>
              🦋 나비 효과(Butterfly Effect)의 진수
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              청색과 적색 두 궤적은 시작할 때 단 <b>0.0001</b>의 미세한 차이로 출발하지만, 시간이
              흐를수록 두 궤적이 나비의 두 날개 사이를 완전히 무작위로 오가며 극적으로 분기합니다.
              &quot;브라질에서 나비의 날갯짓이 텍사스에 토네이도를 일으킬 수 있다&quot;는 비선형
              동역학 카오스 이론의 원천입니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
