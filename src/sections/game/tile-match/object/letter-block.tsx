import React from 'react';

import { OBJECT_SCALES } from './constants';

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.letterBlock;

interface LetterBlockProps {
  letter: string;
  active: boolean;
}

// 알파벳별 과일/채소 느낌 색상 팔레트
const LETTER_COLORS: Record<string, { bg: string; dark: string; blush: string; flower: string }> = {
  A: { bg: '#FF8A65', dark: '#D84315', blush: '#FFCCBC', flower: '#FFE0B2' }, // 감귤빛
  B: { bg: '#AED581', dark: '#689F38', blush: '#DCEDC8', flower: '#F1F8E9' }, // 참외빛 연두
  C: { bg: '#FFD54F', dark: '#F9A825', blush: '#FFF9C4', flower: '#FFFDE7' }, // 레몬빛 노랑
  D: { bg: '#F48FB1', dark: '#C2185B', blush: '#F8BBD0', flower: '#FCE4EC' }, // 복숭아빛 핑크
  E: { bg: '#80CBC4', dark: '#00897B', blush: '#B2DFDB', flower: '#E0F2F1' }, // 수박빛 청록
};

export default function LetterBlock({ letter, active }: LetterBlockProps) {
  const upperLetter = letter.toUpperCase();
  const colors = LETTER_COLORS[upperLetter] ?? LETTER_COLORS.A;

  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none transition-all duration-300 ${
        active ? '' : 'grayscale opacity-50'
      }`}
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {/* Small flower decoration on top */}
        {/* Petals */}
        <circle cx="44" cy="16" r="5" fill={colors.flower} stroke="#221C14" strokeWidth="2" />
        <circle cx="56" cy="16" r="5" fill={colors.flower} stroke="#221C14" strokeWidth="2" />
        <circle cx="47" cy="10" r="5" fill={colors.flower} stroke="#221C14" strokeWidth="2" />
        <circle cx="53" cy="10" r="5" fill={colors.flower} stroke="#221C14" strokeWidth="2" />
        {/* Flower center */}
        <circle cx="50" cy="14" r="4" fill={colors.bg} stroke="#221C14" strokeWidth="2" />

        {/* Small stem */}
        <path
          d="M 50 18 Q 49 22, 50 24"
          fill="none"
          stroke="#689F38"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Main body - rounded square badge shape */}
        <rect
          x="14"
          y="26"
          width="72"
          height="68"
          rx="20"
          fill={colors.bg}
          stroke="#221C14"
          strokeWidth="4"
        />

        {/* Inner lighter border */}
        <rect
          x="22"
          y="34"
          width="56"
          height="52"
          rx="14"
          fill="none"
          stroke={colors.blush}
          strokeWidth="2"
          opacity="0.5"
        />

        {/* Letter text */}
        <text
          x="50"
          y="66"
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize="40"
          fontWeight="900"
          stroke="#221C14"
          strokeWidth="3"
          paintOrder="stroke"
          fontFamily="'Arial Rounded MT Bold', 'Nunito', sans-serif"
        >
          {upperLetter}
        </text>

        {/* Blush spots */}
        <circle cx="24" cy="75" r="5" fill={colors.dark} opacity="0.3" />
        <circle cx="76" cy="75" r="5" fill={colors.dark} opacity="0.3" />

        {/* Highlight */}
        <path
          d="M 24 40 A 20 20 0 0 1 34 30"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    </div>
  );
}
