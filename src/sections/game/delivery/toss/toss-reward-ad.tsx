'use client';

import type { ReactNode } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onRewardEarned: () => void;
  adGroupId?: string;
  title?: string;
  description?: ReactNode;
  rewardSuccessTitle?: string;
  rewardSuccessDescription?: string;
};

export default function TossRewardAdModal({ isOpen, onClose, onRewardEarned, title }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-slate-900 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">{title || '보상 받기'}</h2>
        <p className="mb-6 text-sm">보상을 받고 계속 플레이하세요.</p>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2">닫기</button>
          <button type="button" onClick={() => { onRewardEarned(); onClose(); }} className="rounded-lg bg-blue-600 px-4 py-2 text-white">보상 받기</button>
        </div>
      </div>
    </div>
  );
}
