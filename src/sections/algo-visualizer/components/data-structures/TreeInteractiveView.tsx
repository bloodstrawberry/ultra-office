'use client';

import React, { useRef, useState } from 'react';

import { playFoundSound, playButtonClickSound } from '../../lib/sound';

interface TreeItem {
  id: string;
  name: string;
  depth: number;
  children: TreeItem[];
}

export const TreeInteractiveView: React.FC = () => {
  const [treeData, setTreeData] = useState<TreeItem>({
    id: 'root',
    name: 'Root (최상위 루트)',
    depth: 0,
    children: [
      {
        id: 'c1',
        name: 'Documents (문서)',
        depth: 1,
        children: [
          { id: 'c1-1', name: 'Report.pdf', depth: 2, children: [] },
          { id: 'c1-2', name: 'Resume.docx', depth: 2, children: [] },
        ],
      },
      {
        id: 'c2',
        name: 'Pictures (사진)',
        depth: 1,
        children: [{ id: 'c2-1', name: 'Vacation.jpg', depth: 2, children: [] }],
      },
    ],
  });

  const [newNodeName, setNewNodeName] = useState<string>('New_Folder');
  const [selectedParentId, setSelectedParentId] = useState<string>('root');
  const [log, setLog] = useState<string>(
    '트리는 회로가 없고 서로 다른 두 노드를 잇는 경로가 오직 하나뿐인 비순환 계층형 그래프입니다.'
  );

  const nodeCounterRef = useRef<number>(100);

  const addChildNode = (
    parent: TreeItem,
    targetId: string,
    name: string,
    childId: string
  ): TreeItem => {
    if (parent.id === targetId) {
      const newChild: TreeItem = {
        id: childId,
        name,
        depth: parent.depth + 1,
        children: [],
      };
      return { ...parent, children: [...parent.children, newChild] };
    }
    return {
      ...parent,
      children: parent.children.map((child) => addChildNode(child, targetId, name, childId)),
    };
  };

  const handleAddChild = () => {
    if (!newNodeName.trim()) return;
    const newId = `node-${nodeCounterRef.current++}`;
    setTreeData(addChildNode(treeData, selectedParentId, newNodeName, newId));
    setLog(
      `[자식 노드 추가] 부모 노드(${selectedParentId})에 '${newNodeName}' 자식 노드를 연결했습니다.`
    );
    playButtonClickSound();
  };

  const renderTreeBranches = (node: TreeItem): React.ReactNode => {
    const isSelected = selectedParentId === node.id;
    return (
      <div
        key={node.id}
        className="flex flex-col gap-2 ml-4 sm:ml-6 border-l-2 border-slate-700/80 pl-3 sm:pl-4 my-1"
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedParentId(node.id);
              setLog(
                `[노드 선택] '${node.name}' (Depth: ${node.depth}) 노드가 부모로 선택되었습니다.`
              );
              playFoundSound();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              isSelected
                ? 'bg-green-600 text-white shadow-md shadow-green-600/40 border border-green-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <span>{node.children.length > 0 ? '📁' : '📄'}</span>
            <span>{node.name}</span>
            <span className="text-[10px] opacity-75 font-mono">D:{node.depth}</span>
          </button>
        </div>

        {node.children.map((child) => renderTreeBranches(child))}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
      {/* 컨트롤 바 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newNodeName}
            onChange={(e) => setNewNodeName(e.target.value)}
            placeholder="노드 이름"
            className="w-32 bg-slate-800 border border-slate-700 rounded-2xl px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500"
          />
          <button
            onClick={handleAddChild}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-extrabold text-xs rounded-2xl transition-all active:scale-95 shadow-md flex items-center gap-1.5"
          >
            <span>➕</span>
            <span>선택 부모에 자식 노드 추가</span>
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          선택된 부모: <span className="text-green-400 font-bold">{selectedParentId}</span>
        </div>
      </div>

      {/* 트리 계층 구조 뷰 */}
      <div className="w-full min-h-[200px] bg-slate-950/80 border border-slate-800 rounded-2xl p-5 overflow-x-auto shadow-inner">
        <div className="text-xs font-bold text-slate-400 mb-3 border-b border-slate-800 pb-2">
          🌳 계층적 디렉터리 / DOM 트리 구조
        </div>
        {renderTreeBranches(treeData)}
      </div>

      {/* 상태 로그 */}
      <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs text-slate-300 font-mono">
        {log}
      </div>
    </div>
  );
};
