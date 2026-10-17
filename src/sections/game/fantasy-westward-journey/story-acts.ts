export const STORY_WIKI_URL = 'https://kctsb.com/wiki/story';

// Boundaries follow the six acts on the story wiki. Orders refer to dialogue_screenplay.json.
export const STORY_ACTS = [
  {
    number: 1,
    title: '서막: 천궁의 명령과 오행산',
    summary: '금단의 알이 사라지고, 미로는 손오공을 찾아 오행산으로 향합니다.',
    startOrder: 1,
  },
  {
    number: 2,
    title: '갈라진 길: 불타는 아스람',
    summary: '아스람의 화재를 계기로 일행이 갈라져 각자의 길을 걷습니다.',
    startOrder: 16,
  },
  {
    number: 3,
    title: '합류와 여정: 오밍햄에서 유사하까지',
    summary: '오밍햄에서 다시 모인 일행은 계미산과 유사하를 지나 새 동료를 만납니다.',
    startOrder: 44,
  },
  {
    number: 4,
    title: '소용돌이: 세 갈래와 디아몬드',
    summary: '소용돌이 이후 흩어진 일행의 이야기가 세 갈래로 펼쳐집니다.',
    startOrder: 70,
  },
  {
    number: 5,
    title: '세 눈물: 복면남자의 진실',
    summary: '세 눈물을 찾는 여정이 이어지고 복면남자의 정체가 드러납니다.',
    startOrder: 113,
  },
  {
    number: 6,
    title: '서주와 마탑: 옥황의 각본',
    summary: '서주와 마탑을 거쳐 옥황상제와 마주하는 마지막 여정입니다.',
    startOrder: 139,
  },
] as const;

export type StoryAct = (typeof STORY_ACTS)[number];

export function getStoryAct(storyOrder: number): StoryAct {
  for (let index = STORY_ACTS.length - 1; index >= 0; index -= 1) {
    if (storyOrder >= STORY_ACTS[index].startOrder) return STORY_ACTS[index];
  }

  return STORY_ACTS[0];
}
