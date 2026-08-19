'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { HomeToolCard } from './home-tool-card';
import { CATEGORIES, type ToolItem, type ToolCategory } from './home-tools-data';

// ----------------------------------------------------------------------

export interface HomeToolsGridProps {
  tools: ToolItem[];
  selectedCategory: ToolCategory;
  searchQuery: string;
  onResetFilters: () => void;
}

export function HomeToolsGrid({
  tools,
  selectedCategory,
  searchQuery,
  onResetFilters,
}: HomeToolsGridProps) {
  const currentCategory = CATEGORIES.find((c) => c.id === selectedCategory) ?? CATEGORIES[0];

  return (
    <Box
      id="tools-section"
      component="section"
      sx={{
        py: { xs: 6, md: 9 },
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
              ALL PRODUCTIVITY TOOLS
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.65rem', sm: '2rem', md: '2.35rem' },
                letterSpacing: -0.5,
                color: 'text.primary',
              }}
            >
              {searchQuery
                ? `"${searchQuery}" 검색 결과`
                : selectedCategory === 'all'
                  ? '전체 업무 도구 컬렉션'
                  : currentCategory.label}
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
                : currentCategory.description}
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: 'text.disabled',
                bgcolor: (t) => alpha(t.palette.divider, 0.1),
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
              }}
            >
              {tools.length}개 도구 사용 가능
            </Typography>
          </Box>
        </Box>

        {/* Tools Grid or Empty State */}
        {tools.length > 0 ? (
          <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
            {tools.map((tool) => (
              <Grid key={tool.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <HomeToolCard tool={tool} />
              </Grid>
            ))}
          </Grid>
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
              검색된 도구가 없습니다
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, maxWidth: 400 }}>
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
      </Container>
    </Box>
  );
}
