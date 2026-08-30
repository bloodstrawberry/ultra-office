'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';

import { GIF_SAMPLE_LIST, type GifSampleItem } from '../data/gif-samples';

// ----------------------------------------------------------------------

export interface GifSampleSectionProps {
  onSelectSample: (sample: GifSampleItem) => void;
  onSelectAllSamples?: () => void;
  title?: string;
  subtitle?: string;
  actionLabel?: string;
  allActionLabel?: string;
  loadingSampleId?: string | null;
  isLoading?: boolean;
}

export function GifSampleSection({
  onSelectSample,
  onSelectAllSamples,
  title = '⚡ 즉석 테스트 예시 GIF 파일',
  subtitle = '클릭 한 번으로 3종의 고화질 예시 움짤을 불러와 즉시 편집을 체험해 보세요.',
  actionLabel = '체험하기 ➜',
  allActionLabel = '✨ 3개 예시 모두 타임라인에 추가',
  loadingSampleId = null,
  isLoading = false,
}: GifSampleSectionProps) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        flexShrink: 0,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ color: 'warning.main', fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
          </Box>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {onSelectAllSamples && (
          <Button
            variant="outlined"
            color="primary"
            size="small"
            startIcon={
              isLoading ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <PlaylistAddRoundedIcon />
              )
            }
            disabled={isLoading}
            onClick={onSelectAllSamples}
            sx={{ fontWeight: 700, borderRadius: 2, flexShrink: 0 }}
          >
            {allActionLabel}
          </Button>
        )}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(3, 1fr)',
          },
          gap: 1.5,
        }}
      >
        {GIF_SAMPLE_LIST.map((sample) => {
          const isItemLoading = loadingSampleId === sample.id;

          return (
            <Card
              key={sample.id}
              onClick={() => {
                if (!isLoading && !loadingSampleId) {
                  onSelectSample(sample);
                }
              }}
              sx={{
                p: 1.5,
                borderRadius: 2,
                cursor: isLoading ? 'default' : 'pointer',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: 'action.hover',
                  transform: 'translateY(-2px)',
                  boxShadow: (theme) => theme.customShadows?.z8 || 3,
                },
              }}
            >
              {/* Thumbnail */}
              <Box
                sx={{
                  position: 'relative',
                  width: 62,
                  height: 62,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  flexShrink: 0,
                  bgcolor: 'background.neutral',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={sample.url}
                  alt={sample.label}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {isItemLoading && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      bgcolor: 'rgba(0, 0, 0, 0.45)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CircularProgress size={20} sx={{ color: '#fff' }} />
                  </Box>
                )}
              </Box>

              {/* Text Info */}
              <Box sx={{ minWidth: 0, flex: '1 1 auto' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {sample.label}
                  </Typography>
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    fontSize: '0.72rem',
                    mb: 0.25,
                  }}
                  noWrap
                >
                  {sample.subLabel}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Chip
                    label={sample.tag}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 18, fontSize: '0.65rem', fontWeight: 600 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      display: 'inline-block',
                      ml: 'auto',
                    }}
                  >
                    {isItemLoading ? '로딩 중...' : actionLabel}
                  </Typography>
                </Box>
              </Box>
            </Card>
          );
        })}
      </Box>
    </Card>
  );
}
