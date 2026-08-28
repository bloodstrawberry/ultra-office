import type { CategoryInfo, ExampleDefinition } from '../types';

import { initChromeTypographyScene, initParticleTextMorphScene } from './scenes/typography-scenes';
import {
  initDataGlobeScene,
  init3DBarChartMatrixScene,
  initPointCloudClusterScene,
} from './scenes/dataviz-scenes';
import {
  initRubiksCubeScene,
  initVoxelBuilderScene,
  initAsteroidDodgeFlightScene,
} from './scenes/minigame-scenes';
import {
  initInfiniteTerrainScene,
  initProceduralPlanetScene,
  initHyperspaceWarpTunnelScene,
} from './scenes/procedural-scenes';
import {
  initTorusKnotMobiusScene,
  initGeometryShowroomScene,
  initParametricMathSurfacesScene,
} from './scenes/geometry-scenes';
import {
  initPbrStudioScene,
  initToonOutlineScene,
  initHologramShieldScene,
  initCustomGlslPlasmaScene,
} from './scenes/shader-scenes';
import {
  initSpiralGalaxyScene,
  initLorenzAttractorScene,
  initFireworksPhysicsScene,
  initMatrixDigitalRainScene,
} from './scenes/particle-scenes';
import {
  initWaterRippleScene,
  initClothSimulationScene,
  initSolarSystemNBodyScene,
  initBouncingBallsCollisionScene,
} from './scenes/physics-scenes';

// ----------------------------------------------------------------------

export const THREE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'geometry',
    name: '지오메트리 & 기본 도형',
    badge: 'Geometry',
    icon: 'tabler:box-model',
    description: '3D 프리미티브, 버텍스 조작, 토러스 매듭, 파라메트릭 수학 곡면',
  },
  {
    id: 'shaders',
    name: '머티리얼 & GLSL 셰이더',
    badge: 'Shaders & PBR',
    icon: 'tabler:sparkles',
    description: 'PBR 물리 렌더링, 툰 셰이딩, 커스텀 GLSL 버텍스/프래그먼트 셰이더',
  },
  {
    id: 'particles',
    name: '파티클 & 시각 효과 (VFX)',
    badge: 'Particles',
    icon: 'tabler:flame',
    description: '10만 나선 은하, 매트릭스 디지털 레인, 로렌츠 어트랙터, 폭죽 물리',
  },
  {
    id: 'procedural',
    name: '절차적 3D 월드 & 지형',
    badge: 'Procedural',
    icon: 'tabler:mountain',
    description: '펄린 노이즈 3D 지형 바이옴, 대기층 행성, 하이퍼스페이스 워프 터널',
  },
  {
    id: 'physics',
    name: '3D 물리 시뮬레이션',
    badge: 'Physics',
    icon: 'tabler:atom',
    description: '태양계 N-바디 중력 궤도, 질량-스프링 옷감, 탄성 충돌, 수면 파동',
  },
  {
    id: 'dataviz',
    name: '3D 데이터 시각화',
    badge: 'Data Viz',
    icon: 'tabler:chart-dots-3d',
    description: '글로벌 네트워크 아크 지구본, 3D 매트릭스 바 차트, AI 임베딩 포인트 클라우드',
  },
  {
    id: 'minigames',
    name: '인터랙티브 3D 샌드박스',
    badge: 'Mini-Games',
    icon: 'tabler:device-gamepad-2',
    description: '복셀 월드 빌더, 3D 루빅스 큐브, 소행성대 우주선 비행 닷지',
  },
  {
    id: 'typography',
    name: '3D 타이포그래피 & 모션',
    badge: 'Typography',
    icon: 'tabler:typography',
    description: '고광택 크롬 입체 타이포, 텍스트 파티클 분산 & 모핑',
  },
];

// ----------------------------------------------------------------------

