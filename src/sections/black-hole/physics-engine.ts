import type { PresetType, ImpactScenario, BlackHoleConfig, VisualizationMode } from './types';

// ----------------------------------------------------------------------

export const DEFAULT_SIMULATION_CONFIG: BlackHoleConfig = {
  activeMode: 'mode1',
  mass: 1.0,
  impactParameter: 1.5,
  photonShootId: 0,
  spin: 0.0,
  showAccretionDisk: true,
  diskTemperature: 6500,
  diskDensity: 1.5,
  diskInnerRadiusMult: 1.0,
  diskOuterRadius: 12.0,
  enableDopplerBeaming: true,
  showPhotonSphere: true,
  backgroundMode: 'milkyway',
  isPaused: false,
  cameraMode: 'orbit',
  simSpeed: 1.0,
  spaghettifyDistance: 3.5,
  spaghettifyObject: 'star',
  timeDilationHeight: 2.5,
  binaryMassRatio: 0.8,
  binarySeparation: 6.0,
};

/**
 * 슈바르츠실트 반지름 Rs (Rs = 2.0 * M)
 */
export function calculateSchwarzschildRadius(mass: number): number {
  return Math.max(0.1, 2.0 * mass);
}

/**
 * 광자구 반지름 Rph (Rph = 1.5 * Rs = 3.0 * M)
 */
export function calculatePhotonSphereRadius(mass: number): number {
  return 1.5 * calculateSchwarzschildRadius(mass);
}

/**
 * 가장 안쪽의 안정한 원궤도 (ISCO) 반지름 계산 (Kerr Metric)
 */
export function calculateISCORadius(mass: number, spin: number): number {
  const rs = calculateSchwarzschildRadius(mass);
  const a = Math.max(-0.999, Math.min(0.999, spin));
  const absA = Math.abs(a);

  if (absA < 0.001) {
    return 3.0 * rs;
  }

  const z1 = 1.0 + Math.cbrt(1.0 - absA * absA) * (Math.cbrt(1.0 + absA) + Math.cbrt(1.0 - absA));
  const z2 = Math.sqrt(3.0 * absA * absA + z1 * z1);
  const signA = a >= 0 ? 1.0 : -1.0;
  const rIscoUnits = 3.0 + z2 - signA * Math.sqrt((3.0 - z1) * (3.0 + z1 + 2.0 * z2));

  return (rIscoUnits / 2.0) * rs;
}

/**
 * 중력 적색편이 (Gravitational Redshift) 인수 z
 * z = 1 / sqrt(1 - Rs/r) - 1
 */
export function calculateGravitationalRedshift(distanceRs: number): number {
  if (distanceRs <= 1.001) return 999.0;
  const factor = 1.0 - 1.0 / distanceRs;
  return 1.0 / Math.sqrt(factor) - 1.0;
}

/**
 * 충돌 매개변수(Impact Parameter b) 시나리오 판정
 * b_crit = 3*sqrt(3)*M = 2.598*M = 0.866 * Rph
 */
export function classifyImpactScenario(impactParameterMult: number): ImpactScenario {
  if (impactParameterMult > 1.08) {
    return 'deflection';
  }
  if (impactParameterMult >= 0.92 && impactParameterMult <= 1.08) {
    return 'orbit';
  }
  return 'plunge';
}

/**
 * Mode 1: 2D 시공간 고무판 격자(Gravity Well) 높이 y(r) 계산
 */
export function calculateGravityWellDepth(r: number, mass: number): number {
  return -(mass * 3.2) / (Math.max(0.01, r) + 0.9);
}

/**
 * Mode 1: 고무판 위 빛(광자) 2D/3D 휘어짐 궤적 생성
 */
