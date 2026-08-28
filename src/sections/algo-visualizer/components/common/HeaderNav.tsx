'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useVisualizerStore } from '../../store/visualizerStore';

interface HeaderNavProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ title, subtitle, showBack = true }) => {
  const pathname = usePathname();
  const { soundEnabled, toggleSound } = useVisualizerStore();

  const navLinks = [
    { href: '/', label: '홈', icon: '🏠' },
    { href: '/data-structures', label: '자료구조', icon: '📦' },
    { href: '/visualizer?algo=quickSort', label: '알고리즘', icon: '⚡' },
    { href: '/challenge', label: '챌린지', icon: '🎮' },
    { href: '/playground', label: '샌드박스', icon: '🛠️' },
    { href: '/compare', label: '비교 모드', icon: '⚖️' },
  ];

  return (
    <header className="bg-slate-900/95 border-b border-slate-800 pl-4 sm:pl-6 pr-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-30 flex-shrink-0 backdrop-blur-md select-none">
      {/* 왼쪽: 로고 / 뒤로가기 */}
      <div className="flex items-center gap-2.5">
        {showBack && pathname !== '/' ? (
          <Link
            href="/"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-2xl text-xs font-bold transition-all border border-slate-700 active:scale-95 shadow-sm"
          >
            <span>←</span>
            <span>홈으로</span>
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-extrabold text-base shadow-md">
              ⚡
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-white flex items-center gap-1.5">
                알고리즘 시각화
                <span className="text-[9px] px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded-full border border-blue-500/40 font-mono font-bold">
                  v1.0
                </span>
              </h1>
            </div>
          </Link>
        )}

        {title && (
          <div className="hidden md:block pl-2.5 border-l border-slate-800">
            <span className="text-xs font-bold text-slate-200">{title}</span>
            {subtitle && <span className="text-[10px] text-slate-400 ml-1.5">({subtitle})</span>}
          </div>
        )}
      </div>

      {/* 중앙: 내비게이션 바로가기 */}
      <nav className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 overflow-x-auto max-w-full">
        {navLinks.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href === '/data-structures' && pathname.startsWith('/data-structures')) ||
            (pathname === '/visualizer' && link.href.startsWith('/visualizer'));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <span>{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 오른쪽: 사운드 토글 */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSound}
          className={`px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
            soundEnabled
              ? 'bg-slate-800 border-slate-700 text-emerald-400'
              : 'bg-slate-900 border-slate-800 text-slate-500'
          }`}
          title={soundEnabled ? '효과음 켜짐' : '효과음 음소거'}
        >
          <span>{soundEnabled ? '🔊' : '🔇'}</span>
          <span className="hidden sm:inline">{soundEnabled ? '사운드 ON' : '사운드 OFF'}</span>
        </button>
      </div>
    </header>
  );
};
