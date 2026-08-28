'use client';

import type * as THREE from 'three';
import type { BlackHoleConfig } from '../types';

import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import React, { useRef, useMemo, useEffect } from 'react';

import Box from '@mui/material/Box';

import {
  calculateGravityWellDepth,
  calculateSchwarzschildRadius,
  generateGravityWellPhotonTrajectory,
} from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode1Props {
  config: BlackHoleConfig;
}

function RubberSheetGrid({ mass }: { mass: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useEffect(() => {
    if (!geomRef.current) return;
    const pos = geomRef.current.attributes.position;

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const r = Math.sqrt(x * x + z * z);
      const depth = calculateGravityWellDepth(r, mass);
      pos.setZ(i, depth);
    }

    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();
  }, [mass]);

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry ref={geomRef} args={[26, 26, 44, 44]} />
      <meshStandardMaterial
        color="#0284c7"
        wireframe
        emissive="#0369a1"
        emissiveIntensity={0.25}
        roughness={0.5}
      />
    </mesh>
  );
}

function GravityWellBlackHole({ mass }: { mass: number }) {
  const rs = calculateSchwarzschildRadius(mass) * 0.45;
  const depthAtCenter = calculateGravityWellDepth(0.01, mass);

  return (
    <group position={[0, depthAtCenter + rs * 0.5, 0]}>
      {/* Event Horizon Black Sphere */}
      <mesh>
        <sphereGeometry args={[rs, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Horizon Glow Ring */}
      <mesh>
        <sphereGeometry args={[rs * 1.08, 32, 32]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

function FiredPhotonParticle({ config }: { config: BlackHoleConfig }) {
  const particleRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(0);

  const trajectoryPoints = useMemo(
    () => generateGravityWellPhotonTrajectory(config.mass, config.impactParameter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.mass, config.impactParameter, config.photonShootId]
  );

  useFrame((_, delta) => {
    if (!particleRef.current || trajectoryPoints.length === 0) return;
    if (!config.isPaused) {
      progressRef.current += delta * 1.8 * config.simSpeed;
      if (progressRef.current >= trajectoryPoints.length - 1) {
        progressRef.current = 0;
      }
    }

    const idx = Math.floor(progressRef.current);
    const p1 = trajectoryPoints[idx];
    const p2 = trajectoryPoints[Math.min(idx + 1, trajectoryPoints.length - 1)];

    if (p1 && p2) {
      const alpha = progressRef.current - idx;
      particleRef.current.position.set(
        p1[0] + (p2[0] - p1[0]) * alpha,
        p1[1] + (p2[1] - p1[1]) * alpha,
        p1[2] + (p2[2] - p1[2]) * alpha
      );
    }
  });

  return (
    <group>
      {trajectoryPoints.length > 2 && (
        <Line points={trajectoryPoints} color="#fbbf24" lineWidth={3.5} transparent opacity={0.9} />
      )}

      <mesh ref={particleRef}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
    </group>
  );
}

export function Mode1GravityWell({ config }: Mode1Props) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: '#020617',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 14, 18], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />
        <pointLight position={[0, 10, 0]} color="#38bdf8" intensity={2.0} />

        <RubberSheetGrid mass={config.mass} />
        <GravityWellBlackHole mass={config.mass} />
        <FiredPhotonParticle config={config} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={6.0}
          maxDistance={35.0}
        />
      </Canvas>
    </Box>
  );
}
