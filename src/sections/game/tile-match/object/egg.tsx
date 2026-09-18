import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.egg || 1.1;

export default function Egg() {
  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* === Straw Nest (Behind Egg) === */}
        {/* Nest Base - woven straw bowl shape */}
        <ellipse cx="50" cy="78" rx="38" ry="14" fill="#D4A034" stroke="#221C14" strokeWidth="3" />
        {/* Inner nest shadow/depth */}
        <ellipse cx="50" cy="76" rx="32" ry="10" fill="#B8860B" opacity="0.5" />

        {/* Left straw wisps sticking out */}
        <path
          d="M 14 72 Q 8 64 6 58"
          fill="none"
          stroke="#D4A034"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 18 70 Q 10 60 12 52"
          fill="none"
          stroke="#C4922A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 16 74 Q 6 68 4 64"
          fill="none"
          stroke="#B8860B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right straw wisps sticking out */}
        <path
          d="M 86 72 Q 92 64 94 58"
          fill="none"
          stroke="#D4A034"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 82 70 Q 90 60 88 52"
          fill="none"
          stroke="#C4922A"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 84 74 Q 94 68 96 64"
          fill="none"
          stroke="#B8860B"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* === Egg Body (Nestled in straw) === */}
        <path
          d="M 50 16 C 32 16 22 36 22 56 C 22 72 34 78 50 78 C 66 78 78 72 78 56 C 78 36 68 16 50 16 Z"
          fill="#FFFBEB"
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Golden / Warm Spots on Egg */}
        <circle cx="36" cy="38" r="4" fill="#FDE68A" opacity="0.8" />
        <circle cx="62" cy="48" r="5" fill="#FDE68A" opacity="0.8" />
        <circle cx="42" cy="64" r="3.5" fill="#FDE68A" opacity="0.8" />

        {/* Shine Highlight on Egg */}
        <path
          d="M 33 28 A 18 18 0 0 1 45 22"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.8"
        />
        <circle cx="35" cy="32" r="1.5" fill="#FFFFFF" opacity="0.7" />

        {/* === Front Straw Wisps (In front of Egg) === */}
        {/* Front straw pieces overlapping the egg bottom to show nesting */}
        <path
          d="M 20 74 Q 35 68 50 70 Q 65 68 80 74"
          fill="none"
          stroke="#D4A034"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 24 72 Q 38 66 48 68"
          fill="none"
          stroke="#C4922A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 52 68 Q 62 66 76 72"
          fill="none"
          stroke="#C4922A"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Small straw bits at the egg base */}
        <path
          d="M 28 76 Q 32 72 36 74"
          fill="none"
          stroke="#B8860B"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M 64 74 Q 68 72 72 76"
          fill="none"
          stroke="#B8860B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
