'use client';

import React, { useState, useEffect } from 'react';

interface ToastMessage {
  id: string;
  text: string;
}

export function showToast(message: string) {
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('push-push-toast', { detail: { message } }));
    }, 0);
  }
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string }>;
      const text = customEvent.detail?.message;
      if (!text) return;

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      setToasts((prev) => {
        if (prev.some((t) => t.text === text)) {
          return prev;
        }
        return [...prev, { id, text }];
      });

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    };

    window.addEventListener('push-push-toast', handleShowToast);
    return () => {
      window.removeEventListener('push-push-toast', handleShowToast);
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 items-center pointer-events-none px-4 w-full max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-amber-950/95 text-white text-[13px] font-bold px-4 py-2.5 rounded-2xl shadow-xl border border-amber-600/50 backdrop-blur-md flex items-center gap-2 tracking-tight text-center break-all select-none animate-fade-in"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
