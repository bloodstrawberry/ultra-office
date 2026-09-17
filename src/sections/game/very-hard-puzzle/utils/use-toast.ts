'use client';

import { useState } from 'react';

export function useToast() {
  const [toastText, setToastText] = useState<string | null>(null);

  const openToast = (msg: string) => {
    setToastText(msg);
    setTimeout(() => {
      setToastText((current) => (current === msg ? null : current));
    }, 2500);
  };

  return { openToast, toastText };
}
