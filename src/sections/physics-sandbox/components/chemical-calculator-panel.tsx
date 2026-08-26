'use client';

import type { MolarMassResult, BalancedEquationResult } from '../chemistry/molecule-types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import BalanceRoundedIcon from '@mui/icons-material/BalanceRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';

import { calculateMolarMass, balanceChemicalEquation } from '../chemistry/chem-balancer';

// ----------------------------------------------------------------------

const POPULAR_EQUATIONS = [
  'H2 + O2 -> H2O',
  'CH4 + O2 -> CO2 + H2O',
  'N2 + H2 -> NH3',
  'Fe + O2 -> Fe2O3',
  'C2H6 + O2 -> CO2 + H2O',
  'C3H8 + O2 -> CO2 + H2O',
  'C6H12O6 + O2 -> CO2 + H2O',
  'HCl + NaOH -> NaCl + H2O',
];

const POPULAR_FORMULAS = ['H2O', 'CO2', 'H2SO4', 'C2H5OH', 'NaCl', 'C6H12O6', 'C8H10N4O2'];

export function ChemicalCalculatorPanel() {
  // 1. Equation Balancer State
  const [equationInput, setEquationInput] = useState('CH4 + O2 -> CO2 + H2O');
  const [equationResult, setEquationResult] = useState<BalancedEquationResult | null>(() =>
    balanceChemicalEquation('CH4 + O2 -> CO2 + H2O')
  );

  // 2. Molar Mass State
  const [formulaInput, setFormulaInput] = useState('H2SO4');
  const [massResult, setMassResult] = useState<MolarMassResult | null>(() =>
    calculateMolarMass('H2SO4')
  );

  const handleBalance = () => {
    setEquationResult(balanceChemicalEquation(equationInput));
  };

  const handleCalculateMass = () => {
    setMassResult(calculateMolarMass(formulaInput));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Chemical Reaction Equation Balancer Card */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BalanceRoundedIcon sx={{ fontSize: 28, color: 'primary.main' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              화학 반응식 자동 균형기 (Chemical Equation Balancer)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              반응물과 생성물을 입력하면 질량 보존 법칙에 따라 최적의 화학 양론 계수를 자동
              산출합니다.
            </Typography>
          </Box>
        </Box>

        {/* Input & Action */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="반응물 -> 생성물 입력 (예: CH4 + O2 -> CO2 + H2O)..."
            value={equationInput}
            onChange={(e) => setEquationInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBalance();
            }}
            sx={{ fontFamily: 'monospace' }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleBalance}
            sx={{ fontWeight: 800, flexShrink: 0, px: 3 }}
          >
            계수 산출
          </Button>
        </Box>

        {/* Presets Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            추천 반응식:
          </Typography>
          {POPULAR_EQUATIONS.map((eq) => (
            <Chip
              key={eq}
              label={eq}
              size="small"
              clickable
              variant={equationInput === eq ? 'filled' : 'outlined'}
              color={equationInput === eq ? 'primary' : 'default'}
              onClick={() => {
                setEquationInput(eq);
                setEquationResult(balanceChemicalEquation(eq));
              }}
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            />
          ))}
        </Box>

        {/* Result Box */}
        {equationResult && (
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              border: '2px solid',
              borderColor: equationResult.isSuccess ? 'primary.main' : 'error.main',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              균형 맞춘 화학 반응식 (Balanced Equation):
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 900,
                color: equationResult.isSuccess ? 'primary.main' : 'error.main',
                letterSpacing: '0.04em',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}
            >
              {equationResult.isSuccess ? equationResult.balancedEquation : '계산 실패'}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {equationResult.message}
            </Typography>
          </Card>
        )}
      </Card>

      {/* 2. Molar Mass & Mass Percent Composition Calculator */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CalculateRoundedIcon sx={{ fontSize: 28, color: 'success.main' }} />
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              몰 질량 (분자량) 및 원소별 질량 퍼센트(%) 조성비 계산기
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              화학 분자식을 입력하면 총 몰 질량(g/mol)과 각 구성 원소의 질량 백분율을 시각화합니다.
            </Typography>
          </Box>
        </Box>

        {/* Input & Action */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="임의 화학식 입력 (예: H2SO4, Ca(OH)2, C6H12O6)..."
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCalculateMass();
            }}
            sx={{ fontFamily: 'monospace' }}
          />
          <Button
            variant="contained"
            color="success"
            onClick={handleCalculateMass}
            sx={{ fontWeight: 800, flexShrink: 0, px: 3 }}
          >
            질량 산출
          </Button>
        </Box>

        {/* Preset Formulas */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            추천 분자식:
          </Typography>
          {POPULAR_FORMULAS.map((f) => (
            <Chip
              key={f}
              label={f}
              size="small"
              clickable
              variant={formulaInput === f ? 'filled' : 'outlined'}
              color={formulaInput === f ? 'success' : 'default'}
              onClick={() => {
                setFormulaInput(f);
                setMassResult(calculateMolarMass(f));
              }}
              sx={{ fontFamily: 'monospace', fontWeight: 700 }}
            />
          ))}
        </Box>

        {/* Result Breakdown Card */}
        {massResult && (
          <Card variant="outlined" sx={{ p: 3, borderRadius: 2, bgcolor: 'background.neutral' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2.5,
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                분자식: <code>{massResult.formula}</code>
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'success.main' }}>
                총 몰 질량: {massResult.totalMass} g/mol
              </Typography>
            </Box>

            {/* Elements Composition Bars */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {massResult.composition.map((c) => (
                <Box key={c.symbol}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {c.nameKo} ({c.symbol}) × {c.count}개
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 900, color: 'success.dark', fontFamily: 'monospace' }}
                    >
                      {c.massPercent}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={c.massPercent}
                    color="success"
                    sx={{ height: 10, borderRadius: 1.5 }}
                  />
                </Box>
              ))}
            </Box>
          </Card>
        )}
      </Card>
    </Box>
  );
}
