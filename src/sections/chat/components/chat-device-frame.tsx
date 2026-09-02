'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BatteryChargingFullRoundedIcon from '@mui/icons-material/BatteryChargingFullRounded';
import BatteryStdRoundedIcon from '@mui/icons-material/BatteryStdRounded';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import SignalCellularAltRoundedIcon from '@mui/icons-material/SignalCellularAltRounded';

import type { ChatRoomConfig } from '../types';

interface ChatDeviceFrameProps {
  config: ChatRoomConfig;
  children: React.ReactNode;
}

export function ChatDeviceFrame({ config, children }: ChatDeviceFrameProps) {
  const {
    showDeviceFrame,
    deviceType,
    timeString,
    batteryLevel,
    networkType,
    isCharging,
    darkMode,
  } = config;

  const customRadius = config.frameBorderRadius;

  if (!showDeviceFrame || deviceType === 'frameless') {
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          height: '100%',
          maxHeight: 760,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: customRadius !== undefined ? `${customRadius}px` : '16px',
          overflow: 'hidden',
          boxShadow: (theme) => theme.shadows[10],
          bgcolor: darkMode ? '#121212' : '#FFFFFF',
          border: (theme) => `1px solid ${theme.palette.divider}`,
          position: 'relative',
          transition: 'border-radius 0.2s ease',
        }}
      >
        {/* 간단 상단 상태바 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 0.75,
            bgcolor: 'transparent',
            color: darkMode ? '#FFFFFF' : '#000000',
            fontSize: '0.75rem',
            fontWeight: 600,
            userSelect: 'none',
            zIndex: 10,
          }}
        >
          <span>{timeString || '09:41'}</span>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <SignalCellularAltRoundedIcon sx={{ fontSize: 14 }} />
            <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 700 }}>
              {networkType}
            </Typography>
            <WifiRoundedIcon sx={{ fontSize: 14 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography variant="caption" sx={{ fontSize: 11, fontWeight: 700 }}>
                {batteryLevel}%
              </Typography>
              {isCharging ? (
                <BatteryChargingFullRoundedIcon sx={{ fontSize: 16 }} />
              ) : (
                <BatteryStdRoundedIcon sx={{ fontSize: 16 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* 메인 콘텐츠 */}
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {children}
        </Box>
      </Box>
    );
  }

  const isIphone = deviceType === 'iphone';
  const width = config.deviceWidth || 390;
  const height = Math.round(width * 2);
  const scale = (config.deviceScale || 100) / 100;

  const outerRadius =
    customRadius !== undefined
      ? `${customRadius}px`
      : isIphone
        ? `${Math.round(width * 0.128)}px`
        : `${Math.round(width * 0.092)}px`;

  const innerRadius =
    customRadius !== undefined ? `${Math.max(0, customRadius - 8)}px` : isIphone ? '40px' : '28px';

  return (
    <Box
      sx={{
        width,
        height,
        transform: scale !== 1 ? `scale(${scale})` : undefined,
        transformOrigin: 'top center',
        borderRadius: outerRadius,
        bgcolor: '#1C1C1E',
        p: '10px',
        boxShadow: '0 25px 60px -15px rgba(0,0,0,0.5), inset 0 0 4px 2px rgba(255,255,255,0.2)',
        border: '3px solid #2C2C2E',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        userSelect: 'none',
        transition:
          'width 0.2s ease, height 0.2s ease, transform 0.2s ease, border-radius 0.2s ease',
      }}
    >
      {/* 볼륨 버튼 & 전원 버튼 외곽 시각화 */}
      <Box
        sx={{
          position: 'absolute',
          left: -6,
          top: 110,
          width: 4,
          height: 45,
          bgcolor: '#3A3A3C',
          borderRadius: '4px 0 0 4px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          left: -6,
          top: 170,
          width: 4,
          height: 45,
          bgcolor: '#3A3A3C',
          borderRadius: '4px 0 0 4px',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          right: -6,
          top: 140,
          width: 4,
          height: 65,
          bgcolor: '#3A3A3C',
          borderRadius: '0 4px 4px 0',
        }}
      />

      {/* 스마트폰 스크린 본체 */}
      <Box
        sx={{
          flex: 1,
          width: '100%',
          height: '100%',
          borderRadius: innerRadius,
          overflow: 'hidden',
          bgcolor: darkMode ? '#000000' : '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* 상단 다이내믹 아일랜드 / 노치 및 상태바 */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 3,
            pt: 1.5,
            pb: 0.5,
            color: darkMode ? '#FFFFFF' : '#000000',
            position: 'relative',
            zIndex: 20,
          }}
        >
          {/* 시간 */}
          <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>
            {timeString || '09:41'}
          </Typography>

          {/* Dynamic Island (iPhone) or Punch Hole (Android) */}
          {isIphone ? (
            <Box
              sx={{
                width: 96,
                height: 24,
                bgcolor: '#000000',
                borderRadius: 20,
                position: 'absolute',
                left: '50%',
                top: 8,
                transform: 'translateX(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                pr: 1,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  bgcolor: '#111827',
                  borderRadius: '50%',
                  border: '1px solid #1E293B',
                }}
              />
            </Box>
          ) : (
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: '#000000',
                borderRadius: '50%',
                position: 'absolute',
                left: '50%',
                top: 10,
                transform: 'translateX(-50%)',
              }}
            />
          )}

          {/* 신호 및 배터리 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <SignalCellularAltRoundedIcon sx={{ fontSize: 14 }} />
            <WifiRoundedIcon sx={{ fontSize: 14 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700 }}>{batteryLevel}%</Typography>
              {isCharging ? (
                <BatteryChargingFullRoundedIcon sx={{ fontSize: 15 }} />
              ) : (
                <BatteryStdRoundedIcon sx={{ fontSize: 15 }} />
              )}
            </Box>
          </Box>
        </Box>

        {/* 내부 채팅 본문 */}
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}
        >
          {children}
        </Box>

        {/* 하단 iOS 홈바 또는 Android 소프트키 네비게이션 바 */}
        {isIphone ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              py: 0.8,
              bgcolor: 'transparent',
              position: 'relative',
              zIndex: 20,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 4,
                bgcolor: darkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
                borderRadius: 2,
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              py: 0.8,
              px: 4,
              bgcolor: darkMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.3)',
              borderTop: '1px solid rgba(0,0,0,0.04)',
              color: darkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
              position: 'relative',
              zIndex: 20,
              userSelect: 'none',
            }}
          >
            {/* 최근 앱 (III) */}
            <Typography sx={{ fontSize: 13, fontWeight: 700, letterSpacing: 2 }}>|||</Typography>
            {/* 홈 버튼 (둥근 사각형) */}
            <Box
              sx={{
                width: 14,
                height: 14,
                borderRadius: '4px',
                border: '2px solid currentColor',
              }}
            />
            {/* 뒤로가기 (<) */}
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>〈</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
