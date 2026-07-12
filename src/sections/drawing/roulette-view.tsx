'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

interface RouletteItem {
  id: string;
  text: string;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

const PALETTE = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Violet
  '#FF2D55', // Pink
  '#5AC8FA', // Sky Blue
  '#4CD964', // Light Green
];

const PRESETS = [
  {
    name: '점심 메뉴 고르기',
    items: ['짜장면', '김치찌개', '돈까스', '초밥', '샌드위치', '쌀국수', '삼겹살', '피자'],
  },
  {
    name: '벌칙 게임',
    items: ['커피 사기', '노래 부르기', '다음 회식 장소 예약', '통과', '야근하기', '통과'],
  },
  {
    name: '간단 당첨자',
    items: ['당첨', '꽝', '꽝', '꽝', '꽝'],
  },
];

export function RouletteView() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // States
  const [items, setItems] = useState<RouletteItem[]>([
    { id: '1', text: '짜장면', color: PALETTE[0] },
    { id: '2', text: '김치찌개', color: PALETTE[1] },
    { id: '3', text: '돈까스', color: PALETTE[2] },
    { id: '4', text: '초밥', color: PALETTE[3] },
    { id: '5', text: '샌드위치', color: PALETTE[4] },
    { id: '6', text: '쌀국수', color: PALETTE[5] },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Spin physics states
  const angleRef = useRef(0);
  const angularVelocityRef = useRef(0);
  const particlesRef = useRef<Particle[]>([]);
  const prevWinningIndexRef = useRef(-1);
  const tickerStateRef = useRef(0); // 0 ~ 1, for pointer snap vibration

  const N = items.length;
  const canvasSize = 440;
  const radius = canvasSize / 2 - 20;

  // Add Item
  const handleAddItem = () => {
    if (!inputVal.trim()) return;
    if (items.length >= 12) {
      alert('최대 12개 항목까지만 입력할 수 있습니다.');
      return;
    }
    const nextId = String(Date.now());
    const nextColor = PALETTE[items.length % PALETTE.length];
    setItems((prev) => [...prev, { id: nextId, text: inputVal.trim(), color: nextColor }]);
    setInputVal('');
    setWinner(null);
  };

  // Remove Item
  const handleRemoveItem = (id: string) => {
    if (items.length <= 2) {
      alert('최소 2개 이상의 항목이 필요합니다.');
      return;
    }
    setItems((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      // Re-assign colors to look sequential
      return filtered.map((item, idx) => ({
        ...item,
        color: PALETTE[idx % PALETTE.length],
      }));
    });
    setWinner(null);
  };

  // Apply Preset
  const handleApplyPreset = (presetItems: string[]) => {
    if (isSpinning) return;
    const newItems = presetItems.map((text, idx) => ({
      id: `${idx}-${Date.now()}`,
      text,
      color: PALETTE[idx % PALETTE.length],
    }));
    setItems(newItems);
    setWinner(null);
  };

  // Calculate current winning index
  const getWinningIndex = useCallback(
    (currentAngle: number) => {
      const arcSize = (2 * Math.PI) / N;
      // Wheel rotates clockwise, so pointer sweeps counter-clockwise relative to the wheel.
      // Arrow pointing at 12 o'clock (-Math.PI / 2 radians).
      let normalized = (-Math.PI / 2 - currentAngle) % (2 * Math.PI);
      if (normalized < 0) {
        normalized += 2 * Math.PI;
      }
      return Math.floor(normalized / arcSize);
    },
    [N]
  );

  // Trigger confetti particles
  const spawnConfetti = () => {
    const center = canvasSize / 2;
    const newParticles: Particle[] = [];
    const colors = ['#FF2D55', '#FF9500', '#FFCC00', '#4CD964', '#5AC8FA', '#007AFF', '#5856D6'];

    for (let i = 0; i < 90; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 8;
      newParticles.push({
        x: center,
        y: center,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2, // blast slightly upwards
        color: colors[Math.floor(Math.random() * colors.length)],
        radius: 4 + Math.random() * 4,
        alpha: 1.0,
        decay: 0.015 + Math.random() * 0.02,
      });
    }
    particlesRef.current = newParticles;
  };

  // Spin Trigger
  const handleSpin = () => {
    if (isSpinning) return;
    setWinner(null);
    setIsSpinning(true);

    // Initial random speed (e.g., between 0.25 and 0.45 rad/frame)
    angularVelocityRef.current = 0.25 + Math.random() * 0.2;
  };

  // Loop drawing and physics updates
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Handle high DPI
        const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        canvas.width = canvasSize * dpr;
        canvas.height = canvasSize * dpr;
        ctx.scale(dpr, dpr);

        const isDark = theme.palette.mode === 'dark';

        const draw = () => {
          // 1. Clear Canvas
          ctx.clearRect(0, 0, canvasSize, canvasSize);

          const center = canvasSize / 2;
          const arcSize = (2 * Math.PI) / N;

          // 2. Physics logic (if spinning)
          if (isSpinning) {
            // Apply friction decay
            angularVelocityRef.current *= 0.982; // decel rate

            // Stop condition
            if (angularVelocityRef.current < 0.002) {
              angularVelocityRef.current = 0;
              setIsSpinning(false);

              // Determine winner
              const finalWinningIndex = getWinningIndex(angleRef.current);
              const winItem = items[finalWinningIndex];
              if (winItem) {
                setWinner(winItem);
                setDialogOpen(true);
                spawnConfetti();
              }
            }

            // Apply rotation
            angleRef.current = (angleRef.current + angularVelocityRef.current) % (2 * Math.PI);

            // Detect Ticker Trigger (index change)
            const currentWinIdx = getWinningIndex(angleRef.current);
            if (currentWinIdx !== prevWinningIndexRef.current) {
              tickerStateRef.current = 1.0; // Trigger pointer vibration
              prevWinningIndexRef.current = currentWinIdx;
            }
          }

          // 3. Draw Roulette Wheel Slices
          ctx.save();
          ctx.translate(center, center);
          ctx.rotate(angleRef.current);

          for (let i = 0; i < N; i++) {
            const startAngle = i * arcSize;
            const endAngle = startAngle + arcSize;

            // Draw Wedge Slice
            ctx.fillStyle = items[i].color;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Wedge division stroke
            ctx.strokeStyle = isDark ? '#1C1C1E' : '#FFFFFF';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text rotated outwards
            ctx.save();
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 15px Inter, sans-serif';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
            ctx.shadowBlur = 4;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';

            // Rotate to the center angle of the wedge
            const midAngle = startAngle + arcSize / 2;
            ctx.rotate(midAngle);

            // Place text close to outer radius
            ctx.fillText(items[i].text, radius - 25, 0);
            ctx.restore();
          }

          // Outer gold/silver border ring
          ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.arc(0, 0, radius + 3, 0, Math.PI * 2);
          ctx.stroke();

          // Outer rim decoration pins
          ctx.fillStyle = '#FFFFFF';
          for (let i = 0; i < N * 2; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI) / N);
            ctx.beginPath();
            ctx.arc(radius + 2, 0, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }

          ctx.restore(); // Restore center translation

          // Center cap (Inner logo/circle)
          ctx.save();
          ctx.translate(center, center);
          ctx.fillStyle = isDark ? '#2C2C2E' : '#FFFFFF';
          ctx.shadowColor = 'rgba(0,0,0,0.2)';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.arc(0, 0, 30, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset

          ctx.strokeStyle = isDark ? '#FFFFFF' : 'rgba(0, 0, 0, 0.1)';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Small target dot in the absolute center
          ctx.fillStyle = theme.palette.primary.main;
          ctx.beginPath();
          ctx.arc(0, 0, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          // 4. Draw pointer ticking physics
          let pointerVibe = 0;
          if (tickerStateRef.current > 0) {
            // Ticking spring harmonic motion
            pointerVibe = Math.sin(tickerStateRef.current * Math.PI * 3) * 12 * tickerStateRef.current;
            tickerStateRef.current -= 0.08; // fade out vibration
          }

          // Draw Top Arrow Indicator (Pointer)
          ctx.save();
          ctx.translate(center, center - radius - 5);
          // Apply vibration offset rotation
          ctx.rotate((pointerVibe * Math.PI) / 180);

          ctx.fillStyle = '#FF3B30';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 5;

          ctx.beginPath();
          ctx.moveTo(0, 20); // Tip of pointer pointing down to wheel
          ctx.lineTo(-12, -10); // Top left
          ctx.lineTo(12, -10); // Top right
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.restore();

          // 5. Confetti/particles rendering
          if (particlesRef.current.length > 0) {
            particlesRef.current.forEach((p, idx) => {
              p.x += p.vx;
              p.y += p.vy;
              p.vy += 0.12; // Gravity
              p.alpha -= p.decay;

              if (p.alpha <= 0) {
                return;
              }

              ctx.save();
              ctx.globalAlpha = p.alpha;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            });

            // Filter active particles
            particlesRef.current = particlesRef.current.filter((p) => p.alpha > 0);
          }

          animId = requestAnimationFrame(draw);
        };

        draw();

        return () => cancelAnimationFrame(animId);
      }
    }
    return undefined;
  }, [
    items,
    N,
    isSpinning,
    radius,
    getWinningIndex,
    theme.palette.mode,
    theme.palette.primary.main,
  ]);

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4">룰렛 돌리기</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          다양한 결정 옵션을 만들고 룰렛을 힘차게 돌려 복불복 결정을 즐겨보세요!
        </Typography>
      </Stack>

      <Stack spacing={4} direction={{ xs: 'column', lg: 'row' }}>
        {/* Left Side Settings Form */}
        <Card sx={{ flexShrink: 0, width: { xs: '100%', lg: 380 } }}>
          <CardHeader title="룰렛 설정" subheader={`현재 항목 수: ${N}개 (최대 12개)`} />
          <Divider />
          <CardContent>
            {/* Quick Preset Buttons */}
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              빠른 프리셋 적용
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
              {PRESETS.map((p) => (
                <Button
                  key={p.name}
                  variant="soft"
                  color="inherit"
                  size="small"
                  onClick={() => handleApplyPreset(p.items)}
                  disabled={isSpinning}
                >
                  {p.name}
                </Button>
              ))}
            </Stack>

            <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

            {/* Input Form */}
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <TextField
                size="small"
                label="항목 이름"
                placeholder="예: 돈까스"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddItem();
                }}
                disabled={isSpinning}
                fullWidth
              />
              <Button
                variant="contained"
                onClick={handleAddItem}
                disabled={isSpinning || !inputVal.trim() || items.length >= 12}
                startIcon={<AddRoundedIcon />}
              >
                추가
              </Button>
            </Stack>

            {/* Item List */}
            <Stack spacing={1} sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
              {items.map((item, idx) => (
                <Stack
                  key={item.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    border: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: item.color,
                        border: '1px solid rgba(0,0,0,0.1)',
                      }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {item.text}
                    </Typography>
                  </Stack>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={isSpinning || items.length <= 2}
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </CardContent>
          <Divider />
          <Box sx={{ p: 2 }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              size="large"
              onClick={handleSpin}
              disabled={isSpinning}
              startIcon={<AutorenewRoundedIcon />}
              sx={{ height: 48 }}
            >
              룰렛 돌리기
            </Button>
          </Box>
        </Card>

        {/* Right Side Wheel (Canvas) */}
        <Stack spacing={3} sx={{ flexGrow: 1, alignItems: 'center' }}>
          <Card
            sx={{
              p: 3,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              minHeight: 480,
            }}
          >
            {/* Spinning Guide Message */}
            {!isSpinning && !winner && (
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 2, color: 'text.secondary' }}
              >
                <InfoOutlinedIcon fontSize="small" />
                <Typography variant="caption">
                  아래 룰렛을 돌려서 당첨 항목을 뽑아보세요!
                </Typography>
              </Stack>
            )}

            {isSpinning && (
              <Typography
                variant="subtitle2"
                color="secondary"
                sx={{ mb: 2, fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}
              >
                🌀 룰렛이 신나게 도는 중...
              </Typography>
            )}

            {winner && !isSpinning && (
              <Typography
                variant="subtitle1"
                color="success.main"
                sx={{ mb: 2, fontWeight: 'bold' }}
              >
                🎉 당첨 항목: {winner.text}
              </Typography>
            )}

            <canvas
              ref={canvasRef}
              style={{
                width: canvasSize,
                height: canvasSize,
                maxWidth: '100%',
                cursor: isSpinning ? 'not-allowed' : 'pointer',
              }}
              onClick={handleSpin}
            />
          </Card>
        </Stack>
      </Stack>

      {/* Winner Reveal Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        PaperProps={{
          sx: {
            p: 3,
            textAlign: 'center',
            maxWidth: 360,
            width: '100%',
            borderRadius: 2,
            boxShadow: (t) => t.customShadows?.z24,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h5">🎉 당첨 결과 🎉</Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: winner?.color + '20',
              color: winner?.color,
              border: `2px solid ${winner?.color}`,
              mb: 3,
            }}
          >
            <AutorenewRoundedIcon sx={{ fontSize: 40, animation: 'spin 4s linear infinite' }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
            {winner?.text}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            축하합니다! 무작위 선택 결과가 매칭되었습니다.
          </Typography>
        </DialogContent>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(false)}
          fullWidth
          size="large"
          sx={{ mt: 1 }}
        >
          확인
        </Button>
      </Dialog>
    </DashboardContent>
  );
}
