import React from 'react';

// 기본 조절용 변수 (Props로 전달하지 않을 경우 적용되는 기본값)
export const DEFAULT_CONTROL_WIDTH = '130px'; // 버튼 너비
export const DEFAULT_CONTROL_HEIGHT = '48px'; // 버튼 높이
export const DEFAULT_CONTROL_GAP = '20px'; // < > 버튼 사이 간격
export const DEFAULT_CONTROL_MARGIN_BOTTOM = '4px'; // < > 버튼 아래 마진 (하단 여백)
export const DEFAULT_ARROW_COLOR = '#FFF6E5'; // < , > 화살표 색상 (자연스러운 포근한 아이보리 크림)

interface PuzzleControlsProps {
  onLeftClick?: () => void;
  onRightClick?: () => void;
  onChanceClick?: () => void;
  remainingUndos?: number;
  historySize?: number;
  showChanceButton?: boolean;
  /** 버튼 너비 (예: "120px", "10rem", 120) */
  width?: string | number;
  /** 버튼 높이 (예: "48px", "3.5rem", 48) */
  height?: string | number;
  /** 버튼 간격 (예: "24px", "2rem", 24) */
  gap?: string | number;
  /** 버튼 아래 마진 (예: "16px", "1rem", 16) */
  marginBottom?: string | number;
  /** 화살표 색상 (예: "#FFF6E5", "#FFE066", "#71B92D") */
  arrowColor?: string;
  /** 눌렀을 때 버튼 배경 색상 (예: "#9e5522") */
  activeBgColor?: string;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onLeftClick,
  onRightClick,
  onChanceClick,
  remainingUndos = 0,
  historySize = 0,
  showChanceButton = true,
  width = DEFAULT_CONTROL_WIDTH,
  height = DEFAULT_CONTROL_HEIGHT,
  gap = DEFAULT_CONTROL_GAP,
  marginBottom = DEFAULT_CONTROL_MARGIN_BOTTOM,
  arrowColor = DEFAULT_ARROW_COLOR,
}) => {
  const formattedWidth = typeof width === 'number' ? `${width}px` : width;
  const formattedHeight = typeof height === 'number' ? `${height}px` : height;
  const formattedGap = typeof gap === 'number' ? `${gap}px` : gap;
  const formattedMarginBottom =
    typeof marginBottom === 'number' ? `${marginBottom}px` : marginBottom;

  const isButtonActive = remainingUndos > 0 ? historySize > 0 : historySize >= 1;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex justify-center items-center p-1 select-none max-w-full"
      style={{ gap: formattedGap, marginBottom: formattedMarginBottom }}
    >
      {/* 왼쪽 이동 버튼 */}
      <button
        data-tutorial="left-btn"
        onClick={onLeftClick}
        aria-label="왼쪽으로 이동"
        className="group relative flex-none bg-[#cb7c3e] hover:bg-[#d78442] active:bg-[#9e5522] border-[3px] sm:border-[4px] border-[#592a11] active:border-[#381708] rounded-xl sm:rounded-2xl transition-all duration-100 overflow-hidden flex items-center justify-center cursor-pointer active:scale-[0.96] active:translate-y-0.5 shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(60,25,5,0.3),0_4px_6px_rgba(0,0,0,0.25)] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.2)]"
        style={{
          width: formattedWidth,
          height: formattedHeight,
        }}
      >
        {/* Decorative Wood Grain Detail Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#aa5e25]/40 pointer-events-none group-active:opacity-30" />
        <div className="absolute top-2 right-3 w-4 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 w-5 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />

        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
          style={{
            filter: 'drop-shadow(0px 2px 0px #592a11)',
          }}
        >
          <path
            d="M15 19L8 12L15 5"
            stroke={arrowColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* 찬스 / 되돌리기 동그라미 아이콘 버튼 (시점 1회 이상일 때만 활성화) */}
      {showChanceButton && (
        <button
          data-tutorial="chance-btn"
          onClick={isButtonActive ? onChanceClick : undefined}
          disabled={!isButtonActive}
          title={
            !isButtonActive && remainingUndos === 0
              ? '되돌릴 수 있는 이전 단계가 1회 이상일 때 활성화됩니다'
              : undefined
          }
          aria-label={
            remainingUndos > 0 ? `되돌리기 (남은 횟수: ${remainingUndos})` : '되돌리기 찬스'
          }
          className={`group relative flex-none rounded-full transition-all duration-100 flex items-center justify-center shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.25)] ${
            isButtonActive
              ? 'cursor-pointer active:scale-[0.94] hover:brightness-110'
              : 'opacity-40 cursor-not-allowed grayscale-[20%]'
          } ${
            remainingUndos > 0
              ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 border border-blue-900/60'
              : 'bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/60'
          }`}
          style={{
            width: formattedHeight,
            height: formattedHeight,
          }}
        >
          {remainingUndos > 0 ? (
            /* 되돌리기 아이콘 (3회 찬스 활성화 시) */
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="z-10"
                style={{
                  filter: 'drop-shadow(0px 1.5px 0px rgba(0,0,0,0.3))',
                }}
              >
                <path
                  d="M3 10H14C17.3137 10 20 12.6863 20 16C20 19.3137 17.3137 22 14 22H9"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M7 6L3 10L7 14"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              {/* 남은 횟수 뱃지 (우상단) */}
              <span className="absolute -top-1 -right-1 z-20 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white shadow-md leading-none">
                {remainingUndos}
              </span>
            </>
          ) : (
            /* 찬스 아이콘 (기본 상태 - 정적 🎁 아이콘) */
            <span className="text-xl sm:text-2xl select-none z-10 filter drop-shadow-md">🎁</span>
          )}
        </button>
      )}

      {/* 오른쪽 이동 버튼 */}
      <button
        data-tutorial="right-btn"
        onClick={onRightClick}
        aria-label="오른쪽으로 이동"
        className="group relative flex-none bg-[#cb7c3e] hover:bg-[#d78442] active:bg-[#9e5522] border-[3px] sm:border-[4px] border-[#592a11] active:border-[#381708] rounded-xl sm:rounded-2xl transition-all duration-100 overflow-hidden flex items-center justify-center cursor-pointer active:scale-[0.96] active:translate-y-0.5 shadow-[inset_0_2px_0_rgba(255,255,255,0.35),inset_0_-3px_0_rgba(60,25,5,0.3),0_4px_6px_rgba(0,0,0,0.25)] active:shadow-[inset_0_3px_6px_rgba(0,0,0,0.45),0_1px_2px_rgba(0,0,0,0.2)]"
        style={{
          width: formattedWidth,
          height: formattedHeight,
        }}
      >
        {/* Decorative Wood Grain Detail Lines */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#aa5e25]/40 pointer-events-none group-active:opacity-30" />
        <div className="absolute top-2 right-3 w-4 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />
        <div className="absolute bottom-2 left-3 w-5 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />

        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
          style={{
            filter: 'drop-shadow(0px 2px 0px #592a11)',
          }}
        >
          <path
            d="M9 5L16 12L9 19"
            stroke={arrowColor}
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default PuzzleControls;
