'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';

import { AVAILABLE_MODELS, type ModelOption, type LoadingProgress } from '../utils/llm-engine';

// ----------------------------------------------------------------------

interface AgentModelControlProps {
  selectedModelId: string;
  onSelectModelId: (id: string) => void;
  selectedModel: ModelOption;
  modelReady: boolean;
  isModelLoading: boolean;
  isGenerating: boolean;
  loadingProgress: LoadingProgress;
  onLoadModel: () => void;
}

export function AgentModelControl({
  selectedModelId,
  onSelectModelId,
  selectedModel,
  modelReady,
  isModelLoading,
  isGenerating,
  loadingProgress,
  onLoadModel,
}: AgentModelControlProps) {
  return (
    <Card
      sx={{
        p: 1.5,
        mb: 2,
        borderRadius: 2,
        bgcolor: 'background.neutral',
        border: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <MemoryRoundedIcon color="primary" />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              온디바이스 LLM 모델:
            </Typography>
          </Box>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 300 } }}>
            <Select
              value={selectedModelId}
              onChange={(e) => onSelectModelId(e.target.value)}
              disabled={isModelLoading || isGenerating}
              sx={{ bgcolor: 'background.paper', borderRadius: 1.5 }}
            >
              {AVAILABLE_MODELS.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Chip
                      size="small"
                      label={m.engine === 'webgpu' ? 'GPU' : 'CPU'}
                      color={m.engine === 'webgpu' ? 'primary' : 'secondary'}
                      sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {m.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', ml: 'auto' }}>
                      ({m.size})
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Chip
            size="small"
            label={`메모리: ${selectedModel.vram} | ${selectedModel.description}`}
            variant="outlined"
            sx={{ display: { xs: 'none', md: 'inline-flex' }, fontSize: 11 }}
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant={modelReady ? 'outlined' : 'contained'}
            color={modelReady ? 'success' : 'primary'}
            size="small"
            startIcon={
              isModelLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : modelReady ? (
                <CheckCircleRoundedIcon />
              ) : (
                <PlayCircleFilledWhiteRoundedIcon />
              )
            }
            onClick={onLoadModel}
            disabled={isModelLoading || isGenerating}
            sx={{ fontWeight: 700, px: 2, whiteSpace: 'nowrap' }}
          >
            {isModelLoading
              ? '가중치 다운로드 중...'
              : modelReady
                ? '모델 준비완료 (Ready)'
                : '모델 브라우저 로드'}
          </Button>
        </Box>
      </Box>

      {/* Model Loading Progress Bar */}
      {(isModelLoading ||
        loadingProgress.phase === 'downloading' ||
        loadingProgress.phase === 'compiling') && (
        <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
              ⏳ {loadingProgress.text}
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              {Math.round(loadingProgress.progress * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.round(loadingProgress.progress * 100)}
            sx={{ height: 6, borderRadius: 3 }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 0.5, fontSize: 11 }}
          >
            💡 최초 1회만 브라우저 로컬 캐시(CacheStorage)에 저장되며, 이후에는 재다운로드 없이 즉시
            로드됩니다.
          </Typography>
        </Box>
      )}
    </Card>
  );
}
