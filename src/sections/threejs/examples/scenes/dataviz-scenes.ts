import type { SceneInstance, SceneInitContext } from '../../types';

import * as THREE from 'three';

import { setupStudioLighting } from '../../utils/three-helpers';

// ----------------------------------------------------------------------
// 19. Interactive Global 3D Data Globe
// ----------------------------------------------------------------------

interface HubLocation {
  name: string;
  lat: number;
  lng: number;
}

export function initDataGlobeScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const globeRadius = 2.8;

  // 1. Base Globe Sphere
  const globeGeom = new THREE.SphereGeometry(globeRadius, 64, 64);
  const globeMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.7,
    metalness: 0.3,
  });
  const globeMesh = new THREE.Mesh(globeGeom, globeMat);
  group.add(globeMesh);

  // 2. Wireframe / Latitude Longitude Lines
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    wireframe: true,
    transparent: true,
    opacity: 0.15,
  });
  const wireGlobe = new THREE.Mesh(globeGeom, wireMat);
  group.add(wireGlobe);

  // Convert Lat/Lng to 3D Sphere Position
  function latLngToVector3(lat: number, lng: number, r: number = globeRadius): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -(r * Math.sin(phi) * Math.cos(theta)),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
  }

  const hubs: HubLocation[] = [
    { name: 'Seoul', lat: 37.5665, lng: 126.978 },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
    { name: 'San Francisco', lat: 37.7749, lng: -122.4194 },
    { name: 'New York', lat: 40.7128, lng: -74.006 },
    { name: 'London', lat: 51.5074, lng: -0.1278 },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198 },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821 },
  ];

  // Add Hub Pin Markers
  const hubMeshes: THREE.Mesh[] = [];
  hubs.forEach((hub) => {
    const pos = latLngToVector3(hub.lat, hub.lng, globeRadius + 0.04);
    const pinGeom = new THREE.SphereGeometry(0.08, 16, 16);
    const pinMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const pin = new THREE.Mesh(pinGeom, pinMat);
    pin.position.copy(pos);
    group.add(pin);
    hubMeshes.push(pin);
  });

  // 3. Connect Hubs with Glowing 3D Bezier Arcs
  const arcLines: THREE.Line[] = [];
  const connections: [number, number][] = [
    [0, 1], // Seoul -> Tokyo
    [0, 2], // Seoul -> SF
    [0, 5], // Seoul -> Singapore
    [2, 3], // SF -> NY
    [3, 4], // NY -> London
    [4, 7], // London -> Frankfurt
    [5, 6], // Singapore -> Sydney
  ];

  connections.forEach(([i, j]) => {
    const p1 = latLngToVector3(hubs[i].lat, hubs[i].lng, globeRadius);
    const p2 = latLngToVector3(hubs[j].lat, hubs[j].lng, globeRadius);

    const mid = p1.clone().add(p2).multiplyScalar(0.5);
    const distance = p1.distanceTo(p2);
    // Raise arc height based on distance
    mid.normalize().multiplyScalar(globeRadius + distance * 0.35);

    const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
    const points = curve.getPoints(40);

    const arcGeom = new THREE.BufferGeometry().setFromPoints(points);
    const arcMat = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.7,
    });
    const arcLine = new THREE.Line(arcGeom, arcMat);
    group.add(arcLine);
    arcLines.push(arcLine);
  });

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.0);
      group.rotation.y = time * 0.15 * speed;

      // Pulsate hub pins
      hubMeshes.forEach((pin, idx) => {
        const s = 1.0 + Math.sin(time * 4.0 + idx) * 0.3;
        pin.scale.setScalar(s);
      });
    },
    dispose() {
      scene.remove(group);
      globeGeom.dispose();
      globeMat.dispose();
      wireMat.dispose();
      hubMeshes.forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      arcLines.forEach((a) => {
        a.geometry.dispose();
        (a.material as THREE.Material).dispose();
      });
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 20. 3D Multidimensional Bar Matrix
// ----------------------------------------------------------------------

export function init3DBarChartMatrixScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const size = 8;
  const spacing = 0.8;
  const bars: { mesh: THREE.Mesh; targetHeight: number; curHeight: number }[] = [];

  const palette = ['#00f0ff', '#38bdf8', '#818cf8', '#a855f7', '#ec4899', '#f43f5e'];

  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const geom = new THREE.BoxGeometry(0.55, 1, 0.55);
      // Translate pivot to bottom
      geom.translate(0, 0.5, 0);

      const colorIdx = Math.floor(((r + c) / (size * 2)) * palette.length);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(palette[colorIdx]),
        metalness: 0.6,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set((c - size / 2 + 0.5) * spacing, 0, (r - size / 2 + 0.5) * spacing);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);

      const initHeight = Math.sin((r / size) * Math.PI) * Math.cos((c / size) * Math.PI) * 3 + 1;
      bars.push({
        mesh,
        targetHeight: Math.max(initHeight, 0.2),
        curHeight: 0.1,
      });
    }
  }

  // Base platform
  const baseGeom = new THREE.BoxGeometry(size * spacing + 1, 0.2, size * spacing + 1);
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8 });
  const baseMesh = new THREE.Mesh(baseGeom, baseMat);
  baseMesh.position.y = -0.1;
  baseMesh.receiveShadow = true;
  group.add(baseMesh);

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.5);
      group.rotation.y = time * 0.2;

      bars.forEach((bar, idx) => {
        const r = Math.floor(idx / size);
        const c = idx % size;

        // Dynamic undulating wave pattern
        const dynamicH =
          (Math.sin(r * 0.8 + time * speed) + Math.cos(c * 0.8 + time * speed) + 2) * 1.2;
        bar.targetHeight = Math.max(dynamicH, 0.2);

        bar.curHeight += (bar.targetHeight - bar.curHeight) * 0.1;
        bar.mesh.scale.y = bar.curHeight;
      });
    },
    dispose() {
      scene.remove(group);
      bars.forEach((b) => {
        b.mesh.geometry.dispose();
        (b.mesh.material as THREE.Material).dispose();
      });
      baseGeom.dispose();
      baseMat.dispose();
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}

