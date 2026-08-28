/* eslint-disable no-bitwise */
import * as THREE from 'three';

// ----------------------------------------------------------------------
// Perlin Noise / Simplex-like Procedural 2D/3D Noise
// ----------------------------------------------------------------------

const PERM = new Uint8Array(512);
const P = [
  151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142,
  8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203,
  117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165,
  71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92,
  41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208,
  89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217,
  226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58,
  17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155,
  167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218,
  246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14,
  239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150,
  254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
];
for (let i = 0; i < 256; i += 1) {
  PERM[i] = P[i];
  PERM[256 + i] = P[i];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(t: number, a: number, b: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

export function perlinNoise2D(x: number, y: number): number {
  return perlinNoise3D(x, y, 0);
}

export function perlinNoise3D(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);
  const zf = z - Math.floor(z);

  const u = fade(xf);
  const v = fade(yf);
  const w = fade(zf);

  const A = PERM[X] + Y;
  const AA = PERM[A] + Z;
  const AB = PERM[A + 1] + Z;
  const B = PERM[X + 1] + Y;
  const BA = PERM[B] + Z;
  const BB = PERM[B + 1] + Z;

  return lerp(
    w,
    lerp(
      v,
      lerp(u, grad(PERM[AA], xf, yf, zf), grad(PERM[BA], xf - 1, yf, zf)),
      lerp(u, grad(PERM[AB], xf, yf - 1, zf), grad(PERM[BB], xf - 1, yf - 1, zf))
    ),
    lerp(
      v,
      lerp(u, grad(PERM[AA + 1], xf, yf, zf - 1), grad(PERM[BA + 1], xf - 1, yf, zf - 1)),
      lerp(u, grad(PERM[AB + 1], xf, yf - 1, zf - 1), grad(PERM[BB + 1], xf - 1, yf - 1, zf - 1))
    )
  );
}

export function fractalPerlin(
  x: number,
  y: number,
  octaves: number = 4,
  lacunarity: number = 2.0,
  gain: number = 0.5
): number {
  let total = 0;
  let frequency = 1;
  let amplitude = 1;
  let maxValue = 0;
  for (let i = 0; i < octaves; i += 1) {
    total += perlinNoise2D(x * frequency, y * frequency) * amplitude;
    maxValue += amplitude;
    amplitude *= gain;
    frequency *= lacunarity;
  }
  return total / maxValue;
}

// ----------------------------------------------------------------------
// Environment & Lighting Setups
// ----------------------------------------------------------------------

export function setupStudioLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.0);
  keyLight.position.set(10, 20, 15);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.width = 2048;
  keyLight.shadow.mapSize.height = 2048;
  keyLight.shadow.bias = -0.0001;
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
  fillLight.position.set(-15, 10, -10);
  scene.add(fillLight);

  const rimLight = new THREE.PointLight(0xf43f5e, 1.5, 40);
  rimLight.position.set(0, -10, -15);
  scene.add(rimLight);

  return { ambient, keyLight, fillLight, rimLight };
}

export function createCyberGrid(scene: THREE.Scene, size: number = 40, divisions: number = 40) {
  const gridHelper = new THREE.GridHelper(size, divisions, 0x00f0ff, 0x1e293b);
  gridHelper.position.y = -2;
  (gridHelper.material as THREE.Material).transparent = true;
  (gridHelper.material as THREE.Material).opacity = 0.4;
  scene.add(gridHelper);
  return gridHelper;
}

export function createStarfieldBackground(scene: THREE.Scene, count: number = 2000) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i += 1) {
    const r = 80 + Math.random() * 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 2 - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    const c = new THREE.Color();
    const rand = Math.random();
    if (rand < 0.3)
      c.setHex(0x93c5fd); // Blueish
    else if (rand < 0.6)
      c.setHex(0xfef08a); // Yellowish
    else c.setHex(0xffffff); // Pure white

    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.6,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });

  const stars = new THREE.Points(geometry, material);
  scene.add(stars);
  return stars;
}

// ----------------------------------------------------------------------
// 3D Matrix Glyph Canvas Texture Generator
// ----------------------------------------------------------------------

export function createMatrixGlyphTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 512, 512);

  const characters = '0123456789ABCDEFｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜXYZ+-*/=%$#@&[]{}<>';
  ctx.font = 'bold 24px monospace';
  ctx.textAlign = 'center';

  for (let x = 0; x < 512; x += 32) {
    for (let y = 0; y < 512; y += 32) {
      const char = characters[Math.floor(Math.random() * characters.length)];
      const brightness = Math.floor(Math.random() * 200 + 55);
      ctx.fillStyle = `rgb(0, ${brightness}, ${Math.floor(brightness * 0.4)})`;
      ctx.fillText(char, x + 16, y + 24);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// ----------------------------------------------------------------------
// Circular Radial Particle Sprite Texture
// ----------------------------------------------------------------------

export function createParticleSpriteTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
  gradient.addColorStop(0.2, 'rgba(240, 245, 255, 0.8)');
  gradient.addColorStop(0.5, 'rgba(100, 200, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ----------------------------------------------------------------------
// Clean Object Disposer Helper
// ----------------------------------------------------------------------

export function disposeThreeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    if ((child as THREE.Mesh).isMesh || (child as THREE.Points).isPoints) {
      const mesh = child as THREE.Mesh;
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      if (mesh.material) {
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((mat) => {
            disposeMaterial(mat);
          });
        } else {
          disposeMaterial(mesh.material);
        }
      }
    }
  });
}

function disposeMaterial(mat: THREE.Material) {
  mat.dispose();
  Object.keys(mat).forEach((key) => {
    const val = (mat as unknown as Record<string, unknown>)[key];
    if (val && typeof val === 'object' && (val as THREE.Texture).isTexture) {
      (val as THREE.Texture).dispose();
    }
  });
}
