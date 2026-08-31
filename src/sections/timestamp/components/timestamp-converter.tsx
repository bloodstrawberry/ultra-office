'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';

import { WORLD_CITIES, formatTimeInZone, formatRelativeTime } from '../utils/timestamp-utils';

// ----------------------------------------------------------------------

export function TimestampConverter() {
  const [currentEpoch, setCurrentEpoch] = useState<number>(0);
  const [isClockRunning, setIsClockRunning] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Timestamp to Date conversion state
  const [inputTimestamp, setInputTimestamp] = useState<string>('');
  // Date to Timestamp conversion state
  const [inputDateTime, setInputDateTime] = useState<string>('');

  // World timezone scrubber offset in hours (-24 to +24)
  const [hourOffset, setHourOffset] = useState<number>(0);

  // Initial load
  useEffect(() => {
    const now = new Date();
    setCurrentEpoch(Math.floor(now.getTime() / 1000));
    setInputTimestamp(String(Math.floor(now.getTime() / 1000)));

    // Format local datetime for input
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 19);
    setInputDateTime(localIso);
  }, []);

  // Live Clock Ticker
  useEffect(() => {
    if (!isClockRunning) return () => {};
    const interval = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockRunning]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Convert input timestamp to Date
  const parsedDateFromTimestamp = (() => {
    const raw = parseInt(inputTimestamp.trim(), 10);
    if (Number.isNaN(raw)) return null;
    // Auto-detect seconds vs milliseconds (10 digits vs 13 digits)
    const ms = raw < 10000000000 ? raw * 1000 : raw;
    const d = new Date(ms);
    return Number.isNaN(d.getTime()) ? null : d;
  })();

  // Convert input date to Timestamp
  const parsedTimestampFromDate = (() => {
    if (!inputDateTime) return null;
    const d = new Date(inputDateTime);
    return Number.isNaN(d.getTime()) ? null : Math.floor(d.getTime() / 1000);
  })();

  // Scrubber base date
  const scrubbedDate = new Date(Date.now() + hourOffset * 3600 * 1000);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minHeight: 0 }}>
      {/* Live Current Epoch Clock Card */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <AccessTimeRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
          <Box>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 800,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
              }}
            >
              현재 실시간 유닉스 에포크 타임스탬프 (Current Unix Epoch)
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 900,
                color: 'primary.main',
                lineHeight: 1.1,
              }}
            >
              {currentEpoch || '---'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setIsClockRunning(!isClockRunning)}
            color={isClockRunning ? 'warning' : 'primary'}
            sx={{ bgcolor: 'action.hover' }}
          >
            {isClockRunning ? (
              <PauseRoundedIcon fontSize="small" />
            ) : (
              <PlayArrowRoundedIcon fontSize="small" />
            )}
          </IconButton>

          <Button
            variant="contained"
            size="small"
            startIcon={copiedKey === 'current' ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
            onClick={() => handleCopy(String(currentEpoch), 'current')}
            sx={{ fontWeight: 700 }}
          >
            {copiedKey === 'current' ? '복사됨' : '현재 초 복사'}
          </Button>
        </Box>
      </Card>

      {/* Conversion Cards Grid */}
      <Grid container spacing={2} sx={{ flexShrink: 0 }}>
        {/* Card 1: Timestamp to Date */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                ⏰ 타임스탬프 ➔ 날짜/시간 변환
              </Typography>
              <Chip
                label="초 / ms 자동 감지"
                size="small"
                color="primary"
                variant="soft"
                sx={{ height: 22 }}
              />
            </Box>

            <TextField
              fullWidth
              size="small"
              value={inputTimestamp}
              onChange={(e) => setInputTimestamp(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="예: 1725100000"
              label="Unix Timestamp 입력"
              variant="outlined"
            />

            {parsedDateFromTimestamp ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    한국 표준시 (KST):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatTimeInZone(parsedDateFromTimestamp, 'Asia/Seoul').fullStr}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    협정세계시 (UTC):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'info.main' }}>
                    {parsedDateFromTimestamp.toUTCString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    상대 시간:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'warning.main' }}>
                    {formatRelativeTime(parsedDateFromTimestamp)}
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                유효한 숫자 타임스탬프를 입력하세요.
              </Typography>
            )}
          </Card>
        </Grid>

        {/* Card 2: Date to Timestamp */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              📅 날짜/시간 ➔ 타임스탬프 변환
            </Typography>

            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              value={inputDateTime}
              onChange={(e) => setInputDateTime(e.target.value)}
              label="로컬 일시 선택"
              slotProps={{ inputLabel: { shrink: true } }}
            />

            {parsedTimestampFromDate ? (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    초 단위 (Seconds):
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}
                    >
                      {parsedTimestampFromDate}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(String(parsedTimestampFromDate), 'sec')}
                    >
                      {copiedKey === 'sec' ? (
                        <CheckRoundedIcon color="success" fontSize="small" />
                      ) : (
                        <ContentCopyRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    밀리초 (Milliseconds):
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                      {parsedTimestampFromDate * 1000}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => handleCopy(String(parsedTimestampFromDate * 1000), 'ms')}
                    >
                      {copiedKey === 'ms' ? (
                        <CheckRoundedIcon color="success" fontSize="small" />
                      ) : (
                        <ContentCopyRoundedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ) : null}
          </Card>
        </Grid>
      </Grid>

      {/* World Time Zones Slider & City Cards */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 0px',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
            mb: 1.5,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PublicRoundedIcon sx={{ color: 'info.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              전 세계 주요 도시 실시간 시계 & 시차 슬라이더
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 260 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              시차: <strong>{hourOffset >= 0 ? `+${hourOffset}` : hourOffset}시간</strong>
            </Typography>
            <Slider
              size="small"
              value={hourOffset}
              min={-24}
              max={24}
              step={1}
              onChange={(_, val) => setHourOffset(val as number)}
              sx={{ width: 130 }}
            />
            <Button
              size="small"
              variant="outlined"
              onClick={() => setHourOffset(0)}
              sx={{ py: 0.2 }}
            >
              현재 시각
            </Button>
          </Box>
        </Box>

        <Grid
          container
          spacing={1.5}
          sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', alignContent: 'flex-start' }}
        >
          {WORLD_CITIES.map((city) => {
            const formatted = formatTimeInZone(scrubbedDate, city.zone);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={city.city}>
                <Card
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    bgcolor: city.city.includes('서울') ? 'primary.lighter' : 'background.paper',
                    borderColor: city.city.includes('서울') ? 'primary.main' : 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6">{city.flag}</Typography>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 800, lineHeight: 1.2, fontSize: '0.82rem' }}
                      >
                        {city.city}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                      >
                        {city.country}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'monospace',
                      fontWeight: 900,
                      my: 0.25,
                      color: 'text.primary',
                    }}
                  >
                    {formatted.timeStr}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', fontSize: '0.7rem' }}
                  >
                    {formatted.dateStr}
                  </Typography>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Card>
    </Box>
  );
}
