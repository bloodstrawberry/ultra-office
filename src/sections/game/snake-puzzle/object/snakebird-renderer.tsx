'use client';

import type { Position, SnakeBird, Direction, BirdColor } from '../game/snakebird-types';

import React from 'react';

export interface SnakebirdRendererProps {
  bird: SnakeBird;
  isActive: boolean;
  isFalling?: boolean;
  isClear?: boolean;
  cellSize: number;
  fruitsRemaining: number;
}

/**
 * Authentic Snakebird color palettes from the original game artwork.
 */
const COLOR_PALETTES: Record<
  BirdColor,
  {
    main: string;
    belly: string;
    feather: string;
    border: string;
  }
> = {
  red: {
    main: '#FF2836', // Vibrant strawberry-cherry red
    belly: '#D61624', // Darker underside
    feather: '#B80E1A', // Deep feather crest
    border: '#960A14',
  },
  green: {
    main: '#44D432', // Lush lime green
    belly: '#2CB01C', // Darker underside
    feather: '#1E8E12',
    border: '#166E0C',
  },
  blue: {
    main: '#1E82F8', // Vibrant royal sky blue
    belly: '#125EC4', // Darker underside
    feather: '#0A469A',
    border: '#063678',
  },
  yellow: {
    main: '#FFC818', // Golden dandelion yellow
    belly: '#E09E0A', // Darker underside
    feather: '#BC7E04',
    border: '#946002',
  },
};

function getRelativeDir(from: Position, to: Position): Direction {
  if (to.x > from.x) return 'right';
  if (to.x < from.x) return 'left';
  if (to.y > from.y) return 'down';
  return 'up';
}

function getConnections(
  segments: Position[],
  idx: number
): { top: boolean; bottom: boolean; left: boolean; right: boolean } {
  const seg = segments[idx];
  const conns = { top: false, bottom: false, left: false, right: false };
  for (let i = 0; i < segments.length; i++) {
    if (i === idx) continue;
    const o = segments[i];
    if (o.x === seg.x && o.y === seg.y - 1) conns.top = true;
    if (o.x === seg.x && o.y === seg.y + 1) conns.bottom = true;
    if (o.x === seg.x - 1 && o.y === seg.y) conns.left = true;
    if (o.x === seg.x + 1 && o.y === seg.y) conns.right = true;
  }
  return conns;
}

