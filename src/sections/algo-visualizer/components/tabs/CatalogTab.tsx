'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { ALGORITHMS, CATEGORIES } from '../../lib/algorithms/registry';
import { type AlgorithmCategory } from '../../lib/algorithms/types';

export function CatalogTab({ onSelectAlgo }: { onSelectAlgo: (algoId: string) => void }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AlgorithmCategory | 'all'>('all');

  const allAlgorithms = Object.values(ALGORITHMS);

  const filteredAlgorithms = allAlgorithms.filter((algo) => {
    const matchesCat = selectedCategory === 'all' || algo.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      algo.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flex: '1 1 auto', minHeight: 0 }}
    >
      {/* 1. Filter Bar & Search */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          bgcolor: 'background.neutral',
        }}
      >
        {/* Category Chips */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            overflowX: 'auto',
            pb: { xs: 0.5, md: 0 },
          }}
        >
          <Button
            size="small"
            variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
            color="primary"
            onClick={() => setSelectedCategory('all')}
            sx={{ minWidth: 'auto', px: 1.5, py: 0.5, borderRadius: 2, fontWeight: 700 }}
          >
            전체 ({allAlgorithms.length})
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.id}
              size="small"
              variant={selectedCategory === cat.id ? 'contained' : 'outlined'}
              color={selectedCategory === cat.id ? 'primary' : 'inherit'}
              onClick={() => setSelectedCategory(cat.id)}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <Box component="span" sx={{ mr: 0.5 }}>
                {cat.icon}
              </Box>
              {cat.label}
            </Button>
          ))}
        </Box>

        {/* Search Input */}
        <TextField
          size="small"
          placeholder="알고리즘 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchRoundedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
            ),
          }}
          sx={{ width: { xs: '100%', md: 240 } }}
        />
      </Card>

      {/* 2. Algorithm Grid Showcase */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {filteredAlgorithms.map((algo) => (
          <Card
            key={algo.id}
            sx={{
              p: 2.5,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 2,
              borderRadius: 3,
              boxShadow: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                boxShadow: 4,
              },
            }}
          >
            <Box>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant="h4">{algo.icon}</Typography>
                <Typography
                  variant="caption"
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    fontWeight: 700,
                  }}
                >
                  {algo.tag}
                </Typography>
              </Box>

              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {algo.name}
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: 'text.secondary', fontFamily: 'monospace', display: 'block', mb: 1 }}
              >
                {algo.englishName}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {algo.shortDescription}
              </Typography>

              {/* Big-O Micro Badges */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'background.neutral',
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                  >
                    평균 시간 (Avg)
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}
                  >
                    {algo.complexity.timeAverage}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}
                  >
                    공간 복잡도 (Space)
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 800, color: 'warning.main', fontFamily: 'monospace' }}
                  >
                    {algo.complexity.spaceWorst}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<PlayArrowRoundedIcon />}
              onClick={() => onSelectAlgo(algo.id)}
              sx={{ borderRadius: 2, fontWeight: 800 }}
            >
              시각화 실행하기
            </Button>
          </Card>
        ))}
      </Box>

      {/* 3. Big-O Master Comparison Table */}
      <Card sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
          📊 알고리즘 Big-O 복잡도 전체 비교표
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
          코딩 테스트 및 기술 면접 대비 시간·공간 복잡도 총정리 마스터 매트릭스
        </Typography>

        <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: 'background.neutral' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800 }}>알고리즘</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>분류</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>최선 시간</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>평균 시간</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>최악 시간</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>공간 복잡도</TableCell>
                <TableCell sx={{ fontWeight: 800 }}>안정성</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allAlgorithms.map((algo) => (
                <TableRow
                  key={algo.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => onSelectAlgo(algo.id)}
                >
                  <TableCell sx={{ fontWeight: 800 }}>
                    <Box component="span" sx={{ mr: 1 }}>
                      {algo.icon}
                    </Box>
                    {algo.name}
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary' }}>{algo.tag}</TableCell>
                  <TableCell
                    sx={{ color: 'success.main', fontWeight: 700, fontFamily: 'monospace' }}
                  >
                    {algo.complexity.timeBest}
                  </TableCell>
                  <TableCell
                    sx={{ color: 'primary.main', fontWeight: 700, fontFamily: 'monospace' }}
                  >
                    {algo.complexity.timeAverage}
                  </TableCell>
                  <TableCell sx={{ color: 'error.main', fontWeight: 700, fontFamily: 'monospace' }}>
                    {algo.complexity.timeWorst}
                  </TableCell>
                  <TableCell
                    sx={{ color: 'warning.main', fontWeight: 700, fontFamily: 'monospace' }}
                  >
                    {algo.complexity.spaceWorst}
                  </TableCell>
                  <TableCell>
                    {algo.complexity.isStable !== undefined ? (
                      algo.complexity.isStable ? (
                        <Box component="span" sx={{ color: 'success.main', fontWeight: 700 }}>
                          Stable
                        </Box>
                      ) : (
                        <Box component="span" sx={{ color: 'text.disabled' }}>
                          Unstable
                        </Box>
                      )
                    ) : (
                      '-'
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
