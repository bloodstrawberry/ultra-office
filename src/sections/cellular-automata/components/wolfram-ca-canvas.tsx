'use client';

/* eslint-disable no-bitwise */

import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';

// ----------------------------------------------------------------------

const FAMOUS_RULES = [
  { rule: 30, name: 'Rule 30: 혼돈 & 의사난수 생성기 (Chaotic / PRNG)', class: 'Class 3 (카오스)' },
  { rule: 90, name: 'Rule 90: 시에르핀스키 삼각형 (XOR Fractal)', class: 'Class 2 (프랙탈 주기)' },
  { rule: 110, name: 'Rule 110: 튜링 완전성 (Turing Complete)', class: 'Class 4 (보편 계산 가능)' },
  { rule: 184, name: 'Rule 184: 도로 교통 흐름 모형 (Traffic Flow)', class: 'Class 2 (주기/흐름)' },
  { rule: 250, name: 'Rule 250: 완벽한 격자 패턴 (Symmetric Grid)', class: 'Class 2 (주기)' },
  { rule: 22, name: 'Rule 22: 프랙탈 피라미드 (Triangle Fractal)', class: 'Class 3 (카오스)' },
];

const COLS = 121;
const ROWS = 80;

export function WolframCaCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rule, setRule] = useState<number>(30);
  const [singleCenterSeed, setSingleCenterSeed] = useState<boolean>(true);

  // 8-bit binary representation of the rule
  const ruleBits = Array.from({ length: 8 }, (_, i) => (rule >> (7 - i)) & 1);

  const toggleBit = (bitIndex: number) => {
    const bitPos = 7 - bitIndex;
    const newRule = rule ^ (1 << bitPos);
    setRule(newRule);
  };

  const renderWolfram = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellW = width / COLS;
    const cellH = height / ROWS;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Initial Row (Row 0)
    let currentRow = new Uint8Array(COLS);
    if (singleCenterSeed) {
      currentRow[Math.floor(COLS / 2)] = 1;
    } else {
      for (let i = 0; i < COLS; i += 1) {
        currentRow[i] = Math.random() < 0.5 ? 1 : 0;
      }
    }

    // Render Row 0
    ctx.fillStyle = '#38BDF8';
    for (let c = 0; c < COLS; c += 1) {
      if (currentRow[c] === 1) {
        ctx.fillRect(c * cellW, 0, cellW, cellH);
      }
    }

    // Compute and Render subsequent rows
    for (let r = 1; r < ROWS; r += 1) {
      const nextRow = new Uint8Array(COLS);

      for (let c = 0; c < COLS; c += 1) {
        const left = currentRow[(c - 1 + COLS) % COLS];
        const center = currentRow[c];
        const right = currentRow[(c + 1) % COLS];

        // Neighborhood index 0 to 7: (left << 2) | (center << 1) | right
        const patternIndex = (left << 2) | (center << 1) | right;
        // Output bit is the patternIndex-th bit of rule (from LSB)
        const nextVal = (rule >> patternIndex) & 1;
        nextRow[c] = nextVal;

        if (nextVal === 1) {
          ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        }
      }

      currentRow = nextRow;
    }
  }, [rule, singleCenterSeed]);

  useEffect(() => {
    renderWolfram();
  }, [renderWolfram]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Rule Presets & Selector */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main' }}>
              울프럼 1차원 기본 셀룰러 오토마타 (Rule {rule})
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              단 8비트 규칙 하나만으로 카오스, 프랙탈, 튜링 완전 계산 능력이 창발합니다.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <FormControl size="small" sx={{ minWidth: 260 }}>
              <InputLabel id="rule-select-label">유명 규칙 프리셋</InputLabel>
              <Select
                labelId="rule-select-label"
                value={rule}
                label="유명 규칙 프리셋"
                onChange={(e) => setRule(Number(e.target.value))}
              >
                {FAMOUS_RULES.map((r) => (
                  <MenuItem key={r.rule} value={r.rule}>
                    {r.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              size="small"
              variant="outlined"
              onClick={() => setSingleCenterSeed((prev) => !prev)}
            >
              {singleCenterSeed ? '초기값: 중앙 점 1개' : '초기값: 무작위 노이즈'}
            </Button>
          </Box>
        </Box>
      </Card>

      {/* 2. Main Workspace */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 0.7fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Left: Canvas */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: 1,
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 720,
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              boxShadow: 2,
            }}
          >
            <canvas
              ref={canvasRef}
              width={720}
              height={480}
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </Box>

          {/* 8-bit rule binary toggles */}
          <Box
            sx={{ width: '100%', mt: 2, p: 1.5, bgcolor: 'background.neutral', borderRadius: 2 }}
          >
            <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 1 }}>
              🎛️ 8비트 규칙 테이블 직접 토글 (현재 룰 = {rule} = 0b
              {rule.toString(2).padStart(8, '0')}):
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(8, 1fr)',
                gap: 0.5,
                textAlign: 'center',
              }}
            >
              {['111', '110', '101', '100', '011', '010', '001', '000'].map((pattern, idx) => (
                <Paper
                  key={pattern}
                  onClick={() => toggleBit(idx)}
                  sx={{
                    p: 0.8,
                    cursor: 'pointer',
                    bgcolor: ruleBits[idx] === 1 ? 'primary.lighter' : 'background.paper',
                    border: 1,
                    borderColor: ruleBits[idx] === 1 ? 'primary.main' : 'divider',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="caption" sx={{ display: 'block', fontSize: '0.65rem' }}>
                    {pattern}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 900,
                      color: ruleBits[idx] === 1 ? 'primary.main' : 'text.disabled',
                    }}
                  >
                    {ruleBits[idx]}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        </Card>

        {/* Right: Rule 110 & 30 Explanation */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, mb: 0.5, color: 'primary.main' }}
            >
              💻 Rule 110과 튜링 완전성 (Turing Completeness)
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              2004년 매튜 쿡(Matthew Cook)은 <b>Rule 110</b> 셀룰러 오토마타에서 주기적으로 발생하는
              구조체(글라이더)들의 충돌을 이용해 <b>범용 튜링 기계(Universal Turing Machine)</b>를
              구현할 수 있음을 수학적으로 증명했습니다. 즉, 이 단순한 1차원 룰 하나로 세상의 모든
              컴퓨터 프로그램을 실행할 수 있습니다!
            </Typography>
          </Card>

          <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 800, mb: 0.5, color: 'secondary.main' }}
            >
              🎲 Rule 30과 자연의 무작위성
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
            >
              스티븐 울프럼은 <b>Rule 30</b>의 중앙 열에서 생성되는 0과 1의 시퀀스가 어떠한 수학적
              주기성도 없는 완벽한 의사난수임을 발견하고, 이를 과학 계산 프로그램 Mathematica의 난수
              생성기 핵심 알고리즘으로 채택했습니다.
            </Typography>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
