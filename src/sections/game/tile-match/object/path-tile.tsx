import React from 'react';

import {
  PATH_H,
  PATH_V,
  WATER_R,
  WATER_L,
  WATER_D,
  WATER_U,
  PATH_T_UP,
  PATH_CROSS,
  PATH_T_DOWN,
  PATH_T_LEFT,
  WATER_END_R,
  WATER_END_L,
  WATER_END_D,
  WATER_END_U,
  PATH_T_RIGHT,
  OBJECT_SCALES,
  WATER_START_R,
  WATER_START_L,
  WATER_START_D,
  WATER_START_U,
  PATH_CORNER_TL,
  PATH_CORNER_TR,
  PATH_CORNER_BR,
  PATH_CORNER_BL,
  WATER_CORNER_TL_CW,
  WATER_CORNER_TR_CW,
  WATER_CORNER_BR_CW,
  WATER_CORNER_BL_CW,
  WATER_CORNER_TL_CCW,
  WATER_CORNER_TR_CCW,
  WATER_CORNER_BR_CCW,
  WATER_CORNER_BL_CCW,
} from './constants';

const SCALE = OBJECT_SCALES.pathTile || 1.0;

interface PathTileProps {
  type?: number;
}

export default function PathTile({ type = PATH_H }: PathTileProps) {
  const renderPathGraphic = () => {
    switch (type) {
      case PATH_V:
        return (
          <>
            {/* Dirt Path Base Layer */}
            <path
              d="M 50 0 L 50 100"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
              strokeLinecap="butt"
            />
            <path
              d="M 50 0 L 50 100"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
              strokeLinecap="butt"
            />
            <path
              d="M 50 0 L 50 100"
              stroke="#FEF3C7"
              strokeWidth="14"
              strokeLinecap="butt"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="46.5"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            {/* Center Dashed Footprint Line */}
            <path
              d="M 50 0 L 50 100"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_CORNER_TL: // ┌ (Down & Right)
        return (
          <>
            <path
              d="M 50 100 Q 50 50 100 50"
              fill="none"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 50 100 Q 50 50 100 50"
              fill="none"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 50 100 Q 50 50 100 50"
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <g transform="rotate(-45 50 50)">
              <rect
                x="46.5"
                y="25"
                width="7"
                height="26"
                rx="2"
                fill="url(#woodPlankGrad)"
                stroke="#451A03"
                strokeWidth="1.5"
              />
            </g>
            <path
              d="M 50 100 Q 50 50 100 50"
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_CORNER_TR: // ┐ (Down & Left)
        return (
          <>
            <path
              d="M 50 100 Q 50 50 0 50"
              fill="none"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 50 100 Q 50 50 0 50"
              fill="none"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 50 100 Q 50 50 0 50"
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <g transform="rotate(45 50 50)">
              <rect
                x="46.5"
                y="25"
                width="7"
                height="26"
                rx="2"
                fill="url(#woodPlankGrad)"
                stroke="#451A03"
                strokeWidth="1.5"
              />
            </g>
            <path
              d="M 50 100 Q 50 50 0 50"
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_CORNER_BR: // ┘ (Up & Left)
        return (
          <>
            <path
              d="M 50 0 Q 50 50 0 50"
              fill="none"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 50 0 Q 50 50 0 50"
              fill="none"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 50 0 Q 50 50 0 50"
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <g transform="rotate(-45 50 50)">
              <rect
                x="46.5"
                y="49"
                width="7"
                height="26"
                rx="2"
                fill="url(#woodPlankGrad)"
                stroke="#451A03"
                strokeWidth="1.5"
              />
            </g>
            <path
              d="M 50 0 Q 50 50 0 50"
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_CORNER_BL: // └ (Up & Right)
        return (
          <>
            <path
              d="M 50 0 Q 50 50 100 50"
              fill="none"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 50 0 Q 50 50 100 50"
              fill="none"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 50 0 Q 50 50 100 50"
              fill="none"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <g transform="rotate(45 50 50)">
              <rect
                x="46.5"
                y="49"
                width="7"
                height="26"
                rx="2"
                fill="url(#woodPlankGrad)"
                stroke="#451A03"
                strokeWidth="1.5"
              />
            </g>
            <path
              d="M 50 0 Q 50 50 100 50"
              fill="none"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_CROSS: // ┼ (All 4 directions)
        return (
          <>
            <path
              d="M 0 50 L 100 50 M 50 0 L 50 100"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 0 50 L 100 50 M 50 0 L 50 100"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 0 50 L 100 50 M 50 0 L 50 100"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            {/* Center Junction Hub */}
            <circle
              cx="50"
              cy="50"
              r="14"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="2"
            />
            <circle cx="50" cy="50" r="7" fill="#F59E0B" />
            <path
              d="M 0 50 L 100 50 M 50 0 L 50 100"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_T_DOWN: // ┬ (Left, Right, Down)
        return (
          <>
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 100"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 100"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 100"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 100"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_T_UP: // ┴ (Left, Right, Up)
        return (
          <>
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 0"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path d="M 0 50 L 100 50 M 50 50 L 50 0" stroke="url(#dirtPathGrad)" strokeWidth="26" />
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 0"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <path
              d="M 0 50 L 100 50 M 50 50 L 50 0"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_T_RIGHT: // ├ (Up, Down, Right)
        return (
          <>
            <path
              d="M 50 0 L 50 100 M 50 50 L 100 50"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path
              d="M 50 0 L 50 100 M 50 50 L 100 50"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
            />
            <path
              d="M 50 0 L 50 100 M 50 50 L 100 50"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <path
              d="M 50 0 L 50 100 M 50 50 L 100 50"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_T_LEFT: // ┤ (Up, Down, Left)
        return (
          <>
            <path
              d="M 50 0 L 50 100 M 50 50 L 0 50"
              stroke="#78350F"
              strokeWidth="32"
              opacity="0.4"
            />
            <path d="M 50 0 L 50 100 M 50 50 L 0 50" stroke="url(#dirtPathGrad)" strokeWidth="26" />
            <path
              d="M 50 0 L 50 100 M 50 50 L 0 50"
              stroke="#FEF3C7"
              strokeWidth="14"
              opacity="0.3"
            />
            <rect
              x="34"
              y="15"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="34"
              y="78"
              width="32"
              height="7"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <circle
              cx="50"
              cy="50"
              r="10"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <path
              d="M 50 0 L 50 100 M 50 50 L 0 50"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      case PATH_H: // ─ (Left & Right)
        return (
          <>
            {/* Dirt Path Base Layer */}
            <path
              d="M 0 50 L 100 50"
              stroke="#78350F"
              strokeWidth="32"
              strokeLinecap="butt"
              opacity="0.4"
            />
            <path
              d="M 0 50 L 100 50"
              stroke="url(#dirtPathGrad)"
              strokeWidth="26"
              strokeLinecap="butt"
            />
            <path
              d="M 0 50 L 100 50"
              stroke="#FEF3C7"
              strokeWidth="14"
              strokeLinecap="butt"
              opacity="0.3"
            />
            {/* Wooden Planks */}
            <rect
              x="15"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="46.5"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            <rect
              x="78"
              y="34"
              width="7"
              height="32"
              rx="2"
              fill="url(#woodPlankGrad)"
              stroke="#451A03"
              strokeWidth="1.5"
            />
            {/* Center Dashed Footprint Line */}
            <path
              d="M 0 50 L 100 50"
              stroke="#FFFBEB"
              strokeWidth="4"
              strokeDasharray="5 7"
              strokeLinecap="round"
            />
          </>
        );

      // ──────────────────────────────────────────────
      // 🌊 Waterway Straight
      // ──────────────────────────────────────────────
      case WATER_R: // Flow Right (→)
        return (
          <>
            <rect x="0" y="16" width="100" height="68" fill="url(#waterGrad)" />
            <path d="M 0 16 L 100 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 17 L 100 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 84 L 100 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 83 L 100 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 22 L 100 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Right */}
            <path
              d="M 20 32 L 34 50 L 20 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 45 32 L 59 50 L 45 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 70 32 L 84 50 L 70 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </>
        );

      case WATER_L: // Flow Left (←)
        return (
          <>
            <rect x="0" y="16" width="100" height="68" fill="url(#waterGrad)" />
            <path d="M 0 16 L 100 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 17 L 100 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 84 L 100 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 83 L 100 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 22 L 100 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Left */}
            <path
              d="M 30 32 L 16 50 L 30 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 55 32 L 41 50 L 55 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 80 32 L 66 50 L 80 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </>
        );

      case WATER_D: // Flow Down (↓)
        return (
          <>
            <rect x="16" y="0" width="68" height="100" fill="url(#waterGradV)" />
            <path d="M 16 0 L 16 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 0 L 17 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 0 L 84 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 0 L 83 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 0 L 22 100" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Down */}
            <path
              d="M 32 20 L 50 34 L 68 20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 45 L 50 59 L 68 45"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 70 L 50 84 L 68 70"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </>
        );

      case WATER_U: // Flow Up (↑)
        return (
          <>
            <rect x="16" y="0" width="68" height="100" fill="url(#waterGradV)" />
            <path d="M 16 0 L 16 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 0 L 17 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 0 L 84 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 0 L 83 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 0 L 22 100" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Up */}
            <path
              d="M 32 30 L 50 16 L 68 30"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 55 L 50 41 L 68 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 80 L 50 66 L 68 80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
          </>
        );

      // ──────────────────────────────────────────────
      // 🌊 Waterway Corners (┌, ┐, ┘, └)
      // ──────────────────────────────────────────────
      case WATER_CORNER_TL_CW: // ┌ (Down -> Right)
      case WATER_CORNER_TL_CCW: // ┌ (Right -> Down)
        return (
          <>
            {/* Water Arc */}
            <path
              d="M 16 100 A 84 84 0 0 1 100 16 L 100 84 A 16 16 0 0 0 84 100 Z"
              fill="url(#waterGrad)"
            />
            {/* Outer Border */}
            <path d="M 16 100 A 84 84 0 0 1 100 16" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path
              d="M 17 100 A 83 83 0 0 1 100 17"
              stroke="#84cc16"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Inner Border */}
            <path d="M 84 100 A 16 16 0 0 1 100 84" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path
              d="M 83 100 A 17 17 0 0 1 100 83"
              stroke="#84cc16"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Highlights */}
            <path
              d="M 22 100 A 78 78 0 0 1 100 22"
              stroke="#bae6fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />

            {type === WATER_CORNER_TL_CW ? (
              <>
                {/* Entry from Bottom (pointing Up) */}
                <path
                  d="M 32 84 L 50 70 L 68 84"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 40 56 L 56 40 L 64 56"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Right (pointing Right) */}
                <path
                  d="M 70 32 L 84 50 L 70 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            ) : (
              <>
                {/* Entry from Right (pointing Left) */}
                <path
                  d="M 84 32 L 70 50 L 84 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 56 40 L 40 56 L 56 64"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Bottom (pointing Down) */}
                <path
                  d="M 32 70 L 50 84 L 68 70"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            )}
          </>
        );

      case WATER_CORNER_TR_CW: // ┐ (Left -> Down)
      case WATER_CORNER_TR_CCW: // ┐ (Down -> Left)
        return (
          <>
            {/* Water Arc */}
            <path
              d="M 84 100 A 84 84 0 0 0 0 16 L 0 84 A 16 16 0 0 1 16 100 Z"
              fill="url(#waterGrad)"
            />
            {/* Outer Border */}
            <path d="M 84 100 A 84 84 0 0 0 0 16" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 83 100 A 83 83 0 0 0 0 17" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Inner Border */}
            <path d="M 16 100 A 16 16 0 0 0 0 84" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 17 100 A 17 17 0 0 0 0 83" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Highlights */}
            <path
              d="M 78 100 A 78 78 0 0 0 0 22"
              stroke="#bae6fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />

            {type === WATER_CORNER_TR_CW ? (
              <>
                {/* Entry from Left (pointing Right) */}
                <path
                  d="M 16 32 L 30 50 L 16 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 36 56 L 44 40 L 60 56"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Bottom (pointing Down) */}
                <path
                  d="M 32 70 L 50 84 L 68 70"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            ) : (
              <>
                {/* Entry from Bottom (pointing Up) */}
                <path
                  d="M 32 84 L 50 70 L 68 84"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 60 40 L 44 56 L 36 40"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Left (pointing Left) */}
                <path
                  d="M 30 32 L 16 50 L 30 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            )}
          </>
        );

      case WATER_CORNER_BR_CW: // ┘ (Up -> Left)
      case WATER_CORNER_BR_CCW: // ┘ (Left -> Up)
        return (
          <>
            {/* Water Arc */}
            <path
              d="M 84 0 A 84 84 0 0 1 0 84 L 0 16 A 16 16 0 0 0 16 0 Z"
              fill="url(#waterGrad)"
            />
            {/* Outer Border */}
            <path d="M 84 0 A 84 84 0 0 1 0 84" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 83 0 A 83 83 0 0 1 0 83" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Inner Border */}
            <path d="M 16 0 A 16 16 0 0 1 0 16" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 17 0 A 17 17 0 0 1 0 17" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Highlights */}
            <path
              d="M 78 0 A 78 78 0 0 1 0 78"
              stroke="#bae6fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />

            {type === WATER_CORNER_BR_CW ? (
              <>
                {/* Entry from Top (pointing Down) */}
                <path
                  d="M 32 16 L 50 30 L 68 16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 56 44 L 40 60 L 56 64"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Left (pointing Left) */}
                <path
                  d="M 30 32 L 16 50 L 30 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            ) : (
              <>
                {/* Entry from Left (pointing Right) */}
                <path
                  d="M 16 32 L 30 50 L 16 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 40 60 L 56 44 L 64 60"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Top (pointing Up) */}
                <path
                  d="M 32 30 L 50 16 L 68 30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            )}
          </>
        );

      case WATER_CORNER_BL_CW: // └ (Right -> Up)
      case WATER_CORNER_BL_CCW: // └ (Up -> Right)
        return (
          <>
            {/* Water Arc */}
            <path
              d="M 16 0 A 84 84 0 0 0 100 84 L 100 16 A 16 16 0 0 1 84 0 Z"
              fill="url(#waterGrad)"
            />
            {/* Outer Border */}
            <path d="M 16 0 A 84 84 0 0 0 100 84" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 17 0 A 83 83 0 0 0 100 83" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Inner Border */}
            <path d="M 84 0 A 16 16 0 0 0 100 16" stroke="#4d7c0f" strokeWidth="5" fill="none" />
            <path d="M 83 0 A 17 17 0 0 0 100 17" stroke="#84cc16" strokeWidth="2.5" fill="none" />
            {/* Highlights */}
            <path
              d="M 22 0 A 78 78 0 0 0 100 78"
              stroke="#bae6fd"
              strokeWidth="2"
              fill="none"
              opacity="0.6"
            />

            {type === WATER_CORNER_BL_CW ? (
              <>
                {/* Entry from Right (pointing Left) */}
                <path
                  d="M 84 32 L 70 50 L 84 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 60 60 L 44 44 L 36 60"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Top (pointing Up) */}
                <path
                  d="M 32 30 L 50 16 L 68 30"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            ) : (
              <>
                {/* Entry from Top (pointing Down) */}
                <path
                  d="M 32 16 L 50 30 L 68 16"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Diagonal 45-deg Turn */}
                <path
                  d="M 44 44 L 60 60 L 44 64"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
                {/* Exit to Right (pointing Right) */}
                <path
                  d="M 70 32 L 84 50 L 70 68"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.9"
                />
              </>
            )}
          </>
        );

      // ──────────────────────────────────────────────
      // 🪨 Waterway Ends & Starts with Rocks (돌이 박힌 수로)
      // ──────────────────────────────────────────────
      case WATER_END_R: // Flow Right into Rocks on Right
        return (
          <>
            <path d="M 0 16 L 75 16 A 15 15 0 0 1 75 84 L 0 84 Z" fill="url(#waterGrad)" />
            <path d="M 0 16 L 75 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 17 L 75 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 84 L 75 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 83 L 75 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 22 L 75 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Right */}
            <path
              d="M 20 32 L 34 50 L 20 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 45 32 L 59 50 L 45 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Right */}
            <g transform="translate(68, 18)">
              {/* Rock 1 */}
              <ellipse
                cx="14"
                cy="14"
                rx="12"
                ry="10"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="11" rx="6" ry="4" fill="#f1f5f9" opacity="0.5" />
              {/* Rock 2 */}
              <ellipse
                cx="16"
                cy="48"
                rx="13"
                ry="11"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="13" cy="45" rx="7" ry="5" fill="#f1f5f9" opacity="0.5" />
              {/* Rock 3 (Center foreground) */}
              <ellipse
                cx="10"
                cy="32"
                rx="14"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="7" cy="28" rx="8" ry="5" fill="#f1f5f9" opacity="0.6" />
              {/* Splash Foam */}
              <path
                d="M -4 20 Q 2 32 -4 44"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_END_L: // Flow Left into Rocks on Left
        return (
          <>
            <path d="M 100 16 L 25 16 A 15 15 0 0 0 25 84 L 100 84 Z" fill="url(#waterGrad)" />
            <path d="M 25 16 L 100 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 25 17 L 100 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 25 84 L 100 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 25 83 L 100 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 25 22 L 100 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Left */}
            <path
              d="M 80 32 L 66 50 L 80 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 55 32 L 41 50 L 55 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Left */}
            <g transform="translate(0, 18)">
              <ellipse
                cx="18"
                cy="14"
                rx="12"
                ry="10"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="15" cy="11" rx="6" ry="4" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="16"
                cy="48"
                rx="13"
                ry="11"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="13" cy="45" rx="7" ry="5" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="22"
                cy="32"
                rx="14"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="19" cy="28" rx="8" ry="5" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 36 20 Q 30 32 36 44"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_END_D: // Flow Down into Rocks on Down
        return (
          <>
            <path d="M 16 0 L 16 75 A 15 15 0 0 0 84 75 L 84 0 Z" fill="url(#waterGradV)" />
            <path d="M 16 0 L 16 75" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 0 L 17 75" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 0 L 84 75" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 0 L 83 75" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 0 L 22 75" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Down */}
            <path
              d="M 32 20 L 50 34 L 68 20"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 45 L 50 59 L 68 45"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Down */}
            <g transform="translate(18, 68)">
              <ellipse
                cx="14"
                cy="14"
                rx="10"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="11" rx="4" ry="6" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="48"
                cy="16"
                rx="11"
                ry="13"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="45" cy="13" rx="5" ry="7" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="32"
                cy="10"
                rx="12"
                ry="14"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="28" cy="7" rx="5" ry="8" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 20 -4 Q 32 2 44 -4"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_END_U: // Flow Up into Rocks on Top
        return (
          <>
            <path d="M 16 100 L 16 25 A 15 15 0 0 1 84 25 L 84 100 Z" fill="url(#waterGradV)" />
            <path d="M 16 25 L 16 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 25 L 17 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 25 L 84 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 25 L 83 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 25 L 22 100" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Up */}
            <path
              d="M 32 80 L 50 66 L 68 80"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 55 L 50 41 L 68 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Top */}
            <g transform="translate(18, 0)">
              <ellipse
                cx="14"
                cy="18"
                rx="10"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="15" rx="4" ry="6" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="48"
                cy="16"
                rx="11"
                ry="13"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="45" cy="13" rx="5" ry="7" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="32"
                cy="22"
                rx="12"
                ry="14"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="28" cy="19" rx="5" ry="8" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 20 36 Q 32 30 44 36"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_START_R: // [Rock on Left] -> Flow Right
        return (
          <>
            <path d="M 100 16 L 25 16 A 15 15 0 0 0 25 84 L 100 84 Z" fill="url(#waterGrad)" />
            <path d="M 25 16 L 100 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 25 17 L 100 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 25 84 L 100 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 25 83 L 100 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 25 22 L 100 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Right */}
            <path
              d="M 45 32 L 59 50 L 45 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 70 32 L 84 50 L 70 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Left */}
            <g transform="translate(0, 18)">
              <ellipse
                cx="18"
                cy="14"
                rx="12"
                ry="10"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="15" cy="11" rx="6" ry="4" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="16"
                cy="48"
                rx="13"
                ry="11"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="13" cy="45" rx="7" ry="5" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="22"
                cy="32"
                rx="14"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="19" cy="28" rx="8" ry="5" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 36 20 Q 42 32 36 44"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_START_L: // Flow Left -> [Rock on Right]
        return (
          <>
            <path d="M 0 16 L 75 16 A 15 15 0 0 1 75 84 L 0 84 Z" fill="url(#waterGrad)" />
            <path d="M 0 16 L 75 16" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 17 L 75 17" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 84 L 75 84" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 0 83 L 75 83" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 0 22 L 75 22" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Left */}
            <path
              d="M 55 32 L 41 50 L 55 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 30 32 L 16 50 L 30 68"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Right */}
            <g transform="translate(68, 18)">
              <ellipse
                cx="14"
                cy="14"
                rx="12"
                ry="10"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="11" rx="6" ry="4" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="16"
                cy="48"
                rx="13"
                ry="11"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="13" cy="45" rx="7" ry="5" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="10"
                cy="32"
                rx="14"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="7" cy="28" rx="8" ry="5" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M -4 20 Q -10 32 -4 44"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_START_D: // [Rock on Top] -> Flow Down
        return (
          <>
            <path d="M 16 100 L 16 25 A 15 15 0 0 1 84 25 L 84 100 Z" fill="url(#waterGradV)" />
            <path d="M 16 25 L 16 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 25 L 17 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 25 L 84 100" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 25 L 83 100" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 25 L 22 100" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Down */}
            <path
              d="M 32 45 L 50 59 L 68 45"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 70 L 50 84 L 68 70"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Top */}
            <g transform="translate(18, 0)">
              <ellipse
                cx="14"
                cy="18"
                rx="10"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="15" rx="4" ry="6" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="48"
                cy="16"
                rx="11"
                ry="13"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="45" cy="13" rx="5" ry="7" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="32"
                cy="22"
                rx="12"
                ry="14"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="28" cy="19" rx="5" ry="8" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 20 36 Q 32 42 44 36"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );

      case WATER_START_U: // [Rock on Down] -> Flow Up
        return (
          <>
            <path d="M 16 0 L 16 75 A 15 15 0 0 0 84 75 L 84 0 Z" fill="url(#waterGradV)" />
            <path d="M 16 0 L 16 75" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 17 0 L 17 75" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 84 0 L 84 75" stroke="#4d7c0f" strokeWidth="5" />
            <path d="M 83 0 L 83 75" stroke="#84cc16" strokeWidth="2.5" />
            <path d="M 22 0 L 22 75" stroke="#bae6fd" strokeWidth="2" opacity="0.6" />
            {/* Chevrons pointing Up */}
            <path
              d="M 32 55 L 50 41 L 68 55"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            <path
              d="M 32 30 L 50 16 L 68 30"
              fill="none"
              stroke="#ffffff"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.9"
            />
            {/* Rock Cluster on Down */}
            <g transform="translate(18, 68)">
              <ellipse
                cx="14"
                cy="14"
                rx="10"
                ry="12"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="11" cy="11" rx="4" ry="6" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="48"
                cy="16"
                rx="11"
                ry="13"
                fill="url(#rockGrad)"
                stroke="#334155"
                strokeWidth="2"
              />
              <ellipse cx="45" cy="13" rx="5" ry="7" fill="#f1f5f9" opacity="0.5" />
              <ellipse
                cx="32"
                cy="10"
                rx="12"
                ry="14"
                fill="url(#rockGrad)"
                stroke="#1e293b"
                strokeWidth="2"
              />
              <ellipse cx="28" cy="7" rx="5" ry="8" fill="#f1f5f9" opacity="0.6" />
              <path
                d="M 20 -4 Q 32 -10 44 -4"
                fill="none"
                stroke="#ffffff"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
        <defs>
          {/* Rich Dirt Path Gradient */}
          <linearGradient id="dirtPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#92400E" />
          </linearGradient>

          {/* Wood Plank Gradient */}
          <linearGradient id="woodPlankGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="30%" stopColor="#78350F" />
            <stop offset="100%" stopColor="#451A03" />
          </linearGradient>

          {/* Vibrant Water Flow Gradient (Horizontal) */}
          <linearGradient id="waterGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* Vibrant Water Flow Gradient (Vertical) */}
          <linearGradient id="waterGradV" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="40%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          {/* 3D Rock Gradient */}
          <linearGradient id="rockGrad" x1="20%" y1="20%" x2="90%" y2="90%">
            <stop offset="0%" stopColor="#cbd5e1" />
            <stop offset="40%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#64748b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
        </defs>
        {renderPathGraphic()}
      </svg>
    </div>
  );
}
