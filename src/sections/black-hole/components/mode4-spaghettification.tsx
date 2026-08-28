'use client';

import type { TelemetryData, BlackHoleConfig, SpaghettifyObject } from '../types';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef, useMemo, useState } from 'react';
import { Html, Trail, OrbitControls } from '@react-three/drei';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import ButtonGroup from '@mui/material/ButtonGroup';
import LinearProgress from '@mui/material/LinearProgress';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { playButtonClickSound } from '../utils/sound';
import {
  calculateISCORadius,
  calculateTidalAcceleration,
  calculatePhotonSphereRadius,
  calculateSchwarzschildRadius,
  calculateGravitationalRedshift,
} from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode4Props {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

function SpaghettificationBlackHole({ mass }: { mass: number }) {
  const rs = calculateSchwarzschildRadius(mass);
  const rph = calculatePhotonSphereRadius(mass);

  return (
    <group>
      {/* Event Horizon (Black Void) */}
      <mesh>
        <sphereGeometry args={[rs, 36, 36]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Fiery Tidal Accretion Horizon Glow */}
      <mesh>
        <sphereGeometry args={[rs * 1.05, 32, 32]} />
        <meshBasicMaterial color="#f43f5e" transparent opacity={0.4} />
      </mesh>

      {/* Translucent Photon Sphere Shell */}
      <mesh>
        <sphereGeometry args={[rph, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.14}
          wireframe
          emissive="#0284c7"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Tidal Disruption Radius Marker (RT ≈ 2.2 Rs) */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[rs * 2.18, rs * 2.24, 48]} />
        <meshBasicMaterial color="#ec4899" side={THREE.DoubleSide} transparent opacity={0.6} />
      </mesh>

      <Html position={[0, rs * 2.35, 0]} center>
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid rgba(236, 72, 153, 0.5)',
            fontSize: '10px',
            color: '#f472b6',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          조석 파괴 한계선 (Tidal Disruption Radius: RT)
        </div>
      </Html>
    </group>
  );
}

function TidalDebrisStream({
  originPos,
  active,
}: {
  originPos: [number, number, number];
  active: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state) => {
    if (!pointsRef.current || !active) return;
    const posAttr = pointsRef.current.geometry.attributes.position;
    const [ox, , oz] = originPos;
    const time = state.clock.getElapsedTime();

    for (let i = 0; i < count; i += 1) {
      const initialPhase = (i * 0.037 + i * i * 0.007) % 1.0;
      const t = (initialPhase + time * 0.8) % 1.0;
      const curR = THREE.MathUtils.lerp(Math.sqrt(ox * ox + oz * oz), 0.5, t);
      const angle = Math.atan2(oz, ox) + t * 4.5;
      const spreadY = Math.sin(i * 99) * 0.3 * (1.0 - t);

      posAttr.setXYZ(i, curR * Math.cos(angle), spreadY, curR * Math.sin(angle));
    }
    posAttr.needsUpdate = true;
  });

  if (!active) return null;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#fb7185"
        size={0.18}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function FallingSpaghettifiedObject({
  config,
  distanceRs,
  objType,
  onTelemetryUpdate,
}: {
  config: BlackHoleConfig;
  distanceRs: number;
  objType: SpaghettifyObject;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, currentFps: 60 });

  const rs = calculateSchwarzschildRadius(config.mass);
  const r = Math.max(rs * 1.02, distanceRs * rs);
  const isShredded = distanceRs <= 2.2;

  const stretchFactor = Math.min(
    22.0,
    1.0 + Math.pow(Math.max(0.1, 4.8 / Math.max(0.8, distanceRs)), 2.6)
  );
  const squeezeFactor = Math.max(0.12, 1.0 / Math.sqrt(stretchFactor));

  useFrame((state) => {
    if (!meshRef.current) return;

    meshRef.current.position.set(r, 0, 0);
    meshRef.current.scale.set(stretchFactor, squeezeFactor, squeezeFactor);

    const now = performance.now();
    fpsCounterRef.current.frames += 1;
    if (now - fpsCounterRef.current.lastTime >= 500) {
      fpsCounterRef.current.currentFps = Math.round(
        (fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)
      );
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;

      if (onTelemetryUpdate) {
        const camDist = state.camera.position.length();
        const tidalAcc = calculateTidalAcceleration(config.mass, distanceRs);

        onTelemetryUpdate({
          rs,
          rph: calculatePhotonSphereRadius(config.mass),
          risco: calculateISCORadius(config.mass, config.spin),
          spin: config.spin,
          impactParameter: config.impactParameter,
          scenario: 'plunge',
          cameraDistanceRs: Number((camDist / rs).toFixed(2)),
          redshiftZ: Number(calculateGravitationalRedshift(distanceRs).toFixed(2)),
          tidalForceG: Number(tidalAcc.toFixed(1)),
          fps: fpsCounterRef.current.currentFps,
        });
      }
    }
  });

  return (
    <group>
      <group ref={meshRef}>
        {objType === 'star' ? (
          <Trail width={1.8} length={8} color="#f43f5e" attenuation={(t) => t * t}>
            <mesh>
              <sphereGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial
                color="#fda4af"
                emissive="#f43f5e"
                emissiveIntensity={1.4}
                roughness={0.2}
              />
            </mesh>
          </Trail>
        ) : objType === 'astronaut' ? (
          <group>
            <mesh position={[0, 0, 0]}>
              <capsuleGeometry args={[0.2, 0.6, 12, 16]} />
              <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.5} />
            </mesh>
            <mesh position={[0.2, 0.2, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#f59e0b" roughness={0.1} />
            </mesh>
          </group>
        ) : (
          <mesh>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial
              color="#a855f7"
              wireframe
              emissive="#7e22ce"
              emissiveIntensity={0.8}
            />
          </mesh>
        )}
      </group>

      <TidalDebrisStream originPos={[r, 0, 0]} active={isShredded} />
    </group>
  );
}

function Mode4AutoDropper({
  isAutoDropping,
  config,
  setDistanceRs,
  setIsAutoDropping,
}: {
  isAutoDropping: boolean;
  config: BlackHoleConfig;
  setDistanceRs: React.Dispatch<React.SetStateAction<number>>;
  setIsAutoDropping: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  useFrame((_, delta) => {
    if (isAutoDropping && !config.isPaused) {
      setDistanceRs((prev) => {
        const next = prev - delta * 1.2 * config.simSpeed;
        if (next <= 1.05) {
          setIsAutoDropping(false);
          return 6.0;
        }
        return next;
      });
    }
  });

  return null;
}

export function Mode4Spaghettification({ config, onTelemetryUpdate }: Mode4Props) {
  const [distanceRs, setDistanceRs] = useState<number>(config.spaghettifyDistance || 3.5);
  const [objType, setObjType] = useState<SpaghettifyObject>(config.spaghettifyObject || 'star');
  const [isAutoDropping, setIsAutoDropping] = useState<boolean>(false);

  const tidalAcc = calculateTidalAcceleration(config.mass, distanceRs);

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
      {/* Top Left Spaghettification Control HUD */}
      <Card
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          p: 2,
          minWidth: 260,
          maxWidth: 300,
          borderRadius: 2.5,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(236, 72, 153, 0.35)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: '#F472B6' }}>
            낙하 대상 물체 선택
          </Typography>
          <Chip
            label={
              distanceRs > 3.8 ? '안전 구역' : distanceRs > 2.2 ? '조석 변형' : '스파게티화 파괴!'
            }
            size="small"
            color={distanceRs > 3.8 ? 'info' : distanceRs > 2.2 ? 'warning' : 'error'}
            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
          />
        </Box>

        <ButtonGroup size="small" fullWidth>
          {(
            [
              { id: 'star', label: '⭐ 천체' },
              { id: 'astronaut', label: '👨‍🚀 우주선' },
              { id: 'cube', label: '🧊 큐브' },
            ] as const
          ).map((item) => (
            <Button
              key={item.id}
              variant={objType === item.id ? 'contained' : 'outlined'}
              onClick={() => {
                playButtonClickSound();
                setObjType(item.id);
              }}
              sx={{
                fontSize: '0.7rem',
                fontWeight: 700,
                borderColor: objType === item.id ? '#EC4899' : 'rgba(51, 65, 85, 0.8)',
                bgcolor: objType === item.id ? '#EC4899' : 'transparent',
                '&:hover': { bgcolor: objType === item.id ? '#DB2777' : 'rgba(236, 72, 153, 0.1)' },
              }}
            >
              {item.label}
            </Button>
          ))}
        </ButtonGroup>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600 }}>
              블랙홀 거리 (r)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#F472B6', fontFamily: 'monospace' }}
            >
              {distanceRs.toFixed(2)} Rs
            </Typography>
          </Box>
          <Slider
            value={distanceRs}
            min={1.05}
            max={7.0}
            step={0.05}
            onChange={(_, val) => {
              setIsAutoDropping(false);
              setDistanceRs(val as number);
            }}
            size="small"
            sx={{ color: '#EC4899' }}
          />
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={isAutoDropping ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
          onClick={() => {
            playButtonClickSound();
            setIsAutoDropping((prev) => !prev);
          }}
          sx={{
            fontWeight: 800,
            fontSize: '0.75rem',
            background: isAutoDropping
              ? 'linear-gradient(135deg, #E11D48 0%, #BE123C 100%)'
              : 'linear-gradient(135deg, #EC4899 0%, #F43F5E 100%)',
          }}
        >
          {isAutoDropping ? '낙하 일시정지' : '지평선 자유 낙하 시작'}
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.5,
            pt: 1,
            borderTop: '1px solid rgba(51, 65, 85, 0.8)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              조석 장력 (상대 가속도):
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#FB7185', fontFamily: 'monospace' }}
            >
              {tidalAcc.toFixed(0)} G/m
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (tidalAcc / 150) * 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: 'rgba(51, 65, 85, 0.8)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #38BDF8 0%, #FCD34D 50%, #F43F5E 100%)',
              },
            }}
          />
        </Box>
      </Card>

      <Canvas
        camera={{ position: [0, 8, 18], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} color="#f43f5e" intensity={3.0} />

        <Mode4AutoDropper
          isAutoDropping={isAutoDropping}
          config={config}
          setDistanceRs={setDistanceRs}
          setIsAutoDropping={setIsAutoDropping}
        />
        <SpaghettificationBlackHole mass={config.mass} />
        <FallingSpaghettifiedObject
          config={config}
          distanceRs={distanceRs}
          objType={objType}
          onTelemetryUpdate={onTelemetryUpdate}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          minDistance={3.0}
          maxDistance={40.0}
        />
      </Canvas>
    </Box>
  );
}
