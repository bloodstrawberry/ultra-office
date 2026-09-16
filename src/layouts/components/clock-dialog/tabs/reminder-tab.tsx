'use client';

import type { Reminder } from '../use-reminders';

import { toast } from 'sonner';
import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AlarmRoundedIcon from '@mui/icons-material/AlarmRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import VolumeOffRoundedIcon from '@mui/icons-material/VolumeOffRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { playReminderSound } from '../utils/sound';

// ----------------------------------------------------------------------

interface ReminderTabProps {
  reminders: Reminder[];
  hasLoaded: boolean;
  onAdd: (title: string, intervalMinutes: number) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onToggleSound: (id: string, enabled: boolean) => void;
  onIntervalChange: (id: string, intervalMinutes: number) => void;
  onRequestNotificationPermission: () => Promise<NotificationPermission | 'unsupported'>;
}

function formatNextReminder(timestamp: number) {
  return new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(timestamp);
}

export function ReminderTab({
  reminders,
  hasLoaded,
  onAdd,
  onDelete,
  onToggle,
  onToggleSound,
  onIntervalChange,
  onRequestNotificationPermission,
}: ReminderTabProps) {
  const [title, setTitle] = useState('');
  const [intervalMinutes, setIntervalMinutes] = useState('30');

  const handleAdd = async () => {
    const trimmedTitle = title.trim();
    const parsedInterval = Number(intervalMinutes);
    if (!trimmedTitle || !Number.isFinite(parsedInterval) || parsedInterval < 1) return;

    onAdd(trimmedTitle, parsedInterval);
    setTitle('');
    await onRequestNotificationPermission();
  };

  const handleNotificationPermission = async () => {
    const permission = await onRequestNotificationPermission();
    if (permission === 'granted') toast.success('시스템 알림을 켰습니다.');
    else if (permission === 'denied') toast.warning('브라우저 설정에서 알림 권한을 허용해 주세요.');
    else if (permission === 'unsupported')
      toast.info('이 브라우저는 시스템 알림을 지원하지 않습니다.');
  };

  return (
    <Box sx={{ width: '100%', py: 1 }}>
      <Box sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          반복 리마인더
        </Typography>
        <Typography color="text.secondary">
          작업하는 동안 잊지 않아야 할 일을 원하는 분 간격으로 알려드려요.
        </Typography>
      </Box>

      <Card variant="outlined" sx={{ p: { xs: 1.25, sm: 2 }, mb: 2, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr) 100px auto',
              sm: 'minmax(0, 1fr) 150px auto',
            },
            gap: { xs: 0.75, sm: 1.5 },
            alignItems: 'center',
          }}
        >
          <TextField
            label="무엇을 리마인드할까요?"
            placeholder="예: 물 마시기"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') handleAdd();
            }}
            size="small"
            fullWidth
          />
          <TextField
            label="반복 간격"
            value={intervalMinutes}
            onChange={(event) => setIntervalMinutes(event.target.value.replace(/\D/g, ''))}
            size="small"
            type="number"
            slotProps={{
              htmlInput: { min: 1, max: 1440 },
              input: { endAdornment: <Typography color="text.secondary">분</Typography> },
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleAdd}
            disabled={!title.trim() || Number(intervalMinutes) < 1}
            sx={{
              height: 40,
              px: { xs: 1, sm: 2.5 },
              minWidth: 0,
              whiteSpace: 'nowrap',
              fontWeight: 700,
            }}
          >
            추가
          </Button>
        </Box>
      </Card>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 2,
          px: 0.5,
        }}
      >
        <Typography variant="body2" color="text.secondary" noWrap>
          리마인더별로 소리를 켜거나 끌 수 있습니다. 화면 알림·탭 점멸은 유지됩니다.
        </Typography>
        <Button
          color="info"
          size="small"
          variant="outlined"
          onClick={handleNotificationPermission}
          sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
        >
          시스템 알림 켜기
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {hasLoaded && reminders.length === 0 && (
          <Box sx={{ py: 7, textAlign: 'center', color: 'text.secondary' }}>
            <AlarmRoundedIcon sx={{ fontSize: 44, opacity: 0.45, mb: 1 }} />
            <Typography>등록된 리마인더가 없습니다.</Typography>
          </Box>
        )}

        {reminders.map((reminder) => (
          <Card
            key={reminder.id}
            variant="outlined"
            sx={{
              p: { xs: 1, sm: 1.5 },
              borderRadius: 2,
              opacity: reminder.enabled ? 1 : 0.62,
              transition: 'opacity 0.2s',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '44px minmax(0, 1fr) 80px 32px 32px',
                  sm: 'auto minmax(0, 1fr) 150px 40px auto',
                },
                gap: { xs: 0.5, sm: 1.5 },
                alignItems: 'center',
              }}
            >
              <Switch
                checked={reminder.enabled}
                onChange={async (event) => {
                  onToggle(reminder.id, event.target.checked);
                  if (event.target.checked) await onRequestNotificationPermission();
                }}
                inputProps={{ 'aria-label': `${reminder.title} 리마인더 켜기` }}
              />
              <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Typography noWrap sx={{ minWidth: 0, fontWeight: 800 }}>
                  {reminder.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ flexShrink: 0, display: { xs: 'none', sm: 'block' } }}
                >
                  {reminder.enabled
                    ? `다음 ${formatNextReminder(reminder.nextReminderAt)}`
                    : '꺼짐'}
                </Typography>
              </Box>
              <TextField
                label="간격(분)"
                defaultValue={reminder.intervalMinutes}
                key={`${reminder.id}-${reminder.intervalMinutes}`}
                size="small"
                type="number"
                onBlur={(event) => {
                  const value = Number(event.target.value);
                  if (Number.isFinite(value) && value >= 1 && value !== reminder.intervalMinutes) {
                    onIntervalChange(reminder.id, value);
                  }
                }}
                slotProps={{
                  htmlInput: { min: 1, max: 1440 },
                }}
              />
              <Tooltip title={reminder.soundEnabled ? '알림음 끄기' : '알림음 켜기'}>
                <IconButton
                  onClick={() => {
                    const nextEnabled = !reminder.soundEnabled;
                    onToggleSound(reminder.id, nextEnabled);
                    if (nextEnabled) playReminderSound();
                  }}
                  color={reminder.soundEnabled ? 'primary' : 'default'}
                  aria-label={`${reminder.title} 알림음 ${reminder.soundEnabled ? '끄기' : '켜기'}`}
                  sx={{ p: { xs: 0.5, sm: 1 } }}
                >
                  {reminder.soundEnabled ? <VolumeUpRoundedIcon /> : <VolumeOffRoundedIcon />}
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={() => onDelete(reminder.id)}
                color="error"
                aria-label={`${reminder.title} 리마인더 삭제`}
                sx={{ p: { xs: 0.5, sm: 1 } }}
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Box>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
