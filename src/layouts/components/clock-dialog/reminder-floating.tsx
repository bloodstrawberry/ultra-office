'use client';

import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import { ClockDialog } from './clock-dialog';
import { useReminders } from './use-reminders';

const POSITION_KEY = 'ultra_office_reminder_float_position_v1';
const EDGE_GAP = 12;

interface Position {
  x: number;
  y: number;
}

function formatRemainingTime(milliseconds: number) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return hours > 0
    ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function ReminderFloating() {
  const {
    reminders,
    hasLoaded,
    addReminder,
    deleteReminder,
    toggleReminder,
    toggleReminderSound,
    updateReminderInterval,
    requestNotificationPermission,
  } = useReminders();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [nowMs, setNowMs] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const suppressClickRef = useRef(false);

  const clampPosition = (next: Position): Position => ({
    x: Math.max(
      EDGE_GAP,
      Math.min(next.x, window.innerWidth - (rootRef.current?.offsetWidth ?? 112) - EDGE_GAP)
    ),
    y: Math.max(
      EDGE_GAP,
      Math.min(next.y, window.innerHeight - (rootRef.current?.offsetHeight ?? 88) - EDGE_GAP)
    ),
  });

  useEffect(() => {
    setNowMs(Date.now());
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    const refresh = () => setNowMs(Date.now());
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(POSITION_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (
          typeof parsed === 'object' &&
          parsed !== null &&
          'x' in parsed &&
          'y' in parsed &&
          typeof parsed.x === 'number' &&
          typeof parsed.y === 'number' &&
          Number.isFinite(parsed.x) &&
          Number.isFinite(parsed.y)
        ) {
          setPosition(clampPosition({ x: parsed.x, y: parsed.y }));
        }
      }
    } catch {
      // 위치 저장을 사용할 수 없으면 기본 오른쪽 아래에 표시합니다.
    }
    const handleResize = () => setPosition((current) => (current ? clampPosition(current) : null));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const nextReminder = reminders
    .filter((reminder) => reminder.enabled)
    .sort((a, b) => a.nextReminderAt - b.nextReminderAt)[0];

  const openDialog = () => {
    setDialogOpen(true);
  };

  return (
    <>
      {hasLoaded && nextReminder && (
        <Box
          ref={rootRef}
          role="button"
          tabIndex={0}
          aria-label={`${nextReminder.title} 리마인더 열기`}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              openDialog();
            }
          }}
          onClick={() => {
            if (suppressClickRef.current) {
              suppressClickRef.current = false;
              return;
            }
            openDialog();
          }}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            const rect = rootRef.current?.getBoundingClientRect();
            if (!rect) return;
            dragRef.current = {
              pointerId: event.pointerId,
              startX: event.clientX,
              startY: event.clientY,
              originX: rect.left,
              originY: rect.top,
              moved: false,
            };
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerMove={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (!drag.moved && Math.hypot(dx, dy) < 5) return;
            drag.moved = true;
            setPosition(clampPosition({ x: drag.originX + dx, y: drag.originY + dy }));
          }}
          onPointerUp={(event) => {
            const drag = dragRef.current;
            if (!drag || drag.pointerId !== event.pointerId) return;
            dragRef.current = null;
            if (!drag.moved) return;
            suppressClickRef.current = true;
            window.setTimeout(() => {
              suppressClickRef.current = false;
            }, 0);
            const next = clampPosition({
              x: drag.originX + event.clientX - drag.startX,
              y: drag.originY + event.clientY - drag.startY,
            });
            setPosition(next);
            try {
              localStorage.setItem(POSITION_KEY, JSON.stringify(next));
            } catch {
              // 위치 저장 실패 시 현재 세션의 위치는 유지합니다.
            }
          }}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          sx={{
            position: 'fixed',
            ...(position ? { left: position.x, top: position.y } : { right: 24, bottom: 24 }),
            zIndex: (theme) => theme.zIndex.modal - 1,
            width: 112,
            maxWidth: 'calc(100vw - 24px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            cursor: 'grab',
            touchAction: 'none',
            userSelect: 'none',
            '&:active': { cursor: 'grabbing' },
            '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.contrastText',
              bgcolor: 'primary.main',
              boxShadow: 8,
            }}
          >
            <AccessTimeRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            role="status"
            aria-live="off"
            variant="caption"
            sx={{
              color: 'text.primary',
              fontWeight: 800,
              fontSize: '0.85rem',
              lineHeight: 1.4,
              fontVariantNumeric: 'tabular-nums',
              textShadow: (theme) => `0 1px 3px ${theme.palette.background.paper}`,
            }}
          >
            {formatRemainingTime(nextReminder.nextReminderAt - nowMs)}
          </Typography>
        </Box>
      )}

      <ClockDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        reminders={reminders}
        remindersLoaded={hasLoaded}
        onAddReminder={addReminder}
        onDeleteReminder={deleteReminder}
        onToggleReminder={toggleReminder}
        onToggleReminderSound={toggleReminderSound}
        onReminderIntervalChange={updateReminderInterval}
        onRequestNotificationPermission={requestNotificationPermission}
      />
    </>
  );
}
