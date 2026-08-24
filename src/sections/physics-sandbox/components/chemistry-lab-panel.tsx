'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { POPULAR_REACTIONS, PERIODIC_ELEMENTS } from '../utils/chemistry-utils';

// ----------------------------------------------------------------------

export function ChemistryLabPanel() {
  const [selectedReaction, setSelectedReaction] = useState(POPULAR_REACTIONS[0]!);
  const [searchElement, setSearchElement] = useState('');

  const filteredElements = PERIODIC_ELEMENTS.filter(
    (e) =>
      e.symbol.toLowerCase().includes(searchElement.toLowerCase()) ||
      e.name.toLowerCase().includes(searchElement.toLowerCase()) ||
      e.koreanName.includes(searchElement)
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Chemical Reaction Balancer */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          화학 반응식 자동 균형기 (Chemical Equation Balancer)
        </Typography>

        {/* Reaction Presets */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {POPULAR_REACTIONS.map((r) => (
            <Chip
              key={r.input}
              label={r.desc}
              clickable
              variant={selectedReaction.input === r.input ? 'filled' : 'outlined'}
              color={selectedReaction.input === r.input ? 'primary' : 'default'}
              onClick={() => setSelectedReaction(r)}
              sx={{ fontWeight: 700 }}
            />
          ))}
        </Box>

        {/* Reaction Result Banner */}
        <Card
          variant="outlined"
          sx={{
            p: 3,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '2px solid',
            borderColor: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
            균형 맞춘 화학 반응식 (Balanced Equation):
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '0.05em' }}
          >
            {selectedReaction.output}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            반응물: <code>{selectedReaction.input.split('->')[0]}</code> ➔ 생성물:{' '}
            <code>{selectedReaction.input.split('->')[1]}</code>
          </Typography>
        </Card>
      </Card>

      {/* 2. Interactive Periodic Table Explorer */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            원소 주기율표 데이터 탐색기 (Periodic Table Explorer)
          </Typography>
          <TextField
            size="small"
            placeholder="원소 검색 (수소, He, Carbon)..."
            value={searchElement}
            onChange={(e) => setSearchElement(e.target.value)}
            sx={{ width: 220 }}
          />
        </Box>

        {/* Elements Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, 1fr)',
              sm: 'repeat(4, 1fr)',
              md: 'repeat(5, 1fr)',
            },
            gap: 1.5,
          }}
        >
          {filteredElements.map((el) => (
            <Card
              key={el.number}
              variant="outlined"
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>
                  #{el.number}
                </Typography>
                <Chip
                  label={el.category}
                  size="small"
                  variant="outlined"
                  sx={{ height: 18, fontSize: '10px' }}
                />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', my: 0.5 }}>
                {el.symbol}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {el.koreanName} ({el.name})
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                원자량: {el.mass} u
              </Typography>
            </Card>
          ))}
        </Box>
      </Card>
    </Box>
  );
}
