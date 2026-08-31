'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { romanizeKorean, type RomanizeOptions } from '../utils/romanize-core';

// ----------------------------------------------------------------------

const ROMAN_PRESETS = [
  { label: '홍길동 (인명)', text: '홍길동', mode: 'name' as const },
  {
    label: '서울특별시 종로구 세종대로',
    text: '서울특별시 종로구 세종대로',
    mode: 'standard' as const,
  },
  { label: '국립국어원', text: '국립국어원', mode: 'standard' as const },
  { label: '신라 (유음화: Silla)', text: '신라', mode: 'standard' as const },
  { label: '대관령 (Daegwallyeong)', text: '대관령', mode: 'standard' as const },
  { label: '백마 (비음화: Baengma)', text: '백마', mode: 'standard' as const },
  { label: '제주도', text: '제주도', mode: 'standard' as const },
];

export function RomanizeConverter() {
  const [inputText, setInputText] = useState('홍길동');
  const [outputText, setOutputText] = useState('');
  const [mode, setMode] = useState<'standard' | 'name'>('name');
  const [useHyphen, setUseHyphen] = useState(true);
  const [capitalize, setCapitalize] = useState<'all-words' | 'first' | 'upper'>('all-words');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const opts: RomanizeOptions = {
      mode,
      useHyphenInName: useHyphen,
      capitalize,
    };
    setOutputText(romanizeKorean(inputText, opts));
  }, [inputText, mode, useHyphen, capitalize]);

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
        {ROMAN_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            variant="outlined"
            onClick={() => {
              setInputText(preset.text);
              setMode(preset.mode);
            }}
            sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          />
        ))}
      </Box>

      {/* Settings Options Card */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          {/* Mode Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TranslateRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              표기 방식:
            </Typography>
            <Button
              size="small"
              variant={mode === 'name' ? 'contained' : 'outlined'}
              onClick={() => setMode('name')}
              sx={{ fontWeight: 700 }}
            >
              여권/인명 표기 (Hong Gil-dong)
            </Button>
            <Button
              size="small"
              variant={mode === 'standard' ? 'contained' : 'outlined'}
              onClick={() => setMode('standard')}
              sx={{ fontWeight: 700 }}
            >
              일반 단어 및 지명 표기
            </Button>
          </Box>

          {/* Options Toggles */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            {mode === 'name' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={useHyphen}
                    onChange={(e) => setUseHyphen(e.target.checked)}
                    size="small"
                  />
                }
                label="이름 음절 간 하이픈(-)"
                sx={{ '& .MuiTypography-root': { fontSize: '0.85rem', fontWeight: 600 } }}
              />
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                대소문자:
              </Typography>
              <Button
                size="small"
                variant={capitalize === 'all-words' ? 'contained' : 'outlined'}
                onClick={() => setCapitalize('all-words')}
                sx={{ px: 1, py: 0.2 }}
              >
                단어 첫글자
              </Button>
              <Button
                size="small"
                variant={capitalize === 'upper' ? 'contained' : 'outlined'}
                onClick={() => setCapitalize('upper')}
                sx={{ px: 1, py: 0.2 }}
              >
                ALL CAPS
              </Button>
            </Box>
          </Box>
        </Box>
      </Card>

      {/* Dual Inputs Resizable Panels */}
      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="romanize-converter-split"
        sx={{ flex: '1 1 0px', minHeight: 0 }}
      >
        {/* Input Card */}
        <ResizablePanel id="romanize-input" defaultSize={50} minSize={25}>
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
                🇰🇷 한글 원문 입력 (인명/지명/일반어)
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
              placeholder="로마자로 변환할 한글 이름, 도로명 주소, 단어를 입력하세요."
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
        <ResizablePanel id="romanize-output" defaultSize={50} minSize={25}>
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
                  🌐 표준 로마자 표기 결과 (Revised Romanization)
                </Typography>
                <Chip
                  label="국립국어원 고시 표준"
                  size="small"
                  color="primary"
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
              placeholder="로마자 변환 결과가 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  bgcolor: 'background.paper',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  color: 'primary.main',
                  fontFamily: 'monospace',
                  lineHeight: 1.6,
                },
              }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              비음화(국물 ➔ Gungmul), 유음화(신라 ➔ Silla) 등 표준 자음동화 법칙이 자동으로
              반영됩니다.
            </Typography>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}
