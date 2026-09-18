import React from 'react';

export const DEFAULT_CONTROL_HEIGHT = '48px';
export const DEFAULT_CONTROL_MARGIN_BOTTOM = '4px';

interface PuzzleControlsProps {
  onChanceClick?: () => void;
  remainingUndos?: number;
  historySize?: number;
  showChanceButton?: boolean;
}

const PuzzleControls: React.FC<PuzzleControlsProps> = ({
  onChanceClick,
  remainingUndos = 0,
  historySize = 0,
  showChanceButton = true,
}) => {
  if (!showChanceButton) return null;

  const isButtonActive = remainingUndos > 0 ? historySize > 0 : historySize >= 1;

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      className="flex justify-center items-center p-1 select-none max-w-full my-0.5"
    >
      {/* 되돌리기 / 찬스 버튼 */}
      <button
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
        className={`group relative px-5 py-2 rounded-2xl transition-all duration-100 flex items-center justify-center gap-2 shadow-[inset_0_1.5px_0_rgba(255,255,255,0.4),0_3px_6px_rgba(0,0,0,0.25)] font-black text-xs sm:text-sm text-white ${
          isButtonActive
            ? 'cursor-pointer active:scale-[0.94] hover:brightness-110'
            : 'opacity-40 cursor-not-allowed grayscale-[20%]'
        } ${
          remainingUndos > 0
            ? 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-700 border border-blue-900/60'
            : 'bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 border border-amber-900/60'
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
            <span>한 수 되돌리기</span>
            <span className="bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full border border-white leading-none">
              {remainingUndos}
            </span>
          </>
        ) : (
          <>
            <span className="text-base select-none z-10 filter drop-shadow-md">🎁</span>
            <span>되돌리기 찬스</span>
          </>
        )}
      </button>
    </div>
  );
};

export default PuzzleControls;
