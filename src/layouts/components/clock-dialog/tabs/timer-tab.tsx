'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CircularProgress from '@mui/material/CircularProgress';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import NotificationsActiveRoundedIcon from '@mui/icons-material/NotificationsActiveRounded';

import { playTimerDoneSound } from '../utils/sound';

// ----------------------------------------------------------------------

const PRESETS = [
  { label: '+1분', seconds: 60 },
  { label: '+3분', seconds: 180 },
  { label: '+5분', seconds: 300 },
  { label: '+10분', seconds: 600 },
  { label: '+15분', seconds: 900 },
  { label: '+30분', seconds: 1800 },
  { label: '포모도로 (25분)', seconds: 1500 },
];

export function TimerTab() {
  // 항상 2자리 문자열로 관리 (기본값: 00시 05분 00초)
  const [hoursStr, setHoursStr] = useState<string>('00');
  const [minutesStr, setMinutesStr] = useState<string>('05');
  const [secondsStr, setSecondsStr] = useState<string>('00');

  const [totalSeconds, setTotalSeconds] = useState<number>(300);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(300);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'finished'>('idle');

  const endTimeRef = useRef<number | null>(null);
  const remainingAtPauseRef = useRef<number>(300);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getParsedTotalSeconds = useCallback(() => {
    const h = parseInt(hoursStr, 10) || 0;
    const m = parseInt(minutesStr, 10) || 0;
    const s = parseInt(secondsStr, 10) || 0;
    return h * 3600 + m * 60 + s;
  }, [hoursStr, minutesStr, secondsStr]);

  const clearTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const handleFinish = useCallback(() => {
    clearTimer();
    setStatus('finished');
    setRemainingSeconds(0);
    playTimerDoneSound();
  }, [clearTimer]);

  const tick = useCallback(() => {
    if (!endTimeRef.current) return;
    const now = Date.now();
    const diff = Math.ceil((endTimeRef.current - now) / 1000);

    if (diff <= 0) {
      handleFinish();
    } else {
      setRemainingSeconds(diff);
    }
  }, [handleFinish]);

  const handleStart = () => {
    const calculatedTotal =
      status === 'paused' ? remainingAtPauseRef.current : getParsedTotalSeconds();

    if (calculatedTotal <= 0) return;

    if (status === 'idle' || status === 'finished') {
      setTotalSeconds(calculatedTotal);
      setRemainingSeconds(calculatedTotal);
      remainingAtPauseRef.current = calculatedTotal;
    }

    endTimeRef.current = Date.now() + remainingAtPauseRef.current * 1000;
    setStatus('running');

    clearTimer();
    timerIntervalRef.current = setInterval(tick, 200);
  };

  const handlePause = () => {
    clearTimer();
    if (endTimeRef.current) {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));
      remainingAtPauseRef.current = left;
      setRemainingSeconds(left);
    }
    setStatus('paused');
  };

  const handleReset = () => {
    clearTimer();
    setStatus('idle');
    const initialTotal = getParsedTotalSeconds() || 300;
    setTotalSeconds(initialTotal);
    setRemainingSeconds(initialTotal);
    remainingAtPauseRef.current = initialTotal;
  };

  const handleAddMinute = (secondsToAdd: number = 60) => {
    if (status === 'running') {
      if (endTimeRef.current) {
        endTimeRef.current += secondsToAdd * 1000;
        setTotalSeconds((prev) => prev + secondsToAdd);
        setRemainingSeconds((prev) => prev + secondsToAdd);
      }
    } else if (status === 'paused') {
      remainingAtPauseRef.current += secondsToAdd;
      setTotalSeconds((prev) => prev + secondsToAdd);
      setRemainingSeconds((prev) => prev + secondsToAdd);
    } else {
      const current = getParsedTotalSeconds() + secondsToAdd;
      const h = Math.floor(current / 3600);
      const m = Math.floor((current % 3600) / 60);
      const s = current % 60;
      setHoursStr(String(h).padStart(2, '0'));
      setMinutesStr(String(m).padStart(2, '0'));
      setSecondsStr(String(s).padStart(2, '0'));
      setTotalSeconds(current);
      setRemainingSeconds(current);
      remainingAtPauseRef.current = current;
    }
  };

  const handleApplyPreset = (presetSec: number) => {
    clearTimer();
    const h = Math.floor(presetSec / 3600);
    const m = Math.floor((presetSec % 3600) / 60);
    const s = presetSec % 60;
    setHoursStr(String(h).padStart(2, '0'));
    setMinutesStr(String(m).padStart(2, '0'));
    setSecondsStr(String(s).padStart(2, '0'));
    setTotalSeconds(presetSec);
    setRemainingSeconds(presetSec);
    remainingAtPauseRef.current = presetSec;
    setStatus('idle');
  };

  useEffect(
    () => () => {
      clearTimer();
    },
    [clearTimer]
  );

  // 항상 HH:MM:SS (예: 00:05:00) 2자리 고정 형식으로 포맷팅
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progress = totalSeconds > 0 ? ((totalSeconds - remainingSeconds) / totalSeconds) * 100 : 0;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 2.5,
        px: 1,
        flex: 1,
        minHeight: '100%',
      }}
    >
      {status === 'idle' ? (
        // [설정 모드]
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: 3.5,
          }}
        >
          {/* 시간/분/초 입력 필드 (언제나 00:05:00 형태 유지) */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {/* 시간 입력 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
              <TextField
                value={hoursStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setHoursStr(cleaned);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  const num = Math.min(99, parseInt(hoursStr, 10) || 0);
                  setHoursStr(String(num).padStart(2, '0'));
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    style: {
                      textAlign: 'center',
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      width: 72,
                      padding: '12px 6px',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                시간
              </Typography>
            </Box>

            <Typography variant="h3" color="text.secondary" sx={{ fontWeight: 300 }}>
              :
            </Typography>

            {/* 분 입력 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
              <TextField
                value={minutesStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setMinutesStr(cleaned);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  const num = Math.min(59, parseInt(minutesStr, 10) || 0);
                  setMinutesStr(String(num).padStart(2, '0'));
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    style: {
                      textAlign: 'center',
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      width: 72,
                      padding: '12px 6px',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                분
              </Typography>
            </Box>

            <Typography variant="h3" color="text.secondary" sx={{ fontWeight: 300 }}>
              :
            </Typography>

            {/* 초 입력 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.75 }}>
              <TextField
                value={secondsStr}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, '').slice(0, 2);
                  setSecondsStr(cleaned);
                }}
                onFocus={(e) => e.target.select()}
                onBlur={() => {
                  const num = Math.min(59, parseInt(secondsStr, 10) || 0);
                  setSecondsStr(String(num).padStart(2, '0'));
                }}
                slotProps={{
                  htmlInput: {
                    inputMode: 'numeric',
                    style: {
                      textAlign: 'center',
                      fontSize: '2.1rem',
                      fontWeight: 800,
                      width: 72,
                      padding: '12px 6px',
                    },
                  },
                }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
                초
              </Typography>
            </Box>
          </Box>

          {/* 프리셋 버튼 목록 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 1.2,
              maxWidth: 480,
            }}
          >
            {PRESETS.map((p) => (
              <Chip
                key={p.label}
                label={p.label}
                onClick={() => handleApplyPreset(p.seconds)}
                variant="outlined"
                clickable
                sx={{
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  py: 2.2,
                  px: 1,
                  borderRadius: 2,
                  borderColor: 'divider',
                  '&:hover': {
                    bgcolor: 'primary.lighter',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                  },
                }}
              />
            ))}
          </Box>

          {/* 시작 버튼 */}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStart}
            startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 24 }} />}
            disabled={getParsedTotalSeconds() <= 0}
            sx={{ px: 5, py: 1.4, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
          >
            타이머 시작
          </Button>
        </Box>
      ) : (
        // [실행 / 일시정지 / 완료 모드]
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: 3,
          }}
        >
          {/* 원형 프로그레스 & 시간 디스플레이 */}
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              my: 1,
            }}
          >
            {/* 배경 원 */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={240}
              thickness={3.5}
              sx={{ color: (theme) => theme.palette.grey[200] }}
            />
            {/* 진행률 원 */}
            <CircularProgress
              variant="determinate"
              value={progress}
              size={240}
              thickness={4}
              color={status === 'finished' ? 'error' : 'primary'}
              sx={{
                position: 'absolute',
                left: 0,
                transition: 'stroke-dashoffset 0.3s ease',
              }}
            />

            {/* 내부 텍스트 */}
            <Box
              sx={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {status === 'finished' ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.8,
                    animation: 'pulse 1.5s infinite',
                  }}
                >
                  <NotificationsActiveRoundedIcon color="error" sx={{ fontSize: 44 }} />
                  <Typography variant="h5" color="error" sx={{ fontWeight: 800 }}>
                    시간 종료!
                  </Typography>
                </Box>
              ) : (
                <>
                  <Typography
                    variant="h2"
                    sx={{
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.03em',
                      color: status === 'paused' ? 'text.secondary' : 'text.primary',
                    }}
                  >
                    {formatTime(remainingSeconds)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 700, mt: 0.5 }}
                  >
                    {status === 'paused' ? '일시정지됨' : '남은 시간'}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          {/* 제어 버튼군 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <IconButton
              onClick={handleReset}
              size="large"
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                p: 1.2,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              title="초기화"
            >
              <RefreshRoundedIcon />
            </IconButton>

            {status === 'running' && (
              <Button
                variant="contained"
                color="warning"
                size="large"
                onClick={handlePause}
                startIcon={<PauseRoundedIcon sx={{ fontSize: 24 }} />}
                sx={{ px: 4, py: 1.2, borderRadius: 2.5, fontSize: '1rem', fontWeight: 800 }}
              >
                일시정지
              </Button>
            )}

            {status === 'paused' && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleStart}
                startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 24 }} />}
                sx={{ px: 4, py: 1.2, borderRadius: 2.5, fontSize: '1rem', fontWeight: 800 }}
              >
                계속
              </Button>
            )}

            {status === 'finished' && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleReset}
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 24 }} />}
                sx={{ px: 4, py: 1.2, borderRadius: 2.5, fontSize: '1rem', fontWeight: 800 }}
              >
                새 타이머
              </Button>
            )}

            {status !== 'finished' && (
              <Button
                variant="outlined"
                color="inherit"
                size="large"
                onClick={() => handleAddMinute(60)}
                startIcon={<AddRoundedIcon />}
                sx={{ borderRadius: 2.5, fontWeight: 700, px: 2.5 }}
              >
                +1분
              </Button>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
