import React from "react";

export const DEFAULT_CONTROL_SIZE = "46px"; // 버튼 크기
export const DEFAULT_CONTROL_MARGIN_BOTTOM = "4px"; // 하단 여백
export const DEFAULT_ARROW_COLOR = "#FFFFFF"; // 화살표 색상

interface PuzzleControlsProps {
  onUpClick?: () => void;
  onDownClick?: () => void;
  onLeftClick?: () => void;
  onRightClick?: () => void;
  onChanceClick?: () => void;
  remainingUndos?: number;
  historySize?: number;
  showChanceButton?: boolean;
  arrowColor?: string;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onUpClick,
  onDownClick,
  onLeftClick,
  onRightClick,
  onChanceClick,
  remainingUndos = 0,
  historySize = 0,
  showChanceButton = true,
  arrowColor = DEFAULT_ARROW_COLOR,
}) => {
  const isButtonActive =
    remainingUndos > 0 ? historySize > 0 : historySize >= 1;

  const btnStyle =
    "group relative bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 active:from-blue-700 active:to-blue-800 border-[2.5px] border-slate-900 rounded-xl sm:rounded-2xl transition-all duration-100 overflow-hidden flex items-center justify-center cursor-pointer active:scale-[0.94] active:translate-y-0.5 shadow-[inset_0_2px_0_rgba(255,255,255,0.4),0_4px_6px_rgba(0,0,0,0.3)]";

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex flex-col items-center justify-center p-1 select-none max-w-full my-1"
    >
      {/* 4-Way D-Pad Layout */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 items-center justify-center">
        {/* Row 1: Empty, UP, Empty */}
        <div />
        <button
          type="button"
          onClick={onUpClick}
          aria-label="위로 이동"
          className={`${btnStyle} w-12 h-11 sm:w-14 sm:h-12`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
            style={{ filter: "drop-shadow(0px 1.5px 0px rgba(15,23,42,0.6))" }}
          >
            <path
              d="M12 5L19 12M12 5L5 12M12 5V19"
              stroke={arrowColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div />

        {/* Row 2: LEFT, UNDO (Chance), RIGHT */}
        <button
          type="button"
          onClick={onLeftClick}
          aria-label="왼쪽으로 이동"
          className={`${btnStyle} w-12 h-11 sm:w-14 sm:h-12`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
            style={{ filter: "drop-shadow(0px 1.5px 0px rgba(15,23,42,0.6))" }}
          >
            <path
              d="M5 12L12 5M5 12L12 19M5 12H19"
              stroke={arrowColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Center: Undo / Chance Button */}
        {showChanceButton ? (
          <button
            type="button"
            onClick={isButtonActive ? onChanceClick : undefined}
            disabled={!isButtonActive}
            title={
              !isButtonActive && remainingUndos === 0
                ? "이전 단계가 있을 때 되돌릴 수 있습니다"
                : undefined
            }
            aria-label={
              remainingUndos > 0
                ? `되돌리기 (남은 횟수: ${remainingUndos})`
                : "되돌리기 찬스"
            }
            className={`group relative rounded-full transition-all duration-100 flex items-center justify-center w-11 h-11 sm:w-13 sm:h-13 mx-auto shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.25)] ${
              isButtonActive
                ? "cursor-pointer active:scale-[0.94] hover:brightness-110"
                : "opacity-40 cursor-not-allowed grayscale-[20%]"
            } ${
              remainingUndos > 0
                ? "bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 border border-blue-900/60"
                : "bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 border border-amber-900/60"
            }`}
          >
            {remainingUndos > 0 ? (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="z-10"
                  style={{ filter: "drop-shadow(0px 1.5px 0px rgba(0,0,0,0.3))" }}
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
                <span className="absolute -top-1 -right-1 z-20 bg-rose-500 text-white text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-md leading-none">
                  {remainingUndos}
                </span>
              </>
            ) : (
              <span className="text-lg sm:text-xl select-none z-10 filter drop-shadow-md">
                ↩️
              </span>
            )}
          </button>
        ) : (
          <div className="w-11 h-11" />
        )}

        <button
          type="button"
          onClick={onRightClick}
          aria-label="오른쪽으로 이동"
          className={`${btnStyle} w-12 h-11 sm:w-14 sm:h-12`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
            style={{ filter: "drop-shadow(0px 1.5px 0px rgba(15,23,42,0.6))" }}
          >
            <path
              d="M19 12L12 5M19 12L12 19M19 12H5"
              stroke={arrowColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Row 3: Empty, DOWN, Empty */}
        <div />
        <button
          type="button"
          onClick={onDownClick}
          aria-label="아래로 이동"
          className={`${btnStyle} w-12 h-11 sm:w-14 sm:h-12`}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="z-10 transition-transform duration-75 group-active:translate-y-[1px]"
            style={{ filter: "drop-shadow(0px 1.5px 0px rgba(15,23,42,0.6))" }}
          >
            <path
              d="M12 19L5 12M12 19L19 12M12 19V5"
              stroke={arrowColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div />
      </div>
    </div>
  );
};

export default PuzzleControls;
