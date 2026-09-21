'use client';

import type { WoodSignBoardProps } from '../types';

import React from 'react';

export function WoodSignBoard({ label, value, onClick, className = '' }: WoodSignBoardProps) {
  const isClickable = !!onClick;

  return (
    <div
      onClick={onClick}
      className={`relative flex-1 min-w-0 flex flex-col items-center justify-center px-2 py-1.5 sm:px-3 sm:py-2 bg-[#cb7c3e] border-[3px] sm:border-[4px] border-[#592a11] rounded-xl sm:rounded-2xl transition-all duration-150 overflow-hidden ${
        isClickable
          ? 'cursor-pointer hover:brightness-105 active:scale-95 active:translate-y-0.5'
          : ''
      } ${className}`}
      style={{
        boxShadow:
          'inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -3px 0 rgba(60,25,5,0.3), 0 4px 6px rgba(0,0,0,0.25)',
      }}
    >
      {/* Decorative Wood Grain Detail Lines */}
      <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#aa5e25]/40 pointer-events-none" />
      <div className="absolute top-2 right-3 w-4 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />
      <div className="absolute bottom-2 left-3 w-5 h-[1px] bg-[#7d3c0e]/30 pointer-events-none" />

      {/* Top Header Label */}
      <span
        className="text-xs sm:text-sm md:text-base font-black text-white uppercase tracking-wider select-none leading-none mb-1 z-10 antialiased"
        style={{
          WebkitTextStroke: '1px #592a11',
          paintOrder: 'stroke fill',
          textShadow:
            '0 2px 0 #592a11, -1px -1px 0 #592a11, 1px -1px 0 #592a11, -1px 1px 0 #592a11, 1px 1px 0 #592a11',
        }}
      >
        {label}
      </span>

      {/* Main Value */}
      <div
        className="text-base sm:text-xl md:text-2xl font-black text-white tracking-wide select-none leading-none flex items-center justify-center w-full z-10 antialiased"
        style={{
          WebkitTextStroke: '1.2px #592a11',
          paintOrder: 'stroke fill',
          textShadow:
            '0 2px 0 #592a11, -1px -1px 0 #592a11, 1px -1px 0 #592a11, -1px 1px 0 #592a11, 1px 1px 0 #592a11',
        }}
      >
        {value}
      </div>
    </div>
  );
}
