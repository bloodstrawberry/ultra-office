'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { ENTITY_PRESET_A, ENTITY_PRESET_B } from '../data/compare-presets';

// ----------------------------------------------------------------------

export function EntityCompareTab() {
  const entitiesA = ENTITY_PRESET_A;
  const entitiesB = ENTITY_PRESET_B;

  const idsB = new Set(entitiesB.map((e) => e.id));
  const idsA = new Set(entitiesA.map((e) => e.id));
  const entityOnlyA = entitiesA.filter((e) => !idsB.has(e.id));
  const entityOnlyB = entitiesB.filter((e) => !idsA.has(e.id));
  const entityCommon = entitiesA.filter((e) => idsB.has(e.id));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Summary Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
        <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'error.lighter' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.dark' }}>
            A 조직에만 있는 인원
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', my: 0.5 }}>
            {entityOnlyA.length}명
          </Typography>
        </Card>
        <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.dark' }}>
            양쪽 공통 소속 인원
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', my: 0.5 }}>
            {entityCommon.length}명
          </Typography>
        </Card>
        <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
            B 조직에만 있는 인원
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', my: 0.5 }}>
            {entityOnlyB.length}명
          </Typography>
        </Card>
      </Box>

      {/* 3-Column Entity Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Only A */}
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'error.main' }}>
            A 전용 인력 명단
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entityOnlyA.map((e) => (
              <Card key={e.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {e.name}
                  </Typography>
                  <Chip label={e.role} size="small" sx={{ height: 20 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {e.dept} ({e.id})
                </Typography>
              </Card>
            ))}
          </Box>
        </Card>

        {/* Common */}
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'info.main' }}>
            공통 참여 인력 명단
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entityCommon.map((e) => (
              <Card
                key={e.id}
                variant="outlined"
                sx={{ p: 1.2, borderRadius: 1.5, borderColor: 'info.light' }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {e.name}
                  </Typography>
                  <Chip label={e.role} color="info" size="small" sx={{ height: 20 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {e.dept} ({e.id})
                </Typography>
              </Card>
            ))}
          </Box>
        </Card>

        {/* Only B */}
        <Card sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'success.main' }}>
            B 전용 인력 명단
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {entityOnlyB.map((e) => (
              <Card key={e.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>
                    {e.name}
                  </Typography>
                  <Chip label={e.role} size="small" sx={{ height: 20 }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {e.dept} ({e.id})
                </Typography>
              </Card>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
