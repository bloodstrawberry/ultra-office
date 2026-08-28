'use client';

import type { TelemetryData, BlackHoleConfig } from '../types';

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
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';

import { playButtonClickSound } from '../utils/sound';
import { calculateBinaryOrbitState, calculateSchwarzschildRadius } from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode6Props {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

function GravitationalWaveMesh({
  frequency,
  amplitude,
  separation,
  isMerged,
}: {
  frequency: number;
  amplitude: number;
  separation: number;
  isMerged: boolean;
}) {
  const geomRef = useRef<THREE.PlaneGeometry>(null);

  useFrame((state) => {
    if (!geomRef.current) return;
    const pos = geomRef.current.attributes.position;
    const time = state.clock.getElapsedTime();
    const colors: number[] = [];

    const waveK = frequency * 0.35;
    const waveOmega = frequency * 2.2;

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      const r = Math.sqrt(x * x + z * z);
      const angle = Math.atan2(z, x);

      let waveZ = 0;
      if (r > separation * 0.4) {
        const quadPhase = 2.0 * angle - waveOmega * time + waveK * r;
        const decay = 1.0 / Math.max(1.0, Math.sqrt(r));
        waveZ = Math.cos(quadPhase) * amplitude * decay * 0.85;

        if (isMerged) {
          waveZ *= Math.exp(-(r * 0.1));
        }
      }

      pos.setZ(i, waveZ);

      const normZ = (waveZ + 1.0) * 0.5;
      const rCol = THREE.MathUtils.lerp(0.08, 0.75, normZ);
      const gCol = THREE.MathUtils.lerp(0.12, 0.35, normZ);
      const bCol = THREE.MathUtils.lerp(0.45, 0.95, normZ);
      colors.push(rCol, gCol, bCol);
    }

    geomRef.current.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    geomRef.current.computeVertexNormals();
  });

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry ref={geomRef} args={[36, 36, 60, 60]} />
      <meshStandardMaterial
        vertexColors
        wireframe
        emissive="#581c87"
        emissiveIntensity={0.4}
        roughness={0.3}
      />
    </mesh>
  );
}

