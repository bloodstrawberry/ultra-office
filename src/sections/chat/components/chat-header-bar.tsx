'use client';

import type { ChatUser, ChatRoomConfig } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import VolumeUpRoundedIcon from '@mui/icons-material/VolumeUpRounded';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';

import { THEME_OPTIONS } from '../constants/themes';

interface ChatHeaderBarProps {
  config: ChatRoomConfig;
  partner?: ChatUser;
  onBackToList?: () => void;
}

export function ChatHeaderBar({ config, partner, onBackToList }: ChatHeaderBarProps) {
  const { themeId, roomTitle, partnerName, memberCount, partnerStatus } = config;
  const themeMeta = THEME_OPTIONS[themeId] || THEME_OPTIONS.kakaotalk;

  const displayName = partner?.name || partnerName || roomTitle || '대화상대';
  const displayAvatar =
    partner?.avatar ||
    config.partnerAvatar ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=partner';

  if (themeId === 'kakaotalk') {
    return (
      <Box sx={{ position: 'relative', height: 98, flexShrink: 0, bgcolor: '#BACEE0', color: '#111820', userSelect: 'none' }}>
        <Box sx={{ height: 28, display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-start', pr: 0.5 }}>
          {['−', '□', '×'].map((symbol) => (
            <Box key={symbol} sx={{ width: 23, height: 27, display: 'grid', placeItems: 'center', fontSize: symbol === '□' ? 14 : 18, lineHeight: 1, color: '#576672' }}>
              {symbol}
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 1.6, pt: 1.1 }}>
          <Avatar
            src={displayAvatar}
            alt={displayName}
            onClick={onBackToList}
            sx={{ width: 40, height: 40, borderRadius: '15px', cursor: onBackToList ? 'pointer' : 'default' }}
          />
          <Box sx={{ ml: 1.4, minWidth: 0, flex: 1, cursor: onBackToList ? 'pointer' : 'default' }} onClick={onBackToList}>
            <Typography noWrap sx={{ fontSize: 15, lineHeight: '21px', fontWeight: 400, color: '#101820' }}>{displayName}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#667785', mt: 0.1 }}>
              <PersonRoundedIcon sx={{ fontSize: 13 }} />
              <Typography sx={{ fontSize: 11, lineHeight: '14px' }}>{memberCount || 2}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, ml: 1 }}>
            <SearchRoundedIcon sx={{ fontSize: 19 }} />
            <CallRoundedIcon sx={{ fontSize: 19 }} />
            <VideocamRoundedIcon sx={{ fontSize: 20 }} />
            <MenuRoundedIcon sx={{ fontSize: 20 }} />
          </Box>
        </Box>
        <Box sx={{ position: 'absolute', right: 26, bottom: 5, width: 136, height: 4, bgcolor: '#FFE500' }} />
        <Box sx={{ position: 'absolute', right: 17, bottom: -35, width: 38, height: 38, borderRadius: '50%', bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', zIndex: 3, boxShadow: '0 1px 2px rgba(0,0,0,0.16)' }}>
          <VolumeUpRoundedIcon sx={{ color: '#2A83ED', fontSize: 21 }} />
        </Box>
      </Box>
    );
  }

  // 1. LLM Themes Header
  if (config.category === 'llm') {
    const isWeb = themeId.endsWith('_web') || config.deviceType === 'desktop';

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: isWeb ? 2.5 : 2,
          py: isWeb ? 1 : 1.2,
          bgcolor: themeMeta.headerBg,
          color: themeMeta.headerText,
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          {isWeb ? (
            // PC 웹 모드: 모델 선택 드롭다운 뱃지
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                px: 1.4,
                py: 0.5,
                borderRadius: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
              }}
            >
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: themeMeta.headerText }}>
                {displayName}
              </Typography>
              <Typography sx={{ fontSize: 10, color: '#94A3B8' }}>▾</Typography>
            </Box>
          ) : (
            <>
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
                  {themeId.startsWith('gemini') && (
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
            </>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {isWeb && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                px: 1.2,
                py: 0.4,
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.12)' },
              }}
            >
              <span>공유</span>
            </Box>
          )}
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
          themeId === 'imessage' || themeId === 'facebook' || themeId === 'danggeun'
            ? '1px solid rgba(0,0,0,0.08)'
            : 'none',
        userSelect: 'none',
      }}
    >
      {/* 뒤로가기 & 프로필 정보 */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
        <IconButton
          size="small"
          onClick={onBackToList}
          sx={{
            color: 'inherit',
            p: 0.5,
            cursor: onBackToList ? 'pointer' : 'default',
            '&:hover': onBackToList ? { bgcolor: 'action.hover' } : undefined,
          }}
        >
          {themeId === 'kakaotalk' || themeId === 'galaxy' ? (
            <ArrowBackRoundedIcon
              sx={{ fontSize: 22, color: themeId === 'kakaotalk' ? '#111111' : '#1E293B' }}
            />
          ) : (
            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 18 }} />
          )}
        </IconButton>

        {/* 아바타 (인스타, 라인, Knox, 텔레그램, iMessage, 갤럭시 등) */}
        {themeId !== 'kakaotalk' && (
          <Avatar
            src={displayAvatar}
            alt={displayName}
            sx={{
              width: 34,
              height: 34,
              border: themeId === 'instagram' ? '2px solid #E1306C' : 'none',
              ...(themeId === 'galaxy' && {
                bgcolor: '#2C7BFE',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: 14,
              }),
            }}
          >
            {themeId === 'galaxy' && !displayAvatar ? displayName.charAt(0) : undefined}
          </Avatar>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              noWrap
              sx={{
                fontSize: themeId === 'kakaotalk' ? 16.5 : themeId === 'galaxy' ? 15.5 : 15,
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
                fontSize: 10.5,
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

        {themeId === 'galaxy' && (
          <>
            <IconButton size="small" sx={{ color: '#1E293B', p: 0.6 }}>
              <CallRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#1E293B', p: 0.6 }}>
              <SearchRoundedIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton size="small" sx={{ color: '#1E293B', p: 0.6 }}>
              <MoreVertRoundedIcon sx={{ fontSize: 20 }} />
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
          themeId === 'danggeun' ||
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
