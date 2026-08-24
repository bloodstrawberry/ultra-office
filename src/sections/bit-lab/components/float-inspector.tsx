'use client';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { bitsToFloat32, decomposeFloat32 } from '../utils/ieee754-utils';

// ----------------------------------------------------------------------

export function FloatInspector() {
  const [numInput, setNumInput] = useState<string>('0.1');
  const [activeBits, setActiveBits] = useState<string>('00111101110011001100110011001101');

  const decomp = useMemo(() => bitsToFloat32(activeBits), [activeBits]);

  const handleInputChange = (val: string) => {
    setNumInput(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const d = decomposeFloat32(num);
      setActiveBits(`${d.signBit}${d.exponentBits}${d.mantissaBits}`);
    }
  };

  const handleToggleBit = (index: number) => {
    const bitArr = activeBits.split('');
    bitArr[index] = bitArr[index] === '1' ? '0' : '1';
    const nextBits = bitArr.join('');
    setActiveBits(nextBits);
    const d = bitsToFloat32(nextBits);
    setNumInput(d.actualDecimal.toString());
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header & Input */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            label="10진수 실수 입력 (Decimal Float)"
            value={numInput}
            onChange={(e) => handleInputChange(e.target.value)}
            sx={{ width: 220 }}
          />

          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => handleInputChange('0.1')}
          >
            0.1 (오차 증명)
          </Button>

          <Button size="small" variant="outlined" onClick={() => handleInputChange('3.141592')}>
            π (3.141592)
          </Button>

          <Button size="small" variant="outlined" onClick={() => handleInputChange('-42.75')}>
            -42.75
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <Chip
            label={`HEX: ${decomp.hex}`}
            color="primary"
            sx={{ fontWeight: 800, fontFamily: 'monospace' }}
          />
          {decomp.specialLabel && (
            <Chip label={decomp.specialLabel} color="error" sx={{ fontWeight: 800 }} />
          )}
        </Box>
      </Box>

      {/* 2. Interactive 32-bit Switch Bar */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary' }}>
          각 비트(0/1)를 직접 클릭하여 실시간으로 부동소수점 값을 조작할 수 있습니다:
        </Typography>

        {/* Bit Cells */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '3px',
            bgcolor: '#0f172a',
            p: 2,
            borderRadius: 2,
            border: '1px solid #1e293b',
          }}
        >
          {activeBits.split('').map((bit, idx) => {
            const isSign = idx === 0;
            const isExp = idx >= 1 && idx <= 8;
            const isMantissa = idx >= 9;

            const bitColor = isSign
              ? '#ef4444' // Red
              : isExp
                ? '#38bdf8' // Blue
                : '#22c55e'; // Green

            return (
              <Box
                key={idx}
                onClick={() => handleToggleBit(idx)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  p: 0.3,
                  '&:hover': { opacity: 0.8 },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ color: '#64748b', fontSize: '9px', userSelect: 'none' }}
                >
                  {31 - idx}
                </Typography>
                <Box
                  sx={{
                    width: 22,
                    height: 28,
                    bgcolor: bit === '1' ? bitColor : 'rgba(255,255,255,0.06)',
                    color: bit === '1' ? '#ffffff' : '#94a3b8',
                    border: `1.5px solid ${bitColor}`,
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {bit}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* 3. Mathematical Decomposition Formula Box */}
      <Card
        variant="outlined"
        sx={{
          p: 2.5,
          bgcolor: 'background.neutral',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Sign */}
        <Box sx={{ borderLeft: '4px solid #ef4444', pl: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#ef4444' }}>
            [1] 부호 비트 (Sign, 1 bit)
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, fontFamily: 'monospace' }}>
            {decomp.signBit === 0 ? '+ (양수)' : '- (음수)'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            (-1)^{decomp.signBit} = {decomp.signBit === 0 ? '+1' : '-1'}
          </Typography>
        </Box>

        {/* Exponent */}
        <Box sx={{ borderLeft: '4px solid #38bdf8', pl: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#38bdf8' }}>
            [2] 지수부 (Exponent, 8 bits)
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, fontFamily: 'monospace' }}>
            2^({decomp.exponentRaw} - 127) = 2^{decomp.exponentBiased}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            이진수: {decomp.exponentBits} (Raw: {decomp.exponentRaw})
          </Typography>
        </Box>

        {/* Mantissa */}
        <Box sx={{ borderLeft: '4px solid #22c55e', pl: 1.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#22c55e' }}>
            [3] 가수부 (Mantissa, 23 bits)
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, mt: 0.5, fontFamily: 'monospace' }}>
            {decomp.mantissaFraction.toFixed(7)}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            1 + 0.{decomp.mantissaBits}
          </Typography>
        </Box>
      </Card>

      {/* 4. Precision Proof Callout */}
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: '#fef3c7',
          border: '1px solid #fde047',
          color: '#92400e',
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          💡 왜 0.1은 2진수 부동소수점에서 정확히 떨어지지 않을까요?
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', mt: 0.5, lineHeight: 1.6 }}>
          10진수 0.1은 2진수로 변환하면 <code>0.00011001100110011...</code> 처럼{' '}
          <strong>무한 순환 소수</strong>가 됩니다. 23비트 가수부의 한계로 끝에서 잘리면서(반올림)
          실제 저장된 값은 <code>{decomp.actualDecimal}</code>이 되어 미세한 오차가 발생합니다.
        </Typography>
      </Box>
    </Card>
  );
}
