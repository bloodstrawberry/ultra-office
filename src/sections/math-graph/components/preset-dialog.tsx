'use client';

import type { PresetItem } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { LatexPreview } from './latex-preview';
import { GRAPH_PRESETS } from '../data/presets';

// ----------------------------------------------------------------------

interface PresetDialogProps {
  open: boolean;
  onClose: () => void;
  onSelectPreset: (preset: PresetItem) => void;
}

export function PresetDialog({ open, onClose, onSelectPreset }: PresetDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allCategories = ['all', ...GRAPH_PRESETS.map((c) => c.category)];

  const filteredItems: { item: PresetItem; categoryName: string }[] = [];
  GRAPH_PRESETS.forEach((cat) => {
    if (selectedCategory === 'all' || selectedCategory === cat.category) {
      cat.items.forEach((item) => {
        const matchesQuery =
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.zFormula && item.zFormula.toLowerCase().includes(searchQuery.toLowerCase()));

        if (matchesQuery) {
          filteredItems.push({ item, categoryName: cat.category });
        }
      });
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2.5,
          p: 1,
          maxHeight: '85vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeRoundedIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            수학 함수 & 3D 곡면 프리셋 갤러리
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1, overflowY: 'auto' }}>
        {/* Search Input */}
        <TextField
          fullWidth
          size="small"
          placeholder="함수 이름, 공식 또는 키워드로 검색 (예: 사인, 가우스, 안장점, 심장형...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
        />

        {/* Category Pills */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 1,
            overflowX: 'auto',
            pb: 1.5,
            mb: 2,
          }}
        >
          {allCategories.map((cat) => (
            <Chip
              key={cat}
              label={cat === 'all' ? '전체 보기' : cat}
              color={selectedCategory === cat ? 'primary' : 'default'}
              variant={selectedCategory === cat ? 'filled' : 'outlined'}
              onClick={() => setSelectedCategory(cat)}
              clickable
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            />
          ))}
        </Box>

        {/* Items Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          {filteredItems.map(({ item, categoryName }) => (
            <Card
              key={item.id}
              sx={{
                p: 2,
                borderRadius: 2,
                border: (theme) => `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 1.5,
                bgcolor: 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  boxShadow: (theme) => theme.shadows[4],
                  transform: 'translateY(-2px)',
                },
              }}
              onClick={() => {
                onSelectPreset(item);
                onClose();
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Chip
                    size="small"
                    label={item.engine.toUpperCase()}
                    color={
                      item.engine === 'surface-3d'
                        ? 'secondary'
                        : item.engine === 'desmos'
                          ? 'success'
                          : item.engine === 'calculus'
                            ? 'warning'
                            : 'info'
                    }
                    sx={{ fontSize: '0.65rem', height: 20, fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {item.description}
                </Typography>
              </Box>

              {/* Formula Preview Box */}
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 44,
                }}
              >
                <LatexPreview latex={item.latex} fontSize="0.95rem" />
              </Box>

              <Button
                size="small"
                variant="contained"
                fullWidth
                sx={{ textTransform: 'none', borderRadius: 1.5, fontWeight: 600 }}
              >
                이 수식으로 그래프 그리기
              </Button>
            </Card>
          ))}
        </Box>

        {filteredItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              검색 조건에 맞는 수식 프리셋이 없습니다.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
