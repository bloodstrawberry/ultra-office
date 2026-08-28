import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 22. 3D Voxel Builder & Sandbox
// ----------------------------------------------------------------------

export function initVoxelBuilderScene(ctx: SceneInitContext): SceneInstance {
  const { scene, params } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const gridSize = 10;
  const boxSize = 1.0;

  // Base Grid Plane
  const gridHelper = new THREE.GridHelper(gridSize * boxSize, gridSize, 0x00f0ff, 0x334155);
  gridHelper.position.y = -0.01;
  group.add(gridHelper);

  const planeGeom = new THREE.PlaneGeometry(gridSize * boxSize, gridSize * boxSize);
  planeGeom.rotateX(-Math.PI / 2);
  const planeMat = new THREE.MeshBasicMaterial({ visible: false });
  const plane = new THREE.Mesh(planeGeom, planeMat);
  group.add(plane);

  // Roll-over highlight block
  const rollOverGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const rollOverMat = new THREE.MeshBasicMaterial({
    color: 0xff0000,
    opacity: 0.5,
    transparent: true,
  });
  const rollOverMesh = new THREE.Mesh(rollOverGeom, rollOverMat);
  group.add(rollOverMesh);

  const boxGeom = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
  const voxelObjects: THREE.Mesh[] = [];

  function addVoxel(pos: THREE.Vector3, colorHex: string) {
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(colorHex),
      roughness: 0.3,
      metalness: 0.2,
    });
    const voxel = new THREE.Mesh(boxGeom, mat);
    voxel.position.copy(pos);
    voxel.castShadow = true;
    voxel.receiveShadow = true;
    group.add(voxel);
    voxelObjects.push(voxel);
  }

  // Pre-seed some cute voxel blocks
  const initialColors = ['#38bdf8', '#a855f7', '#ec4899', '#22c55e', '#f59e0b'];
  for (let x = -2; x <= 2; x += 1) {
    for (let z = -2; z <= 2; z += 1) {
      if (Math.abs(x) + Math.abs(z) <= 3) {
        const c = initialColors[Math.abs(x + z) % initialColors.length];
        addVoxel(new THREE.Vector3(x * boxSize, boxSize / 2, z * boxSize), c);
      }
    }
  }

  return {
    update(time) {
      rollOverMat.opacity = 0.4 + Math.sin(time * 6.0) * 0.2;
    },
    onPointerMove(_event, raycaster) {
      const targets = [plane, ...voxelObjects];
      const intersects = raycaster.intersectObjects(targets, false);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        if (intersect.point && intersect.face) {
          const position = new THREE.Vector3();
          position.copy(intersect.point).add(intersect.face.normal);
          position
            .divideScalar(boxSize)
            .floor()
            .multiplyScalar(boxSize)
            .addScalar(boxSize / 2);
          rollOverMesh.position.copy(position);
        }
      }
    },
    onPointerDown(_event, raycaster) {
      const targets = [plane, ...voxelObjects];
      const intersects = raycaster.intersectObjects(targets, false);
      if (intersects.length > 0) {
        const intersect = intersects[0];
        if (_event.shiftKey) {
          // Remove voxel
          if (intersect.object !== plane) {
            group.remove(intersect.object);
            const idx = voxelObjects.indexOf(intersect.object as THREE.Mesh);
            if (idx !== -1) voxelObjects.splice(idx, 1);
          }
        } else if (intersect.point && intersect.face) {
          // Place voxel
          const position = new THREE.Vector3();
          position.copy(intersect.point).add(intersect.face.normal);
          position
            .divideScalar(boxSize)
            .floor()
            .multiplyScalar(boxSize)
            .addScalar(boxSize / 2);
          const colorHex = (params.color as string) || '#00f0ff';
          addVoxel(position, colorHex);
        }
      }
    },
    onAction(actionKey) {
      if (actionKey === 'clear') {
        voxelObjects.forEach((v) => group.remove(v));
        voxelObjects.length = 0;
      }
    },
    dispose() {
      scene.remove(group);
      boxGeom.dispose();
      rollOverGeom.dispose();
      rollOverMat.dispose();
      planeGeom.dispose();
      planeMat.dispose();
      voxelObjects.forEach((v) => {
        (v.material as THREE.Material).dispose();
      });
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 23. Interactive 3D Rubik's Cube
// ----------------------------------------------------------------------

export function initRubiksCubeScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const cubeSize = 0.95;
  const gap = 1.0;
  const cubes: THREE.Mesh[] = [];

  // 6 Face Colors standard
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.3 }), // Right: Red
    new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.3 }), // Left: Orange
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 }), // Top: White
    new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 }), // Bottom: Yellow
    new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.3 }), // Front: Green
    new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.3 }), // Back: Blue
  ];

  const geom = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  for (let x = -1; x <= 1; x += 1) {
    for (let y = -1; y <= 1; y += 1) {
      for (let z = -1; z <= 1; z += 1) {
        const mesh = new THREE.Mesh(geom, materials);
        mesh.position.set(x * gap, y * gap, z * gap);
        mesh.castShadow = true;
        group.add(mesh);
        cubes.push(mesh);
      }
    }
  }

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.0);
      group.rotation.x = time * 0.3 * speed;
      group.rotation.y = time * 0.45 * speed;

      // Animate top layer twist
      const twist = Math.sin(time * 2.0 * speed) * (Math.PI / 2);
      cubes.forEach((c) => {
        if (c.position.y > 0.5) {
          c.rotation.y = twist;
        }
      });
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      materials.forEach((m) => m.dispose());
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 24. Sci-Fi Starfighter Asteroid Dodge Mini-Game
// ----------------------------------------------------------------------

