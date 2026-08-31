'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import SwapVertRoundedIcon from '@mui/icons-material/SwapVertRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';

import {
  caesarCipher,
  rot13Cipher,
  atbashCipher,
  vigenereCipher,
  railFenceEncrypt,
  railFenceDecrypt,
} from '../utils/cipher-core';
import { CipherWheelVisualizer } from './cipher-wheel-visualizer';

// ----------------------------------------------------------------------

type CipherType = 'caesar' | 'vigenere' | 'rot13' | 'atbash' | 'railfence';

const CIPHER_PRESETS = [
  { label: 'TOP SECRET (1급 비밀)', text: 'TOP SECRET' },
  { label: 'ATTACK AT DAWN (새벽 공격)', text: 'ATTACK AT DAWN' },
  { label: 'Hello World', text: 'Hello World' },
  { label: '비밀 메시지 전달', text: '비밀 메시지 전달' },
  { label: 'THE QUICK BROWN FOX', text: 'THE QUICK BROWN FOX' },
];

export function CipherConverterTab() {
  const [cipherType, setCipherType] = useState<CipherType>('caesar');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [inputText, setInputText] = useState('ATTACK AT DAWN');
  const [outputText, setOutputText] = useState('');
  const [copied, setCopied] = useState(false);

  // Cipher parameters
  const [caesarShift, setCaesarShift] = useState(3); // Standard Caesar shift is +3
  const [vigenereKey, setVigenereKey] = useState('KEY');
  const [railCount, setRailCount] = useState(3);

  useEffect(() => {
    let result = '';
    switch (cipherType) {
      case 'caesar':
        result = caesarCipher(inputText, caesarShift, mode);
        break;
      case 'rot13':
        result = rot13Cipher(inputText);
        break;
      case 'atbash':
        result = atbashCipher(inputText);
        break;
      case 'vigenere':
        result = vigenereCipher(inputText, vigenereKey, mode);
        break;
      case 'railfence':
        result = mode === 'encrypt' ? railFenceEncrypt(inputText, railCount) : railFenceDecrypt(inputText, railCount);
        break;
      default:
        result = inputText;
    }
    setOutputText(result);
  }, [inputText, cipherType, mode, caesarShift, vigenereKey, railCount]);

  const handleSwap = () => {
    const nextMode = mode === 'encrypt' ? 'decrypt' : 'encrypt';
    setMode(nextMode);
    setInputText(outputText);
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Cipher Method Tabs */}
      <Tabs
        value={cipherType}
        onChange={(_, val) => setCipherType(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ '& .MuiTab-root': { fontWeight: 700, minHeight: 44 } }}
      >
        <Tab value="caesar" label="카이사르 (시저) 암호" />
        <Tab value="vigenere" label="비제네르 (Vigenère) 암호" />
        <Tab value="rot13" label="ROT13 치환 암호" />
        <Tab value="atbash" label="앳배쉬 (Atbash) 거울 암호" />
        <Tab value="railfence" label="레일 펜스 (지그재그) 암호" />
      </Tabs>

      {/* Quick Presets Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          빠른 예시:
        </Typography>
        {CIPHER_PRESETS.map((preset) => (
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

      {/* Settings Bar */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          {/* Mode Switch (Encrypt / Decrypt) */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant={mode === 'encrypt' ? 'contained' : 'outlined'}
              color="primary"
              startIcon={<LockRoundedIcon />}
              onClick={() => setMode('encrypt')}
              sx={{ fontWeight: 700 }}
            >
              암호화 (Encrypt)
            </Button>
            <Button
              variant={mode === 'decrypt' ? 'contained' : 'outlined'}
              color="warning"
              startIcon={<LockOpenRoundedIcon />}
              onClick={() => setMode('decrypt')}
              sx={{ fontWeight: 700 }}
            >
              복호화 (Decrypt)
            </Button>
          </Box>

          {/* Cipher Specific Controls */}
          {cipherType === 'caesar' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 260 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                시프트 키: <strong>+{caesarShift}</strong>
              </Typography>
              <Slider
                value={caesarShift}
                min={1}
                max={25}
                onChange={(_, val) => setCaesarShift(val as number)}
                sx={{ width: 140 }}
              />
            </Box>
          )}

          {cipherType === 'vigenere' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                암호 키워드:
              </Typography>
              <TextField
                size="small"
                value={vigenereKey}
                onChange={(e) => setVigenereKey(e.target.value.toUpperCase())}
                placeholder="예: SECRET"
                sx={{ width: 140 }}
              />
            </Box>
          )}

          {cipherType === 'railfence' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 240 }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                울타리 레일 수: <strong>{railCount}줄</strong>
              </Typography>
              <Slider
                value={railCount}
                min={2}
                max={8}
                onChange={(_, val) => setRailCount(val as number)}
                sx={{ width: 120 }}
              />
            </Box>
          )}
        </Box>
      </Card>

      {/* Dual Input/Output Cards */}
      <Grid container spacing={3}>
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {mode === 'encrypt' ? '📝 평문 (Plaintext 입력)' : '🔒 암호문 (Ciphertext 입력)'}
              </Typography>
              <IconButton size="small" onClick={() => setInputText('')} disabled={!inputText}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={6}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="암호화 또는 복호화할 텍스트를 입력하세요."
              variant="outlined"
              sx={{ flexGrow: 1 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {inputText.length} 글자
              </Typography>
              <Button size="small" variant="outlined" startIcon={<SwapVertRoundedIcon />} onClick={handleSwap}>
                입력 ⇄ 출력 전환
              </Button>
            </Box>
          </Card>
        </Grid>

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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  {mode === 'encrypt' ? '🔒 암호화 결과' : '🔓 복호화 결과'}
                </Typography>
                <Chip
                  label={mode === 'encrypt' ? 'Encrypted' : 'Decrypted'}
                  size="small"
                  color={mode === 'encrypt' ? 'primary' : 'success'}
                  variant="soft"
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
              rows={6}
              value={outputText}
              slotProps={{ input: { readOnly: true } }}
              placeholder="변환 결과가 여기에 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  bgcolor: 'background.paper',
                  fontFamily: 'monospace',
                  fontSize: '1.05rem',
                  lineHeight: 1.6,
                },
              }}
            />
          </Card>
        </Grid>
      </Grid>

      {/* Visual Caesar Wheel if Caesar cipher */}
      {cipherType === 'caesar' && (
        <Card sx={{ p: 2, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
          <CipherWheelVisualizer shift={caesarShift} />
        </Card>
      )}
    </Box>
  );
}
