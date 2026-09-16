'use client';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

const PUZZLE_ITEMS = [
  {
    title: '스도쿠 (Sudoku)',
    subtitle: '9x9 스도쿠 인터랙티브 게임 & 백트래킹 즉시 정답 치트키',
    path: paths.puzzle.sudoku,
    tag: 'Backtracking',
    color: '#3B82F6',
    features: ['즉시 정답 풀이 치트', '한 칸 힌트 치트', '후보 숫자 자동 기입', '실시간 충돌 검증'],
  },
  {
    title: '네모네모 로직 (Nonogram)',
    subtitle: '노노그램(피크로스) 픽셀 아트 퍼즐 & 원클릭 도안 완성 치트키',
    path: paths.puzzle.nonogram,
    tag: 'Picross',
    color: '#8B5CF6',
    features: [
      '원클릭 도안 전체 완성 치트',
      '확정 칸 힌트 치트',
      '5x5~15x15 픽셀 아트 프리셋',
      '라인 검증',
    ],
  },
  {
    title: '슬라이딩 퍼즐 (15-Puzzle)',
    subtitle: '3x3(8퍼즐) & 4x4(15퍼즐) 숫자 슬라이드 & A* 알고리즘 자동 주행',
    path: paths.puzzle.sliding,
    tag: 'A* Algorithm',
    color: '#10B981',
    features: [
      'A* 최단 경로 계산',
      '자동 이동 시뮬레이션 치트',
      '다음 이동 타일 힌트',
      '패리티 보장 셔플',
    ],
  },
  {
    title: 'Water Sort (워터 소트)',
    subtitle: '시험관 액체 색상 분류 게임 & BFS 최단 붓기 시뮬레이션 치트키',
    path: paths.puzzle.waterSort,
    tag: 'BFS Solver',
    color: '#06B6D4',
    features: [
      'BFS 최단 붓기 탐색',
      '자동 물 붓기 애니메이션 치트',
      '다음 붓기 튜브 추천',
      '다양한 난이도',
    ],
  },
  {
    title: 'Rush Hour (러시아워)',
    subtitle: '6x6 주차장 자동차 탈출 퍼즐 & BFS 최단 수 탈출 주행 치트키',
    path: paths.puzzle.rushHour,
    tag: 'Traffic Escape',
    color: '#EF4444',
    features: [
      '최단 탈출 경로 탐색',
      '원클릭 자동 탈출 주행 치트',
      '다음 이동 차량 힌트',
      '단계별 프리셋',
    ],
  },
  {
    title: '지뢰찾기 (Minesweeper)',
    subtitle: '첫 클릭이 안전한 지뢰찾기 게임 & 안전 칸 힌트 치트키',
    path: paths.puzzle.minesweeper,
    tag: 'Minesweeper',
    color: '#F59E0B',
    features: ['첫 클릭 안전 보장', '깃발과 주변 칸 열기', '한 단계 논리 풀이', '논리 풀이 재생'],
  },
];

export function PuzzleView() {
  return (
    <DashboardContent maxWidth="xl">
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          mb: { xs: 3, md: 4 },
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Typography variant="h3" sx={{ fontWeight: 800 }}>
            🧩 퍼즐 치트키 연구소
          </Typography>
          <Chip label="Cheat & Solver Hub" color="primary" variant="soft" />
        </Box>
        <Typography variant="body1" sx={{ color: 'text.secondary' }}>
          인기 퍼즐 게임들을 직접 플레이하거나, 막힌 문제의 정답과 최적 해결 경로를 치트키
          알고리즘으로 즉시 해제해보세요.
        </Typography>
      </Box>

      {/* Grid of Puzzle Cards */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
            gap: 3,
          }}
        >
          {PUZZLE_ITEMS.map((item) => (
            <Card
              key={item.path}
              sx={{
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {item.title}
                  </Typography>
                  <Chip
                    label={item.tag}
                    size="small"
                    sx={{
                      bgcolor: item.color,
                      color: '#FFF',
                      fontWeight: 700,
                    }}
                  />
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', minHeight: 40 }}>
                  {item.subtitle}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                  {item.features.map((feat, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BoltRoundedIcon sx={{ fontSize: 16, color: item.color }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {feat}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>

              <Box sx={{ p: 2, pt: 0 }}>
                <Button
                  component={RouterLink}
                  href={item.path}
                  variant="contained"
                  fullWidth
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    bgcolor: item.color,
                    '&:hover': {
                      filter: 'brightness(0.9)',
                      bgcolor: item.color,
                    },
                    fontWeight: 700,
                  }}
                >
                  플레이 & 치트키 열기
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      </Box>
    </DashboardContent>
  );
}