export const SnakebirdRenderer: React.FC<SnakebirdRendererProps> = ({
  bird,
  isActive,
  isFalling = false,
  isClear = false,
  cellSize,
}) => {
  if (bird.isExited || bird.segments.length === 0) return null;

  const palette = COLOR_PALETTES[bird.color] || COLOR_PALETTES.red;
  const neck = bird.segments[1];
  const facingDir: Direction =
    bird.facingDir || (neck ? getRelativeDir(neck, bird.segments[0]) : 'right');

  const cs = cellSize;
  const radius = Math.max(8, Math.floor(cs * 0.28));

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 20 }}>
      {/* 1. Continuous Body Connector Bridges */}
      {bird.segments.map((seg, idx) => {
        if (idx === bird.segments.length - 1) return null;
        const next = bird.segments[idx + 1];
        const dx = next.x - seg.x;
        const dy = next.y - seg.y;
        if (Math.abs(dx) + Math.abs(dy) !== 1) return null;

        const bridgePad = 2;
        let bx = Math.min(seg.x, next.x) * cs;
        let by = Math.min(seg.y, next.y) * cs;
        let bw = cs;
        let bh = cs;

        if (dx !== 0) {
          bw = cs * 2;
          by += bridgePad;
          bh -= bridgePad * 2;
        } else {
          bh = cs * 2;
          bx += bridgePad;
          bw -= bridgePad * 2;
        }

        return (
          <div
            key={`bridge-${bird.id}-${idx}`}
            className="absolute overflow-hidden"
            style={{
              left: bx,
              top: by,
              width: bw,
              height: bh,
              backgroundColor: palette.main,
              zIndex: 18,
            }}
          >
            {/* Darker belly band running across the bottom */}
            <div
              className="absolute left-0 right-0 bottom-0"
              style={{
                height: '46%',
                backgroundColor: palette.belly,
              }}
            />
          </div>
        );
      })}

      {/* 2. Individual Segment Blocks (Tail to Head) */}
      {[...bird.segments].reverse().map((seg, revIdx) => {
        const idx = bird.segments.length - 1 - revIdx;
        const isHead = idx === 0;
        const isTail = idx === bird.segments.length - 1;
        const conns = getConnections(bird.segments, idx);

        // Corner rounding
        const tl = !conns.top && !conns.left ? `${radius}px` : '0';
        const tr = !conns.top && !conns.right ? `${radius}px` : '0';
        const br = !conns.bottom && !conns.right ? `${radius}px` : '0';
        const bl = !conns.bottom && !conns.left ? `${radius}px` : '0';

        return (
          <div
            key={`seg-${bird.id}-${idx}`}
            className="absolute"
            style={{
              left: seg.x * cs,
              top: seg.y * cs,
              width: cs,
              height: cs,
              zIndex: isHead ? 25 : 20,
            }}
          >
            {/* Segment Body Block */}
            <div
              className="w-full h-full relative overflow-hidden"
              style={{
                backgroundColor: palette.main,
                borderRadius: `${tl} ${tr} ${br} ${bl}`,
              }}
            >
              {/* Lower Belly Shade */}
              <div
                className="absolute left-0 right-0 bottom-0"
                style={{
                  height: '46%',
                  backgroundColor: palette.belly,
                  borderRadius: `0 0 ${br} ${bl}`,
                }}
              />

              {/* Scalloped tail detail */}
              {isTail && (
                <div
                  className="absolute"
                  style={{
                    width: cs * 0.35,
                    height: cs * 0.35,
                    borderRadius: '50%',
                    backgroundColor: palette.feather,
                    opacity: 0.8,
                    top: '30%',
                    left: conns.right ? '2px' : 'auto',
                    right: conns.left ? '2px' : 'auto',
                  }}
                />
              )}
            </div>

            {/* ─── HEAD FEATURES ─── */}
            {isHead && (
              <>
                {/* Active Indicator Arrow */}
                {isActive && !bird.isDead && (
                  <div
                    className="absolute left-1/2 -translate-x-1/2 animate-bounce pointer-events-none"
                    style={{ top: -cs * 0.35, zIndex: 35 }}
                  >
                    <div
                      style={{
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid transparent',
                        borderRight: '8px solid transparent',
                        borderTop: '11px solid #FFD000',
                        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))',
                      }}
                    />
                  </div>
                )}

                {/* Snakebird Double Feather Tufts on BACK of head */}
                <div
                  className="absolute pointer-events-none flex gap-0.5"
                  style={{
                    top: -cs * 0.22,
                    left: facingDir === 'right' ? '10%' : facingDir === 'left' ? '68%' : '36%',
                    zIndex: 30,
                  }}
                >
                  {/* Left Tuft */}
                  <div
                    style={{
                      width: cs * 0.16,
                      height: cs * 0.28,
                      backgroundColor: palette.feather,
                      borderRadius: '50% 50% 20% 20%',
                      transform: facingDir === 'right' ? 'rotate(-20deg)' : 'rotate(20deg)',
                    }}
                  />
                  {/* Right Tuft */}
                  <div
                    style={{
                      width: cs * 0.18,
                      height: cs * 0.32,
                      backgroundColor: palette.main,
                      borderRadius: '50% 50% 20% 20%',
                      transform:
                        facingDir === 'right'
                          ? 'rotate(10deg) translateY(-2px)'
                          : 'rotate(-10deg) translateY(-2px)',
                    }}
                  />
                </div>

                {/* Side-Profile Eyes: Two white circles side-by-side horizontally */}
                <SnakebirdSideEyes
                  facingDir={facingDir}
                  cellSize={cs}
                  isDead={bird.isDead ?? false}
                  isFalling={isFalling}
                  isClear={isClear}
                />

                {/* Wide Chunky Golden-Orange Beak */}
                <SnakebirdBeak facingDir={facingDir} cellSize={cs} />
              </>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ═══════════════════════════════════════════
   Authentic Side-Profile Eyes Component
   Both eyes placed horizontally side-by-side (row)
   ═══════════════════════════════════════════ */
function SnakebirdSideEyes({
  facingDir,
  cellSize,
  isDead,
  isFalling,
  isClear,
}: {
  facingDir: Direction;
  cellSize: number;
  isDead: boolean;
  isFalling: boolean;
  isClear: boolean;
}) {
  const eyeD = Math.max(9, Math.floor(cellSize * 0.34));
  const pupilD = Math.max(4, Math.floor(eyeD * 0.44));

  // Eyes container is ALWAYS horizontal (row) across the face, positioned towards the facing direction
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 32,
    gap: Math.max(1, Math.floor(cellSize * 0.02)),
  };

  switch (facingDir) {
    case 'right':
      containerStyle.top = cellSize * 0.1;
      containerStyle.right = cellSize * 0.06;
      break;
    case 'left':
      containerStyle.top = cellSize * 0.1;
      containerStyle.left = cellSize * 0.06;
      break;
    case 'up':
      containerStyle.top = cellSize * 0.06;
      containerStyle.left = '50%';
      containerStyle.transform = 'translateX(-50%)';
      break;
    case 'down':
      containerStyle.bottom = cellSize * 0.1;
      containerStyle.left = '50%';
      containerStyle.transform = 'translateX(-50%)';
      break;
    default:
      break;
  }

  if (isDead) {
    return (
      <div style={containerStyle}>
        <div
          className="flex items-center justify-center font-black text-stone-900"
          style={{ width: eyeD, height: eyeD, fontSize: eyeD * 0.7 }}
        >
          ✕
        </div>
        <div
          className="flex items-center justify-center font-black text-stone-900"
          style={{ width: eyeD, height: eyeD, fontSize: eyeD * 0.7 }}
        >
          ✕
        </div>
      </div>
    );
  }

  if (isClear) {
    return (
      <div style={containerStyle}>
        <div
          style={{
            width: eyeD * 0.85,
            height: eyeD * 0.45,
            borderBottom: '3px solid #111',
            borderRadius: '0 0 50% 50%',
          }}
        />
        <div
          style={{
            width: eyeD * 0.85,
            height: eyeD * 0.45,
            borderBottom: '3px solid #111',
            borderRadius: '0 0 50% 50%',
          }}
        />
      </div>
    );
  }

  // Pupils shifted strongly towards the facing direction
  let px = 0;
  let py = 0;
  const shift = pupilD * 0.45;
  if (facingDir === 'right') px = shift;
  if (facingDir === 'left') px = -shift;
  if (facingDir === 'up') py = -shift;
  if (facingDir === 'down') py = shift;

  return (
    <div style={containerStyle}>
      {/* Eye 1 (Back eye) */}
      <div
        className="rounded-full bg-white flex items-center justify-center"
        style={{
          width: eyeD,
          height: eyeD,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="rounded-full bg-[#111111] relative"
          style={{
            width: pupilD,
            height: pupilD,
            transform: `translate(${px}px, ${py}px)`,
          }}
        >
          {/* Specular White Dot */}
          <div
            className="rounded-full bg-white absolute"
            style={{
              width: pupilD * 0.38,
              height: pupilD * 0.38,
              top: 1,
              right: 1,
            }}
          />
        </div>
      </div>

      {/* Eye 2 (Front eye) */}
      <div
        className="rounded-full bg-white flex items-center justify-center"
        style={{
          width: eyeD,
          height: eyeD,
          boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
        }}
      >
        <div
          className="rounded-full bg-[#111111] relative"
          style={{
            width: pupilD,
            height: pupilD,
            transform: `translate(${px}px, ${py}px)`,
          }}
        >
          <div
            className="rounded-full bg-white absolute"
            style={{
              width: pupilD * 0.38,
              height: pupilD * 0.38,
              top: 1,
              right: 1,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Authentic Chunky Gaping Beak Component
   ═══════════════════════════════════════════ */
function SnakebirdBeak({ facingDir, cellSize }: { facingDir: Direction; cellSize: number }) {
  const beakLength = Math.max(9, Math.floor(cellSize * 0.32));
  const beakHeight = Math.max(8, Math.floor(cellSize * 0.28));

  switch (facingDir) {
    case 'right':
      return (
        <div
          className="absolute z-32"
          style={{
            top: '52%',
            right: -beakLength + 3,
            transform: 'translateY(-50%)',
            width: beakLength,
            height: beakHeight,
          }}
        >
          <svg viewBox="0 0 32 28" className="w-full h-full">
            {/* Upper bill */}
            <polygon points="0,0 32,10 0,16" fill="#FFAE18" />
            {/* Lower bill */}
            <polygon points="0,16 28,24 0,28" fill="#F09608" />
            {/* Dark inner mouth line */}
            <polygon points="0,14 20,16 0,18" fill="#C86A00" />
          </svg>
        </div>
      );

    case 'left':
      return (
        <div
          className="absolute z-32"
          style={{
            top: '52%',
            left: -beakLength + 3,
            transform: 'translateY(-50%) scaleX(-1)',
            width: beakLength,
            height: beakHeight,
          }}
        >
          <svg viewBox="0 0 32 28" className="w-full h-full">
            <polygon points="0,0 32,10 0,16" fill="#FFAE18" />
            <polygon points="0,16 28,24 0,28" fill="#F09608" />
            <polygon points="0,14 20,16 0,18" fill="#C86A00" />
          </svg>
        </div>
      );

    case 'up':
      return (
        <div
          className="absolute z-32"
          style={{
            top: -beakLength + 3,
            left: '50%',
            transform: 'translateX(-50%) rotate(-90deg)',
            width: beakLength,
            height: beakHeight,
          }}
        >
          <svg viewBox="0 0 32 28" className="w-full h-full">
            <polygon points="0,0 32,10 0,16" fill="#FFAE18" />
            <polygon points="0,16 28,24 0,28" fill="#F09608" />
          </svg>
        </div>
      );

    case 'down':
      return (
        <div
          className="absolute z-32"
          style={{
            bottom: -beakLength + 3,
            left: '50%',
            transform: 'translateX(-50%) rotate(90deg)',
            width: beakLength,
            height: beakHeight,
          }}
        >
          <svg viewBox="0 0 32 28" className="w-full h-full">
            <polygon points="0,0 32,10 0,16" fill="#FFAE18" />
            <polygon points="0,16 28,24 0,28" fill="#F09608" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