export const THREE_EXAMPLES: ExampleDefinition[] = [
  // 1. Geometry Primitives Showroom
  {
    id: 'geom-primitives',
    title: '3D 기하 프리미티브 쇼룸',
    category: 'geometry',
    subtitle: 'Cube, Sphere, Torus, TorusKnot 등 10종 도형 및 노멀 시각화',
    badge: 'Basic Geometry',
    description:
      'Three.js의 다양한 3D 지오메트리를 탐색하고 분할 세부도(Subdivision), 와이어프레임, 버텍스 노멀 벡터 및 동적 파동 변형을 실시간으로 확인합니다.',
    keyConcepts: [
      'THREE.BufferGeometry',
      'THREE.MeshStandardMaterial',
      'VertexNormalsHelper',
      'Attribute Modification (position.needsUpdate)',
    ],
    defaultParams: {
      geomType: 'torusKnot',
      color: '#00d2ff',
      detail: 4,
      metalness: 0.6,
      roughness: 0.2,
      flatShading: false,
      showWireframe: false,
      showNormals: false,
      autoRotate: true,
      rotateSpeed: 1.0,
      vertexWave: false,
    },
    controls: [
      {
        key: 'geomType',
        label: '지오메트리 형태',
        type: 'select',
        options: [
          { label: 'Torus Knot (토러스 매듭)', value: 'torusKnot' },
          { label: 'Cube (육면체)', value: 'cube' },
          { label: 'Sphere (구)', value: 'sphere' },
          { label: 'Torus (도넛)', value: 'torus' },
          { label: 'Icosahedron (20면체)', value: 'icosahedron' },
          { label: 'Dodecahedron (12면체)', value: 'dodecahedron' },
          { label: 'Octahedron (8면체)', value: 'octahedron' },
          { label: 'Cylinder (원기둥)', value: 'cylinder' },
          { label: 'Capsule (캡슐)', value: 'capsule' },
          { label: 'Cone (원뿔)', value: 'cone' },
        ],
      },
      { key: 'color', label: '메쉬 색상', type: 'color' },
      { key: 'detail', label: '분할 세부도 (Segments)', type: 'slider', min: 1, max: 8, step: 1 },
      { key: 'metalness', label: '금속성 (Metalness)', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'roughness', label: '거칠기 (Roughness)', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'flatShading', label: '플랫 셰이딩 (Flat Shading)', type: 'switch' },
      { key: 'showWireframe', label: '와이어프레임 표시', type: 'switch' },
      { key: 'showNormals', label: '버텍스 법선(Normal) 벡터 표시', type: 'switch' },
      { key: 'vertexWave', label: '버텍스 파동 변형 애니메이션', type: 'switch' },
      { key: 'autoRotate', label: '자동 회전', type: 'switch' },
      { key: 'rotateSpeed', label: '회전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 2, 7], fov: 50 },
    initScene: initGeometryShowroomScene,
    vanillaCode: (p) => `
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 2, 7);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
dirLight.position.set(10, 20, 15);
scene.add(dirLight);

// Geometry & Material
const geometry = new THREE.TorusKnotGeometry(1.6, 0.5, 64, 16);
const material = new THREE.MeshStandardMaterial({
  color: '${p.color || '#00d2ff'}',
  metalness: ${p.metalness || 0.6},
  roughness: ${p.roughness || 0.2},
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

function animate(time) {
  requestAnimationFrame(animate);
  mesh.rotation.y = time * 0.001 * ${p.rotateSpeed || 1.0};
  controls.update();
  renderer.render(scene, camera);
}
animate(0);`,
    r3fCode: (p) => `
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

function PrimitivesMesh() {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5 * ${p.rotateSpeed || 1.0};
  });

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[1.6, 0.5, 64, 16]} />
      <meshStandardMaterial
        color="${p.color || '#00d2ff'}"
        metalness={${p.metalness || 0.6}}
        roughness={${p.roughness || 0.2}}
      />
    </mesh>
  );
}

export default function App() {
  return (
    <Canvas camera={{ position: [0, 2, 7], fov: 50 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 15]} intensity={2.0} />
      <PrimitivesMesh />
      <OrbitControls makeDefault />
    </Canvas>
  );
}`,
  },

  // 2. Torus Knot & Mobius Strip
  {
    id: 'geom-torus-mobius',
    title: '토러스 매듭 & 뫼비우스 띠',
    category: 'geometry',
    subtitle: '복합 토러스 매듭 및 단면 뫼비우스 리본 기하학',
    badge: 'Topology & Ribbon',
    description:
      '수학적 매개변수 p, q 와인딩을 가진 복합 토러스 매듭과 위상수학의 대표적인 단면 뫼비우스 띠(Möbius Strip)를 생성하고 렌더링합니다.',
    keyConcepts: [
      'THREE.TorusKnotGeometry (p, q parameter)',
      'Parametric Ribbon Generation',
      'DoubleSide Face Rendering',
      'Iridescence Clearcoat PBR',
    ],
    defaultParams: {
      mode: 'knot',
      p: 2,
      q: 3,
      tubeRadius: 0.4,
      color: '#a855f7',
      rotateSpeed: 1.0,
    },
    controls: [
      {
        key: 'mode',
        label: '도형 모드',
        type: 'select',
        options: [
          { label: 'Torus Knot (토러스 매듭)', value: 'knot' },
          { label: 'Möbius Strip (뫼비우스 띠)', value: 'mobius' },
        ],
      },
      { key: 'color', label: '색상', type: 'color' },
      { key: 'p', label: 'Knot P 권선수', type: 'slider', min: 1, max: 10, step: 1 },
      { key: 'q', label: 'Knot Q 권선수', type: 'slider', min: 1, max: 10, step: 1 },
      { key: 'tubeRadius', label: '튜브 두께', type: 'slider', min: 0.1, max: 0.8, step: 0.05 },
      { key: 'rotateSpeed', label: '회전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 7], fov: 45 },
    initScene: initTorusKnotMobiusScene,
    vanillaCode: (p) => `
import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 7);

const geom = new THREE.TorusKnotGeometry(2.0, ${p.tubeRadius || 0.4}, 256, 32, ${p.p || 2}, ${p.q || 3});
const mat = new THREE.MeshPhysicalMaterial({
  color: '${p.color || '#a855f7'}',
  metalness: 0.9,
  roughness: 0.15,
  clearcoat: 1.0,
  iridescence: 0.8,
});
const mesh = new THREE.Mesh(geom, mat);
scene.add(mesh);`,
    r3fCode: (p) => `
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 7] }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} />
      <mesh>
        <torusKnotGeometry args={[2.0, ${p.tubeRadius || 0.4}, 256, 32, ${p.p || 2}, ${p.q || 3}]} />
        <meshPhysicalMaterial
          color="${p.color || '#a855f7'}"
          metalness={0.9}
          roughness={0.15}
          clearcoat={1.0}
          iridescence={0.8}
        />
      </mesh>
      <OrbitControls />
    </Canvas>
  );
}`,
  },

  // 3. Parametric Math Surfaces
  {
    id: 'geom-math-surfaces',
    title: '파라메트릭 3D 수학 곡면',
    category: 'geometry',
    subtitle: 'Ripple, Sombrero, Saddle 등 실시간 수학 공식 서피스',
    badge: 'Math & Formulas',
    description:
      '수학적 3D 곡면 함수 $z = f(x, y)$의 높이와 버텍스 컬러를 실시간으로 연산하여 시각화합니다.',
    keyConcepts: [
      'Parametric Function $z = \\sin(r)$',
      'Dynamic Vertex Color Interpolation',
      'Surface Normal Computation',
    ],
    defaultParams: {
      formula: 'ripple',
      colorA: '#06b6d4',
      colorB: '#ec4899',
      wireframe: false,
      animate: true,
      speed: 1.5,
    },
    controls: [
      {
        key: 'formula',
        label: '수학 공식 형태',
        type: 'select',
        options: [
          { label: 'Ripple Wave (동심원 파동)', value: 'ripple' },
          { label: 'Sombrero (멕시칸 모자 함수)', value: 'sombrero' },
          { label: 'Monkey Saddle (안장 곡면)', value: 'saddle' },
          { label: 'Egg Carton (계란판 2D 사인파)', value: 'eggcarton' },
        ],
      },
      { key: 'colorA', label: '골짜기 색상', type: 'color' },
      { key: 'colorB', label: '봉우리 색상', type: 'color' },
      { key: 'wireframe', label: '와이어프레임', type: 'switch' },
      { key: 'animate', label: '파동 애니메이션', type: 'switch' },
      { key: 'speed', label: '속도', type: 'slider', min: 0.5, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 5, 8], fov: 45 },
    initScene: initParametricMathSurfacesScene,
    vanillaCode: (p) => `
// Parametric Math Surface in Three.js
const segs = 90;
const geom = new THREE.BufferGeometry();
// positions and colors populated dynamically...`,
    r3fCode: () => `// R3F Parametric Math Surface Component`,
  },

  // 4. PBR Studio
  {
    id: 'shader-pbr',
    title: 'PBR 물리 기반 렌더링 쇼룸',
    category: 'shaders',
    subtitle: '유리 투과, 굴절률(IOR), 클리어코트, 무지개빛 쉐이딩',
    badge: 'MeshPhysicalMaterial',
    description:
      'Three.js의 가장 진보된 머티리얼인 MeshPhysicalMaterial을 사용하여 유리 투과(Transmission), 굴절률(IOR), 클리어코트(Clearcoat), 무지개빛(Iridescence)을 완벽하게 재현합니다.',
    keyConcepts: [
      'PBR (Physically Based Rendering)',
      'Transmission & IOR (Index of Refraction)',
      'Clearcoat & Roughness',
      'Inner core depth visual',
    ],
    defaultParams: {
      color: '#38bdf8',
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      ior: 1.5,
      thickness: 1.2,
      clearcoat: 1.0,
      iridescence: 0.8,
      autoRotate: true,
    },
    controls: [
      { key: 'color', label: '표면 색상', type: 'color' },
      {
        key: 'transmission',
        label: '유리 투과율 (Transmission)',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
      },
      { key: 'ior', label: '굴절률 (IOR)', type: 'slider', min: 1.0, max: 2.3, step: 0.05 },
      { key: 'roughness', label: '거칠기 (Roughness)', type: 'slider', min: 0, max: 1, step: 0.05 },
      { key: 'metalness', label: '금속성 (Metalness)', type: 'slider', min: 0, max: 1, step: 0.05 },
      {
        key: 'clearcoat',
        label: '클리어코트 광택 (Clearcoat)',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
      },
      {
        key: 'iridescence',
        label: '무지개빛 (Iridescence)',
        type: 'slider',
        min: 0,
        max: 1,
        step: 0.05,
      },
      { key: 'autoRotate', label: '자동 회전', type: 'switch' },
    ],
    cameraConfig: { position: [0, 1.5, 6], fov: 45 },
    initScene: initPbrStudioScene,
    vanillaCode: (p) => `
const mat = new THREE.MeshPhysicalMaterial({
  color: '${p.color || '#38bdf8'}',
  metalness: ${p.metalness || 0.1},
  roughness: ${p.roughness || 0.1},
  transmission: ${p.transmission || 0.9},
  ior: ${p.ior || 1.5},
  clearcoat: ${p.clearcoat || 1.0},
  iridescence: ${p.iridescence || 0.8},
});`,
    r3fCode: () => `// R3F PBR Physical Material Canvas`,
  },

  // 5. Toon & Outline
  {
    id: 'shader-toon',
    title: '카툰 & 셀 셰이딩 & 외곽선',
    category: 'shaders',
    subtitle: '애니메이션 스타일 불연속 명암 & Inverted Hull 아웃라인',
    badge: 'Cel Shading',
    description:
      'Discrete DataTexture GradientMap을 이용한 계단식 카툰 셰이딩과 BackSide Inverted Hull 기법을 통한 실시간 외곽선(Outline) 효과를 구현합니다.',
    keyConcepts: [
      'THREE.MeshToonMaterial',
      'Gradient DataTexture Quantization',
      'Inverted Hull Outline Technique',
    ],
    defaultParams: {
      color: '#ec4899',
      outlineThickness: 0.04,
      rotateSpeed: 1.0,
    },
    controls: [
      { key: 'color', label: '카툰 베이스 색상', type: 'color' },
      {
        key: 'outlineThickness',
        label: '외곽선 두께',
        type: 'slider',
        min: 0.01,
        max: 0.1,
        step: 0.005,
      },
      { key: 'rotateSpeed', label: '회전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 6], fov: 45 },
    initScene: initToonOutlineScene,
    vanillaCode: (p) => `
// Inverted Hull Outline
const outlineMat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.BackSide });
const outlineMesh = new THREE.Mesh(geometry, outlineMat);
outlineMesh.scale.setScalar(1 + ${p.outlineThickness || 0.04});`,
    r3fCode: () => `// R3F Toon Cel Shader Component`,
  },

  // 6. Custom GLSL Plasma
  {
    id: 'shader-glsl-plasma',
    title: '커스텀 GLSL 펄린 노이즈 플라즈마',
    category: 'shaders',
    subtitle: '버텍스 왜곡 & 프래그먼트 유체 컬러 스펙트럼',
    badge: 'GLSL Shaders',
    description:
      'GPU에서 직접 실행되는 커스텀 버텍스 및 프래그먼트 셰이더를 통해 3D 펄린 노이즈로 메쉬를 유기적으로 왜곡하고 멀티 컬러 플라즈마 파동을 렌더링합니다.',
    keyConcepts: [
      'THREE.ShaderMaterial',
      'GLSL Perlin Noise Algorithm',
      'Vertex Normal Displacement',
      'Uniforms Passing & Animation',
    ],
    defaultParams: {
      frequency: 1.2,
      amplitude: 0.6,
      colorA: '#050510',
      colorB: '#06b6d4',
      colorC: '#f43f5e',
      wireframe: false,
      speed: 1.0,
    },
    controls: [
      {
        key: 'frequency',
        label: '노이즈 주파수 (Frequency)',
        type: 'slider',
        min: 0.2,
        max: 3,
        step: 0.1,
      },
      {
        key: 'amplitude',
        label: '진폭 왜곡 세기 (Amplitude)',
        type: 'slider',
        min: 0,
        max: 1.2,
        step: 0.05,
      },
      { key: 'colorA', label: '심연 색상 (Color A)', type: 'color' },
      { key: 'colorB', label: '중간 파동 색상 (Color B)', type: 'color' },
      { key: 'colorC', label: '피크 플라즈마 색상 (Color C)', type: 'color' },
      { key: 'wireframe', label: '와이어프레임 셰이더', type: 'switch' },
      { key: 'speed', label: '애니메이션 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 6], fov: 45 },
    initScene: initCustomGlslPlasmaScene,
    vanillaCode: () => `// GLSL ShaderMaterial Source`,
    r3fCode: () => `// R3F Custom GLSL Material`,
  },

  // 7. Hologram Shield
  {
    id: 'shader-hologram',
    title: 'SF 홀로그램 & 에너지 쉴드',
    category: 'shaders',
    subtitle: '프레넬(Fresnel) 림 라이팅 & 스캔라인 글리치 효과',
    badge: 'Sci-Fi Hologram',
    description:
      '시선 방향과 노멀 벡터의 내적을 이용한 프레넬(Fresnel) 림 발광과 동적 스캔라인(Scanline) 글리치 효과로 SF 홀로그램을 연출합니다.',
    keyConcepts: [
      'Fresnel Equation $(1 - |N \\cdot V|)^p$',
      'Scanline Screen Effects',
      'Additive Blending',
      'Transparent Depth Testing',
    ],
    defaultParams: {
      color: '#00f0ff',
      fresnelPower: 2.5,
      glitchSpeed: 2.0,
    },
    controls: [
      { key: 'color', label: '홀로그램 네온 색상', type: 'color' },
      {
        key: 'fresnelPower',
        label: '외곽선 프레넬 강도',
        type: 'slider',
        min: 1.0,
        max: 5.0,
        step: 0.2,
      },
      {
        key: 'glitchSpeed',
        label: '스캔라인 이동 속도',
        type: 'slider',
        min: 0.5,
        max: 5.0,
        step: 0.2,
      },
    ],
    cameraConfig: { position: [0, 0, 7], fov: 45 },
    initScene: initHologramShieldScene,
    vanillaCode: () => `// Hologram Shader with Fresnel`,
    r3fCode: () => `// R3F Hologram Component`,
  },

  // 8. Spiral Galaxy
  {
    id: 'part-galaxy',
    title: '100,000 은하수 나선 갤럭시',
    category: 'particles',
    subtitle: '로그 나선 은하 팔 & 성간 가스 코어 시뮬레이터',
    badge: 'Massive Particles',
    description:
      '수만 개의 파티클을 GPU 버퍼 지오메트리에 바인딩하여 4개의 나선 팔과 고밀도 발광 코어를 가진 대형 은하수를 실시간 시뮬레이션합니다.',
    keyConcepts: [
      'THREE.Points & BufferAttribute',
      'Logarithmic Spiral Mathematics',
      'Additive Blending & Attenuation',
    ],
    defaultParams: {
      count: 50000,
      radius: 8.0,
      branches: 4,
      spin: 1.2,
      randomness: 0.4,
      randomnessPower: 3.5,
      insideColor: '#ff6030',
      outsideColor: '#1b3984',
      size: 0.08,
      speed: 0.15,
    },
    controls: [
      {
        key: 'count',
        label: '파티클 수 (Stars)',
        type: 'slider',
        min: 10000,
        max: 100000,
        step: 5000,
      },
      { key: 'branches', label: '은하 나선 팔 개수', type: 'slider', min: 2, max: 8, step: 1 },
      { key: 'radius', label: '은하 반경', type: 'slider', min: 4, max: 12, step: 0.5 },
      { key: 'spin', label: '회전 비틀림 (Spin)', type: 'slider', min: 0.2, max: 3, step: 0.1 },
      { key: 'insideColor', label: '코어 중심 색상', type: 'color' },
      { key: 'outsideColor', label: '외곽 은하 팔 색상', type: 'color' },
      { key: 'speed', label: '자전 속도', type: 'slider', min: 0.05, max: 0.6, step: 0.02 },
    ],
    cameraConfig: { position: [0, 8, 12], fov: 50 },
    initScene: initSpiralGalaxyScene,
    vanillaCode: () => `// 100k Galaxy Particle System`,
    r3fCode: () => `// R3F Galaxy Simulation`,
  },

  // 9. Matrix Digital Rain
  {
    id: 'part-matrix',
    title: '3D 매트릭스 디지털 레인',
    category: 'particles',
    subtitle: '사이버 네온 글리프 3D 실린더 폭포수 유동',
    badge: 'Cyberpunk FX',
    description:
      '매트릭스의 상징적인 녹색 코드 비를 3D 원통형 공간에 파티클 스트림으로 렌더링하여 영화 같은 사이버펑크 뷰를 제공합니다.',
    keyConcepts: [
      'Cylindrical Coordinate Distribution',
      'Continuous Particle Recycled Loop',
      'Cyber Shading',
    ],
    defaultParams: {
      speed: 1.5,
      size: 0.15,
    },
    controls: [
      { key: 'speed', label: '낙하 속도', type: 'slider', min: 0.5, max: 4, step: 0.2 },
      { key: 'size', label: '글리프 입자 크기', type: 'slider', min: 0.05, max: 0.3, step: 0.02 },
    ],
    cameraConfig: { position: [0, 0, 9], fov: 50 },
    initScene: initMatrixDigitalRainScene,
    vanillaCode: () => `// Matrix Rain in Three.js`,
    r3fCode: () => `// R3F Matrix Rain`,
  },

  // 10. Lorenz Attractor
  {
    id: 'part-lorenz',
    title: '로렌츠 어트랙터 카오스 유동',
    category: 'particles',
    subtitle: '기상학 나비 효과 미분방정식 3D 궤적 렌더링',
    badge: 'Chaos Math',
    description:
      '에드워드 로렌츠의 카오스 미분방정식($\\sigma=10, \\rho=28, \\beta=8/3$)을 오일러 수치 적분하여 나비 모양의 신비로운 위상 궤적을 그립니다.',
    keyConcepts: [
      'Lorenz Differential System',
      'Continuous Numerical Integration',
      'Gradient Color Tracing',
    ],
    defaultParams: {
      rotateSpeed: 1.0,
    },
    controls: [
      { key: 'rotateSpeed', label: '회전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 14], fov: 45 },
    initScene: initLorenzAttractorScene,
    vanillaCode: () => `// Lorenz Chaos Attractor`,
    r3fCode: () => `// R3F Lorenz Attractor`,
  },

  // 11. Fireworks
  {
    id: 'part-fireworks',
    title: '3D 폭죽 & 불꽃놀이 물리 시뮬레이션',
    category: 'particles',
    subtitle: '중력 감쇠, 공기 항력, 다채로운 스파크 파티클 폭발',
    badge: 'Physics VFX',
    description:
      '실시간 중력과 공기 저항이 적용된 다단계 불꽃놀이 폭죽 파티클 물리 시뮬레이터입니다.',
    keyConcepts: [
      'Velocity & Gravity Vectors',
      'Drag Coefficient & Particle Lifetime',
      'Interactive Burst',
    ],
    defaultParams: {},
    controls: [{ key: 'burst', label: '불꽃 연속 발사 (Trigger Burst)', type: 'button' }],
    cameraConfig: { position: [0, 2, 10], fov: 50 },
    initScene: initFireworksPhysicsScene,
    vanillaCode: () => `// Fireworks Simulation`,
    r3fCode: () => `// R3F Fireworks`,
  },

  // 12. Infinite Terrain
  {
    id: 'proc-terrain',
    title: '절차적 무한 3D 지형 & 바이옴',
    category: 'procedural',
    subtitle: '프랙탈 펄린 노이즈 고도 매핑: 수면, 모래, 초원, 암벽, 설산',
    badge: 'Procedural World',
    description:
      'Octave 프랙탈 펄린 노이즈로 실시간 고도(Elevation)를 생성하고 고도에 따라 5단계 자연 바이옴과 투명 바다 수면을 렌더링합니다.',
    keyConcepts: ['Fractal Perlin Noise (FBM)', 'Biome Height Coloring', 'Dynamic Plane Geometry'],
    defaultParams: {
      heightScale: 3.0,
      noiseScale: 0.08,
      flatShading: false,
      animate: true,
      speed: 1.0,
    },
    controls: [
      { key: 'heightScale', label: '산맥 높이 계수', type: 'slider', min: 1, max: 6, step: 0.2 },
      {
        key: 'noiseScale',
        label: '지형 거칠기 (Frequency)',
        type: 'slider',
        min: 0.02,
        max: 0.2,
        step: 0.01,
      },
      { key: 'flatShading', label: '로우폴리 플랫 셰이딩', type: 'switch' },
      { key: 'animate', label: '지형 스크롤 비행', type: 'switch' },
      { key: 'speed', label: '비행 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 8, 14], fov: 45 },
    initScene: initInfiniteTerrainScene,
    vanillaCode: () => `// Procedural Terrain`,
    r3fCode: () => `// R3F Procedural Terrain`,
  },

  // 13. Procedural Planet
  {
    id: 'proc-planet',
    title: '절차적 3D 행성 & 대기 대류',
    category: 'procedural',
    subtitle: '구형 펄린 대륙 생성, 독립 구름층 회전, 대기 프레넬 림',
    badge: 'Exoplanet',
    description:
      '구면 좌표계 노이즈로 바다와 대륙, 극지방 빙하를 생성하고 별도의 구름층과 대기 산란(Atmospheric Halo)을 구현한 가상의 외계 행성입니다.',
    keyConcepts: ['Spherical Noise Mapping', 'Multi-Layer Atmosphere', 'Saturn Rings'],
    defaultParams: {
      speed: 1.0,
    },
    controls: [{ key: 'speed', label: '자전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 }],
    cameraConfig: { position: [0, 1.5, 7], fov: 45 },
    initScene: initProceduralPlanetScene,
    vanillaCode: () => `// Procedural Planet`,
    r3fCode: () => `// R3F Procedural Planet`,
  },

  // 14. Hyperspace Warp
  {
    id: 'proc-warp',
    title: '사이버 하이퍼스페이스 워프 터널',
    category: 'procedural',
    subtitle: '초고속 무한 회전 네온 링 & 스피드 라인 파티클',
    badge: 'Sci-Fi Speed',
    description:
      '카메라가 무한 터널을 고속 통과하는 착시를 일으키는 네온 토러스 링과 스피드 스트릭 파티클 효과입니다.',
    keyConcepts: ['Recycled Ring Array', 'Speed Particle Streaks', 'Infinite Looping'],
    defaultParams: {
      speed: 12.0,
    },
    controls: [{ key: 'speed', label: '워프 비행 속도', type: 'slider', min: 4, max: 30, step: 1 }],
    cameraConfig: { position: [0, 0, 4], fov: 60 },
    initScene: initHyperspaceWarpTunnelScene,
    vanillaCode: () => `// Warp Tunnel`,
    r3fCode: () => `// R3F Warp Tunnel`,
  },

  // 15. Solar System
  {
    id: 'phys-solar',
    title: '태양계 & N-바디 중력 궤도',
    category: 'physics',
    subtitle: '케플러 공전 법칙 비율, 태양광 포인트 라이트, 토성 고리',
    badge: 'Celestial Orbits',
    description:
      '수성부터 토성까지 실제 행성 공전 주기 비율을 반영한 3D 인터랙티브 태양계 오르빗 시뮬레이션입니다.',
    keyConcepts: ['Keplerian Orbital Speeds', 'PointLight Solar Emitter', 'Nested Orbit Heirarchy'],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '공전 속도 배율', type: 'slider', min: 0.2, max: 4, step: 0.1 },
    ],
    cameraConfig: { position: [0, 18, 24], fov: 45 },
    initScene: initSolarSystemNBodyScene,
    vanillaCode: () => `// Solar System Three.js`,
    r3fCode: () => `// R3F Solar System`,
  },

  // 16. Cloth Simulation
  {
    id: 'phys-cloth',
    title: '질량-스프링 3D 옷감 시뮬레이션',
    category: 'physics',
    subtitle: 'Verlet 적분 & 구조/전단/굽힘 스프링 바람 상호작용',
    badge: 'Cloth Physics',
    description:
      '물리 엔진 라이브러리 없이 순수 수치해석 Verlet 적분과 스프링 구속조건(Constraint Relaxation)으로 바람에 펄럭이는 옷감을 시뮬레이션합니다.',
    keyConcepts: [
      'Verlet Integration',
      'Mass-Spring Grid',
      'Constraint Relaxation (Jakobsen Method)',
    ],
    defaultParams: {
      wind: 1.5,
    },
    controls: [
      { key: 'wind', label: '바람 세기 (Wind Force)', type: 'slider', min: 0, max: 4, step: 0.2 },
    ],
    cameraConfig: { position: [0, 1, 6], fov: 45 },
    initScene: initClothSimulationScene,
    vanillaCode: () => `// Verlet Cloth Simulation`,
    r3fCode: () => `// R3F Cloth Simulation`,
  },

  // 17. Bouncing Balls
  {
    id: 'phys-bouncing',
    title: '3D 탄성 충돌 바운싱 볼',
    category: 'physics',
    subtitle: '3D 큐브 내부의 24개 구체 완전 탄성 충돌 & 운동량 보존',
    badge: 'Impulse Physics',
    description:
      '3D 큐브 경계면 및 구체 상호 간의 완벽한 3D 탄성 충돌(Elastic Collision)과 운동량 보존 법칙을 시각화합니다.',
    keyConcepts: ['Sphere-Sphere Collision Response', 'Restitution & Momentum Conservation'],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '시뮬레이션 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 9], fov: 45 },
    initScene: initBouncingBallsCollisionScene,
    vanillaCode: () => `// 3D Collision Physics`,
    r3fCode: () => `// R3F Bouncing Balls`,
  },

  // 18. Water Ripples
  {
    id: 'phys-water',
    title: '인터랙티브 3D 수면 파동',
    category: 'physics',
    subtitle: '마우스 클릭 수면 파문 & 2D 파동 방정식 그리드 전파',
    badge: 'Wave Equation',
    description:
      '마우스를 클릭하거나 빗방울이 떨어질 때 2D 파동 방정식($c^2 \\nabla^2 u$)에 의해 물결이 사방으로 퍼져나가는 인터랙티브 수면 시뮬레이터입니다.',
    keyConcepts: ['2D Discrete Wave Equation', 'Double Buffer Simulation', 'Raycaster Mouse Drops'],
    defaultParams: {
      autoRain: true,
    },
    controls: [{ key: 'autoRain', label: '자동 빗방울 떨어뜨리기', type: 'switch' }],
    cameraConfig: { position: [0, 6, 8], fov: 45 },
    initScene: initWaterRippleScene,
    vanillaCode: () => `// Interactive Water Ripples`,
    r3fCode: () => `// R3F Water Canvas`,
  },

  // 19. Data Globe
  {
    id: 'data-globe',
    title: '인터랙티브 글로벌 데이터 지구본',
    category: 'dataviz',
    subtitle: '서울, 샌프란시스코, 런던 등 글로벌 테크 허브 3D 베지어 아크 연결',
    badge: 'Globe Viz',
    description:
      '실제 위도/경도(Lat/Lng)를 3D 구면 좌표로 변환하고 전 세계 주요 도시를 잇는 3D 베지어 비행 궤적과 펄스 핑 노드를 렌더링합니다.',
    keyConcepts: [
      'Spherical Coordinate Projection',
      'QuadraticBezierCurve3 3D Arcs',
      'Pulsing Hub Markers',
    ],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '지구본 자전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 1.5, 7], fov: 45 },
    initScene: initDataGlobeScene,
    vanillaCode: () => `// 3D Data Globe`,
    r3fCode: () => `// R3F Data Globe`,
  },

  // 20. 3D Bar Matrix
  {
    id: 'data-bar-matrix',
    title: '3D 다차원 바 차트 매트릭스',
    category: 'dataviz',
    subtitle: '8x8 매트릭스 3D 막대 차트 & 부드러운 높이 모션 트랜지션',
    badge: '3D Bar Chart',
    description:
      '서버 트래픽, 금융 시계열 등 다차원 데이터를 3D 공간 상의 막대 매트릭스로 표현하고 동적 높이 변화를 시각화합니다.',
    keyConcepts: [
      'Instanced/Grouped Box Scale',
      'Smooth Height Interpolation',
      'Spatial Color Gradients',
    ],
    defaultParams: {
      speed: 1.5,
    },
    controls: [
      { key: 'speed', label: '데이터 변화 속도', type: 'slider', min: 0.5, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [6, 7, 9], fov: 45 },
    initScene: init3DBarChartMatrixScene,
    vanillaCode: () => `// 3D Bar Matrix Chart`,
    r3fCode: () => `// R3F 3D Bar Chart`,
  },

  // 21. Point Cloud Clusters
  {
    id: 'data-point-cloud',
    title: '3D AI 임베딩 포인트 클라우드',
    category: 'dataviz',
    subtitle: 'NLP, Vision, Audio, Multimodal 4개 가우시안 클러스터',
    badge: 'Vector Embeddings',
    description:
      '고차원 AI 벡터 임베딩을 t-SNE / UMAP으로 3D 차원 축소한 형태의 포인트 클라우드 클러스터를 시각화합니다.',
    keyConcepts: ['Gaussian Distribution Sampling', 'Cluster Centroid Highlights', 'Additive Glow'],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '공간 회전 속도', type: 'slider', min: 0.2, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 0, 9], fov: 45 },
    initScene: initPointCloudClusterScene,
    vanillaCode: () => `// Point Cloud Clusters`,
    r3fCode: () => `// R3F Point Cloud`,
  },

  // 22. Voxel Builder
  {
    id: 'game-voxel',
    title: '3D 복셀 아트 월드 빌더',
    category: 'minigames',
    subtitle: '마우스 레이캐스터로 3D 그리드에 블록 생성 및 파괴 (Shift+Click)',
    badge: 'Voxel Sandbox',
    description:
      'Raycaster를 이용하여 마우스가 가리키는 평면 및 기존 블록의 표면 노멀에 정확히 맞추어 3D 블록을 배치하거나 제거할 수 있는 샌드박스입니다.',
    keyConcepts: ['Raycaster Grid Snapping', 'Face Normal Offset', 'Dynamic Mesh Management'],
    defaultParams: {
      color: '#00f0ff',
    },
    controls: [
      { key: 'color', label: '설치할 블록 색상', type: 'color' },
      { key: 'clear', label: '전체 블록 초기화 (Clear All)', type: 'button' },
    ],
    cameraConfig: { position: [6, 8, 10], fov: 45 },
    initScene: initVoxelBuilderScene,
    vanillaCode: () => `// Voxel Builder with Raycasting`,
    r3fCode: () => `// R3F Voxel Builder`,
  },

  // 23. Rubik's Cube
  {
    id: 'game-rubik',
    title: '인터랙티브 3D 루빅스 큐브',
    category: 'minigames',
    subtitle: '3x3x3 27개 큐블릿 및 레이어 회전 시뮬레이터',
    badge: 'Puzzle Simulation',
    description:
      '27개의 큐블릿과 6가지 표준 면 색상(흰, 노, 초, 파, 빨, 주)으로 구성된 3D 루빅스 큐브입니다.',
    keyConcepts: ['Subdivided Block Hierarchy', 'Layer Matrix Transformations', 'Puzzle Mechanics'],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '트위스트 속도', type: 'slider', min: 0.5, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [4, 4, 6], fov: 45 },
    initScene: initRubiksCubeScene,
    vanillaCode: () => `// Rubik's Cube in Three.js`,
    r3fCode: () => `// R3F Rubik's Cube`,
  },

  // 24. Asteroid Dodge
  {
    id: 'game-asteroid',
    title: 'SF 소행성대 우주선 비행 닷지',
    category: 'minigames',
    subtitle: '마우스 조종 우주선, 소행성대 회피 비행 & 부스터 플레어',
    badge: 'Flight Mini-Game',
    description:
      '마우스 커서로 우주선의 롤/피치 자세를 제어하며 고속으로 날아오는 소행성 파편을 회피하는 비행 미니게임입니다.',
    keyConcepts: [
      'Mouse Flight Controller',
      'Procedural Asteroid Field Spawner',
      'Thruster Particle Flare',
    ],
    defaultParams: {
      speed: 1.0,
    },
    controls: [
      { key: 'speed', label: '비행 속도 배율', type: 'slider', min: 0.5, max: 2.5, step: 0.1 },
    ],
    cameraConfig: { position: [0, 1.5, 8], fov: 50 },
    initScene: initAsteroidDodgeFlightScene,
    vanillaCode: () => `// Asteroid Dodge Game`,
    r3fCode: () => `// R3F Flight Game`,
  },

  // 25. Chrome Typography
  {
    id: 'typo-chrome',
    title: '3D 입체 크롬 타이포그래피',
    category: 'typography',
    subtitle: '거울 반사 크롬 메탈릭 서피스 & 네온 링 플로팅',
    badge: '3D Typography',
    description:
      '초고반사 크롬 메탈릭 물리 재질(Physical Material)과 거울 반사 바닥면으로 3D 타이포그래피 조각을 렌더링합니다.',
    keyConcepts: [
      'High Metallic Physical Material',
      'Mirror Reflection Plane',
      'Floating Character Dynamics',
    ],
    defaultParams: {
      text: 'THREE.JS',
      color: '#ffffff',
      speed: 1.0,
    },
    controls: [
      { key: 'color', label: '크롬 틴트 색상', type: 'color' },
      { key: 'speed', label: '부유 모션 속도', type: 'slider', min: 0.5, max: 3, step: 0.1 },
    ],
    cameraConfig: { position: [0, 2, 7], fov: 45 },
    initScene: initChromeTypographyScene,
    vanillaCode: () => `// Chrome 3D Typography`,
    r3fCode: () => `// R3F Chrome Text`,
  },

  // 26. Particle Text Morph
  {
    id: 'typo-morph',
    title: '텍스트 파티클 분산 & 모핑',
    category: 'typography',
    subtitle: '4,000개 발광 입자가 글자 형태로 조립되고 단어로 전환',
    badge: 'Particle Morph',
    description:
      '오프스크린 캔버스에서 래스터화한 글자 픽셀 위치로 수천 개의 발광 파티클이 부드럽게 모핑(Morphing)되며 새로운 단어를 형성합니다.',
    keyConcepts: [
      'Offscreen Canvas Text Rasterization',
      'Pixel Coordinate Sampling',
      'Smooth Lerp Particle Transition',
    ],
    defaultParams: {
      interval: 3.5,
    },
    controls: [
      {
        key: 'interval',
        label: '단어 자동 전환 주기 (초)',
        type: 'slider',
        min: 1.5,
        max: 6,
        step: 0.5,
      },
      { key: 'nextWord', label: '다음 단어로 즉시 모핑 (Next Word)', type: 'button' },
    ],
    cameraConfig: { position: [0, 0, 8], fov: 45 },
    initScene: initParticleTextMorphScene,
    vanillaCode: () => `// Text Particle Morphing`,
    r3fCode: () => `// R3F Text Particle Morph`,
  },
];
