'use client';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import {
  FORMAT_REGISTRY,
  TARGET_META_MAP,
  type FormatCategory,
} from '../utils/universal-converter';

// ----------------------------------------------------------------------

interface FormatPickerPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  selectedFormat: string;
  onSelect: (formatId: string) => void;
  mode: 'from' | 'to';
  allowedTargets?: string[];
  title?: string;
}

const CATEGORY_TABS: { value: 'all' | FormatCategory; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'video', label: '비디오' },
  { value: 'audio', label: '오디오' },
  { value: 'image', label: '이미지' },
  { value: 'sheet', label: '스프레드시트' },
  { value: 'doc', label: '문서' },
  { value: 'data', label: '데이터' },
];

export function FormatPickerPopover({
  open,
  anchorEl,
  onClose,
  selectedFormat,
  onSelect,
  mode,
  allowedTargets,
  title,
}: FormatPickerPopoverProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | FormatCategory>('all');

  // Compute format list to display
  const items = useMemo(() => {
    const list: {
      id: string;
      label: string;
      category: FormatCategory;
      desc: string;
      color: string;
    }[] = [];

    if (mode === 'from') {
      Object.values(FORMAT_REGISTRY).forEach((meta) => {
        list.push({
          id: meta.id,
          label: meta.label,
          category: meta.category,
          desc: meta.description,
          color: meta.badgeColor,
        });
      });
    } else {
      // Mode === 'to'
      const targetIds =
        allowedTargets && allowedTargets.length > 0 ? allowedTargets : Object.keys(TARGET_META_MAP);

      targetIds.forEach((tId) => {
        const fromReg = FORMAT_REGISTRY[tId];
        const targetMeta = TARGET_META_MAP[tId];

        const label = targetMeta?.label || fromReg?.label || tId.toUpperCase();
        const category = fromReg?.category || 'data';
        const desc = fromReg?.description || `${label} 파일 포맷`;
        const color = fromReg?.badgeColor || '#3B82F6';

        list.push({ id: tId, label, category, desc, color });
      });
    }

    return list.filter((item) => {
      const matchCat = activeCategory === 'all' || item.category === activeCategory;
      const matchQuery =
        !searchQuery.trim() ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [mode, allowedTargets, activeCategory, searchQuery]);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
      slotProps={{
        paper: {
          sx: {
            width: 440,
            maxHeight: 480,
            p: 2,
            borderRadius: 2,
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 12px 36px rgba(0,0,0,0.6)'
                : '0 12px 36px rgba(0,0,0,0.14)',
            border: (theme) => `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {title || (mode === 'from' ? '원본 포맷 (FROM) 선택' : '변환 대상 포맷 (TO) 선택')}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {items.length}개 포맷 지원
        </Typography>
      </Box>

      {/* Search Input */}
      <TextField
        size="small"
        placeholder="확장자 검색 (예: MP3, PNG, XLSX, JSON...)"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        autoFocus
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1.5 }}
      />

      {/* Category Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 1.5, flexShrink: 0 }}>
        <Tabs
          value={activeCategory}
          onChange={(_, val) => setActiveCategory(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 36,
            '& .MuiTab-root': {
              minHeight: 36,
              py: 0.5,
              px: 1.25,
              fontSize: '0.8rem',
              fontWeight: 600,
            },
          }}
        >
          {CATEGORY_TABS.map((tab) => (
            <Tab key={tab.value} label={tab.label} value={tab.value} />
          ))}
        </Tabs>
      </Box>

      {/* Grid of formats */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 1,
          pr: 0.5,
          minHeight: 180,
        }}
      >
        {items.map((item) => {
          const isSelected = selectedFormat.toLowerCase() === item.id.toLowerCase();
          return (
            <Button
              key={item.id}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
              sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderRadius: 1.5,
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                color: isSelected ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              <Box
                sx={{
                  px: 1,
                  py: 0.4,
                  borderRadius: 1,
                  bgcolor: isSelected ? 'rgba(255,255,255,0.2)' : item.color,
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  mr: 1.2,
                  flexShrink: 0,
                  minWidth: 44,
                  textAlign: 'center',
                }}
              >
                {item.label}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    fontSize: '0.82rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: isSelected ? 'rgba(255,255,255,0.85)' : 'text.secondary',
                    fontSize: '0.7rem',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>

              {isSelected && (
                <CheckCircleRoundedIcon
                  sx={{ fontSize: 18, color: 'primary.contrastText', ml: 0.5, flexShrink: 0 }}
                />
              )}
            </Button>
          );
        })}

        {items.length === 0 && (
          <Box
            sx={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 4,
            }}
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              일치하는 확장자가 없습니다.
            </Typography>
          </Box>
        )}
      </Box>
    </Popover>
  );
}
