'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyRoundedIcon from '@mui/icons-material/KeyRounded';

import { bruteForceCaesar } from '../utils/cipher-core';

// ----------------------------------------------------------------------

export function CipherBruteforceTab() {
  const [ciphertext, setCipherText] = useState('DWWDFN DW GDZQ'); // "ATTACK AT DAWN" shifted by +3
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const results = bruteForceCaesar(ciphertext);

  const handleCopy = (text: string, shift: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(shift);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Input Card */}
      <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <KeyRoundedIcon sx={{ color: 'warning.main' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            카이사르 암호 전수 조사 (Brute-Force Cracker)
          </Typography>
          <Chip label="25가지 키 전체 동시 해독" size="small" color="warning" variant="soft" />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          암호 키(시프트 번호)를 알 수 없을 때 암호문을 붙여넣으면 1부터 25까지 모든 시프트 가능성을 즉시 계산합니다.
        </Typography>

        <TextField
          fullWidth
          value={ciphertext}
          onChange={(e) => setCipherText(e.target.value)}
          placeholder="해독할 카이사르 암호문을 입력하세요 (예: DWWDFN DW GDZQ)"
          variant="outlined"
        />
      </Card>

      {/* Grid of 25 Shift Candidates */}
      <Grid container spacing={2}>
        {results.map((item) => {
          const isCopied = copiedIndex === item.shift;

          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`shift-${item.shift}`}>
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  bgcolor: item.shift === 0 ? 'background.neutral' : 'background.paper',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                    boxShadow: (theme) => theme.customShadows?.z4,
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip
                    label={item.shift === 0 ? '원본 (Shift 0)' : `Shift Key -${item.shift}`}
                    size="small"
                    color={item.shift === 3 ? 'success' : 'default'}
                    variant={item.shift === 3 ? 'filled' : 'outlined'}
                    sx={{ fontWeight: 800 }}
                  />

                  <IconButton
                    size="small"
                    onClick={() => handleCopy(item.decrypted, item.shift)}
                    sx={{ bgcolor: 'action.hover' }}
                  >
                    {isCopied ? (
                      <CheckRoundedIcon fontSize="small" color="success" />
                    ) : (
                      <ContentCopyRoundedIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>

                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    wordBreak: 'break-word',
                    minHeight: 28,
                    color: item.shift === 3 ? 'success.dark' : 'text.primary',
                  }}
                >
                  {item.decrypted || '---'}
                </Typography>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
