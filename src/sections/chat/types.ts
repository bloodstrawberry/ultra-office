export type ChatCategory = 'messenger' | 'sns' | 'llm';

export type MessengerThemeId = 'kakaotalk' | 'knox' | 'line' | 'telegram' | 'imessage' | 'galaxy';
export type SnsThemeId = 'instagram' | 'threads' | 'facebook' | 'twitter';
export type LlmThemeId =
  | 'chatgpt'
  | 'chatgpt_web'
  | 'claude'
  | 'claude_web'
  | 'gemini'
  | 'gemini_web'
  | 'deepseek_web'
  | 'grok';

export type ChatThemeId = MessengerThemeId | SnsThemeId | LlmThemeId;

export type ChatViewMode = 'list' | 'room';

export interface ChatRoomListItem {
  id: string;
  title: string;
  partnerName?: string;
  avatar?: string;
  avatarBg?: string;
  lastMessage: string;
  lastTime: string;
  unreadCount?: number;
  isPinned?: boolean;
  memberCount?: number;
  isOpenChat?: boolean;
  categoryTag?: string;
  roomData?: ChatData;
}

export type UserRole = 'me' | 'other' | 'bot' | 'system';

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  role: UserRole;
  title?: string; // 직급 or 부서 (Knox 등에서 사용)
  statusMessage?: string;
  isOnline?: boolean;
}

export interface ChatReaction {
  emoji: string;
  count: number;
}

export interface ChatMessage {
  id: string;
  senderId: string; // 'me' or user.id or 'system'
  text: string;
  time: string; // "오후 2:30" or "14:30"
  unreadCount?: number; // 카카오톡의 '1' 등
  isRead?: boolean; // 라인/텔레그램의 '읽음' 또는 '✓✓'
  isSystem?: boolean;
  systemType?: 'date' | 'notice' | 'invite' | 'leave';
  mediaUrl?: string;
  mediaType?: 'image' | 'file';
  thoughtText?: string; // LLM 사고 과정 (Thinking/Reasoning)
  codeSnippet?: {
    language: string;
    code: string;
  };
  reactions?: Record<string, number>;
  replyTo?: {
    senderName: string;
    text: string;
  };
}

export type DeviceType = 'iphone' | 'android' | 'desktop' | 'frameless';
export type NetworkType = '5G' | 'LTE' | 'WIFI';

export interface ChatRoomConfig {
  category: ChatCategory;
  themeId: ChatThemeId;
  roomTitle: string;
  roomSubtitle?: string;
  memberCount?: number;
  partnerName: string;
  partnerStatus?: string;
  partnerAvatar?: string;
  browserUrl?: string; // PC 브라우저 모드용 주소창 URL (예: https://chatgpt.com)

  // 상태바 및 환경
  timeString: string; // "09:41"
  batteryLevel: number; // 0 ~ 100
  networkType: NetworkType;
  wifiLevel: number; // 1 ~ 3
  isCharging: boolean;
  darkMode: boolean;

  // 디바이스 프레임 & 크기 & 곡률
  deviceType: DeviceType;
  showDeviceFrame: boolean;
  deviceWidth?: number; // 320 ~ 960 (기본 390)
  deviceScale?: number; // 60 ~ 140 (기본 100%)
  frameBorderRadius?: number; // 0 ~ 60 (기본값 기종별 자동)
  bubbleBorderRadius?: number; // 0 ~ 30 (말풍선 둥글기)
  customBgColor?: string;
  isFullViewport?: boolean; // PC 화면 너비/높이 전체 100% 채우기 모드
}

export interface ChatData {
  config: ChatRoomConfig;
  users: ChatUser[];
  messages: ChatMessage[];
}

export interface ThemeOption {
  id: ChatThemeId;
  name: string;
  subtitle: string;
  category: ChatCategory;
  iconName: string; // iconify icon name
  badgeColor: string;
  defaultBg: string;
  myBubbleBg: string;
  myBubbleText: string;
  otherBubbleBg: string;
  otherBubbleText: string;
  headerBg: string;
  headerText: string;
  features: {
    hasUnreadBadge?: boolean;
    hasReadStatus?: boolean;
    hasDoubleCheck?: boolean;
    hasThinkingBlock?: boolean;
    hasCodeBlock?: boolean;
    hasReaction?: boolean;
    hasProfileTitle?: boolean;
  };
}
