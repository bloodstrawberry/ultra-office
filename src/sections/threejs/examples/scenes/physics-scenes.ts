import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 15. Solar System & N-Body Orbits
// ----------------------------------------------------------------------

interface PlanetData {
  name: string;
  radius: number;
  distance: number;
  color: string;
  speed: number;
  mesh?: THREE.Mesh;
}

export function initSolarSystemNBodyScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // Central Sun
  const sunGeom = new THREE.SphereGeometry(1.6, 32, 32);
  const sunMat = new THREE.MeshBasicMaterial({
    color: 0xffaa00,
  });
  const sun = new THREE.Mesh(sunGeom, sunMat);
  group.add(sun);

  // Sun glow light
  const sunLight = new THREE.PointLight(0xffeedd, 3.0, 50);
  group.add(sunLight);

  const planets: PlanetData[] = [
    { name: 'Mercury', radius: 0.25, distance: 3.2, color: '#94a3b8', speed: 2.2 },
    { name: 'Venus', radius: 0.45, distance: 4.8, color: '#f59e0b', speed: 1.6 },
    { name: 'Earth', radius: 0.5, distance: 6.6, color: '#38bdf8', speed: 1.1 },
    { name: 'Mars', radius: 0.35, distance: 8.4, color: '#ef4444', speed: 0.9 },
    { name: 'Jupiter', radius: 0.95, distance: 11.5, color: '#d97706', speed: 0.5 },
    { name: 'Saturn', radius: 0.8, distance: 14.5, color: '#eab308', speed: 0.35 },
  ];

  const orbitLines: THREE.Line[] = [];

  planets.forEach((p) => {
    // 1. Orbit line ring
    const orbitGeom = new THREE.BufferGeometry();
    const pts: number[] = [];
    for (let i = 0; i <= 64; i += 1) {
      const theta = (i / 64) * Math.PI * 2;
      pts.push(Math.cos(theta) * p.distance, 0, Math.sin(theta) * p.distance);
    }
    orbitGeom.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const orbitMat = new THREE.LineBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.5,
    });
    const line = new THREE.Line(orbitGeom, orbitMat);
    group.add(line);
    orbitLines.push(line);

    // 2. Planet mesh
    const pGeom = new THREE.SphereGeometry(p.radius, 24, 24);
    const pMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(p.color),
      roughness: 0.5,
      metalness: 0.1,
    });
    const pMesh = new THREE.Mesh(pGeom, pMat);
    p.mesh = pMesh;
    group.add(pMesh);

    // Saturn ring special
    if (p.name === 'Saturn') {
      const sRingGeom = new THREE.RingGeometry(p.radius * 1.4, p.radius * 2.3, 32);
      sRingGeom.rotateX(Math.PI / 2.5);
      const sRingMat = new THREE.MeshBasicMaterial({
        color: 0xcfd8dc,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const sRing = new THREE.Mesh(sRingGeom, sRingMat);
      pMesh.add(sRing);
    }
  });

  return {
    update(time, _delta, curParams) {
      const globalSpeed = Number(curParams.speed ?? 1.0);
      sun.rotation.y = time * 0.2;

      planets.forEach((p) => {
        if (p.mesh) {
          const angle = time * p.speed * 0.4 * globalSpeed;
          p.mesh.position.set(Math.cos(angle) * p.distance, 0, Math.sin(angle) * p.distance);
          p.mesh.rotation.y = time * 2.0;
        }
      });
    },
    dispose() {
      scene.remove(group);
      sunGeom.dispose();
      sunMat.dispose();
      sunLight.dispose();
      orbitLines.forEach((l) => {
        l.geometry.dispose();
        (l.material as THREE.Material).dispose();
      });
      planets.forEach((p) => {
        if (p.mesh) {
          p.mesh.geometry.dispose();
          (p.mesh.material as THREE.Material).dispose();
        }
      });
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 16. Mass-Spring 3D Cloth Physics
// ----------------------------------------------------------------------

export function initClothSimulationScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const cols = 22;
  const rows = 22;
  const spacing = 0.24;

  const positions: THREE.Vector3[] = [];
  const prevPositions: THREE.Vector3[] = [];

  // Pinned top corners
  const pinned = [0, cols - 1];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const pos = new THREE.Vector3((c - cols / 2) * spacing, (rows / 2 - r) * spacing + 1.2, 0);
      positions.push(pos.clone());
      prevPositions.push(pos.clone());
    }
  }

  const indices: number[] = [];
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a = r * cols + c;
      const b = (r + 1) * cols + c;
      const d = r * cols + (c + 1);
      const e = (r + 1) * cols + (c + 1);
      indices.push(a, b, d);
      indices.push(b, e, d);
    }
  }

  const geom = new THREE.BufferGeometry();
  const posArray = new Float32Array(positions.length * 3);
  geom.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  geom.setIndex(indices);

  const mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    roughness: 0.6,
    metalness: 0.1,
    wireframe: false,
  });

  const clothMesh = new THREE.Mesh(geom, mat);
  clothMesh.castShadow = true;
  group.add(clothMesh);

  // Top hanging rod
  const rodGeom = new THREE.CylinderGeometry(0.06, 0.06, cols * spacing + 0.4);
  rodGeom.rotateZ(Math.PI / 2);
  const rodMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
  const rod = new THREE.Mesh(rodGeom, rodMat);
  rod.position.set(0, (rows / 2) * spacing + 1.2, 0);
  group.add(rod);

  function satisfyConstraint(p1: THREE.Vector3, p2: THREE.Vector3, restDistance: number) {
    const diff = p2.clone().sub(p1);
    const d = diff.length();
    if (d === 0) return;
    const correction = diff.multiplyScalar((d - restDistance) / d);
    const half = correction.multiplyScalar(0.5);
    p1.add(half);
    p2.sub(half);
  }

  return {
    update(time, delta, curParams) {
      const windForce = Number(curParams.wind ?? 1.5);
      const gravity = -9.8;
      const dt = Math.min(delta, 0.033);

      // Verlet Integration
      for (let i = 0; i < positions.length; i += 1) {
        if (pinned.includes(i)) continue;

        const current = positions[i];
        const prev = prevPositions[i];

        const vel = current.clone().sub(prev).multiplyScalar(0.98); // Damping

        const windZ = Math.sin(time * 3.0 + current.y * 2.0) * windForce;
        const totalForce = new THREE.Vector3(0, gravity, windZ);

        prevPositions[i].copy(current);
        current.add(vel).add(totalForce.multiplyScalar(dt * dt));
      }

      // Relaxation iterations
      for (let iter = 0; iter < 5; iter += 1) {
        // Structural Springs
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const idx = r * cols + c;
            if (c < cols - 1) satisfyConstraint(positions[idx], positions[idx + 1], spacing);
            if (r < rows - 1) satisfyConstraint(positions[idx], positions[idx + cols], spacing);
          }
        }

        // Pinned restore
        pinned.forEach((pIdx) => {
          positions[pIdx].copy(prevPositions[pIdx]);
        });
      }

      // Update mesh buffer
      const posAttr = geom.attributes.position;
      for (let i = 0; i < positions.length; i += 1) {
        posAttr.setXYZ(i, positions[i].x, positions[i].y, positions[i].z);
      }
      posAttr.needsUpdate = true;
      geom.computeVertexNormals();
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mat.dispose();
      rodGeom.dispose();
      rodMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 17. 3D Bouncing Balls & Elastic Collisions
