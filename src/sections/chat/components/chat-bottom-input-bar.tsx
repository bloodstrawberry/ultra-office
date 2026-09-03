'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TagRoundedIcon from '@mui/icons-material/TagRounded';
import GraphicEqRoundedIcon from '@mui/icons-material/GraphicEqRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';

import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';

import { THEME_OPTIONS } from '../constants/themes';
import type { ChatRoomConfig } from '../types';

interface ChatBottomInputBarProps {
  config: ChatRoomConfig;
  onSendMessage?: (text: string) => void;
}

export function ChatBottomInputBar({ config, onSendMessage }: ChatBottomInputBarProps) {
  const { themeId, category, darkMode } = config;
  const themeMeta = THEME_OPTIONS[themeId] || THEME_OPTIONS.kakaotalk;
  const [inputText, setInputText] = useState('');

  const isKakao = themeId === 'kakaotalk';

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendMessage?.(inputText.trim());
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 1. LLM 하단 프롬프트 입력창 (모바일 & PC 웹)
  if (category === 'llm') {
    const isWeb = themeId.endsWith('_web') || config.deviceType === 'desktop';

    if (isWeb) {
      return (
        <Box
          sx={{
            p: 2,
            bgcolor: 'transparent',
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: config.isFullViewport ? { xs: '100%', md: 880 } : 740,
              bgcolor: darkMode ? '#2F2F2F' : '#FFFFFF',
              borderRadius: 3.5,
              px: 2,
              py: 1.2,
              boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
              border: darkMode ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <InputBase
              fullWidth
              multiline
              maxRows={4}
              placeholder={`${themeMeta.name}에게 무엇이든 물어보세요...`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                color: darkMode ? '#FFFFFF' : '#1E293B',
                fontSize: 14,
                lineHeight: 1.5,
              }}
            />

            {/* 하단 툴바: 파일 첨부, 웹 검색 칩, 추론 칩, 마이크 & 전송 버튼 */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pt: 0.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <IconButton size="small" sx={{ color: darkMode ? '#94A3B8' : '#64748B', p: 0.4 }}>
                  <AddRoundedIcon sx={{ fontSize: 20 }} />
                </IconButton>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'grey.100',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1.5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: darkMode ? '#D1D5DB' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <span>🌐 웹 검색</span>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.4,
                    bgcolor: darkMode ? 'rgba(255,255,255,0.06)' : 'grey.100',
                    px: 1,
                    py: 0.3,
                    borderRadius: 1.5,
                    fontSize: 11.5,
                    fontWeight: 600,
                    color: darkMode ? '#D1D5DB' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <span>💡 추론</span>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <IconButton size="small" sx={{ color: darkMode ? '#94A3B8' : '#64748B', p: 0.4 }}>
                  <MicRoundedIcon sx={{ fontSize: 19 }} />
                </IconButton>

                <IconButton
                  size="small"
                  onClick={handleSend}
                  disabled={!inputText.trim()}
                  sx={{
                    bgcolor: inputText.trim()
                      ? themeMeta.badgeColor
                      : darkMode
                        ? 'rgba(255,255,255,0.1)'
                        : 'grey.300',
                    color: inputText.trim() ? '#FFFFFF' : darkMode ? '#6B7280' : '#94A3B8',
                    '&:hover': { bgcolor: inputText.trim() ? themeMeta.badgeColor : undefined },
                    width: 32,
                    height: 32,
                  }}
                >
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          p: 1.5,
          bgcolor: themeMeta.headerBg,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: darkMode ? '#2F2F2F' : '#F1F5F9',
            borderRadius: 3,
            px: 1.5,
            py: 0.5,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            gap: 1,
          }}
        >
          <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: themeMeta.badgeColor }} />
          <InputBase
            fullWidth
            placeholder={`${themeMeta.name}에게 무엇이든 물어보세요...`}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              color: darkMode ? '#FFFFFF' : '#1E293B',
              fontSize: 13,
            }}
          />
          <IconButton
            size="small"
            onClick={handleSend}
            disabled={!inputText.trim()}
            sx={{
              bgcolor: inputText.trim() ? themeMeta.badgeColor : 'transparent',
              color: inputText.trim() ? '#FFFFFF' : 'rgba(255,255,255,0.3)',
              '&:hover': { bgcolor: inputText.trim() ? themeMeta.badgeColor : 'transparent' },
              p: 0.5,
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // 2. 카카오톡 전용 하단 입력바 (플로팅 알약 캡슐 & 아래 화살표 버튼)
  if (isKakao) {
    return (
      <Box sx={{ position: 'relative', width: '100%' }}>
        {/* 우측 상단 플로팅 아래 화살표 (스크롤 다운 버튼) */}
        <Box
          sx={{
            position: 'absolute',
            top: -46,
            right: 14,
            width: 36,
            height: 36,
            borderRadius: '50%',
            bgcolor: '#FFFFFF',
            boxShadow: '0 3px 10px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 24, color: '#222222' }} />
        </Box>

        {/* 카카오톡 하단바 영역 */}
        <Box
          sx={{
            px: 1.2,
            py: 0.8,
            bgcolor: '#B2C7D9',
            display: 'flex',
            alignItems: 'center',
            gap: 0.8,
          }}
        >
          {/* 좌측 + 첨부 버튼 (안드로이드 카카오톡 원형 테두리) */}
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 20, color: '#333333' }} />
          </Box>

          {/* 중앙 흰색 알약 입력창 */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#FFFFFF',
              borderRadius: 5,
              px: 1.5,
              py: 0.4,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <InputBase
              fullWidth
              placeholder="메시지 입력"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                color: '#191919',
                fontSize: 13.5,
                '& input::placeholder': {
                  color: '#8E9DA8',
                  opacity: 1,
                },
              }}
            />

            {/* 입력창 내부 우측 아이콘 3종: 이모티콘, #샵검색, 마이크/웨이브 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3 }}>
              <IconButton size="small" sx={{ color: '#555555', p: 0.4 }}>
                <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 19 }} />
              </IconButton>
              <IconButton size="small" sx={{ color: '#555555', p: 0.4 }}>
                <TagRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
              {inputText.trim() ? (
                <IconButton
                  size="small"
                  onClick={handleSend}
                  sx={{
                    bgcolor: '#FEE500',
                    color: '#000000',
                    '&:hover': { bgcolor: '#FEE500' },
                    p: 0.5,
                  }}
                >
                  <SendRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              ) : (
                <IconButton size="small" sx={{ color: '#555555', p: 0.4 }}>
                  <GraphicEqRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  // 3. 기타 메신저 및 SNS 하단 입력바
  return (
    <Box
      sx={{
        px: 1.2,
        py: 0.8,
        bgcolor: darkMode ? '#121212' : '#FFFFFF',
        borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        display: 'flex',
        alignItems: 'center',
        gap: 0.8,
      }}
    >
      <IconButton size="small" sx={{ color: darkMode ? '#94A3B8' : '#64748B', p: 0.5 }}>
        <AddCircleOutlineRoundedIcon sx={{ fontSize: 22 }} />
      </IconButton>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: darkMode ? '#262626' : '#F1F5F9',
          borderRadius: 4,
          px: 1.5,
          py: 0.3,
        }}
      >
        <InputBase
          fullWidth
          placeholder="메시지 보내기..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            color: darkMode ? '#FFFFFF' : '#1E293B',
            fontSize: 13,
          }}
        />
        <IconButton size="small" sx={{ color: darkMode ? '#94A3B8' : '#64748B', p: 0.4 }}>
          <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      {inputText.trim() ? (
        <IconButton
          size="small"
          onClick={handleSend}
          sx={{
            bgcolor: themeMeta.badgeColor,
            color: '#FFFFFF',
            '&:hover': {
              bgcolor: themeMeta.badgeColor,
            },
            p: 0.6,
          }}
        >
          <SendRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>
      ) : (
        <IconButton size="small" sx={{ color: darkMode ? '#94A3B8' : '#64748B', p: 0.5 }}>
          {themeId === 'instagram' ? (
            <ImageRoundedIcon sx={{ fontSize: 20 }} />
          ) : (
            <MicRoundedIcon sx={{ fontSize: 20 }} />
          )}
        </IconButton>
      )}
    </Box>
  );
}
