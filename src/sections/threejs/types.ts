import type * as THREE from 'three';
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// ----------------------------------------------------------------------

export type ThreeCategory =
  | 'geometry'
  | 'shaders'
  | 'particles'
  | 'procedural'
  | 'physics'
  | 'dataviz'
  | 'minigames'
  | 'typography';

export interface CategoryInfo {
  id: ThreeCategory;
  name: string;
  badge: string;
  icon: string;
  description: string;
}

export type ControlType = 'slider' | 'color' | 'switch' | 'select' | 'button';

export interface ParameterControl {
  key: string;
  label: string;
  type: ControlType;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { label: string; value: string | number }[];
  description?: string;
}

export interface ExampleDefinition {
  id: string;
  title: string;
  category: ThreeCategory;
  subtitle: string;
  badge: string;
  description: string;
  keyConcepts: string[];
  defaultParams: Record<string, number | string | boolean>;
  controls: ParameterControl[];
  cameraConfig: {
    position: [number, number, number];
    fov?: number;
    target?: [number, number, number];
  };
  initScene: (ctx: SceneInitContext) => SceneInstance;
  vanillaCode: (params: Record<string, number | string | boolean>) => string;
  r3fCode: (params: Record<string, number | string | boolean>) => string;
}

export interface TelemetryStats {
  fps: number;
  frameTime: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  points: number;
}

export type BackgroundPreset =
  | 'dark-studio'
  | 'cyber-grid'
  | 'starfield'
  | 'sunset'
  | 'clean-white'
  | 'deep-navy';

export type CameraViewPreset = 'perspective' | 'ortho' | 'top' | 'front' | 'side' | 'isometric';

export interface SceneInitContext {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls: OrbitControls;
  params: Record<string, number | string | boolean>;
  canvas: HTMLCanvasElement;
  container: HTMLDivElement;
}

export interface SceneInstance {
  update: (time: number, delta: number, params: Record<string, number | string | boolean>) => void;
  onParamChange?: (key: string, value: number | string | boolean) => void;
  onAction?: (actionKey: string) => void;
  onPointerMove?: (event: MouseEvent, raycaster: THREE.Raycaster) => void;
  onPointerDown?: (event: MouseEvent, raycaster: THREE.Raycaster) => void;
  onPointerUp?: (event: MouseEvent) => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  dispose: () => void;
}
