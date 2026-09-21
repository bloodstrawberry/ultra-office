'use client';

import type { MlModelId } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { ML_MODELS } from '../utils/model-catalog';

// ----------------------------------------------------------------------

interface MlHeaderNavProps {
  currentModelId?: MlModelId;
}

export function MlHeaderNav({ currentModelId }: MlHeaderNavProps) {
  const currentModel = ML_MODELS.find((m) => m.id === currentModelId);

  return (
    <Box sx={{ mb: 2.5, flexShrink: 0 }}>
      {/* Top row: Title and Hub button */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
              color: 'primary.main',
            }}
          >
            <PsychologyRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {currentModel ? currentModel.nameKo : '머신러닝 스튜디오 (Machine Learning Studio)'}
              </Typography>
              {currentModel && (
                <Chip
                  label={currentModel.categoryNameKo}
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ fontWeight: 700, fontSize: '0.75rem' }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {currentModel
                ? currentModel.description
                : 'Next.js 웹 브라우저에서 인터랙티브하게 지도학습, 비지도학습, 군집화, 신경망 및 ML 라이브러리를 테스트합니다.'}
            </Typography>
          </Box>
        </Box>

        {currentModelId && (
          <Button
            component={RouterLink}
            href={paths.ml.root}
            variant="outlined"
            size="small"
            startIcon={<HubRoundedIcon />}
            sx={{ fontWeight: 700 }}
          >
            전체 모델 허브
          </Button>
        )}
      </Box>

      {/* Model Quick Switcher Bar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.75,
          p: 1,
          borderRadius: 1.5,
          bgcolor: 'background.neutral',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Button
          component={RouterLink}
          href={paths.ml.root}
          size="small"
          variant={!currentModelId ? 'contained' : 'text'}
          color="inherit"
          sx={{
            fontWeight: 700,
            fontSize: '0.8125rem',
            py: 0.5,
            px: 1.25,
            borderRadius: 1,
          }}
        >
          🏠 허브
        </Button>

        {ML_MODELS.map((model) => {
          const isActive = currentModelId === model.id;
          return (
            <Button
              key={model.id}
              component={RouterLink}
              href={model.path}
              size="small"
              variant={isActive ? 'contained' : 'text'}
              color={isActive ? 'primary' : 'inherit'}
              sx={{
                fontWeight: isActive ? 800 : 600,
                fontSize: '0.8125rem',
                py: 0.5,
                px: 1.25,
                borderRadius: 1,
                bgcolor: isActive ? 'primary.main' : 'transparent',
                '&:hover': {
                  bgcolor: isActive ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {model.nameKo.split(' ')[0]} {model.nameKo.split(' ')[1] || ''}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
}
