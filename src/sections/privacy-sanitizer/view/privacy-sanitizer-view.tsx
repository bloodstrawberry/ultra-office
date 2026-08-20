'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import LocationOffRoundedIcon from '@mui/icons-material/LocationOffRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { TextSanitizerPanel } from '../components/text-sanitizer-panel';
import { ExifRemoverPanel } from '../components/exif-remover-panel';
import { ImageRedactPanel } from '../components/image-redact-panel';

// ----------------------------------------------------------------------

export function PrivacySanitizerView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentTab, setCurrentTab] = useState<'text' | 'exif' | 'redact'>('text');

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <ShieldRoundedIcon sx={{ fontSize: 32, color: 'success.main' }} />
          개인정보 안심 마스킹 & EXIF 메타데이터 파기기
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          대외비 문서와 사진을 외부에 전달하기 전, 주민번호/계좌 자동 블라인드 처리 및 사진 속 GPS
          촬영 위치/카메라 정보를 100% 완전 세척합니다.
        </Typography>
      </Box>

      {/* 2. Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={currentTab} onChange={(_, val) => setCurrentTab(val)}>
          <Tab
            value="text"
            label="1. 텍스트 개인정보 자동 마스킹"
            icon={<TextFieldsRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="exif"
            label="2. 사진 EXIF · GPS 메타데이터 파기"
            icon={<LocationOffRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            value="redact"
            label="3. 신분증 · 서류 사각 블라인드"
            icon={<BadgeRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 3. Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        {currentTab === 'text' && <TextSanitizerPanel />}
        {currentTab === 'exif' && <ExifRemoverPanel />}
        {currentTab === 'redact' && <ImageRedactPanel />}
      </Box>
    </DashboardContent>
  );
}
