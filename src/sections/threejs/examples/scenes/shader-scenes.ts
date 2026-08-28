import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 4. PBR MeshPhysicalMaterial Studio
// ----------------------------------------------------------------------

export function initPbrStudioScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // Pedestal
  const pedestalGeom = new THREE.CylinderGeometry(3.5, 3.8, 0.4, 64);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    metalness: 0.8,
    roughness: 0.2,
  });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.position.y = -2.2;
  pedestal.receiveShadow = true;
  group.add(pedestal);

  // Main Sphere/Hero Object
  const geom = new THREE.SphereGeometry(1.8, 128, 128);
  const mat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color((params.color as string) || '#38bdf8'),
    metalness: Number(params.metalness ?? 0.1),
    roughness: Number(params.roughness ?? 0.1),
    transmission: Number(params.transmission ?? 0.9),
    ior: Number(params.ior ?? 1.5),
    thickness: Number(params.thickness ?? 1.2),
    clearcoat: Number(params.clearcoat ?? 1.0),
    clearcoatRoughness: Number(params.clearcoatRoughness ?? 0.1),
    iridescence: Number(params.iridescence ?? 0.8),
    iridescenceIOR: 1.3,
    transparent: true,
    opacity: 1.0,
  });

  const heroMesh = new THREE.Mesh(geom, mat);
  heroMesh.castShadow = true;
  group.add(heroMesh);

  // Inner Core Sphere (Visible through transmission)
  const coreGeom = new THREE.IcosahedronGeometry(0.8, 4);
  const coreMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    emissive: 0xd97706,
    emissiveIntensity: 0.6,
    metalness: 0.9,
    roughness: 0.1,
  });
  const coreMesh = new THREE.Mesh(coreGeom, coreMat);
  group.add(coreMesh);

  return {
    update(time, _delta, curParams) {
      if (curParams.autoRotate) {
        heroMesh.rotation.y = time * 0.3;
        coreMesh.rotation.x = time * 0.6;
        coreMesh.rotation.y = time * 0.8;
      }
    },
    onParamChange(key, value) {
      if (key === 'color') mat.color.set(value as string);
      if (key === 'metalness') mat.metalness = Number(value);
      if (key === 'roughness') mat.roughness = Number(value);
      if (key === 'transmission') mat.transmission = Number(value);
      if (key === 'ior') mat.ior = Number(value);
      if (key === 'thickness') mat.thickness = Number(value);
      if (key === 'clearcoat') mat.clearcoat = Number(value);
      if (key === 'iridescence') mat.iridescence = Number(value);
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mat.dispose();
      coreGeom.dispose();
      coreMat.dispose();
      pedestalGeom.dispose();
      pedestalMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 5. Toon & Cel Shading & Outline FX
// ----------------------------------------------------------------------

export function initToonOutlineScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // Create discrete gradient map for cel shading bands
  const colors = new Uint8Array(4);
  colors[0] = 50;
  colors[1] = 120;
  colors[2] = 190;
  colors[3] = 255;
  const gradientMap = new THREE.DataTexture(colors, 4, 1, THREE.RedFormat);
  gradientMap.minFilter = THREE.NearestFilter;
  gradientMap.magFilter = THREE.NearestFilter;
  gradientMap.needsUpdate = true;

  const geom = new THREE.TorusKnotGeometry(1.6, 0.55, 180, 32, 2, 3);

  const toonMat = new THREE.MeshToonMaterial({
    color: new THREE.Color((params.color as string) || '#ec4899'),
    gradientMap,
  });
  const mainMesh = new THREE.Mesh(geom, toonMat);
  group.add(mainMesh);

  // Outline mesh (Inverted Hull technique)
  const outlineMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    side: THREE.BackSide,
  });
  const outlineMesh = new THREE.Mesh(geom, outlineMat);
  const outlineThickness = Number(params.outlineThickness ?? 0.04);
  outlineMesh.scale.setScalar(1 + outlineThickness);
  group.add(outlineMesh);

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.rotateSpeed || 1.0);
      group.rotation.x = time * 0.5 * speed;
      group.rotation.y = time * 0.7 * speed;
    },
    onParamChange(key, value) {
      if (key === 'color') toonMat.color.set(value as string);
      if (key === 'outlineThickness') {
        outlineMesh.scale.setScalar(1 + Number(value));
      }
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      toonMat.dispose();
      outlineMat.dispose();
      gradientMap.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 6. Custom GLSL Shader & Plasma Wave
// ----------------------------------------------------------------------

export function initCustomGlslPlasmaScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;

  const group = new THREE.Group();
  scene.add(group);

  const vertexShader = `
    uniform float uTime;
    uniform float uFrequency;
    uniform float uAmplitude;
    varying vec2 vUv;
    varying float vDisplacement;

    // Classic Perlin 3D Noise GLSL
    vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
    float snoise(vec3 v){
      const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
      const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
      vec3 i  = floor(v + dot(v, C.yyy) );
      vec3 x0 = v - i + dot(i, C.xxx) ;
      vec3 g = step(x0.yzx, x0.xyz);
      vec3 l = 1.0 - g;
      vec3 i1 = min( g.xyz, l.zxy );
      vec3 i2 = max( g.xyz, l.zxy );
      vec3 x1 = x0 - i1 + 1.0 * C.xxx;
      vec3 x2 = x0 - i2 + 2.0 * C.xxx;
      vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
      i = mod(i, 289.0 );
      vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
      float n_ = 0.142857142857;
      vec3  ns = n_ * D.wyz - D.xzx;
      vec4 j = p - 49.0 * floor(p * ns.z *ns.z);
      vec4 x_ = floor(j * ns.z);
      vec4 y_ = floor(j - 7.0 * x_ );
      vec4 x = x_ *ns.x + ns.yyyy;
      vec4 y = y_ *ns.x + ns.yyyy;
      vec4 h = 1.0 - abs(x) - abs(y);
      vec4 b0 = vec4( x.xy, y.xy );
      vec4 b1 = vec4( x.zw, y.zw );
      vec4 s0 = floor(b0)*2.0 + 1.0;
      vec4 s1 = floor(b1)*2.0 + 1.0;
      vec4 sh = -step(h, vec4(0.0));
      vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
      vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
      vec3 p0 = vec3(a0.xy,h.x);
      vec3 p1 = vec3(a0.zw,h.y);
      vec3 p2 = vec3(a1.xy,h.z);
      vec3 p3 = vec3(a1.zw,h.w);
      vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
      p0 *= norm.x;
      p1 *= norm.y;
      p2 *= norm.z;
      p3 *= norm.w;
      vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
      m = m * m;
      return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }

    void main() {
      vUv = uv;
      float noise = snoise(position * uFrequency + vec3(uTime * 0.8));
      vDisplacement = noise;
      vec3 newPosition = position + normal * (noise * uAmplitude);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec2 vUv;
    varying float vDisplacement;

    void main() {
      float t = (vDisplacement + 1.0) * 0.5;
      vec3 col = mix(uColorA, uColorB, smoothstep(0.0, 0.5, t));
      col = mix(col, uColorC, smoothstep(0.5, 1.0, t));
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uFrequency: { value: Number(params.frequency ?? 1.2) },
    uAmplitude: { value: Number(params.amplitude ?? 0.6) },
    uColorA: { value: new THREE.Color((params.colorA as string) || '#050510') },
    uColorB: { value: new THREE.Color((params.colorB as string) || '#06b6d4') },
    uColorC: { value: new THREE.Color((params.colorC as string) || '#f43f5e') },
  };

  const geom = new THREE.IcosahedronGeometry(2.0, 64);
  const shaderMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    wireframe: Boolean(params.wireframe),
  });

  const mesh = new THREE.Mesh(geom, shaderMat);
  group.add(mesh);

  return {
    update(time, _delta, curParams) {
      uniforms.uTime.value = time * Number(curParams.speed || 1.0);
      mesh.rotation.y = time * 0.2;
    },
    onParamChange(key, value) {
      if (key === 'frequency') uniforms.uFrequency.value = Number(value);
      if (key === 'amplitude') uniforms.uAmplitude.value = Number(value);
      if (key === 'colorA') uniforms.uColorA.value.set(value as string);
      if (key === 'colorB') uniforms.uColorB.value.set(value as string);
      if (key === 'colorC') uniforms.uColorC.value.set(value as string);
      if (key === 'wireframe') shaderMat.wireframe = Boolean(value);
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      shaderMat.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 7. Sci-Fi Hologram & Force Field
// ----------------------------------------------------------------------

export function initHologramShieldScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;

  const group = new THREE.Group();
  scene.add(group);

  const vertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uFresnelPower;
    uniform float uGlitchSpeed;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;

    void main() {
      // 1. Fresnel rim glow
      vec3 viewDir = vec3(0.0, 0.0, 1.0);
      float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), uFresnelPower);

      // 2. Scanline effect
      float scanline = sin((vPosition.y + uTime * uGlitchSpeed) * 30.0) * 0.5 + 0.5;
      scanline = pow(scanline, 3.0) * 0.4;

      // 3. Hexagonal/Grid interference
      float grid = step(0.9, fract(vUv.x * 24.0)) + step(0.9, fract(vUv.y * 24.0));

      float alpha = clamp(fresnel * 1.5 + scanline + grid * 0.3, 0.05, 0.95);

      gl_FragColor = vec4(uColor, alpha);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color((params.color as string) || '#00f0ff') },
    uFresnelPower: { value: Number(params.fresnelPower ?? 2.5) },
    uGlitchSpeed: { value: Number(params.glitchSpeed ?? 2.0) },
  };

  const geom = new THREE.TorusKnotGeometry(1.7, 0.5, 128, 32);
  const holoMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geom, holoMat);
  group.add(mesh);

  // Outer Sphere Shield
  const shieldGeom = new THREE.SphereGeometry(3.0, 32, 32);
  const shieldMat = new THREE.MeshBasicMaterial({
    color: 0x00f0ff,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const shieldMesh = new THREE.Mesh(shieldGeom, shieldMat);
  group.add(shieldMesh);

  return {
    update(time, _delta, curParams) {
      uniforms.uTime.value = time;
      mesh.rotation.y = time * 0.4;
      mesh.rotation.x = Math.sin(time * 0.3) * 0.3;
      shieldMesh.rotation.y = -time * 0.1;
    },
    onParamChange(key, value) {
      if (key === 'color') uniforms.uColor.value.set(value as string);
      if (key === 'fresnelPower') uniforms.uFresnelPower.value = Number(value);
      if (key === 'glitchSpeed') uniforms.uGlitchSpeed.value = Number(value);
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      holoMat.dispose();
      shieldGeom.dispose();
      shieldMat.dispose();
    },
  };
}
