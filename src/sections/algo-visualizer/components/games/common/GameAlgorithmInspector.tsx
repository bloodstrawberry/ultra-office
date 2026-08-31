'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';

export interface GameAlgorithmInspectorProps {
  gameTitle: string;
  csConcept: string;
  searchNodes: number;
  searchDepth: number;
  timeMs: number;
  evalScore: number;
  algorithmName?: string;
  complexityInfo?: {
    time: string;
    space: string;
    branchingFactor: string;
  };
  details?: React.ReactNode;
}

export function GameAlgorithmInspector({
  gameTitle,
  csConcept,
  searchNodes,
  searchDepth,
  timeMs,
  evalScore,
  algorithmName = 'Alpha-Beta Pruning & Minimax',
  complexityInfo = {
    time: 'O(b^(d/2)) 최적화',
    space: 'O(b · d)',
    branchingFactor: 'b ≈ 10~35 (가지치기 적용 후)',
  },
  details,
}: GameAlgorithmInspectorProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        color: '#0f172a',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchemaRoundedIcon sx={{ color: '#2563eb', fontSize: 22 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a' }}>
            {gameTitle} AI 알고리즘 인스펙터
          </Typography>
        </Box>
        <Chip
          size="small"
          icon={<AccountTreeRoundedIcon />}
          label={algorithmName}
          sx={{
            background: 'rgba(37, 99, 235, 0.08)',
            color: '#2563eb',
            borderColor: 'rgba(37, 99, 235, 0.3)',
            borderWidth: 1,
            borderStyle: 'solid',
            fontWeight: 700,
          }}
        />
      </Box>

      {/* CS Concept Banner */}
      <Box
        sx={{
          mb: 2,
          p: 1.5,
          borderRadius: 1.5,
          background: 'rgba(37, 99, 235, 0.05)',
          borderLeft: '4px solid #2563eb',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1,
        }}
      >
        <LightbulbRoundedIcon sx={{ color: '#d97706', fontSize: 20, mt: 0.2 }} />
        <Box>
          <Typography
            variant="caption"
            sx={{ color: '#64748b', fontWeight: 700, display: 'block' }}
          >
            컴퓨터 사이언스 핵심 이론
          </Typography>
          <Typography variant="body2" sx={{ color: '#1e293b', fontWeight: 700 }}>
            {csConcept}
          </Typography>
        </Box>
      </Box>

      {/* Real-time Metrics Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr 1fr' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', mb: 0.5 }}>
            <MemoryRoundedIcon sx={{ fontSize: 16, color: '#0284c7' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              탐색 노드 수
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0284c7' }}>
            {searchNodes.toLocaleString()}{' '}
            <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
              nodes
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', mb: 0.5 }}>
            <AccountTreeRoundedIcon sx={{ fontSize: 16, color: '#7c3aed' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              탐색 트리 깊이
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#7c3aed' }}>
            Depth {searchDepth}{' '}
            <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
              ply
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', mb: 0.5 }}>
            <SpeedRoundedIcon sx={{ fontSize: 16, color: '#059669' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              수행 속도
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#059669' }}>
            {timeMs}{' '}
            <Typography component="span" variant="caption" sx={{ color: '#64748b' }}>
              ms
            </Typography>
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#64748b', mb: 0.5 }}>
            <SchemaRoundedIcon sx={{ fontSize: 16, color: '#d97706' }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              포지션 평가치
            </Typography>
          </Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, color: evalScore >= 0 ? '#16a34a' : '#dc2626' }}
          >
            {evalScore >= 0 ? `+${evalScore.toFixed(1)}` : evalScore.toFixed(1)}
          </Typography>
        </Box>
      </Box>

      {/* Complexity & Branching factor */}
      <Box
        sx={{
          p: 1.5,
          borderRadius: 1.5,
          background: '#f1f5f9',
          border: '1px solid #e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
          알고리즘 복잡도 및 최적화 통계 (Big-O Complexity)
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip
            size="small"
            label={`시간 복잡도: ${complexityInfo.time}`}
            sx={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Chip
            size="small"
            label={`공간 복잡도: ${complexityInfo.space}`}
            sx={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <Chip
            size="small"
            label={`분기 계수: ${complexityInfo.branchingFactor}`}
            sx={{
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              fontSize: 11,
              fontWeight: 600,
            }}
          />
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(100, Math.max(10, (searchNodes / 300) * 100))}
          sx={{
            height: 4,
            borderRadius: 2,
            backgroundColor: '#e2e8f0',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#2563eb',
            },
          }}
        />
      </Box>

      {details && <Box sx={{ mt: 1.5 }}>{details}</Box>}
    </Paper>
  );
}
