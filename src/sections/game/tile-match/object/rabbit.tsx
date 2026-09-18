import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.rabbit || 1.2;

interface RabbitProps {
  isFrozen?: boolean;
  isSwimming?: boolean;
}

export default function Rabbit({ isFrozen = false, isSwimming = false }: RabbitProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none ${
        isSwimming ? 'animate-swim-eopu' : ''
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Long Floppy Rabbit Ears */}
        {/* Left Ear */}
        <ellipse
          cx="34"
          cy="22"
          rx="8"
          ry="21"
          transform="rotate(-12 34 22)"
          fill={isFrozen ? '#E2E8F0' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3.5"
        />
        <ellipse
          cx="34"
          cy="23"
          rx="5"
          ry="16"
          transform="rotate(-12 34 23)"
          fill={isFrozen ? '#CBD5E1' : '#FBCFE8'}
        />

        {/* Right Ear */}
        <ellipse
          cx="66"
          cy="22"
          rx="8"
          ry="21"
          transform="rotate(12 66 22)"
          fill={isFrozen ? '#E2E8F0' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3.5"
        />
        <ellipse
          cx="66"
          cy="23"
          rx="5"
          ry="16"
          transform="rotate(12 66 23)"
          fill={isFrozen ? '#CBD5E1' : '#FBCFE8'}
        />

        {/* Fluffy Round Cheeks/Head */}
        <ellipse
          cx="50"
          cy="58"
          rx="27"
          ry="23"
          fill={isFrozen ? '#E2E8F0' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3.5"
        />

        {/* Big Sparkling Kawaii Eyes */}
        <ellipse cx="36" cy="52" rx="4.8" ry="6" fill="#221C14" />
        <circle cx="37.5" cy="49.5" r="2.2" fill="#FFFFFF" />
        <circle cx="34.5" cy="54.5" r="1.1" fill="#FFFFFF" />
        <circle cx="37.8" cy="55" r="0.6" fill="#FFFFFF" />

        <ellipse cx="64" cy="52" rx="4.8" ry="6" fill="#221C14" />
        <circle cx="65.5" cy="49.5" r="2.2" fill="#FFFFFF" />
        <circle cx="62.5" cy="54.5" r="1.1" fill="#FFFFFF" />
        <circle cx="65.8" cy="55" r="0.6" fill="#FFFFFF" />

        {/* Soft Pink Cheek Blushes */}
        <ellipse
          cx="27"
          cy="61"
          rx="5.5"
          ry="3.8"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
          opacity={isFrozen ? 0.4 : 0.8}
        />
        <ellipse
          cx="73"
          cy="61"
          rx="5.5"
          ry="3.8"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
          opacity={isFrozen ? 0.4 : 0.8}
        />

        {/* Cute Triangular Pink Nose */}
        <polygon points="47,59 53,59 50,62.5" fill={isFrozen ? '#94A3B8' : '#F472B6'} />

        {/* Cute Rabbit W-Mouth */}
        <path
          d="M 45 64 Q 47.5 67 50 63.5 Q 52.5 67 55 64"
          fill="none"
          stroke="#221C14"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Whiskers */}
        <line
          x1="14"
          y1="59"
          x2="24"
          y2="61"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="13"
          y1="65"
          x2="23"
          y2="65"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="15"
          y1="71"
          x2="25"
          y2="69"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <line
          x1="86"
          y1="59"
          x2="76"
          y2="61"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="87"
          y1="65"
          x2="77"
          y2="65"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="85"
          y1="71"
          x2="75"
          y2="69"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Swimming Water Ripple and Splash Effects */}
        {isSwimming && (
          <g>
            <ellipse
              cx="50"
              cy="76"
              rx="38"
              ry="13"
              fill="#38bdf8"
              fillOpacity="0.4"
              stroke="#0284c7"
              strokeWidth="2"
              className="animate-ripple-expand"
            />
            <ellipse
              cx="50"
              cy="75"
              rx="28"
              ry="9"
              fill="#bae6fd"
              fillOpacity="0.6"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="animate-ripple-expand"
            />
            <circle cx="20" cy="73" r="3.5" fill="#ffffff" opacity="0.9" />
            <circle cx="80" cy="73" r="3.5" fill="#ffffff" opacity="0.9" />
            <path
              d="M 16 63 C 16 60 19 58 19 63 C 19 66 16 66 16 63 Z"
              fill="#38bdf8"
              className="animate-splash-drop-l"
            />
            <path
              d="M 84 63 C 84 60 81 58 81 63 C 81 66 84 66 84 63 Z"
              fill="#38bdf8"
              className="animate-splash-drop-r"
            />
          </g>
        )}
      </svg>
    </div>
  );
}
