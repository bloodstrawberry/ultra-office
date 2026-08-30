'use client';

import { useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';

import { TimerTab } from './tabs/timer-tab';
import { StopwatchTab } from './tabs/stopwatch-tab';
import { WorldClockTab } from './tabs/world-clock-tab';

// ----------------------------------------------------------------------

export interface ClockDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
}

export function ClockDialog({ open, onClose, initialTab = 0 }: ClockDialogProps) {
  const [currentTab, setCurrentTab] = useState<number>(initialTab);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="lg"
      sx={{
        '& .MuiDialog-paper': {
          width: '100%',
          maxWidth: 1140, // 기존 620에서 대폭 확대 (4열 지원)
          height: '85vh', // 높이 고정 (필터나 컨텐츠 양에 따라 변하지 않음)
          minHeight: 700,
          borderRadius: 2.5,
          p: 0,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* 헤더 & 닫기 버튼 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          pt: 2.5,
          pb: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.02em' }}
        >
          시계 도구
        </Typography>

        <IconButton size="medium" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 탭 네비게이션 */}
      <Box sx={{ borderBottom: '1px solid', borderColor: 'divider', px: 2.5, flexShrink: 0 }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 52,
            '& .MuiTab-root': {
              minHeight: 52,
              fontWeight: 700,
              fontSize: '0.95rem',
              display: 'flex',
              flexDirection: 'row',
              gap: 1.2,
            },
          }}
        >
          <Tab
            icon={<HourglassEmptyRoundedIcon sx={{ fontSize: 20 }} />}
            label="타이머"
            iconPosition="start"
          />
          <Tab
            icon={<TimerOutlinedIcon sx={{ fontSize: 20 }} />}
            label="스톱워치"
            iconPosition="start"
          />
          <Tab
            icon={<PublicRoundedIcon sx={{ fontSize: 20 }} />}
            label="세계시간"
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* 탭 컨텐츠 영역 (내부 스크롤) */}
      <Box
        sx={{
          p: 3,
          flex: 1, // 남은 높이를 모두 채움
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {currentTab === 0 && <TimerTab />}
        {currentTab === 1 && <StopwatchTab />}
        {currentTab === 2 && <WorldClockTab />}
      </Box>
    </Dialog>
  );
}
