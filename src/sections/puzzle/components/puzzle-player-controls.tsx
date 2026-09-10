'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SkipNextRoundedIcon from '@mui/icons-material/SkipNextRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import SkipPreviousRoundedIcon from '@mui/icons-material/SkipPreviousRounded';

export interface PuzzlePlayerControlsProps {
  title?: string;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentStep: number;
  totalSteps: number;
  onStepChange: (step: number) => void;
  onPrevStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  speed: number; // Multiplier: 0.5, 1, 2, 4
  onSpeedChange: (speed: number) => void;
  currentDescription?: string | null;
  disabled?: boolean;
  variant?: 'card' | 'plain';
  mediaActions?: React.ReactNode;
}

export function PuzzlePlayerControls({
  title = '🎬 풀이 과정 비주얼 플레이어',
  isPlaying,
  onTogglePlay,
  currentStep,
  totalSteps,
  onStepChange,
  onPrevStep,
  onNextStep,
  onReset,
  speed,
  onSpeedChange,
  currentDescription,
  disabled = false,
  variant = 'card',
  mediaActions,
}: PuzzlePlayerControlsProps) {
  const progressPercent = totalSteps > 0 ? Math.round((currentStep / totalSteps) * 100) : 0;

  const content = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      {/* Header bar if plain */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 800,
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {mediaActions}
          <Chip
            label={
              isPlaying
                ? '재생 중'
                : currentStep === totalSteps && totalSteps > 0
                  ? '풀이 완료'
                  : '일시정지'
            }
            size="small"
            color={
              isPlaying
                ? 'primary'
                : currentStep === totalSteps && totalSteps > 0
                  ? 'success'
                  : 'default'
            }
            variant="soft"
            sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
          />
        </Box>
      </Box>

      {/* Step Info & Description */}
      <Box
        sx={{
          bgcolor: 'action.hover',
          p: 1.25,
          borderRadius: 1.5,
          minHeight: 46,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Box
          sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            단계: {currentStep} / {totalSteps} ({progressPercent}%)
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
            속도: {speed}x
          </Typography>
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            fontSize: '0.8125rem',
            color: 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {currentDescription ||
            (totalSteps === 0
              ? '치트키를 실행하여 풀이 경로를 생성하세요.'
              : '재생 버튼을 눌러 풀이 과정을 시작하세요.')}
        </Typography>
      </Box>

      {/* Timeline Slider */}
      <Box sx={{ px: 0.5, py: 0 }}>
        <Slider
          value={currentStep}
          min={0}
          max={Math.max(totalSteps, 1)}
          step={1}
          size="small"
          disabled={disabled || totalSteps === 0}
          onChange={(_, val) => onStepChange(val as number)}
          sx={{
            color: 'primary.main',
            py: 0.5,
            '& .MuiSlider-thumb': {
              width: 14,
              height: 14,
            },
          }}
        />
      </Box>

      {/* Playback Controls & Speed Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="처음으로 되돌리기">
            <span>
              <IconButton
                size="small"
                onClick={onReset}
                disabled={disabled || currentStep === 0}
                sx={{ border: '1px solid', borderColor: 'divider', p: 0.5 }}
              >
                <ReplayRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="이전 단계">
            <span>
              <IconButton
                size="small"
                onClick={onPrevStep}
                disabled={disabled || currentStep <= 0}
                sx={{ border: '1px solid', borderColor: 'divider', p: 0.5 }}
              >
                <SkipPreviousRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title={isPlaying ? '일시정지' : '풀이 과정 재생'}>
            <span>
              <IconButton
                color="primary"
                onClick={onTogglePlay}
                disabled={disabled || totalSteps === 0}
                sx={{
                  bgcolor: isPlaying ? 'warning.main' : 'primary.main',
                  color: '#FFF',
                  p: 0.75,
                  '&:hover': {
                    bgcolor: isPlaying ? 'warning.dark' : 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    bgcolor: 'action.disabledBackground',
                    color: 'action.disabled',
                  },
                }}
              >
                {isPlaying ? (
                  <PauseRoundedIcon sx={{ fontSize: 20 }} />
                ) : (
                  <PlayArrowRoundedIcon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="다음 단계">
            <span>
              <IconButton
                size="small"
                onClick={onNextStep}
                disabled={disabled || currentStep >= totalSteps}
                sx={{ border: '1px solid', borderColor: 'divider', p: 0.5 }}
              >
                <SkipNextRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        {/* Speed Selector */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <SpeedRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <ToggleButtonGroup
            size="small"
            value={speed}
            exclusive
            onChange={(_, val) => {
              if (val !== null) onSpeedChange(val);
            }}
          >
            {[0.5, 1, 2, 4].map((s) => (
              <ToggleButton
                key={s}
                value={s}
                sx={{ px: 0.75, py: 0.2, fontSize: '0.7rem', fontWeight: 700 }}
              >
                {s}x
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Box>
  );

  if (variant === 'plain') {
    return content;
  }

  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'primary.main',
        boxShadow: 2,
        p: 2,
      }}
    >
      {content}
    </Card>
  );
}
