'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function RadixBitmaskPanel() {
  const [decVal, setDecVal] = useState<number>(42);
  const [opA, setOpA] = useState<number>(12); // 0b00001100
  const [opB, setOpB] = useState<number>(10); // 0b00001010

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast.success('복사되었습니다.');
  };

  const handleDecChange = (v: string) => {
    const n = parseInt(v, 10);
    if (!isNaN(n)) setDecVal(n);
    else if (v === '') setDecVal(0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Radix Conversion Grid */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          진법 실시간 상호 변환기 (Radix Converter)
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          {/* Decimal */}
          <TextField
            label="10진수 (Decimal)"
            value={decVal}
            onChange={(e) => handleDecChange(e.target.value)}
            InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 800 } }}
          />

          {/* Binary */}
          <TextField
            label="2진수 (Binary, 32-bit)"
            value={(decVal >>> 0).toString(2).padStart(32, '0')}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontWeight: 700, bgcolor: 'background.neutral' },
            }}
          />

          {/* Hexadecimal */}
          <TextField
            label="16진수 (Hexadecimal)"
            value={'0x' + (decVal >>> 0).toString(16).toUpperCase().padStart(8, '0')}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontWeight: 700, bgcolor: 'background.neutral' },
            }}
          />

          {/* Octal */}
          <TextField
            label="8진수 (Octal)"
            value={'0o' + (decVal >>> 0).toString(8)}
            InputProps={{
              readOnly: true,
              sx: { fontFamily: 'monospace', fontWeight: 700, bgcolor: 'background.neutral' },
            }}
          />
        </Box>
      </Card>

      {/* 2. Bitwise Operations Sandbox */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          비트 연산자 시뮬레이터 (Bitwise Logic Sandbox)
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField
            label="피연산자 A (정수)"
            type="number"
            value={opA}
            onChange={(e) => setOpA(Number(e.target.value))}
          />
          <TextField
            label="피연산자 B (정수)"
            type="number"
            value={opB}
            onChange={(e) => setOpB(Number(e.target.value))}
          />
        </Box>

        {/* Results Matrix */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
          {[
            { op: 'AND (&)', res: opA & opB, desc: '양쪽 모두 1일 때만 1' },
            { op: 'OR (|)', res: opA | opB, desc: '하나라도 1이면 1' },
            { op: 'XOR (^)', res: opA ^ opB, desc: '서로 다를 때만 1' },
            { op: 'NOT (~A)', res: ~opA, desc: '모든 비트 반전 (2의 보수 관계)' },
            { op: 'Shift Left (A << 1)', res: opA << 1, desc: '왼쪽으로 1비트 이동 (2배 곱셈)' },
            { op: 'Shift Right (A >> 1)', res: opA >> 1, desc: '부호 유지 우측 이동 (2로 나눔)' },
          ].map((item) => (
            <Card
              key={item.op}
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {item.op} = {item.res}
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  2진수: {(item.res >>> 0).toString(2).padStart(8, '0')}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {item.desc}
              </Typography>
            </Card>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
