'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import FormatAlignJustifyRoundedIcon from '@mui/icons-material/FormatAlignJustifyRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function DrawingView() {
  const games = [
    {
      title: '사다리 타기',
      description:
        '참여자를 입력하고 무작위로 생성되는 사다리를 타고 벌칙과 결과를 복불복으로 정해보세요!',
      icon: (
        <FormatAlignJustifyRoundedIcon
          sx={{ fontSize: 48, color: 'primary.main', transform: 'rotate(90deg)' }}
        />
      ),
      path: paths.drawing.ladder,
      color: 'primary',
    },
    {
      title: '룰렛 돌리기',
      description:
        '다양한 항목을 입력하고 부드럽고 스피디하게 회전하는 룰렛을 돌려 무작위로 선택해보세요!',
      icon: <CasinoRoundedIcon sx={{ fontSize: 48, color: 'secondary.main' }} />,
      path: paths.drawing.roulette,
      color: 'secondary',
    },
  ];

  return (
    <DashboardContent maxWidth="lg">
      <Stack spacing={2} sx={{ mb: 5 }}>
        <Typography variant="h4">그리기 및 게임</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          친구들과의 내기, 벌칙 정하기, 혹은 결정을 내려야 할 때 복불복 게임을 통해 쉽고 재밌게
          결정해보세요.
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        {games.map((game) => (
          <Grid size={{ xs: 12, md: 6 }} key={game.title}>
            <Card
              sx={{
                height: '100%',
                transition: (theme) =>
                  theme.transitions.create(['transform', 'box-shadow'], {
                    duration: theme.transitions.duration.shortest,
                  }),
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: (theme) => theme.customShadows?.z16 || theme.shadows[16],
                },
              }}
            >
              <CardActionArea
                component={RouterLink}
                href={game.path}
                sx={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'stretch',
                  textAlign: 'left',
                }}
              >
                <CardContent sx={{ p: 4, width: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ mb: 3 }}>{game.icon}</Box>

                  <Typography variant="h5" sx={{ mb: 1.5 }}>
                    {game.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', flexGrow: 1, mb: 3, lineHeight: 1.6 }}
                  >
                    {game.description}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="soft"
                      color={game.color as 'primary' | 'secondary'}
                      endIcon={<span>&rarr;</span>}
                    >
                      게임하러 가기
                    </Button>
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </DashboardContent>
  );
}
