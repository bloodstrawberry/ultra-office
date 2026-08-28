'use client';

import type * as THREE from 'three';
import type { TelemetryData, BlackHoleConfig } from '../types';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';

import Box from '@mui/material/Box';

import {
  calculateISCORadius,
  generate3DGeodesicPath,
  classifyImpactScenario,
  calculatePhotonSphereRadius,
  calculateSchwarzschildRadius,
  calculateGravitationalRedshift,
} from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode2Props {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

function Geodesic3DBlackHole({ mass }: { mass: number }) {
  const rs = calculateSchwarzschildRadius(mass);
  const rph = calculatePhotonSphereRadius(mass);

  return (
    <group>
      {/* Event Horizon Black Sphere */}
      <mesh>
        <sphereGeometry args={[rs, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Event Horizon Redshift Border */}
      <mesh>
        <sphereGeometry args={[rs * 1.03, 32, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.3} />
      </mesh>

      {/* Translucent Photon Sphere Shell (Rph) */}
      <mesh>
        <sphereGeometry args={[rph, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.15}
          wireframe
          emissive="#0284c7"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

function Animated3DPhotonRay({
  config,
  onTelemetryUpdate,
}: {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}) {
  const particleRef = useRef<THREE.Mesh>(null);
  const progressRef = useRef<number>(0);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, currentFps: 60 });

  const scenario = classifyImpactScenario(config.impactParameter);

  const pathPoints = useMemo(
    () => generate3DGeodesicPath(config.mass, config.impactParameter),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.mass, config.impactParameter, config.photonShootId]
  );

  useFrame((state, delta) => {
    if (!particleRef.current || pathPoints.length === 0) return;

    if (!config.isPaused) {
      progressRef.current += delta * 2.2 * config.simSpeed;
      if (progressRef.current >= pathPoints.length - 1) {
        progressRef.current = 0;
      }
    }

    const idx = Math.floor(progressRef.current);
    const p1 = pathPoints[idx];
    const p2 = pathPoints[Math.min(idx + 1, pathPoints.length - 1)];

    if (p1 && p2) {
      const alpha = progressRef.current - idx;
      particleRef.current.position.set(
        p1[0] + (p2[0] - p1[0]) * alpha,
        p1[1] + (p2[1] - p1[1]) * alpha,
        p1[2] + (p2[2] - p1[2]) * alpha
      );
    }

    // Telemetry Sync
    const now = performance.now();
    fpsCounterRef.current.frames += 1;
    if (now - fpsCounterRef.current.lastTime >= 500) {
      fpsCounterRef.current.currentFps = Math.round(
        (fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)
      );
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;

      if (onTelemetryUpdate) {
        const rs = calculateSchwarzschildRadius(config.mass);
        const camDist = state.camera.position.length();
        const camDistRs = camDist / rs;

        onTelemetryUpdate({
          rs,
          rph: calculatePhotonSphereRadius(config.mass),
          risco: calculateISCORadius(config.mass, config.spin),
          spin: config.spin,
          impactParameter: config.impactParameter,
          scenario,
          cameraDistanceRs: Number(camDistRs.toFixed(2)),
          redshiftZ: Number(calculateGravitationalRedshift(camDistRs).toFixed(2)),
          fps: fpsCounterRef.current.currentFps,
        });
      }
    }
  });

  const pathColor =
    scenario === 'deflection' ? '#38bdf8' : scenario === 'orbit' ? '#fbbf24' : '#f43f5e';

  return (
    <group>
      {pathPoints.length > 2 && (
        <Line points={pathPoints} color={pathColor} lineWidth={3.8} transparent opacity={0.9} />
      )}

      <mesh ref={particleRef}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

export function Mode2Geodesic3D({ config, onTelemetryUpdate }: Mode2Props) {
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
        camera={{ position: [0, 4, 16], fov: 55, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 15, 10]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={2.5} />

        <Geodesic3DBlackHole mass={config.mass} />
        <Animated3DPhotonRay config={config} onTelemetryUpdate={onTelemetryUpdate} />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          minDistance={3.0}
          maxDistance={35.0}
        />
      </Canvas>
    </Box>
  );
}
