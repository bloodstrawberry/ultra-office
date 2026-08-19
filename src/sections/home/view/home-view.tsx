'use client';

import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';

import { HomeHero } from '../home-hero';
import { HomeMetrics } from '../home-metrics';
import { HomeFeatured } from '../home-featured';
import { HomeWorkflow } from '../home-workflow';
import { HomeToolsGrid } from '../home-tools-grid';
import { TOOLS_DATA, type ToolCategory } from '../home-tools-data';

// ----------------------------------------------------------------------

export function HomeView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCategory = useCallback((category: ToolCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleResetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  const handleScrollToTools = useCallback(() => {
    const el = document.getElementById('tools-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Filter tools based on search query and category
  const filteredTools = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return TOOLS_DATA.filter((tool) => {
      // Category check
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;

      // Query check
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
      {/* 1. Hero & Real-time Quick Launcher */}
      <HomeHero
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        onScrollToTools={handleScrollToTools}
      />

      {/* 2. Key Value Pillars */}
      <HomeMetrics />

      {/* 3. Featured Flagship Bento (Only shown when not searching or in 'all' view) */}
      {!searchQuery && selectedCategory === 'all' && <HomeFeatured />}

      {/* 4. Categorized & Filtered Tools Grid */}
      <HomeToolsGrid
        tools={filteredTools}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        onResetFilters={handleResetFilters}
      />

      {/* 5. 3-Step Simple Workflow */}
      <HomeWorkflow />
    </Box>
  );
}
