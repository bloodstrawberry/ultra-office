'use client';

import type { Bullet as BulletType } from '../utils/types';

import React, { useState, useEffect } from 'react';

export interface BulletProps {
  bullet: BulletType;
  W: number;
  H: number;
}

export function Bullet({ bullet, W, H }: BulletProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 20);
    return () => clearTimeout(timer);
  }, []);

  const startLeft = ((bullet.startX + 0.5) / W) * 100;
  const targetLeft = ((bullet.targetX + 0.5) / W) * 100;
  const currentLeft = mounted ? targetLeft : startLeft;
  const top = ((bullet.startY + 0.5) / H) * 100;

  return (
    <div
      className="absolute z-30 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
      style={{
        left: `${currentLeft}%`,
        top: `${top}%`,
        transition: 'left 300ms linear',
        width: '24px',
        height: '12px',
      }}
    >
      <svg className={`w-full h-full ${bullet.dir === -1 ? 'rotate-180' : ''}`} viewBox="0 0 24 12">
        <defs>
          <linearGradient id="bulletGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(251, 191, 36, 0)" />
            <stop offset="50%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#fbbf24" />
          </linearGradient>
        </defs>
        <path d="M 0 6 L 16 2 L 20 6 L 16 10 Z" fill="url(#bulletGrad)" />
        <circle cx="20" cy="6" r="3" fill="#ffffff" />
      </svg>
    </div>
  );
}

export default Bullet;
