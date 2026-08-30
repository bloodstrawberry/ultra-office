'use client';

import type { Step } from '../../lib/algorithms/types';

import { Canvas } from '@react-three/fiber';
import React, { useSyncExternalStore } from 'react';
import { Text, OrbitControls } from '@react-three/drei';

interface ThreeDVisualizerProps {
  step: Step;
}

interface BarMeshProps {
  val: number;
  idx: number;
  total: number;
  isComparing: boolean;
  isSwapping: boolean;
  isPivot: boolean;
  isSorted: boolean;
}

const Bar3DMesh: React.FC<BarMeshProps> = ({
  val,
  idx,
  total,
  isComparing,
  isSwapping,
  isPivot,
  isSorted,
}) => {
  // Compute bar dimensions and positions in 3D space
  const spacing = 1.2;
  const startX = -((total - 1) * spacing) / 2;
  const posX = startX + idx * spacing;
  const height = Math.max(0.5, (val / 100) * 5);
  const posY = height / 2;

  // Determine neon color based on algorithm state
  let barColor = '#3b82f6'; // default blue
  let emissiveColor = '#1e3a8a';

  if (isSwapping) {
    barColor = '#ec4899'; // pink
    emissiveColor = '#831843';
  } else if (isComparing) {
    barColor = '#eab308'; // yellow
    emissiveColor = '#713f12';
  } else if (isPivot) {
    barColor = '#8b5cf6'; // purple
    emissiveColor = '#4c1d95';
  } else if (isSorted) {
    barColor = '#10b981'; // emerald
    emissiveColor = '#064e3b';
  }

  return (
    <group position={[posX, 0, 0]}>
      {/* 3D 큐브 막대 */}
      <mesh position={[0, posY, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial
          color={barColor}
          emissive={emissiveColor}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.5}
        />
      </mesh>

      {/* 상단 값 텍스트 */}
      <Text
        position={[0, height + 0.4, 0]}
        fontSize={0.4}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {val}
      </Text>

      {/* 하단 인덱스 텍스트 */}
      <Text
        position={[0, -0.4, 0]}
        fontSize={0.3}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        [{idx}]
      </Text>
    </group>
  );
};

const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export const ThreeDVisualizer: React.FC<ThreeDVisualizerProps> = ({ step }) => {
  const isClient = useIsClient();

  const array = step.array || [25, 60, 40, 85, 10, 50, 75];
  const comparingIndices = new Set(step.comparingIndices || []);
  const swappingIndices = new Set(step.swappingIndices || []);
  const sortedIndices = new Set(step.sortedIndices || []);
  const pivotIndex = step.pivotIndex;

  if (!isClient) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-slate-950/90 rounded-3xl border border-slate-800 text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold">3D 렌더러를 초기화하는 중이에요...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] bg-slate-950/95 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
      {/* 3D 뷰 힌트 배너 */}
      <div className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-700/80 text-[11px] font-bold text-slate-300 flex items-center gap-2 shadow-md">
        <span>🧊 3D 몰입형 뷰</span>
        <span className="text-[10px] text-blue-400 font-normal">
          (화면을 드래그해서 360° 회전해 보세요)
        </span>
      </div>

      {/* React Three Fiber Canvas */}
      <Canvas camera={{ position: [0, 4, 10], fov: 50 }} style={{ width: '100%', height: '100%' }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 15, 10]} intensity={1.5} />
        <directionalLight position={[-10, 10, -5]} intensity={0.5} />

        {/* 3D Bar Grid */}
        <group position={[0, -1, 0]}>
          {array.map((val, idx) => (
            <Bar3DMesh
              key={idx}
              val={val}
              idx={idx}
              total={array.length}
              isComparing={comparingIndices.has(idx)}
              isSwapping={swappingIndices.has(idx)}
              isPivot={pivotIndex === idx}
              isSorted={sortedIndices.has(idx)}
            />
          ))}

          {/* 바닥 반사 그리드 */}
          <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, -0.05, 0]} />
        </group>

        {/* 360도 마우스/터치 컨트롤 */}
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2 + 0.1}
        />
      </Canvas>
    </div>
  );
};