interface Asteroid {
  mesh: THREE.Mesh;
  rotSpeed: THREE.Vector3;
  speed: number;
}

export function initAsteroidDodgeFlightScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  // 1. Spaceship Model (Constructed with primitives)
  const shipGroup = new THREE.Group();
  group.add(shipGroup);

  // Fuselage
  const bodyGeom = new THREE.ConeGeometry(0.5, 2.2, 8);
  bodyGeom.rotateX(Math.PI / 2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    metalness: 0.8,
    roughness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  shipGroup.add(body);

  // Wings
  const wingGeom = new THREE.BoxGeometry(2.4, 0.08, 0.9);
  const wingMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9 });
  const wings = new THREE.Mesh(wingGeom, wingMat);
  wings.position.z = 0.3;
  shipGroup.add(wings);

  // Engine Thruster Glow
  const thrusterGeom = new THREE.SphereGeometry(0.2, 16, 16);
  const thrusterMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
  const thruster = new THREE.Mesh(thrusterGeom, thrusterMat);
  thruster.position.z = 1.1;
  shipGroup.add(thruster);

  shipGroup.position.set(0, 0, 2);

  // 2. Procedural Asteroid Field
  const numAsteroids = 35;
  const asteroids: Asteroid[] = [];
  const rockGeom = new THREE.DodecahedronGeometry(0.8, 1);
  const rockMat = new THREE.MeshStandardMaterial({
    color: 0x64748b,
    roughness: 0.9,
    metalness: 0.1,
    flatShading: true,
  });

  for (let i = 0; i < numAsteroids; i += 1) {
    const mesh = new THREE.Mesh(rockGeom, rockMat);
    const scale = 0.5 + Math.random() * 1.2;
    mesh.scale.setScalar(scale);
    mesh.position.set(
      (Math.random() - 0.5) * 14,
      (Math.random() - 0.5) * 10,
      -Math.random() * 60 - 5
    );
    group.add(mesh);

    asteroids.push({
      mesh,
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ),
      speed: 12 + Math.random() * 10,
    });
  }

  let targetX = 0;
  let targetY = 0;

  return {
    update(time, delta, curParams) {
      const flightSpeed = Number(curParams.speed ?? 1.0);

      // Ship smooth follow
      shipGroup.position.x += (targetX - shipGroup.position.x) * 0.1;
      shipGroup.position.y += (targetY - shipGroup.position.y) * 0.1;
      shipGroup.rotation.z = (shipGroup.position.x - targetX) * 0.5;
      shipGroup.rotation.x = (shipGroup.position.y - targetY) * 0.3;

      // Move asteroids towards ship
      asteroids.forEach((ast) => {
        ast.mesh.position.z += ast.speed * delta * flightSpeed;
        ast.mesh.rotation.x += ast.rotSpeed.x * delta;
        ast.mesh.rotation.y += ast.rotSpeed.y * delta;

        if (ast.mesh.position.z > 6) {
          ast.mesh.position.z = -60;
          ast.mesh.position.x = (Math.random() - 0.5) * 14;
          ast.mesh.position.y = (Math.random() - 0.5) * 10;
        }
      });

      // Thruster pulse
      const s = 1.0 + Math.sin(time * 20.0) * 0.3;
      thruster.scale.setScalar(s);
    },
    onPointerMove(event) {
      targetX = (event.clientX / window.innerWidth - 0.5) * 10;
      targetY = -(event.clientY / window.innerHeight - 0.5) * 8;
    },
    dispose() {
      scene.remove(group);
      bodyGeom.dispose();
      bodyMat.dispose();
      wingGeom.dispose();
      wingMat.dispose();
      thrusterGeom.dispose();
      thrusterMat.dispose();
      rockGeom.dispose();
      rockMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}
