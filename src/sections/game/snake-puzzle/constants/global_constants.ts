/**
 * ============================================================================
 * [GLOBAL CONSTANTS] 전역 상수 및 설정 관리 파일 (snake-puzzle)
 * ============================================================================
 * 이 파일은 앱 내의 모든 광고 설정, 게임/비즈니스 로직 상수, 시스템 설정을 중앙 집중식으로 관리합니다.
 * 향후 추가되는 모든 상수는 본 파일에 정의하고 명확한 주석을 작성해야 합니다.
 */

// ============================================================================
// 1. 광고(Ad) 관련 상수 및 설정
// ============================================================================

/** 현재 앱 이름 */
export const CURRENT_APP_NAME: string = 'snake-puzzle';

/** 원격 광고 데이터 JSON URL */
export const NEW_ADS_INFO_URL =
  'https://raw.githubusercontent.com/teams-jh/public-storage/refs/heads/main/json/ad_info.json';

/** 공용 에셋 및 스토리지 베이스 URL */
export const PUBLIC_STORAGE_BASE_URL =
  'https://raw.githubusercontent.com/teams-jh/public-storage/refs/heads/main';

/** 기본 더미 로고 이미지 경로 */
export const DEFAULT_DUMMY_LOGO = '/personal-ad/dummy.png';

/** 신규 광고 원격 동기화 기능 On/Off 여부 (true일 때 하루 1회 최초 접속 시 광고 갱신) */
export const NEW_AD_FEATURE_ON = true;

/** 자동 광고 롤링 시 토스 배너 광고가 선택될 확률 (0.0 ~ 1.0, 0.2 = 20%) */
export const TOSS_AD_AUTO_RANDOM_CHANCE = 0.2;

/** 스와이프 광고 전환 시 토스 배너 광고가 선택될 확률 (0.0 ~ 1.0, 0.1 = 10%) */
export const TOSS_AD_SWIPE_RANDOM_CHANCE = 0.1;

/** 토스 배너 광고 1회 노출 유지 시간 (단위: 초) */
export const TOSS_AD_DURATION_SEC = 15;

/** 자체/하우스 배너 광고 1회 노출 유지 시간 (단위: 초) */
export const PERSONAL_AD_DURATION_SEC = 10;

/** 자체 광고 노출 시 시각적 임팩트 효과 발동 확률 (0.0 ~ 1.0, 0.8 = 80%) */
export const PERSONAL_AD_EFFECT_CHANCE = 0.8;

/** 전면(Interstitial) 광고 진입 전 안내 카운트다운 시간 (단위: 초) */
export const INTERSTITIAL_AD_COUNTDOWN_SEC = 3;

/** 보상형(Reward) 광고 진입 전 카운트다운 시간 (단위: 초) */
export const REWARD_AD_COUNTDOWN_SEC = 2;

/** 광고 시청 완료 후 재노출 방지 쿨다운 시간 (단위: 밀리초, 1분 = 60,000ms) */
export const AD_COOLDOWN_MS = 60 * 1000;

// ============================================================================
// 2. 스네이크버드 퍼즐 게임 로직 상수
// ============================================================================

/** 광고가 활성화되는 최소 스테이지 번호 */
export const AD_STAGE_THRESHOLD = 40;

/** 전면 광고 노출 기준 카운트 */
export const AD_TRIGGER_COUNT = 10;

/** 스네이크 이동 1칸당 애니메이션 딜레이 (단위: 밀리초) */
export const MOVE_STEP_DELAY_MS = 150;

/** 중력 낙하 속도 딜레이 (단위: 밀리초) */
export const GRAVITY_FALL_DELAY_MS = 100;

/** 스테이지당 최대 과일 수 */
export const MAX_FRUITS_PER_STAGE = 10;

// ============================================================================
// 3. UI 및 인터랙션 관련 상수
// ============================================================================

/** 기본 토스트 팝업 노출 시간 (단위: 밀리초) */
export const TOAST_DURATION_MS = 2500;

/** 모달 애니메이션 트랜지션 시간 (단위: 밀리초) */
export const MODAL_TRANSITION_MS = 200;

// ============================================================================
// 4. 로컬 스토리지(LocalStorage) 키 관리
// ============================================================================

export const STORAGE_KEYS = {
  /** 마지막 광고 시청 타임스탬프 저장 키 */
  LAST_AD_SHOWN_TIMESTAMP: 'last_ad_shown_timestamp',
  /** 광고 대기(Pending) 플래그 키 */
  AD_PENDING: 'ad_pending_state',
  /** 마지막 원격 광고 fetch 날짜 키 */
  AD_LAST_FETCH_DATE: 'ait_ad_last_fetch_date',
  /** 저장된 광고 로고 키 */
  AD_SAVED_LOGO: 'ait_ad_saved_logo',
  /** 저장된 신규 광고 데이터 키 */
  AD_SAVED_NEW_ADS: 'ait_ad_saved_new_ads',
  /** 사용자 사운드 설정 키 */
  SOUND_ENABLED: 'snake-bird_sound_enabled',
  /** 게임 최고 점수 / 기록 키 */
  HIGH_SCORE: 'snake-bird_high_score',
} as const;
