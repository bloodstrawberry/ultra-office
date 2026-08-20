'use client';

import type { OfficeTabType } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
        }}
      >
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          오피스 문서 자동화 시스템을 로드하는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: { xs: 'auto', md: 'calc(100vh - 120px)' },
        maxHeight: { xs: 'none', md: 'calc(100vh - 120px)' },
        overflowY: 'auto',
        p: { xs: 1.5, md: 2.5 },
        pb: 4,
      }}
    >
      {/* 1. Office Suite Tab Switcher */}
      <DocSwitcherHeader currentTab={currentTab} onChangeTab={setCurrentTab} />

      {/* 2. Active Office Suite Module */}
      <Box sx={{ flexGrow: 1, minHeight: 520, display: 'flex', flexDirection: 'column' }}>
        {currentTab === 'word-scratch' && <WordScratchEditor />}
        {currentTab === 'word-template' && <WordTemplateEditor />}
        {currentTab === 'word-viewer' && <WordDocumentViewer />}
        {currentTab === 'pptx-studio' && <PptxSlideStudio />}
        {currentTab === 'markdown-studio' && <MarkdownStudio />}
        {currentTab === 'batch-hub' && <BatchGenerator />}
      </Box>
    </Box>
  );
}
