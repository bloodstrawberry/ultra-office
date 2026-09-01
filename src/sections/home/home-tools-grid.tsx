'use client';

import type { ChangeEvent } from 'react';
import type { HubToolItem, HubSectionGroup } from 'src/sections/photo/utils/nav-tools';

import React from 'react';
import Link from 'next/link';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DashboardCustomizeRoundedIcon from '@mui/icons-material/DashboardCustomizeRounded';

// ----------------------------------------------------------------------

export interface HomeToolsGridProps {
  tools: HubToolItem[];
  sectionGroups?: HubSectionGroup[] | null;
  selectedCategory: string;
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  onSelectCategory?: (category: string) => void;
  categories?: string[];
  totalToolsCount?: number;
  onResetFilters: () => void;
}

export function HomeToolsGrid({
  tools,
  sectionGroups,
  selectedCategory,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  categories,
  totalToolsCount,
  onResetFilters,
}: HomeToolsGridProps) {
  // 도구 카드 렌더링
  const renderToolCard = (tool: HubToolItem) => (
    <Card
      key={tool.id}
      component={Link}
      href={tool.path}
      sx={{
        p: 2.75,
        borderRadius: 2.5,
        textDecoration: 'none',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 165,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: (t) => alpha(t.palette.divider, 0.12),
        bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (t) => t.customShadows?.z16 || t.shadows[16],
          borderColor: 'primary.main',
          bgcolor: (t) => alpha(t.palette.background.paper, 0.98),
          '& .tool-arrow-icon': {
            transform: 'translateX(4px)',
            color: 'primary.main',
          },
          '& .tool-icon-box': {
            transform: 'scale(1.06)',
            boxShadow: (t) => `0 6px 16px ${alpha(t.palette.primary.main, 0.25)}`,
          },
        },
      }}
    >
      <Box>
        {/* 상단 아이콘 & 뱃지 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1.75,
          }}
        >
          <Box
            className="tool-icon-box"
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
              transition: 'all 0.2s ease',
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
                  bgcolor: (t) => alpha(t.palette.background.neutral, 0.8),
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

        {/* 도구 제목 */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.6, fontSize: '1.02rem' }}>
          {tool.title}
        </Typography>

        {/* 도구 설명 */}
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

      {/* 하단 바로가기 영역 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mt: 2,
          pt: 1.25,
          borderTop: '1px dashed',
          borderColor: (t) => alpha(t.palette.divider, 0.15),
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
            className="tool-arrow-icon"
            sx={{ fontSize: 16, color: 'text.disabled', transition: 'all 0.2s ease' }}
          />
        </Box>
      </Box>
    </Card>
  );

  return (
    <Box
      id="tools-section"
      component="section"
      sx={{
        py: { xs: 6, md: 8 },
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'flex-end' },
            justifyContent: 'space-between',
            gap: 2,
            mb: { xs: 3.5, md: 5 },
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: 2,
                display: 'block',
                mb: 0.5,
              }}
            >
              ALL PRODUCTIVITY TOOLS HUB
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' },
                letterSpacing: -0.5,
              }}
            >
              {searchQuery ? (
                `"${searchQuery}" 검색 결과`
              ) : selectedCategory === 'all' ? (
                <>
                  <Box
                    component="span"
                    sx={{
                      background: (t) =>
                        `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.info.main} 50%, ${t.palette.secondary.main} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    피로물든딸기의 오피스 전체 도구 허브
                  </Box>
                  {' 🍓'}
                </>
              ) : (
                selectedCategory
              )}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                mt: 0.75,
                fontSize: '0.88rem',
              }}
            >
              {searchQuery
                ? `총 ${tools.length}개의 관련 도구를 찾았습니다.`
                : '설치 없이 브라우저에서 100% 안전하게 실행되는 올인원 도구 모음입니다.'}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Chip
              icon={<DashboardCustomizeRoundedIcon sx={{ fontSize: '16px !important' }} />}
              label={`총 ${totalToolsCount ?? tools.length}개 도구 지원`}
              color="primary"
              variant="soft"
              sx={{ fontWeight: 800, fontSize: '0.85rem', px: 0.5, py: 2 }}
            />
          </Box>
        </Box>

        {/* Search Bar */}
        {onSearchChange && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
              placeholder="원하는 업무 도구 검색... (예: PDF, 엑셀, AI, 비교, OCR, 바코드, 모자이크)"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.disabled', fontSize: 24, ml: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <Box
                        onClick={() => onSearchChange('')}
                        sx={{
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color: 'text.disabled',
                          '&:hover': { color: 'text.primary' },
                        }}
                      >
                        <ClearRoundedIcon sx={{ fontSize: 20 }} />
                      </Box>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    height: { xs: 48, md: 52 },
                    fontSize: { xs: '0.9rem', md: '0.95rem' },
                  },
                },
              }}
            />
          </Box>
        )}

        {/* Category Filter Chips */}
        {onSelectCategory && categories && categories.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 0.75, sm: 1 },
              mb: 4,
            }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat;
              const label =
                cat === 'all'
                  ? `전체 도구${totalToolsCount ? ` (${totalToolsCount})` : ''}`
                  : cat;

              return (
                <Chip
                  key={cat}
                  label={label}
                  clickable
                  onClick={() => onSelectCategory(cat)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    px: 1,
                    py: 2,
                    fontSize: { xs: '0.78rem', md: '0.84rem' },
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 2,
                    borderColor: (t) =>
                      isSelected ? 'primary.main' : alpha(t.palette.divider, 0.16),
                    bgcolor: (t) =>
                      isSelected
                        ? t.palette.primary.main
                        : alpha(t.palette.background.paper, 0.6),
                    '&:hover': {
                      bgcolor: (t) =>
                        isSelected
                          ? t.palette.primary.dark
                          : alpha(t.palette.background.paper, 0.95),
                      borderColor: 'primary.main',
                    },
                  }}
                />
              );
            })}
          </Box>
        )}

        {/* 1. 검색어가 없고 'all'일 때: 섹션별 묶음 렌더링 */}
        {sectionGroups ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {sectionGroups.map((group) => (
              <Box key={group.section}>
                {/* 섹션 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    pb: 1,
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
          /* 2. 검색어가 있거나 특정 카테고리 선택 시: 단일 그리드 */
          <Box>
            {tools.length > 0 ? (
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
                {tools.map(renderToolCard)}
              </Box>
            ) : (
              <Box
                sx={{
                  p: { xs: 4, md: 6 },
                  textAlign: 'center',
                  borderRadius: 3,
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.5),
                  border: (t) => `1px dashed ${alpha(t.palette.divider, 0.2)}`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  my: 4,
                }}
              >
                <SearchOffRoundedIcon
                  sx={{
                    fontSize: 54,
                    color: 'text.disabled',
                    mb: 2,
                  }}
                />

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  일치하는 도구를 찾을 수 없습니다
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 3, maxWidth: 400 }}
                >
                  입력하신 검색어에 해당하는 도구를 찾을 수 없습니다. 검색어를 변경하거나 필터를
                  초기화해 보세요.
                </Typography>

                <Button
                  variant="outlined"
                  color="primary"
                  onClick={onResetFilters}
                  startIcon={<RestartAltRoundedIcon />}
                  sx={{ borderRadius: 2, fontWeight: 700 }}
                >
                  검색 필터 초기화
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}
