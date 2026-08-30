'use client';

import React, { useState } from 'react';

import { useVisualizerStore } from '../../store/visualizerStore';

interface CustomInputModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomInputModal: React.FC<CustomInputModalProps> = ({ isOpen, onClose }) => {
  const {
    currentAlgo,
    customArray,
    searchTarget,
    twoPointerTarget,
    customTreeValues,
    setCustomArray,
    setSearchTarget,
    setTwoPointerTarget,
    setCustomTreeValues,
    generateRandomArray,
    generateReversedArray,
    generateNearlySortedArray,
  } = useVisualizerStore();

  const [arraySize, setArraySize] = useState<number>(customArray.length || 12);
  const [textInput, setTextInput] = useState<string>(customArray.join(', '));
  const [searchTargetInput, setSearchTargetInput] = useState<number>(searchTarget);
  const [twoPointerTargetInput, setTwoPointerTargetInput] = useState<number>(twoPointerTarget);
  const [treeTextInput, setTreeTextInput] = useState<string>(customTreeValues.join(', '));

  if (!isOpen) return null;

  const handleApplyArrayText = () => {
    const parsed = textInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    if (parsed.length > 0) {
      setCustomArray(parsed.slice(0, 30));
      onClose();
    }
  };

  const handleApplyTreeText = () => {
    const parsed = treeTextInput
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !Number.isNaN(n));

    if (parsed.length > 0) {
      setCustomTreeValues(parsed.slice(0, 15));
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative">
        {/* 상단 타이틀 */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚙️</span>
            <h3 className="text-base font-extrabold text-white">커스텀 데이터 설정</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {/* 1. 정렬 & 탐색 배열 설정 */}
        {currentAlgo.category === 'sorting' || currentAlgo.category === 'search' ? (
          <div className="flex flex-col gap-4">
            {/* 프리셋 생성 버튼 */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-2 block">
                배열 프리셋 자동 생성
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    generateRandomArray(arraySize);
                    onClose();
                  }}
                  className="py-2 px-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  🎲 랜덤 배열
                </button>
                <button
                  onClick={() => {
                    generateReversedArray(arraySize);
                    onClose();
                  }}
                  className="py-2 px-3 bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  📉 역순 배열
                </button>
                <button
                  onClick={() => {
                    generateNearlySortedArray(arraySize);
                    onClose();
                  }}
                  className="py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-2xl text-xs font-bold transition-all active:scale-95"
                >
                  ✨ 거의 정렬됨
                </button>
              </div>
            </div>

            {/* 배열 크기 조절 슬라이더 */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-1">
                <span>배열 원소 개수 (N)</span>
                <span className="font-mono text-blue-400 font-extrabold">{arraySize}개</span>
              </div>
              <input
                type="range"
                min={5}
                max={24}
                value={arraySize}
                onChange={(e) => setArraySize(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* 직접 배열 입력 */}
            <div>
              <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                배열 직접 입력 (콤마로 구분)
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="예: 45, 12, 89, 34, 67, 23"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* 탐색 타겟 입력 */}
            {currentAlgo.id === 'linearSearch' || currentAlgo.id === 'binarySearch' ? (
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  탐색할 타겟 값 (Target)
                </label>
                <input
                  type="number"
                  value={searchTargetInput}
                  onChange={(e) => setSearchTargetInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : null}

            {/* 투 포인터 타겟 합 입력 */}
            {currentAlgo.id === 'twoPointer' ? (
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  목표 합 (Target Sum)
                </label>
                <input
                  type="number"
                  value={twoPointerTargetInput}
                  onChange={(e) => setTwoPointerTargetInput(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {/* 2. 트리 데이터 설정 */}
        {currentAlgo.category === 'tree' ? (
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold text-slate-300 block">
              BST 삽입 노드 값 목록 (순서대로 삽입)
            </label>
            <input
              type="text"
              value={treeTextInput}
              onChange={(e) => setTreeTextInput(e.target.value)}
              placeholder="예: 50, 30, 70, 20, 40, 60, 80"
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-blue-500"
            />
          </div>
        ) : null}

        {/* 3. 그래프/그리드 설정 안내 */}
        {currentAlgo.category === 'graph' ? (
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed flex flex-col gap-2">
            <span className="font-bold text-blue-300">💡 2D 그리드 인터랙션 팁:</span>
            <p>• 캔버스를 클릭하거나 마우스로 드래그하여 벽(장애물)을 자유롭게 그릴 수 있습니다.</p>
            <p>• 상단 툴바의 출발지(🚀) 및 도착지(🎯) 모드를 켜서 위치를 변경해보세요.</p>
            <p>• [재귀 미로]나 [랜덤 장애물] 버튼으로 복잡한 미로를 바로 생성할 수 있습니다.</p>
          </div>
        ) : null}

        {/* 하단 확인 버튼 */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-2xl transition-all"
          >
            취소
          </button>
          <button
            onClick={() => {
              if (currentAlgo.category === 'sorting' || currentAlgo.category === 'search') {
                if (currentAlgo.id === 'linearSearch' || currentAlgo.id === 'binarySearch') {
                  setSearchTarget(searchTargetInput);
                } else if (currentAlgo.id === 'twoPointer') {
                  setTwoPointerTarget(twoPointerTargetInput);
                }
                handleApplyArrayText();
              } else if (currentAlgo.category === 'tree') {
                handleApplyTreeText();
              } else {
                onClose();
              }
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all active:scale-95"
          >
            적용하기
          </button>
        </div>
      </div>
    </div>
  );
};
