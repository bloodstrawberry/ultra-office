'use client';

import type {
  SceneInstance,
  TelemetryStats,
  BackgroundPreset,
  CameraViewPreset,
  ExampleDefinition,
} from '../types';

import * as THREE from 'three';
import { toast } from 'sonner';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import Box from '@mui/material/Box';

import { StatsHUD } from './stats-hud';
import {
  createCyberGrid,
  disposeThreeObject,
  createStarfieldBackground,
} from '../utils/three-helpers';

// ----------------------------------------------------------------------

export interface ThreeJsCanvasRef {
  captureScreenshot: () => void;
  resetCamera: () => void;
  setCameraPreset: (preset: CameraViewPreset) => void;
  triggerAction: (actionKey: string) => void;
}

interface ThreeJsCanvasProps {
  example: ExampleDefinition;
  params: Record<string, number | string | boolean>;
  backgroundPreset: BackgroundPreset;
  showStats: boolean;
}

export const ThreeJsCanvas = forwardRef<ThreeJsCanvasRef, ThreeJsCanvasProps>(
  ({ example, params, backgroundPreset, showStats }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const controlsRef = useRef<OrbitControls | null>(null);
    const sceneInstanceRef = useRef<SceneInstance | null>(null);
    const bgObjectsRef = useRef<THREE.Object3D[]>([]);

    const [stats, setStats] = useState<TelemetryStats>({
      fps: 60,
      frameTime: 16.6,
      drawCalls: 0,
      triangles: 0,
      geometries: 0,
      textures: 0,
      points: 0,
    });

    // Expose imperative functions via ref
    useImperativeHandle(ref, () => ({
      captureScreenshot: () => {
        if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
        rendererRef.current.render(sceneRef.current, cameraRef.current);
        const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `threejs_${example.id}_${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        toast.success('3D 씬 스크린샷이 PNG로 다운로드되었습니다!');
      },
      resetCamera: () => {
        if (!cameraRef.current || !controlsRef.current) return;
        const [x, y, z] = example.cameraConfig.position;
        cameraRef.current.position.set(x, y, z);
        cameraRef.current.fov = example.cameraConfig.fov || 50;
        cameraRef.current.updateProjectionMatrix();
        controlsRef.current.target.set(
          example.cameraConfig.target?.[0] || 0,
          example.cameraConfig.target?.[1] || 0,
          example.cameraConfig.target?.[2] || 0
        );
        controlsRef.current.update();
      },
      setCameraPreset: (preset: CameraViewPreset) => {
        if (!cameraRef.current || !controlsRef.current) return;
        const dist = 10;
        if (preset === 'top') cameraRef.current.position.set(0, dist, 0.001);
        else if (preset === 'front') cameraRef.current.position.set(0, 0, dist);
        else if (preset === 'side') cameraRef.current.position.set(dist, 0, 0);
        else if (preset === 'isometric')
          cameraRef.current.position.set(dist * 0.7, dist * 0.7, dist * 0.7);
        else {
          const [x, y, z] = example.cameraConfig.position;
          cameraRef.current.position.set(x, y, z);
        }
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      },
      triggerAction: (actionKey: string) => {
        if (sceneInstanceRef.current?.onAction) {
          sceneInstanceRef.current.onAction(actionKey);
        }
      },
    }));

    // Setup Background
    const updateBackground = (scene: THREE.Scene, preset: BackgroundPreset) => {
      // Clear previous bg objects
      bgObjectsRef.current.forEach((obj) => {
        scene.remove(obj);
        disposeThreeObject(obj);
      });
      bgObjectsRef.current = [];

      switch (preset) {
        case 'clean-white':
          scene.background = new THREE.Color(0xf8fafc);
          break;
        case 'deep-navy':
          scene.background = new THREE.Color(0x0a1128);
          break;
        case 'sunset':
          scene.background = new THREE.Color(0x2d0b28);
          break;
        case 'cyber-grid': {
          scene.background = new THREE.Color(0x020617);
          const grid = createCyberGrid(scene, 40, 40);
          bgObjectsRef.current.push(grid);
          break;
        }
        case 'starfield': {
          scene.background = new THREE.Color(0x020617);
          const stars = createStarfieldBackground(scene, 2500);
          bgObjectsRef.current.push(stars);
          break;
        }
        case 'dark-studio':
        default:
          scene.background = new THREE.Color(0x090d16);
          break;
      }
    };

    // Initialize Scene Lifecycle
    useEffect(() => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) {
        return undefined;
      }

      const width = container.clientWidth || 800;
      const height = container.clientHeight || 600;

      // 1. Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      updateBackground(scene, backgroundPreset);

      // 2. Camera
      const [camX, camY, camZ] = example.cameraConfig.position;
      const camera = new THREE.PerspectiveCamera(
        example.cameraConfig.fov || 50,
        width / height,
        0.1,
        1000
      );
      camera.position.set(camX, camY, camZ);
      cameraRef.current = camera;

      // 3. WebGL Renderer
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // 4. OrbitControls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      if (example.cameraConfig.target) {
        controls.target.set(...example.cameraConfig.target);
      }
      controlsRef.current = controls;

      // 5. Init Example Scene
      const sceneInstance = example.initScene({
        scene,
        camera,
        renderer,
        controls,
        params,
        canvas,
        container,
      });
      sceneInstanceRef.current = sceneInstance;

      // 6. Raycaster & Pointer Handlers
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const getPointerCoords = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        raycaster.setFromCamera(pointer, camera);
      };

      const handlePointerMove = (e: MouseEvent) => {
        getPointerCoords(e);
        sceneInstance.onPointerMove?.(e, raycaster);
      };

      const handlePointerDown = (e: MouseEvent) => {
        getPointerCoords(e);
        sceneInstance.onPointerDown?.(e, raycaster);
      };

      const handlePointerUp = (e: MouseEvent) => {
        sceneInstance.onPointerUp?.(e);
      };

      canvas.addEventListener('mousemove', handlePointerMove);
      canvas.addEventListener('mousedown', handlePointerDown);
      canvas.addEventListener('mouseup', handlePointerUp);

      // 7. Animation Frame Loop & Telemetry Tracking
      let animationFrameId: number;
      let lastTime = performance.now();
      let frameCount = 0;
      let lastFpsUpdate = performance.now();

      const clock = new THREE.Clock();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();

        controls.update();

        // Update active scene instance
        sceneInstance.update(elapsedTime, delta, params);

        renderer.render(scene, camera);

        // Stats calculation
        frameCount += 1;
        const now = performance.now();
        const elapsedSinceFps = now - lastFpsUpdate;

        if (elapsedSinceFps >= 500) {
          const currentFps = Math.round((frameCount * 1000) / elapsedSinceFps);
          const frameTime = now - lastTime;

          const info = renderer.info;
          setStats({
            fps: currentFps,
            frameTime,
            drawCalls: info.render.calls,
            triangles: info.render.triangles,
            geometries: info.memory.geometries,
            textures: info.memory.textures,
            points: info.render.points,
          });

          frameCount = 0;
          lastFpsUpdate = now;
        }
        lastTime = now;
      };

      animate();

      // 8. Resize Observer
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const newW = entry.contentRect.width;
          const newH = entry.contentRect.height;
          if (newW > 0 && newH > 0) {
            camera.aspect = newW / newH;
            camera.updateProjectionMatrix();
            renderer.setSize(newW, newH);
          }
        }
      });
      resizeObserver.observe(container);

      // Cleanup
      return () => {
        cancelAnimationFrame(animationFrameId);
        resizeObserver.disconnect();
        canvas.removeEventListener('mousemove', handlePointerMove);
        canvas.removeEventListener('mousedown', handlePointerDown);
        canvas.removeEventListener('mouseup', handlePointerUp);

        sceneInstance.dispose();
        controls.dispose();
        renderer.dispose();
        disposeThreeObject(scene);

        sceneRef.current = null;
        cameraRef.current = null;
        rendererRef.current = null;
        controlsRef.current = null;
        sceneInstanceRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [example.id]);

    // Handle parameter changes dynamically
    useEffect(() => {
      if (sceneInstanceRef.current?.onParamChange) {
        Object.entries(params).forEach(([key, val]) => {
          sceneInstanceRef.current?.onParamChange?.(key, val);
        });
      }
    }, [params]);

    // Handle background preset change
    useEffect(() => {
      if (sceneRef.current) {
        updateBackground(sceneRef.current, backgroundPreset);
      }
    }, [backgroundPreset]);

    return (
      <Box
        ref={containerRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          bgcolor: '#090d16',
          borderRadius: 2,
        }}
      >
        {showStats && <StatsHUD stats={stats} />}

        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            outline: 'none',
          }}
        />
      </Box>
    );
  }
);

ThreeJsCanvas.displayName = 'ThreeJsCanvas';
