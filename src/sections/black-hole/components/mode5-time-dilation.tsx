'use client';

import type { TelemetryData, BlackHoleConfig } from '../types';

import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html, Ring, OrbitControls } from '@react-three/drei';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { playButtonClickSound } from '../utils/sound';
import {
  calculateTimeDilationRate,
  calculatePhotonSphereRadius,
  calculateSchwarzschildRadius,
  calculateGravitationalRedshift,
} from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode5Props {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

function TimeDilationBlackHole({ mass }: { mass: number }) {
  const rs = calculateSchwarzschildRadius(mass);
  const rph = calculatePhotonSphereRadius(mass);

  return (
    <group>
      {/* Event Horizon (Black Void) */}
      <mesh>
        <sphereGeometry args={[rs, 36, 36]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Infinite Redshift Horizon Halo */}
      <mesh>
        <sphereGeometry args={[rs * 1.03, 32, 32]} />
        <meshBasicMaterial color="#ef4444" transparent opacity={0.45} />
      </mesh>

      {/* Concentric Distance Rings */}
      {[1.5, 2.0, 3.0, 5.0].map((mult) => (
        <group key={mult} rotation={[Math.PI / 2, 0, 0]}>
          <Ring args={[rs * mult - 0.02, rs * mult + 0.02, 64]} position={[0, 0, 0]}>
            <meshBasicMaterial
              color={mult === 1.5 ? '#38bdf8' : '#64748b'}
              transparent
              opacity={mult === 1.5 ? 0.6 : 0.25}
              side={THREE.DoubleSide}
            />
          </Ring>
        </group>
      ))}

      {/* Photon Sphere Shell */}
      <mesh>
        <sphereGeometry args={[rph, 32, 32]} />
        <meshStandardMaterial
          color="#38bdf8"
          transparent
          opacity={0.12}
          wireframe
          emissive="#0284c7"
          emissiveIntensity={0.3}
        />
      </mesh>

      <Html position={[0, rs * 1.6, 0]} center>
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid rgba(56, 189, 248, 0.5)',
            fontSize: '10px',
            color: '#38bdf8',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          사상의 지평선 (시간 정지선: t → ∞)
        </div>
      </Html>
    </group>
  );
}

function InfallProbe({
  mass,
  heightRs,
  redshiftZ,
  timeDilationRate,
}: {
  mass: number;
  heightRs: number;
  redshiftZ: number;
  timeDilationRate: number;
}) {
  const probeRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const pulseScaleRef = useRef<number>(0);

  const rs = calculateSchwarzschildRadius(mass);
  const r = Math.max(rs * 1.01, heightRs * rs);

  const probeColor = useMemo(() => {
    if (redshiftZ < 0.2) return '#38bdf8';
    if (redshiftZ < 0.8) return '#fbbf24';
    if (redshiftZ < 2.5) return '#f43f5e';
    return '#881337';
  }, [redshiftZ]);

  useFrame((_, delta) => {
    if (!probeRef.current || !pulseRef.current) return;
    probeRef.current.position.set(r, 0, 0);

    pulseScaleRef.current += delta * Math.max(0.08, timeDilationRate * 2.5);
    if (pulseScaleRef.current > 1.0) pulseScaleRef.current = 0;

    const s = 1.0 + pulseScaleRef.current * 1.8;
    pulseRef.current.scale.set(s, s, s);
    const pulseMat = pulseRef.current.material as THREE.MeshBasicMaterial;
    if (pulseMat) {
      pulseMat.opacity = Math.max(0, (1.0 - pulseScaleRef.current) * 0.7);
    }
  });

  return (
    <group ref={probeRef}>
      <mesh>
        <octahedronGeometry args={[0.35, 0]} />
        <meshStandardMaterial
          color={probeColor}
          emissive={probeColor}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </mesh>

      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.38, 16, 16]} />
        <meshBasicMaterial color={probeColor} transparent opacity={0.6} wireframe />
      </mesh>

      <Html position={[0, 0.75, 0]} center>
        <div
          style={{
            padding: '2px 8px',
            borderRadius: 8,
            background: 'rgba(2, 6, 23, 0.85)',
            border: '1px solid rgba(52, 211, 153, 0.5)',
            fontSize: '10px',
            color: '#34d399',
            fontFamily: 'monospace',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          탐사선 시계 속도: {(timeDilationRate * 100).toFixed(1)}%
        </div>
      </Html>
    </group>
  );
}

export function Mode5TimeDilation({ config, onTelemetryUpdate }: Mode5Props) {
  const [heightRs, setHeightRs] = useState<number>(config.timeDilationHeight || 2.5);
  const [stationTime, setStationTime] = useState<number>(0);
  const [probeTime, setProbeTime] = useState<number>(0);
  const [isFalling, setIsFalling] = useState<boolean>(false);

  const timeDilationRate = calculateTimeDilationRate(heightRs);
  const redshiftZ = calculateGravitationalRedshift(heightRs);

  useEffect(() => {
    let lastTs = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastTs) / 1000;
      lastTs = now;

      if (!config.isPaused) {
        setStationTime((prev) => prev + dt * config.simSpeed);
        setProbeTime((prev) => prev + dt * timeDilationRate * config.simSpeed);

        if (isFalling) {
          setHeightRs((prev) => {
            const next = prev - dt * 0.45 * config.simSpeed;
            if (next <= 1.02) {
              setIsFalling(false);
              return 1.02;
            }
            return next;
          });
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [config.isPaused, config.simSpeed, timeDilationRate, isFalling]);

  useEffect(() => {
    if (onTelemetryUpdate) {
      const rs = calculateSchwarzschildRadius(config.mass);
      onTelemetryUpdate({
        rs,
        rph: calculatePhotonSphereRadius(config.mass),
        risco: 3.0 * rs,
        spin: config.spin,
        impactParameter: config.impactParameter,
        scenario: 'plunge',
        cameraDistanceRs: 12.0,
        redshiftZ: Number(redshiftZ.toFixed(2)),
        timeDilationFactor: Number(timeDilationRate.toFixed(3)),
        fps: 60,
      });
    }
  }, [config, heightRs, onTelemetryUpdate, redshiftZ, timeDilationRate]);

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
      {/* Top Left Dual Clock HUD */}
      <Card
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          p: 2,
          minWidth: 280,
          maxWidth: 320,
          borderRadius: 2.5,
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(52, 211, 153, 0.35)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          color: '#F8FAFC',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#34D399',
                boxShadow: '0 0 8px #34D399',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#34D399' }}>
              상대론적 듀얼 시계 계기판
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#94A3B8' }}>
            r = {heightRs.toFixed(2)} Rs
          </Typography>
        </Box>

        {/* Dual Clock Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#38BDF8', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}
            >
              🛰️ 원거리 정거장
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: 'monospace', my: 0.25 }}>
              {stationTime.toFixed(1)}s
            </Typography>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontSize: '0.65rem' }}>
              속도: 100% (정상)
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(52, 211, 153, 0.3)',
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: '#34D399', fontWeight: 700, display: 'block', fontSize: '0.68rem' }}
            >
              🚀 블랙홀 탐사선
            </Typography>
            <Typography
              variant="h6"
              sx={{ fontWeight: 900, fontFamily: 'monospace', color: '#34D399', my: 0.25 }}
            >
              {probeTime.toFixed(1)}s
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: '#34D399', fontWeight: 700, fontSize: '0.65rem' }}
            >
              속도: {(timeDilationRate * 100).toFixed(1)}%
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 1,
            borderRadius: 1.5,
            bgcolor: 'rgba(30, 41, 59, 0.4)',
            fontSize: '0.72rem',
          }}
        >
          <Typography variant="caption" sx={{ color: '#94A3B8' }}>
            지연된 시간 차이 (Δt):
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: '#FCD34D', fontFamily: 'monospace' }}
          >
            +{(stationTime - probeTime).toFixed(2)} 초
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600 }}>
              탐사선 고도 (r)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#34D399', fontFamily: 'monospace' }}
            >
              {heightRs.toFixed(2)} Rs
            </Typography>
          </Box>
          <Slider
            value={heightRs}
            min={1.02}
            max={6.0}
            step={0.02}
            onChange={(_, val) => {
              setIsFalling(false);
              setHeightRs(val as number);
            }}
            size="small"
            sx={{ color: '#34D399' }}
          />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            startIcon={isFalling ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
            onClick={() => {
              playButtonClickSound();
              setIsFalling((prev) => !prev);
            }}
            sx={{
              fontWeight: 800,
              fontSize: '0.72rem',
              bgcolor: isFalling ? '#E11D48' : '#059669',
              '&:hover': { bgcolor: isFalling ? '#BE123C' : '#047857' },
            }}
          >
            {isFalling ? '낙하 중지' : '실시간 낙하'}
          </Button>

          <Button
            variant="outlined"
            size="small"
            color="inherit"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => {
              playButtonClickSound();
              setStationTime(0);
              setProbeTime(0);
              setHeightRs(4.0);
              setIsFalling(false);
            }}
            sx={{
              fontSize: '0.72rem',
              color: '#CBD5E1',
              borderColor: 'rgba(51, 65, 85, 0.8)',
            }}
          >
            시계 리셋
          </Button>
        </Box>
      </Card>

      <Canvas
        camera={{ position: [0, 10, 20], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} />
        <pointLight position={[0, 0, 0]} color="#38bdf8" intensity={2.5} />

        <TimeDilationBlackHole mass={config.mass} />
        <InfallProbe
          mass={config.mass}
          heightRs={heightRs}
          redshiftZ={redshiftZ}
          timeDilationRate={timeDilationRate}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          minDistance={3.0}
          maxDistance={45.0}
        />
      </Canvas>
    </Box>
  );
}
