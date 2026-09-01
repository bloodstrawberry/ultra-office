'use client';

import Link from 'next/link';
import React, { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { navData } from 'src/layouts/nav-config-dashboard';

import { extractNavTools, type HubToolItem } from '../utils/nav-tools';

// ----------------------------------------------------------------------

export function PhotoHubView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // navData로부터 동적으로 전체 도구 및 섹션 그룹 추출 (SSOT)
  const { tools, sectionGroups, categories } = useMemo(() => extractNavTools(navData), []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategorySelect = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // 검색어 및 카테고리 필터링된 도구 목록
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      // 카테고리 매칭
      const matchesCategory = selectedCategory === 'all' || tool.section === selectedCategory;

      if (!matchesCategory) return false;

      // 검색어 매칭
      if (!q) return true;

      return (
        tool.title.toLowerCase().includes(q) ||
        (tool.groupTitle && tool.groupTitle.toLowerCase().includes(q)) ||
        tool.section.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        (tool.tag && tool.tag.toLowerCase().includes(q)) ||
        tool.path.toLowerCase().includes(q)
      );
    });
  }, [tools, searchQuery, selectedCategory]);

  // 카테고리별 그룹화된 필터링 결과 (카테고리가 'all'이고 검색어가 없을 때 섹션별 헤더 표시용)
  const filteredSectionGroups = useMemo(() => {
    if (searchQuery.trim() || selectedCategory !== 'all') {
      return null;
    }
    return sectionGroups;
  }, [sectionGroups, searchQuery, selectedCategory]);

  // 도구 카드 렌더링 헬퍼
  const renderToolCard = (tool: HubToolItem) => (
    <Card
      key={tool.id}
      component={Link}
      href={tool.path}
      sx={{
        p: 2.5,
        borderRadius: 2.5,
        textDecoration: 'none',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 160,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.customShadows?.z16 || theme.shadows[16],
          borderColor: 'primary.main',
          '& .arrow-action-icon': {
            transform: 'translateX(4px)',
            color: 'primary.main',
          },
        },
      }}
    >
      <Box>
        {/* 상단 아이콘 & 뱃지 영역 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: 'action.hover',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
            }}
          >
            {tool.icon || <DashboardCustomizeRoundedIcon sx={{ fontSize: 24 }} />}
          </Box>

          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', flexWrap: 'wrap' }}>
            {tool.groupTitle && (
              <Chip
                label={tool.groupTitle}
                size="small"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  height: 22,
                  fontSize: '0.7rem',
                  borderColor: 'divider',
                  bgcolor: 'background.neutral',
                }}
              />
            )}
            {tool.tag && (
              <Chip
                label={tool.tag}
                size="small"
                color={tool.badgeColor || 'primary'}
                sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>

        {/* 타이틀 & 설명 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.6, fontSize: '1rem' }}>
          {tool.title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            fontSize: '0.825rem',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {tool.description}
        </Typography>
      </Box>

      {/* 하단 바로가기 힌트 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          pt: 1.2,
          borderTop: '1px dashed',
          borderColor: 'divider',
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.75rem' }}>
          {tool.section}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
          >
            바로가기
          </Typography>
          <ArrowForwardRoundedIcon
            className="arrow-action-icon"
            sx={{ fontSize: 16, color: 'text.disabled', transition: 'all 0.2s ease' }}
          />
        </Box>
      </Box>
    </Card>
  );

  return (
    <DashboardContent>
      {/* 1. Header & Summary Stats */}
      <Box
        sx={{
          mb: { xs: 2.5, md: 3 },
          flexShrink: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DashboardCustomizeRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              전체 도구 허브 (All Tools Hub)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Ultra Office가 제공하는 모든 업무 생산성 도구와 인터랙티브 랩을 한눈에 탐색하고 즉시
            실행하세요.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<DashboardCustomizeRoundedIcon sx={{ fontSize: '16px !important' }} />}
            label={`총 ${tools.length}개 도구 지원`}
            color="primary"
            variant="soft"
            sx={{ fontWeight: 800, fontSize: '0.85rem', px: 0.5, py: 2 }}
          />
        </Box>
      </Box>

      {/* 2. Real-time Search Bar & Category Chips */}
      <Box sx={{ mb: 3, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <TextField
          fullWidth
          placeholder="도구 이름, 카테고리, 설명, 키워드로 빠른 검색... (예: GIF, PDF, 엑셀, 알고리즘, 직인, 화풍, OCR)"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 24, ml: 0.5 }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClearSearch} edge="end">
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
            sx: {
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: (theme) => theme.customShadows?.z4 || theme.shadows[2],
            },
          }}
        />

        {/* 카테고리 필터 칩 목록 (동적 navData 연동) */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            py: 0.5,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'action.hover', borderRadius: 2 },
          }}
        >
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const label = cat === 'all' ? `전체 (${tools.length})` : cat;

            return (
              <Chip
                key={cat}
                label={label}
                onClick={() => handleCategorySelect(cat)}
                color={isSelected ? 'primary' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: isSelected ? 800 : 500,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  borderRadius: 1.5,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                }}
              />
            );
          })}
        </Box>
      </Box>

      {/* 3. Scrollable Tools Viewport */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {/* 검색어가 없고 'all' 카테고리일 때: 섹션별 묶음 렌더링 */}
        {filteredSectionGroups ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {filteredSectionGroups.map((group) => (
              <Box key={group.section}>
                {/* 섹션 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.75,
                    pb: 0.75,
                    borderBottom: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {group.section}
                    </Typography>
                    <Chip
                      label={`${group.tools.length}개`}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </Box>
                </Box>

                {/* 그리드 카드 목록 */}
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {group.tools.map(renderToolCard)}
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          /* 검색어가 있거나 특정 카테고리 선택 시: 필터링된 단일 그리드 */
          <Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                검색 & 필터 결과
              </Typography>
              <Chip
                label={`${filteredTools.length}개 발견`}
                size="small"
                color="primary"
                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 700 }}
              />
            </Box>

            {filteredTools.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {filteredTools.map(renderToolCard)}
              </Box>
            ) : (
              <Card
                sx={{
                  p: 6,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 700, mb: 1 }}>
                  일치하는 도구를 찾을 수 없습니다.
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.disabled', mb: 2 }}>
                  다른 검색어나 카테고리를 선택해 보세요.
                </Typography>
                <Chip
                  label="필터 초기화"
                  color="primary"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  sx={{ cursor: 'pointer', fontWeight: 700 }}
                />
              </Card>
            )}
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