export function generateGravityWellPhotonTrajectory(
  mass: number,
  impactParameterMult: number,
  steps: number = 200
): Array<[number, number, number]> {
  const rs = calculateSchwarzschildRadius(mass);
  const rph = calculatePhotonSphereRadius(mass);
  const startX = -12.0;
  const startZ = impactParameterMult * rph;

  const points: Array<[number, number, number]> = [];
  let posX = startX;
  let posZ = startZ;
  let velX = 1.2;
  let velZ = 0.0;
  const dt = 0.06;

  for (let i = 0; i < steps; i += 1) {
    const r = Math.sqrt(posX * posX + posZ * posZ);
    const posY = calculateGravityWellDepth(r, mass);
    points.push([posX, posY + 0.05, posZ]);

    if (r <= rs * 0.95) break; // 블랙홀 흡수
    if (r > 16.0 && i > 30) break; // 탈출

    const accelMag = (mass * 2.2) / (r * r * r + 0.1);
    velX -= accelMag * posX * dt;
    velZ -= accelMag * posZ * dt;

    posX += velX * dt;
    posZ += velZ * dt;
  }

  return points;
}

/**
 * Mode 2: 3D 빛의 영측지선 (Null Geodesic) RK4 궤적 계산
 */
export function generate3DGeodesicPath(
  mass: number,
  impactParameterMult: number,
  initialAngleOffset: number = 0,
  steps: number = 220
): Array<[number, number, number]> {
  const rs = calculateSchwarzschildRadius(mass);
  const rph = calculatePhotonSphereRadius(mass);
  const scenario = classifyImpactScenario(impactParameterMult);

  const points: Array<[number, number, number]> = [];
  let r = 22.0 * rs;
  let phi = initialAngleOffset;
  let dr = -0.32;
  const dt = 0.06;

  const b = impactParameterMult * rph;
  const bCrit = ((3.0 * Math.sqrt(3.0)) / 2.0) * rs;

  for (let i = 0; i < steps; i += 1) {
    const x = r * Math.cos(phi);
    const z = r * Math.sin(phi);
    const y = 0.0;
    points.push([x, y, z]);

    if (r <= rs * 1.01) break;
    if (r > 28.0 * rs && i > 30) break;

    const accel = -(((1.0 - rs / r) * (bCrit * bCrit)) / (r * r * r)) * (1.0 + (3.0 * rs) / r);

    dr += accel * dt;
    r += dr * dt;
    phi += (b / (r * r)) * dt * 2.2;

    if (Number.isNaN(r) || r <= 0) break;

    if (scenario === 'orbit' && Math.abs(r - rph) < 0.3 && i > 40) {
      r = rph + 0.08 * Math.sin(i * 0.2);
    }
  }

  return points;
}

/**
 * Mode 4: 조석 가속도 (Tidal Acceleration / Tension) 계산
 * Delta a = 2 G M Delta r / r^3
 */
export function calculateTidalAcceleration(mass: number, distanceRs: number): number {
  const dist = Math.max(1.0, distanceRs);
  return (mass * 480) / Math.pow(dist, 3);
}

/**
 * Mode 5: 중력 시간 지연율 (dtau / dt) 계산
 * dtau/dt = sqrt(1 - Rs / r)
 */
export function calculateTimeDilationRate(heightRs: number): number {
  if (heightRs <= 1.005) return 0.001;
  return Math.sqrt(Math.max(0.0, 1.0 - 1.0 / heightRs));
}

/**
 * Mode 6: 쌍성 블랙홀 궤도 상태 및 중력파 주파수/진폭 계산
 */
