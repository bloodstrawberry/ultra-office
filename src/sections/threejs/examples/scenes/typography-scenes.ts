import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { setupStudioLighting, createParticleSpriteTexture } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 25. 3D Extruded Chrome Typography
// ----------------------------------------------------------------------

export function initChromeTypographyScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // Generate 3D Typography via procedural extruded letters / canvas heightmap
  const lettersGroup = new THREE.Group();
  group.add(lettersGroup);

  const text = (params.text as string) || 'THREE.JS';
  const charWidth = 1.0;
  const totalWidth = text.length * charWidth;

  // Create stylized 3D Block Lettering
  const charMeshes: THREE.Mesh[] = [];
  const charMat = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color((params.color as string) || '#ffffff'),
    metalness: 0.95,
    roughness: 0.08,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 1.0,
    ior: 1.8,
  });

  for (let i = 0; i < text.length; i += 1) {
    const geom = new THREE.BoxGeometry(0.75, 1.2, 0.4);
    const mesh = new THREE.Mesh(geom, charMat);
    mesh.position.set(i * charWidth - totalWidth / 2 + charWidth / 2, 0, 0);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    lettersGroup.add(mesh);
    charMeshes.push(mesh);
  }

  // Floating Cyber Neon Ring around text
  const ringGeom = new THREE.TorusGeometry(totalWidth * 0.65, 0.08, 16, 64);
  ringGeom.rotateX(Math.PI / 2.2);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const ring = new THREE.Mesh(ringGeom, ringMat);
  group.add(ring);

  // Mirror Floor
  const floorGeom = new THREE.PlaneGeometry(20, 20);
  floorGeom.rotateX(-Math.PI / 2);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x020617,
    roughness: 0.1,
    metalness: 0.9,
  });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.position.y = -1.5;
  floor.receiveShadow = true;
  group.add(floor);

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.0);
      group.rotation.y = time * 0.3 * speed;

      charMeshes.forEach((mesh, idx) => {
        mesh.position.y = Math.sin(time * 3.0 * speed + idx * 0.6) * 0.25;
      });

      ring.rotation.z = time * 0.6 * speed;
    },
    dispose() {
      scene.remove(group);
      charMeshes.forEach((m) => m.geometry.dispose());
      charMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      floorGeom.dispose();
      floorMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 26. Text Particle Disperse & Morph
// ----------------------------------------------------------------------

export function initParticleTextMorphScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;

  const particleTex = createParticleSpriteTexture();
  const particleCount = 4000;

  const currentPositions = new Float32Array(particleCount * 3);
  const targetPositions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Render text onto offscreen canvas and sample pixel coordinates
  function sampleTextPixels(word: string): THREE.Vector3[] {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 160;
    const c = canvas.getContext('2d')!;

    c.fillStyle = '#000000';
    c.fillRect(0, 0, 400, 160);

    c.font = 'bold 72px sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#ffffff';
    c.fillText(word, 200, 80);

    const imgData = c.getImageData(0, 0, 400, 160);
    const data = imgData.data;
    const pts: THREE.Vector3[] = [];

    const step = 3;
    for (let y = 0; y < 160; y += step) {
      for (let x = 0; x < 400; x += step) {
        const idx = (y * 400 + x) * 4;
        if (data[idx] > 128) {
          pts.push(
            new THREE.Vector3((x - 200) * 0.032, -(y - 80) * 0.032, (Math.random() - 0.5) * 0.3)
          );
        }
      }
    }
    return pts;
  }

  const words = ['THREE.JS', 'WEBGL', 'ULTRA', '3D LAB'];
  let currentWordIdx = 0;

  function morphToWord(word: string) {
    const pts = sampleTextPixels(word);
    for (let i = 0; i < particleCount; i += 1) {
      const target = pts[i % pts.length];
      const i3 = i * 3;
      targetPositions[i3] = target.x + (Math.random() - 0.5) * 0.08;
      targetPositions[i3 + 1] = target.y + (Math.random() - 0.5) * 0.08;
      targetPositions[i3 + 2] = target.z;
    }
  }

  // Initial random scatter
  for (let i = 0; i < particleCount; i += 1) {
    const i3 = i * 3;
    currentPositions[i3] = (Math.random() - 0.5) * 15;
    currentPositions[i3 + 1] = (Math.random() - 0.5) * 15;
    currentPositions[i3 + 2] = (Math.random() - 0.5) * 15;

    const hue = (i / particleCount) * 0.6 + 0.5;
    const col = new THREE.Color().setHSL(hue % 1.0, 1.0, 0.6);
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;
  }

  morphToWord(words[0]);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.16,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: particleTex,
  });

  const points = new THREE.Points(geom, mat);
  scene.add(points);

  let lastMorph = 0;

  return {
    update(time, _delta, curParams) {
      const morphInterval = Number(curParams.interval ?? 3.5);
      if (time - lastMorph > morphInterval) {
        currentWordIdx = (currentWordIdx + 1) % words.length;
        morphToWord(words[currentWordIdx]);
        lastMorph = time;
      }

      // Smooth lerp particle positions
      const pos = geom.attributes.position;
      const lerpSpeed = 0.06;
      for (let i = 0; i < particleCount; i += 1) {
        const i3 = i * 3;
        currentPositions[i3] += (targetPositions[i3] - currentPositions[i3]) * lerpSpeed;
        currentPositions[i3 + 1] +=
          (targetPositions[i3 + 1] - currentPositions[i3 + 1]) * lerpSpeed;
        currentPositions[i3 + 2] +=
          (targetPositions[i3 + 2] - currentPositions[i3 + 2]) * lerpSpeed;
      }
      pos.needsUpdate = true;

      points.rotation.y = Math.sin(time * 0.4) * 0.2;
    },
    onAction(actionKey) {
      if (actionKey === 'nextWord') {
        currentWordIdx = (currentWordIdx + 1) % words.length;
        morphToWord(words[currentWordIdx]);
      }
    },
    dispose() {
      scene.remove(points);
      geom.dispose();
      mat.dispose();
      particleTex.dispose();
    },
  };
}
