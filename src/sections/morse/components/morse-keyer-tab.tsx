'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SpaceBarRoundedIcon from '@mui/icons-material/SpaceBarRounded';
import BackspaceRoundedIcon from '@mui/icons-material/BackspaceRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';

import { morseToText } from '../utils/morse-core';
import { MorseSignalLamp } from './morse-signal-lamp';
import { getSharedMorsePlayer } from '../utils/morse-audio';

// ----------------------------------------------------------------------

export function MorseKeyerTab() {
  const [morseBuffer, setMorseBuffer] = useState<string>('');
  const [decodedText, setDecodedText] = useState<string>('');
  const [isKeyPressed, setIsKeyPressed] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('');
  const [copied, setCopied] = useState(false);
  const [keyMode, setKeyMode] = useState<'paddle' | 'straight'>('paddle');

  // Straight key timing measurement
  const pressStartTimeRef = useRef<number>(0);
  const audioPlayer = getSharedMorsePlayer();

  // Auto decode on buffer change
  useEffect(() => {
    setDecodedText(morseToText(morseBuffer));
  }, [morseBuffer]);

  // Handle Paddle: Dot
  const handlePaddleDot = useCallback(() => {
    audioPlayer.startContinuousTone(700, 0.8);
    setIsKeyPressed(true);
    setCurrentSymbol('.');
    setMorseBuffer((prev) => prev + '.');

    setTimeout(() => {
      audioPlayer.stopContinuousTone();
      setIsKeyPressed(false);
      setCurrentSymbol('');
    }, 80);
  }, [audioPlayer]);

  // Handle Paddle: Dash
  const handlePaddleDash = useCallback(() => {
    audioPlayer.startContinuousTone(700, 0.8);
    setIsKeyPressed(true);
    setCurrentSymbol('-');
    setMorseBuffer((prev) => prev + '-');

    setTimeout(() => {
      audioPlayer.stopContinuousTone();
      setIsKeyPressed(false);
      setCurrentSymbol('');
    }, 240);
  }, [audioPlayer]);

  // Add Letter Space
  const handleLetterSpace = useCallback(() => {
    setMorseBuffer((prev) => (prev.endsWith(' ') ? prev : prev + ' '));
  }, []);

  // Add Word Space
  const handleWordSpace = useCallback(() => {
    setMorseBuffer((prev) => (prev.endsWith(' / ') ? prev : prev + ' / '));
  }, []);

  // Backspace
  const handleBackspace = useCallback(() => {
    setMorseBuffer((prev) => {
      if (prev.endsWith(' / ')) return prev.slice(0, -3);
      return prev.slice(0, -1);
    });
  }, []);

  // Clear
  const handleClear = useCallback(() => {
    setMorseBuffer('');
    setDecodedText('');
  }, []);

  // Straight Key Down
  const handleStraightKeyDown = useCallback(() => {
    pressStartTimeRef.current = Date.now();
    setIsKeyPressed(true);
    audioPlayer.startContinuousTone(700, 0.8);
  }, [audioPlayer]);

  // Straight Key Up
  const handleStraightKeyUp = useCallback(() => {
    if (!isKeyPressed) return;
    const duration = Date.now() - pressStartTimeRef.current;
    audioPlayer.stopContinuousTone();
    setIsKeyPressed(false);

    // Threshold: < 160ms -> dot '.', >= 160ms -> dash '-'
    const symbol = duration < 160 ? '.' : '-';
    setCurrentSymbol(symbol);
    setMorseBuffer((prev) => prev + symbol);

    setTimeout(() => {
      setCurrentSymbol('');
    }, 200);
  }, [audioPlayer, isKeyPressed]);

  // Keyboard shortcut listeners (Z = Dot, X = Dash, Space = Letter space, Enter = Word space)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid firing when user is focusing an input element
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'z' || e.key === 'Z' || e.key === '1') {
        e.preventDefault();
        handlePaddleDot();
      } else if (e.key === 'x' || e.key === 'X' || e.key === '2') {
        e.preventDefault();
        handlePaddleDash();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleLetterSpace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleWordSpace();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePaddleDot, handlePaddleDash, handleLetterSpace, handleWordSpace, handleBackspace]);

  const handleCopy = () => {
    if (!decodedText) return;
    navigator.clipboard.writeText(decodedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        flex: '1 1 auto',
        minHeight: 0,
        overflowY: 'auto',
        pr: 0.5,
      }}
    >
      {/* Top Header & Keyer Mode Select */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            인터랙티브 모스 전건 키어 (Morse Telegraph Keyer)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            화면 버튼이나 키보드 단축키(Z/X/스페이스바)를 사용하여 직접 모스 부호를 타건해보세요.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={keyMode === 'paddle' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setKeyMode('paddle')}
          >
            패들 키어 (Dot/Dash 버튼)
          </Button>
          <Button
            variant={keyMode === 'straight' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setKeyMode('straight')}
          >
            단일 스트레이트 전건 (누름 시간 감지)
          </Button>
        </Box>
      </Box>

      {/* Grid Layout: Left Key Controls & Right Live Stream */}
      <Grid container spacing={3}>
        {/* Left Column: Interactive Keys & Signal Lamp */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            {/* Signal Lamp */}
            <MorseSignalLamp
              active={isKeyPressed}
              symbol={currentSymbol}
              colorTheme="amber"
              title="실시간 송신 신호등"
              subtitle="키를 누를 때 톤 사운드와 함께 불빛이 반응합니다."
            />

            {/* Keyer Control Pads */}
            {keyMode === 'paddle' ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Grid container spacing={2}>
                  {/* Dot Button */}
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      onClick={handlePaddleDot}
                      sx={{
                        py: { xs: 3, md: 4 },
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        boxShadow: (theme) => theme.customShadows?.z8,
                        '&:active': { transform: 'scale(0.97)' },
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                        •
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        점 (DOT)
                      </Typography>
                      <Chip
                        label="단축키 [Z]"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 18,
                        }}
                      />
                    </Button>
                  </Grid>

                  {/* Dash Button */}
                  <Grid size={{ xs: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="secondary"
                      onClick={handlePaddleDash}
                      sx={{
                        py: { xs: 3, md: 4 },
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        boxShadow: (theme) => theme.customShadows?.z8,
                        '&:active': { transform: 'scale(0.97)' },
                      }}
                    >
                      <Typography variant="h3" sx={{ fontWeight: 900, lineHeight: 1 }}>
                        ━
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        선 (DASH)
                      </Typography>
                      <Chip
                        label="단축키 [X]"
                        size="small"
                        sx={{
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: '#fff',
                          fontWeight: 700,
                          fontSize: '0.65rem',
                          height: 18,
                        }}
                      />
                    </Button>
                  </Grid>
                </Grid>

                {/* Sub Controls: Letter Space, Word Space, Backspace */}
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<SpaceBarRoundedIcon />}
                    onClick={handleLetterSpace}
                    sx={{ flexGrow: 1, py: 1.2, fontWeight: 700 }}
                  >
                    글자 띄우기 [Space]
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleWordSpace}
                    sx={{ flexGrow: 1, py: 1.2, fontWeight: 700 }}
                  >
                    단어 구분 (/) [Enter]
                  </Button>
                  <Button
                    variant="soft"
                    color="error"
                    startIcon={<BackspaceRoundedIcon />}
                    onClick={handleBackspace}
                    sx={{ px: 2, py: 1.2, fontWeight: 700 }}
                  >
                    지우기
                  </Button>
                </Box>
              </Box>
            ) : (
              /* Straight Key: Push and Hold Pad */
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  color={isKeyPressed ? 'warning' : 'primary'}
                  onMouseDown={handleStraightKeyDown}
                  onMouseUp={handleStraightKeyUp}
                  onTouchStart={handleStraightKeyDown}
                  onTouchEnd={handleStraightKeyUp}
                  sx={{
                    py: { xs: 5, md: 7 },
                    borderRadius: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    boxShadow: (theme) => theme.customShadows?.z16,
                    transform: isKeyPressed ? 'scale(0.98)' : 'none',
                    transition: 'all 0.05s ease',
                  }}
                >
                  <RadioButtonCheckedRoundedIcon sx={{ fontSize: 44 }} />
                  <Typography variant="h5" sx={{ fontWeight: 900 }}>
                    {isKeyPressed ? '⚡ 송신 중...' : '누르고 있으면 소리 송신'}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    짧게 누르면 점(•), 길게 누르면 선(━)으로 자동 판정됩니다.
                  </Typography>
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<SpaceBarRoundedIcon />}
                    onClick={handleLetterSpace}
                    sx={{ flexGrow: 1, py: 1.2, fontWeight: 700 }}
                  >
                    글자 띄우기 [Space]
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleWordSpace}
                    sx={{ flexGrow: 1, py: 1.2, fontWeight: 700 }}
                  >
                    단어 구분 (/)
                  </Button>
                  <Button
                    variant="soft"
                    color="error"
                    startIcon={<BackspaceRoundedIcon />}
                    onClick={handleBackspace}
                    sx={{ px: 2, py: 1.2, fontWeight: 700 }}
                  >
                    지우기
                  </Button>
                </Box>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Right Column: Live Decoded Stream */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              gap: 2.5,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                📡 입력된 모스 부호 스트림
              </Typography>
              <Tooltip title="전체 지우기">
                <IconButton size="small" onClick={handleClear} disabled={!morseBuffer}>
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>

            {/* Morse Code Box */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                minHeight: 110,
                fontFamily: 'monospace',
                fontSize: '1.25rem',
                letterSpacing: 2,
                fontWeight: 700,
                color: 'primary.main',
                wordBreak: 'break-all',
                overflowY: 'auto',
              }}
            >
              {morseBuffer || (
                <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                  타건한 모스 부호가 여기에 실시간으로 기록됩니다...
                </Typography>
              )}
            </Box>

            {/* Decoded Output Box */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  📝 실시간 텍스트 해독 결과
                </Typography>

                <Button
                  size="small"
                  variant="soft"
                  color={copied ? 'success' : 'inherit'}
                  startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                  onClick={handleCopy}
                  disabled={!decodedText}
                >
                  {copied ? '복사됨' : '복사'}
                </Button>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                  minHeight: 140,
                  flexGrow: 1,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'text.primary',
                  wordBreak: 'break-word',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                {decodedText || (
                  <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                    해독된 한국어/영어 문장이 여기에 표시됩니다.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* Keyboard Guide Tip */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                flexWrap: 'wrap',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                ⌨️ 키보드 조작법:
              </Typography>
              <Chip label="Z: 점(•)" size="small" variant="outlined" sx={{ height: 20 }} />
              <Chip label="X: 선(━)" size="small" variant="outlined" sx={{ height: 20 }} />
              <Chip label="Space: 글자 구분" size="small" variant="outlined" sx={{ height: 20 }} />
              <Chip label="Enter: 단어 구분" size="small" variant="outlined" sx={{ height: 20 }} />
              <Chip
                label="Backspace: 1자 삭제"
                size="small"
                variant="outlined"
                sx={{ height: 20 }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
