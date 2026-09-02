/**
 * 이름 해시 기반 아바타 배경색.
 * soft mid-tone 팔레트 (네온·형광 제외).
 */
const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52B788',
  '#E76F51',
  '#F08080',
  '#6BCB77',
  '#7EB6FF',
  '#C9A0DC',
  '#70C1B3',
  '#FFB347',
  '#A78BFA',
  '#E07A5F',
] as const;

export const generateAvatarColor = (name: string): string => {
  if (!name) return '#85C1E2';
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};
