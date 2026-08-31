'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import {
  textToMorse,
  morseToText,
  isMorseCodeText,
  generateMorseWavBlob,
  type MorseFormatOptions,
} from '../utils/morse-core';
import { MorseAudioPlayer } from '../utils/morse-audio';
import { MorseSignalLamp, type LampColorTheme } from './morse-signal-lamp';
import { MorseStrobeOverlay } from './morse-strobe-overlay';

// ----------------------------------------------------------------------

const SAMPLE_PRESETS = [
  { label: 'SOS 긴급구조', text: 'SOS' },
  { label: 'MAYDAY', text: 'MAYDAY' },
  { label: '사랑합니다', text: '사랑합니다' },
  { label: 'HELLO WORLD', text: 'HELLO WORLD' },
  { label: '독도는 우리땅', text: '독도는 우리땅' },
  { label: '73 (Best Regards)', text: '73' },
  { label: 'CQ CQ CQ (호출)', text: 'CQ CQ CQ' },
];

export function MorseConverterTab() {
  const [inputText, setInputText] = useState('SOS');
  const [morseOutput, setMorseOutput] = useState('... --- ...');
  const [mode, setMode] = useState<'text-to-morse' | 'morse-to-text'>('text-to-morse');
  const [copied, setCopied] = useState(false);

  // Audio / Player Options
  const [wpm, setWpm] = useState(20);
  const [frequency, setFrequency] = useState(700);
  const [volume, setVolume] = useState(80);
  const [loop, setLoop] = useState(false);
  const [colorTheme, setColorTheme] = useState<LampColorTheme>('amber');

  // Format Options
  const [dotSymbol, setDotSymbol] = useState<'.' | '•'>('.');
  const [dashSymbol, setDashSymbol] = useState<'-' | '—'>('-');
  const [wordSeparator, setWordSeparator] = useState<' / ' | '   '>(' / ');

  // Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLampActive, setIsLampActive] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [strobeOpen, setStrobeOpen] = useState(false);

  const playerRef = useRef<MorseAudioPlayer | null>(null);

  // Initialize Player
  useEffect(() => {
    playerRef.current = new MorseAudioPlayer();
    return () => {
      if (playerRef.current) {
        playerRef.current.stop();
      }
    };
  }, []);

  // Sync Player Options
  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setOptions({
        wpm,
        frequency,
        volume: volume / 100,
        loop,
      });
    }
  }, [wpm, frequency, volume, loop]);

  const formatOptions: MorseFormatOptions = useMemo(
    () => ({
      dotChar: dotSymbol,
      dashChar: dashSymbol,
      letterSeparator: ' ',
      wordSeparator,
    }),
    [dotSymbol, dashSymbol, wordSeparator]
  );

  // Conversion trigger
  const handleInputChange = useCallback(
    (value: string) => {
      setInputText(value);

      if (mode === 'text-to-morse') {
        const converted = textToMorse(value, formatOptions);
        setMorseOutput(converted);
      } else {
        const converted = morseToText(value, formatOptions);
        setMorseOutput(converted);
      }
    },
    [mode, formatOptions]
  );

  // Refresh conversion when format options change
  useEffect(() => {
    if (mode === 'text-to-morse') {
      setMorseOutput(textToMorse(inputText, formatOptions));
    } else {
      setMorseOutput(morseToText(inputText, formatOptions));
    }
  }, [formatOptions, mode, inputText]);

  // Swap Mode
  const handleSwap = () => {
    const nextMode = mode === 'text-to-morse' ? 'morse-to-text' : 'text-to-morse';
    setMode(nextMode);
    const prevOutput = morseOutput;
    setInputText(prevOutput);
    if (nextMode === 'text-to-morse') {
      setMorseOutput(textToMorse(prevOutput, formatOptions));
    } else {
      setMorseOutput(morseToText(prevOutput, formatOptions));
    }
    handleStop();
  };

  // Playback handlers
  const handlePlay = () => {
    if (!playerRef.current) return;
    const targetMorse = mode === 'text-to-morse' ? morseOutput : inputText;
    if (!targetMorse.trim()) return;

    if (isPaused) {
      playerRef.current.play();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    playerRef.current.load(targetMorse, {
      onSignalChange: (active, symbol) => {
        setIsLampActive(active);
        setCurrentSymbol(symbol);
      },
      onProgress: (current, total) => {
        if (total > 0) {
          setPlaybackProgress(Math.round((current / total) * 100));
        }
      },
      onComplete: () => {
        setIsPlaying(false);
        setIsPaused(false);
        setIsLampActive(false);
        setCurrentSymbol('');
        setPlaybackProgress(100);
      },
    });

    playerRef.current.play();
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (playerRef.current) {
      playerRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      setIsLampActive(false);
      setCurrentSymbol('');
    }
  };

  const handleStop = () => {
    if (playerRef.current) {
      playerRef.current.stop();
      setIsPlaying(false);
      setIsPaused(false);
      setIsLampActive(false);
      setCurrentSymbol('');
      setPlaybackProgress(0);
    }
  };

  // Download WAV
  const handleDownloadWav = () => {
    const targetMorse = mode === 'text-to-morse' ? morseOutput : inputText;
    if (!targetMorse.trim()) return;

    const blob = generateMorseWavBlob(targetMorse, wpm, frequency, volume / 100);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `morse-code-${Date.now()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const handleCopy = () => {
    const textToCopy = morseOutput;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Top Presets Bar */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          빠른 예시:
        </Typography>
        {SAMPLE_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            variant="outlined"
            onClick={() => {
              if (mode === 'morse-to-text') {
                setMode('text-to-morse');
              }
              handleInputChange(preset.text);
              handleStop();
            }}
            sx={{
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          />
        ))}
      </Box>

      {/* Main Conversion Cards Grid */}
      <Grid container spacing={3}>
        {/* Input Box */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {mode === 'text-to-morse' ? '📝 원본 텍스트 (입력)' : '📡 모스 부호 (입력)'}
                </Typography>
                <Chip
                  label={mode === 'text-to-morse' ? '한국어/영어/숫자' : 'Morse Code'}
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ fontWeight: 700, height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title="내용 지우기">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setInputText('');
                      setMorseOutput('');
                      handleStop();
                    }}
                    disabled={!inputText}
                  >
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={
                mode === 'text-to-morse'
                  ? '변환할 한국어(한글), 영어, 숫자, 특수기호를 입력하세요. (예: 안녕, SOS)'
                  : '해독할 모스 부호를 입력하세요. (예: ... --- ... / .--. .-..)'
              }
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  fontFamily: mode === 'morse-to-text' ? 'monospace' : 'inherit',
                  fontSize: '1rem',
                  lineHeight: 1.6,
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1.5,
                color: 'text.secondary',
              }}
            >
              <Typography variant="caption">{inputText.length} 글자</Typography>

              <Button
                variant="outlined"
                size="small"
                startIcon={<SwapVertRoundedIcon />}
                onClick={handleSwap}
                sx={{ borderRadius: 1.5 }}
              >
                입력 ⇄ 출력 전환
              </Button>
            </Box>
          </Card>
        </Grid>

        {/* Output Box */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {mode === 'text-to-morse' ? '📡 모스 부호 (변환 결과)' : '📝 텍스트 (해독 결과)'}
                </Typography>
                <Chip
                  label={mode === 'text-to-morse' ? 'Morse Code' : 'Decoded Text'}
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ fontWeight: 700, height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={copied ? '복사 완료!' : '결과 복사'}>
                  <Button
                    size="small"
                    variant="soft"
                    color={copied ? 'success' : 'inherit'}
                    startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                    onClick={handleCopy}
                    disabled={!morseOutput}
                  >
                    {copied ? '복사됨' : '복사'}
                  </Button>
                </Tooltip>

                <Tooltip title="WAV 오디오 파일로 다운로드">
                  <Button
                    size="small"
                    variant="soft"
                    color="primary"
                    startIcon={<DownloadRoundedIcon />}
                    onClick={handleDownloadWav}
                    disabled={!(mode === 'text-to-morse' ? morseOutput : inputText)}
                  >
                    WAV 저장
                  </Button>
                </Tooltip>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              value={morseOutput}
              slotProps={{ input: { readOnly: true } }}
              placeholder="변환 결과가 여기에 실시간으로 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  fontFamily: mode === 'text-to-morse' ? 'monospace' : 'inherit',
                  fontSize: mode === 'text-to-morse' ? '1.15rem' : '1rem',
                  letterSpacing: mode === 'text-to-morse' ? '2px' : 'normal',
                  lineHeight: 1.7,
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1.5,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {mode === 'text-to-morse'
                  ? `신호 수: ${(morseOutput.match(/[.\-•—]/g) || []).length} 개`
                  : `${morseOutput.length} 글자`}
              </Typography>

              {playbackProgress > 0 && playbackProgress < 100 && (
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  재생 진행률: {playbackProgress}%
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Signal Lamp & Audio Player Control Station */}
      <Grid container spacing={3}>
        {/* Signal Lamp Widget */}
        <Grid size={{ xs: 12, md: 4 }}>
          <MorseSignalLamp
            active={isLampActive}
            symbol={currentSymbol}
            colorTheme={colorTheme}
            onOpenStrobe={() => setStrobeOpen(true)}
          />
        </Grid>

        {/* Audio & Playback Control Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            {/* Playback Buttons Bar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {!isPlaying ? (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<PlayArrowRoundedIcon />}
                    onClick={handlePlay}
                    disabled={!(mode === 'text-to-morse' ? morseOutput : inputText).trim()}
                    sx={{ px: 3, fontWeight: 700 }}
                  >
                    소리 & 불빛 재생
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    size="large"
                    startIcon={<PauseRoundedIcon />}
                    onClick={handlePause}
                    sx={{ px: 3, fontWeight: 700 }}
                  >
                    일시정지
                  </Button>
                )}

                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<StopRoundedIcon />}
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  sx={{ fontWeight: 700 }}
                >
                  정지
                </Button>

                <FormControlLabel
                  control={
                    <Switch
                      checked={loop}
                      onChange={(e) => setLoop(e.target.checked)}
                      size="small"
                    />
                  }
                  label="무한 반복 (Loop)"
                  sx={{ ml: 1, '& .MuiTypography-root': { fontSize: '0.875rem', fontWeight: 600 } }}
                />
              </Box>

              {/* Color Theme Selector for Light */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  신호 불빛 색상:
                </Typography>
                {(['amber', 'red', 'cyan', 'white'] as LampColorTheme[]).map((themeKey) => (
                  <Box
                    key={themeKey}
                    onClick={() => setColorTheme(themeKey)}
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      cursor: 'pointer',
                      bgcolor:
                        themeKey === 'amber'
                          ? '#fbbf24'
                          : themeKey === 'red'
                            ? '#ef4444'
                            : themeKey === 'cyan'
                              ? '#06b6d4'
                              : '#f8fafc',
                      border:
                        colorTheme === themeKey ? '2px solid #000' : '1px solid rgba(0,0,0,0.2)',
                      boxShadow: colorTheme === themeKey ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Sliders Grid (WPM, Frequency, Volume) */}
            <Grid container spacing={3}>
              {/* WPM Speed */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ px: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SpeedRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        전송 속도 (WPM)
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {wpm} WPM
                    </Typography>
                  </Box>
                  <Slider
                    value={wpm}
                    min={5}
                    max={40}
                    step={1}
                    onChange={(_, val) => setWpm(val as number)}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                    1단위 = {Math.round(1200 / wpm)}ms (표준 20 WPM)
                  </Typography>
                </Box>
              </Grid>

              {/* Pitch Frequency */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ px: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <GraphicEqRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        음높이 (주파수)
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'info.main' }}>
                      {frequency} Hz
                    </Typography>
                  </Box>
                  <Slider
                    value={frequency}
                    min={400}
                    max={1200}
                    step={25}
                    onChange={(_, val) => setFrequency(val as number)}
                    size="small"
                    color="info"
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                    전신 표준 톤: 700Hz ~ 800Hz
                  </Typography>
                </Box>
              </Grid>

              {/* Volume */}
              <Grid size={{ xs: 12, sm: 4 }}>
                <Box sx={{ px: 1 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 0.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VolumeUpRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        출력 음량
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {volume}%
                    </Typography>
                  </Box>
                  <Slider
                    value={volume}
                    min={0}
                    max={100}
                    step={5}
                    onChange={(_, val) => setVolume(val as number)}
                    size="small"
                  />
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>
                    부드러운 클릭 방지 앰프 적용
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Custom Symbols / Separators Bar */}
            <Box
              sx={{
                pt: 1.5,
                borderTop: (theme) => `1px dashed ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TuneRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  기호 형식 설정:
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                {/* Dot character */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption">점(Dot):</Typography>
                  <Button
                    size="small"
                    variant={dotSymbol === '.' ? 'contained' : 'outlined'}
                    onClick={() => setDotSymbol('.')}
                    sx={{ minWidth: 32, px: 1, py: 0.2 }}
                  >
                    .
                  </Button>
                  <Button
                    size="small"
                    variant={dotSymbol === '•' ? 'contained' : 'outlined'}
                    onClick={() => setDotSymbol('•')}
                    sx={{ minWidth: 32, px: 1, py: 0.2 }}
                  >
                    •
                  </Button>
                </Box>

                {/* Dash character */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption">선(Dash):</Typography>
                  <Button
                    size="small"
                    variant={dashSymbol === '-' ? 'contained' : 'outlined'}
                    onClick={() => setDashSymbol('-')}
                    sx={{ minWidth: 32, px: 1, py: 0.2 }}
                  >
                    -
                  </Button>
                  <Button
                    size="small"
                    variant={dashSymbol === '—' ? 'contained' : 'outlined'}
                    onClick={() => setDashSymbol('—')}
                    sx={{ minWidth: 32, px: 1, py: 0.2 }}
                  >
                    —
                  </Button>
                </Box>

                {/* Word Separator */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="caption">단어 구분:</Typography>
                  <Button
                    size="small"
                    variant={wordSeparator === ' / ' ? 'contained' : 'outlined'}
                    onClick={() => setWordSeparator(' / ')}
                    sx={{ px: 1, py: 0.2 }}
                  >
                    / (슬래시)
                  </Button>
                  <Button
                    size="small"
                    variant={wordSeparator === '   ' ? 'contained' : 'outlined'}
                    onClick={() => setWordSeparator('   ')}
                    sx={{ px: 1, py: 0.2 }}
                  >
                    공백 3칸
                  </Button>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Fullscreen Strobe Flash Dialog */}
      <MorseStrobeOverlay
        open={strobeOpen}
        onClose={() => setStrobeOpen(false)}
        active={isLampActive}
        symbol={currentSymbol}
        colorTheme={colorTheme}
        text={mode === 'text-to-morse' ? inputText : morseOutput}
      />
    </Box>
  );
}
