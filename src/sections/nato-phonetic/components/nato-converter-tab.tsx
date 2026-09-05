'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { walkieTalkie } from '../utils/walkie-talkie-audio';
import { type PhoneticItem, textToPhoneticList } from '../utils/phonetic-data';

// ----------------------------------------------------------------------

const NATO_PRESETS = [
  { label: 'MAYDAY (긴급 구조)', text: 'MAYDAY' },
  { label: 'ROGER THAT (수신 양호)', text: 'ROGER THAT' },
  { label: 'ALFA BRAVO CHARLIE', text: 'ABC' },
  { label: '항공편 FLIGHT 707', text: 'FLIGHT 707' },
  { label: '한글 무선 교신 (독도)', text: '독도' },
  { label: '차량 번호 12가 3456', text: '12가 3456' },
];

export function NatoConverterTab() {
  const [inputText, setInputText] = useState('MAYDAY');
  const [phoneticList, setPhoneticList] = useState<PhoneticItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSpeakIndex, setCurrentSpeakIndex] = useState<number | null>(null);

  useEffect(() => {
    setPhoneticList(textToPhoneticList(inputText));
  }, [inputText]);

  const formattedOutput = phoneticList
    .map((item) => (item.char === ' ' ? ' / ' : item.word))
    .join(' - ');

  const handlePlayVoice = () => {
    if (isPlaying) {
      walkieTalkie.stopSpeaking();
      setIsPlaying(false);
      setCurrentSpeakIndex(null);
      return;
    }

    const wordsToSpeak = phoneticList.map((item) => item.word);
    setIsPlaying(true);

    const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(inputText);
    const lang = isKorean ? 'ko-KR' : 'en-US';

    walkieTalkie.speakWords(
      wordsToSpeak,
      lang,
      (idx) => setCurrentSpeakIndex(idx),
      () => {
        setIsPlaying(false);
        setCurrentSpeakIndex(null);
      }
    );
  };

  const handleCopy = () => {
    if (!formattedOutput) return;
    navigator.clipboard.writeText(formattedOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minHeight: 0 }}>
      {/* Quick Presets Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          빠른 예시:
        </Typography>
        {NATO_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            variant="outlined"
            onClick={() => setInputText(preset.text)}
            sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          />
        ))}
      </Box>

      {/* Dual Inputs Resizable Panels */}
      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="nato-converter-split"
        sx={{ flex: '1 1 0px', minHeight: 0 }}
      >
        {/* Input Card */}
        <ResizablePanel id="nato-input" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              flex: '1 1 auto',
              height: '100%',
              minHeight: 0,
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
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                📝 원본 문자열 입력 (영어 / 한국어 / 숫자)
              </Typography>
              <IconButton size="small" onClick={() => setInputText('')} disabled={!inputText}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="무선 통화표로 변환할 영문 단어, 한글, 숫자, 차량번호를 입력하세요."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
              }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {inputText.length} 글자
            </Typography>
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Output Card */}
        <ResizablePanel id="nato-output" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              flex: '1 1 auto',
              height: '100%',
              minHeight: 0,
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
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  📻 무선 통화표 스펠러 결과
                </Typography>
                <Chip
                  label="NATO / 경찰·군 표준"
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="soft"
                  color={copied ? 'success' : 'inherit'}
                  startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                  onClick={handleCopy}
                  disabled={!formattedOutput}
                >
                  {copied ? '복사됨' : '복사'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  color={isPlaying ? 'warning' : 'primary'}
                  startIcon={isPlaying ? <StopRoundedIcon /> : <PlayArrowRoundedIcon />}
                  onClick={handlePlayVoice}
                  disabled={!formattedOutput}
                  sx={{ fontWeight: 700 }}
                >
                  {isPlaying ? '방송 중지' : '무전 음성 방송'}
                </Button>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              value={formattedOutput}
              slotProps={{ input: { readOnly: true } }}
              placeholder="변환된 무선 통화 단어가 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  bgcolor: 'background.paper',
                  fontWeight: 700,
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                },
              }}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* Phonetic Speller Timeline Cards Area */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: '1 1 0px',
          minHeight: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          <VolumeUpRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            단어별 무선 교신 카드 (Phonetic Call-out Blocks)
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.2,
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            alignContent: 'flex-start',
          }}
        >
          {phoneticList.map((item, idx) => {
            if (item.char === ' ') {
              return (
                <Box
                  key={`space-${idx}`}
                  sx={{
                    width: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h6" sx={{ color: 'text.disabled' }}>
                    /
                  </Typography>
                </Box>
              );
            }

            const isSpeaking = currentSpeakIndex === idx;

            return (
              <Card
                key={`item-${idx}`}
                sx={{
                  p: 1.2,
                  minWidth: 80,
                  borderRadius: 1.5,
                  border: (theme) =>
                    isSpeaking
                      ? `2px solid ${theme.palette.warning.main}`
                      : `1px solid ${theme.palette.divider}`,
                  bgcolor: isSpeaking ? 'warning.lighter' : 'background.paper',
                  textAlign: 'center',
                  transform: isSpeaking ? 'scale(1.05)' : 'none',
                  transition: 'all 0.15s ease',
                  boxShadow: isSpeaking ? (theme) => theme.customShadows?.z8 : 'none',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 900, color: 'primary.main', lineHeight: 1 }}
                >
                  {item.char}
                </Typography>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, mt: 0.5, fontSize: '0.8rem' }}
                >
                  {item.word}
                </Typography>
                {item.pronunciation && (
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                  >
                    [{item.pronunciation}]
                  </Typography>
                )}
                {item.morse && (
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: 'monospace',
                      color: 'info.main',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  >
                    {item.morse}
                  </Typography>
                )}
              </Card>
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}
