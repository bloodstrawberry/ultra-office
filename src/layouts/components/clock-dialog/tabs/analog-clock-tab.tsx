'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

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

export function AnalogClockTab() {
  const [time, setTime] = useState('10:10:00');
  const [isRunning, setIsRunning] = useState(true);
  const anchorRef = useRef<{ seconds: number; startedAt: number } | null>(null);

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

  const [hours, minutes, seconds] = time.split(':').map(Number);
  const hourAngle = ((hours % 12) + minutes / 60 + seconds / 3600) * 30;
  const minuteAngle = (minutes + seconds / 60) * 6;
  const secondAngle = seconds * 6;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          아날로그 시계
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          시계를 정지한 뒤 시간을 바꾸고 시작하면, 그 시간부터 다시 움직입니다.
        </Typography>
      </Box>

      <Card
        variant="outlined"
        sx={{
          width: '100%',
          maxWidth: 460,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Box
          component="svg"
          viewBox="0 0 320 320"
          role="img"
          aria-label={`${String(hours).padStart(2, '0')}시 ${String(minutes).padStart(2, '0')}분 ${String(seconds).padStart(2, '0')}초를 가리키는 아날로그 시계`}
          sx={{ display: 'block', width: '100%', maxWidth: 320, mx: 'auto' }}
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
            strokeWidth="9"
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 160 160)`}
          />
          <line
            x1="160"
            y1="180"
            x2="160"
            y2="48"
            stroke={CLOCK_COLORS.minute}
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 160 160)`}
          />
          <line
            x1="160"
            y1="188"
            x2="160"
            y2="38"
            stroke={CLOCK_COLORS.second}
            strokeWidth="2.5"
            strokeLinecap="round"
            transform={`rotate(${secondAngle} 160 160)`}
          />
          <circle cx="160" cy="160" r="7" fill={CLOCK_COLORS.numbers} />
          <circle cx="160" cy="160" r="3" fill={CLOCK_COLORS.second} />
        </Box>
        <Typography
          variant="h4"
          sx={{ mt: 2, fontWeight: 800, fontVariantNumeric: 'tabular-nums' }}
        >
          {time}
        </Typography>
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
    </Box>
  );
}
