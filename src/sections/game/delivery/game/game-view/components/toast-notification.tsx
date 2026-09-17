"use client";

import React from "react";
import { ToastNotificationProps } from "../types";

export function ToastNotification({ toastText }: ToastNotificationProps) {
  if (!toastText) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-stone-900/90 text-white text-xs font-bold px-4 py-2.5 rounded-full border border-stone-700/80 shadow-2xl z-50 pointer-events-none transition-all animate-bounce">
      {toastText}
    </div>
  );
}
