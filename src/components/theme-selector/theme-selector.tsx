'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import type { SxProps, Theme } from '@mui/material/styles';

import {
  IDE_THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
} from 'src/sections/code-runner/core/editor-themes';

// ----------------------------------------------------------------------

export interface ThemeSelectorProps {
  currentThemeId: string;
  onThemeChange: (themeId: string) => void;
  size?: 'small' | 'medium';
  minWidth?: number | string;
  height?: number | string;
  showIcon?: boolean;
  sx?: SxProps<Theme>;
}

export function ThemeSelector({
  currentThemeId = DEFAULT_THEME_ID,
  onThemeChange,
  size = 'small',
  minWidth = 160,
  height = 36,
  showIcon = false,
  sx,
}: ThemeSelectorProps) {
  const activeTheme = getThemeById(currentThemeId);

  return (
    <FormControl size={size} sx={{ minWidth, ...sx }}>
      <Select
        value={currentThemeId}
        onChange={(e) => onThemeChange(e.target.value as string)}
        displayEmpty
        sx={{
          height,
          fontSize: '13px',
          bgcolor: activeTheme.uiColors.card,
          color: activeTheme.uiColors.text,
          border: `1px solid ${activeTheme.uiColors.border}`,
          borderRadius: '8px',
          '& .MuiSelect-select': {
            py: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          },
          '& .MuiSvgIcon-root': {
            color: activeTheme.uiColors.textMuted,
          },
        }}
        renderValue={(selectedId) => {
          const selected = getThemeById(selectedId);
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showIcon && <PaletteRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: selected.previewBg,
                  border: `2px solid ${selected.previewAccent}`,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body2"
                noWrap
                sx={{ fontWeight: 600, fontSize: '12.5px', color: selected.uiColors.text }}
              >
                {selected.name}
              </Typography>
            </Box>
          );
        }}
        MenuProps={{
          sx: {
            '& .MuiPaper-root': {
              maxHeight: { xs: 450, md: 540 },
              bgcolor: activeTheme.uiColors.card,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '12px',
              boxShadow: '0 12px 36px rgba(0,0,0,0.35)',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: activeTheme.uiColors.border,
                borderRadius: '4px',
              },
            },
          },
        }}
      >
        {IDE_THEMES.map((th) => (
          <MenuItem key={th.id} value={th.id} sx={{ fontSize: '13px', py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  bgcolor: th.previewBg,
                  border: `2px solid ${th.previewAccent}`,
                  flexShrink: 0,
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '13px' }}>
                  {th.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                  {th.category}
                </Typography>
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
