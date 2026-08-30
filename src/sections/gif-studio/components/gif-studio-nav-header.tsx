'use client';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import GifRoundedIcon from '@mui/icons-material/GifRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import CallSplitRoundedIcon from '@mui/icons-material/CallSplitRounded';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

export type GifStudioTabType = 'create' | 'video' | 'split' | 'bg' | 'speed' | 'merge';

export const GIF_STUDIO_TABS: {
  value: GifStudioTabType;
  label: string;
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
}[] = [
  {
    value: 'create',
    label: '1. 움짤 만들기',
    title: '움짤 (GIF) 만들기',
    description: '여러 장의 이미지로 고화질 애니메이션 움짤(GIF)을 제작합니다.',
    icon: <GifRoundedIcon sx={{ fontSize: 26 }} />,
    path: paths.gifStudio.create,
  },
  {
    value: 'video',
    label: '2. 동영상 변환',
    title: '동영상 → GIF 변환',
    description: 'MP4, WebM, MOV 동영상의 원하는 구간을 정밀하게 추출하여 GIF로 변환합니다.',
    icon: <VideoLibraryRoundedIcon sx={{ fontSize: 24 }} />,
    path: paths.gifStudio.video,
  },
  {
    value: 'split',
    label: '3. 프레임 분할',
    title: 'GIF 프레임 분할 · 추출',
    description:
      'GIF 애니메이션의 모든 프레임을 개별 PNG 이미지로 추출하고 일괄 다운로드(ZIP)합니다.',
    icon: <CallSplitRoundedIcon sx={{ fontSize: 24 }} />,
    path: paths.gifStudio.split,
  },
  {
    value: 'bg',
    label: '4. 배경색/투명화',
    title: 'GIF 배경색 변경 · 투명화',
    description: 'GIF의 특정 배경색을 다른 색으로 변경하거나 투명화(크로마키 제거) 처리합니다.',
    icon: <ColorLensRoundedIcon sx={{ fontSize: 24 }} />,
    path: paths.gifStudio.bg,
  },
  {
    value: 'speed',
    label: '5. 속도/역재생',
    title: 'GIF 속도 조절 & 역재생',
    description:
      'GIF 재생 속도를 빠르게/느리게 조절하거나 거꾸로 재생(역재생/부메랑)하도록 편집합니다.',
    icon: <SpeedRoundedIcon sx={{ fontSize: 24 }} />,
    path: paths.gifStudio.speed,
  },
  {
    value: 'merge',
    label: '6. 움짤 합치기',
    title: 'GIF 합치기 · 이어붙이기',
    description:
      '여러 개의 GIF를 원하는 순서로 배치하고 구간 자르기, 배속, 역재생, 반복 횟수를 조절하여 하나로 병합합니다.',
    icon: <LayersRoundedIcon sx={{ fontSize: 24 }} />,
    path: paths.gifStudio.merge,
  },
];

interface GifStudioNavHeaderProps {
  currentTab: GifStudioTabType;
  onTabChange?: (newTab: GifStudioTabType) => void;
}

export function GifStudioNavHeader({ currentTab, onTabChange }: GifStudioNavHeaderProps) {
  const router = useRouter();
  const currentTabInfo = GIF_STUDIO_TABS.find((t) => t.value === currentTab) || GIF_STUDIO_TABS[0];

  const handleTabChange = (_: React.SyntheticEvent, newTab: GifStudioTabType) => {
    if (onTabChange) {
      onTabChange(newTab);
    } else {
      const target = GIF_STUDIO_TABS.find((t) => t.value === newTab);
      if (target) {
        router.push(target.path);
      }
    }
  };

  return (
    <Box sx={{ mb: 2, flexShrink: 0 }}>
      {/* 1. Header Info */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
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
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            {currentTabInfo.title}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {currentTabInfo.description}
          </Typography>
        </Box>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ minHeight: 44 }}
        >
          {GIF_STUDIO_TABS.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              sx={{ fontWeight: 700, minHeight: 44, py: 0.5 }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
