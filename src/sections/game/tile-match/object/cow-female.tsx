import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.cowFemale || 1.2;

interface CowFemaleProps {
  isFrozen?: boolean;
  isSwimming?: boolean;
}

export default function CowFemale({ isFrozen = false, isSwimming = false }: CowFemaleProps) {
  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none ${
        isSwimming ? 'animate-swim-eopu' : ''
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Rounded Cute Horns */}
        <path
          d="M 32 28 C 27 23 24 16 26 14 C 28 12 33 16 39 23 Z"
          fill={isFrozen ? '#CBD5E1' : '#F59E0B'}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M 68 28 C 73 23 76 16 74 14 C 72 12 67 16 61 23 Z"
          fill={isFrozen ? '#CBD5E1' : '#F59E0B'}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Ears */}
        {/* Left Ear */}
        <ellipse
          cx="19"
          cy="46"
          rx="8.5"
          ry="5.5"
          transform="rotate(-20 19 46)"
          fill={isFrozen ? '#E2E8F0' : '#FCE7F3'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <ellipse
          cx="19"
          cy="46"
          rx="5"
          ry="3"
          transform="rotate(-20 19 46)"
          fill={isFrozen ? '#CBD5E1' : '#F472B6'}
        />

        {/* Right Ear */}
        <ellipse
          cx="81"
          cy="46"
          rx="8.5"
          ry="5.5"
          transform="rotate(20 81 46)"
          fill={isFrozen ? '#E2E8F0' : '#FCE7F3'}
          stroke="#221C14"
          strokeWidth="3"
        />
        <ellipse
          cx="81"
          cy="46"
          rx="5"
          ry="3"
          transform="rotate(20 81 46)"
          fill={isFrozen ? '#CBD5E1' : '#F472B6'}
        />

        {/* Chibi Cow Head Body (Soft Pink) */}
        <ellipse
          cx="50"
          cy="53"
          rx="29"
          ry="25"
          fill={isFrozen ? '#E2E8F0' : '#FDF2F8'}
          stroke="#221C14"
          strokeWidth="3.5"
        />

        {/* Strawberry Milk Pink Spots */}
        <path
          d="M 23 44 C 23 35 34 32 39 38 C 42 46 33 53 26 50 C 23 48 23 46 23 44 Z"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
        />
        <path
          d="M 64 33 C 73 30 78 38 74 45 C 68 48 62 42 63 36 C 63 34 64 33 64 33 Z"
          fill={isFrozen ? '#94A3B8' : '#F472B6'}
        />

        {/* Cute Blushing Cheeks */}
        <circle cx="27" cy="55" r="5.5" fill={isFrozen ? '#94A3B8' : '#FB7185'} opacity="0.6" />
        <circle cx="73" cy="55" r="5.5" fill={isFrozen ? '#94A3B8' : '#FB7185'} opacity="0.6" />

        {/* Chubby Muzzle Snout (Cream White) */}
        <ellipse
          cx="50"
          cy="67"
          rx="18"
          ry="12"
          fill={isFrozen ? '#F1F5F9' : '#FFFFFF'}
          stroke="#221C14"
          strokeWidth="3"
        />

        {/* Nostrils */}
        <ellipse cx="44" cy="65" rx="2.2" ry="3.2" fill={isFrozen ? '#64748B' : '#DB2777'} />
        <ellipse cx="56" cy="65" rx="2.2" ry="3.2" fill={isFrozen ? '#64748B' : '#DB2777'} />

        {/* Cute W-shaped Mouth */}
        <path
          d="M 45 70 Q 50 74 55 70"
          fill="none"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Sparkling Big Kawaii Eyes with Eyelashes */}
        <ellipse cx="37" cy="46" rx="4.5" ry="5.5" fill="#221C14" />
        <circle cx="38.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="35.5" cy="48.5" r="1" fill="#FFFFFF" />
        {/* Left Eyelashes */}
        <path
          d="M 32 42 L 29 39 M 35 39 L 34 36"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        <ellipse cx="63" cy="46" rx="4.5" ry="5.5" fill="#221C14" />
        <circle cx="64.5" cy="44" r="2" fill="#FFFFFF" />
        <circle cx="61.5" cy="48.5" r="1" fill="#FFFFFF" />
        {/* Right Eyelashes */}
        <path
          d="M 68 42 L 71 39 M 65 39 L 66 36"
          stroke="#221C14"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Cute Pink Bow on Head between Horns */}
        <g transform="translate(50, 27)">
          <path
            d="M -2 2 L -5 8 L -1 6.5 L 0 2"
            fill={isFrozen ? '#64748B' : '#DB2777'}
            stroke="#221C14"
            strokeWidth="1.5"
          />
          <path
            d="M 2 2 L 5 8 L 1 6.5 L 0 2"
            fill={isFrozen ? '#64748B' : '#DB2777'}
            stroke="#221C14"
            strokeWidth="1.5"
          />
          {/* Left Bow Loop */}
          <ellipse
            cx="-7"
            cy="-2"
            rx="6.5"
            ry="4.5"
            transform="rotate(-15 -7 -2)"
            fill={isFrozen ? '#94A3B8' : '#EC4899'}
            stroke="#221C14"
            strokeWidth="1.8"
          />
          {/* Right Bow Loop */}
          <ellipse
            cx="7"
            cy="-2"
            rx="6.5"
            ry="4.5"
            transform="rotate(15 7 -2)"
            fill={isFrozen ? '#94A3B8' : '#EC4899'}
            stroke="#221C14"
            strokeWidth="1.8"
          />
          {/* Center Knot */}
          <circle
            cx="0"
            cy="-1"
            r="3.2"
            fill={isFrozen ? '#CBD5E1' : '#F472B6'}
            stroke="#221C14"
            strokeWidth="1.8"
          />
        </g>

        {/* Female Symbol Badge ♀ */}
        <text
          x="76"
          y="26"
          fontSize="16"
          fontWeight="900"
          fill={isFrozen ? '#64748B' : '#EC4899'}
          stroke="#FFFFFF"
          strokeWidth="1"
        >
          ♀
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