function BinaryBlackHoles({
  config,
  separation,
  onStateUpdate,
}: {
  config: BlackHoleConfig;
  separation: number;
  onStateUpdate: (state: { freq: number; amp: number; isMerged: boolean; sep: number }) => void;
}) {
  const m1 = config.mass;
  const m2 = config.mass * (config.binaryMassRatio || 0.8);
  const rs1 = calculateSchwarzschildRadius(m1) * 0.4;
  const rs2 = calculateSchwarzschildRadius(m2) * 0.4;
  const finalRs = calculateSchwarzschildRadius(m1 + m2) * 0.45;

  const bh1Ref = useRef<THREE.Group>(null);
  const bh2Ref = useRef<THREE.Group>(null);
  const mergedRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const orbit = calculateBinaryOrbitState(time, m1, m2, separation, config.simSpeed);

    if (bh1Ref.current && bh2Ref.current && mergedRef.current) {
      if (orbit.isMerged) {
        bh1Ref.current.visible = false;
        bh2Ref.current.visible = false;
        mergedRef.current.visible = true;
      } else {
        bh1Ref.current.visible = true;
        bh2Ref.current.visible = true;
        mergedRef.current.visible = false;

        bh1Ref.current.position.set(orbit.pos1[0], orbit.pos1[1], orbit.pos1[2]);
        bh2Ref.current.position.set(orbit.pos2[0], orbit.pos2[1], orbit.pos2[2]);
      }
    }

    onStateUpdate({
      freq: orbit.frequency,
      amp: orbit.chirpAmplitude,
      isMerged: orbit.isMerged,
      sep: orbit.separation,
    });
  });

  return (
    <group>
      {/* Black Hole 1 (Primary) */}
      <group ref={bh1Ref} position={[2, 0, 0]}>
        <Trail width={1.4} length={8} color="#a855f7" attenuation={(t) => t * t}>
          <mesh>
            <sphereGeometry args={[rs1, 32, 32]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </Trail>
        <mesh>
          <sphereGeometry args={[rs1 * 1.15, 24, 24]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Black Hole 2 (Secondary) */}
      <group ref={bh2Ref} position={[-2, 0, 0]}>
        <Trail width={1.2} length={8} color="#06b6d4" attenuation={(t) => t * t}>
          <mesh>
            <sphereGeometry args={[rs2, 32, 32]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        </Trail>
        <mesh>
          <sphereGeometry args={[rs2 * 1.15, 24, 24]} />
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Merged Single Black Hole */}
      <group ref={mergedRef} position={[0, 0, 0]} visible={false}>
        <mesh>
          <sphereGeometry args={[finalRs, 36, 36]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh>
          <sphereGeometry args={[finalRs * 1.15, 32, 32]} />
          <meshBasicMaterial color="#c084fc" transparent opacity={0.6} />
        </mesh>
        <Html position={[0, finalRs * 2.2, 0]} center>
          <div
            style={{
              padding: '2px 8px',
              borderRadius: 8,
              background: 'rgba(2, 6, 23, 0.85)',
              border: '1px solid rgba(192, 132, 252, 0.5)',
              fontSize: '10px',
              color: '#c084fc',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
            }}
          >
            합병 완료! (Final Kerr Black Hole)
          </div>
        </Html>
      </group>
    </group>
  );
}

export function Mode6BinaryMerger({ config, onTelemetryUpdate }: Mode6Props) {
  const [separation, setSeparation] = useState<number>(config.binarySeparation || 6.0);
  const [massRatio, setMassRatio] = useState<number>(config.binaryMassRatio || 0.8);
  const [liveState, setLiveState] = useState<{
    freq: number;
    amp: number;
    isMerged: boolean;
    sep: number;
  }>({
    freq: 35,
    amp: 0.8,
    isMerged: false,
    sep: separation,
  });

  const handleStateUpdate = (s: { freq: number; amp: number; isMerged: boolean; sep: number }) => {
    setLiveState(s);
    if (onTelemetryUpdate) {
      const rs = calculateSchwarzschildRadius(config.mass);
      onTelemetryUpdate({
        rs,
        rph: 1.5 * rs,
        risco: 3.0 * rs,
        spin: 0.7,
        impactParameter: 1.5,
        scenario: 'orbit',
        cameraDistanceRs: 15.0,
        redshiftZ: 0.5,
        gravitationalWaveFreq: Math.round(s.freq * 12),
        fps: 60,
      });
    }
  };

  const chirpPoints = useMemo(() => {
    const points: number[] = [];
    const len = 40;
    for (let i = 0; i < len; i += 1) {
      const progress = i / len;
      const f = 2.0 + progress * 6.0;
      const a = (0.2 + progress * 0.8) * Math.sin(progress * f * Math.PI * 4);
      points.push(a);
    }
    return points;
  }, []);

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
      {/* Top Left Binary Control HUD */}
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
          border: '1px solid rgba(168, 85, 247, 0.35)',
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
                bgcolor: '#C084FC',
                boxShadow: '0 0 8px #C084FC',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#C084FC' }}>
              쌍성 블랙홀 & LIGO 중력파
            </Typography>
          </Box>
          <Chip
            label={liveState.isMerged ? '합병 (Merger)' : '나선 접근 (Inspiral)'}
            size="small"
            color={liveState.isMerged ? 'error' : 'secondary'}
            sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
          />
        </Box>

        {/* Real-time Frequency & Mini Chirp SVG */}
        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.75,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8' }}>
              중력파 주파수 (fGW):
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                color: '#C084FC',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
              }}
            >
              {(liveState.freq * 12).toFixed(0)} Hz
            </Typography>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: 32,
              bgcolor: 'rgba(15, 23, 42, 0.8)',
              borderRadius: 1.5,
              overflow: 'hidden',
              p: 0.5,
              border: '1px solid rgba(51, 65, 85, 0.8)',
            }}
          >
            <svg
              viewBox="0 0 160 30"
              style={{ width: '100%', height: '100%', stroke: '#C084FC', fill: 'none' }}
            >
              <path
                d={
                  'M 0 15 ' +
                  chirpPoints.map((val, idx) => `L ${idx * 4} ${15 + val * 12}`).join(' ')
                }
                strokeWidth="1.8"
              />
            </svg>
          </Box>
        </Box>

        {/* Mass Ratio Slider */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600 }}>
              질량비 (q = M2/M1)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#67E8F9', fontFamily: 'monospace' }}
            >
              {massRatio.toFixed(2)}
            </Typography>
          </Box>
          <Slider
            value={massRatio}
            min={0.2}
            max={1.0}
            step={0.05}
            onChange={(_, val) => setMassRatio(val as number)}
            size="small"
            sx={{ color: '#67E8F9' }}
          />
        </Box>

        {/* Orbit Separation Slider */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#CBD5E1', fontWeight: 600 }}>
              초기 궤도 간격 (a)
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: '#C084FC', fontFamily: 'monospace' }}
            >
              {separation.toFixed(1)}
            </Typography>
          </Box>
          <Slider
            value={separation}
            min={2.0}
            max={9.0}
            step={0.5}
            onChange={(_, val) => setSeparation(val as number)}
            size="small"
            sx={{ color: '#C084FC' }}
          />
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<FlashOnRoundedIcon />}
          onClick={() => {
            playButtonClickSound();
            setSeparation(3.5);
          }}
          sx={{
            fontWeight: 800,
            fontSize: '0.75rem',
            background: 'linear-gradient(135deg, #9333EA 0%, #06B6D4 100%)',
          }}
        >
          급속 합병(Merger) 돌입
        </Button>
      </Card>

      <Canvas
        camera={{ position: [0, 16, 22], fov: 50, near: 0.1, far: 1000 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 25, 10]} intensity={1.5} />
        <pointLight position={[0, 5, 0]} color="#a855f7" intensity={2.5} />

        <GravitationalWaveMesh
          frequency={liveState.freq}
          amplitude={liveState.amp}
          separation={liveState.sep}
          isMerged={liveState.isMerged}
        />
        <BinaryBlackHoles
          config={{ ...config, binaryMassRatio: massRatio }}
          separation={separation}
          onStateUpdate={handleStateUpdate}
        />

        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.04}
          minDistance={6.0}
          maxDistance={45.0}
        />
      </Canvas>
    </Box>
  );
}
