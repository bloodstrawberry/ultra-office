/**
 * Flag Semaphore & International Code of Signals (ICS) Maritime Flags Data
 *
 * 8 Cardinal angles for Semaphore (facing viewer):
 * S = 180° (Down/Rest), SW = 225°, W = 270° (Left), NW = 315°,
 * N = 0° (Up), NE = 45°, E = 90° (Right), SE = 135°
 */

export interface SemaphoreItem {
  char: string;
  leftArmAngle: number; // degrees from North (0 = Up, 90 = Right, 180 = Down, 270 = Left)
  rightArmAngle: number;
  description: string;
  flagMeaning?: string;
  flagColors?: string[];
}

// Semaphore angles (Facing the signalman)
export const SEMAPHORE_MAP: Record<string, SemaphoreItem> = {
  A: { char: 'A', leftArmAngle: 180, rightArmAngle: 225, description: '남쪽(아래) & 남서쪽', flagMeaning: '잠수부 작업 중 (Diver Down)', flagColors: ['#ffffff', '#1d4ed8'] },
  B: { char: 'B', leftArmAngle: 180, rightArmAngle: 270, description: '남쪽 & 서쪽', flagMeaning: '위험물 선적/하역 중 (Dangerous Cargo)', flagColors: ['#ef4444'] },
  C: { char: 'C', leftArmAngle: 180, rightArmAngle: 315, description: '남쪽 & 북서쪽', flagMeaning: '긍정/확인 (Affirmative)', flagColors: ['#1d4ed8', '#ffffff', '#ef4444'] },
  D: { char: 'D', leftArmAngle: 180, rightArmAngle: 0, description: '남쪽 & 북쪽(위)', flagMeaning: '조종 불능 상태 (Keep Clear)', flagColors: ['#1d4ed8', '#fbbf24'] },
  E: { char: 'E', leftArmAngle: 180, rightArmAngle: 45, description: '남쪽 & 북동쪽', flagMeaning: '우현 침로 변경 중 (Altering to Starboard)', flagColors: ['#1d4ed8', '#ef4444'] },
  F: { char: 'F', leftArmAngle: 180, rightArmAngle: 90, description: '남쪽 & 동쪽', flagMeaning: '조난/통신 요청 (Disabled, Communicate)', flagColors: ['#ffffff', '#ef4444'] },
  G: { char: 'G', leftArmAngle: 180, rightArmAngle: 135, description: '남쪽 & 남동쪽', flagMeaning: '도선사 필요 (Require Pilot)', flagColors: ['#fbbf24', '#1d4ed8'] },
  H: { char: 'H', leftArmAngle: 225, rightArmAngle: 270, description: '남서쪽 & 서쪽', flagMeaning: '도선사 승선 중 (Pilot on Board)', flagColors: ['#ffffff', '#ef4444'] },
  I: { char: 'I', leftArmAngle: 225, rightArmAngle: 315, description: '남서쪽 & 북서쪽', flagMeaning: '좌현 침로 변경 중 (Altering to Port)', flagColors: ['#fbbf24', '#000000'] },
  J: { char: 'J', leftArmAngle: 270, rightArmAngle: 0, description: '서쪽 & 북쪽', flagMeaning: '선내 화재 발생 (Fire on Board)', flagColors: ['#1d4ed8', '#ffffff'] },
  K: { char: 'K', leftArmAngle: 225, rightArmAngle: 0, description: '남서쪽 & 북쪽', flagMeaning: '귀선과 교신 희망 (Wish to Communicate)', flagColors: ['#fbbf24', '#1d4ed8'] },
  L: { char: 'L', leftArmAngle: 225, rightArmAngle: 45, description: '남서쪽 & 북동쪽', flagMeaning: '즉시 정지하라 (Stop Instantly)', flagColors: ['#fbbf24', '#000000'] },
  M: { char: 'M', leftArmAngle: 225, rightArmAngle: 90, description: '남서쪽 & 동쪽', flagMeaning: '기관 정지 상태 (Vessel Stopped)', flagColors: ['#1d4ed8', '#ffffff'] },
  N: { char: 'N', leftArmAngle: 225, rightArmAngle: 135, description: '남서쪽 & 남동쪽', flagMeaning: '부정/거절 (Negative)', flagColors: ['#1d4ed8', '#ffffff'] },
  O: { char: 'O', leftArmAngle: 270, rightArmAngle: 315, description: '서쪽 & 북서쪽', flagMeaning: '익수자 발생 (Man Overboard)', flagColors: ['#ef4444', '#fbbf24'] },
  P: { char: 'P', leftArmAngle: 270, rightArmAngle: 0, description: '서쪽 & 북쪽', flagMeaning: '출항 준비 완료 (All Aboard, Blue Peter)', flagColors: ['#1d4ed8', '#ffffff'] },
  Q: { char: 'Q', leftArmAngle: 270, rightArmAngle: 45, description: '서쪽 & 북동쪽', flagMeaning: '검역 요청 / 건강 상태 양호 (Quarantine)', flagColors: ['#fbbf24'] },
  R: { char: 'R', leftArmAngle: 270, rightArmAngle: 90, description: '서쪽 & 동쪽', flagMeaning: '수신 대기 (Received)', flagColors: ['#ef4444', '#fbbf24'] },
  S: { char: 'S', leftArmAngle: 270, rightArmAngle: 135, description: '서쪽 & 남동쪽', flagMeaning: '기관 후진 중 (Operating Astern)', flagColors: ['#ffffff', '#1d4ed8'] },
  T: { char: 'T', leftArmAngle: 315, rightArmAngle: 0, description: '북서쪽 & 북쪽', flagMeaning: '페어 트롤 조업 중 (Keep Clear)', flagColors: ['#ef4444', '#ffffff', '#1d4ed8'] },
  U: { char: 'U', leftArmAngle: 315, rightArmAngle: 45, description: '북서쪽 & 북동쪽', flagMeaning: '귀선은 위험으로 향함 (Standing into Danger)', flagColors: ['#ef4444', '#ffffff'] },
  V: { char: 'V', leftArmAngle: 180, rightArmAngle: 0, description: '남쪽 & 북쪽', flagMeaning: '원조 요청 (Require Assistance)', flagColors: ['#ffffff', '#ef4444'] },
  W: { char: 'W', leftArmAngle: 315, rightArmAngle: 90, description: '북서쪽 & 동쪽', flagMeaning: '의료 지원 필요 (Require Medical Assistance)', flagColors: ['#1d4ed8', '#ffffff', '#ef4444'] },
  X: { char: 'X', leftArmAngle: 315, rightArmAngle: 135, description: '북서쪽 & 남동쪽', flagMeaning: '귀선의 의도를 중지하라 (Stop Carrying Out Intentions)', flagColors: ['#ffffff', '#1d4ed8'] },
  Y: { char: 'Y', leftArmAngle: 270, rightArmAngle: 0, description: '서쪽 & 북쪽', flagMeaning: '닻 끌림 상태 (Dragging Anchor)', flagColors: ['#fbbf24', '#ef4444'] },
  Z: { char: 'Z', leftArmAngle: 45, rightArmAngle: 90, description: '북동쪽 & 동쪽', flagMeaning: '예인선 필요 (Require Tug)', flagColors: ['#fbbf24', '#000000', '#ef4444', '#1d4ed8'] },
};

export const REST_SEMAPHORE: SemaphoreItem = {
  char: 'REST',
  leftArmAngle: 180,
  rightArmAngle: 180,
  description: '휴식/대기 자세 (Flags Down)',
};

/**
 * Converts text into an array of Semaphore items.
 */
export function textToSemaphore(text: string): SemaphoreItem[] {
  if (!text) return [];

  const result: SemaphoreItem[] = [];
  const upper = text.toUpperCase();

  for (let i = 0; i < upper.length; i += 1) {
    const char = upper[i];
    if (SEMAPHORE_MAP[char]) {
      result.push(SEMAPHORE_MAP[char]);
    } else if (char === ' ') {
      result.push({ char: ' ', leftArmAngle: 180, rightArmAngle: 180, description: '단어 공백' });
    }
  }

  return result;
}
