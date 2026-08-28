// ----------------------------------------------------------------------

export type VisualizationMode =
  | 'mode1' // 2D 시공간 고무판 격자
  | 'mode2' // 3D 빛의 영측지선 궤적 & 광자구
  | 'mode3' // 중력 렌즈 GLSL 레이마칭 & 강착 원반
  | 'mode4' // 스파게티화 & 조석 파괴
  | 'mode5' // 중력 시간 지연 & 듀얼 시계
  | 'mode6'; // 쌍성 블랙홀 합병 & 중력파

export type ImpactScenario = 'deflection' | 'orbit' | 'plunge';

export type PresetType =
  | 'schwarzschild'
  | 'kerrExtreme'
  | 'gargantua'
  | 'spacetimeGrid'
  | 'infallExperience'
  | 'binaryMerger';

export type BackgroundMode = 'milkyway' | 'grid' | 'deepspace';

export type CameraMode = 'orbit' | 'infall';

export type SpaghettifyObject = 'star' | 'astronaut' | 'cube';

export interface BlackHoleConfig {
  /** 현재 활성화된 모드 (mode1 ~ mode6) */
  activeMode: VisualizationMode;
  /** 블랙홀 질량 M (0.1 ~ 5.0 M☉) */
  mass: number;
  /** 충돌 매개변수 Impact Parameter b (0.3 ~ 3.5 multiplier relative to Rph) */
  impactParameter: number;
  /** 광자 수동 발사 애니메이션 트리거 카운터 */
  photonShootId: number;
  /** 커(Kerr) 블랙홀 회전 스핀 a (-0.99 ~ 0.99) */
  spin: number;
  /** 강착 원반 표시 여부 */
  showAccretionDisk: boolean;
  /** 강착 원반 온도 (K, 3000 ~ 20000) */
  diskTemperature: number;
  /** 강착 원반 밀도 및 밝기 (0.1 ~ 5.0) */
  diskDensity: number;
  /** 강착 원반 안쪽 반지름 배수 */
  diskInnerRadiusMult: number;
  /** 강착 원반 바깥쪽 반지름 */
  diskOuterRadius: number;
  /** 상대론적 도플러 비밍 효과 활성화 */
  enableDopplerBeaming: boolean;
  /** 광자구 하이라이트 표시 여부 */
  showPhotonSphere: boolean;
  /** 배경 왜곡 모드 (은하수 / 격자 / 심우주) */
  backgroundMode: BackgroundMode;
  /** 시뮬레이션 일시정지 여부 */
  isPaused: boolean;
  /** 카메라 모드 (orbit / infall) */
  cameraMode: CameraMode;
  /** 시뮬레이션 속도 배율 (0.2 ~ 3.0) */
  simSpeed: number;
  /** Mode 4: 스파게티화 대상 물체 거리 (Rs 배수) */
  spaghettifyDistance?: number;
  /** Mode 4: 스파게티화 대상 물체 유형 */
  spaghettifyObject?: SpaghettifyObject;
  /** Mode 5: 시간 지연 탐사선 고도 (Rs 배수) */
  timeDilationHeight?: number;
  /** Mode 6: 쌍성 블랙홀 질량비 (q = M2/M1) */
  binaryMassRatio?: number;
  /** Mode 6: 쌍성 블랙홀 초기 궤도 간격 */
  binarySeparation?: number;
}

export interface TelemetryData {
  /** 슈바르츠실트 반지름 Rs (2GM/c^2) */
  rs: number;
  /** 광자구 반지름 Rph (1.5 Rs) */
  rph: number;
  /** 안쪽 가장 안정한 원궤도 반지름 RISCO */
  risco: number;
  /** 현재 스핀 a */
  spin: number;
  /** 현재 충돌 매개변수 b */
  impactParameter: number;
  /** 현재 궤적 시나리오 판정 */
  scenario: ImpactScenario;
  /** 관측자 거리 (relative to Rs) */
  cameraDistanceRs: number;
  /** 중력 적색편이 인수 z */
  redshiftZ: number;
  /** 조석 가속도 (G/m) - Mode 4 */
  tidalForceG?: number;
  /** 시간 지연율 (dtau/dt) - Mode 5 */
  timeDilationFactor?: number;
  /** 중력파 주파수 (Hz) - Mode 6 */
  gravitationalWaveFreq?: number;
  /** 실시간 FPS */
  fps: number;
}
