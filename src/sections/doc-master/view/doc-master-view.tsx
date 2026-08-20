'use client';

import type { OfficeTabType } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { MarkdownStudio } from '../components/markdown-studio';
import { BatchGenerator } from '../components/batch-generator';
import { PptxSlideStudio } from '../components/pptx-slide-studio';
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
          오피스 문서 자동화 스튜디오 (Doc Master)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Word(Docx) 작성·템플릿 치환, PowerPoint 슬라이드, 마크다운 노트, 대량 일괄 생성까지
          브라우저 내에서 완결하는 오피스 문서 도구 모음입니다.
        </Typography>
      </Box>

      {/* 2. Office Suite Tab Switcher */}
      <DocSwitcherHeader currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* 3. Active Office Suite Module */}
      <Box
        sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column', mt: 2, pb: 4 }}
      >
        {currentTab === 'word-scratch' && <WordScratchEditor />}
        {currentTab === 'word-template' && <WordTemplateEditor />}
        {currentTab === 'word-viewer' && <WordDocumentViewer />}
        {currentTab === 'pptx-studio' && <PptxSlideStudio />}
        {currentTab === 'markdown-studio' && <MarkdownStudio />}
        {currentTab === 'batch-hub' && <BatchGenerator />}
      </Box>
    </DashboardContent>
  );
}
