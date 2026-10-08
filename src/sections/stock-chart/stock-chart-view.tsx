'use client';

import type { ChangeEvent } from 'react';
import type { StockPoint } from './stock-data';

import { useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { SAMPLE_CSV, parseStockData } from './stock-data';

type ChartMode = 'candle' | 'ohlc' | 'line' | 'area';

const UP_COLOR = '#e6535a';
const DOWN_COLOR = '#4285d4';
const LINE_COLOR = '#6157d9';
const SPEEDS = [2000, 1000, 500, 200];
const formatter = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 });

function StockPlot({
  points,
  count,
  mode,
  showVolume,
}: {
  points: StockPoint[];
  count: number;
  mode: ChartMode;
  showVolume: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const width = Math.max(960, points.length * 15 + 96);
  const height = 420;
  const left = 66;
  const right = width - 22;
  const plotTop = 28;
  const plotBottom = showVolume ? 280 : 355;
  const volumeTop = 315;
  const volumeBottom = 375;
  const plotWidth = right - left;
  const spacing = plotWidth / Math.max(points.length, 1);
  const x = (index: number) => left + spacing * (index + 0.5);
  const values = points.flatMap((point) => [point.low ?? point.close, point.high ?? point.close]);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const padding = Math.max((rawMax - rawMin) * 0.1, rawMax * 0.01, 0.1);
  const min = Math.max(0, rawMin - padding);
  const max = rawMax + padding;
  const y = (value: number) => plotBottom - ((value - min) / (max - min)) * (plotBottom - plotTop);
  const maxVolume = Math.max(...points.map((point) => point.volume ?? 0), 1);
  const visible = points.slice(0, count);
  const path = visible
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${x(index)} ${y(point.close)}`)
    .join(' ');
  const hovered = hoverIndex === null || hoverIndex >= count ? null : points[hoverIndex];
  const axisIndexes = Array.from(
    new Set([
      0,
      ...points
        .map((_, index) => index)
        .filter((index) => index > 0 && index % Math.max(1, Math.ceil(points.length / 7)) === 0),
      points.length - 1,
    ])
  );

  return (
    <Box sx={{ overflowX: 'auto', width: '100%', borderRadius: 2, bgcolor: 'background.default' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        role="img"
        aria-label={`${mode} 주식 차트. 전체 ${points.length}개 중 ${count}개 표시`}
        style={{ display: 'block', maxWidth: 'none' }}
      >
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = min + ((max - min) * (4 - tick)) / 4;
          const tickY = y(value);
          return (
            <g key={tick}>
              <line
                x1={left}
                x2={right}
                y1={tickY}
                y2={tickY}
                stroke="#d8dce6"
                strokeDasharray="4 5"
              />
              <text x={left - 9} y={tickY + 4} textAnchor="end" fill="#8a92a3" fontSize="12">
                {formatter.format(value)}
              </text>
            </g>
          );
        })}

        {mode === 'area' && visible.length > 0 && (
          <path
            d={`${path} L ${x(visible.length - 1)} ${plotBottom} L ${x(0)} ${plotBottom} Z`}
            fill={LINE_COLOR}
            fillOpacity="0.16"
          />
        )}
        {(mode === 'line' || mode === 'area') && (
          <path
            d={path}
            fill="none"
            stroke={LINE_COLOR}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {(mode === 'candle' || mode === 'ohlc') &&
          visible.map((point, index) => {
            const color = point.close >= point.open! ? UP_COLOR : DOWN_COLOR;
            const bodyWidth = Math.max(3, Math.min(12, spacing * 0.62));
            return (
              <g key={`${point.date}-${index}`}>
                <line
                  x1={x(index)}
                  x2={x(index)}
                  y1={y(point.high!)}
                  y2={y(point.low!)}
                  stroke={color}
                  strokeWidth="1.5"
                />
                {mode === 'candle' ? (
                  <rect
                    x={x(index) - bodyWidth / 2}
                    y={Math.min(y(point.open!), y(point.close))}
                    width={bodyWidth}
                    height={Math.max(2, Math.abs(y(point.close) - y(point.open!)))}
                    rx="1"
                    fill={color}
                  />
                ) : (
                  <>
                    <line
                      x1={x(index) - bodyWidth / 2}
                      x2={x(index)}
                      y1={y(point.open!)}
                      y2={y(point.open!)}
                      stroke={color}
                      strokeWidth="2"
                    />
                    <line
                      x1={x(index)}
                      x2={x(index) + bodyWidth / 2}
                      y1={y(point.close)}
                      y2={y(point.close)}
                      stroke={color}
                      strokeWidth="2"
                    />
                  </>
                )}
              </g>
            );
          })}

        {showVolume && (
          <>
            <line x1={left} x2={right} y1={volumeBottom} y2={volumeBottom} stroke="#d8dce6" />
            <text x={left} y={volumeTop - 9} fill="#8a92a3" fontSize="12">
              거래량
            </text>
            {visible.map((point, index) => (
              <rect
                key={`${point.date}-${index}`}
                x={x(index) - Math.max(2, Math.min(12, spacing * 0.62)) / 2}
                y={volumeBottom - ((point.volume ?? 0) / maxVolume) * (volumeBottom - volumeTop)}
                width={Math.max(2, Math.min(12, spacing * 0.62))}
                height={((point.volume ?? 0) / maxVolume) * (volumeBottom - volumeTop)}
                rx="1"
                fill={
                  point.close >= (point.open ?? points[index - 1]?.close ?? point.close)
                    ? UP_COLOR
                    : DOWN_COLOR
                }
                opacity="0.6"
              />
            ))}
          </>
        )}

        {axisIndexes.map((index) => (
          <text key={index} x={x(index)} y="408" textAnchor="middle" fill="#8a92a3" fontSize="12">
            {points[index].date}
          </text>
        ))}

        {hovered && hoverIndex !== null && (
          <line
            x1={x(hoverIndex)}
            x2={x(hoverIndex)}
            y1={plotTop}
            y2={showVolume ? volumeBottom : plotBottom}
            stroke="#7f8795"
            strokeDasharray="4 4"
          />
        )}

        {visible.map((point, index) => (
          <rect
            key={`hit-${point.date}-${index}`}
            x={x(index) - spacing / 2}
            y={plotTop}
            width={spacing}
            height={(showVolume ? volumeBottom : plotBottom) - plotTop}
            fill="transparent"
            onMouseEnter={() => setHoverIndex(index)}
            onMouseLeave={() => setHoverIndex(null)}
          />
        ))}
      </svg>
      {hovered && (
        <Typography variant="caption" sx={{ display: 'block', px: 2, pb: 1 }}>
          {hovered.date} ·{' '}
          {hovered.open !== undefined
            ? `시 ${formatter.format(hovered.open)} / 고 ${formatter.format(hovered.high!)} / 저 ${formatter.format(hovered.low!)} / `
            : ''}
          종 {formatter.format(hovered.close)}
          {hovered.volume !== undefined ? ` · 거래량 ${formatter.format(hovered.volume)}` : ''}
        </Typography>
      )}
    </Box>
  );
}

export function StockChartView() {
  const [input, setInput] = useState(SAMPLE_CSV);
  const [points, setPoints] = useState<StockPoint[]>(() => parseStockData(SAMPLE_CSV));
  const [name, setName] = useState('샘플 종목');
  const [mode, setMode] = useState<ChartMode>('candle');
  const [showVolume, setShowVolume] = useState(true);
  const [count, setCount] = useState(points.length);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const [error, setError] = useState('');
  const hasOhlc = useMemo(
    () =>
      points.every(
        (point) => point.open !== undefined && point.high !== undefined && point.low !== undefined
      ),
    [points]
  );
  const hasVolume = useMemo(() => points.some((point) => point.volume !== undefined), [points]);
  const current = points[Math.max(0, count - 1)];
  const first = points[0];
  const change = current && first ? current.close - first.close : 0;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setTimeout(() => {
      const next = Math.min(points.length, count + 1);
      setCount(next);
      if (next >= points.length) setPlaying(false);
    }, speed);
    return () => window.clearTimeout(timer);
  }, [playing, count, points.length, speed]);

  const applyData = (csv: string) => {
    try {
      const next = parseStockData(csv);
      setInput(csv);
      setPoints(next);
      setCount(next.length);
      setPlaying(false);
      setError('');
      if (
        !next.every(
          (point) => point.open !== undefined && point.high !== undefined && point.low !== undefined
        )
      ) {
        setMode((previous) => (previous === 'candle' || previous === 'ohlc' ? 'line' : previous));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : '데이터를 읽지 못했습니다.');
    }
  };

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    applyData(await file.text());
    event.target.value = '';
  };

  const togglePlay = () => {
    if (playing) {
      setPlaying(false);
    } else {
      if (count >= points.length) setCount(0);
      setPlaying(true);
    }
  };

  return (
    <DashboardContent sx={{ pb: { xs: 9, md: 3 } }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <ShowChartRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          주식 차트
        </Typography>
        <Chip label="차트 재생" color="primary" size="small" variant="outlined" />
      </Stack>
      <Typography color="text.secondary" variant="body2" sx={{ mb: 3 }}>
        주가 CSV를 붙여넣거나 파일로 불러오세요. 재생하면 데이터가 날짜 순서대로 한 개씩 그려집니다.
      </Typography>

      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2.5} alignItems="flex-start">
        <Card sx={{ p: 2.5, width: { xs: '100%', lg: 340 }, flexShrink: 0, borderRadius: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            데이터 입력
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="종목 이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            minRows={12}
            maxRows={20}
            label="주가 CSV"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            inputProps={{
              spellCheck: false,
              style: { fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6 },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            날짜, 시가, 고가, 저가, 종가, 거래량 순서입니다. 날짜·종가만 입력해도 선/영역 차트를 볼
            수 있습니다. 헤더는 한글도 지원합니다.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {error}
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => applyData(input)} fullWidth>
              차트 적용
            </Button>
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileRoundedIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              CSV 파일
              <input hidden type="file" accept=".csv,text/csv,text/plain" onChange={uploadFile} />
            </Button>
          </Stack>
          <Button size="small" onClick={() => applyData(SAMPLE_CSV)} sx={{ mt: 1 }}>
            샘플 데이터 다시 불러오기
          </Button>
        </Card>

        <Card
          sx={{
            p: { xs: 1.5, md: 2.5 },
            flex: 1,
            width: { xs: '100%', lg: 'calc(100% - 360px)' },
            minWidth: 0,
            borderRadius: 3,
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6">{name.trim() || '이름 없는 종목'}</Typography>
              <Typography variant="body2" color="text.secondary">
                {count ? current.date : '재생 대기'} · {count} / {points.length}개 표시
              </Typography>
            </Box>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {count ? formatter.format(current.close) : '—'}
              </Typography>
              {count > 0 && (
                <Typography
                  variant="body2"
                  sx={{ color: change >= 0 ? UP_COLOR : DOWN_COLOR, fontWeight: 700 }}
                >
                  {change >= 0 ? '+' : ''}
                  {formatter.format(change)} (
                  {first.close
                    ? `${change >= 0 ? '+' : ''}${((change / first.close) * 100).toFixed(2)}%`
                    : '—'}
                  )
                </Typography>
              )}
            </Stack>
          </Stack>

          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={1}
            sx={{ mb: 2 }}
          >
            <ToggleButtonGroup
              exclusive
              size="small"
              value={mode}
              onChange={(_, value: ChartMode | null) => {
                if (value) setMode(value);
              }}
              sx={{ flexWrap: 'wrap' }}
            >
              <ToggleButton value="candle" disabled={!hasOhlc}>
                캔들
              </ToggleButton>
              <ToggleButton value="ohlc" disabled={!hasOhlc}>
                OHLC
              </ToggleButton>
              <ToggleButton value="line">선</ToggleButton>
              <ToggleButton value="area">영역</ToggleButton>
            </ToggleButtonGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={showVolume}
                  onChange={(event) => setShowVolume(event.target.checked)}
                  disabled={!hasVolume}
                />
              }
              label="거래량"
              sx={{ m: 0 }}
            />
          </Stack>

          <StockPlot
            points={points}
            count={count}
            mode={mode}
            showVolume={showVolume && hasVolume}
          />
          <Divider sx={{ my: 2 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" spacing={2}>
            <Stack direction="row" spacing={0.5}>
              <Button
                variant="contained"
                startIcon={playing ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                onClick={togglePlay}
                sx={{ minWidth: 95 }}
              >
                {playing ? '일시정지' : count >= points.length ? '처음부터 재생' : '재생'}
              </Button>
              <Button
                variant="outlined"
                title="한 개 앞으로"
                aria-label="한 개 앞으로"
                onClick={() => {
                  setPlaying(false);
                  setCount((value) => Math.min(points.length, value + 1));
                }}
                disabled={count >= points.length}
              >
                <SkipNextRoundedIcon />
              </Button>
              <Button
                variant="outlined"
                title="처음으로"
                aria-label="처음으로"
                onClick={() => {
                  setPlaying(false);
                  setCount(0);
                }}
              >
                <RestartAltRoundedIcon />
              </Button>
            </Stack>
            <Slider
              aria-label="재생 위치"
              size="small"
              min={0}
              max={points.length}
              value={count}
              onChange={(_, value) => {
                setPlaying(false);
                setCount(value as number);
              }}
              sx={{ flex: 1, minWidth: 100 }}
            />
            <TextField
              select
              size="small"
              label="재생 속도"
              value={speed}
              onChange={(event) => setSpeed(Number(event.target.value))}
              slotProps={{ select: { native: true } }}
              sx={{ width: 115 }}
            >
              {SPEEDS.map((value) => (
                <option key={value} value={value}>
                  {(1000 / value).toFixed(1)}배
                </option>
              ))}
            </TextField>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
            상승은 빨강, 하락은 파랑입니다. 표시 구간과 가격 축은 전체 데이터 기준으로 고정됩니다.
          </Typography>
        </Card>
      </Stack>
    </DashboardContent>
  );
}
