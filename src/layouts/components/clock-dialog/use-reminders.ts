'use client';

import { toast } from 'sonner';
import { useSyncExternalStore } from 'react';

import { playReminderSound } from './utils/sound';

// 여러 시계 표시가 한 화면에 있어도 알림은 한 번만 실행합니다.
const STORAGE_KEY = 'ultra_office_reminders_v1';
const LEGACY_SOUND_KEY = 'ultra_office_clock_sound_enabled_v1';

function getLegacySoundEnabled() {
  try {
    return localStorage.getItem(LEGACY_SOUND_KEY) !== 'false';
  } catch {
    return true;
  }
}

export interface Reminder {
  id: string;
  title: string;
  intervalMinutes: number;
  enabled: boolean;
  soundEnabled: boolean;
  nextReminderAt: number;
}

interface ReminderSnapshot {
  reminders: Reminder[];
  hasLoaded: boolean;
}

let snapshot: ReminderSnapshot = { reminders: [], hasLoaded: false };
const serverSnapshot: ReminderSnapshot = { reminders: [], hasLoaded: false };
const listeners = new Set<() => void>();
let intervalId: number | undefined;
let alertIntervalId: number | undefined;
let alertTimeoutId: number | undefined;
let originalTitle = '';
let originalIconHref: string | null = null;
let alertIcon: HTMLLinkElement | null = null;
let createdAlertIcon = false;

export function dismissReminderAlert() {
  if (alertIntervalId !== undefined) window.clearInterval(alertIntervalId);
  if (alertTimeoutId !== undefined) window.clearTimeout(alertTimeoutId);
  alertIntervalId = undefined;
  alertTimeoutId = undefined;
  if (originalTitle) document.title = originalTitle;
  if (alertIcon) {
    if (createdAlertIcon) alertIcon.remove();
    else if (originalIconHref !== null) alertIcon.href = originalIconHref;
  }
  alertIcon = null;
  originalTitle = '';
  originalIconHref = null;
  createdAlertIcon = false;
  navigator.clearAppBadge?.().catch(() => {});
}

function startReminderAlert(title: string) {
  dismissReminderAlert();
  originalTitle = document.title;
  alertIcon = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!alertIcon) {
    alertIcon = document.createElement('link');
    alertIcon.rel = 'icon';
    document.head.appendChild(alertIcon);
    createdAlertIcon = true;
  }
  originalIconHref = alertIcon.getAttribute('href');
  const alertIconHref = `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#f97316"/><text x="32" y="46" text-anchor="middle" font-size="42">!</text></svg>'
  )}`;
  let highlighted = false;
  const flash = () => {
    highlighted = !highlighted;
    document.title = highlighted ? `⏰ ${title} — 리마인더!` : originalTitle;
    if (alertIcon) alertIcon.href = highlighted ? alertIconHref : (originalIconHref ?? '');
  };
  flash();
  alertIntervalId = window.setInterval(flash, 700);
  alertTimeoutId = window.setTimeout(dismissReminderAlert, 20000);
  navigator.setAppBadge?.().catch(() => {});
}

function setReminders(reminders: Reminder[]) {
  snapshot = { reminders, hasLoaded: true };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reminders));
  } catch {
    // 저장 공간을 사용할 수 없어도 현재 세션에서는 계속 동작합니다.
  }
  listeners.forEach((listener) => listener());
}

function loadReminders() {
  if (snapshot.hasLoaded) return;
  let savedReminders: Reminder[] | null = null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        savedReminders = parsed
          .filter(
            (item): item is Reminder =>
              typeof item === 'object' &&
              item !== null &&
              typeof item.id === 'string' &&
              typeof item.title === 'string' &&
              typeof item.intervalMinutes === 'number' &&
              Number.isFinite(item.intervalMinutes) &&
              typeof item.enabled === 'boolean'
          )
          .map((item) => ({
            ...item,
            title: item.title.trim(),
            intervalMinutes: Math.max(1, Math.min(1440, Math.round(item.intervalMinutes))),
            soundEnabled:
              typeof item.soundEnabled === 'boolean' ? item.soundEnabled : getLegacySoundEnabled(),
            nextReminderAt:
              typeof item.nextReminderAt === 'number' && Number.isFinite(item.nextReminderAt)
                ? item.nextReminderAt
                : Date.now() + item.intervalMinutes * 60 * 1000,
          }))
          .filter((item) => item.title.length > 0);
      }
    }
  } catch {
    // 손상된 저장 데이터는 기본값으로 복구합니다.
  }
  setReminders(
    savedReminders ?? [
      {
        id: 'default-stretching',
        title: '스트레칭',
        intervalMinutes: 30,
        enabled: true,
        soundEnabled: getLegacySoundEnabled(),
        nextReminderAt: Date.now() + 30 * 60 * 1000,
      },
    ]
  );
}

