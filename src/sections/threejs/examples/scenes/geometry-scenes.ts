import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper.js';

import { setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 1. Geometric Primitives Showroom
// ----------------------------------------------------------------------

export function initGeometryShowroomScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  let currentMesh: THREE.Mesh | null = null;
  let normalsHelper: VertexNormalsHelper | null = null;
  let wireframeMesh: THREE.Mesh | null = null;

  function createGeometry(type: string, detail: number): THREE.BufferGeometry {
    switch (type) {
      case 'sphere':
        return new THREE.SphereGeometry(2.2, detail * 8, detail * 8);
      case 'torus':
        return new THREE.TorusGeometry(1.8, 0.7, detail * 6, detail * 10);
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(1.6, 0.5, detail * 16, detail * 4);
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(2.2, Math.min(detail, 5));
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(2.2, Math.min(detail - 1, 4));
      case 'octahedron':
        return new THREE.OctahedronGeometry(2.2, Math.min(detail - 1, 4));
      case 'cylinder':
        return new THREE.CylinderGeometry(1.5, 1.5, 3, detail * 6);
      case 'capsule':
        return new THREE.CapsuleGeometry(1.3, 1.6, detail * 4, detail * 8);
      case 'cone':
        return new THREE.ConeGeometry(1.8, 3.2, detail * 6);
      case 'cube':
      default:
        return new THREE.BoxGeometry(2.6, 2.6, 2.6, detail, detail, detail);
    }
  }

  function rebuildMesh() {
    if (currentMesh) {
      if (normalsHelper) {
        scene.remove(normalsHelper);
        normalsHelper.dispose();
        normalsHelper = null;
      }
      if (wireframeMesh) {
        group.remove(wireframeMesh);
        wireframeMesh.geometry.dispose();
        wireframeMesh = null;
      }
      group.remove(currentMesh);
      currentMesh.geometry.dispose();
      (currentMesh.material as THREE.Material).dispose();
      currentMesh = null;
    }

    const geomType = (params.geomType as string) || 'torusKnot';
    const detail = Number(params.detail || 4);
    const geom = createGeometry(geomType, detail);

    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color((params.color as string) || '#00d2ff'),
      metalness: Number(params.metalness ?? 0.6),
      roughness: Number(params.roughness ?? 0.2),
      flatShading: Boolean(params.flatShading),
    });

    currentMesh = new THREE.Mesh(geom, mat);
    currentMesh.castShadow = true;
    currentMesh.receiveShadow = true;
    group.add(currentMesh);

    if (params.showWireframe) {
      const wireMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      wireframeMesh = new THREE.Mesh(geom, wireMat);
      group.add(wireframeMesh);
    }

    if (params.showNormals) {
      normalsHelper = new VertexNormalsHelper(currentMesh, 0.4, 0x00ff88);
      scene.add(normalsHelper);
    }
  }

  rebuildMesh();

  // Floor grid
  const floorGeom = new THREE.PlaneGeometry(30, 30);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.8,
    metalness: 0.2,
  });
  const floor = new THREE.Mesh(floorGeom, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2.5;
  floor.receiveShadow = true;
  scene.add(floor);

  const grid = new THREE.GridHelper(30, 30, 0x38bdf8, 0x1e293b);
  grid.position.y = -2.49;
  scene.add(grid);

  return {
    update(time, _delta, curParams) {
      if (currentMesh && curParams.autoRotate) {
        const speed = Number(curParams.rotateSpeed || 1.0);
        currentMesh.rotation.y = time * 0.5 * speed;
        currentMesh.rotation.x = Math.sin(time * 0.3 * speed) * 0.4;
        if (wireframeMesh) {
          wireframeMesh.rotation.copy(currentMesh.rotation);
        }
        if (normalsHelper) {
          normalsHelper.update();
        }
      }

      // Vertex wave displacement effect
      if (curParams.vertexWave && currentMesh) {
        const pos = currentMesh.geometry.attributes.position;
        if (pos) {
          const count = pos.count;
          for (let i = 0; i < count; i += 1) {
            const x = pos.getX(i);
            const y = pos.getY(i);
            const z = pos.getZ(i);
            const len = Math.sqrt(x * x + y * y + z * z);
            if (len > 0.01) {
              const nx = x / len;
              const ny = y / len;
              const nz = z / len;
              const wave = Math.sin(len * 3.0 + time * 3.0) * 0.15;
              pos.setXYZ(i, nx * (len + wave), ny * (len + wave), nz * (len + wave));
            }
          }
          pos.needsUpdate = true;
        }
      }
    },
    onParamChange(_key, _value) {
      rebuildMesh();
    },
    dispose() {
      if (normalsHelper) {
        scene.remove(normalsHelper);
        normalsHelper.dispose();
      }
      scene.remove(group);
      scene.remove(floor);
      scene.remove(grid);
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
// 2. Torus Knot & Mobius Strip
// ----------------------------------------------------------------------

export function initTorusKnotMobiusScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  let knotMesh: THREE.Mesh | null = null;
  let mobiusMesh: THREE.Mesh | null = null;

  function build() {
    if (knotMesh) {
      group.remove(knotMesh);
      knotMesh.geometry.dispose();
      (knotMesh.material as THREE.Material).dispose();
      knotMesh = null;
    }
    if (mobiusMesh) {
      group.remove(mobiusMesh);
      mobiusMesh.geometry.dispose();
      (mobiusMesh.material as THREE.Material).dispose();
      mobiusMesh = null;
    }

    const p = Number(params.p || 2);
    const q = Number(params.q || 3);
    const tubeRadius = Number(params.tubeRadius || 0.4);
    const mode = (params.mode as string) || 'knot';

    if (mode === 'knot') {
      const geom = new THREE.TorusKnotGeometry(2.0, tubeRadius, 256, 32, p, q);
      const mat = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color((params.color as string) || '#a855f7'),
        metalness: 0.9,
        roughness: 0.15,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        ior: 1.5,
        iridescence: 0.8,
        iridescenceIOR: 1.3,
      });
      knotMesh = new THREE.Mesh(geom, mat);
      knotMesh.castShadow = true;
      group.add(knotMesh);
    } else {
      // Procedural Mobius Strip Geometry
      const uSegs = 160;
      const vSegs = 20;
      const positions: number[] = [];
      const normals: number[] = [];
      const uvs: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= uSegs; i += 1) {
        const u = (i / uSegs) * Math.PI * 2;
        for (let j = 0; j <= vSegs; j += 1) {
          const v = (j / vSegs) * 2 - 1; // -1 to 1
          const width = 0.8;
          const R = 2.4;

          const x = (R + v * width * Math.cos(u / 2)) * Math.cos(u);
          const y = (R + v * width * Math.cos(u / 2)) * Math.sin(u);
          const z = v * width * Math.sin(u / 2);

          positions.push(x, y, z);
          normals.push(0, 0, 1);
          uvs.push(i / uSegs, j / vSegs);
        }
      }

      for (let i = 0; i < uSegs; i += 1) {
        for (let j = 0; j < vSegs; j += 1) {
          const a = i * (vSegs + 1) + j;
          const b = (i + 1) * (vSegs + 1) + j;
          const c = (i + 1) * (vSegs + 1) + (j + 1);
          const d = i * (vSegs + 1) + (j + 1);
          indices.push(a, b, d);
          indices.push(b, c, d);
        }
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      geom.setIndex(indices);
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color((params.color as string) || '#06b6d4'),
        roughness: 0.2,
        metalness: 0.8,
        side: THREE.DoubleSide,
      });

      mobiusMesh = new THREE.Mesh(geom, mat);
      group.add(mobiusMesh);
    }
  }

  build();

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.rotateSpeed || 1.0);
      group.rotation.x = time * 0.4 * speed;
      group.rotation.y = time * 0.6 * speed;
      group.rotation.z = Math.sin(time * 0.2 * speed) * 0.3;
    },
    onParamChange() {
      build();
    },
    dispose() {
      scene.remove(group);
      if (knotMesh) {
        knotMesh.geometry.dispose();
        (knotMesh.material as THREE.Material).dispose();
      }
      if (mobiusMesh) {
        mobiusMesh.geometry.dispose();
        (mobiusMesh.material as THREE.Material).dispose();
      }
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 3. Parametric Math Surfaces
// ----------------------------------------------------------------------

export function initParametricMathSurfacesScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  let surfaceMesh: THREE.Mesh | null = null;
  const segs = 90;

  function buildSurface() {
    if (surfaceMesh) {
      group.remove(surfaceMesh);
      surfaceMesh.geometry.dispose();
      (surfaceMesh.material as THREE.Material).dispose();
      surfaceMesh = null;
    }

    const formula = (params.formula as string) || 'ripple';
    const positions: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    const size = 6;
    const colorA = new THREE.Color((params.colorA as string) || '#06b6d4');
    const colorB = new THREE.Color((params.colorB as string) || '#ec4899');

    for (let i = 0; i <= segs; i += 1) {
      const u = (i / segs) * 2 - 1; // -1 to 1
      const x = u * (size / 2);

      for (let j = 0; j <= segs; j += 1) {
        const v = (j / segs) * 2 - 1; // -1 to 1
        const y = v * (size / 2);
        let z = 0;

        const r = Math.sqrt(x * x + y * y);
        if (formula === 'ripple') {
          z = Math.sin(r * 2.5) * 0.9;
        } else if (formula === 'saddle') {
          z = (x * x - y * y) * 0.25;
        } else if (formula === 'sombrero') {
          z = r === 0 ? 1 : (Math.sin(r * 3) / (r * 3)) * 2;
        } else if (formula === 'eggcarton') {
          z = (Math.sin(x * 2) + Math.sin(y * 2)) * 0.6;
        }

        positions.push(x, z, y);

        const t = (z + 1.2) / 2.4;
        const c = colorA.clone().lerp(colorB, Math.min(Math.max(t, 0), 1));
        colors.push(c.r, c.g, c.b);
      }
    }

    for (let i = 0; i < segs; i += 1) {
      for (let j = 0; j < segs; j += 1) {
        const a = i * (segs + 1) + j;
        const b = (i + 1) * (segs + 1) + j;
        const c = (i + 1) * (segs + 1) + (j + 1);
        const d = i * (segs + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.3,
      metalness: 0.4,
      side: THREE.DoubleSide,
      wireframe: Boolean(params.wireframe),
    });

    surfaceMesh = new THREE.Mesh(geom, mat);
    group.add(surfaceMesh);
  }

  buildSurface();

  return {
    update(time, _delta, curParams) {
      if (surfaceMesh && curParams.animate) {
        const formula = (curParams.formula as string) || 'ripple';
        const pos = surfaceMesh.geometry.attributes.position;
        const col = surfaceMesh.geometry.attributes.color;
        const colorA = new THREE.Color((curParams.colorA as string) || '#06b6d4');
        const colorB = new THREE.Color((curParams.colorB as string) || '#ec4899');
        const speed = Number(curParams.speed || 1.5);

        let idx = 0;
        for (let i = 0; i <= segs; i += 1) {
          const u = (i / segs) * 2 - 1;
          const x = u * 3;
          for (let j = 0; j <= segs; j += 1) {
            const v = (j / segs) * 2 - 1;
            const y = v * 3;
            const r = Math.sqrt(x * x + y * y);
            let z = 0;

            if (formula === 'ripple') {
              z = Math.sin(r * 2.5 - time * speed) * 0.9;
            } else if (formula === 'sombrero') {
              z = (Math.sin(r * 3 - time * speed) / (r + 0.1)) * 1.5;
            } else if (formula === 'eggcarton') {
              z = (Math.sin(x * 2 + time * speed) + Math.cos(y * 2 + time * speed)) * 0.6;
            } else {
              z = (x * x - y * y) * 0.25 * Math.sin(time * speed * 0.5);
            }

            pos.setY(idx, z);
            const t = (z + 1.2) / 2.4;
            const c = colorA.clone().lerp(colorB, Math.min(Math.max(t, 0), 1));
            col.setXYZ(idx, c.r, c.g, c.b);
            idx += 1;
          }
        }
        pos.needsUpdate = true;
        col.needsUpdate = true;
        surfaceMesh.geometry.computeVertexNormals();
      }
      group.rotation.y = time * 0.2;
    },
    onParamChange() {
      buildSurface();
    },
    dispose() {
      scene.remove(group);
      if (surfaceMesh) {
        surfaceMesh.geometry.dispose();
        (surfaceMesh.material as THREE.Material).dispose();
      }
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}
