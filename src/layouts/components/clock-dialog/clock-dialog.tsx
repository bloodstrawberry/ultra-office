'use client';

import type { Reminder } from './use-reminders';

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
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import HourglassEmptyRoundedIcon from '@mui/icons-material/HourglassEmptyRounded';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';

import { TimerTab } from './tabs/timer-tab';
import { ReminderTab } from './tabs/reminder-tab';
import { StopwatchTab } from './tabs/stopwatch-tab';
import { WorldClockTab } from './tabs/world-clock-tab';
import { AnalogClockTab } from './tabs/analog-clock-tab';

// ----------------------------------------------------------------------

export interface ClockDialogProps {
  open: boolean;
  onClose: () => void;
  initialTab?: number;
  reminders: Reminder[];
  remindersLoaded: boolean;
  onAddReminder: (title: string, intervalMinutes: number) => void;
  onDeleteReminder: (id: string) => void;
  onToggleReminder: (id: string, enabled: boolean) => void;
  onToggleReminderSound: (id: string, enabled: boolean) => void;
  onReminderIntervalChange: (id: string, intervalMinutes: number) => void;
  onRequestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

export function ClockDialog({
  open,
  onClose,
  initialTab = 0,
  reminders,
  remindersLoaded,
  onAddReminder,
  onDeleteReminder,
  onToggleReminder,
  onToggleReminderSound,
  onReminderIntervalChange,
  onRequestNotificationPermission,
}: ClockDialogProps) {
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
          height: { xs: 'calc(100dvh - 24px)', sm: '85vh' },
          minHeight: { xs: 0, sm: 700 },
          borderRadius: 2,
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
      <Box
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 0.5, md: 2.5 },
          flexShrink: 0,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: 52,
            '& .MuiTabs-list': { width: { md: '100%' } },
            '& .MuiTab-root': {
              minHeight: 52,
              minWidth: { xs: 120, md: 0 },
              flex: { md: 1 },
              fontWeight: 700,
              fontSize: { xs: '0.82rem', md: '0.9rem' },
              display: 'flex',
              flexDirection: 'row',
              gap: { xs: 0.5, md: 1 },
              whiteSpace: 'nowrap',
            },
          }}
        >
          <Tab
            icon={<NotificationsNoneRoundedIcon sx={{ fontSize: 20 }} />}
            label="리마인더"
            iconPosition="start"
          />
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
          <Tab
            icon={<AccessTimeRoundedIcon sx={{ fontSize: 20 }} />}
            label="아날로그 시계"
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
        {currentTab === 0 && (
          <ReminderTab
            reminders={reminders}
            hasLoaded={remindersLoaded}
            onAdd={onAddReminder}
            onDelete={onDeleteReminder}
            onToggle={onToggleReminder}
            onToggleSound={onToggleReminderSound}
            onIntervalChange={onReminderIntervalChange}
            onRequestNotificationPermission={onRequestNotificationPermission}
          />
        )}
        {currentTab === 1 && <TimerTab />}
        {currentTab === 2 && <StopwatchTab />}
        {currentTab === 3 && <WorldClockTab />}
        {currentTab === 4 && <AnalogClockTab />}
      </Box>
    </Dialog>
  );
}
