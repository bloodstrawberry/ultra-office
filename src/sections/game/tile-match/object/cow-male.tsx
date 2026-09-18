import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.cowMale || 1.2;

interface CowMaleProps {
  isFrozen?: boolean;
  isSwimming?: boolean;
}

export default function CowMale({ isFrozen = false, isSwimming = false }: CowMaleProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none ${
        isSwimming ? 'animate-swim-eopu' : ''
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Cute Rounded Horns */}
        <path
          d="M 33 28 C 29 18 33 13 38 15 C 41 19 40 24 39 28 Z"
          fill={isFrozen ? '#94A3B8' : '#F59E0B'}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 67 28 C 71 18 67 13 62 15 C 59 19 60 24 61 28 Z"
          fill={isFrozen ? '#94A3B8' : '#F59E0B'}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Cute Small Ears */}
        <ellipse
          cx="20"
          cy="44"
          rx="8"
          ry="5"
          transform="rotate(-20 20 44)"
          fill={isFrozen ? '#E2E8F0' : '#E0F2FE'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <ellipse
          cx="20"
          cy="44"
          rx="4.5"
          ry="2.5"
          transform="rotate(-20 20 44)"
          fill={isFrozen ? '#CBD5E1' : '#BAE6FD'}
        />
        <ellipse
          cx="80"
          cy="57"
          rx="8"
          ry="5"
          transform="rotate(20 80 44)"
          fill={isFrozen ? '#E2E8F0' : '#E0F2FE'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <ellipse
          cx="80"
          cy="44"
          rx="4.5"
          ry="2.5"
          transform="rotate(20 80 44)"
          fill={isFrozen ? '#CBD5E1' : '#BAE6FD'}
        />

        {/* Chibi Cow Head Body (Sky Blue) */}
        <ellipse
          cx="50"
          cy="53"
          rx="29"
          ry="25"
          fill={isFrozen ? '#E2E8F0' : '#E0F2FE'}
          stroke="#221C14"
          strokeWidth="3.5"
        />

        {/* Darker Blue Rounded Spots */}
        <path
          d="M 24 45 C 24 36 34 33 39 39 C 41 47 34 53 27 51 C 24 49 24 47 24 45 Z"
          fill={isFrozen ? '#94A3B8' : '#3B82F6'}
        />
        <path
          d="M 63 34 C 72 31 77 39 73 46 C 67 49 61 43 62 37 C 62 35 63 34 63 34 Z"
          fill={isFrozen ? '#94A3B8' : '#3B82F6'}
        />

        {/* Cute Blue Cheeks */}
        <circle cx="27" cy="55" r="5" fill={isFrozen ? '#94A3B8' : '#93C5FD'} opacity="0.6" />
        <circle cx="73" cy="55" r="5" fill={isFrozen ? '#94A3B8' : '#93C5FD'} opacity="0.6" />

        {/* Chubby Muzzle Snout (Cream/White) */}
        <ellipse
          cx="50"
          cy="67"
          rx="18"
          ry="12"
          fill={isFrozen ? '#F1F5F9' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3"
        />
        {/* Cute Nostrils */}
        <ellipse cx="44" cy="65" rx="2.2" ry="3.2" fill={isFrozen ? '#64748B' : '#2563EB'} />
        <ellipse cx="56" cy="65" rx="2.2" ry="3.2" fill={isFrozen ? '#64748B' : '#2563EB'} />
        {/* Happy Smile */}
        <path
          d="M 45 71 Q 50 75 55 71"
          fill="none"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Big Sparkling Kawaii Eyes */}
        <ellipse cx="37" cy="46" rx="4.5" ry="5.5" fill="#221C14" />
        <circle cx="38.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="35.5" cy="48.5" r="1" fill="#FFFFFF" />

        <ellipse cx="63" cy="46" rx="4.5" ry="5.5" fill="#221C14" />
        <circle cx="64.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="61.5" cy="48.5" r="1" fill="#FFFFFF" />

        {/* Small Blue Bowtie at Chin */}
        <g transform="translate(50, 77)">
          <polygon
            points="0,0 -10,-6 -10,6"
            fill={isFrozen ? '#64748B' : '#2563EB'}
            stroke="#221C14"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="0,0 10,-6 10,6"
            fill={isFrozen ? '#64748B' : '#2563EB'}
            stroke="#221C14"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <circle
            cx="0"
            cy="0"
            r="3.2"
            fill={isFrozen ? '#94A3B8' : '#3B82F6'}
            stroke="#221C14"
            strokeWidth="1.8"
          />
          <circle cx="-0.8" cy="-0.8" r="1" fill={isFrozen ? '#CBD5E1' : '#93C5FD'} />
        </g>

        {/* Male Symbol Badge ♂ */}
        <text
          x="76"
          y="24"
          fontSize="16"
          fontWeight="900"
          fill={isFrozen ? '#64748B' : '#2563EB'}
          stroke="#FFFFFF"
          strokeWidth="1.2"
        >
          ♂
        </text>

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
              rx="29"
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
