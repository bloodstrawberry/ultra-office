'use client';

import type { TranslatorTabType } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import TranslateRoundedIcon from '@mui/icons-material/TranslateRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

// ----------------------------------------------------------------------

interface TranslatorHeaderProps {
  currentTab: TranslatorTabType;
  onChangeTab: (tab: TranslatorTabType) => void;
  onOpenTemplates: () => void;
  onOpenHistory: () => void;
  historyCount: number;
}

export function TranslatorHeader({
  currentTab,
  onChangeTab,
  onOpenTemplates,
  onOpenHistory,
  historyCount,
}: TranslatorHeaderProps) {
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
      {/* 탭 네비게이션 */}
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
          value="direct"
          label="실시간 텍스트 번역"
          icon={<TranslateRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="multi"
          label="다국어 동시 비교 번역"
          icon={<PublicRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
        <Tab
          value="doc"
          label="오피스 문서 파일 번역"
          icon={<ArticleRoundedIcon fontSize="small" />}
          iconPosition="start"
        />
      </Tabs>

      {/* 우측 퀵 액션 버튼들 */}
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
        <Tooltip title="비즈니스 이메일, 회의록, 계약서 등 실무 번역 예문">
          <Button
            size="medium"
            variant="outlined"
            color="primary"
            startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
            onClick={onOpenTemplates}
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 1.8,
            }}
          >
            업무용 템플릿
          </Button>
        </Tooltip>

        <Tooltip title="최근 번역 기록 및 즐겨찾기">
          <Button
            size="medium"
            variant="soft"
            color="inherit"
            startIcon={<HistoryRoundedIcon fontSize="small" />}
            onClick={onOpenHistory}
            sx={{
              borderRadius: 1.5,
              fontWeight: 700,
              textTransform: 'none',
              px: 1.8,
              bgcolor: 'action.hover',
            }}
          >
            번역 기록 {historyCount > 0 ? `(${historyCount})` : ''}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}