// ----------------------------------------------------------------------

interface BouncyBall {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  radius: number;
}

export function initBouncingBallsCollisionScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const boxSize = 5.0;
  const halfBox = boxSize / 2;

  // Transparent Bounding Glass Cube
  const boxGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const boxMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.4,
  });
  const boxMesh = new THREE.Mesh(boxGeom, boxMat);
  group.add(boxMesh);

  // Spawn Bouncy Balls
  const numBalls = 24;
  const balls: BouncyBall[] = [];
  const palette = ['#f43f5e', '#ec4899', '#a855f7', '#06b6d4', '#10b981', '#f59e0b'];

  for (let i = 0; i < numBalls; i += 1) {
    const radius = 0.25 + Math.random() * 0.2;
    const geom = new THREE.SphereGeometry(radius, 24, 24);
    const color = new THREE.Color(palette[i % palette.length]);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.2,
      metalness: 0.7,
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(
      (Math.random() - 0.5) * (boxSize - radius * 2),
      (Math.random() - 0.5) * (boxSize - radius * 2),
      (Math.random() - 0.5) * (boxSize - radius * 2)
    );
    group.add(mesh);

    balls.push({
      mesh,
      vel: new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4,
        (Math.random() - 0.5) * 4
      ),
      radius,
    });
  }

  return {
    update(_time, delta, curParams) {
      const speedMult = Number(curParams.speed ?? 1.0);
      const dt = Math.min(delta, 0.033) * speedMult;

      // 1. Move & Wall Collision
      balls.forEach((b) => {
        b.mesh.position.addScaledVector(b.vel, dt);

        ['x', 'y', 'z'].forEach((axis) => {
          const key = axis as 'x' | 'y' | 'z';
          if (b.mesh.position[key] + b.radius > halfBox) {
            b.mesh.position[key] = halfBox - b.radius;
            b.vel[key] = -b.vel[key];
          } else if (b.mesh.position[key] - b.radius < -halfBox) {
            b.mesh.position[key] = -halfBox + b.radius;
            b.vel[key] = -b.vel[key];
          }
        });
      });

      // 2. Ball-to-Ball Elastic Collisions
      for (let i = 0; i < balls.length; i += 1) {
        for (let j = i + 1; j < balls.length; j += 1) {
          const b1 = balls[i];
          const b2 = balls[j];
          const diff = b2.mesh.position.clone().sub(b1.mesh.position);
          const dist = diff.length();
          const minDist = b1.radius + b2.radius;

          if (dist < minDist && dist > 0) {
            const normal = diff.clone().normalize();
            // Separate overlapping
            const overlap = minDist - dist;
            b1.mesh.position.sub(normal.clone().multiplyScalar(overlap * 0.5));
            b2.mesh.position.add(normal.clone().multiplyScalar(overlap * 0.5));

            // Elastic impulse response
            const k = b1.vel.clone().sub(b2.vel);
            const p = (2 * normal.dot(k)) / 2;
            b1.vel.sub(normal.clone().multiplyScalar(p));
            b2.vel.add(normal.clone().multiplyScalar(p));
          }
        }
      }

      group.rotation.y += dt * 0.1;
    },
    dispose() {
      scene.remove(group);
      boxGeom.dispose();
      boxMat.dispose();
      balls.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 18. Interactive Water Ripple Canvas
// ----------------------------------------------------------------------

export function initWaterRippleScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const size = 64;
  const geom = new THREE.PlaneGeometry(8, 8, size - 1, size - 1);
  geom.rotateX(-Math.PI / 2);

  // Double buffer for wave simulation
  const bufferA = new Float32Array(size * size);
  const bufferB = new Float32Array(size * size);
  let currentBuf = bufferA;
  let prevBuf = bufferB;

  const mat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.1,
    metalness: 0.8,
    side: THREE.DoubleSide,
  });
  const waterMesh = new THREE.Mesh(geom, mat);
  group.add(waterMesh);

  function addDrop(gx: number, gy: number, strength: number = 0.8) {
    const radius = 2;
    for (let i = -radius; i <= radius; i += 1) {
      for (let j = -radius; j <= radius; j += 1) {
        const x = gx + i;
        const y = gy + j;
        if (x >= 1 && x < size - 1 && y >= 1 && y < size - 1) {
          const d = Math.sqrt(i * i + j * j);
          if (d <= radius) {
            currentBuf[y * size + x] += strength * (1 - d / radius);
          }
        }
      }
    }
  }

  let lastRain = 0;

  return {
    update(time, _delta, curParams) {
      // Auto rain drops
      if (curParams.autoRain && time - lastRain > 0.4) {
        addDrop(
          Math.floor(Math.random() * (size - 4)) + 2,
          Math.floor(Math.random() * (size - 4)) + 2,
          0.6
        );
        lastRain = time;
      }

      // 2D Wave equation stepping
      const damping = 0.985;
      for (let y = 1; y < size - 1; y += 1) {
        for (let x = 1; x < size - 1; x += 1) {
          const idx = y * size + x;
          const val =
            (currentBuf[idx - 1] +
              currentBuf[idx + 1] +
              currentBuf[idx - size] +
              currentBuf[idx + size]) *
              0.5 -
            prevBuf[idx];
          prevBuf[idx] = val * damping;
        }
      }

      // Swap buffers
      const temp = currentBuf;
      currentBuf = prevBuf;
      prevBuf = temp;

      // Update mesh position buffer
      const pos = geom.attributes.position;
      for (let i = 0; i < pos.count; i += 1) {
        pos.setY(i, currentBuf[i] * 0.8);
      }
      pos.needsUpdate = true;
      geom.computeVertexNormals();
    },
    onPointerDown(_event, raycaster) {
      const intersects = raycaster.intersectObject(waterMesh);
      if (intersects.length > 0) {
        const pt = intersects[0].point;
        // Map world coord to grid
        const gx = Math.floor(((pt.x + 4) / 8) * size);
        const gy = Math.floor(((pt.z + 4) / 8) * size);
        addDrop(gx, gy, 1.2);
      }
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}
