// Face portraits from https://kctsb.com/wiki/characters (classic mode).
const SPEAKER_FACE_IDS: Record<string, number> = {
  손오공: 134,
  미로: 136,
  삼장: 141,
  삼장법사: 141,
  저팔계: 138,
  사오정: 137,
  복면남자: 139,
  소나타: 142,
  파오: 143,
  푸산: 145,
  자하: 144,
};

const FALLBACK_COLORS = ['#375A7F', '#704D92', '#376F5B', '#8A523B', '#8C426B'];

export const SPEAKER_IMAGE_SOURCE_URL = 'https://kctsb.com/wiki/characters';

export function getSpeakerAvatar(speaker: string | null): string | undefined {
  const faceId = speaker ? SPEAKER_FACE_IDS[speaker] : undefined;
  if (!faceId) return undefined;

  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/images/fantasy-westward-journey/avatars/${faceId}.png`;
}

export function getSpeakerColor(speaker: string | null): string {
  if (!speaker) return FALLBACK_COLORS[0];

  const hash = [...speaker].reduce((value, character) => value + character.charCodeAt(0), 0);
  return FALLBACK_COLORS[hash % FALLBACK_COLORS.length];
}

export function getSpeakerInitials(speaker: string | null): string {
  return speaker?.replace(/\s+/g, '').slice(0, 2) || '?';
}
