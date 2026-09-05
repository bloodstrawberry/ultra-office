'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import KeyboardRoundedIcon from '@mui/icons-material/KeyboardRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { engToKor, korToEng, autoConvertTypo } from '../utils/keyboard-mapper';

// ----------------------------------------------------------------------

const TYPO_PRESETS = [
  { label: 'dkssudgktpdy (안녕하세요)', text: 'dkssudgktpdy' },
  { label: 'gksrmf (한글)', text: 'gksrmf' },
  { label: 'qksrkwkdy (반가워요)', text: 'qksrkwkdy' },
  { label: 'skwnddp qkd (나중에 봐)', text: 'skwnddp qkd' },
  { label: 'dlffjtmxmfpdlxj (일러스트레이터)', text: 'dlffjtmxmfpdlxj' },
  { label: 'wjdahr (제목)', text: 'wjdahr' },
];

export function HangulTypoConverter() {
  const [inputText, setInputText] = useState('dkssudgktpdy');
  const [outputText, setOutputText] = useState('안녕하세요');
  const [conversionMode, setConversionMode] = useState<'auto' | 'eng-to-kor' | 'kor-to-eng'>(
    'auto'
  );
  const [activeMode, setActiveMode] = useState<'eng-to-kor' | 'kor-to-eng'>('eng-to-kor');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (conversionMode === 'auto') {
      const { converted, mode } = autoConvertTypo(inputText);
      setOutputText(converted);
      setActiveMode(mode);
    } else if (conversionMode === 'eng-to-kor') {
      setOutputText(engToKor(inputText));
      setActiveMode('eng-to-kor');
    } else {
      setOutputText(korToEng(inputText));
      setActiveMode('kor-to-eng');
    }
  }, [inputText, conversionMode]);

  const handleSwap = () => {
    const nextMode = activeMode === 'eng-to-kor' ? 'kor-to-eng' : 'eng-to-kor';
    setConversionMode(nextMode);
    setInputText(outputText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
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
        {TYPO_PRESETS.map((preset) => (
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

      {/* Mode Selector */}
      <Card sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <KeyboardRoundedIcon sx={{ color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              변환 모드:
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={conversionMode === 'auto' ? 'contained' : 'outlined'}
              onClick={() => setConversionMode('auto')}
              sx={{ fontWeight: 700 }}
            >
              자동 감지 ({activeMode === 'eng-to-kor' ? '영타→한타' : '한타→영타'})
            </Button>
            <Button
              size="small"
              variant={conversionMode === 'eng-to-kor' ? 'contained' : 'outlined'}
              onClick={() => setConversionMode('eng-to-kor')}
              sx={{ fontWeight: 700 }}
            >
              영타 ➔ 한글 (gksrmf ➔ 한글)
            </Button>
            <Button
              size="small"
              variant={conversionMode === 'kor-to-eng' ? 'contained' : 'outlined'}
              onClick={() => setConversionMode('kor-to-eng')}
              sx={{ fontWeight: 700 }}
            >
              한타 ➔ 영문 (한글 ➔ gksrmf)
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Dual Inputs Resizable Panels */}
      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="hangul-typo-split"
        sx={{ flex: '1 1 0px', minHeight: 0 }}
      >
        {/* Input Card */}
        <ResizablePanel id="typo-input" defaultSize={50} minSize={25}>
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
                {activeMode === 'eng-to-kor' ? '⌨️ 영문 자판 오타 입력' : '⌨️ 한글 자판 오타 입력'}
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
              placeholder="한영 키를 잘못 누르고 친 오타를 붙여넣으세요. (예: dkssudgktpdy)"
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 1,
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {inputText.length} 글자
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SwapVertRoundedIcon />}
                onClick={handleSwap}
              >
                입력 ⇄ 출력 전환
              </Button>
            </Box>
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Output Card */}
        <ResizablePanel id="typo-output" defaultSize={50} minSize={25}>
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
                  ✨ 완벽 복원된 정상 텍스트
                </Typography>
                <Chip
                  label="2벌식 오토마타 복원"
                  size="small"
                  color="success"
                  variant="soft"
                  sx={{ height: 22 }}
                />
              </Box>

              <Button
                size="small"
                variant="soft"
                color={copied ? 'success' : 'inherit'}
                startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                onClick={handleCopy}
                disabled={!outputText}
              >
                {copied ? '복사됨' : '복사'}
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              value={outputText}
              slotProps={{ input: { readOnly: true } }}
              placeholder="복원 결과가 여기에 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  bgcolor: 'background.paper',
                  fontSize: '1.15rem',
                  fontWeight: 600,
                  lineHeight: 1.6,
                },
              }}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}
