'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import LaptopMacRoundedIcon from '@mui/icons-material/LaptopMacRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import FormatColorFillRoundedIcon from '@mui/icons-material/FormatColorFillRounded';

// ----------------------------------------------------------------------

export type AppsInTossTabType = 'logo' | 'color' | 'sero' | 'garo' | 'ogImage';

export interface AppsInTossTabItem {
  value: AppsInTossTabType;
  label: string;
  badge?: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  path?: string;
}

export const APPS_IN_TOSS_TABS: AppsInTossTabItem[] = [
  {
    value: 'logo',
    label: '로고 만들기',
    badge: '600×600',
    title: '로고 / 아이콘 맞춤 생성기',
    description: '정사각형 크롭 및 600×600 고해상도 앱 아이콘과 프로필 이미지를 생성합니다.',
    icon: <CropSquareRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: 'color',
    label: '배경색 변경',
    badge: '투명화',
    title: '스마트 배경색 변환 & 누끼',
    description: '원클릭 흰색↔투명 전환 및 스마트 페인트 통 영역 채우기 기능을 제공합니다.',
    icon: <FormatColorFillRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: 'sero',
    label: '세로 스크린샷',
    badge: '636×1048',
    title: '세로형 스크린샷 일괄 생성기',
    description: '모바일 카드 및 스마트폰 앱 규격 636×1048 스크린샷을 일괄 생성합니다.',
    icon: <PhoneAndroidRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: 'garo',
    label: '가로 스크린샷',
    badge: '1504×741',
    title: '가로형 스크린샷 일괄 생성기',
    description: '웹 대시보드 및 배너 규격 1504×741 스크린샷을 고속 일괄 생성합니다.',
    icon: <LaptopMacRoundedIcon sx={{ fontSize: 20 }} />,
  },
  {
    value: 'ogImage',
    label: 'ogImage 크기 조절',
    badge: '1200×600',
    title: '토스 ogImage 크기 조절기',
    description:
      '토스 앱인토스 오픈그래프 메타 규격 1200×600 맞춤 리사이즈 및 공유 카드 시뮬레이터를 제공합니다.',
    icon: <ShareRoundedIcon sx={{ fontSize: 20 }} />,
  },
];

interface AppsInTossNavHeaderProps {
  currentTab: AppsInTossTabType;
}

export function AppsInTossNavHeader({ currentTab }: AppsInTossNavHeaderProps) {
  const currentTabInfo =
    APPS_IN_TOSS_TABS.find((t) => t.value === currentTab) || APPS_IN_TOSS_TABS[4];

  return (
    <Box sx={{ mb: { xs: 1.5, sm: 2 }, flexShrink: 0 }}>
      {/* Header Title & Description */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {currentTabInfo.icon}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25 }}>
            {currentTabInfo.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentTabInfo.description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
