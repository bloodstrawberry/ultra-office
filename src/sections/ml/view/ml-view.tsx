'use client';

import type { MlCategory } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { ML_MODELS } from '../utils/model-catalog';
import { MlHeaderNav } from '../components/ml-header-nav';

// ----------------------------------------------------------------------

const CATEGORIES: { id: MlCategory | 'all'; label: string }[] = [
  { id: 'all', label: '전체 알고리즘' },
  { id: 'supervised-regression', label: '📈 지도학습 (회귀)' },
  { id: 'supervised-classification', label: '🎯 지도학습 (분류)' },
  { id: 'unsupervised-clustering', label: '🔮 비지도학습 (군집화)' },
  { id: 'unsupervised-dim-reduction', label: '📐 차원 축소 (PCA)' },
  { id: 'neural-network', label: '🧠 신경망 & 딥러닝' },
  { id: 'library-sandbox', label: '⚡ 라이브러리 벤치마크' },
];

export function MlView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MlCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  const filteredModels = ML_MODELS.filter((model) => {
    const matchCat = selectedCategory === 'all' || model.category === selectedCategory;
    const matchSearch =
      model.nameKo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      model.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <DashboardContent
      maxWidth={false}
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}
    >
      <MlHeaderNav />

      {/* Internal scrollable container */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4, pr: 0.5 }}>
        {/* Hero Banner */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2.5,
            background:
              'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid',
            borderColor: 'primary.light',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PsychologyRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                머신러닝 & 데이터 사이언스 인터랙티브 랩
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 880 }}>
                Next.js 클라이언트 환경에서 지도학습(선형 모델, Ridge, Lasso, 로지스틱, KNN,
                의사결정나무), 비지도학습(K-Means, 계층적 군집화, DBSCAN), 차원 축소(PCA), 다층
                퍼셉트론(MLP) 및 Scikit-Learn 라이브러리를 시각적으로 학습하고 테스트할 수 있는 종합
                연구소입니다.
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Filter Controls */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 3,
          }}
        >
          <Tabs
            value={selectedCategory}
            onChange={(_, v) => setSelectedCategory(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              bgcolor: 'background.neutral',
              borderRadius: 1.5,
              p: 0.5,
              border: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': { fontWeight: 700, fontSize: '0.8125rem', py: 0.75 },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab key={cat.id} value={cat.id} label={cat.label} />
            ))}
          </Tabs>

          <TextField
            size="small"
            placeholder="알고리즘 검색 (예: Ridge, Kmeans, 분류, PCA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <SearchRoundedIcon sx={{ color: 'text.disabled', mr: 1, fontSize: 20 }} />
                ),
              },
            }}
            sx={{ minWidth: { xs: '100%', sm: 300 } }}
          />
        </Box>

        {/* Model Cards Grid */}
        <Grid container spacing={2.5}>
          {filteredModels.map((model) => (
            <Grid key={model.id} size={{ xs: 12, sm: 6, lg: 4 }}>
              <Card
                sx={{
                  p: 2.5,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: (theme) => theme.shadows[8],
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 1,
                  }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {model.nameKo}
                  </Typography>
                  <Chip
                    size="small"
                    label={model.categoryNameKo}
                    color="primary"
                    variant="soft"
                    sx={{ fontWeight: 700, fontSize: '0.6875rem' }}
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{ color: 'text.disabled', fontWeight: 600, mb: 1.5 }}
                >
                  {model.nameEn}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', mb: 2, flex: 1, minHeight: 48 }}
                >
                  {model.description}
                </Typography>

                {/* Mathematical Formula Preview */}
                <Box
                  sx={{
                    p: 1.25,
                    mb: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    border: '1px solid',
                    borderColor: 'divider',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.75rem',
                    color: 'primary.darker',
                    overflowX: 'auto',
                  }}
                >
                  수식: {model.formula}
                </Box>

                {/* Tags */}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                  {model.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={`#${tag}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.6875rem' }}
                    />
                  ))}
                </Box>

                {/* Launch Button */}
                <Button
                  component={RouterLink}
                  href={model.path}
                  variant="contained"
                  color="primary"
                  endIcon={<ArrowForwardRoundedIcon />}
                  fullWidth
                  sx={{ fontWeight: 700, mt: 'auto' }}
                >
                  실습 스튜디오 열기
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardContent>
  );
}
