'use client';

import type { OfficeTabType } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';

// ----------------------------------------------------------------------

interface DocSwitcherHeaderProps {
  currentTab: OfficeTabType;
  onChangeTab: (tab: OfficeTabType) => void;
}

export function DocSwitcherHeader({ currentTab, onChangeTab }: DocSwitcherHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.shadows[1],
      }}
    >
      <Tabs
        value={currentTab}
        onChange={(_, val) => onChangeTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 44,
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 700,
            fontSize: '0.88rem',
            borderRadius: 1.5,
            px: 2,
            mr: 0.5,
          },
        }}
      >
        <Tab
          value="word-scratch"
          label="Word 작성기 (Docx)"
          icon={<DescriptionRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="word-template"
          label="Word 템플릿 치환"
          icon={<AssignmentTurnedInRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="word-viewer"
          label="Word 뷰어 (Mammoth)"
          icon={<VisibilityRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="pptx-studio"
          label="PowerPoint 슬라이드 (Pptx)"
          icon={<SlideshowRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="markdown-studio"
          label="마크다운 & 노트 (KaTeX)"
          icon={<EditNoteRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="batch-hub"
          label="대량 일괄 생성 (Batch ZIP)"
          icon={<FolderZipRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>
    </Box>
  );
}
