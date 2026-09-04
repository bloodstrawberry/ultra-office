'use client';

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';

import { INITIAL_PRESETS, ROOM_LIST_PRESETS } from '../constants/presets';
import { THEMES_BY_CATEGORY } from '../constants/themes';
import { ChatPreviewCanvas } from './chat-preview-canvas';
import { ChatEditorDrawer } from './chat-editor-drawer';
import type {
  ChatCategory,
  ChatData,
  ChatThemeId,
  ChatMessage,
  ChatRoomConfig,
  ChatViewMode,
  ChatRoomListItem,
  MessengerThemeId,
} from '../types';

interface ChatStudioContainerProps {
  category: ChatCategory;
  defaultThemeId?: ChatThemeId;
}

export function ChatStudioContainer({ category, defaultThemeId }: ChatStudioContainerProps) {
  const initialCategoryPreset = Object.values(INITIAL_PRESETS[category])[0];

  const [chatData, setChatData] = useState<ChatData>(() => {
    const data = JSON.parse(JSON.stringify(initialCategoryPreset));
    if (defaultThemeId) {
      data.config.themeId = defaultThemeId;
    }
    return data;
  });

  // 메신저 카테고리는 기본적으로 채팅방 목록 화면('list')에서 시작
  const [viewMode, setViewMode] = useState<ChatViewMode>(
    category === 'messenger' ? 'list' : 'room'
  );
  const [editorOpen, setEditorOpen] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 방 선택 핸들러 (목록에서 방 클릭 시 해당 방 대화창으로 진입)
  const handleSelectRoom = (room: ChatRoomListItem) => {
    if (room.roomData) {
      setChatData(JSON.parse(JSON.stringify(room.roomData)));
    } else {
      setChatData((prev) => ({
        ...prev,
        config: {
          ...prev.config,
          roomTitle: room.title,
          partnerName: room.partnerName || room.title,
          memberCount: room.memberCount,
        },
      }));
    }
    setViewMode('room');
  };

  // 뒤로가기 핸들러 (대화방에서 목록으로 복귀)
  const handleBackToList = () => {
    setViewMode('list');
  };

  // 화면 모드 토글 (목록 <-> 대화방)
  const handleToggleViewMode = () => {
    setViewMode((prev) => (prev === 'list' ? 'room' : 'list'));
  };

  // 테마 변경 핸들러
  const handleThemeChange = (themeId: ChatThemeId) => {
    const isWebTheme = themeId.endsWith('_web');
    const messengerThemes = ['kakaotalk', 'knox', 'line', 'telegram', 'imessage', 'galaxy'];

    // 메신저 테마 변경 시 해당 테마의 첫 번째 방 프리셋이 있으면 동기화
    if (messengerThemes.includes(themeId)) {
      const rooms = ROOM_LIST_PRESETS[themeId as MessengerThemeId];
      if (rooms && rooms[0]?.roomData) {
        const nextData = JSON.parse(JSON.stringify(rooms[0].roomData));
        setChatData(nextData);
        return;
      }
    }

    setChatData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        themeId,
        ...(isWebTheme && {
          deviceType: 'desktop',
          showDeviceFrame: true,
          deviceWidth: 820,
        }),
        ...(!isWebTheme &&
          prev.config.deviceType === 'desktop' && {
            deviceType: 'frameless',
            deviceWidth: 420,
          }),
      },
    }));
  };

  // 퀵 메시지 전송 핸들러 (하단 인풋바에서 발송)
  const handleSendMessage = (text: string) => {
    const isLlm = category === 'llm';
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: 'me',
      text,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 1,
    };

    setChatData((prev) => {
      const nextMessages = [...prev.messages, newMsg];

      // LLM 카테고리일 경우 모의 AI 답변 자동 응답 시뮬레이션
      if (isLlm) {
        const botUser = prev.users.find((u) => u.role === 'bot') || {
          id: 'bot',
          name: prev.config.themeId.toUpperCase(),
        };

        const aiReply: ChatMessage = {
          id: `ai_${Date.now() + 1}`,
          senderId: botUser.id,
          thoughtText: `입력 프롬프트 분석 및 ${prev.config.themeId} 모델 컨텍스트 구성 중...`,
          text: `요청하신 "${text}"에 대한 답변입니다.\n\n가상 목업 환경에서 실시간으로 대화 흐름을 시뮬레이션하고 있습니다. 우측 상단의 [채팅방 편집] 버튼을 눌러 이 메시지의 텍스트나 코드 블록을 자유롭게 수정해 보세요!`,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        };

        return {
          ...prev,
          messages: [...nextMessages, aiReply],
        };
      }

      return {
        ...prev,
        messages: nextMessages,
      };
    });
  };

  // 프레임 온/오프 토글
  const handleToggleFrame = () => {
    setChatData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        showDeviceFrame: !prev.config.showDeviceFrame,
      },
    }));
  };

  // 방 설정 부분 업데이트 핸들러
  const handleUpdateConfig = (patch: Partial<ChatRoomConfig>) => {
    setChatData((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        ...patch,
      },
    }));
  };

  // 초기화 핸들러
  const handleReset = () => {
    const preset = JSON.parse(JSON.stringify(initialCategoryPreset));
    if (defaultThemeId) {
      preset.config.themeId = defaultThemeId;
    }
    setChatData(preset);
  };

  if (!hasMounted) {
    return null;
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <ChatPreviewCanvas
        data={chatData}
        category={category}
        viewMode={viewMode}
        onToggleViewMode={handleToggleViewMode}
        onSelectRoom={handleSelectRoom}
        onBackToList={handleBackToList}
        onOpenEditor={() => setEditorOpen(true)}
        onThemeChange={handleThemeChange}
        onSendMessage={handleSendMessage}
        onToggleFrame={handleToggleFrame}
        onReset={handleReset}
        onUpdateConfig={handleUpdateConfig}
        onSelectMessage={() => setEditorOpen(true)}
      />

      <ChatEditorDrawer
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        data={chatData}
        onChange={setChatData}
        category={category}
      />
    </Box>
  );
}
