'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import Dialog from '@mui/material/Dialog';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

// ----------------------------------------------------------------------

interface MatlabHelpDialogProps {
  open: boolean;
  onClose: () => void;
}

const CHEAT_SHEET = [
  {
    category: '행렬 및 벡터 생성',
    items: [
      { syntax: '[1 2 3; 4 5 6]', desc: '2x3 2차원 행렬 정의' },
      { syntax: 'zeros(m, n)', desc: 'm x n 크기의 영행렬 생성' },
      { syntax: 'ones(m, n)', desc: 'm x n 크기의 1 행렬 생성' },
      { syntax: 'eye(n)', desc: 'n x n 단위행렬(Identity Matrix) 생성' },
      { syntax: 'rand(m, n)', desc: '[0, 1) 균등 난수 행렬 생성' },
      { syntax: 'randn(m, n)', desc: '표준 정규분포 N(0,1) 난수 행렬 생성' },
      { syntax: 'magic(n)', desc: 'n x n 마방진(Magic Square) 행렬 생성' },
      { syntax: 'linspace(a, b, n)', desc: 'a부터 b까지 n개의 등간격 벡터 생성' },
      { syntax: '[X, Y] = meshgrid(x, y)', desc: '3D 표면용 2D 격자 좌표 행렬 생성' },
    ],
  },
  {
    category: '선형대수 & 행렬 연산',
    items: [
      { syntax: 'A * B', desc: '행렬 곱셈' },
      { syntax: 'A .* B', desc: '원소별 곱셈 (Element-wise Multiply)' },
      { syntax: 'A .^ 2', desc: '원소별 거듭제곱 (Element-wise Power)' },
      { syntax: "A'", desc: '에르미트 전치 (켤레 복소수 전치)' },
      { syntax: 'inv(A)', desc: '역행렬 계산 (Inverse Matrix)' },
      { syntax: 'det(A)', desc: '행렬식 계산 (Determinant)' },
      { syntax: '[V, D] = eig(A)', desc: '고유값 및 고유벡터 분해' },
      { syntax: 'trace(A)', desc: '대각합 (Trace)' },
      { syntax: 'rank(A)', desc: '행렬의 계수(Rank)' },
    ],
  },
  {
    category: '신호처리 & 푸리에 변환',
    items: [
      { syntax: 'Y = fft(X)', desc: '1차원 고속 푸리에 변환(FFT)' },
      { syntax: 'X = ifft(Y)', desc: '역 푸리에 변환(Inverse FFT)' },
      { syntax: 'fftshift(Y)', desc: '주파수 스펙트럼의 0Hz를 중앙으로 이동' },
      { syntax: 'abs(Y)', desc: '복소수 진폭(Magnitude) 계산' },
      { syntax: 'angle(Y)', desc: '복소수 위상(Phase, rad) 계산' },
    ],
  },
  {
    category: '2D & 3D 플롯 그래픽스',
    items: [
      { syntax: 'figure(n)', desc: 'n번 Figure 창 활성화' },
      { syntax: 'plot(x, y)', desc: '2D 선 그래프 플롯' },
      { syntax: 'scatter(x, y)', desc: '2D 산점도 플롯' },
      { syntax: 'bar(x, y)', desc: '막대 차트' },
      { syntax: 'stem(x, y)', desc: '이산 신호 스템 플롯' },
      { syntax: 'histogram(data)', desc: '데이터 도수분포 히스토그램' },
      { syntax: 'surf(X, Y, Z)', desc: '3D 컬러 표면도' },
      { syntax: 'contour(X, Y, Z)', desc: '3D 등고선도' },
      { syntax: 'plot3(x, y, z)', desc: '3D 3차원 공간 궤적 플롯' },
      { syntax: 'hold on / off', desc: '현재 플롯에 추가 궤적 중첩 렌더링 유지' },
      { syntax: 'grid on / off', desc: '격자눈금 켜기/끄기' },
      { syntax: 'title / xlabel / ylabel', desc: '차트 제목 및 축 라벨 지정' },
      { syntax: 'legend(...)', desc: '범례(Legend) 표시' },
    ],
  },
  {
    category: '명령어 & 제어문',
    items: [
      { syntax: 'clc', desc: 'Command Window 콘솔 화면 청소' },
      { syntax: 'clear', desc: 'Workspace 변수 전체 초기화' },
      { syntax: 'whos', desc: '현재 정의된 변수 목록 및 크기/타입 출력' },
      { syntax: 'disp(val)', desc: '화면에 변수나 문자열 출력' },
      { syntax: 'tic ... toc', desc: '코드 실행 경과 시간 측정' },
      { syntax: 'for i = 1:N ... end', desc: 'for 반복 루프' },
    ],
  },
];

export function MatlabHelpDialog({ open, onClose }: MatlabHelpDialogProps) {
  const [search, setSearch] = useState('');

  const filtered = CHEAT_SHEET.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.syntax.toLowerCase().includes(search.toLowerCase()) ||
        item.desc.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#13161c',
          color: '#f8fafc',
          border: '1px solid #282f3d',
          borderRadius: 1.5,
          maxHeight: 650,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: '#1a1f28',
          borderBottom: '1px solid #282f3d',
          px: 2.5,
          py: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpOutlineRoundedIcon sx={{ fontSize: 20, color: '#38bdf8' }} />
          <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>
            MATLAB Web Studio 문법 & 함수 빠른 참조 가이드 (Cheatsheet)
          </Typography>
        </Box>

        <IconButton size="small" onClick={onClose} sx={{ color: '#94a3b8' }}>
          <CloseRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ p: 2, bgcolor: '#161922', borderBottom: '1px solid #282f3d' }}>
        <Box
          component="input"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          placeholder="함수명 또는 설명 검색 (예: eig, fft, surf, plot...)"
          sx={{
            width: '100%',
            bgcolor: '#1c202a',
            border: '1px solid #334155',
            borderRadius: 1,
            p: 1,
            fontSize: '12px',
            color: '#f8fafc',
            outline: 'none',
            '&:focus': { borderColor: '#38bdf8' },
          }}
        />
      </Box>

      {/* Tables Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {filtered.map((group) => (
          <Box key={group.category} sx={{ mb: 3 }}>
            <Typography
              sx={{ fontSize: '13px', fontWeight: 700, color: '#38bdf8', mb: 1, px: 0.5 }}
            >
              {group.category}
            </Typography>
            <Table
              size="small"
              sx={{
                bgcolor: '#0e1014',
                borderRadius: 1,
                border: '1px solid #242933',
                '& .MuiTableCell-root': { py: 0.75, px: 1.5, borderBottom: '1px solid #1f242e' },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#181b22' }}>
                  <TableCell
                    sx={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, width: '38%' }}
                  >
                    문법 / 함수
                  </TableCell>
                  <TableCell sx={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700 }}>
                    설명
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.items.map((it, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell
                      sx={{
                        color: '#38bdf8',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                      }}
                    >
                      {it.syntax}
                    </TableCell>
                    <TableCell sx={{ color: '#e2e8f0', fontSize: '12px' }}>{it.desc}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