function showReminder(reminder: Reminder) {
  if (reminder.soundEnabled) {
    playReminderSound();
    window.setTimeout(() => {
      if (snapshot.reminders.find((item) => item.id === reminder.id)?.soundEnabled) {
        playReminderSound();
      }
    }, 1200);
  }
  startReminderAlert(reminder.title);
  toast.info(`⏰ ${reminder.title} 할 시간이에요!`, {
    description: `${reminder.intervalMinutes}분 간격 리마인더`,
    duration: 15000,
  });
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      const notification = new Notification('Ultra Office 리마인더', {
        body: `${reminder.title} 할 시간이에요!`,
        tag: `ultra-office-reminder-${reminder.id}`,
        requireInteraction: true,
        silent: !reminder.soundEnabled,
      });
      notification.onclick = () => {
        dismissReminderAlert();
        window.focus();
        notification.close();
      };
    } catch {
      // 시스템 알림 실패 시 화면 알림은 유지합니다.
    }
  }
}

function checkReminders() {
  const now = Date.now();
  const due = snapshot.reminders.filter((item) => item.enabled && item.nextReminderAt <= now);
  if (due.length === 0) return;
  due.forEach(showReminder);
  setReminders(
    snapshot.reminders.map((item) => {
      if (!item.enabled || item.nextReminderAt > now) return item;
      const intervalMs = item.intervalMinutes * 60 * 1000;
      const missedIntervals = Math.floor((now - item.nextReminderAt) / intervalMs) + 1;
      return { ...item, nextReminderAt: item.nextReminderAt + missedIntervals * intervalMs };
    })
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  loadReminders();
  if (intervalId === undefined) {
    checkReminders();
    intervalId = window.setInterval(checkReminders, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && intervalId !== undefined) {
      window.clearInterval(intervalId);
      intervalId = undefined;
    }
  };
}

async function requestNotificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported' as const;
  if (Notification.permission === 'granted') return 'granted' as const;
  return Notification.requestPermission();
}

function addReminder(title: string, intervalMinutes: number) {
  const now = Date.now();
  const safeInterval = Math.max(1, Math.min(1440, Math.round(intervalMinutes)));
  setReminders([
    ...snapshot.reminders,
    {
      id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      intervalMinutes: safeInterval,
      enabled: true,
      soundEnabled: true,
      nextReminderAt: now + safeInterval * 60 * 1000,
    },
  ]);
}

function deleteReminder(id: string) {
  setReminders(snapshot.reminders.filter((item) => item.id !== id));
}

function toggleReminder(id: string, enabled: boolean) {
  setReminders(
    snapshot.reminders.map((item) =>
      item.id === id
        ? {
            ...item,
            enabled,
            nextReminderAt: enabled
              ? Date.now() + item.intervalMinutes * 60 * 1000
              : item.nextReminderAt,
          }
        : item
    )
  );
}

function toggleReminderSound(id: string, soundEnabled: boolean) {
  setReminders(
    snapshot.reminders.map((item) => (item.id === id ? { ...item, soundEnabled } : item))
  );
}

function updateReminderInterval(id: string, intervalMinutes: number) {
  const safeInterval = Math.max(1, Math.min(1440, Math.round(intervalMinutes)));
  setReminders(
    snapshot.reminders.map((item) =>
      item.id === id
        ? {
            ...item,
            intervalMinutes: safeInterval,
            nextReminderAt: Date.now() + safeInterval * 60 * 1000,
          }
        : item
    )
  );
}

export function useReminders() {
  const { reminders, hasLoaded } = useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => serverSnapshot
  );
  return {
    reminders,
    hasLoaded,
    addReminder,
    deleteReminder,
    toggleReminder,
    toggleReminderSound,
    updateReminderInterval,
    requestNotificationPermission,
  };
}
