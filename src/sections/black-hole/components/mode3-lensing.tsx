'use client';

import type { TelemetryData, BlackHoleConfig } from '../types';

import * as THREE from 'three';
import React, { useRef, useMemo, useEffect } from 'react';
import { ScreenQuad, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';

import Box from '@mui/material/Box';

import { BlackHoleShader } from '../shaders/black-hole-shader';
import {
  calculateISCORadius,
  classifyImpactScenario,
  calculatePhotonSphereRadius,
  calculateSchwarzschildRadius,
  calculateGravitationalRedshift,
} from '../physics-engine';

// ----------------------------------------------------------------------

interface Mode3Props {
  config: BlackHoleConfig;
  onTelemetryUpdate?: (data: TelemetryData) => void;
}

function LensingShaderMesh({ config, onTelemetryUpdate }: Mode3Props) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size, camera } = useThree();
  const fpsCounterRef = useRef({ frames: 0, lastTime: 0, currentFps: 60 });
  const infallProgressRef = useRef<number>(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(1920, 1080) },
      uCameraPosition: { value: new THREE.Vector3() },
      uCameraTarget: { value: new THREE.Vector3(0, 0, 0) },
      uMass: { value: config.mass },
      uSpin: { value: config.spin },
      uShowAccretionDisk: { value: config.showAccretionDisk },
      uDiskTemperature: { value: config.diskTemperature },
      uDiskDensity: { value: config.diskDensity },
      uDiskInnerRadius: {
        value: calculateISCORadius(config.mass, config.spin) * config.diskInnerRadiusMult,
      },
      uDiskOuterRadius: { value: config.diskOuterRadius },
      uEnableDopplerBeaming: { value: config.enableDopplerBeaming },
      uShowPhotonSphere: { value: config.showPhotonSphere },
      uBackgroundMode: {
        value: config.backgroundMode === 'milkyway' ? 0 : config.backgroundMode === 'grid' ? 1 : 2,
      },
      uRedshiftFactor: { value: 0.0 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    if (!materialRef.current) return;
    const u = materialRef.current.uniforms;
    u.uMass.value = config.mass;
    u.uSpin.value = config.spin;
    u.uShowAccretionDisk.value = config.showAccretionDisk;
    u.uDiskTemperature.value = config.diskTemperature;
    u.uDiskDensity.value = config.diskDensity;
    u.uDiskInnerRadius.value =
      calculateISCORadius(config.mass, config.spin) * config.diskInnerRadiusMult;
    u.uDiskOuterRadius.value = config.diskOuterRadius;
    u.uEnableDopplerBeaming.value = config.enableDopplerBeaming;
    u.uShowPhotonSphere.value = config.showPhotonSphere;
    u.uBackgroundMode.value =
      config.backgroundMode === 'milkyway' ? 0 : config.backgroundMode === 'grid' ? 1 : 2;
  }, [config]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    const dpr = state.viewport.dpr || 1;
    materialRef.current.uniforms.uResolution.value.set(size.width * dpr, size.height * dpr);

    if (!config.isPaused) {
      materialRef.current.uniforms.uTime.value += delta * config.simSpeed;
    }

    const camPos = camera.position;
    materialRef.current.uniforms.uCameraPosition.value.copy(camPos);
    materialRef.current.uniforms.uCameraTarget.value.set(0, 0, 0);

    const rs = calculateSchwarzschildRadius(config.mass);
    const camDist = camPos.length();
    const camDistRs = camDist / rs;

    let redshift = 0.0;
    if (config.cameraMode === 'infall') {
      infallProgressRef.current += delta * 0.4 * config.simSpeed;
      const targetR = Math.max(rs * 1.05, 14.0 - infallProgressRef.current * 3.5);
      const angle = infallProgressRef.current * 0.8;

      camera.position.set(
        targetR * Math.cos(angle),
        1.0 + Math.sin(angle * 0.5) * 0.5,
        targetR * Math.sin(angle)
      );
      camera.lookAt(0, 0, 0);

      if (targetR < rs * 3.0) {
        redshift = Math.min(2.5, (rs * 3.0 - targetR) * 0.8);
      }
    } else {
      infallProgressRef.current = 0;
    }
    materialRef.current.uniforms.uRedshiftFactor.value = redshift;

    const now = performance.now();
    fpsCounterRef.current.frames += 1;
    if (now - fpsCounterRef.current.lastTime >= 500) {
      fpsCounterRef.current.currentFps = Math.round(
        (fpsCounterRef.current.frames * 1000) / (now - fpsCounterRef.current.lastTime)
      );
      fpsCounterRef.current.frames = 0;
      fpsCounterRef.current.lastTime = now;

      if (onTelemetryUpdate) {
        onTelemetryUpdate({
          rs,
          rph: calculatePhotonSphereRadius(config.mass),
          risco: calculateISCORadius(config.mass, config.spin),
          spin: config.spin,
          impactParameter: config.impactParameter,
          scenario: classifyImpactScenario(config.impactParameter),
          cameraDistanceRs: Number(camDistRs.toFixed(2)),
          redshiftZ: Number(calculateGravitationalRedshift(camDistRs).toFixed(2)),
          fps: fpsCounterRef.current.currentFps,
        });
      }
    }
  });

  return (
    <ScreenQuad>
      <shaderMaterial
        ref={materialRef}
        vertexShader={BlackHoleShader.vertexShader}
        fragmentShader={BlackHoleShader.fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </ScreenQuad>
  );
}

export function Mode3Lensing({ config, onTelemetryUpdate }: Mode3Props) {
  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        bgcolor: '#000000',
        overflow: 'hidden',
      }}
    >
      <Canvas
        camera={{ position: [0, 2.5, 13], fov: 60, near: 0.1, far: 1000 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance',
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <LensingShaderMesh config={config} onTelemetryUpdate={onTelemetryUpdate} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={1.0}
          minDistance={1.8}
          maxDistance={35.0}
          enabled={config.cameraMode === 'orbit'}
        />
      </Canvas>
    </Box>
  );
}