export function calculateBinaryOrbitState(
  time: number,
  m1: number,
  m2: number,
  initialSeparation: number,
  simSpeed: number = 1.0
): {
  separation: number;
  frequency: number;
  chirpAmplitude: number;
  isMerged: boolean;
  pos1: [number, number, number];
  pos2: [number, number, number];
} {
  const totalM = m1 + m2;
  const rs1 = calculateSchwarzschildRadius(m1) * 0.4;
  const rs2 = calculateSchwarzschildRadius(m2) * 0.4;
  const mergeSep = rs1 + rs2 + 0.2;

  // GW decay over time: a(t) = a0 * (1 - t / t_merge)^(1/4)
  const decayRate = 0.04 * simSpeed;
  const currentSep = Math.max(mergeSep, initialSeparation - time * decayRate * 1.5);
  const isMerged = currentSep <= mergeSep + 0.05;

  // Keplerian orbital frequency omega = sqrt(G*M / r^3)
  const omega = Math.sqrt((totalM * 3.5) / Math.pow(Math.max(1.0, currentSep), 3)) * 2.8;
  const angle = time * omega * simSpeed;

  const r1 = currentSep * (m2 / totalM);
  const r2 = currentSep * (m1 / totalM);

  const pos1: [number, number, number] = [r1 * Math.cos(angle), 0, r1 * Math.sin(angle)];
  const pos2: [number, number, number] = [-r2 * Math.cos(angle), 0, -r2 * Math.sin(angle)];

  const gwFreq = (omega / Math.PI) * 2.0;
  const chirpAmp = Math.min(2.5, 0.4 + 1.8 / Math.max(0.8, currentSep));

  return {
    separation: currentSep,
    frequency: gwFreq,
    chirpAmplitude: chirpAmp,
    isMerged,
    pos1,
    pos2,
  };
}

/**
 * 하단 정보 패널을 위한 실시간 물리학 현상 설명 텍스트
 */
export function getModeExplanationText(
  mode: VisualizationMode,
  mass: number,
  impactParameterMult: number,
  scenario: ImpactScenario
): { title: string; desc: string; badge: string; badgeColor: string } {
  const rs = calculateSchwarzschildRadius(mass).toFixed(1);
  const rph = calculatePhotonSphereRadius(mass).toFixed(1);

  if (mode === 'mode1') {
    return {
      title: 'Mode 1: 2D 시공간 격자 왜곡 (Gravity Well)',
      desc: `블랙홀 질량(M=${mass.toFixed(1)})에 의해 시공간 격자망이 아래로 깊게 곡면으로 휘어집니다. 좌측에서 출발한 빛(광자)이 휘어진 고무판 시공간을 따라 굴절 경로를 그립니다.`,
      badge: '고무판 모델',
      badgeColor: 'primary',
    };
  }
  if (mode === 'mode2') {
    if (scenario === 'deflection') {
      return {
        title: 'Mode 2: 빛의 궤적 - 중력 산란 (Deflection)',
        desc: `충돌 매개변수 b > b_crit 조건입니다. 빛이 광자구(Rph=${rph}) 바깥쪽을 지나가며 강한 중력에 의해 방향만 크게 휘어진 후 우주 공간으로 산란(Escaped)됩니다.`,
        badge: '휘어짐 / 산란 (Deflection)',
        badgeColor: 'info',
      };
    }
    if (scenario === 'orbit') {
      return {
        title: 'Mode 2: 빛의 궤적 - 광자구 궤도 포획 (Photon Sphere Orbit)',
        desc: `충돌 매개변수 b ≈ b_crit 임계 조건입니다! 빛이 광자구 반지름(Rph=${rph}) 영역으로 진입하여 사상의 지평선 주변을 무한히 도는 영측지선 궤도에 갇히게 됩니다.`,
        badge: '광자구 포획 (Photon Orbit)',
        badgeColor: 'warning',
      };
    }
    return {
      title: 'Mode 2: 빛의 궤적 - 사상의 지평선 흡수 (Horizon Plunge)',
      desc: `충돌 매개변수 b < b_crit 조건입니다. 빛이 광자구를 통과하여 블랙홀의 사상의 지평선(Rs=${rs}) 안쪽으로 빨려 들어가 더 이상 우주로 탈출하지 못합니다.`,
      badge: '지평선 흡수 (Plunge)',
      badgeColor: 'error',
    };
  }
  if (mode === 'mode3') {
    return {
      title: 'Mode 3: 중력 렌즈 렌더러 (Gravitational Lensing)',
      desc: `블랙홀 전면에 배치된 우주 배경 별빛이 중력장에 의해 왜곡되어 아인슈타인 링(Einstein Ring)과 강착 원반의 상대론적 도플러 비밍 효과를 풀스크린 GLSL 셰이더로 실시간 관측합니다.`,
      badge: '아인슈타인 렌즈',
      badgeColor: 'secondary',
    };
  }
  if (mode === 'mode4') {
    return {
      title: 'Mode 4: 스파게티화 & 조석 파괴 (Spaghettification)',
      desc: `강한 중력 경사도(Tidal Gradient)로 인해 물체의 앞부분과 뒷부분에 작용하는 중력 차이가 극대화되어 세로로 길게 늘어나고 가로로 압축되며, 조석 파괴 반경(RT) 안쪽에서 파쇄되어 강착 파편으로 나선 흡수됩니다.`,
      badge: '조석 파괴 (Tidal Disruption)',
      badgeColor: 'error',
    };
  }
  if (mode === 'mode5') {
    return {
      title: 'Mode 5: 중력 시간 지연 & 듀얼 시계 (Gravitational Time Dilation)',
      desc: `일반 상대성 이론에 따라 강한 중력장 속 탐사선의 시간은 무한 원거리 기준계에 비해 극적으로 느려집니다(dtau/dt = sqrt(1 - Rs/r)). 사상의 지평선에 다다르면 외부 관측자 기준 시간이 완전히 정지(t -> 무한대)합니다.`,
      badge: '시간 지연 (Time Dilation)',
      badgeColor: 'success',
    };
  }
  return {
    title: 'Mode 6: 쌍성 블랙홀 합병 & LIGO 중력파 (Binary Merger & Gravitational Waves)',
    desc: `두 블랙홀이 공전하며 시공간에 사중극 중력파(Gravitational Wave)를 방출하고 궤도 에너지를 잃어 나선형으로 접근(Inspiral)하여 최종 하나의 회전(Kerr) 블랙홀로 병합(Merger) 및 링다운(Ringdown)을 거칩니다.`,
    badge: 'LIGO 중력파',
    badgeColor: 'secondary',
  };
}

