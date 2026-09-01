'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';

import { navData } from 'src/layouts/nav-config-dashboard';

import { extractNavTools } from 'src/sections/photo/utils/nav-tools';

import { HomeWorkflow } from '../home-workflow';
import { HomeToolsGrid } from '../home-tools-grid';

// ----------------------------------------------------------------------

export function HomeView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // navData로부터 동적으로 전체 도구 및 섹션 그룹 추출 (SSOT)
  const { tools, sectionGroups, categories } = useMemo(() => extractNavTools(navData), []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  // Filter tools based on search query and category
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return tools.filter((tool) => {
      // Category check
      const matchesCategory = selectedCategory === 'all' || tool.section === selectedCategory;

      if (!matchesCategory) return false;

      // Query check
      if (!query) return true;

      return (
        tool.title.toLowerCase().includes(query) ||
        (tool.groupTitle && tool.groupTitle.toLowerCase().includes(query)) ||
        tool.section.toLowerCase().includes(query) ||
        tool.description.toLowerCase().includes(query) ||
        (tool.tag && tool.tag.toLowerCase().includes(query)) ||
        tool.path.toLowerCase().includes(query)
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

  return (
    <Box
      sx={{
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        scrollBehavior: 'smooth',
      }}
    >
      {/* All Tools Hub with integrated search */}
      <HomeToolsGrid
        tools={filteredTools}
        sectionGroups={filteredSectionGroups}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onSelectCategory={handleSelectCategory}
        categories={categories}
        totalToolsCount={tools.length}
        onResetFilters={handleResetFilters}
      />

      {/* 3-Step Simple Workflow */}
      <HomeWorkflow />
    </Box>
  );
}
