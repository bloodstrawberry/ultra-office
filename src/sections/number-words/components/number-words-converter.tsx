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
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import {
  numberToKoreanWords,
  numberToHanjaWords,
  numberToEnglishWords,
} from '../utils/number-converter';

// ----------------------------------------------------------------------

export function NumberWordsConverter() {
  const [numValue, setNumValue] = useState<string>('123450000');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const rawNumber = parseInt(numValue.replace(/[^0-9]/g, ''), 10) || 0;

  const koreanWords = numberToKoreanWords(numValue);
  const hanjaWords = numberToHanjaWords(numValue);
  const englishWords = numberToEnglishWords(rawNumber);

  // VAT Breakdown: total = supply * 1.1 -> supply = total / 1.1
  const supplyPrice = Math.round(rawNumber / 1.1);
  const vatAmount = rawNumber - supplyPrice;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleAddAmount = (amount: number) => {
    setNumValue(String(rawNumber + amount));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Input Number Card */}
      <Card sx={{ p: 3, borderRadius: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5 }}>
          💰 금액 / 숫자 입력 (원화 기준)
        </Typography>

        <TextField
          fullWidth
          value={numValue ? Number(numValue).toLocaleString() : ''}
          onChange={(e) => {
            const clean = e.target.value.replace(/[^0-9]/g, '');
            setNumValue(clean);
          }}
          placeholder="금액을 숫자로 입력하세요 (예: 123,450,000)"
          slotProps={{
            input: {
              startAdornment: (
                <Typography variant="h6" sx={{ color: 'text.secondary', mr: 1, fontWeight: 800 }}>
                  ₩
                </Typography>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              fontSize: '1.4rem',
              fontWeight: 800,
            },
          }}
        />

        {/* Quick Amount Buttons */}
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(10000)}>
            +1만
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(100000)}>
            +10만
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(1000000)}>
            +100만
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(10000000)}>
            +1,000만
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(100000000)}>
            +1억
          </Button>
          <Button size="small" variant="outlined" onClick={() => handleAddAmount(1000000000)}>
            +10억
          </Button>
          <Button size="small" variant="soft" color="error" onClick={() => setNumValue('0')}>
            초기화
          </Button>
        </Box>
      </Card>

      {/* Result Cards Grid */}
      <Grid container spacing={2.5}>
        {/* Card 1: Korean Words */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  🇰🇷 표준 한글 금액 표기
                </Typography>
                <Chip label="계약서·영수증 공식 표기" size="small" color="primary" variant="soft" />
              </Box>

              <IconButton size="small" onClick={() => handleCopy(koreanWords, 'kor')}>
                {copiedKey === 'kor' ? <CheckRoundedIcon color="success" /> : <ContentCopyRoundedIcon />}
              </IconButton>
            </Box>

            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', minHeight: 70 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.dark' }}>
                {koreanWords}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              숫자 병기: {koreanWords} (₩{rawNumber.toLocaleString()})
            </Typography>
          </Card>
        </Grid>

        {/* Card 2: Anti-Counterfeit Hanja */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  🈴 위조 방지 한자 갖은자 표기
                </Typography>
                <Chip label="금융·법률 위변조 방지" size="small" color="warning" variant="soft" />
              </Box>

              <IconButton size="small" onClick={() => handleCopy(hanjaWords, 'hanja')}>
                {copiedKey === 'hanja' ? <CheckRoundedIcon color="success" /> : <ContentCopyRoundedIcon />}
              </IconButton>
            </Box>

            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', minHeight: 70 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'warning.darker' }}>
                {hanjaWords}
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              획을 더해 숫자를 변조하지 못하도록 壹(일), 貳(이), 參(삼), 阡(천) 등의 갖은자를 사용합니다.
            </Typography>
          </Card>
        </Grid>

        {/* Card 3: English Number Words */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoneyRoundedIcon sx={{ color: 'success.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  🇺🇸 영문 통화 표기 (English Words)
                </Typography>
              </Box>

              <IconButton size="small" onClick={() => handleCopy(englishWords, 'eng')}>
                {copiedKey === 'eng' ? <CheckRoundedIcon color="success" /> : <ContentCopyRoundedIcon />}
              </IconButton>
            </Box>

            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', minHeight: 70 }}>
              <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                {englishWords}
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Card 4: VAT 10% Breakdown Card */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ReceiptLongRoundedIcon sx={{ color: 'info.main' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  🧾 세금계산서 공급가액 / 부가세(10%) 분리
                </Typography>
              </Box>

              <Button
                size="small"
                variant="soft"
                onClick={() =>
                  handleCopy(
                    `공급가액: ₩${supplyPrice.toLocaleString()} / 세액: ₩${vatAmount.toLocaleString()} / 합계: ₩${rawNumber.toLocaleString()}`,
                    'vat'
                  )
                }
              >
                {copiedKey === 'vat' ? '복사됨' : '전체 복사'}
              </Button>
            </Box>

            <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral', display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  공급가액:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  ₩{supplyPrice.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  부가세 (10%):
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'error.main' }}>
                  ₩{vatAmount.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 0.5, borderTop: (theme) => `1px dashed ${theme.palette.divider}` }}>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  합계 금액:
                </Typography>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  ₩{rawNumber.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
