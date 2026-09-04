'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import AddCommentOutlinedIcon from '@mui/icons-material/AddCommentOutlined';
import MinimizeRoundedIcon from '@mui/icons-material/MinimizeRounded';
import CropSquareRoundedIcon from '@mui/icons-material/CropSquareRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PersonOutlineRoundedIcon from '@mui/icons-material/PersonOutlineRounded';
import ChatBubbleRoundedIcon from '@mui/icons-material/ChatBubbleRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import SentimentSatisfiedRoundedIcon from '@mui/icons-material/SentimentSatisfiedRounded';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PushPinRoundedIcon from '@mui/icons-material/PushPinRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

import { ROOM_LIST_PRESETS } from '../constants/presets';
import { THEME_OPTIONS } from '../constants/themes';
import type { ChatRoomConfig, ChatRoomListItem, MessengerThemeId } from '../types';

interface ChatRoomListViewProps {
  config: ChatRoomConfig;
  onSelectRoom: (room: ChatRoomListItem) => void;
}

export function ChatRoomListView({ config, onSelectRoom }: ChatRoomListViewProps) {
  const themeId = (config.themeId as MessengerThemeId) || 'kakaotalk';
  const themeMeta = THEME_OPTIONS[themeId] || THEME_OPTIONS.kakaotalk;
  const roomList = ROOM_LIST_PRESETS[themeId] || ROOM_LIST_PRESETS.kakaotalk;

  // 카카오톡 상단 탭 상태: 0=전체, 1=안읽음, 2=ChatGPT
  const [kakaoTab, setKakaoTab] = useState<number>(0);

  // 갤럭시 One UI 탭 상태: 0=대화, 1=연락처
  const [galaxyTab, setGalaxyTab] = useState<number>(0);

  // 필터링된 대화방 목록
  const filteredRooms = roomList.filter((room) => {
    if (themeId === 'kakaotalk' && kakaoTab === 1) {
      return (room.unreadCount ?? 0) > 0;
    }
    return true;
  });

  // 1. 카카오톡 (KakaoTalk PC) 화면 - 첨부 이미지 완벽 재현
  if (themeId === 'kakaotalk') {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          bgcolor: '#FFFFFF',
          overflow: 'hidden',
          position: 'relative',
          userSelect: 'none',
        }}
      >
        {/* 1-1. 좌측 얇은 사이드바 */}
        <Box
          sx={{
            width: 58,
            bgcolor: '#ECEEF1',
            borderRight: '1px solid #E2E5E9',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            flexShrink: 0,
          }}
        >
          {/* 상단 네비게이션 아이콘 (친구, 채팅, 더보기) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.2 }}>
            {/* 친구 아이콘 */}
            <IconButton size="small" sx={{ color: '#888F96', p: 0.8 }}>
              <PersonOutlineRoundedIcon sx={{ fontSize: 26 }} />
            </IconButton>

            {/* 채팅 아이콘 (활성 상태: 빨간 뱃지 6) */}
            <Box sx={{ position: 'relative' }}>
              <IconButton size="small" sx={{ color: '#424852', p: 0.8 }}>
                <ChatBubbleRoundedIcon sx={{ fontSize: 26 }} />
              </IconButton>
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: -4,
                  bgcolor: '#FF4242',
                  color: '#FFFFFF',
                  borderRadius: 5,
                  minWidth: 16,
                  height: 16,
                  px: 0.4,
                  fontSize: 10,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                6
              </Box>
            </Box>

            {/* 더보기 (...) */}
            <IconButton size="small" sx={{ color: '#888F96', p: 0.8 }}>
              <MoreHorizRoundedIcon sx={{ fontSize: 26 }} />
            </IconButton>
          </Box>

          {/* 하단 시스템 아이콘 (이모티콘, 음소거 종, 설정) */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.8 }}>
            <IconButton size="small" sx={{ color: '#9AA0A6', p: 0.6 }}>
              <SentimentSatisfiedRoundedIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#9AA0A6', p: 0.6 }}>
              <NotificationsOffOutlinedIcon sx={{ fontSize: 22 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#9AA0A6', p: 0.6 }}>
              <SettingsOutlinedIcon sx={{ fontSize: 22 }} />
            </IconButton>
          </Box>
        </Box>

        {/* 1-2. 중앙 메인 채팅 목록 영역 */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            bgcolor: '#FFFFFF',
          }}
        >
          {/* 상단 윈도우 컨트롤 및 타이틀 바 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              pt: 1.2,
              pb: 0.8,
            }}
          >
            {/* 좌측 타이틀 (채팅 ▾) */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{ fontSize: 18, fontWeight: 800, color: '#111111', letterSpacing: -0.5 }}
              >
                채팅
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#222222', mt: -0.2 }}>▾</Typography>
            </Box>

            {/* 우측 툴 아이콘들: 돋보기, 오픈채팅, 대화+, 창 제어 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <IconButton size="small" sx={{ color: '#4B5563', p: 0.5 }}>
                <SearchRoundedIcon sx={{ fontSize: 21 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#4B5563', p: 0.5 }}>
                <ForumOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#4B5563', p: 0.5 }}>
                <AddCommentOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>

              {/* 윈도우 창 제어 아이콘 (— □ ✕) */}
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 0.3, ml: 0.5, color: '#9CA3AF' }}
              >
                <MinimizeRoundedIcon sx={{ fontSize: 14 }} />
                <CropSquareRoundedIcon sx={{ fontSize: 12 }} />
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </Box>
            </Box>
          </Box>

          {/* 필터 칩 탭 바 ([전체], [안읽음 6], [ChatGPT], [+]) */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              px: 2,
              py: 1,
              borderBottom: '1px solid #F3F4F6',
            }}
          >
            {/* [전체] */}
            <Box
              onClick={() => setKakaoTab(0)}
              sx={{
                bgcolor: kakaoTab === 0 ? '#1E1E1E' : '#F3F4F6',
                color: kakaoTab === 0 ? '#FFFFFF' : '#4B5563',
                px: 1.4,
                py: 0.5,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              전체
            </Box>

            {/* [💬 안읽음 6] */}
            <Box
              onClick={() => setKakaoTab(1)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: kakaoTab === 1 ? '#E1EFFE' : '#F0F5FF',
                border: '1px solid #D5E4F7',
                color: '#1E429F',
                px: 1.2,
                py: 0.45,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <ChatBubbleRoundedIcon sx={{ fontSize: 14, color: '#2B7FFF' }} />
              <span>안읽음</span>
              <Box
                sx={{
                  bgcolor: '#FF4242',
                  color: '#FFFFFF',
                  borderRadius: 5,
                  minWidth: 16,
                  height: 16,
                  px: 0.4,
                  fontSize: 10,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                6
              </Box>
            </Box>

            {/* [ChatGPT] */}
            <Box
              onClick={() => setKakaoTab(2)}
              sx={{
                bgcolor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: '#374151',
                px: 1.4,
                py: 0.5,
                borderRadius: 4,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ChatGPT
            </Box>

            {/* [+] */}
            <Box
              sx={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                cursor: 'pointer',
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
          </Box>

          {/* 대화방 리스트 (스크롤 영역) */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {filteredRooms.map((room) => {
              const isPinned = Boolean(room.isPinned);
              const isOpenChat = Boolean(room.isOpenChat);

              return (
                <Box
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    px: 2,
                    py: 1.25,
                    cursor: 'pointer',
                    gap: 1.5,
                    borderBottom: '1px solid #F9FAFB',
                    '&:hover': { bgcolor: '#F5F7FA' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* 프로필 아바타 */}
                  {room.avatar ? (
                    <Avatar
                      src={room.avatar}
                      alt={room.title}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '16px', // 카카오 squircle
                        bgcolor: room.avatarBg || 'grey.200',
                      }}
                    />
                  ) : (
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '16px',
                        bgcolor: room.avatarBg || '#72C2E1',
                        color: '#FFFFFF',
                      }}
                    >
                      <PersonRoundedIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                  )}

                  {/* 중앙 텍스트 정보 (방 이름, 최근 메시지) */}
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.3,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {/* 오픈채팅 아이콘 */}
                      {isOpenChat && (
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            bgcolor: '#374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                          }}
                        >
                          <LanguageRoundedIcon sx={{ fontSize: 10 }} />
                        </Box>
                      )}

                      <Typography
                        noWrap
                        sx={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: '#111827',
                          letterSpacing: -0.2,
                        }}
                      >
                        {room.title}
                      </Typography>

                      {/* 인원수 */}
                      {room.memberCount && (
                        <Typography sx={{ fontSize: 11, color: '#9CA3AF', fontWeight: 500 }}>
                          {room.memberCount}
                        </Typography>
                      )}

                      {/* 고정 핀 아이콘 */}
                      {isPinned && (
                        <PushPinRoundedIcon
                          sx={{ fontSize: 13, color: '#9CA3AF', transform: 'rotate(45deg)' }}
                        />
                      )}
                    </Box>

                    {/* 최근 메시지 요약 */}
                    <Typography
                      noWrap
                      sx={{
                        fontSize: 12.5,
                        color: '#6B7280',
                        letterSpacing: -0.2,
                      }}
                    >
                      {room.lastMessage}
                    </Typography>
                  </Box>

                  {/* 우측 시간 & 빨간 뱃지 */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: 0.6,
                      flexShrink: 0,
                    }}
                  >
                    <Typography sx={{ fontSize: 10.5, color: '#9CA3AF' }}>
                      {room.lastTime}
                    </Typography>

                    {Boolean(room.unreadCount && room.unreadCount > 0) && (
                      <Box
                        sx={{
                          bgcolor: '#FF4242',
                          color: '#FFFFFF',
                          borderRadius: 5,
                          minWidth: 18,
                          height: 18,
                          px: 0.5,
                          fontSize: 10.5,
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {room.unreadCount}
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* 1-3. 하단 광고 배너 (Once Human) */}
          <Box
            sx={{
              p: 1.2,
              bgcolor: '#FAFAFA',
              borderTop: '1px solid #EEEEEE',
              display: 'flex',
              alignItems: 'center',
              gap: 1.2,
            }}
          >
            {/* 배너 이미지 썸네일 */}
            <Box
              sx={{
                width: 96,
                height: 48,
                borderRadius: 1,
                bgcolor: '#991B1B',
                background: 'linear-gradient(135deg, #1E1B4B 0%, #B91C1C 100%)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: '#FFFFFF',
                p: 0.5,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: 1 }}>HUMAN</Typography>
              <Typography sx={{ fontSize: 8, opacity: 0.8 }}>기상천외 생존게임</Typography>
            </Box>

            {/* 배너 텍스트 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography noWrap sx={{ fontSize: 13, fontWeight: 800, color: '#111827' }}>
                S4 트랜스 룰렛 정식 오픈!
              </Typography>
              <Typography noWrap sx={{ fontSize: 11, color: '#6B7280' }}>
                Once Human
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // 2. 갤럭시 문자 (Samsung One UI 메시지 목록)
  if (themeId === 'galaxy') {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F2F4F8',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* One UI 대형 상단 헤더 영역 */}
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 1.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* 상단 액션 아이콘들 (검색, 메뉴) */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <IconButton size="small" sx={{ color: '#1E293B', p: 0.5 }}>
              <SearchRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#1E293B', p: 0.5 }}>
              <MoreVertRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>

          {/* 대형 "메시지" 볼드 타이틀 */}
          <Typography
            sx={{
              fontSize: 26,
              fontWeight: 800,
              color: '#0F172A',
              letterSpacing: -0.5,
            }}
          >
            메시지
          </Typography>

          {/* 대화 / 연락처 탭 */}
          <Box sx={{ display: 'flex', gap: 2.5, borderBottom: '1px solid #E2E8F0', pb: 0.5 }}>
            <Box
              onClick={() => setGalaxyTab(0)}
              sx={{
                position: 'relative',
                pb: 0.8,
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: galaxyTab === 0 ? 800 : 500,
                  color: galaxyTab === 0 ? '#1F69FF' : '#64748B',
                }}
              >
                대화 (6)
              </Typography>
              {galaxyTab === 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: '#1F69FF',
                    borderRadius: 2,
                  }}
                />
              )}
            </Box>

            <Box
              onClick={() => setGalaxyTab(1)}
              sx={{
                position: 'relative',
                pb: 0.8,
                cursor: 'pointer',
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: galaxyTab === 1 ? 800 : 500,
                  color: galaxyTab === 1 ? '#1F69FF' : '#64748B',
                }}
              >
                연락처
              </Typography>
              {galaxyTab === 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    bgcolor: '#1F69FF',
                    borderRadius: 2,
                  }}
                />
              )}
            </Box>
          </Box>
        </Box>

        {/* 갤럭시 대화방 목록 (둥근 카드 컨테이너) */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: 1.5,
            pb: 2.5,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.8,
          }}
        >
          {roomList.map((room) => {
            return (
              <Box
                key={room.id}
                onClick={() => onSelectRoom(room)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: '#FFFFFF',
                  borderRadius: 3.5,
                  px: 2,
                  py: 1.5,
                  gap: 1.5,
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  '&:hover': { bgcolor: '#F8FAFC' },
                  transition: 'background-color 0.15s ease',
                }}
              >
                {/* 삼성 One UI 원형 아바타 (첫 글자) */}
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor:
                      room.categoryTag === '카드'
                        ? '#E8F2FF'
                        : room.categoryTag === '배송'
                          ? '#FEF3C7'
                          : '#EFF6FF',
                    color:
                      room.categoryTag === '카드'
                        ? '#1F69FF'
                        : room.categoryTag === '배송'
                          ? '#D97706'
                          : '#2563EB',
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {room.title.charAt(0)}
                </Avatar>

                {/* 중앙 메시지 정보 */}
                <Box
                  sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.3 }}
                >
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#0F172A',
                    }}
                  >
                    {room.title}
                  </Typography>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: 13,
                      color: room.unreadCount ? '#1E293B' : '#64748B',
                      fontWeight: room.unreadCount ? 600 : 400,
                    }}
                  >
                    {room.lastMessage}
                  </Typography>
                </Box>

                {/* 우측 시간 및 파란색 원형 뱃지 */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 0.6,
                    flexShrink: 0,
                  }}
                >
                  <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>{room.lastTime}</Typography>
                  {Boolean(room.unreadCount && room.unreadCount > 0) && (
                    <Box
                      sx={{
                        bgcolor: '#1F69FF',
                        color: '#FFFFFF',
                        borderRadius: 5,
                        minWidth: 18,
                        height: 18,
                        px: 0.5,
                        fontSize: 10.5,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {room.unreadCount}
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* 우측 하단 One UI 플로팅 메시지 작성 버튼 */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            width: 48,
            height: 48,
            borderRadius: '16px',
            bgcolor: '#1F69FF',
            color: '#FFFFFF',
            boxShadow: '0 4px 14px rgba(31, 105, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            '&:hover': { bgcolor: '#1657E0' },
          }}
        >
          <ChatBubbleRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
      </Box>
    );
  }

  // 3. iMessage (Apple iOS 메시지 목록)
  if (themeId === 'imessage') {
    return (
      <Box
        sx={{
          flex: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {/* 상단 네비게이션: 편집 & 작성 아이콘 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 1.5,
          }}
        >
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: '#007AFF', cursor: 'pointer' }}>
            편집
          </Typography>
          <IconButton size="small" sx={{ color: '#007AFF', p: 0.5 }}>
            <EditNoteRoundedIcon sx={{ fontSize: 26 }} />
          </IconButton>
        </Box>

        {/* 대형 타이틀 "메시지" */}
        <Box sx={{ px: 2.5, pt: 1, pb: 1 }}>
          <Typography sx={{ fontSize: 30, fontWeight: 800, color: '#000000', letterSpacing: -0.5 }}>
            메시지
          </Typography>
        </Box>

        {/* 검색창 */}
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#E5E5EA',
              borderRadius: 3,
              px: 1.2,
              py: 0.4,
              gap: 0.6,
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 18, color: '#8E8E93' }} />
            <InputBase placeholder="검색" sx={{ fontSize: 13.5, color: '#000000', flex: 1 }} />
          </Box>
        </Box>

        {/* 대화방 목록 */}
        <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {roomList.map((room) => {
            return (
              <Box
                key={room.id}
                onClick={() => onSelectRoom(room)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1.3,
                  gap: 1.5,
                  cursor: 'pointer',
                  borderBottom: '1px solid #E5E5EA',
                  '&:hover': { bgcolor: '#F2F2F7' },
                }}
              >
                {/* 파란색 점 (안읽음 인디케이터) */}
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: room.unreadCount ? '#007AFF' : 'transparent',
                  }}
                />

                {/* iOS 이니셜 아바타 */}
                <Avatar
                  src={room.avatar}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#8E8E93',
                    color: '#FFFFFF',
                    fontWeight: 700,
                  }}
                >
                  {room.title.charAt(0)}
                </Avatar>

                {/* 발신자 및 메시지 본문 */}
                <Box
                  sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.2 }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography noWrap sx={{ fontSize: 15, fontWeight: 700, color: '#000000' }}>
                      {room.title}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: '#8E8E93' }}>{room.lastTime}</Typography>
                  </Box>
                  <Typography noWrap sx={{ fontSize: 13, color: '#8E8E93' }}>
                    {room.lastMessage}
                  </Typography>
                </Box>

                <ArrowForwardIosRoundedIcon sx={{ fontSize: 13, color: '#C7C7CC', ml: 0.5 }} />
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // 4. Knox, LINE, Telegram 등 기타 메신저 목록 기본 렌더러
  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: themeMeta.defaultBg,
        overflow: 'hidden',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {/* 상단 헤더 */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          bgcolor: themeMeta.headerBg,
          color: themeMeta.headerText,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {themeId === 'knox' && <ShieldRoundedIcon sx={{ fontSize: 20, color: '#38BDF8' }} />}
          {themeId === 'telegram' && <MenuRoundedIcon sx={{ fontSize: 22 }} />}
          <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{themeMeta.name} 대화 목록</Typography>
        </Box>
        <IconButton size="small" sx={{ color: 'inherit' }}>
          <SearchRoundedIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 목록 본문 */}
      <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {roomList.map((room) => {
          return (
            <Box
              key={room.id}
              onClick={() => onSelectRoom(room)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 2,
                py: 1.4,
                gap: 1.5,
                cursor: 'pointer',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.03)' },
              }}
            >
              <Avatar
                src={room.avatar}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: themeMeta.badgeColor,
                  color: '#FFFFFF',
                  fontWeight: 700,
                }}
              >
                {room.title.charAt(0)}
              </Avatar>

              <Box
                sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.3 }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography
                    noWrap
                    sx={{ fontSize: 14.5, fontWeight: 700, color: themeMeta.headerText }}
                  >
                    {room.title}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                    {room.lastTime}
                  </Typography>
                </Box>
                <Typography noWrap sx={{ fontSize: 12.5, color: 'text.secondary' }}>
                  {room.lastMessage}
                </Typography>
              </Box>

              {Boolean(room.unreadCount && room.unreadCount > 0) && (
                <Box
                  sx={{
                    bgcolor: themeMeta.badgeColor,
                    color: '#FFFFFF',
                    borderRadius: 5,
                    minWidth: 18,
                    height: 18,
                    px: 0.5,
                    fontSize: 10.5,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {room.unreadCount}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
