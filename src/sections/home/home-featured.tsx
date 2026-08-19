'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { useRouter } from 'src/routes/hooks';

import { renderHomeIcon } from './home-icons';
import { TOOLS_DATA } from './home-tools-data';

// ----------------------------------------------------------------------

export function HomeFeatured() {
  const theme = useTheme();
  const router = useRouter();

  const featuredTools = TOOLS_DATA.filter((t) => t.isFeatured).sort(
    (a, b) => (a.featuredRank ?? 99) - (b.featuredRank ?? 99)
  );

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 8 },
        position: 'relative',
        background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(theme.palette.primary.main, 0.08)}, transparent)`,
      }}
    >
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              px: 2,
              py: 0.6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: 'primary.main',
              fontWeight: 700,
              fontSize: '0.8rem',
              mb: 1.5,
            }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
            <span>핵심 인기 도구 4선</span>
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              letterSpacing: -0.5,
              mb: 1.5,
            }}
          >
            가장 많이 찾는{' '}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.info.main} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              대표 생산성 도구
            </Box>
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 620,
              fontSize: { xs: '0.9rem', md: '1.05rem' },
            }}
          >
            복잡한 소프트웨어 설치 없이 브라우저에서 바로 실행하는 강력한 핵심 기능입니다.
          </Typography>
        </Box>

        {/* Featured Bento Grid */}
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {featuredTools.map((tool) => (
            <Grid key={tool.id} size={{ xs: 12, sm: 6, lg: 6 }}>
              <Paper
                onClick={() => router.push(tool.path)}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 3,
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.85),
                  backdropFilter: 'blur(16px)',
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
                  transition: theme.transitions.create(['all'], {
                    duration: theme.transitions.duration.shorter,
                  }),
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: alpha(tool.accentColor, 0.6),
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.98),
                    boxShadow: `0 24px 48px -12px ${alpha(tool.accentColor, 0.28)}, 0 4px 16px ${alpha(theme.palette.common.black, 0.08)}`,
                    '& .featured-cta-btn': {
                      bgcolor: tool.accentColor,
                      color: '#fff',
                      boxShadow: `0 8px 20px -4px ${alpha(tool.accentColor, 0.45)}`,
                      '& .MuiButton-endIcon': {
                        transform: 'translateX(4px)',
                      },
                    },
                    '& .featured-icon-box': {
                      transform: 'scale(1.1) rotate(-3deg)',
                      boxShadow: `0 12px 24px -6px ${alpha(tool.accentColor, 0.4)}`,
                    },
                  },
                }}
              >
                {/* Background Ambient Glow */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(tool.accentColor, 0.15)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />

                {/* Top Section */}
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2.5,
                    }}
                  >
                    <Box
                      className="featured-icon-box"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tool.accentColor,
                        bgcolor: alpha(tool.accentColor, 0.14),
                        border: `1px solid ${alpha(tool.accentColor, 0.25)}`,
                        transition: theme.transitions.create(['transform', 'box-shadow'], {
                          duration: theme.transitions.duration.shorter,
                        }),
                      }}
                    >
                      {renderHomeIcon(tool.iconKey, { sx: { fontSize: 32 } })}
                    </Box>

                    <Chip
                      size="small"
                      label={tool.tag ?? '추천'}
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        height: 26,
                        px: 0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha(tool.accentColor, 0.12),
                        color: tool.accentColor,
                        border: `1px solid ${alpha(tool.accentColor, 0.25)}`,
                      }}
                    />
                  </Box>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 800,
                      fontSize: { xs: '1.25rem', md: '1.45rem' },
                      mb: 0.75,
                      color: 'text.primary',
                    }}
                  >
                    {tool.title}
                  </Typography>

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: tool.accentColor,
                      mb: 1.5,
                      fontSize: '0.88rem',
                    }}
                  >
                    {tool.subtitle}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.9rem',
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    {tool.description}
                  </Typography>
                </Box>

                {/* Features & Launch Button */}
                <Box>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.25,
                      p: 2,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.background.default, 0.6),
                      border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
                      mb: 3,
                    }}
                  >
                    {tool.features.map((feature, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <CheckCircleRoundedIcon
                          sx={{
                            fontSize: 16,
                            color: tool.accentColor,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            color: 'text.primary',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {feature}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    className="featured-cta-btn"
                    variant="contained"
                    fullWidth
                    size="large"
                    endIcon={
                      <ArrowForwardRoundedIcon
                        sx={{
                          transition: theme.transitions.create(['transform'], {
                            duration: theme.transitions.duration.shorter,
                          }),
                        }}
                      />
                    }
                    sx={{
                      py: 1.25,
                      fontWeight: 700,
                      fontSize: '0.92rem',
                      borderRadius: 2,
                      bgcolor: alpha(tool.accentColor, 0.12),
                      color: tool.accentColor,
                      boxShadow: 'none',
                      border: `1px solid ${alpha(tool.accentColor, 0.25)}`,
                      transition: theme.transitions.create(['all'], {
                        duration: theme.transitions.duration.shorter,
                      }),
                    }}
                  >
                    {tool.title} 바로 실행하기
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
