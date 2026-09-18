'use client';

import { useEffect } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onAdCompleted?: () => void;
  adGroupId?: string;
  showIntro?: boolean;
  introTitle?: string;
  introDescription?: React.ReactNode;
  ignoreCooldown?: boolean;
  stage?: number;
};

export default function TossInterstitialAd({ isOpen, onClose, onAdCompleted }: Props) {
  useEffect(() => {
    if (isOpen) {
      onAdCompleted?.();
      onClose();
    }
  }, [isOpen, onAdCompleted, onClose]);
  return null;
}
