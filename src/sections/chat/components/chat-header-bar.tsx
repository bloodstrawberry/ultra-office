'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import { THEME_OPTIONS } from '../constants/themes';
import type { ChatRoomConfig, ChatUser } from '../types';

interface ChatHeaderBarProps {
  config: ChatRoomConfig;
  partner?: ChatUser;
}

export function ChatHeaderBar({ config, partner }: ChatHeaderBarProps) {
  const { themeId, roomTitle, partnerName, memberCount, partnerStatus } = config;
  const themeMeta = THEME_OPTIONS[themeId] || THEME_OPTIONS.kakaotalk;

  const displayName = partner?.name || partnerName || roomTitle || '대화상대';
  const displayAvatar =
    partner?.avatar ||
    config.partnerAvatar ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=partner';

  // 1. LLM Themes Header
  if (config.category === 'llm') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.2,
          bgcolor: themeMeta.headerBg,
          color: themeMeta.headerText,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <Avatar
            src={displayAvatar}
            alt={displayName}
            sx={{ width: 28, height: 28, bgcolor: themeMeta.badgeColor }}
          >
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
          </Avatar>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{displayName}</Typography>
              {themeId === 'gemini' && (
                <Typography
                  sx={{
                    fontSize: 10,
                    bgcolor: 'rgba(26,115,232,0.3)',
                    color: '#8AB4F8',
                    px: 0.6,
                    py: 0.1,
                    borderRadius: 1,
                    fontWeight: 700,
                  }}
                >
                  Advanced
                </Typography>
              )}
            </Box>
            {partnerStatus && (
              <Typography sx={{ fontSize: 11, opacity: 0.6 }}>{partnerStatus}</Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small" sx={{ color: 'inherit', opacity: 0.8 }}>
            <MoreVertRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    );
  }

  // 2. 메신저 및 SNS 헤더
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 1.5,
        py: 1,
        bgcolor: themeMeta.headerBg,
        color: themeMeta.headerText,
        borderBottom:
          themeId === 'imessage' || themeId === 'facebook' ? '1px solid rgba(0,0,0,0.08)' : 'none',
        userSelect: 'none',
      }}
    >
      {/* 뒤로가기 & 프로필 정보 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        <IconButton size="small" sx={{ color: 'inherit', p: 0.5 }}>
          {themeId === 'kakaotalk' ? (
            <ArrowBackRoundedIcon sx={{ fontSize: 22, color: '#111111' }} />
          ) : (
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        {/* 아바타 (인스타, 라인, Knox, 텔레그램, iMessage 등) */}
        {themeId !== 'kakaotalk' && (
          <Avatar
            src={displayAvatar}
            alt={displayName}
            sx={{
              width: 34,
              height: 34,
              border: themeId === 'instagram' ? '2px solid #E1306C' : 'none',
            }}
          />
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              noWrap
              sx={{
                fontSize: themeId === 'kakaotalk' ? 16.5 : 15,
                fontWeight: 700,
                color: themeMeta.headerText,
                letterSpacing: -0.3,
              }}
            >
              {displayName}
            </Typography>

            {memberCount && memberCount > 2 && themeId !== 'kakaotalk' ? (
              <Typography sx={{ fontSize: 12, opacity: 0.6, fontWeight: 500 }}>
                {memberCount}
              </Typography>
            ) : null}

            {themeId === 'knox' && <ShieldRoundedIcon sx={{ fontSize: 14, color: '#38BDF8' }} />}

            {themeId === 'instagram' && (
              <VerifiedRoundedIcon sx={{ fontSize: 14, color: '#0095F6' }} />
            )}
          </Box>

          {partnerStatus && themeId !== 'kakaotalk' && (
            <Typography
              noWrap
              sx={{
                fontSize: 10,
                opacity: 0.65,
                color: themeMeta.headerText,
              }}
            >
              {partnerStatus}
            </Typography>
          )}
        </Box>
      </Box>

      {/* 우측 아이콘 버튼 그룹 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {themeId === 'kakaotalk' && (
          <>
            <IconButton size="small" sx={{ color: '#111111', p: 0.6 }}>
              <SearchRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#111111', p: 0.6 }}>
              <MenuRoundedIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </>
        )}

        {(themeId === 'instagram' || themeId === 'facebook' || themeId === 'line') && (
          <>
            <IconButton size="small" sx={{ color: 'inherit', p: 0.6 }}>
              <CallRoundedIcon sx={{ fontSize: 19 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: 'inherit', p: 0.6 }}>
              <VideocamRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </>
        )}

        {(themeId === 'imessage' ||
          themeId === 'telegram' ||
          themeId === 'knox' ||
          themeId === 'threads' ||
          themeId === 'twitter') && (
          <IconButton size="small" sx={{ color: 'inherit', p: 0.6 }}>
            <MoreVertRoundedIcon sx={{ fontSize: 20 }} />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