// ----------------------------------------------------------------------
// 21. 3D AI Vector Embedding Point Cloud Clusters
// ----------------------------------------------------------------------

export function initPointCloudClusterScene(ctx: SceneInitContext): SceneInstance {
  const { scene } = ctx;
  const lights = setupStudioLighting(scene);

  const group = new THREE.Group();
  scene.add(group);

  const clusterCount = 4;
  const pointsPerCluster = 350;
  const totalPoints = clusterCount * pointsPerCluster;

  const clusterCenters = [
    new THREE.Vector3(-2.5, 1.5, -1.0),
    new THREE.Vector3(2.5, 1.2, 1.0),
    new THREE.Vector3(-1.0, -1.8, 2.0),
    new THREE.Vector3(1.5, -1.5, -2.0),
  ];

  const clusterColors = [
    new THREE.Color('#38bdf8'), // Blue: NLP
    new THREE.Color('#ec4899'), // Pink: Vision
    new THREE.Color('#10b981'), // Green: Audio
    new THREE.Color('#f59e0b'), // Amber: Multimodal
  ];

  const positions = new Float32Array(totalPoints * 3);
  const colors = new Float32Array(totalPoints * 3);

  let pIdx = 0;
  for (let c = 0; c < clusterCount; c += 1) {
    const center = clusterCenters[c];
    const col = clusterColors[c];

    for (let i = 0; i < pointsPerCluster; i += 1) {
      // Gaussian distribution around cluster center
      const u1 = Math.random();
      const u2 = Math.random();
      const radius = Math.sqrt(-2.0 * Math.log(u1)) * 0.9;
      const theta = 2.0 * Math.PI * u2;

      const px = center.x + radius * Math.cos(theta);
      const py = center.y + (Math.random() - 0.5) * 1.4;
      const pz = center.z + radius * Math.sin(theta);

      positions[pIdx * 3] = px;
      positions[pIdx * 3 + 1] = py;
      positions[pIdx * 3 + 2] = pz;

      colors[pIdx * 3] = col.r;
      colors[pIdx * 3 + 1] = col.g;
      colors[pIdx * 3 + 2] = col.b;

      pIdx += 1;
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geom, mat);
  group.add(points);

  // Cluster Center Spheres
  const centerMeshes: THREE.Mesh[] = [];
  clusterCenters.forEach((center, idx) => {
    const cGeom = new THREE.SphereGeometry(0.3, 24, 24);
    const cMat = new THREE.MeshStandardMaterial({
      color: clusterColors[idx],
      emissive: clusterColors[idx],
      emissiveIntensity: 0.5,
    });
    const cMesh = new THREE.Mesh(cGeom, cMat);
    cMesh.position.copy(center);
    group.add(cMesh);
    centerMeshes.push(cMesh);
  });

  return {
    update(time, _delta, curParams) {
      const speed = Number(curParams.speed ?? 1.0);
      group.rotation.y = time * 0.25 * speed;
      group.rotation.x = Math.sin(time * 0.15) * 0.15;
    },
    dispose() {
      scene.remove(group);
      geom.dispose();
      mat.dispose();
      centerMeshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      lights.ambient.dispose();
      lights.keyLight.dispose();
      lights.fillLight.dispose();
      lights.rimLight.dispose();
    },
  };
}
