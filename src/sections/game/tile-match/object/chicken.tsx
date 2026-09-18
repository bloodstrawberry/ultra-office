import React from 'react';

import { OBJECT_SCALES } from './constants';

const SCALE = OBJECT_SCALES.chicken || 1.2;

export type ChickenDirection = 'up' | 'down' | 'left' | 'right';

interface ChickenProps {
  isFrozen?: boolean;
  direction?: ChickenDirection;
  isSwimming?: boolean;
}

export default function Chicken({
  isFrozen = false,
  direction = 'down',
  isSwimming = false,
}: ChickenProps) {
  const bodyColor = isFrozen ? '#E5E7D8' : '#FACC15';
  const wingColor = isFrozen ? '#D1D5DB' : '#FBBF24';
  const combColor = isFrozen ? '#E11D48' : '#EF4444';
  const beakColor = isFrozen ? '#FB923C' : '#F97316';
  const featherStroke = isFrozen ? '#CBD5E1' : '#EAB308';

  // Common water ripples & splash overlay for swimming mode
  const renderWaterRipples = (offsetX = 0, offsetY = 0) => (
    <g transform={`translate(${offsetX}, ${offsetY})`}>
      {/* Outer ripple ring */}
      <ellipse
        cx="50"
        cy="76"
        rx="36"
        ry="13"
        fill="#38bdf8"
        fillOpacity="0.4"
        stroke="#0284c7"
        strokeWidth="2"
        className="animate-ripple-expand"
      />
      {/* Inner bright ripple */}
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
      {/* White water splash bubbles & foam */}
      <circle cx="22" cy="73" r="3.5" fill="#ffffff" opacity="0.9" />
      <circle cx="16" cy="69" r="2.2" fill="#ffffff" opacity="0.8" />
      <circle cx="78" cy="73" r="3.5" fill="#ffffff" opacity="0.9" />
      <circle cx="84" cy="69" r="2.2" fill="#ffffff" opacity="0.8" />
      {/* Droplets splashing up */}
      <path
        d="M 18 64 C 18 61 21 59 21 64 C 21 67 18 67 18 64 Z"
        fill="#38bdf8"
        className="animate-splash-drop-l"
      />
      <path
        d="M 82 64 C 82 61 79 59 79 64 C 79 67 82 67 82 64 Z"
        fill="#38bdf8"
        className="animate-splash-drop-r"
      />
    </g>
  );

  // 1. FRONT VIEW (Down - 앞모습 / 앞 수영)
  const renderFrontView = () => (
    <>
      {/* Swimming Water Background if in water */}
      {isSwimming && renderWaterRipples(0, 4)}

      {/* Feet (Only if walking on ground) */}
      {!isSwimming && (
        <>
          <path
            d="M 41 81 L 41 87 M 37 86 L 41 87 L 45 86"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 59 81 L 59 87 M 55 86 L 59 87 L 63 86"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </>
      )}

      {/* Comb */}
      <path
        d="M 42 27 C 40 21 44 18 47 21 C 49 16 55 16 57 21 C 60 18 64 21 62 27 Z"
        fill={combColor}
        stroke="#221C14"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Body */}
      <circle
        cx="50"
        cy={isSwimming ? 52 : 55}
        r="29"
        fill={bodyColor}
        stroke="#221C14"
        strokeWidth="3.5"
      />

      {/* Belly Highlight */}
      <ellipse
        cx="50"
        cy={isSwimming ? 60 : 63}
        rx="20"
        ry="16"
        fill={isFrozen ? '#F1F5F9' : '#FEF08A'}
        opacity="0.6"
      />

      {/* Wings - Paddling vigorously when swimming! */}
      {isSwimming ? (
        <>
          <ellipse
            cx="17"
            cy="48"
            rx="8"
            ry="12"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
            className="animate-paddle-wing-l"
          />
          <ellipse
            cx="83"
            cy="48"
            rx="8"
            ry="12"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
            className="animate-paddle-wing-r"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="22"
            cy="57"
            rx="6.5"
            ry="10"
            transform="rotate(18 22 57)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
          <ellipse
            cx="78"
            cy="57"
            rx="6.5"
            ry="10"
            transform="rotate(-18 78 57)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
        </>
      )}

      {/* Wattle */}
      <ellipse
        cx="50"
        cy={isSwimming ? 58 : 61}
        rx="2.5"
        ry="3.5"
        fill={combColor}
        stroke="#221C14"
        strokeWidth="2"
      />

      {/* Beak - slightly open when swimming/gasping for air ("어푸어푸") */}
      {isSwimming ? (
        <>
          <polygon
            points="46,47 54,47 50,55"
            fill={beakColor}
            stroke="#221C14"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Gasping bubble */}
          <circle cx="56" cy="44" r="2.5" fill="#bae6fd" opacity="0.8" />
        </>
      ) : (
        <polygon
          points="46,52 54,52 50,58"
          fill={beakColor}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Cheek Blushes */}
      <circle cx="30" cy={isSwimming ? 54 : 57} r="5.5" fill="#FDBA74" opacity="0.6" />
      <circle cx="70" cy={isSwimming ? 54 : 57} r="5.5" fill="#FDBA74" opacity="0.6" />

      {/* Big Sparkling Eyes */}
      <circle cx="37" cy={isSwimming ? 46 : 49} r="5" fill="#221C14" />
      <circle cx="38.5" cy={isSwimming ? 44.5 : 47.5} r="1.8" fill="#FFFFFF" />
      <circle cx="35.5" cy={isSwimming ? 47.8 : 50.8} r="0.8" fill="#FFFFFF" />

      <circle cx="63" cy={isSwimming ? 46 : 49} r="5" fill="#221C14" />
      <circle cx="64.5" cy={isSwimming ? 44.5 : 47.5} r="1.8" fill="#FFFFFF" />
      <circle cx="61.5" cy={isSwimming ? 47.8 : 50.8} r="0.8" fill="#FFFFFF" />

      {/* Foreground splash ring over body when swimming */}
      {isSwimming && (
        <path d="M 26 73 Q 50 82 74 73 Q 50 78 26 73 Z" fill="#ffffff" opacity="0.85" />
      )}
    </>
  );

  // 2. BACK VIEW (Up - 뒷모습 / 뒤로 수영)
  const renderBackView = () => (
    <>
      {/* Swimming Water Background if in water */}
      {isSwimming && renderWaterRipples(0, 6)}

      {/* Feet (Only if walking on ground) */}
      {!isSwimming && (
        <>
          <path
            d="M 41 81 L 41 87 M 38 87 L 41 87 L 44 87"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 59 81 L 59 87 M 56 87 L 59 87 L 62 87"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Comb (Back View) */}
      <path
        d="M 43 28 C 41 22 45 19 48 22 C 50 17 56 17 58 22 C 61 19 65 22 63 28 Z"
        fill={combColor}
        stroke="#221C14"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Fluffy Tail Feathers sticking up at back */}
      <path
        d="M 38 35 C 34 20 48 16 48 16 C 48 16 52 14 54 22 C 58 18 64 24 60 35 Z"
        fill={isFrozen ? '#F3F4F6' : '#FEF08A'}
        stroke="#221C14"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M 46 22 Q 49 17 52 22"
        fill="none"
        stroke={featherStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Body (Back View) */}
      <circle
        cx="50"
        cy={isSwimming ? 53 : 55}
        r="29"
        fill={bodyColor}
        stroke="#221C14"
        strokeWidth="3.5"
      />

      {/* Back Feather Texture Lines */}
      <path
        d="M 43 45 Q 50 49 57 45"
        fill="none"
        stroke={featherStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 40 56 Q 50 61 60 56"
        fill="none"
        stroke={featherStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M 44 67 Q 50 71 56 67"
        fill="none"
        stroke={featherStroke}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Back Wings - Splashing outward when swimming! */}
      {isSwimming ? (
        <>
          <ellipse
            cx="18"
            cy="50"
            rx="8"
            ry="13"
            transform="rotate(35 18 50)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
          <ellipse
            cx="82"
            cy="50"
            rx="8"
            ry="13"
            transform="rotate(-35 82 50)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <ellipse
            cx="21"
            cy="56"
            rx="7"
            ry="12"
            transform="rotate(-10 21 56)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
          <ellipse
            cx="79"
            cy="56"
            rx="7"
            ry="12"
            transform="rotate(10 79 56)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
        </>
      )}

      {/* Water wake following behind */}
      {isSwimming && (
        <path
          d="M 30 76 Q 50 84 70 76"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </>
  );

  // 3. SIDE VIEW (Right - 옆모습 / 옆으로 수영. Left is flipped with scaleX(-1))
  const renderSideView = () => (
    <>
      {/* Swimming Water Background if in water */}
      {isSwimming && renderWaterRipples(-4, 6)}

      {/* Side Feet (Only if walking) */}
      {!isSwimming && (
        <>
          <path
            d="M 44 81 L 44 87 M 40 86 L 44 87 L 49 86"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 58 81 L 58 87 M 54 86 L 58 87 L 63 86"
            stroke="#221C14"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </>
      )}

      {/* Comb (Side View) */}
      <path
        d="M 40 26 C 37 19 44 16 48 20 C 51 14 58 17 59 22 C 63 19 68 24 62 29 Z"
        fill={combColor}
        stroke="#221C14"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Side Tail Feathers popping out back-left */}
      <path
        d="M 28 45 C 12 36 10 50 18 58 C 10 59 14 70 26 64 Z"
        fill={isFrozen ? '#F3F4F6' : '#FEF08A'}
        stroke="#221C14"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Main Oval Body (Side profile) */}
      <ellipse
        cx="48"
        cy={isSwimming ? 53 : 55}
        rx="28"
        ry="27"
        fill={bodyColor}
        stroke="#221C14"
        strokeWidth="3.5"
      />

      {/* Side Belly Highlight */}
      <ellipse
        cx="54"
        cy={isSwimming ? 60 : 63}
        rx="18"
        ry="14"
        fill={isFrozen ? '#F1F5F9' : '#FEF08A'}
        opacity="0.6"
      />

      {/* Side Wing - Paddling forward & splashing water when swimming! */}
      {isSwimming ? (
        <g>
          <ellipse
            cx="38"
            cy="52"
            rx="12"
            ry="14"
            transform="rotate(-35 38 52)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
          <path
            d="M 33 46 Q 38 55 45 49"
            stroke="#221C14"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      ) : (
        <g>
          <ellipse
            cx="40"
            cy="57"
            rx="10"
            ry="14"
            transform="rotate(-15 40 57)"
            fill={wingColor}
            stroke="#221C14"
            strokeWidth="3"
          />
          <path
            d="M 37 53 Q 41 60 45 56"
            stroke="#221C14"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      )}

      {/* Wattle under Beak */}
      <ellipse
        cx="68"
        cy={isSwimming ? 57 : 60}
        rx="3.5"
        ry="4.5"
        fill={combColor}
        stroke="#221C14"
        strokeWidth="2"
      />

      {/* Side Beak pointing Right */}
      {isSwimming ? (
        <>
          <polygon
            points="68,46 84,51 68,56"
            fill={beakColor}
            stroke="#221C14"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Gasping bubble on side */}
          <circle cx="86" cy="45" r="2.5" fill="#bae6fd" opacity="0.8" />
        </>
      ) : (
        <polygon
          points="68,48 83,54 68,58"
          fill={beakColor}
          stroke="#221C14"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      )}

      {/* Cheek Blush */}
      <circle cx="56" cy={isSwimming ? 54 : 57} r="5" fill="#FDBA74" opacity="0.6" />

      {/* Single Big Side Eye */}
      <circle cx="58" cy={isSwimming ? 45 : 47} r="5" fill="#221C14" />
      <circle cx="59.5" cy={isSwimming ? 43.5 : 45.5} r="1.8" fill="#FFFFFF" />
      <circle cx="56.5" cy={isSwimming ? 46.8 : 48.8} r="0.8" fill="#FFFFFF" />

      {/* Side Water Splash Line */}
      {isSwimming && (
        <path
          d="M 22 74 Q 48 80 76 72"
          fill="none"
          stroke="#ffffff"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </>
  );

  const isLeft = direction === 'left';
  const transformStyle = isLeft ? `scale(${SCALE}) scaleX(-1)` : `scale(${SCALE})`;

  return (
    <div
      className={`w-full h-full flex items-center justify-center pointer-events-none select-none transition-transform duration-300 ${
        isSwimming ? 'animate-swim-eopu' : ''
      }`}
      style={{ transform: transformStyle }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
        {direction === 'up'
          ? renderBackView()
          : direction === 'left' || direction === 'right'
            ? renderSideView()
            : renderFrontView()}
      </svg>
    </div>
  );
}
