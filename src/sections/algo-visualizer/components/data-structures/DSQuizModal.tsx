'use client';

import type { DSQuizQuestion } from '../../lib/data-structures/types';

import React, { useState } from 'react';

import { playFoundSound, playButtonClickSound } from '../../lib/sound';

interface DSQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: DSQuizQuestion[];
  dsName: string;
}

export const DSQuizModal: React.FC<DSQuizModalProps> = ({ isOpen, onClose, questions, dsName }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  if (!isOpen || !questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQ.correctIndex;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    if (idx === currentQ.correctIndex) {
      playFoundSound();
      setScore((s) => s + 1);
    } else {
      playButtonClickSound();
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 relative">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="text-base font-extrabold text-white">{dsName} 개념 점검 퀴즈</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {!showResult ? (
          <div className="flex flex-col gap-4">
            {/* 진행도 */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                문제 {currentIndex + 1} / {questions.length}
              </span>
              <span className="text-blue-400">현재 점수: {score}점</span>
            </div>

            {/* 질문 본문 */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <p className="text-sm font-extrabold text-white leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* 보기 목록 */}
            <div className="flex flex-col gap-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedAnswer === idx;
                const isCorrectOption = idx === currentQ.correctIndex;

                let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700';
                if (isAnswered) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'bg-rose-600/30 border-rose-400 text-rose-300 font-bold';
                  } else {
                    btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-50';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full p-3.5 rounded-2xl text-xs text-left border transition-all flex items-center justify-between ${btnStyle}`}
                  >
                    <span>
                      {idx + 1}. {option}
                    </span>
                    {isAnswered && isCorrectOption && <span>✓ 정답</span>}
                    {isAnswered && isSelected && !isCorrectOption && <span>✗ 오답</span>}
                  </button>
                );
              })}
            </div>

            {/* 해설 */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed animate-fade-in ${
                  isCorrect
                    ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-600/60 text-rose-300'
                }`}
              >
                <div className="font-extrabold mb-1">
                  {isCorrect ? '🎉 정답입니다!' : '😅 아쉽네요, 다시 확인해보세요!'}
                </div>
                <div className="text-slate-200">{currentQ.explanation}</div>
              </div>
            )}

            {/* 다음 버튼 */}
            {isAnswered && (
              <button
                onClick={handleNext}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all active:scale-95 mt-1"
              >
                {currentIndex < questions.length - 1 ? '다음 문제 ➔' : '결과 확인하기 ➔'}
              </button>
            )}
          </div>
        ) : (
          /* 최종 결과 */
          <div className="flex flex-col items-center justify-center py-6 text-center gap-4">
            <div className="text-5xl">🏆</div>
            <h4 className="text-xl font-black text-white">퀴즈 완료!</h4>
            <p className="text-sm text-slate-300">
              총 {questions.length}문제 중{' '}
              <strong className="text-emerald-400 font-extrabold">{score}</strong>문제를
              맞히셨습니다.
            </p>

            <div className="flex items-center gap-2 mt-2 w-full">
              <button
                onClick={handleRestart}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl border border-slate-700 transition-all"
              >
                다시 풀기
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition-all"
              >
                완료
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
