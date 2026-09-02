'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AddReactionRoundedIcon from '@mui/icons-material/AddReactionRounded';

import { THEME_OPTIONS } from '../constants/themes';
import type { ChatMessage, ChatRoomConfig, ChatUser } from '../types';

interface ChatMessageItemProps {
  message: ChatMessage;
  sender?: ChatUser;
  config: ChatRoomConfig;
  onSelectMessage?: (msg: ChatMessage) => void;
}

export function ChatMessageItem({
  message,
  sender,
  config,
  onSelectMessage,
}: ChatMessageItemProps) {
  const { themeId, category } = config;
  const themeMeta = THEME_OPTIONS[themeId] || THEME_OPTIONS.kakaotalk;
  const isMe = message.senderId === 'me' || sender?.role === 'me';
  const isBot = sender?.role === 'bot' || message.senderId === 'bot';
  const isSystem = message.isSystem || message.senderId === 'system';

  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. 시스템 메시지 (날짜선, 공지, 입장/퇴장)
  if (isSystem) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          my: 1.5,
          px: 2,
        }}
        onClick={() => onSelectMessage?.(message)}
      >
        <Box
          sx={{
            bgcolor: 'rgba(0, 0, 0, 0.25)',
            backdropFilter: 'blur(4px)',
            color: '#FFFFFF',
            px: 1.5,
            py: 0.5,
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '85%',
          }}
        >
          {message.text}
        </Box>
      </Box>
    );
  }

  // 2. LLM 카테고리 (ChatGPT, Gemini, Claude, Grok) 렌더러
  if (category === 'llm' || isBot) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          my: 1.5,
          px: 2,
          gap: 1,
        }}
        onClick={() => onSelectMessage?.(message)}
      >
        {isMe ? (
          // LLM 사용자 질문 버블 (우측 정렬 또는 카드형)
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
            {message.mediaUrl && (
              <Box
                component="img"
                src={message.mediaUrl}
                alt="첨부 이미지"
                sx={{
                  maxWidth: 240,
                  maxHeight: 240,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                  objectFit: 'cover',
                }}
              />
            )}
            {message.text && (
              <Box
                sx={{
                  bgcolor: themeMeta.myBubbleBg,
                  color: themeMeta.myBubbleText,
                  px: 2,
                  py: 1.2,
                  borderRadius: '18px 18px 4px 18px',
                  maxWidth: '85%',
                  fontSize: 14,
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                }}
              >
                {message.text}
              </Box>
            )}
          </Box>
        ) : (
          // LLM 응답 (좌측 또는 전폭 카드)
          <Box sx={{ display: 'flex', gap: 1.5, width: '100%', alignItems: 'flex-start' }}>
            <Avatar
              src={sender?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=AI'}
              alt="AI"
              sx={{ width: 30, height: 30, bgcolor: themeMeta.badgeColor, mt: 0.3 }}
            />
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* 발신 AI 이름 */}
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: themeMeta.headerText }}>
                {sender?.name || themeMeta.name}
              </Typography>

              {/* LLM 생성 이미지 / 멀티모달 출력 */}
              {message.mediaUrl && (
                <Box
                  component="img"
                  src={message.mediaUrl}
                  alt="생성 이미지"
                  sx={{
                    maxWidth: 280,
                    maxHeight: 280,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    objectFit: 'cover',
                    my: 0.5,
                  }}
                />
              )}

              {/* LLM Thinking (추론/사고과정) 블록 */}
              {message.thoughtText && (
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 0.75,
                      cursor: 'pointer',
                      bgcolor: 'rgba(255, 255, 255, 0.02)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' },
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setThinkingOpen(!thinkingOpen);
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <LightbulbRoundedIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#94A3B8' }}>
                        Thinking Process ({thinkingOpen ? '접기' : '사고 과정 보기'})
                      </Typography>
                    </Box>
                    {thinkingOpen ? (
                      <ExpandLessRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    ) : (
                      <ExpandMoreRoundedIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
                    )}
                  </Box>
                  <Collapse in={thinkingOpen}>
                    <Box
                      sx={{
                        p: 1.5,
                        fontSize: 12,
                        color: '#94A3B8',
                        lineHeight: 1.6,
                        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {message.thoughtText}
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* 본문 텍스트 */}
              <Box
                sx={{
                  color: themeMeta.otherBubbleText,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {message.text}
              </Box>

              {/* 코드 블록 (스니펫) */}
              {message.codeSnippet && (
                <Box
                  sx={{
                    bgcolor: '#1E1E1E',
                    borderRadius: 1.5,
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    my: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 0.5,
                      bgcolor: '#2D2D2D',
                      color: '#D4D4D4',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    <span>{message.codeSnippet.language || 'code'}</span>
                    <IconButton
                      size="small"
                      sx={{ color: '#D4D4D4', p: 0.3 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard?.writeText(message.codeSnippet?.code || '');
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                    >
                      {copied ? (
                        <CheckRoundedIcon sx={{ fontSize: 14, color: '#10B981' }} />
                      ) : (
                        <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                      )}
                    </IconButton>
                  </Box>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      fontSize: 12,
                      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                      color: '#9CDCFE',
                      overflowX: 'auto',
                      lineHeight: 1.45,
                    }}
                  >
                    <code>{message.codeSnippet.code}</code>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // 3. 메신저 및 SNS 메시지 렌더러
  const partnerName = sender?.name || '상대방';
  const partnerAvatar = sender?.avatar;

  const isKakao = themeId === 'kakaotalk';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        my: isKakao ? 0.6 : 0.8,
        px: 1.5,
        alignItems: isMe ? 'flex-end' : 'flex-start',
        cursor: 'pointer',
        '&:hover': {
          opacity: 0.96,
        },
      }}
      onClick={() => onSelectMessage?.(message)}
    >
      {/* 상대방 프로필 & 이름 (카톡/라인/Knox 등) */}
      {!isMe && (
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.4 }}>
          {isKakao && !partnerAvatar ? (
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: '#72C2E1',
                color: '#FFFFFF',
              }}
            >
              <PersonRoundedIcon sx={{ fontSize: 26 }} />
            </Avatar>
          ) : (
            <Avatar
              src={partnerAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'}
              alt={partnerName}
              sx={{ width: isKakao ? 38 : 34, height: isKakao ? 38 : 34 }}
            />
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.2 }}>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                color: isKakao ? '#2E363E' : themeMeta.headerText,
                letterSpacing: -0.2,
              }}
            >
              {partnerName}
            </Typography>
            {sender?.title && themeMeta.features.hasProfileTitle && (
              <Typography
                sx={{
                  fontSize: 10,
                  color: '#64748B',
                  bgcolor: 'rgba(0,0,0,0.05)',
                  px: 0.5,
                  borderRadius: 0.5,
                }}
              >
                {sender.title}
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {/* 말풍선 & 시간/상태 컨테이너 */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMe ? 'row-reverse' : 'row',
          alignItems: 'flex-end',
          gap: 0.6,
          maxWidth: '84%',
          pl: !isMe ? (isKakao ? 5.8 : 5.2) : 0, // 아바타 공간만큼 정렬 패딩
          position: 'relative',
        }}
      >
        {/* 말풍선 본체 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          <Box
            sx={{
              bgcolor:
                !message.text && message.mediaUrl
                  ? 'transparent'
                  : isMe
                    ? themeMeta.myBubbleBg
                    : themeMeta.otherBubbleBg,
              background:
                !message.text && message.mediaUrl
                  ? 'transparent'
                  : isMe
                    ? themeMeta.myBubbleBg
                    : themeMeta.otherBubbleBg,
              color: isMe ? themeMeta.myBubbleText : themeMeta.otherBubbleText,
              px: !message.text && message.mediaUrl ? 0 : 1.4,
              py: !message.text && message.mediaUrl ? 0 : 0.85,
              borderRadius: isMe
                ? isKakao
                  ? '14px 2px 14px 14px'
                  : '18px 18px 4px 18px'
                : isKakao
                  ? '2px 14px 14px 14px'
                  : '18px 18px 18px 4px',
              boxShadow: !message.text && message.mediaUrl ? 'none' : '0 1px 2px rgba(0,0,0,0.06)',
              fontSize: 13.5,
              lineHeight: 1.45,
              wordBreak: 'break-word',
              maxWidth: 270,
            }}
          >
            {/* 💬 카카오톡 답장 (Reply) 인용 블록 */}
            {message.replyTo && (
              <Box
                sx={{
                  bgcolor: isMe ? 'rgba(0,0,0,0.06)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 1,
                  p: 0.8,
                  mb: 0.75,
                  borderBottom: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#222222', mb: 0.2 }}>
                  {message.replyTo.senderName}에게 답장
                </Typography>
                <Typography noWrap sx={{ fontSize: 11.5, color: '#555555' }}>
                  {message.replyTo.text}
                </Typography>
              </Box>
            )}

            {/* 이미지 첨부 */}
            {message.mediaUrl ? (
              <Box
                component="img"
                src={message.mediaUrl}
                alt="첨부 이미지"
                sx={{
                  maxWidth: 220,
                  maxHeight: 260,
                  borderRadius: !message.text ? 2 : 1,
                  display: 'block',
                  mb: message.text ? 0.75 : 0,
                  boxShadow: !message.text ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
                  objectFit: 'cover',
                }}
              />
            ) : null}

            {message.text && <span>{message.text}</span>}
          </Box>

          {/* ❤️ 카카오톡 스타일 공감 리액션 캡슐 뱃지 */}
          {message.reactions && Object.keys(message.reactions).length > 0 && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.6,
                bgcolor: '#FFFFFF',
                color: '#111827',
                border: '1px solid rgba(0,0,0,0.12)',
                borderRadius: '16px',
                px: 0.8,
                py: 0.2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                fontSize: 11.5,
                fontWeight: 600,
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                mt: 0.4,
                zIndex: 5,
              }}
            >
              {Object.entries(message.reactions).map(([emoji, count]) => (
                <Box key={emoji} sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
                  <span>{emoji}</span>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#444444' }}>
                    {count}
                  </Typography>
                </Box>
              ))}
              {isKakao && (
                <AddReactionRoundedIcon sx={{ fontSize: 14, color: '#999999', ml: 0.2 }} />
              )}
            </Box>
          )}
        </Box>

        {/* 시간 및 읽음 표시/안읽은 카운트 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMe ? 'flex-end' : 'flex-start',
            flexShrink: 0,
            mb: 0.2,
          }}
        >
          {/* 카카오톡 특유의 노란 숫자 '1' (안읽음 표시) */}
          {isMe && themeMeta.features.hasUnreadBadge && (message.unreadCount ?? 0) > 0 && (
            <Typography
              sx={{
                fontSize: 10,
                fontWeight: 700,
                color: '#FEE500',
                textShadow: '0 0 1px rgba(0,0,0,0.3)',
                lineHeight: 1,
                mb: 0.2,
              }}
            >
              {message.unreadCount}
            </Typography>
          )}

          {/* 라인 또는 텔레그램/iMessage 읽음 표시 */}
          {isMe && themeMeta.features.hasReadStatus && message.isRead && (
            <Typography sx={{ fontSize: 9, color: '#16A34A', fontWeight: 600, lineHeight: 1 }}>
              읽음
            </Typography>
          )}

          {/* 텔레그램/페이스북 더블 체크마크 */}
          {isMe && themeMeta.features.hasDoubleCheck && (
            <DoneAllRoundedIcon sx={{ fontSize: 13, color: '#38BDF8', lineHeight: 1 }} />
          )}

          {/* 전송 시각 */}
          {message.time && (
            <Typography
              sx={{
                fontSize: 9.5,
                color: isKakao ? '#556677' : 'rgba(100, 116, 139, 0.85)',
                fontWeight: 500,
                whiteSpace: 'nowrap',
              }}
            >
              {message.time}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
