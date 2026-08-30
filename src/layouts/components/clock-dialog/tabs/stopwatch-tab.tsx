'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

// ----------------------------------------------------------------------

interface LapItem {
  id: number;
  lapTime: number;
  overallTime: number;
}

export function StopwatchTab() {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'paused'>('idle');
  const [laps, setLaps] = useState<LapItem[]>([]);

  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const updateTimer = useCallback(() => {
    const now = performance.now();
    const currentElapsed = accumulatedTimeRef.current + (now - startTimeRef.current);
    setElapsedTime(currentElapsed);
    animFrameRef.current = requestAnimationFrame(updateTimer);
  }, []);

  const handleStart = () => {
    startTimeRef.current = performance.now();
    setStatus('running');
    animFrameRef.current = requestAnimationFrame(updateTimer);
  };

  const handlePause = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    const now = performance.now();
    accumulatedTimeRef.current += now - startTimeRef.current;
    setElapsedTime(accumulatedTimeRef.current);
    setStatus('paused');
  };

  const handleReset = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    accumulatedTimeRef.current = 0;
    setElapsedTime(0);
    setStatus('idle');
    setLaps([]);
  };

  const handleLap = () => {
    const currentTotal = elapsedTime;
    const previousTotal = laps.length > 0 ? laps[0].overallTime : 0;
    const lapTime = currentTotal - previousTotal;

    const newLap: LapItem = {
      id: laps.length + 1,
      lapTime,
      overallTime: currentTotal,
    };

    setLaps((prev) => [newLap, ...prev]);
  };

  useEffect(
    () => () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    },
    []
  );

  // 포맷팅 함수: ms -> HH:MM:SS.cs (centiseconds)
  const formatTime = (ms: number) => {
    const totalCentis = Math.floor(ms / 10);
    const centis = totalCentis % 100;
    const totalSecs = Math.floor(ms / 1000);
    const secs = totalSecs % 60;
    const totalMins = Math.floor(totalSecs / 60);
    const mins = totalMins % 60;
    const hours = Math.floor(totalMins / 60);

    const pad = (n: number) => String(n).padStart(2, '0');

    if (hours > 0) {
      return {
        main: `${pad(hours)}:${pad(mins)}:${pad(secs)}`,
        ms: pad(centis),
      };
    }
    return {
      main: `${pad(mins)}:${pad(secs)}`,
      ms: pad(centis),
    };
  };

  // Best & Worst lap 계산
  let minLapTime = Infinity;
  let maxLapTime = -Infinity;
  if (laps.length >= 2) {
    laps.forEach((lap) => {
      if (lap.lapTime < minLapTime) minLapTime = lap.lapTime;
      if (lap.lapTime > maxLapTime) maxLapTime = lap.lapTime;
    });
  }

  const formatted = formatTime(elapsedTime);

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
      {/* 대형 스톱워치 디스플레이 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'center',
          my: 2.5,
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            letterSpacing: '-0.04em',
            fontSize: { xs: '3.5rem', sm: '4.5rem' },
            lineHeight: 1,
          }}
        >
          {formatted.main}
        </Typography>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 700,
            fontVariantNumeric: 'tabular-nums',
            color: 'text.secondary',
            ml: 1,
            fontSize: { xs: '2rem', sm: '2.5rem' },
            lineHeight: 1,
          }}
        >
          .{formatted.ms}
        </Typography>
      </Box>

      {/* 제어 버튼군 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3.5,
        }}
      >
        <IconButton
          onClick={handleReset}
          disabled={status === 'idle'}
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

        {status === 'idle' && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleStart}
            startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 24 }} />}
            sx={{ px: 5, py: 1.3, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
          >
            시작
          </Button>
        )}

        {status === 'running' && (
          <>
            <Button
              variant="contained"
              color="warning"
              size="large"
              onClick={handlePause}
              startIcon={<PauseRoundedIcon sx={{ fontSize: 24 }} />}
              sx={{ px: 4.5, py: 1.3, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
            >
              일시정지
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={handleLap}
              startIcon={<FlagRoundedIcon sx={{ fontSize: 22 }} />}
              sx={{ px: 4, py: 1.3, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
            >
              랩
            </Button>
          </>
        )}

        {status === 'paused' && (
          <>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStart}
              startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 24 }} />}
              sx={{ px: 4.5, py: 1.3, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
            >
              계속
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={handleLap}
              startIcon={<FlagRoundedIcon sx={{ fontSize: 22 }} />}
              sx={{ px: 4, py: 1.3, borderRadius: 2.5, fontSize: '1.05rem', fontWeight: 800 }}
            >
              랩
            </Button>
          </>
        )}
      </Box>

      {/* 랩 타임 목록 */}
      {laps.length > 0 && (
        <TableContainer
          sx={{
            maxHeight: 220,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2.5,
            width: '100%',
          }}
        >
          <Table size="medium" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>랩 번호</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  구간 기록
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                  전체 누적 시간
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {laps.map((lap) => {
                const isFastest = laps.length >= 2 && lap.lapTime === minLapTime;
                const isSlowest = laps.length >= 2 && lap.lapTime === maxLapTime;

                let rowColor = 'text.primary';
                if (isFastest) rowColor = 'success.main';
                if (isSlowest) rowColor = 'error.main';

                const lapFmt = formatTime(lap.lapTime);
                const overallFmt = formatTime(lap.overallTime);

                return (
                  <TableRow
                    key={lap.id}
                    sx={{
                      '&:nth-of-type(even)': { bgcolor: 'action.hover' },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 700, color: rowColor, fontSize: '0.875rem' }}>
                      랩 {String(lap.id).padStart(2, '0')}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                        color: rowColor,
                        fontSize: '0.95rem',
                      }}
                    >
                      {lapFmt.main}.{lapFmt.ms}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        fontVariantNumeric: 'tabular-nums',
                        color: 'text.secondary',
                        fontSize: '0.875rem',
                      }}
                    >
                      {overallFmt.main}.{overallFmt.ms}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
