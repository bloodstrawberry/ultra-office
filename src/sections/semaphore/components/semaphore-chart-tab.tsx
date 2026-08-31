'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { SEMAPHORE_MAP } from '../utils/semaphore-data';
import { SemaphoreFlagCanvas } from './semaphore-flag-canvas';

// ----------------------------------------------------------------------

export function SemaphoreChartTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flex: '1 1 auto', minHeight: 0 }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          해군 수기 신호(Semaphore) 및 국제 해상 신호기 도감
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          8방위 깃발 각도 조합으로 표현하는 수기 신호와 각 알파벳 신호기가 지닌 대표 해상
          의미입니다.
        </Typography>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', alignContent: 'flex-start' }}
      >
        {Object.values(SEMAPHORE_MAP).map((item) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={`sem-${item.char}`}>
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.customShadows?.z4,
                },
              }}
            >
              <SemaphoreFlagCanvas item={item} size={76} />

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.2,
                  minWidth: 0,
                  flexGrow: 1,
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {item.char}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {item.description}
                </Typography>
                {item.flagMeaning && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'info.main',
                      fontWeight: 700,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.flagMeaning}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
