'use client';

import type { ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FolderRoundedIcon from '@mui/icons-material/FolderRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { renderHomeIcon } from './home-icons';
import { CATEGORIES, type ToolCategory } from './home-tools-data';

// ----------------------------------------------------------------------

export interface HomeHeroProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ToolCategory;
  onSelectCategory: (category: ToolCategory) => void;
  onScrollToTools?: () => void;
}

export function HomeHero({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onScrollToTools,
}: HomeHeroProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleSearchInput = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange('');
  };

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 6, md: 9 },
        pb: { xs: 5, md: 7 },
        position: 'relative',
        overflow: 'hidden',
        background: `radial-gradient(ellipse 90% 60% at 50% -10%, ${alpha(theme.palette.primary.main, 0.12)}, transparent 80%)`,
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            maxWidth: 880,
            mx: 'auto',
          }}
        >
          {/* Top Live Badge */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2.25,
              py: 0.75,
              borderRadius: 5,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
              border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              backdropFilter: 'blur(8px)',
              mb: 3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
                boxShadow: (t) => `0 0 10px ${t.palette.success.main}`,
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.5, transform: 'scale(1.3)' },
                },
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '0.78rem', md: '0.84rem' },
                letterSpacing: 0.3,
              }}
            >
              Ultra Office • 올인원 업무 생산성 플랫폼
            </Typography>
          </Box>

          {/* Main Hero Headline */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '2.3rem', sm: '3.2rem', md: '4rem' },
              lineHeight: 1.15,
              letterSpacing: { xs: -0.5, md: -1.5 },
              mb: 2.5,
              fontFamily: theme.typography.fontSecondaryFamily,
            }}
          >
            업무에 필요한 모든 도구를
            <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 50%, ${theme.palette.secondary.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              브라우저에서 즉시 실행
            </Box>
          </Typography>

          {/* Hero Subtitle */}
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              fontSize: { xs: '0.95rem', sm: '1.08rem', md: '1.2rem' },
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 720,
            }}
          >
            AI 어시스턴트, 엑셀 스프레드시트, PDF 마스터, 데이터 비교, 스마트 OCR부터 16종 사진
            편집기까지 — 설치 없이 안전한 로컬 환경에서 바로 사용하세요.
          </Typography>

          {/* Real-time Search Bar */}
          <Box
            sx={{
              width: '100%',
              maxWidth: 640,
              mb: 3.5,
            }}
          >
            <TextField
              fullWidth
              value={searchQuery}
              onChange={handleSearchInput}
              placeholder="원하는 업무 도구 검색... (예: PDF, 엑셀, AI, 비교, OCR, 바코드, 모자이크)"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'primary.main', fontSize: 24, ml: 0.5 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <Box
                        onClick={handleClearSearch}
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
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.9),
                    backdropFilter: 'blur(16px)',
                    borderRadius: 3,
                    height: { xs: 52, md: 58 },
                    fontSize: { xs: '0.92rem', md: '1rem' },
                    boxShadow: (t) =>
                      `0 8px 32px -4px ${alpha(t.palette.common.black, 0.08)}, 0 0 0 1px ${alpha(t.palette.divider, 0.12)}`,
                    '&:hover': {
                      boxShadow: (t) =>
                        `0 12px 36px -4px ${alpha(t.palette.primary.main, 0.15)}, 0 0 0 1px ${alpha(t.palette.primary.main, 0.3)}`,
                    },
                    '&.Mui-focused': {
                      boxShadow: (t) =>
                        `0 12px 36px -4px ${alpha(t.palette.primary.main, 0.25)}, 0 0 0 2px ${t.palette.primary.main}`,
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Category Filter Chips */}
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: { xs: 1, sm: 1.25 },
              mb: 4,
            }}
          >
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Chip
                  key={cat.id}
                  icon={renderHomeIcon(cat.iconName, {
                    sx: {
                      fontSize: 18,
                      color: isSelected ? 'inherit' : 'text.secondary',
                    },
                  })}
                  label={cat.label}
                  clickable
                  onClick={() => onSelectCategory(cat.id)}
                  color={isSelected ? 'primary' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{
                    px: 1.25,
                    py: 2.25,
                    fontSize: { xs: '0.8rem', md: '0.86rem' },
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: 2,
                    borderColor: (t) =>
                      isSelected ? 'primary.main' : alpha(t.palette.divider, 0.16),
                    bgcolor: (t) =>
                      isSelected ? t.palette.primary.main : alpha(t.palette.background.paper, 0.6),
                    backdropFilter: 'blur(8px)',
                    transition: theme.transitions.create(['all'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': {
                      bgcolor: (t) =>
                        isSelected
                          ? t.palette.primary.dark
                          : alpha(t.palette.background.paper, 0.95),
                      borderColor: 'primary.main',
                      transform: 'translateY(-2px)',
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* CTA Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2,
              alignItems: 'center',
              justifyContent: 'center',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Button
              variant="contained"
              size="large"
              color="primary"
              onClick={onScrollToTools}
              startIcon={<ArrowDownwardRoundedIcon />}
              sx={{
                px: 3.5,
                py: 1.5,
                fontSize: '0.98rem',
                fontWeight: 700,
                borderRadius: 2,
                boxShadow: (t) => `0 8px 24px ${alpha(t.palette.primary.main, 0.35)}`,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                '&:hover': {
                  boxShadow: (t) => `0 12px 32px ${alpha(t.palette.primary.main, 0.5)}`,
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                },
              }}
            >
              전체 도구 둘러보기
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => router.push(paths.fileManager)}
              startIcon={<FolderRoundedIcon />}
              sx={{
                px: 3,
                py: 1.5,
                fontSize: '0.98rem',
                fontWeight: 700,
                borderRadius: 2,
                color: 'text.primary',
                bgcolor: (t) => alpha(t.palette.background.paper, 0.6),
                backdropFilter: 'blur(8px)',
                borderColor: (t) => alpha(t.palette.divider, 0.16),
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.95),
                  borderColor: 'primary.main',
                },
              }}
            >
              오피스 드라이브
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
