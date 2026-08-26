'use client';

import type { MissionItem } from '../chemistry/molecule-types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import { useChemistryStore } from '../chemistry/use-chemistry-store';

// ----------------------------------------------------------------------

export const MISSIONS_LIST: MissionItem[] = [
  {
    id: 'mission_1',
    title: 'MISSION 01 — 생명의 우물',
    targetMoleculeId: 'h2o',
    targetFormula: 'H₂O',
    targetName: '물',
    requiredElements: 'H × 2, O × 1',
    difficulty: '초급',
    xpReward: 30,
    description:
      '수소 원자 2개와 산소 원자 1개를 선택하여 단일 결합 2개로 물 분자를 완성해 보세요.',
  },
  {
    id: 'mission_2',
    title: 'MISSION 02 — 온실 효과 기체',
    targetMoleculeId: 'co2',
    targetFormula: 'CO₂',
    targetName: '이산화탄소',
    requiredElements: 'C × 1, O × 2',
    difficulty: '초급',
    xpReward: 35,
    description:
      '탄소 중심에 산소 원자 2개를 이중 결합(=)으로 결합하여 이산화탄소를 만들어 보세요.',
  },
  {
    id: 'mission_3',
    title: 'MISSION 03 — 천연가스의 주성분',
    targetMoleculeId: 'ch4',
    targetFormula: 'CH₄',
    targetName: '메탄',
    requiredElements: 'C × 1, H × 4',
    difficulty: '초급',
    xpReward: 40,
    description: '탄소 원자 1개에 수소 4개를 결합하여 정사면체 구조의 메탄을 완성해 보세요.',
  },
  {
    id: 'mission_4',
    title: 'MISSION 04 — 자극적인 비료 기체',
    targetMoleculeId: 'nh3',
    targetFormula: 'NH₃',
    targetName: '암모니아',
    requiredElements: 'N × 1, H × 3',
    difficulty: '중급',
    xpReward: 45,
    description: '질소 원자 1개에 수소 3개를 피라미드 모양으로 연결해 보세요.',
  },
  {
    id: 'mission_5',
    title: 'MISSION 05 — 삼중 결합 아세틸렌',
    targetMoleculeId: 'c2h2',
    targetFormula: 'C₂H₂',
    targetName: '아세틸렌',
    requiredElements: 'C × 2, H × 2',
    difficulty: '중급',
    xpReward: 50,
    description: '두 탄소 사이에 삼중 결합(≡)을 만들고 양쪽 끝에 수소를 연결해 보세요.',
  },
  {
    id: 'mission_6',
    title: 'MISSION 06 — 소독과 발효의 알코올',
    targetMoleculeId: 'c2h5oh',
    targetFormula: 'C₂H₅OH',
    targetName: '에탄올',
    requiredElements: 'C × 2, H × 6, O × 1',
    difficulty: '고급',
    xpReward: 70,
    description: '에틸 구조와 히드록시기(-OH) 결합을 조합하여 에탄올을 조립해 보세요.',
  },
  {
    id: 'mission_7',
    title: 'MISSION 07 — 해열진통제의 제왕',
    targetMoleculeId: 'aspirin',
    targetFormula: 'C₉H₈O₄',
    targetName: '아스피린',
    requiredElements: 'C × 9, H × 8, O × 4',
    difficulty: '고급',
    xpReward: 100,
    description: '벤젠 고리에 아세틸기와 카르복시산이 결합된 해열 진통제 아스피린을 합성하세요.',
  },
  {
    id: 'mission_8',
    title: 'MISSION 08 — 현대인의 각성제',
    targetMoleculeId: 'caffeine',
    targetFormula: 'C₈H₁₀N₄O₂',
    targetName: '카페인',
    requiredElements: 'C × 8, H × 10, N × 4, O × 2',
    difficulty: '고급',
    xpReward: 150,
    description: '퓨린 염기 구조의 2개의 고리에 질소 4개를 포함하는 카페인 분자를 완성하세요.',
  },
];

interface MissionModePanelProps {
  onStartMissionInSandbox?: (moleculeId: string) => void;
}

export function MissionModePanel({ onStartMissionInSandbox }: MissionModePanelProps) {
  const { xp, levelTitle, completedMissionIds, completeMission, loadPresetMolecule } =
    useChemistryStore();

  const completedCount = completedMissionIds.length;
  const totalCount = MISSIONS_LIST.length;
  const progressPercent = Math.round((completedCount / (totalCount || 1)) * 100);

  const handleStart = (m: MissionItem) => {
    loadPresetMolecule(m.targetMoleculeId);
    if (onStartMissionInSandbox) {
      onStartMissionInSandbox(m.targetMoleculeId);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Researcher Rank & Level Banner */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(59, 130, 246, 0.12))',
          border: '1.5px solid rgba(245, 158, 11, 0.3)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              bgcolor: 'warning.main',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 3,
            }}
          >
            <EmojiEventsRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
              연구원 화학 칭호 등급
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: 'warning.dark' }}>
              {levelTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              누적 경험치: <span style={{ color: '#38bdf8' }}>{xp} XP</span>
            </Typography>
          </Box>
        </Box>

        {/* Quest Completion Gauge */}
        <Box sx={{ minWidth: { xs: '100%', sm: 240 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 800 }}>
              미션 달성률
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 900, color: 'primary.main' }}>
              {completedCount} / {totalCount} ({progressPercent}%)
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
      </Card>

      {/* 2. Mission Quest Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 2.5,
        }}
      >
        {MISSIONS_LIST.map((m) => {
          const isDone = completedMissionIds.includes(m.id);
          return (
            <Card
              key={m.id}
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 2,
                border: '1.5px solid',
                borderColor: isDone ? 'success.main' : 'divider',
                bgcolor: isDone ? 'background.neutral' : 'background.paper',
                boxShadow: isDone ? 2 : 1,
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.5,
                  }}
                >
                  <Chip
                    label={m.difficulty}
                    size="small"
                    color={
                      m.difficulty === '초급'
                        ? 'success'
                        : m.difficulty === '중급'
                          ? 'warning'
                          : 'error'
                    }
                    sx={{ fontWeight: 800 }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'warning.main' }}>
                    +{m.xpReward} XP
                  </Typography>
                </Box>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  {m.title}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 900, my: 0.5 }}>
                  {m.targetFormula} ({m.targetName})
                </Typography>

                <Card
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral', my: 1.5 }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                    필요 원소 재료:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 900, color: 'success.main' }}>
                    {m.requiredElements}
                  </Typography>
                </Card>

                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', lineHeight: 1.5, fontSize: '13px' }}
                >
                  {m.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  pt: 1,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={() => handleStart(m)}
                  sx={{ fontWeight: 800 }}
                >
                  🧪 조립 도전하기
                </Button>
                {!isDone ? (
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => completeMission(m.id, m.xpReward)}
                    sx={{ fontWeight: 700, flexShrink: 0 }}
                  >
                    완료 체크
                  </Button>
                ) : (
                  <Chip
                    icon={<CheckCircleRoundedIcon />}
                    label="완료"
                    color="success"
                    sx={{ fontWeight: 800, height: 36, px: 1 }}
                  />
                )}
              </Box>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}
