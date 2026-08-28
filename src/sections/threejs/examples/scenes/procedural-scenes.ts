import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { fractalPerlin, setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 12. Procedural Infinite 3D Terrain & Biomes
// ----------------------------------------------------------------------

export function initInfiniteTerrainScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const width = 28;
  const depth = 28;
  const segments = 100;

  const geom = new THREE.PlaneGeometry(width, depth, segments, segments);
  geom.rotateX(-Math.PI / 2);

  const colors = new Float32Array(geom.attributes.position.count * 3);
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  function updateElevation(timeOffset: number = 0) {
    const pos = geom.attributes.position;
    const col = geom.attributes.color;
    const heightScale = Number(params.heightScale ?? 3.0);
    const noiseScale = Number(params.noiseScale ?? 0.08);

    const cWater = new THREE.Color('#0284c7');
    const cSand = new THREE.Color('#fef08a');
    const cGrass = new THREE.Color('#22c55e');
    const cRock = new THREE.Color('#64748b');
    const cSnow = new THREE.Color('#ffffff');

    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const h = fractalPerlin(x * noiseScale, (z + timeOffset) * noiseScale, 5, 2.0, 0.5);
      const elev = Math.pow(h, 1.8) * heightScale - 0.5;
      pos.setY(i, elev);

      let finalColor = cWater;
      if (elev < 0.1) {
        finalColor = cWater;
      } else if (elev < 0.35) {
        finalColor = cSand;
      } else if (elev < 1.2) {
        finalColor = cGrass;
      } else if (elev < 2.0) {
        finalColor = cRock;
      } else {
        finalColor = cSnow;
      }

      col.setXYZ(i, finalColor.r, finalColor.g, finalColor.b);
    }

    pos.needsUpdate = true;
    col.needsUpdate = true;
    geom.computeVertexNormals();
  }

  updateElevation(0);

  const mat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.1,
    flatShading: Boolean(params.flatShading),
  });

  const terrainMesh = new THREE.Mesh(geom, mat);
  terrainMesh.receiveShadow = true;
  terrainMesh.castShadow = true;
  group.add(terrainMesh);

  // Translucent water plane
  const waterGeom = new THREE.PlaneGeometry(width, depth);
  waterGeom.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshPhysicalMaterial({
    color: 0x0284c7,
    transmission: 0.8,
    opacity: 0.85,
    transparent: true,
    roughness: 0.1,
    metalness: 0.1,
    ior: 1.333,
  });
  const waterMesh = new THREE.Mesh(waterGeom, waterMat);
  waterMesh.position.y = 0.05;
  group.add(waterMesh);

  return {
    update(time, _delta, curParams) {
      if (curParams.animate) {
        const speed = Number(curParams.speed ?? 1.0);
        updateElevation(time * speed * 2.0);
      }
    },
    onParamChange() {
      updateElevation(0);
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mat.dispose();
      waterGeom.dispose();
      waterMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 13. Procedural Planet & Atmospheric Glow
// ----------------------------------------------------------------------

export function initProceduralPlanetScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // 1. Planet Body
  const radius = 2.4;
  const planetGeom = new THREE.SphereGeometry(radius, 64, 64);
  const pos = planetGeom.attributes.position;
  const colors = new Float32Array(pos.count * 3);

  const cOcean = new THREE.Color('#0369a1');
  const cLand = new THREE.Color('#15803d');
  const cDesert = new THREE.Color('#ca8a04');
  const cIce = new THREE.Color('#f8fafc');

  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    const noise = fractalPerlin(nx * 2.5, ny * 2.5 + nz * 2.5, 4, 2.0, 0.5);

    let col = cOcean;
    if (noise > 0.55) {
      col = cIce;
    } else if (noise > 0.45) {
      col = cDesert;
    } else if (noise > 0.35) {
      col = cLand;
    }

    // Polar ice caps
    if (Math.abs(ny) > 0.82) {
      col = cIce;
    }

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  planetGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  const planetMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.6,
    metalness: 0.1,
  });
  const planetMesh = new THREE.Mesh(planetGeom, planetMat);
  group.add(planetMesh);

  // 2. Cloud Layer
  const cloudGeom = new THREE.SphereGeometry(radius * 1.025, 48, 48);
  const cloudMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.38,
    roughness: 0.9,
    wireframe: true,
  });
  const cloudMesh = new THREE.Mesh(cloudGeom, cloudMat);
  group.add(cloudMesh);

  // 3. Atmosphere Fresnel Rim Glow
  const atmoGeom = new THREE.SphereGeometry(radius * 1.15, 32, 32);
  const atmoMat = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.5);
        gl_FragColor = vec4(0.2, 0.75, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true,
  });
  const atmoMesh = new THREE.Mesh(atmoGeom, atmoMat);
  group.add(atmoMesh);

  // 4. Planet Rings
  const ringGeom = new THREE.RingGeometry(radius * 1.4, radius * 2.2, 64);
  ringGeom.rotateX(Math.PI / 2.3);
  const ringMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
    roughness: 0.5,
  });
  const ringMesh = new THREE.Mesh(ringGeom, ringMat);
  group.add(ringMesh);

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.0);
      planetMesh.rotation.y = time * 0.15 * speed;
      cloudMesh.rotation.y = time * 0.22 * speed;
      ringMesh.rotation.z = time * 0.05 * speed;
    },
    dispose() {
      scene.remove(group);
      planetGeom.dispose();
      planetMat.dispose();
      cloudGeom.dispose();
      cloudMat.dispose();
      atmoGeom.dispose();
      atmoMat.dispose();
      ringGeom.dispose();
      ringMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 14. Hyperspace Warp Tunnel
// ----------------------------------------------------------------------

export function initHyperspaceWarpTunnelScene(ctx: SceneInitContext): SceneInstance {
  const { scene, camera } = ctx;

  const numRings = 40;
  const ringGroup = new THREE.Group();
  scene.add(ringGroup);

  const rings: THREE.Mesh[] = [];
  const ringRadius = 3.5;
  const ringSpacing = 1.8;

  for (let i = 0; i < numRings; i += 1) {
    const geom = new THREE.TorusGeometry(ringRadius, 0.06, 8, 24);
    const hue = (i / numRings) * 0.8 + 0.5; // Neon cyan to magenta
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(hue % 1.0, 1.0, 0.6),
      wireframe: true,
    });
    const ring = new THREE.Mesh(geom, mat);
    ring.position.z = -i * ringSpacing;
    ringGroup.add(ring);
    rings.push(ring);
  }

  // Speed streak particles inside tunnel
  const streakCount = 400;
  const streakGeom = new THREE.BufferGeometry();
  const streakPos = new Float32Array(streakCount * 3);
  for (let i = 0; i < streakCount; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * (ringRadius - 0.5);
    streakPos[i * 3] = Math.cos(angle) * r;
    streakPos[i * 3 + 1] = Math.sin(angle) * r;
    streakPos[i * 3 + 2] = -Math.random() * (numRings * ringSpacing);
  }
  streakGeom.setAttribute('position', new THREE.BufferAttribute(streakPos, 3));
  const streakMat = new THREE.PointsMaterial({
    color: 0x00f0ff,
    size: 0.12,
    transparent: true,
    opacity: 0.7,
  });
  const streaks = new THREE.Points(streakGeom, streakMat);
  scene.add(streaks);

  camera.position.set(0, 0, 4);

  return {
    update(time, delta, curParams) {
      const speed = Number(curParams.speed ?? 12.0);
      const totalLength = numRings * ringSpacing;

      // Advance rings towards camera
      rings.forEach((ring, idx) => {
        ring.position.z += speed * delta;
        if (ring.position.z > 4) {
          ring.position.z -= totalLength;
        }
        ring.rotation.z = time * 0.4 + idx * 0.1;
      });

      // Advance streak particles
      const pos = streakGeom.attributes.position;
      for (let i = 0; i < streakCount; i += 1) {
        let z = pos.getZ(i);
        z += speed * 1.5 * delta;
        if (z > 4) {
          z = -totalLength;
        }
        pos.setZ(i, z);
      }
      pos.needsUpdate = true;
    },
    dispose() {
      scene.remove(ringGroup);
      scene.remove(streaks);
      rings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      streakGeom.dispose();
      streakMat.dispose();
    },
  };
}
