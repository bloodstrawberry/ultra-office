'use client';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { WORKFLOW_STEPS } from './home-tools-data';

// ----------------------------------------------------------------------

export function HomeWorkflow() {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 6, md: 9 },
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: { xs: 4, md: 6 },
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: 2,
              mb: 1,
            }}
          >
            HOW IT WORKS
          </Typography>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              letterSpacing: -0.5,
              mb: 1.5,
            }}
          >
            간편한 3단계 업무 워크플로우
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 580,
              fontSize: { xs: '0.9rem', md: '1rem' },
            }}
          >
            회원가입이나 설치 없이, 즉시 실행하고 완벽하게 처리하세요.
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2.5, md: 4 }}>
          {WORKFLOW_STEPS.map((step, idx) => (
            <Grid key={step.step} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  bgcolor: (t) => alpha(t.palette.background.paper, 0.7),
                  backdropFilter: 'blur(8px)',
                  border: (t) => `1px solid ${alpha(t.palette.divider, 0.08)}`,
                }}
              >
                {/* Step Number Badge */}
                <Box
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    fontFamily: theme.typography.fontSecondaryFamily,
                    color: alpha(theme.palette.primary.main, 0.25),
                    mb: 2,
                  }}
                >
                  {step.step}
                </Box>

                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.15rem',
                    mb: 1,
                    color: 'text.primary',
                  }}
                >
                  {step.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
