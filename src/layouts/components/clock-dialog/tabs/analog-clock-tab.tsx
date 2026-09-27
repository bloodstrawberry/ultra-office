'use client';

import type { PointerEvent as ReactPointerEvent } from 'react';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import ZoomOutMapRoundedIcon from '@mui/icons-material/ZoomOutMapRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;

const toSeconds = (time: string) => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatSeconds = (totalSeconds: number) => {
  const secondsInDay = ((totalSeconds % 86400) + 86400) % 86400;
  const hours = Math.floor(secondsInDay / 3600);
  const minutes = Math.floor((secondsInDay % 3600) / 60);
  const seconds = secondsInDay % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
};

const CLOCK_COLORS = {
  face: '#ffffff',
  border: '#334155',
  marks: '#64748b',
  numbers: '#0f172a',
  minute: '#2563eb',
  second: '#dc2626',
};

type ClockPoint = { x: number; y: number };
type ClockRect = ClockPoint & { width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const rectBetween = (start: ClockPoint, end: ClockPoint): ClockRect => ({
  x: Math.min(start.x, end.x),
  y: Math.min(start.y, end.y),
  width: Math.abs(start.x - end.x),
  height: Math.abs(start.y - end.y),
});

// One minute mark spans 60 seconds of minute-hand movement (6 degrees).
const makeSecondTickPath = (stepSeconds: number, innerRadius: number) =>
  Array.from({ length: 3600 / stepSeconds }, (_, index) => index * stepSeconds)
    .filter((second) => second % 60 !== 0 && (stepSeconds !== 1 || second % 10 !== 0))
    .map((second) => {
      const angle = (second * Math.PI) / 1800;
      const x = Math.sin(angle);
      const y = -Math.cos(angle);
      return `M ${(160 + x * innerRadius).toFixed(3)} ${(160 + y * innerRadius).toFixed(3)} L ${(160 + x * 143).toFixed(3)} ${(160 + y * 143).toFixed(3)}`;
    })
    .join(' ');

const TEN_SECOND_TICKS = makeSecondTickPath(10, 139);
const ONE_SECOND_TICKS = makeSecondTickPath(1, 141);

export function AnalogClockTab() {
  const [time, setTime] = useState('10:10:00');
  const [isRunning, setIsRunning] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selection, setSelection] = useState<ClockRect | null>(null);
  const [zoomArea, setZoomArea] = useState<ClockRect | null>(null);
  const [viewportAspect, setViewportAspect] = useState(1);
  const [viewportWidth, setViewportWidth] = useState(320);
  const [handWidths, setHandWidths] = useState({ hour: 9, minute: 5, second: 2.5 });
  const anchorRef = useRef<{ seconds: number; startedAt: number } | null>(null);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragStartRef = useRef<{ clock: ClockPoint; client: ClockPoint } | null>(null);
  const isZoomed = zoomArea !== null;

  const zoomBy = useCallback(
    (factor: number, focus?: ClockPoint) => {
      setZoomArea((current) => {
        if (!current) return current;

        const aspect = viewportAspect || 1;
        const width = Math.max(current.width, current.height * aspect);
        const height = width / aspect;
        const x = current.x + current.width / 2 - width / 2;
        const y = current.y + current.height / 2 - height / 2;
        const nextWidth = clamp(
          width * factor,
          0.5 * Math.max(1, aspect),
          320 * Math.max(1, aspect)
        );
        if (nextWidth >= 320 * Math.max(1, aspect)) return null;

        const appliedFactor = nextWidth / width;
        const nextHeight = nextWidth / aspect;
        const anchor = focus ?? { x: x + width / 2, y: y + height / 2 };
        const nextX = anchor.x - (anchor.x - x) * appliedFactor;
        const nextY = anchor.y - (anchor.y - y) * appliedFactor;
        return {
          x: clamp(nextX, Math.min(0, 320 - nextWidth), Math.max(0, 320 - nextWidth)),
          y: clamp(nextY, Math.min(0, 320 - nextHeight), Math.max(0, 320 - nextHeight)),
          width: nextWidth,
          height: nextHeight,
        };
      });
    },
    [viewportAspect]
  );

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === fullscreenRef.current);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return undefined;
    const observer = new ResizeObserver(() => {
      const { width, height } = svg.getBoundingClientRect();
      if (height > 0) {
        setViewportAspect(width / height);
        setViewportWidth(width);
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !isZoomed) return undefined;

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const matrix = svg.getScreenCTM();
      if (!matrix) return;
      const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 600 : 1);
      zoomBy(Math.exp(clamp(delta * 0.00035, -0.08, 0.08)), point);
    };

    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [isZoomed, zoomBy]);

  useEffect(() => {
    const now = new Date();
    anchorRef.current = {
      seconds: toSeconds(formatTime(now)),
      startedAt: now.getTime() - now.getMilliseconds(),
    };
    setTime(formatTime(now));
  }, []);

  useEffect(() => {
    if (!isRunning) return undefined;

    const tick = () => {
      if (!anchorRef.current) return;
      const elapsedSeconds = Math.floor((Date.now() - anchorRef.current.startedAt) / 1000);
      setTime(formatSeconds(anchorRef.current.seconds + elapsedSeconds));
    };

    tick();
    const interval = window.setInterval(tick, 200);
    return () => window.clearInterval(interval);
  }, [isRunning]);

  const handleToggleRunning = () => {
    if (isRunning) {
      if (anchorRef.current) {
        const elapsedSeconds = Math.floor((Date.now() - anchorRef.current.startedAt) / 1000);
        setTime(formatSeconds(anchorRef.current.seconds + elapsedSeconds));
      }
      setIsRunning(false);
      return;
    }

    anchorRef.current = { seconds: toSeconds(time), startedAt: Date.now() };
    setIsRunning(true);
  };

  const handleResetToNow = () => {
    const now = new Date();
    const currentTime = formatTime(now);
    anchorRef.current = {
      seconds: toSeconds(currentTime),
      startedAt: now.getTime() - now.getMilliseconds(),
    };
    setTime(currentTime);
    setIsRunning(true);
  };

  const handleFullscreen = async () => {
    if (document.fullscreenElement === fullscreenRef.current) {
      await document.exitFullscreen();
    } else {
      await fullscreenRef.current?.requestFullscreen();
    }
  };

  const pointerToClock = (event: ReactPointerEvent<SVGSVGElement>): ClockPoint | null => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: clamp(point.x, 0, 320), y: clamp(point.y, 0, 320) };
  };

  const handlePointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    const point = pointerToClock(event);
    if (!point) return;
    event.preventDefault();
    window.getSelection()?.removeAllRanges();
    dragStartRef.current = { clock: point, client: { x: event.clientX, y: event.clientY } };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    if (Math.hypot(event.clientX - start.client.x, event.clientY - start.client.y) < 6) return;
    const point = pointerToClock(event);
    if (point) setSelection(rectBetween(start.clock, point));
  };

  const handlePointerUp = (event: ReactPointerEvent<SVGSVGElement>) => {
    const start = dragStartRef.current;
    if (!start) return;
    const point = pointerToClock(event);
    dragStartRef.current = null;
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    if (!point) return;
    if (
      Math.abs(event.clientX - start.client.x) < 10 ||
      Math.abs(event.clientY - start.client.y) < 10
    )
      return;
    setZoomArea(rectBetween(start.clock, point));
  };

  const aspect = viewportAspect || 1;
  const zoomWidth = zoomArea ? Math.max(zoomArea.width, zoomArea.height * aspect) : 320;
  const zoomHeight = zoomArea ? Math.max(zoomArea.height, zoomArea.width / aspect) : 320;
  const zoomViewBox = zoomArea
    ? `${zoomArea.x + zoomArea.width / 2 - zoomWidth / 2} ${zoomArea.y + zoomArea.height / 2 - zoomHeight / 2} ${zoomWidth} ${zoomHeight}`
    : '0 0 320 320';
  const showOneSecondTicks =
    !!zoomArea && (viewportWidth / zoomWidth) * ((143 * Math.PI) / 1800) >= 3;

  const [hours, minutes, seconds] = time.split(':').map(Number);
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <Box
      ref={fullscreenRef}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 1.5, sm: 2 },
        py: 2,
        '&:fullscreen': {
          width: '100vw',
          height: '100dvh',
          p: { xs: 1.5, sm: 3 },
          bgcolor: 'background.default',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          아날로그 시계
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          시계 위에서 드래그하면 선택한 영역이 확대됩니다. 정지 후 시간을 변경할 수 있습니다.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ZoomInRoundedIcon />}
          disabled={!zoomArea}
          onClick={() => zoomBy(0.95)}
        >
          확대
        </Button>
        <Button
          variant="outlined"
          startIcon={<ZoomOutRoundedIcon />}
          disabled={!zoomArea}
          onClick={() => zoomBy(1 / 0.95)}
        >
          축소
        </Button>
        <Button
          variant="outlined"
          startIcon={<ZoomOutMapRoundedIcon />}
          disabled={!zoomArea}
          onClick={() => {
            setZoomArea(null);
          }}
        >
          확대 해제
        </Button>
        <Button
          variant="outlined"
          startIcon={isFullscreen ? <FullscreenExitRoundedIcon /> : <FullscreenRoundedIcon />}
          onClick={handleFullscreen}
        >
          {isFullscreen ? '전체 화면 종료' : '전체 화면'}
        </Button>
      </Box>

      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: isFullscreen ? 'none' : 460,
          flex: isFullscreen ? 1 : 'none',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: isFullscreen ? 1 : { xs: 2, sm: 3 },
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Box
          component="svg"
          ref={svgRef}
          viewBox={zoomViewBox}
          role="img"
          aria-label={`${String(hours).padStart(2, '0')}시 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초를 가리키는 아날로그 시계`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onMouseDown={(event) => {
            if (event.button === 0) event.preventDefault();
          }}
          onDragStart={(event) => event.preventDefault()}
          onPointerCancel={() => {
            dragStartRef.current = null;
            setSelection(null);
          }}
          sx={{
            display: 'block',
            width: '100%',
            height: isFullscreen ? '100%' : 320,
            maxWidth: isFullscreen ? 'none' : 320,
            flex: isFullscreen ? 1 : 'none',
            minHeight: 0,
            mx: 'auto',
            cursor: 'crosshair',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
          }}
        >
          <circle
            cx="160"
            cy="160"
            r="150"
            fill={CLOCK_COLORS.face}
            stroke={CLOCK_COLORS.border}
            strokeWidth="5"
          />
          {Array.from({ length: 60 }, (_, index) => {
            const angle = (index * Math.PI) / 30;
            const major = index % 5 === 0;
            const outer = 143;
            const inner = major ? 127 : 136;
            return (
              <line
                key={index}
                x1={160 + Math.sin(angle) * inner}
                y1={160 - Math.cos(angle) * inner}
                x2={160 + Math.sin(angle) * outer}
                y2={160 - Math.cos(angle) * outer}
                stroke={CLOCK_COLORS.marks}
                strokeWidth={major ? 3 : 1.5}
                opacity={major ? 0.8 : 0.35}
              />
            );
          })}
          {zoomArea && (
            <path
              d={TEN_SECOND_TICKS}
              fill="none"
              stroke={CLOCK_COLORS.marks}
              strokeWidth="0.7"
              opacity="0.55"
              pointerEvents="none"
            />
          )}
          {showOneSecondTicks && (
            <path
              d={ONE_SECOND_TICKS}
              fill="none"
              stroke={CLOCK_COLORS.marks}
              strokeWidth="0.2"
              opacity="0.55"
              pointerEvents="none"
            />
          )}
          {Array.from({ length: 12 }, (_, index) => {
            const number = index + 1;
            const angle = (number * Math.PI) / 6;
            return (
              <text
                key={number}
                x={160 + Math.sin(angle) * 106}
                y={160 - Math.cos(angle) * 106}
                textAnchor="middle"
                dominantBaseline="central"
                fill={CLOCK_COLORS.numbers}
                fontSize="20"
                fontWeight="700"
                pointerEvents="none"
                style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
              >
                {number}
              </text>
            );
          })}
          <line
            x1="160"
            y1="174"
            x2="160"
            y2="86"
            stroke={CLOCK_COLORS.numbers}
            strokeWidth={handWidths.hour}
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 160 160)`}
          />
          <line
            x1="160"
            y1="180"
            x2="160"
            y2="48"
            stroke={CLOCK_COLORS.minute}
            strokeWidth={handWidths.minute}
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 160 160)`}
          />
          <line
            x1="160"
            y1="188"
            x2="160"
            y2="38"
            stroke={CLOCK_COLORS.second}
            strokeWidth={handWidths.second}
            strokeLinecap="round"
            transform={`rotate(${secondAngle} 160 160)`}
          />
          <circle cx="160" cy="160" r="7" fill={CLOCK_COLORS.numbers} />
          <circle cx="160" cy="160" r="3" fill={CLOCK_COLORS.second} />
          {selection && (
            <rect
              x={selection.x}
              y={selection.y}
              width={selection.width}
              height={selection.height}
              fill="rgba(37, 99, 235, 0.18)"
              stroke={CLOCK_COLORS.minute}
              strokeWidth="1"
              strokeDasharray="4 3"
              pointerEvents="none"
            />
          )}
        </Box>
        <Typography
          variant="h4"
          sx={{ mt: 2, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {time}
        </Typography>
        {zoomArea && (
          <>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {showOneSecondTicks
                ? '분침 기준 보조 눈금: 1초 간격'
                : '분침 기준 보조 눈금: 10초 간격 · 더 확대하면 1초 눈금 표시'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              시계 위에서 마우스 휠 또는 확대·축소 버튼으로 배율 조절
            </Typography>
          </>
        )}
      </Card>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 1.5,
        }}
      >
        <TextField
          label="표시할 시간"
          type="time"
          size="small"
          disabled={isRunning}
          value={time}
          onChange={(event) => {
            if (/^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d$/.test(event.target.value)) {
              setTime(event.target.value);
            }
          }}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { step: 1, 'aria-label': '아날로그 시계 시 분 초 입력' },
          }}
          sx={{ width: 200 }}
        />
        <Button
          variant="contained"
          startIcon={isRunning ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          onClick={handleToggleRunning}
        >
          {isRunning ? '정지' : '시작'}
        </Button>
        <Button variant="outlined" startIcon={<AccessTimeRoundedIcon />} onClick={handleResetToNow}>
          현재 시간으로
        </Button>
      </Box>

      <Card
        component="section"
        variant="outlined"
        aria-label="바늘 굵기 설정"
        sx={{
          width: '100%',
          maxWidth: isFullscreen ? 900 : 460,
          px: 2,
          py: 1,
          borderRadius: 2,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          바늘 굵기 설정
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 0, sm: 3 },
          }}
        >
          {(
            [
              { key: 'hour', label: '시침', color: CLOCK_COLORS.numbers },
              { key: 'minute', label: '분침', color: CLOCK_COLORS.minute },
              { key: 'second', label: '초침', color: CLOCK_COLORS.second },
            ] as const
          ).map(({ key, label, color }) => (
            <Box key={key}>
              <Typography variant="caption" component="label" htmlFor={`${key}-hand-width`}>
                {label} {handWidths[key]}
              </Typography>
              <Slider
                id={`${key}-hand-width`}
                aria-label={`${label} 굵기`}
                value={handWidths[key]}
                min={0.5}
                max={20}
                step={0.5}
                onChange={(_, value) =>
                  setHandWidths((current) => ({ ...current, [key]: value as number }))
                }
                sx={{ color, display: 'block', mt: 0, mb: 0.5 }}
              />
            </Box>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
