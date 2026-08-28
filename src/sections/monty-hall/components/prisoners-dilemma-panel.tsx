'use client';

import type { StrategyLeaderboardItem } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { PD_STRATEGIES, playTournament } from '../utils/monty-math';

// ----------------------------------------------------------------------

export function PrisonersDilemmaPanel() {
  const [roundsPerMatch, setRoundsPerMatch] = useState<number>(20);
  const [leaderboard, setLeaderboard] = useState<StrategyLeaderboardItem[]>([]);

  const runTournament = () => {
    const { leaderboard: lb } = playTournament(roundsPerMatch);
    setLeaderboard(lb);
  };

  useEffect(() => {
    runTournament();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundsPerMatch]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Header & Payoff Matrix */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 0.8fr' },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        {/* Payoff Matrix */}
        <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'primary.main' }}>
            보상 매트릭스 (Payoff Matrix)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            양측이 동시에 선택합니다: (나의 점수, 상대의 점수)
          </Typography>

          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>나 \ 상대</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'success.main' }}>
                    협력 (Cooperate)
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: 'error.main' }}>
                    배신 (Defect)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'success.main' }}>
                    협력 (Cooperate)
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: 'success.lighter', fontWeight: 800 }}>
                    (+3, +3) [상호 협력 보상]
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: 'error.lighter', fontWeight: 800 }}>
                    (0, +5) [호구의 배신 피해]
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: 'error.main' }}>배신 (Defect)</TableCell>
                  <TableCell align="center" sx={{ bgcolor: 'warning.lighter', fontWeight: 800 }}>
                    (+5, 0) [배신의 유혹 대박]
                  </TableCell>
                  <TableCell align="center" sx={{ bgcolor: 'background.neutral', fontWeight: 800 }}>
                    (+1, +1) [상호 배신 처벌]
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        </Card>

        {/* Strategies Description */}
        <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              AI 게임이론 6대 전략
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {[10, 20, 50].map((r) => (
                <Chip
                  key={r}
                  size="small"
                  label={`${r}R`}
                  clickable
                  color={roundsPerMatch === r ? 'primary' : 'default'}
                  onClick={() => setRoundsPerMatch(r)}
                />
              ))}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<PlayArrowRoundedIcon />}
                onClick={runTournament}
              >
                재실행
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              maxHeight: 180,
              overflowY: 'auto',
            }}
          >
            {Object.values(PD_STRATEGIES).map((strat) => (
              <Box key={strat.id} sx={{ p: 1, bgcolor: 'background.neutral', borderRadius: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: strat.color }}>
                  {strat.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {strat.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* 2. Tournament Leaderboard */}
      <Card sx={{ p: 2.5, borderRadius: 2, border: 1, borderColor: 'divider' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, color: 'secondary.main' }}>
          반복 죄수의 딜레마 라운드-로빈 토너먼트 순위표 (총 {roundsPerMatch}라운드 매치)
        </Typography>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>순위</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>전략명</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                총 득점
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                매치 승리 수
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 800 }}>
                협력률 (%)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((item, index) => (
              <TableRow
                key={item.id}
                sx={{
                  bgcolor: index === 0 ? 'success.lighter' : 'transparent',
                }}
              >
                <TableCell sx={{ fontWeight: 800 }}>
                  {index === 0
                    ? '🥇 1위'
                    : index === 1
                      ? '🥈 2위'
                      : index === 2
                        ? '🥉 3위'
                        : `${index + 1}위`}
                </TableCell>
                <TableCell sx={{ fontWeight: 800 }}>{item.name}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {item.totalScore.toLocaleString()}점
                </TableCell>
                <TableCell align="right">{item.winCount}승</TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={`${item.cooperationRate.toFixed(1)}%`}
                    color={
                      item.cooperationRate > 60
                        ? 'success'
                        : item.cooperationRate < 20
                          ? 'error'
                          : 'warning'
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Box sx={{ p: 2, bgcolor: 'background.neutral', borderRadius: 2, mt: 2.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
            💡 액설로드(Axelrod) 토너먼트의 교훈: 왜 항상 팃포탯(Tit-for-Tat)이 승리하는가?
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.6 }}
          >
            단판 승부에서는 배신이 항상 유리하지만, <b>반복되는 사회적 관계</b>에서는 다음 4가지
            특성을 갖춘 전략이 압도적으로 번성합니다: ① <b>친절함</b>(먼저 배신하지 않음), ②{' '}
            <b>보복성</b>(상대가 배신하면 즉시 응징), ③ <b>용서</b>(상대가 다시 협력하면 과거를 묻지
            않고 화해), ④ <b>명확성</b>(상대가 의도를 쉽게 파악 가능).
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
