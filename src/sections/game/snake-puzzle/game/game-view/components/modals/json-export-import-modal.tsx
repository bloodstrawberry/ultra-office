'use client';

import type { JsonExportImportModalProps } from '../../types';

import React from 'react';

export function JsonExportImportModal({
  exportModalContent,
  importText,
  setImportText,
  onClose,
  handleDownload,
  handleImport,
  onCopyText,
  playSound,
  muted,
}: JsonExportImportModalProps) {
  if (exportModalContent === null) return null;

  const isExportMode = exportModalContent.length > 0;

  return (
    <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[4px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-stone-200 rounded-[28px] max-w-lg w-full p-6 shadow-2xl relative text-stone-800 flex flex-col gap-4 animate-slide-up">
        <div className="text-center border-b border-stone-200 pb-2">
          <h2 className="text-md font-bold text-amber-700 tracking-wide">
            {isExportMode ? '레벨 데이터 내보내기' : '레벨 데이터 가져오기'}
          </h2>
        </div>

        <p className="text-xs text-stone-600">
          {isExportMode
            ? '아래의 레벨 데이터 JSON 문자열을 복사하여 저장하거나 공유하세요:'
            : '불러올 레벨 데이터 JSON 문자열을 아래에 붙여넣어 주세요:'}
        </p>

        <textarea
          readOnly={isExportMode}
          value={isExportMode ? exportModalContent : importText}
          onChange={(e) => {
            if (!isExportMode) {
              setImportText(e.target.value);
            }
          }}
          className="w-full h-32 bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs font-mono text-emerald-700 focus:outline-none focus:border-emerald-500 shadow-inner"
          placeholder='[{"name":"LEVEL 1-1","grid":[[0,0,...]],"timeLimit":180}]'
        />

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              playSound('select', muted);
            }}
            className="px-4 py-2 bg-stone-100 border border-stone-200 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold cursor-pointer"
          >
            취소
          </button>

          {isExportMode ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                파일 다운로드
              </button>
              <button
                type="button"
                onClick={onCopyText}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
              >
                텍스트 복사
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                handleImport(importText);
                setImportText('');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs cursor-pointer shadow-sm"
            >
              가져오기
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
