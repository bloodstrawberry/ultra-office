'use client';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

export function AnalogClockTab() {
  const [time, setTime] = useState('10:10');

  useEffect(() => {
    setTime(formatTime(new Date()));
  }, []);

  const [hours, minutes] = time.split(':').map(Number);
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = minutes * 6;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, py: 2 }}>
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          아날로그 시계
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          시간을 입력하면 시침과 분침의 위치가 바로 표시됩니다.
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
          aria-label={`${String(hours).padStart(2, '0')}시 ${String(minutes).padStart(2, '0')}분을 가리키는 아날로그 시계`}
          sx={{ display: 'block', width: '100%', maxWidth: 320, mx: 'auto', color: 'primary.main' }}
        >
          <circle
            cx="160"
            cy="160"
            r="150"
            fill="var(--mui-palette-background-paper)"
            stroke="currentColor"
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
                stroke="currentColor"
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
                fill="var(--mui-palette-text-primary)"
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
            stroke="var(--mui-palette-text-primary)"
            strokeWidth="9"
            strokeLinecap="round"
            transform={`rotate(${hourAngle} 160 160)`}
          />
          <line
            x1="160"
            y1="180"
            x2="160"
            y2="48"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
            transform={`rotate(${minuteAngle} 160 160)`}
          />
          <circle cx="160" cy="160" r="7" fill="currentColor" />
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
          value={time}
          onChange={(event) => {
            if (/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(event.target.value)) {
              setTime(event.target.value);
            }
          }}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { step: 60, 'aria-label': '아날로그 시계 시간 입력' },
          }}
          sx={{ width: 180 }}
        />
        <Button
          variant="outlined"
          startIcon={<AccessTimeRoundedIcon />}
          onClick={() => setTime(formatTime(new Date()))}
        >
          현재 시간
        </Button>
      </Box>
    </Box>
  );
}
