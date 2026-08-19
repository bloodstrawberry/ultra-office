'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import { alpha } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { renderHomeIcon } from '../home-icons';
import { HomeToolCard } from '../home-tool-card';
import { CATEGORIES, TOOLS_DATA, type ToolCategory } from '../home-tools-data';

// ----------------------------------------------------------------------

export function DashboardHomeView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const handleSelectCategory = useCallback((category: ToolCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return TOOLS_DATA.filter((tool) => {
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;

      if (!query) {
        return matchesCategory;
      }

      const matchesQuery =
        tool.title.toLowerCase().includes(query) ||
        tool.subtitle.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        tool.category.toLowerCase().includes(query) ||
        (tool.tag && tool.tag.toLowerCase().includes(query)) ||
        tool.features.some((f) => f.toLowerCase().includes(query));

      return matchesCategory && matchesQuery;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <DashboardContent>
      {/* Top Header */}
      <Box
        sx={{
          mb: { xs: 3, md: 4 },
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Ultra Office Workspace 👋
            </Typography>
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />}
              label="All-in-One"
              size="small"
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, borderRadius: 1 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            설치 없이 브라우저에서 즉시 활용하는 올인원 업무 도구 모음입니다.
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box sx={{ width: { xs: '100%', md: 320 } }}>
          <TextField
            fullWidth
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="도구 검색..."
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <Box
                      onClick={handleClearSearch}
                      sx={{ cursor: 'pointer', display: 'flex', color: 'text.disabled' }}
                    >
                      <ClearRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: 2 },
              },
            }}
          />
        </Box>
      </Box>

      {/* Category Filter Chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 3,
        }}
      >
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <Chip
              key={cat.id}
              icon={renderHomeIcon(cat.iconName, {
                sx: {
                  fontSize: 16,
                  color: isSelected ? 'inherit' : 'text.secondary',
                },
              })}
              label={cat.label}
              clickable
              onClick={() => handleSelectCategory(cat.id)}
              color={isSelected ? 'primary' : 'default'}
              variant={isSelected ? 'filled' : 'outlined'}
              sx={{
                borderRadius: 1.5,
                fontWeight: isSelected ? 700 : 500,
                borderColor: (t) => (isSelected ? 'primary.main' : alpha(t.palette.divider, 0.2)),
              }}
            />
          );
        })}
      </Box>

      {/* Tools Grid */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto' }}>
        <Grid container spacing={{ xs: 2, md: 2.5 }}>
          {filteredTools.map((tool) => (
            <Grid key={tool.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <HomeToolCard tool={tool} dense />
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardContent>
  );
}
