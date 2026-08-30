'use client';

import React, { useState } from 'react';

import { playSwapSound, playFoundSound, playButtonClickSound } from '../../lib/sound';

interface TrieNode {
  char: string;
  isEndOfWord: boolean;
  children: { [char: string]: TrieNode };
}

function createTrieNode(char = ''): TrieNode {
  return {
    char,
    isEndOfWord: false,
    children: {},
  };
}

export const TrieInteractiveView: React.FC = () => {
  const [root, setRoot] = useState<TrieNode>(() => {
    const initRoot = createTrieNode();
    const defaultWords = ['CAT', 'CAR', 'CARD', 'DOG', 'DOT'];
    for (const word of defaultWords) {
      let curr = initRoot;
      for (const ch of word) {
        if (!curr.children[ch]) {
          curr.children[ch] = createTrieNode(ch);
        }
        curr = curr.children[ch];
      }
      curr.isEndOfWord = true;
    }
    return initRoot;
  });

  const [inputWord, setInputWord] = useState<string>('CALL');
  const [searchWord, setSearchWord] = useState<string>('CA');
  const [matchedWords, setMatchedWords] = useState<string[]>(['CAT', 'CAR', 'CARD']);
  const [highlightPath, setHighlightPath] = useState<string[]>([]);
  const [log, setLog] = useState<string>(
    '트라이(Trie)는 문자열의 각 글자를 노드 트리로 저장하여 O(L) 길이 시간 만에 검색과 자동완성을 처리해요.'
  );

  const cloneTrie = (node: TrieNode): TrieNode => {
    const copy = createTrieNode(node.char);
    copy.isEndOfWord = node.isEndOfWord;
    for (const ch in node.children) {
      copy.children[ch] = cloneTrie(node.children[ch]);
    }
    return copy;
  };

  const handleInsert = () => {
    const word = inputWord.trim().toUpperCase();
    if (!word) return;

    const newRoot = cloneTrie(root);
    let curr = newRoot;
    const path: string[] = [];

    for (const ch of word) {
      path.push(ch);
      if (!curr.children[ch]) {
        curr.children[ch] = createTrieNode(ch);
      }
      curr = curr.children[ch];
    }
    curr.isEndOfWord = true;

    setRoot(newRoot);
    setHighlightPath(path);
    setLog(
      `단어 '${word}'을(를) 트라이에 추가했어요. 문자열 길이만큼 ${word.length}번 노드를 탐색/생성했어요.`
    );
    playButtonClickSound();
  };

  const handleSearch = () => {
    const word = searchWord.trim().toUpperCase();
    if (!word) return;

    let curr = root;
    const path: string[] = [];
    let found = true;

    for (const ch of word) {
      path.push(ch);
      if (!curr.children[ch]) {
        found = false;
        break;
      }
      curr = curr.children[ch];
    }

    setHighlightPath(path);

    if (found && curr.isEndOfWord) {
      setLog(`단어 '${word}'이(가) 트라이에 완벽히 등록되어 있어요! (검색 성공)`);
      playFoundSound();
    } else if (found) {
      setLog(`접두사 '${word}'은(는) 존재하지만, 완성된 단어로 등록되어 있지는 않아요.`);
      playSwapSound();
    } else {
      setLog(`문자열 '${word}'을(를) 찾지 못했어요.`);
      playSwapSound();
    }
  };

  const handleAutocomplete = () => {
    const prefix = searchWord.trim().toUpperCase();
    if (!prefix) {
      setMatchedWords([]);
      return;
    }

    let curr = root;
    for (const ch of prefix) {
      if (!curr.children[ch]) {
        setMatchedWords([]);
        setLog(`접두사 '${prefix}'(으)로 시작하는 추천 단어가 없어요.`);
        return;
      }
      curr = curr.children[ch];
    }

    const results: string[] = [];
    const collectWords = (node: TrieNode, currentStr: string) => {
      if (node.isEndOfWord) {
        results.push(currentStr);
      }
      for (const ch in node.children) {
        collectWords(node.children[ch], currentStr + ch);
      }
    };

    collectWords(curr, prefix);
    setMatchedWords(results);
    setLog(`'${prefix}' 접두사 자동완성 결과 총 ${results.length}개의 단어를 찾았어요.`);
    playFoundSound();
  };

  // 재귀 렌더러 for Trie tree
  const renderTrieLevel = (node: TrieNode, pathStr = '', depth = 0): React.ReactNode => {
    const childKeys = Object.keys(node.children);
    if (childKeys.length === 0) return null;

    return (
      <div className="flex flex-wrap items-start justify-center gap-3 pt-2">
        {childKeys.map((ch) => {
          const childNode = node.children[ch];
          const curPath = pathStr + ch;
          const isHighlighted = highlightPath.join('').startsWith(curPath);

          return (
            <div key={ch} className="flex flex-col items-center gap-2">
              <div
                className={`w-11 h-11 rounded-2xl flex flex-col items-center justify-center font-mono font-black text-sm border shadow-lg transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-teal-600 text-white border-teal-300 scale-110 shadow-teal-500/50'
                    : childNode.isEndOfWord
                      ? 'bg-amber-600/30 text-amber-200 border-amber-500/60'
                      : 'bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                <span>{ch}</span>
                {childNode.isEndOfWord && (
                  <span className="text-[8px] px-1 bg-amber-500 text-slate-950 rounded-full font-bold">
                    END
                  </span>
                )}
              </div>
              {renderTrieLevel(childNode, curPath, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 select-none relative overflow-y-auto bg-slate-950/60 rounded-3xl border border-slate-800 backdrop-blur-md shadow-inner gap-4">
      {/* 1. 상단 컨트롤 패널 */}
      <div className="flex flex-col gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* 단어 삽입 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-teal-300">단어 삽입:</span>
            <input
              type="text"
              value={inputWord}
              onChange={(e) => setInputWord(e.target.value.toUpperCase())}
              placeholder="단어 입력 (예: CAT)"
              className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-teal-500"
            />
            <button
              onClick={handleInsert}
              className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              단어 추가하기
            </button>
          </div>

          {/* 단어 검색 & 자동완성 */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-blue-300">검색/접두사:</span>
            <input
              type="text"
              value={searchWord}
              onChange={(e) => setSearchWord(e.target.value.toUpperCase())}
              placeholder="접두사 (예: CA)"
              className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleSearch}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              단어 검색하기
            </button>
            <button
              onClick={handleAutocomplete}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-md"
            >
              자동완성 추천받기
            </button>
          </div>
        </div>

        {/* 자동완성 결과 칩 바 */}
        {matchedWords.length > 0 && (
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400">💡 자동완성 추천:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {matchedWords.map((w, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 rounded-lg text-xs font-mono font-bold"
                >
                  {w}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. 트라이 트리 시각화 캔버스 */}
      <div className="w-full flex-1 min-h-[240px] flex flex-col items-center justify-start p-4 bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-auto">
        <div className="flex flex-col items-center gap-2">
          {/* Root Node */}
          <div className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-600 rounded-xl text-xs font-mono font-bold shadow-md">
            ROOT (시작점)
          </div>
          {renderTrieLevel(root)}
        </div>
      </div>

      {/* 3. 하단 동작 로그 */}
      <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono leading-relaxed">
        <span className="text-teal-400 font-bold mr-2">📌 실시간 안내:</span>
        {log}
      </div>
    </div>
  );
};
