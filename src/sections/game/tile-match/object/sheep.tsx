import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.sheep || 1.2;

interface SheepProps {
  isFrozen?: boolean;
  isSwimming?: boolean;
}

export default function Sheep({ isFrozen = false, isSwimming = false }: SheepProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none ${
        isSwimming ? 'animate-swim-eopu' : ''
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Stubby Legs at Bottom (Only on land) */}
        {!isSwimming && (
          <>
            <rect
              x="37"
              y="78"
              width="8"
              height="10"
              rx="4"
              fill={isFrozen ? '#334155' : '#221C14'}
              stroke="#221C14"
              strokeWidth="2.5"
            />
            <rect
              x="55"
              y="78"
              width="8"
              height="10"
              rx="4"
              fill={isFrozen ? '#334155' : '#221C14'}
              stroke="#221C14"
              strokeWidth="2.5"
            />
            {/* Hoof Split Details */}
            <line
              x1="41"
              y1="83"
              x2="41"
              y2="87"
              stroke={isFrozen ? '#64748B' : '#4A3E3D'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="59"
              y1="83"
              x2="59"
              y2="87"
              stroke={isFrozen ? '#64748B' : '#4A3E3D'}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </>
        )}

        {/* Fluffy Tail */}
        <ellipse
          cx="82"
          cy="62"
          rx="6.5"
          ry="5.5"
          fill={isFrozen ? '#CBD5E1' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3"
        />

        {/* Fluffy Cotton-Ball Body / Outer Wool Cloud */}
        <path
          d="M 50 14 C 57 14 63 16 67 21 C 75 19 82 25 84 33 C 91 38 94 48 91 56 C 94 65 89 75 80 77 C 74 83 65 85 58 84 C 53 87 47 87 42 84 C 35 85 26 83 20 77 C 11 75 6 65 9 56 C 6 48 9 38 16 33 C 18 25 25 19 33 21 C 37 16 43 14 50 14 Z"
          fill={isFrozen ? '#E2E8F0' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Soft Inner Wool Shading Puffs */}
        <circle cx="28" cy="30" r="7" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="72" cy="30" r="7" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="19" cy="50" r="8" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="81" cy="50" r="8" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="28" cy="70" r="7" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="72" cy="70" r="7" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />
        <circle cx="50" cy="75" r="8" fill={isFrozen ? '#CBD5E1' : '#F8FAFC'} opacity="0.8" />

        {/* Cute Droopy Ears */}
        {/* Left Ear */}
        <ellipse
          cx="24"
          cy="48"
          rx="10"
          ry="6"
          transform="rotate(25 24 48)"
          fill={isFrozen ? '#64748B' : '#221C14'}
          stroke="#221C14"
          strokeWidth="2.5"
        />
        <ellipse
          cx="24"
          cy="48"
          rx="6"
          ry="3"
          transform="rotate(25 24 48)"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
        />

        {/* Right Ear */}
        <ellipse
          cx="76"
          cy="48"
          rx="10"
          ry="6"
          transform="rotate(-25 76 48)"
          fill={isFrozen ? '#64748B' : '#221C14'}
          stroke="#221C14"
          strokeWidth="2.5"
        />
        <ellipse
          cx="76"
          cy="48"
          rx="6"
          ry="3"
          transform="rotate(-25 76 48)"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
        />

        {/* Chibi Sheep Face (Dark Cocoa Brown) */}
        <ellipse
          cx="50"
          cy="52"
          rx="22"
          ry="19"
          fill={isFrozen ? '#64748B' : '#221C14'}
          stroke="#221C14"
          strokeWidth="3"
        />

        {/* Cute Forehead Wool Bangs (White Cloud) */}
        <path
          d="M 38 38 C 36 32 42 28 47 30 C 50 26 56 26 59 30 C 64 28 70 32 68 38 C 66 43 60 44 50 44 C 40 44 34 43 38 38 Z"
          fill={isFrozen ? '#CBD5E1' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="44" cy="34" r="4.5" fill={isFrozen ? '#CBD5E1' : '#FFFFFF'} />
        <circle cx="56" cy="34" r="4.5" fill={isFrozen ? '#CBD5E1' : '#FFFFFF'} />

        {/* Soft Pink Cheek Blushes on Dark Face */}
        <circle
          cx="34"
          cy="55"
          r="5.5"
          fill={isFrozen ? '#93C5FD' : '#FB7185'}
          opacity={isFrozen ? 0.4 : 0.8}
        />
        <circle
          cx="66"
          cy="55"
          r="5.5"
          fill={isFrozen ? '#93C5FD' : '#FB7185'}
          opacity={isFrozen ? 0.4 : 0.8}
        />

        {/* Big Sparkling Kawaii Eyes */}
        {/* Left Eye */}
        <ellipse cx="40" cy="49" rx="4.5" ry="5.5" fill="#FFFFFF" />
        <circle cx="41" cy="49" r="3.2" fill="#221C14" />
        <circle cx="42" cy="47.5" r="1.5" fill="#FFFFFF" />
        <circle cx="39.5" cy="51" r="0.7" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="60" cy="49" rx="4.5" ry="5.5" fill="#FFFFFF" />
        <circle cx="59" cy="49" r="3.2" fill="#221C14" />
        <circle cx="60" cy="47.5" r="1.5" fill="#FFFFFF" />
        <circle cx="57.5" cy="51" r="0.7" fill="#FFFFFF" />

        {/* Tiny Pink Triangular Nose */}
        <polygon points="47.5,58 52.5,58 50,61" fill={isFrozen ? '#94A3B8' : '#F472B6'} />

        {/* Cute Y-Mouth */}
        <path
          d="M 50 61 L 50 63.5 M 46.5 64 Q 50 66.5 53.5 64"
          fill="none"
          stroke={isFrozen ? '#CBD5E1' : '#FCE7F3'}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Frozen Sparkle Accent */}
        {isFrozen && (
          <g transform="translate(74, 22) scale(0.6)">
            <path
              d="M 0 -8 L 0 8 M -8 0 L 8 0 M -5 -5 L 5 5 M -5 5 L 5 -5"
              stroke="#93C5FD"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* Swimming Water Ripple and Splash Effects */}
        {isSwimming && (
          <g>
            <ellipse
              cx="50"
              cy="78"
              rx="40"
              ry="14"
              fill="#38bdf8"
              fillOpacity="0.4"
              stroke="#0284c7"
              strokeWidth="2"
              className="animate-ripple-expand"
            />
            <ellipse
              cx="50"
              cy="77"
              rx="30"
              ry="9"
              fill="#bae6fd"
              fillOpacity="0.6"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="animate-ripple-expand"
            />
            <circle cx="18" cy="74" r="3.5" fill="#ffffff" opacity="0.9" />
            <circle cx="82" cy="74" r="3.5" fill="#ffffff" opacity="0.9" />
            <path
              d="M 14 64 C 14 61 17 59 17 64 C 17 67 14 67 14 64 Z"
              fill="#38bdf8"
              className="animate-splash-drop-l"
            />
            <path
              d="M 86 64 C 86 61 83 59 83 64 C 83 67 86 67 86 64 Z"
              fill="#38bdf8"
              className="animate-splash-drop-r"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
