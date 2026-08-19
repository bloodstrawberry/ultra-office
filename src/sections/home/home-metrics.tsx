'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { renderHomeIcon } from './home-icons';
import { WORKSPACE_METRICS } from './home-tools-data';

// ----------------------------------------------------------------------

export function HomeMetrics() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 5, md: 7 },
        bgcolor: (t) => alpha(t.palette.grey[500], 0.03),
        borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
        borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2.5, md: 3 }}>
          {WORKSPACE_METRICS.map((metric, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Paper
                sx={{
                  p: { xs: 2.5, md: 3 },
                  height: '100%',
                  borderRadius: 2.5,
                  display: 'flex',
                  flexDirection: 'column',
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
                  backdropFilter: 'blur(8px)',
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
                  transition: theme.transitions.create(
                    ['transform', 'border-color', 'box-shadow'],
                    {
                      duration: theme.transitions.duration.shorter,
                    }
                  ),
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    boxShadow: `0 12px 24px -8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    mb: 2,
                  }}
                >
                  {renderHomeIcon(metric.iconKey, { sx: { fontSize: 24 } })}
                </Box>

                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'text.primary',
                    mb: 0.5,
                  }}
                >
                  {metric.title}
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'primary.main',
                    fontSize: '0.78rem',
                    mb: 1,
                  }}
                >
                  {metric.subtitle}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                  }}
                >
                  {metric.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
