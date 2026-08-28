import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { createParticleSpriteTexture } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 8. 100,000 Spiral Galaxy Simulation
// ----------------------------------------------------------------------

export function initSpiralGalaxyScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;

  let points: THREE.Points | null = null;
  const particleTexture = createParticleSpriteTexture();

  function buildGalaxy() {
    if (points) {
      scene.remove(points);
      points.geometry.dispose();
      (points.material as THREE.Material).dispose();
      points = null;
    }

    const count = Number(params.count ?? 50000);
    const radius = Number(params.radius ?? 8.0);
    const branches = Number(params.branches ?? 4);
    const spin = Number(params.spin ?? 1.2);
    const randomness = Number(params.randomness ?? 0.4);
    const power = Number(params.randomnessPower ?? 3.5);

    const insideColor = new THREE.Color((params.insideColor as string) || '#ff6030');
    const outsideColor = new THREE.Color((params.outsideColor as string) || '#1b3984');

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;

      // Position along radius
      const r = Math.random() * radius;
      const spinAngle = r * spin;
      const branchAngle = ((i % branches) / branches) * Math.PI * 2;

      const randomX =
        Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;
      const randomY =
        Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r * 0.5;
      const randomZ =
        Math.pow(Math.random(), power) * (Math.random() < 0.5 ? 1 : -1) * randomness * r;

      positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;

      // Color interpolation
      const mixedColor = insideColor.clone().lerp(outsideColor, r / radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      scales[i] = Math.random() * 0.8 + 0.2;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: Number(params.size ?? 0.08),
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
    });

    points = new THREE.Points(geom, mat);
    scene.add(points);
  }

  buildGalaxy();

  return {
    update(time, _delta, curParams) {
      if (points) {
        const speed = Number(curParams.speed ?? 0.15);
        points.rotation.y = time * speed;
      }
    },
    onParamChange() {
      buildGalaxy();
    },
    dispose() {
      if (points) {
        scene.remove(points);
        points.geometry.dispose();
        (points.material as THREE.Material).dispose();
      }
      particleTexture.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 9. 3D Matrix Digital Rain Cylinder
// ----------------------------------------------------------------------

export function initMatrixDigitalRainScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;

  const count = 3000;
  const positions = new Float32Array(count * 3);
  const speeds = new Float32Array(count);
  const colors = new Float32Array(count * 3);

  const radius = 6;
  const height = 12;

  for (let i = 0; i < count; i += 1) {
    const i3 = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const r = radius * (0.4 + Math.random() * 0.6);

    positions[i3] = Math.cos(angle) * r;
    positions[i3 + 1] = (Math.random() * 2 - 1) * (height / 2);
    positions[i3 + 2] = Math.sin(angle) * r;

    speeds[i] = 1.5 + Math.random() * 3.5;

    // Matrix neon greens
    const greenShade = Math.random();
    if (greenShade > 0.9) {
      colors[i3] = 0.8;
      colors[i3 + 1] = 1.0;
      colors[i3 + 2] = 0.8;
    } else {
      colors[i3] = 0.0;
      colors[i3 + 1] = 0.4 + Math.random() * 0.6;
      colors[i3 + 2] = 0.1;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: Number(params.size ?? 0.15),
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geom, mat);
  scene.add(points);

  return {
    update(_time, delta, curParams) {
      const fallSpeed = Number(curParams.speed ?? 1.5);
      const pos = geom.attributes.position;
      for (let i = 0; i < count; i += 1) {
        let y = pos.getY(i);
        y -= speeds[i] * delta * fallSpeed;
        if (y < -height / 2) {
          y = height / 2;
        }
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
      points.rotation.y += delta * 0.1;
    },
    dispose() {
      scene.remove(points);
      geom.dispose();
      mat.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 10. Lorenz Attractor Chaos Flow
// ----------------------------------------------------------------------

export function initLorenzAttractorScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;

  const group = new THREE.Group();
  scene.add(group);

  const sigma = 10;
  const rho = 28;
  const beta = 8 / 3;

  const numPoints = 8000;
  const positions = new Float32Array(numPoints * 3);
  const colors = new Float32Array(numPoints * 3);

  let x = 0.1;
  let y = 0;
  let z = 0;
  const dt = 0.005;

  const colA = new THREE.Color('#38bdf8');
  const colB = new THREE.Color('#f43f5e');

  for (let i = 0; i < numPoints; i += 1) {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;

    x += dx;
    y += dy;
    z += dz;

    const i3 = i * 3;
    // Scale and center attractor
    positions[i3] = x * 0.22;
    positions[i3 + 1] = (z - 25) * 0.22;
    positions[i3 + 2] = y * 0.22;

    const t = i / numPoints;
    const c = colA.clone().lerp(colB, t);
    colors[i3] = c.r;
    colors[i3 + 1] = c.g;
    colors[i3 + 2] = c.b;
  }

  const lineGeom = new THREE.BufferGeometry();
  lineGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  lineGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const lineMat = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
  });
  const line = new THREE.Line(lineGeom, lineMat);
  group.add(line);

  // Moving tracing head particle
  const headGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const headMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const headMesh = new THREE.Mesh(headGeom, headMat);
  group.add(headMesh);

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.rotateSpeed ?? 1.0);
      group.rotation.y = time * 0.3 * speed;
      group.rotation.x = Math.sin(time * 0.2) * 0.2;

      // Animate tracing particle along trajectory
      const headIdx = Math.floor((time * 300) % numPoints) * 3;
      headMesh.position.set(positions[headIdx], positions[headIdx + 1], positions[headIdx + 2]);
    },
    dispose() {
      scene.remove(group);
      lineGeom.dispose();
      lineMat.dispose();
      headGeom.dispose();
      headMat.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 11. 3D Fireworks Physics Explosion
// ----------------------------------------------------------------------

interface FireworkParticle {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  color: THREE.Color;
  life: number;
  maxLife: number;
}

export function initFireworksPhysicsScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;

  const maxParticles = 3000;
  const particles: FireworkParticle[] = [];

  const positions = new Float32Array(maxParticles * 3);
  const colors = new Float32Array(maxParticles * 3);

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleTex = createParticleSpriteTexture();
  const mat = new THREE.PointsMaterial({
    size: 0.25,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: particleTex,
  });

  const points = new THREE.Points(geom, mat);
  scene.add(points);

  const palette = [
    new THREE.Color('#ff3366'),
    new THREE.Color('#33ccff'),
    new THREE.Color('#ffcc00'),
    new THREE.Color('#33ff99'),
    new THREE.Color('#cc33ff'),
  ];

  function launchFirework() {
    const origin = new THREE.Vector3(
      (Math.random() - 0.5) * 6,
      Math.random() * 3 + 1,
      (Math.random() - 0.5) * 6
    );
    const count = 120 + Math.floor(Math.random() * 80);
    const baseColor = palette[Math.floor(Math.random() * palette.length)];

    for (let i = 0; i < count; i += 1) {
      if (particles.length >= maxParticles) break;

      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const speed = 2.0 + Math.random() * 4.0;

      const vel = new THREE.Vector3(
        speed * Math.sin(phi) * Math.cos(theta),
        speed * Math.sin(phi) * Math.sin(theta),
        speed * Math.cos(phi)
      );

      particles.push({
        pos: origin.clone(),
        vel,
        color: baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.1, 0, 0),
        life: 1.0,
        maxLife: 1.0 + Math.random() * 0.8,
      });
    }
  }

  let lastLaunch = 0;

  return {
    update(time, delta) {
      if (time - lastLaunch > 0.8) {
        launchFirework();
        lastLaunch = time;
      }

      // Update particle physics
      const gravity = new THREE.Vector3(0, -3.5 * delta, 0);
      const drag = 0.96;

      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= delta / p.maxLife;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.vel.add(gravity);
        p.vel.multiplyScalar(drag);
        p.pos.addScaledVector(p.vel, delta);
      }

      // Sync buffers
      const posAttr = geom.attributes.position;
      const colAttr = geom.attributes.color;

      for (let i = 0; i < maxParticles; i += 1) {
        if (i < particles.length) {
          const p = particles[i];
          posAttr.setXYZ(i, p.pos.x, p.pos.y, p.pos.z);
          colAttr.setXYZ(i, p.color.r * p.life, p.color.g * p.life, p.color.b * p.life);
        } else {
          posAttr.setXYZ(i, 0, -999, 0);
        }
      }

      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;
    },
    onAction(actionKey) {
      if (actionKey === 'burst') {
        launchFirework();
        launchFirework();
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