/**
 * 6가지 사전 설정 프리셋
 */
export const PRESETS: Record<
  PresetType,
  { name: string; desc: string; config: Partial<BlackHoleConfig> }
> = {
  schwarzschild: {
    name: '슈바르츠실트 표준',
    desc: '기본 정적 블랙홀 모델 및 2D 시공간 곡률 관측.',
    config: {
      activeMode: 'mode1',
      mass: 1.0,
      impactParameter: 1.5,
      spin: 0.0,
      showAccretionDisk: true,
      backgroundMode: 'milkyway',
    },
  },
  kerrExtreme: {
    name: '커(Kerr) 극단 회전',
    desc: '스핀 a=0.95 극단 회전 블랙홀과 도플러 비밍 중력 렌즈.',
    config: {
      activeMode: 'mode3',
      mass: 1.2,
      spin: 0.95,
      showAccretionDisk: true,
      backgroundMode: 'milkyway',
    },
  },
  gargantua: {
    name: '인터스텔라 가르강튀아',
    desc: '초대질량 블랙홀과 밝은 강착 원반 아인슈타인 링.',
    config: {
      activeMode: 'mode3',
      mass: 2.5,
      spin: 0.99,
      showAccretionDisk: true,
      backgroundMode: 'milkyway',
    },
  },
  spacetimeGrid: {
    name: '3D 빛의 광자구 궤도',
    desc: '광자구(Rph) 주변에 광자가 무한 궤도로 갇히는 현상 관측.',
    config: {
      activeMode: 'mode2',
      mass: 1.0,
      impactParameter: 1.0,
      spin: 0.0,
      backgroundMode: 'grid',
    },
  },
  infallExperience: {
    name: '사상의 지평선 자유 낙하',
    desc: '지평선 안쪽으로 광자가 빨려 들어가는 3D Plunge 시나리오.',
    config: {
      activeMode: 'mode2',
      mass: 1.0,
      impactParameter: 0.5,
      spin: 0.5,
      backgroundMode: 'milkyway',
    },
  },
  binaryMerger: {
    name: '쌍성 합병 & 중력파',
    desc: '두 블랙홀의 나선 충돌 및 시공간 파동 립플 관측.',
    config: {
      activeMode: 'mode6',
      mass: 1.2,
      binaryMassRatio: 0.8,
      binarySeparation: 5.5,
      simSpeed: 1.2,
    },
  },
};
