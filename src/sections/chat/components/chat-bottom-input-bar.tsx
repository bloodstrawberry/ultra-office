'use client';

import type { ChatRoomConfig } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import MicRoundedIcon from '@mui/icons-material/MicRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import SentimentSatisfiedAltRoundedIcon from '@mui/icons-material/SentimentSatisfiedAltRounded';

import { THEME_OPTIONS } from '../constants/themes';

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              borderRadius: 2,
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
            borderRadius: 2,
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

  // 카카오톡 PC 채팅창의 흰색 입력 영역과 하단 도구 모음
  if (isKakao) {
    return (
      <Box sx={{ height: 118, flexShrink: 0, bgcolor: '#FFFFFF', borderTop: '1px solid #DEE2E5', display: 'flex', flexDirection: 'column' }}>
        <InputBase
          multiline
          fullWidth
          placeholder="메시지 입력"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ flex: 1, alignItems: 'flex-start', px: 1.5, pt: 1.1, fontSize: 12, color: '#1D2328', '& textarea::placeholder': { color: '#A3ACB4', opacity: 1 } }}
        />
        <Box sx={{ height: 40, display: 'flex', alignItems: 'center', px: 1.2, pb: 0.5, gap: 1.2, color: '#555B60' }}>
          <AddRoundedIcon sx={{ fontSize: 24, cursor: 'pointer' }} />
          <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 20, cursor: 'pointer' }} />
          <InsertDriveFileOutlinedIcon sx={{ fontSize: 19, cursor: 'pointer' }} />
          <Box sx={{ flex: 1 }} />
          <Box sx={{ width: 48, height: '1px', bgcolor: '#C7C7C7', position: 'relative', mr: 0.4, flexShrink: 0 }}>
            <Box sx={{ width: 10, height: 10, border: '1px solid #C7C7C7', borderRadius: '50%', bgcolor: '#FFFFFF', position: 'absolute', top: -5, right: 0 }} />
          </Box>
          <Box onClick={handleSend} sx={{ height: 30, minWidth: 73, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', bgcolor: inputText.trim() ? '#FEE500' : '#F6F6F6', color: inputText.trim() ? '#1A1A1A' : '#B9BFC4', borderRadius: '3px', fontSize: 12, cursor: inputText.trim() ? 'pointer' : 'default' }}>
            전송
            <Box sx={{ width: '1px', height: 18, flexShrink: 0, bgcolor: '#E7E7E7', ml: 1.3, mr: 0.7 }} />
            <KeyboardArrowDownRoundedIcon sx={{ fontSize: 15 }} />
          </Box>
        </Box>
      </Box>
    );
  }

  // 3. 갤럭시 문자 (Samsung One UI 메시지 입력바)
  if (themeId === 'galaxy') {
    return (
      <Box
        sx={{
          px: 1.5,
          py: 1,
          bgcolor: darkMode ? '#121212' : '#FFFFFF',
          borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.08)' : '#E2E8F0'}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {/* 첨부 + 버튼 */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: darkMode ? '#262626' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#64748B',
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 22 }} />
        </Box>

        {/* 갤러리/이미지 버튼 */}
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            bgcolor: darkMode ? '#262626' : '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            flexShrink: 0,
            color: '#64748B',
          }}
        >
          <ImageRoundedIcon sx={{ fontSize: 20 }} />
        </Box>

        {/* 중앙 입력 필드 (One UI 알약 버블) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            bgcolor: darkMode ? '#262626' : '#F1F5F9',
            borderRadius: 2,
            px: 1.8,
            py: 0.35,
          }}
        >
          <InputBase
            fullWidth
            placeholder="문자 메시지"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              color: darkMode ? '#FFFFFF' : '#0F172A',
              fontSize: 13.5,
            }}
          />
          <IconButton size="small" sx={{ color: '#64748B', p: 0.3 }}>
            <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>

        {/* 우측 버튼 (전송 또는 마이크) */}
        {inputText.trim() ? (
          <IconButton
            size="small"
            onClick={handleSend}
            sx={{
              bgcolor: '#1F69FF',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1657E0' },
              p: 0.7,
            }}
          >
            <SendRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 34,
              height: 34,
              borderRadius: '50%',
              bgcolor: darkMode ? '#262626' : '#F1F5F9',
              color: '#64748B',
              cursor: 'pointer',
            }}
          >
            <MicRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        )}
      </Box>
    );
  }

  // 4. 기타 메신저 및 SNS 하단 입력바
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
          borderRadius: 2,
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
