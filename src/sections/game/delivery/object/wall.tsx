import React from "react";
import { OBJECT_SCALES } from "./constants";

// 개별 크기 조절 변수 (1.0 = 100%, 1.2 = 120% 등)
const SCALE = OBJECT_SCALES.wall;

export interface WallProps {
  isFrozen?: boolean;
  x?: number;
  y?: number;
  variant?: number;
}

export default function Wall({
  isFrozen = false,
  x = 0,
  y = 0,
  variant,
}: WallProps) {
  // x, y 좌표를 기반으로 6가지 3D 주택 디자인 중 하나를 결정론적으로 선택
  const houseType =
    variant !== undefined
      ? variant % 6
      : Math.abs((x * 7 + y * 13 + (x ^ y)) % 6);

  return (
    <div
      className="w-full h-full flex items-center justify-center pointer-events-none select-none"
      style={{ transform: `scale(${SCALE})` }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full object-contain overflow-visible drop-shadow-lg"
      >
        {/* ============================================================== */}
        {/* Type 0: 🏠 3D 레드 루프 코지 코티지 (Isometric Red Cottage)     */}
        {/* ============================================================== */}
        {houseType === 0 && (
          <g>
            {/* 1. 지면 바닥 3D 그림자 */}
            <ellipse cx="50" cy="88" rx="42" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 2. 3D 굴뚝 (지붕 뒤편) */}
            {/* 굴뚝 우측면 */}
            <polygon points="76,8 84,4 84,20 76,24" fill="#7f1d1d" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
            {/* 굴뚝 전면 */}
            <polygon points="68,12 76,8 76,24 68,28" fill="#b91c1c" stroke="#0f172a" strokeWidth="2" strokeLinejoin="round" />
            {/* 굴뚝 윗면 구멍 */}
            <polygon points="68,12 76,8 84,4 76,8" fill="#450a0a" stroke="#0f172a" strokeWidth="1.5" />
            {/* 연기 ☁️ */}
            {!isFrozen && (
              <g opacity="0.75">
                <circle cx="82" cy="0" r="3.5" fill="#e2e8f0" />
                <circle cx="87" cy="-5" r="4.5" fill="#f1f5f9" />
              </g>
            )}

            {/* 3. 3D 건물 벽체 (Front & Right Side) */}
            {/* 건물 우측 측면 (Shadow Side) */}
            <polygon points="68,40 88,30 88,74 68,84" fill={isFrozen ? "#94a3b8" : "#d97706"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 측면 창문 */}
            <polygon points="74,44 82,40 82,56 74,60" fill={isFrozen ? "#60a5fa" : "#0284c7"} stroke="#0f172a" strokeWidth="1.5" />

            {/* 건물 정면 (Light Side) */}
            <polygon points="12,40 68,40 68,84 12,84" fill={isFrozen ? "#cbd5e1" : "#fef3c7"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 처마 밑 그림자 (Ambient Shadow) */}
            <polygon points="12,40 68,40 68,46 12,46" fill="#0f172a" opacity="0.15" />

            {/* 4. 3D 지붕 (Roof - Front Gable & Right Slope) */}
            {/* 지붕 우측 경사면 (Dark Red) */}
            <polygon points="40,8 72,0 96,22 68,34" fill={isFrozen ? "#60a5fa" : "#b91c1c"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            {/* 지붕 우측면 하이라이트/텍스처 */}
            <line x1="56" y1="4" x2="82" y2="28" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />

            {/* 지붕 전면 삼각 박공 (Bright Red) */}
            <polygon points="40,8 6,34 68,34" fill={isFrozen ? "#93c5fd" : "#ef4444"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            {/* 지붕 전면 하이라이트 베벨 */}
            <polygon points="40,14 16,32 60,32" fill={isFrozen ? "#bfdbfe" : "#f87171"} opacity="0.7" />

            {/* 다락방 입체 원형 창문 */}
            <circle cx="38" cy="24" r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="38" y1="19" x2="38" y2="29" stroke="#0f172a" strokeWidth="1" />
            <line x1="33" y1="24" x2="43" y2="24" stroke="#0f172a" strokeWidth="1" />

            {/* 5. 1층 디테일 (3D 돌출 현관 & 3D 창문 & 우편함) */}
            {/* 돌출된 현관 지붕 캐노피 */}
            <polygon points="18,52 38,52 42,48 22,48" fill="#d97706" stroke="#0f172a" strokeWidth="1.5" />
            {/* 현관문 */}
            <rect x="20" y="52" width="18" height="32" rx="3" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
            <circle cx="34" cy="68" r="1.5" fill="#fde047" />

            {/* 1층 입체 창문 (두께감 있는 프레임) */}
            <rect x="44" y="50" width="18" height="18" rx="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <rect x="42" y="68" width="22" height="3" rx="1" fill="#f59e0b" stroke="#0f172a" strokeWidth="1" />
            <line x1="53" y1="50" x2="53" y2="68" stroke="#0f172a" strokeWidth="1.5" />
            <line x1="44" y1="59" x2="62" y2="59" stroke="#0f172a" strokeWidth="1.5" />

            {/* 3D 빨간 우편함 */}
            <g transform="translate(6, 64)">
              <rect x="0" y="0" width="7" height="12" rx="2" fill="#ef4444" stroke="#0f172a" strokeWidth="1.5" />
              <rect x="1" y="2" width="5" height="2" fill="#fef08a" />
              <line x1="3.5" y1="12" x2="3.5" y2="20" stroke="#0f172a" strokeWidth="2" />
            </g>
          </g>
        )}

        {/* ============================================================== */}
        {/* Type 1: 🏡 3D 블루 루프 2층 타운하우스 (3D Blue Townhouse)      */}
        {/* ============================================================== */}
        {houseType === 1 && (
          <g>
            {/* 지면 그림자 */}
            <ellipse cx="50" cy="88" rx="44" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 3D 벽체 우측면 (Shadow Face) */}
            <polygon points="66,34 88,24 88,76 66,86" fill={isFrozen ? "#94a3b8" : "#94a3b8"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            <polygon points="72,40 82,35 82,50 72,55" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />

            {/* 3D 벽체 전면 (Light Face) */}
            <polygon points="12,34 66,34 66,86 12,86" fill={isFrozen ? "#e2e8f0" : "#f8fafc"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 층간 몰딩 분리선 */}
            <line x1="12" y1="58" x2="66" y2="58" stroke="#cbd5e1" strokeWidth="3" />

            {/* 3D 파란 지붕 (Roof Top Slope & Front Gable) */}
            <polygon points="38,4 68,-4 96,16 66,28" fill={isFrozen ? "#3b82f6" : "#0369a1"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="38,4 6,28 66,28" fill={isFrozen ? "#60a5fa" : "#0284c7"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="38,10 16,26 58,26" fill={isFrozen ? "#93c5fd" : "#38bdf8"} opacity="0.8" />

            {/* 2층 격자 창문 2개 */}
            <rect x="18" y="38" width="18" height="14" rx="2" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="27" y1="38" x2="27" y2="52" stroke="#0f172a" strokeWidth="1.2" />
            <rect x="42" y="38" width="18" height="14" rx="2" fill="#fed7aa" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="51" y1="38" x2="51" y2="52" stroke="#0f172a" strokeWidth="1.2" />

            {/* 1층 3D 돌출 현관 포치 */}
            <polygon points="26,62 48,62 52,58 30,58" fill="#0284c7" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="28" y="62" width="20" height="24" rx="3" fill="#1e293b" stroke="#0f172a" strokeWidth="2" />
            <rect x="32" y="66" width="12" height="8" rx="1" fill="#38bdf8" opacity="0.7" />
            <circle cx="44" cy="74" r="1.5" fill="#facc15" />

            {/* 현관 좌우 3D 조명등 */}
            <circle cx="22" cy="68" r="2.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
            <circle cx="54" cy="68" r="2.5" fill="#facc15" stroke="#0f172a" strokeWidth="1" />
          </g>
        )}

        {/* ============================================================== */}
        {/* Type 2: 🏬 3D 모던 큐브 빌라 (3D Modern Cube Villa)             */}
        {/* ============================================================== */}
        {houseType === 2 && (
          <g>
            {/* 지면 그림자 */}
            <ellipse cx="50" cy="88" rx="44" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 3D 큐브 우측면 (Dark Shadow) */}
            <polygon points="68,22 90,12 90,72 68,82" fill={isFrozen ? "#64748b" : "#1e293b"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 3D 옥상 평면 (Roof Top Floor) */}
            <polygon points="12,22 34,12 90,12 68,22" fill={isFrozen ? "#cbd5e1" : "#475569"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 옥상 난간 (Rooftop Railing) */}
            <polygon points="12,18 34,8 90,8 68,18" fill="none" stroke="#94a3b8" strokeWidth="2" />
            {/* 옥상 안테나 */}
            <line x1="75" y1="12" x2="75" y2="2" stroke="#0f172a" strokeWidth="2" />
            <circle cx="75" cy="2" r="2" fill="#ef4444" />

            {/* 3D 큐브 전면 (Light Face) */}
            <polygon points="12,22 68,22 68,82 12,82" fill={isFrozen ? "#94a3b8" : "#334155"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />

            {/* 돌출된 3D 우드 포인트 박스 (2층 좌측) */}
            {/* 우드 박스 윗면 */}
            <polygon points="18,30 26,26 54,26 46,30" fill="#d97706" stroke="#0f172a" strokeWidth="1.5" />
            {/* 우드 박스 측면 */}
            <polygon points="46,30 54,26 54,48 46,52" fill="#78350f" stroke="#0f172a" strokeWidth="1.5" />
            {/* 우드 박스 전면 */}
            <polygon points="18,30 46,30 46,52 18,52" fill="#b45309" stroke="#0f172a" strokeWidth="2" />
            {/* 우드 슬랫 라인 */}
            <line x1="18" y1="37" x2="46" y2="37" stroke="#78350f" strokeWidth="1.5" />
            <line x1="18" y1="44" x2="46" y2="44" stroke="#78350f" strokeWidth="1.5" />

            {/* 2층 우측 대형 통창 (Corner Glass Window) */}
            <polygon points="50,30 64,30 64,50 50,50" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <polygon points="64,30 76,24 76,44 64,50" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />

            {/* 1층 글래스 도어 & 현관 */}
            <rect x="24" y="58" width="36" height="24" rx="3" fill="#0284c7" stroke="#0f172a" strokeWidth="2" />
            <rect x="44" y="60" width="14" height="22" rx="2" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="54" cy="72" r="1.5" fill="#facc15" />
          </g>
        )}

        {/* ============================================================== */}
        {/* Type 3: 🏘️ 3D 에메랄드 가든 하우스 (3D Emerald Villa)          */}
        {/* ============================================================== */}
        {houseType === 3 && (
          <g>
            {/* 지면 그림자 */}
            <ellipse cx="50" cy="88" rx="42" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 3D 벽체 우측면 */}
            <polygon points="68,36 88,26 88,74 68,84" fill={isFrozen ? "#93c5fd" : "#ca8a04"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 3D 벽체 전면 */}
            <polygon points="12,36 68,36 68,84 12,84" fill={isFrozen ? "#bfdbfe" : "#fef08a"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />

            {/* 3D 둥근 아치형 녹색 지붕 (Roof Arch & Right Depth) */}
            <path d="M 40,8 Q 72,0 96,20 L 68,30 Q 40,8 40,8 Z" fill={isFrozen ? "#0284c7" : "#047857"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M 6,30 Q 38,4 70,30 Z" fill={isFrozen ? "#38bdf8" : "#10b981"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <path d="M 16,28 Q 38,12 60,28 Z" fill={isFrozen ? "#7dd3fc" : "#34d399"} opacity="0.8" />

            {/* 2층 아치 창문 */}
            <path d="M 32,24 A 6 6 0 0 1 44,24 L 44,28 L 32,28 Z" fill="#ffffff" stroke="#0f172a" strokeWidth="1.5" />

            {/* 1층 아치 창문 & 3D 돌출 플라워 박스 (🌸) */}
            <g transform="translate(18, 44)">
              <rect x="0" y="0" width="16" height="18" rx="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
              {/* 돌출 화분 윗면 & 전면 */}
              <polygon points="-2,16 18,16 20,13 0,13" fill="#9a3412" />
              <rect x="-2" y="16" width="20" height="6" rx="2" fill="#b45309" stroke="#0f172a" strokeWidth="1.2" />
              <circle cx="3" cy="14" r="2.5" fill="#f43f5e" />
              <circle cx="13" cy="14" r="2.5" fill="#fbbf24" />
            </g>

            {/* 1층 3D 아치형 원목 도어 */}
            <path d="M 46,84 L 46,58 A 8 8 0 0 1 62,58 L 62,84 Z" fill="#78350f" stroke="#0f172a" strokeWidth="2" />
            <circle cx="58" cy="70" r="1.5" fill="#fde047" />
          </g>
        )}

        {/* ============================================================== */}
        {/* Type 4: 🏪 3D 옐로우 어닝 상가 & HUB (3D Delivery Store)        */}
        {/* ============================================================== */}
        {houseType === 4 && (
          <g>
            {/* 지면 그림자 */}
            <ellipse cx="50" cy="88" rx="44" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 3D 벽체 우측면 */}
            <polygon points="68,26 88,16 88,74 68,84" fill={isFrozen ? "#94a3b8" : "#cbd5e1"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 3D 벽체 전면 */}
            <polygon points="12,26 68,26 68,84 12,84" fill={isFrozen ? "#e2e8f0" : "#ffffff"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />

            {/* 3D HUB 간판 탑 */}
            {/* 간판 우측면 */}
            <polygon points="64,12 76,6 76,20 64,26" fill="#1e3a8a" stroke="#0f172a" strokeWidth="2" />
            {/* 간판 전면 */}
            <polygon points="16,12 64,12 64,26 16,26" fill="#3b82f6" stroke="#0f172a" strokeWidth="2" />
            <text x="40" y="22" fontSize="9" fill="#ffffff" fontWeight="900" textAnchor="middle">HUB</text>

            {/* 3D 돌출 옐로우 & 화이트 스트라이프 차양 (3D Awning) */}
            {/* 어닝 우측 입체면 */}
            <polygon points="68,32 84,22 78,38 62,48" fill="#d97706" stroke="#0f172a" strokeWidth="2" />
            {/* 어닝 전면 경사면 */}
            <polygon points="6,32 68,32 62,48 0,48" fill="#facc15" stroke="#0f172a" strokeWidth="2" />
            {/* 어닝 스트라이프 */}
            <polygon points="16,32 28,32 22,48 10,48" fill="#ffffff" />
            <polygon points="38,32 50,32 44,48 32,48" fill="#ffffff" />
            <polygon points="60,32 68,32 62,48 54,48" fill="#ffffff" />
            {/* 어닝 밑 짙은 그림자 */}
            <polygon points="0,48 62,48 62,54 0,54" fill="#0f172a" opacity="0.25" />

            {/* 1층 3D 쇼윈도 통창 (내부에 택배 박스 📦) */}
            <rect x="10" y="54" width="34" height="28" rx="3" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
            <text x="27" y="72" fontSize="14" textAnchor="middle">📦</text>

            {/* 1층 상가 출입문 */}
            <rect x="48" y="52" width="18" height="32" rx="3" fill="#0f172a" stroke="#0f172a" strokeWidth="2" />
            <rect x="51" y="56" width="12" height="14" rx="1" fill="#93c5fd" opacity="0.8" />
            <circle cx="62" cy="72" r="1.5" fill="#facc15" />
          </g>
        )}

        {/* ============================================================== */}
        {/* Type 5: 🏰 3D 클래식 브라운 맨션 (3D Classic Brick Manor)        */}
        {/* ============================================================== */}
        {houseType === 5 && (
          <g>
            {/* 지면 그림자 */}
            <ellipse cx="50" cy="88" rx="44" ry="8" fill="#0f172a" opacity="0.3" />

            {/* 3D 맨션 우측면 (Dark Brick) */}
            <polygon points="68,32 88,22 88,76 68,86" fill={isFrozen ? "#6366f1" : "#78350f"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />
            {/* 코너 쿼인 스톤 장식 */}
            <rect x="66" y="36" width="4" height="6" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
            <rect x="66" y="48" width="4" height="6" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />
            <rect x="66" y="60" width="4" height="6" fill="#cbd5e1" stroke="#0f172a" strokeWidth="1" />

            {/* 3D 맨션 전면 (Warm Red Brick) */}
            <polygon points="12,32 68,32 68,86 12,86" fill={isFrozen ? "#818cf8" : "#b45309"} stroke="#0f172a" strokeWidth="3" strokeLinejoin="round" />

            {/* 3D 웅장한 지붕 (Mansard Roof Top Slope & Gable) */}
            <polygon points="40,4 70,-4 96,16 68,26" fill={isFrozen ? "#4338ca" : "#291305"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="40,4 6,26 68,26" fill={isFrozen ? "#4f46e5" : "#451a03"} stroke="#0f172a" strokeWidth="3.5" strokeLinejoin="round" />
            <polygon points="40,10 16,24 60,24" fill={isFrozen ? "#6366f1" : "#78350f"} opacity="0.8" />

            {/* 2층 격자 아치창 2개 */}
            <rect x="18" y="38" width="18" height="16" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="27" y1="38" x2="27" y2="54" stroke="#0f172a" strokeWidth="1" />
            <line x1="18" y1="46" x2="36" y2="46" stroke="#0f172a" strokeWidth="1" />

            <rect x="44" y="38" width="18" height="16" rx="3" fill="#fef08a" stroke="#0f172a" strokeWidth="1.8" />
            <line x1="53" y1="38" x2="53" y2="54" stroke="#0f172a" strokeWidth="1" />
            <line x1="44" y1="46" x2="62" y2="46" stroke="#0f172a" strokeWidth="1" />

            {/* 1층 3D 돌출 현관 아치 도어 & 캐노피 */}
            <polygon points="26,60 52,60 56,56 30,56" fill="#d97706" stroke="#0f172a" strokeWidth="1.5" />
            <path d="M 30,86 L 30,64 A 9 9 0 0 1 48,64 L 48,86 Z" fill="#1e1b4b" stroke="#0f172a" strokeWidth="2.5" />
            <circle cx="44" cy="74" r="1.5" fill="#facc15" />

            {/* 현관 앤티크 조명등 */}
            <circle cx="22" cy="68" r="2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
            <circle cx="56" cy="68" r="2.5" fill="#fef08a" stroke="#0f172a" strokeWidth="1" />
          </g>
        )}
      </svg>
    </div>
  );
}
