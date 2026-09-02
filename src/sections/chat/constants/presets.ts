import type { ChatData, ChatCategory, ChatThemeId } from '../types';

export const INITIAL_PRESETS: Record<ChatCategory, Record<string, ChatData>> = {
  // 1. 메신저 프리셋
  messenger: {
    kakaotalk_funny: {
      config: {
        category: 'messenger',
        themeId: 'kakaotalk',
        roomTitle: '그룹채팅 4',
        partnerName: 'Set진정현',
        partnerStatus: '',
        memberCount: 4,
        timeString: '3:53',
        batteryLevel: 69,
        networkType: 'LTE',
        wifiLevel: 3,
        isCharging: false,
        darkMode: false,
        deviceType: 'android',
        showDeviceFrame: true,
        deviceWidth: 390,
      },
      users: [
        {
          id: 'me',
          name: '나 (김장현)',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=me_kim',
          role: 'me',
        },
        {
          id: 'user_set',
          name: 'Set진정현',
          avatar: '', // 카카오톡 기본 하늘색 아바타
          role: 'other',
        },
      ],
      messages: [
        {
          id: 'k1',
          senderId: 'user_set',
          text: '미친ㅋㅋㅋ',
          time: '오전 12:28',
        },
        {
          id: 'k2',
          senderId: 'me',
          text: 'ㅋㅋㅋㅋㅋ 고퀄 인정?',
          time: '오전 12:28',
        },
        {
          id: 'k3',
          senderId: 'user_set',
          text: '영상 이어서하는건 무슨툴씀?',
          time: '',
        },
        {
          id: 'k4',
          senderId: 'user_set',
          text: '난 이 개그를 이전에도 좋아했음',
          time: '오전 12:29',
        },
        {
          id: 'k5',
          senderId: 'user_set',
          text: '캡컷인가로 스크립트녹음한거랑 영상이랑\n붙이더라 툴에서 자막 자동으로 생성해줌',
          time: '오전 12:30',
          replyTo: {
            senderName: '김장현',
            text: '남현 그친구분은 자막은 직접다시나?',
          },
          reactions: { '❤️': 1, '👍': 1, '😆': 1 },
        },
        {
          id: 'k6',
          senderId: 'me',
          text: '이어서하는건 내가 원래 편집하던거',
          time: '',
        },
        {
          id: 'k7',
          senderId: 'me',
          text: '필모라 툴로 하는거',
          time: '',
        },
        {
          id: 'k8',
          senderId: 'me',
          text: '캡컷 이거 워터마크 박히고 그러진 않음?',
          time: '',
        },
        {
          id: 'k9',
          senderId: 'me',
          text: '저번에 말해줘서 다운받아봤던거 같은ㄷ',
          time: '',
        },
        {
          id: 'k10',
          senderId: 'me',
          text: '이거 워터마크 있어가지고',
          time: '오전 12:31',
        },
        {
          id: 'k11',
          senderId: 'user_set',
          text: 'flow, typecast, capcut 이렇게 세트로',
          time: '',
        },
        {
          id: 'k12',
          senderId: 'user_set',
          text: '나도 안써봐서 모르겠어',
          time: '오전 12:32',
        },
      ],
    },
    knox_business: {
      config: {
        category: 'messenger',
        themeId: 'knox',
        roomTitle: '[보안] 차세대 AI 솔루션 TF팀',
        partnerName: '박수석연구원',
        partnerStatus: '온라인 | 삼성전자 R&D',
        memberCount: 8,
        timeString: '10:05',
        batteryLevel: 94,
        networkType: 'LTE',
        wifiLevel: 3,
        isCharging: false,
        darkMode: false,
        deviceType: 'android',
        showDeviceFrame: true,
      },
      users: [
        {
          id: 'me',
          name: '이책임',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=lee_knox',
          role: 'me',
          title: 'AI Lab 책임연구원',
        },
        {
          id: 'park_lead',
          name: '박수석',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
          role: 'other',
          title: 'SW개발 수석연구원',
        },
      ],
      messages: [
        {
          id: 'k1',
          senderId: 'system',
          text: '보안 안내: Knox E2E 암호화가 적용된 비즈니스 채널입니다.',
          time: '',
          isSystem: true,
          systemType: 'notice',
        },
        {
          id: 'k2',
          senderId: 'park_lead',
          text: '이책임님, 온디바이스 LLM 최적화 벤치마크 결과 확인하셨나요?',
          time: '10:01',
        },
        {
          id: 'k3',
          senderId: 'me',
          text: '네, NPU 양자화 후 추론 속도 40% 향상 및 메모리 점유율 22% 감소 확인했습니다.',
          time: '10:03',
          isRead: true,
        },
        {
          id: 'k4',
          senderId: 'park_lead',
          text: '훌륭합니다. 금일 오후 CTO 보고용 요약본 메일로 송부 부탁드립니다.',
          time: '10:04',
        },
      ],
    },
  },

  // 2. SNS 프리셋
  sns: {
    instagram_dm: {
      config: {
        category: 'sns',
        themeId: 'instagram',
        roomTitle: 'jisoo_official',
        partnerName: 'jisoo_official',
        partnerStatus: 'Instagram 공식 인증 계정 · 활성 상태',
        timeString: '20:45',
        batteryLevel: 72,
        networkType: '5G',
        wifiLevel: 3,
        isCharging: false,
        darkMode: true,
        deviceType: 'iphone',
        showDeviceFrame: true,
      },
      users: [
        {
          id: 'me',
          name: 'MyAccount',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=insta_user',
          role: 'me',
        },
        {
          id: 'celeb',
          name: 'jisoo_official',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jisoo',
          role: 'other',
        },
      ],
      messages: [
        {
          id: 'i1',
          senderId: 'system',
          text: '스토리 답장 전송됨',
          time: '',
          isSystem: true,
          systemType: 'notice',
        },
        {
          id: 'i2',
          senderId: 'me',
          text: '오늘 팝업 스토어 전시 너무 멋있었어요!! 축하드려요 ✨👏',
          time: '20:30',
        },
        {
          id: 'i3',
          senderId: 'celeb',
          text: '와 와주셔서 정말 감사해요!! 즐거운 시간 보내셨길 바라요 💖',
          time: '20:42',
          reactions: { '❤️': 1 },
        },
        {
          id: 'i4',
          senderId: 'me',
          text: '다음에 또 전시 열리면 무조건 1등으로 달려갈게요 🥳',
          time: '20:44',
        },
      ],
    },
    threads_minimal: {
      config: {
        category: 'sns',
        themeId: 'threads',
        roomTitle: 'tech_creator',
        partnerName: 'tech_creator',
        partnerStatus: '스레드 크리에이터',
        timeString: '11:15',
        batteryLevel: 90,
        networkType: '5G',
        wifiLevel: 3,
        isCharging: false,
        darkMode: true,
        deviceType: 'iphone',
        showDeviceFrame: true,
      },
      users: [
        {
          id: 'me',
          name: 'dev_ultra',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=dev_ultra',
          role: 'me',
        },
        {
          id: 'creator',
          name: 'tech_creator',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=creator',
          role: 'other',
        },
      ],
      messages: [
        {
          id: 't1',
          senderId: 'creator',
          text: '방금 올리신 오픈소스 프로젝트 깃허브 스타 찍고 왔어요! 너무 유용하네요.',
          time: '11:10',
        },
        {
          id: 't2',
          senderId: 'me',
          text: '감사합니다! 조만간 Next.js 16 지원 업데이트도 배포할 예정입니다 🚀',
          time: '11:12',
          reactions: { '🔥': 2 },
        },
      ],
    },
  },

  // 3. LLM 프리셋
  llm: {
    chatgpt_code: {
      config: {
        category: 'llm',
        themeId: 'chatgpt',
        roomTitle: 'Next.js 상태 관리 최적화',
        partnerName: 'ChatGPT 4o',
        partnerStatus: 'Thinking & Code Generation',
        timeString: '16:20',
        batteryLevel: 98,
        networkType: 'WIFI',
        wifiLevel: 3,
        isCharging: true,
        darkMode: true,
        deviceType: 'frameless',
        showDeviceFrame: false,
      },
      users: [
        {
          id: 'me',
          name: 'User',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user_chatgpt',
          role: 'me',
        },
        {
          id: 'gpt',
          name: 'ChatGPT',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=OpenAI',
          role: 'bot',
        },
      ],
      messages: [
        {
          id: 'gpt1',
          senderId: 'me',
          text: 'Next.js App Router에서 하이드레이션 오류를 방지하면서 로컬스토리지 상태를 동기화하는 가장 좋은 패턴을 코드로 작성해줘.',
          time: '16:18',
        },
        {
          id: 'gpt2',
          senderId: 'gpt',
          thoughtText:
            'Next.js SSR 환경에서 브라우저 API(localStorage) 접근 시 초기 HTML 불일치 방지 전략 분석... useEffect 마운트 후 상태 로딩 플래그 및 커스텀 훅 패턴 도출.',
          text: 'Next.js의 SSR과 Hydration Mismatch를 완벽히 방지하려면 초기 렌더링 시에는 고정 기본값을 사용하고, `useEffect` 마운트 시점에 `localStorage`를 동기화하는 안전한 커스텀 훅 패턴을 권장합니다.',
          codeSnippet: {
            language: 'typescript',
            code: `import { useState, useEffect } from 'react';

export function useSafeLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) setValue(JSON.parse(item));
    } catch (error) {
      console.warn(error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value, isLoaded]);

  return [value, setValue, isLoaded] as const;
}`,
          },
          time: '16:19',
        },
      ],
    },
    gemini_creative: {
      config: {
        category: 'llm',
        themeId: 'gemini',
        roomTitle: 'Gemini Advanced Live',
        partnerName: 'Gemini 1.5 Pro',
        partnerStatus: 'Multimodal Intelligence',
        timeString: '18:10',
        batteryLevel: 65,
        networkType: '5G',
        wifiLevel: 3,
        isCharging: false,
        darkMode: true,
        deviceType: 'frameless',
        showDeviceFrame: false,
      },
      users: [
        {
          id: 'me',
          name: 'Developer',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=user_gemini',
          role: 'me',
        },
        {
          id: 'gemini_bot',
          name: 'Gemini',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GoogleGemini',
          role: 'bot',
        },
      ],
      messages: [
        {
          id: 'gem1',
          senderId: 'me',
          text: 'AI 기반 가상 채팅방 목업 생성기의 핵심 사용자 경험(UX) 차별화 포인트를 3가지로 정리해줘.',
          time: '18:08',
        },
        {
          id: 'gem2',
          senderId: 'gemini_bot',
          text: `✨ **가상 채팅방 스튜디오(Chat Mockup Studio)의 3가지 핵심 UX 포인트:**

1. **실시간 테마 렌더러 (Pixel-Perfect Theming)**
   - 카카오톡의 1 안읽음 뱃지, 인스타그램 DM의 네온 그라데이션, LLM의 코드 블록 등 각 플랫폼 고유의 미세 인터랙션을 정밀하게 재현합니다.

2. **직관적인 비주얼 인라인 & 사이드바 에디터**
   - 발신자/수신자 스위칭, 타임스탬프, 반응 이모지, 첨부파일을 드래그앤드롭과 즉각적인 미리보기로 손쉽게 조작할 수 있습니다.

3. **고해상도 캡처 & 다목적 포맷 익스포트**
   - 웹툰/유튜브 썸네일/포트폴리오용 고해상도 PNG 스크린샷 원클릭 다운로드와 JSON 백업/복원 기능을 제공합니다.`,
          time: '18:09',
        },
      ],
    },
  },
};
