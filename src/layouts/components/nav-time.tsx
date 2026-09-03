'use client';

import type { BoxProps } from '@mui/material/Box';

import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import { ClockDialog } from './clock-dialog';

// ----------------------------------------------------------------------

// Segment activation map for 0-9: [a, b, c, d, e, f, g]
const DIGIT_SEGMENTS: Record<string, boolean[]> = {
  '0': [true, true, true, true, true, true, false],
  '1': [false, true, true, false, false, false, false],
  '2': [true, true, false, true, true, false, true],
  '3': [true, true, true, true, false, false, true],
  '4': [false, true, true, false, false, true, true],
  '5': [true, false, true, true, false, true, true],
  '6': [true, false, true, true, true, true, true],
  '7': [true, true, true, false, false, false, false],
  '8': [true, true, true, true, true, true, true],
  '9': [true, true, true, true, false, true, true],
};

// Segment paths within 0 0 44 76 viewBox
const SEGMENT_PATHS = [
  // a: top horizontal
  'M 7.5 4.5 L 11 1 L 33 1 L 36.5 4.5 L 33 8 L 11 8 Z',
  // b: top right vertical
  'M 39.5 7 L 43 10.5 L 43 33.5 L 39.5 37 L 36 33.5 L 36 10.5 Z',
  // c: bottom right vertical
  'M 39.5 39 L 43 42.5 L 43 65.5 L 39.5 69 L 36 65.5 L 36 42.5 Z',
  // d: bottom horizontal
  'M 7.5 71.5 L 11 68 L 33 68 L 36.5 71.5 L 33 75 L 11 75 Z',
  // e: bottom left vertical
  'M 4.5 39 L 8 42.5 L 8 65.5 L 4.5 69 L 1 65.5 L 1 42.5 Z',
  // f: top left vertical
  'M 4.5 7 L 8 10.5 L 8 33.5 L 4.5 37 L 1 33.5 L 1 10.5 Z',
  // g: middle horizontal
  'M 7.5 38 L 11 34.5 L 33 34.5 L 36.5 38 L 33 41.5 L 11 41.5 Z',
];

interface SevenSegmentDigitProps {
  digit: string;
  height?: number;
}

function SevenSegmentDigit({ digit, height = 28 }: SevenSegmentDigitProps) {
  const activeSegments = DIGIT_SEGMENTS[digit] || DIGIT_SEGMENTS['0'];
  const width = Math.round((height * 44) / 76);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 44 76"
      style={{
        overflow: 'visible',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      <g transform="skewX(-6)" style={{ transformOrigin: 'center' }}>
        {SEGMENT_PATHS.map((path, idx) => {
          const isActive = activeSegments[idx];
          if (!isActive) return null;
          return <path key={idx} d={path} fill="currentColor" />;
        })}
      </g>
    </svg>
  );
}

interface SevenSegmentColonProps {
  height?: number;
}

function SevenSegmentColon({ height = 28 }: SevenSegmentColonProps) {
  const width = Math.round((height * 16) / 76);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 16 76"
      style={{
        overflow: 'visible',
        display: 'inline-block',
        verticalAlign: 'middle',
      }}
    >
      <g transform="skewX(-6)" style={{ transformOrigin: 'center' }}>
        {/* Top dot: centered at x=4 in 0..16 box */}
        <rect x="4" y="23" width="8" height="8" rx="1" fill="currentColor" />
        {/* Bottom dot: centered at x=4 in 0..16 box */}
        <rect x="4" y="45" width="8" height="8" rx="1" fill="currentColor" />
      </g>
    </svg>
  );
}

// ----------------------------------------------------------------------

export interface NavTimeProps extends BoxProps {
  showIcon?: boolean;
  digitHeight?: number;
}

export function NavTime({ sx, showIcon = false, digitHeight = 26, ...other }: NavTimeProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [timeState, setTimeState] = useState({
    period: '오후',
    hours: '12',
    minutes: '00',
    seconds: '00',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h24 = now.getHours();
      const period = h24 < 12 ? '오전' : '오후';
      const h12 = String(h24 % 12 || 12);
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');

      setTimeState({
        period,
        hours: h12,
        minutes,
        seconds,
      });
      setMounted(true);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Tooltip title="시계 도구 (타이머 · 스톱워치 · 세계시간)" arrow placement="bottom">
        <Box
          role="button"
          tabIndex={0}
          onClick={() => setDialogOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDialogOpen(true);
            }
          }}
          sx={[
            {
              display: 'inline-flex',
              alignItems: 'flex-end',
              gap: 0.8,
              color: 'text.primary',
              userSelect: 'none',
              visibility: mounted ? 'visible' : 'hidden',
              lineHeight: 1,
              cursor: 'pointer',
              p: 0.75,
              borderRadius: 1.5,
              transition: 'background-color 0.2s, color 0.2s',
              '&:hover': {
                bgcolor: 'action.hover',
                color: 'primary.main',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.main',
              },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
          {...other}
        >
          {showIcon && (
            <AccessTimeRoundedIcon
              sx={{
                fontSize: Math.round(digitHeight * 0.85),
                color: 'inherit',
                opacity: 0.75,
                alignSelf: 'center',
                mr: 0.2,
              }}
            />
          )}

          {/* 오전 / 오후 indicator */}
          <Typography
            component="span"
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'inherit',
              opacity: 0.7,
              letterSpacing: '-0.02em',
              pb: '2px',
              mr: 0.2,
            }}
          >
            {timeState.period}
          </Typography>

          {/* 7-Segment Digital Clock: H(H) : MM : SS */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.6,
            }}
          >
            {/* Hours */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
              {timeState.hours.split('').map((digit, i) => (
                <SevenSegmentDigit key={`h-${i}`} digit={digit} height={digitHeight} />
              ))}
            </Box>

            {/* Colon 1 */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.2 }}>
              <SevenSegmentColon height={digitHeight} />
            </Box>

            {/* Minutes */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
              {timeState.minutes.split('').map((digit, i) => (
                <SevenSegmentDigit key={`m-${i}`} digit={digit} height={digitHeight} />
              ))}
            </Box>

            {/* Colon 2 */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', px: 0.2 }}>
              <SevenSegmentColon height={digitHeight} />
            </Box>

            {/* Seconds */}
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
              {timeState.seconds.split('').map((digit, i) => (
                <SevenSegmentDigit key={`s-${i}`} digit={digit} height={digitHeight} />
              ))}
            </Box>
          </Box>
        </Box>
      </Tooltip>

      <ClockDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}
