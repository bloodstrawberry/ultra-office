'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import type { RecordedMedia } from '../types';
import { RecordControlPanel } from '../components/record-control-panel';
import { VideoEditorPanel } from '../components/video-editor-panel';

// ----------------------------------------------------------------------

export function ScreenRecorderView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [activeMedia, setActiveMedia] = useState<RecordedMedia | null>(null);

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
          <VideocamRoundedIcon sx={{ fontSize: 32, color: 'info.main' }} />
          화면 & 웹캠 녹화 스튜디오 (Screen & Cam Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          별도의 프로그램 설치 없이 브라우저 내장 API로 전체 화면/창/탭을 녹화하고, 타임라인
          트리밍을 거쳐 고화질 GIF나 비디오로 즉시 변환합니다.
        </Typography>
      </Box>

      {/* 2. Main Recording Workspace */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          pb: 4,
        }}
      >
        {/* Recording Control Panel */}
        <RecordControlPanel onRecordingComplete={(media) => setActiveMedia(media)} />

        {/* Video Editor & GIF Converter (Visible once recording is done) */}
        {activeMedia && (
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <HistoryRoundedIcon />
              녹화 결과물 편집 & GIF 변환
            </Typography>
            <VideoEditorPanel media={activeMedia} />
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
