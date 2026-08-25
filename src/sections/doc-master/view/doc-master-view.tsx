'use client';

import type { OfficeTabType } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { BatchGenerator } from '../components/batch-generator';
import { DocSwitcherHeader } from '../components/doc-switcher-header';
import { WordScratchEditor } from '../components/word-scratch-editor';
import { WordTemplateEditor } from '../components/word-template-editor';
import { WordDocumentViewer } from '../components/word-document-viewer';

// ----------------------------------------------------------------------

export function DocMasterView() {
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<OfficeTabType>('word-scratch');

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
          <DescriptionRoundedIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          워드 (Word Processor)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Word(Docx) 맞춤 작성, 공문/계약서 템플릿 데이터 치환, 무설치 문서 뷰어, 수백 건 대량 일괄
          생성까지 브라우저 내에서 완결하는 워드 문서 도구입니다.
        </Typography>
      </Box>

      {/* 2. Office Suite Tab Switcher */}
      <DocSwitcherHeader currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* 3. Active Office Suite Module */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          mt: 1.5,
          pb: 1,
          overflow: 'hidden',
        }}
      >
        {currentTab === 'word-scratch' && <WordScratchEditor />}
        {currentTab === 'word-template' && <WordTemplateEditor />}
        {currentTab === 'word-viewer' && <WordDocumentViewer />}
        {currentTab === 'batch-hub' && <BatchGenerator />}
      </Box>
    </DashboardContent>
  );
}
