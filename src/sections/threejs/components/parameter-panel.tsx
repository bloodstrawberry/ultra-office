'use client';

import type { ExampleDefinition } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

// ----------------------------------------------------------------------

interface ParameterPanelProps {
  example: ExampleDefinition;
  params: Record<string, number | string | boolean>;
  onParamChange: (key: string, value: number | string | boolean) => void;
  onAction: (actionKey: string) => void;
  onResetParams: () => void;
}

export function ParameterPanel({
  example,
  params,
  onParamChange,
  onAction,
  onResetParams,
}: ParameterPanelProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
        overflowY: 'auto',
        p: 2,
      }}
    >
      {/* 1. Header & Reset */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TuneRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            파라미터 실시간 튜닝
          </Typography>
        </Box>

        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<RestartAltRoundedIcon fontSize="small" />}
          onClick={onResetParams}
          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
        >
          기본값 복원
        </Button>
      </Box>

      {/* 2. Dynamic Controls List */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          bgcolor: 'background.paper',
        }}
      >
        {example.controls.length === 0 ? (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
            이 예제는 추가 조절 파라미터 없이 완전 자동 렌더링됩니다.
          </Typography>
        ) : (
          example.controls.map((ctrl) => {
            const val = params[ctrl.key] ?? example.defaultParams[ctrl.key];

            // 1. Slider
            if (ctrl.type === 'slider') {
              return (
                <Box key={ctrl.key} sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      {ctrl.label}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 800, fontFamily: 'monospace' }}
                    >
                      {Number(val).toFixed(ctrl.step && ctrl.step < 1 ? 2 : 0)} {ctrl.unit || ''}
                    </Typography>
                  </Box>
                  <Slider
                    size="small"
                    value={Number(val)}
                    min={ctrl.min ?? 0}
                    max={ctrl.max ?? 100}
                    step={ctrl.step ?? 1}
                    onChange={(_, newVal) => onParamChange(ctrl.key, newVal as number)}
                  />
                </Box>
              );
            }

            // 2. Color Picker
            if (ctrl.type === 'color') {
              return (
                <Box
                  key={ctrl.key}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {ctrl.label}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <input
                      type="color"
                      value={String(val || '#ffffff')}
                      onChange={(e) => onParamChange(ctrl.key, e.target.value)}
                      style={{
                        width: 32,
                        height: 28,
                        borderRadius: 6,
                        border: '1px solid rgba(128,128,128,0.3)',
                        cursor: 'pointer',
                        background: 'none',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{ fontFamily: 'monospace', color: 'text.secondary' }}
                    >
                      {String(val || '').toUpperCase()}
                    </Typography>
                  </Box>
                </Box>
              );
            }

            // 3. Switch (Boolean)
            if (ctrl.type === 'switch') {
              return (
                <Box
                  key={ctrl.key}
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {ctrl.label}
                  </Typography>
                  <Switch
                    size="small"
                    checked={Boolean(val)}
                    onChange={(e) => onParamChange(ctrl.key, e.target.checked)}
                  />
                </Box>
              );
            }

            // 4. Select Dropdown
            if (ctrl.type === 'select' && ctrl.options) {
              return (
                <FormControl key={ctrl.key} size="small" fullWidth>
                  <InputLabel sx={{ fontSize: '0.8rem' }}>{ctrl.label}</InputLabel>
                  <Select
                    value={val}
                    label={ctrl.label}
                    onChange={(e) => onParamChange(ctrl.key, e.target.value)}
                    sx={{ fontSize: '0.85rem' }}
                  >
                    {ctrl.options.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '0.85rem' }}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            }

            // 5. Trigger Action Button
            if (ctrl.type === 'button') {
              return (
                <Button
                  key={ctrl.key}
                  variant="outlined"
                  size="small"
                  onClick={() => onAction(ctrl.key)}
                  sx={{ fontWeight: 700 }}
                >
                  {ctrl.label}
                </Button>
              );
            }

            return null;
          })
        )}
      </Card>

      {/* 3. Key Concepts & Technical Notes */}
      <Card
        variant="outlined"
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolRoundedIcon sx={{ color: 'info.main', fontSize: 18 }} />
          <Typography variant="caption" sx={{ fontWeight: 800 }}>
            핵심 기술 및 Three.js API
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
          {example.keyConcepts.map((concept) => (
            <Chip
              key={concept}
              label={concept}
              size="small"
              variant="outlined"
              sx={{
                fontSize: '0.72rem',
                fontFamily: 'monospace',
                fontWeight: 700,
                bgcolor: 'background.paper',
              }}
            />
          ))}
        </Box>

        <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.5, mt: 0.5 }}>
          {example.description}
        </Typography>
      </Card>
    </Box>
  );
}
