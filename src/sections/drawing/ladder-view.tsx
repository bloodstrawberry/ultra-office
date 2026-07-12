'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import IconButton from '@mui/material/IconButton';
import CardContent from '@mui/material/CardContent';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

interface Bridge {
  y: number; // 0 ~ 1 relative height
  fromCol: number; // 0 ~ N-2
}

interface Point {
  x: number;
  y: number;
}

interface Participant {
  id: string;
  name: string;
}

interface Reward {
  id: string;
  text: string;
}

interface BallState {
  colIndex: number;
  currentPointIndex: number;
  x: number;
  y: number;
  speed: number;
  color: string;
  isFinished: boolean;
  path: Point[];
}

const LINE_COLORS = [
  '#FF3B30', // Red
  '#FF9500', // Orange
  '#FFCC00', // Yellow
  '#34C759', // Green
  '#007AFF', // Blue
  '#5856D6', // Purple
  '#AF52DE', // Violet
  '#FF2D55', // Pink
];

export function LadderView() {
  const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Participants & Rewards
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: '철수' },
    { id: '2', name: '영희' },
    { id: '3', name: '민수' },
    { id: '4', name: '지영' },
  ]);

  const [rewards, setRewards] = useState<Reward[]>([
    { id: '1', text: '커피 쏘기' },
    { id: '2', text: '통과' },
    { id: '3', text: '통과' },
    { id: '4', text: '꽝 (청소)' },
  ]);

  const [bridges, setBridges] = useState<Bridge[]>([]);
  const [computedPaths, setComputedPaths] = useState<Point[][]>([]);
  const [results, setResults] = useState<Record<string, string>>({}); // { name: reward }

  // Animation states
  const [balls, setBalls] = useState<BallState[]>([]);
  const [isReady, setIsReady] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const N = participants.length;
  const canvasWidth = Math.max(N * 120, 600);
  const canvasHeight = 450;
  const sidePadding = 60;
  const colSpacing = (canvasWidth - sidePadding * 2) / (N - 1 || 1);

  const getX = useCallback((col: number) => sidePadding + col * colSpacing, [colSpacing]);

  // Generate a random valid ladder
  const generateLadder = useCallback(() => {
    const numLevels = 10;
    const tempBridges: Bridge[] = [];

    for (let level = 0; level < numLevels; level++) {
      const y = (level + 1) / (numLevels + 1); // relative y (0.1 ~ 0.9)
      const availableCols = Array.from({ length: N - 1 }, (_, i) => i);

      // Shuffle columns randomly
      for (let i = availableCols.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableCols[i], availableCols[j]] = [availableCols[j], availableCols[i]];
      }

      const levelBridges: number[] = [];
      for (const col of availableCols) {
        // Prevent adjacent bridges at the same level
        if (levelBridges.some((existingCol) => Math.abs(existingCol - col) <= 1)) {
          continue;
        }
        // 60% probability of placing a bridge
        if (Math.random() < 0.6) {
          levelBridges.push(col);
          tempBridges.push({ y, fromCol: col });
        }
      }
    }

    // Sort by height
    tempBridges.sort((a, b) => a.y - b.y);
    setBridges(tempBridges);
    setResults({});
    setBalls([]);
    setIsAnimating(false);
    setIsReady(true);
  }, [N]);

  // Pre-compute paths for all participants
  useEffect(() => {
    if (!isReady || (bridges.length === 0 && N > 1)) {
      generateLadder();
      return;
    }

    const pathsList: Point[][] = [];
    for (let c = 0; c < N; c++) {
      let currentCol = c;
      const points: Point[] = [{ x: getX(currentCol), y: 0 }];

      for (const bridge of bridges) {
        const bridgeY = bridge.y * canvasHeight;
        if (bridge.fromCol === currentCol) {
          // Cross to the right
          points.push({ x: getX(currentCol), y: bridgeY });
          currentCol += 1;
          points.push({ x: getX(currentCol), y: bridgeY });
        } else if (bridge.fromCol + 1 === currentCol) {
          // Cross to the left
          points.push({ x: getX(currentCol), y: bridgeY });
          currentCol -= 1;
          points.push({ x: getX(currentCol), y: bridgeY });
        }
      }

      // Drop to bottom
      points.push({ x: getX(currentCol), y: canvasHeight });
      pathsList.push(points);
    }
    setComputedPaths(pathsList);
  }, [bridges, N, getX, isReady, generateLadder]);

  // Handle participant change
  const handleAddParticipant = () => {
    if (participants.length >= 8) return;
    const nextId = String(Date.now());
    setParticipants((prev) => [...prev, { id: nextId, name: `참가자 ${prev.length + 1}` }]);
    setRewards((prev) => [...prev, { id: nextId, text: `선택 ${prev.length + 1}` }]);
    setIsReady(false);
  };

  const handleRemoveParticipant = (index: number) => {
    if (participants.length <= 2) return;
    setParticipants((prev) => prev.filter((_, i) => i !== index));
    setRewards((prev) => prev.filter((_, i) => i !== index));
    setIsReady(false);
  };

  const handleNameChange = (index: number, val: string) => {
    setParticipants((prev) => {
      const copy = [...prev];
      copy[index].name = val;
      return copy;
    });
  };

  const handleRewardChange = (index: number, val: string) => {
    setRewards((prev) => {
      const copy = [...prev];
      copy[index].text = val;
      return copy;
    });
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    ctx.scale(dpr, dpr);

    // Clear Canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Colors according to theme
    const isDark = theme.palette.mode === 'dark';
    const mainLineColor = isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)';
    const activeTraceWidth = 6;
    const defaultLineWidth = 4;

    // Draw main vertical lines
    ctx.lineWidth = defaultLineWidth;
    ctx.lineCap = 'round';
    for (let c = 0; c < N; c++) {
      ctx.strokeStyle = mainLineColor;
      ctx.beginPath();
      ctx.moveTo(getX(c), 0);
      ctx.lineTo(getX(c), canvasHeight);
      ctx.stroke();
    }

    // Draw bridges
    for (const bridge of bridges) {
      ctx.strokeStyle = mainLineColor;
      ctx.lineWidth = defaultLineWidth;
      ctx.beginPath();
      const xStart = getX(bridge.fromCol);
      const xEnd = getX(bridge.fromCol + 1);
      const yVal = bridge.y * canvasHeight;
      ctx.moveTo(xStart, yVal);
      ctx.lineTo(xEnd, yVal);
      ctx.stroke();
    }

    // Draw completed paths tracers (glowing line segment)
    balls.forEach((ball) => {
      ctx.lineWidth = activeTraceWidth;
      ctx.strokeStyle = ball.color;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      // Draw path up to current ball position
      if (ball.currentPointIndex > 0) {
        ctx.moveTo(ball.path[0].x, ball.path[0].y);
        for (let i = 1; i < ball.currentPointIndex; i++) {
          ctx.lineTo(ball.path[i].x, ball.path[i].y);
        }
        ctx.lineTo(ball.x, ball.y);
        ctx.stroke();
      }
    });

    // Draw balls
    balls.forEach((ball) => {
      if (ball.isFinished) return;

      // Glow effect
      ctx.shadowBlur = 12;
      ctx.shadowColor = ball.color;

      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;
    });
  }, [bridges, N, getX, balls, theme.palette.mode, canvasWidth]);

  // Animation controller logic
  useEffect(() => {
    if (!isAnimating || balls.length === 0) return;

    // Check if all balls have finished
    const allFinished = balls.every((b) => b.isFinished);
    if (allFinished) {
      setIsAnimating(false);
      return;
    }

    const animId = requestAnimationFrame(() => {
      setBalls((prevBalls) =>
        prevBalls.map((ball) => {
          if (ball.isFinished) return ball;

          const target = ball.path[ball.currentPointIndex];
          if (!target) {
            // Path complete
            const finalX = ball.path[ball.path.length - 1].x;
            const finalCol = Math.round((finalX - sidePadding) / colSpacing);
            const rewardText = rewards[finalCol]?.text || '';
            const participantName = participants[ball.colIndex].name;

            setResults((prev) => ({
              ...prev,
              [participantName]: rewardText,
            }));

            return { ...ball, isFinished: true };
          }

          // Move ball towards target point
          const dx = target.x - ball.x;
          const dy = target.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= ball.speed) {
            // Snapped to target point, advance index
            return {
              ...ball,
              x: target.x,
              y: target.y,
              currentPointIndex: ball.currentPointIndex + 1,
            };
          }

          // Step towards target
          const ux = dx / distance;
          const uy = dy / distance;
          return {
            ...ball,
            x: ball.x + ux * ball.speed,
            y: ball.y + uy * ball.speed,
          };
        })
      );
    });

    return () => cancelAnimationFrame(animId);
  }, [isAnimating, balls, colSpacing, sidePadding, rewards, participants]);

  // Start animation for a specific column
  const startSingle = (colIndex: number) => {
    if (isAnimating) return;
    if (computedPaths.length === 0) return;

    const path = computedPaths[colIndex];
    if (!path) return;

    // Reset results for this participant if already exists
    const pName = participants[colIndex].name;
    setResults((prev) => {
      const copy = { ...prev };
      delete copy[pName];
      return copy;
    });

    const newBall: BallState = {
      colIndex,
      currentPointIndex: 1,
      x: path[0].x,
      y: path[0].y,
      speed: 5,
      color: LINE_COLORS[colIndex % LINE_COLORS.length],
      isFinished: false,
      path,
    };

    setBalls((prev) => {
      // Remove any existing ball for this participant
      const filtered = prev.filter((b) => b.colIndex !== colIndex);
      return [...filtered, newBall];
    });

    setIsAnimating(true);
  };

  // Start animation for all columns sequentially
  const startAll = () => {
    if (isAnimating) return;
    if (computedPaths.length === 0) return;

    setResults({});
    const initialBalls = computedPaths.map((path, index) => ({
      colIndex: index,
      currentPointIndex: 1,
      x: path[0].x,
      y: path[0].y,
      speed: 4.5,
      color: LINE_COLORS[index % LINE_COLORS.length],
      isFinished: false,
      path,
    }));

    setBalls(initialBalls);
    setIsAnimating(true);
  };

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={2} sx={{ mb: 4 }}>
        <Typography variant="h4">사다리 타기</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          참여자의 이름과 당첨/벌칙 내용을 작성한 뒤 사다리를 돌려서 결과를 맞춰보세요.
        </Typography>
      </Stack>

      <Stack spacing={3} direction={{ xs: 'column', lg: 'row' }}>
        {/* Left Side: Setup Column */}
        <Card sx={{ flexShrink: 0, width: { xs: '100%', lg: 380 } }}>
          <CardHeader
            title="게임 설정"
            subheader={`현재 참여자 수: ${N}명 (최소 2명, 최대 8명)`}
            action={
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddParticipant}
                disabled={participants.length >= 8 || isAnimating}
                startIcon={<AddRoundedIcon />}
              >
                인원 추가
              </Button>
            }
          />
          <Divider />
          <CardContent sx={{ maxHeight: 560, overflowY: 'auto' }}>
            <Stack spacing={2.5}>
              {participants.map((p, idx) => (
                <Stack key={p.id} direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 8,
                      height: 36,
                      borderRadius: 1,
                      bgcolor: LINE_COLORS[idx % LINE_COLORS.length],
                    }}
                  />
                  <TextField
                    size="small"
                    label={`참가자 ${idx + 1}`}
                    value={p.name}
                    onChange={(e) => handleNameChange(idx, e.target.value)}
                    disabled={isAnimating}
                    fullWidth
                  />
                  <TextField
                    size="small"
                    label={`결과 ${idx + 1}`}
                    value={rewards[idx]?.text || ''}
                    onChange={(e) => handleRewardChange(idx, e.target.value)}
                    disabled={isAnimating}
                    fullWidth
                  />
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveParticipant(idx)}
                    disabled={participants.length <= 2 || isAnimating}
                    size="small"
                  >
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </CardContent>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', gap: 1.5 }}>
            <Button
              variant="outlined"
              color="inherit"
              fullWidth
              onClick={generateLadder}
              disabled={isAnimating}
              startIcon={<AutorenewRoundedIcon />}
            >
              다시 그리기
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={startAll}
              disabled={isAnimating}
              startIcon={<PlayArrowRoundedIcon />}
            >
              전체 시작
            </Button>
          </Box>
        </Card>

        {/* Right Side: Game Board (Canvas) */}
        <Stack spacing={3} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Card
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              overflowX: 'auto',
              position: 'relative',
            }}
          >
            <Box
              sx={{
                width: canvasWidth,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              {/* Top Participant Names */}
              <Box sx={{ position: 'relative', mb: 2, height: 40, width: canvasWidth }}>
                {participants.map((p, idx) => (
                  <Box
                    key={p.id}
                    sx={{
                      position: 'absolute',
                      left: getX(idx),
                      top: 0,
                    }}
                  >
                    <Button
                      size="small"
                      variant="soft"
                      onClick={() => startSingle(idx)}
                      disabled={isAnimating}
                      sx={{
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        px: 1.5,
                        py: 0.5,
                        minWidth: 70,
                        backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] + '20',
                        color: LINE_COLORS[idx % LINE_COLORS.length],
                        border: `1px solid ${LINE_COLORS[idx % LINE_COLORS.length]}`,
                        fontWeight: 'bold',
                        zIndex: 10,
                      }}
                    >
                      {p.name}
                    </Button>
                  </Box>
                ))}
              </Box>

              {/* Canvas Board */}
              <canvas
                ref={canvasRef}
                style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  display: 'block',
                }}
              />

              {/* Bottom Rewards Text */}
              <Box sx={{ position: 'relative', mt: 2, height: 40, width: canvasWidth }}>
                {rewards.map((r, idx) => (
                  <Box
                    key={r.id}
                    sx={{
                      position: 'absolute',
                      left: getX(idx),
                      top: 0,
                    }}
                  >
                    <Box
                      sx={{
                        transform: 'translateX(-50%)',
                        whiteSpace: 'nowrap',
                        px: 2,
                        py: 0.8,
                        borderRadius: 1,
                        bgcolor: 'background.neutral',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        color: 'text.primary',
                        fontSize: '0.875rem',
                        fontWeight: 'medium',
                      }}
                    >
                      {r.text}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Card>

          {/* Results Summary Card */}
          {Object.keys(results).length > 0 && (
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                🎯 결과 요약
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
                }}
              >
                {participants.map((p) => {
                  const rewardVal = results[p.name];
                  if (!rewardVal) return null;
                  return (
                    <Box
                      key={p.id}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        bgcolor: 'background.neutral',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        참가자
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                        {p.name}
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        결과
                      </Typography>
                      <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                        {rewardVal}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          )}
        </Stack>
      </Stack>
    </DashboardContent>
  );
}
