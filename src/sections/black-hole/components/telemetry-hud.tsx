'use client';

import type { TelemetryData } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';

import { playButtonClickSound } from '../utils/sound';

// ----------------------------------------------------------------------

interface TelemetryHUDProps {
  telemetry: TelemetryData | null;
}

export function TelemetryHUD({ telemetry }: TelemetryHUDProps) {
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);

  if (!telemetry) return null;

  return (
    <>
      {/* Top-Left Telemetry Stats HUD Card */}
      <Card
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 20,
          p: 1.75,
          minWidth: { xs: 200, sm: 230 },
          backdropFilter: 'blur(16px)',
          bgcolor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
          borderRadius: 2.5,
          color: '#F8FAFC',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
            pb: 1,
            mb: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: '#38BDF8',
                boxShadow: '0 0 8px #38BDF8',
                animation: 'pulse 2s infinite',
              }}
            />
            <Typography variant="caption" sx={{ fontWeight: 800, color: '#38BDF8' }}>
              실시간 텔레메트리 (Telemetry)
            </Typography>
          </Box>

          <Tooltip title="일반 상대성 이론 물리 가이드">
            <IconButton
              size="small"
              onClick={() => {
                playButtonClickSound();
                setShowInfoModal(true);
              }}
              sx={{
                color: '#38BDF8',
                bgcolor: 'rgba(30, 41, 59, 0.8)',
                '&:hover': { bgcolor: 'rgba(51, 65, 85, 0.9)' },
                width: 22,
                height: 22,
              }}
            >
              <HelpOutlineRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            fontSize: '0.72rem',
            fontFamily: 'monospace',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              Rs(슈바르츠):
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#38BDF8', fontFamily: 'monospace' }}
            >
              {telemetry.rs.toFixed(1)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              Rph(광자구):
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#67E8F9', fontFamily: 'monospace' }}
            >
              {telemetry.rph.toFixed(1)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              RISCO:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#FCD34D', fontFamily: 'monospace' }}
            >
              {telemetry.risco.toFixed(1)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              Spin(a):
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#34D399', fontFamily: 'monospace' }}
            >
              {telemetry.spin.toFixed(2)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              거리:
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#A5B4FC', fontFamily: 'monospace' }}
            >
              {telemetry.cameraDistanceRs.toFixed(1)} Rs
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption" sx={{ color: '#94A3B8', fontFamily: 'monospace' }}>
              적색편이(z):
            </Typography>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: '#FB7185', fontFamily: 'monospace' }}
            >
              {telemetry.redshiftZ.toFixed(2)}
            </Typography>
          </Box>

          {telemetry.tidalForceG !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gridColumn: 'span 2' }}>
              <Typography variant="caption" sx={{ color: '#F472B6', fontFamily: 'monospace' }}>
                조석 장력(G/m):
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#F472B6', fontFamily: 'monospace' }}
              >
                {telemetry.tidalForceG.toFixed(1)} G
              </Typography>
            </Box>
          )}

          {telemetry.timeDilationFactor !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gridColumn: 'span 2' }}>
              <Typography variant="caption" sx={{ color: '#34D399', fontFamily: 'monospace' }}>
                시간 지연율:
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#34D399', fontFamily: 'monospace' }}
              >
                {(telemetry.timeDilationFactor * 100).toFixed(1)}%
              </Typography>
            </Box>
          )}

          {telemetry.gravitationalWaveFreq !== undefined && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gridColumn: 'span 2' }}>
              <Typography variant="caption" sx={{ color: '#C084FC', fontFamily: 'monospace' }}>
                중력파 주파수:
              </Typography>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: '#C084FC', fontFamily: 'monospace' }}
              >
                {telemetry.gravitationalWaveFreq} Hz
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(51, 65, 85, 0.8)',
            pt: 0.75,
            mt: 1,
            fontSize: '0.68rem',
            color: '#64748B',
            fontFamily: 'monospace',
          }}
        >
          <span>렌더링 성능:</span>
          <Typography
            variant="caption"
            sx={{ fontWeight: 700, color: '#34D399', fontFamily: 'monospace' }}
          >
            {telemetry.fps} FPS
          </Typography>
        </Box>
      </Card>

      {/* Physics Educational Guide Dialog */}
      <Dialog
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            bgcolor: '#0F172A',
            color: '#F8FAFC',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            p: 2.5,
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(51, 65, 85, 0.8)',
            pb: 1.5,
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#38BDF8' }}>
            🌌 블랙홀 일반 상대성 이론 가이드
          </Typography>
          <IconButton
            size="small"
            onClick={() => setShowInfoModal(false)}
            sx={{ color: '#94A3B8' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#38BDF8', mb: 0.5 }}>
              1. 슈바르츠실트 반지름 (Rs = 2GM / c²)
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.6 }}>
              질량 M을 가진 물체가 중력 붕괴하여 형성된 사상의 지평선(Event Horizon)의 반지름입니다.
              이 지점을 넘어가면 빛조차 탈출할 수 없습니다.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(103, 232, 249, 0.2)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#67E8F9', mb: 0.5 }}>
              2. 광자구 (Rph = 1.5 Rs)
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.6 }}>
              빛(광자)이 블랙홀 주변을 무한히 회전할 수 있는 영측지선(Null Geodesic) 궤도
              영역입니다. 이 임계 반경 근처를 지나는 빛은 아인슈타인 링을 형성합니다.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(252, 211, 77, 0.2)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FCD34D', mb: 0.5 }}>
              3. 가장 안쪽의 안정한 원궤도 (RISCO)
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.6 }}>
              강착 원반의 플라스마 물질이 블랙홀 주변을 안정적으로 회전할 수 있는 최단 반지름입니다.
              스핀 a가 증가할수록 RISCO는 지평선 쪽으로 축소됩니다.
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.75,
              borderRadius: 2,
              bgcolor: 'rgba(30, 41, 59, 0.7)',
              border: '1px solid rgba(52, 211, 153, 0.2)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#34D399', mb: 0.5 }}>
              4. 상대론적 도플러 비밍 (Doppler Beaming)
            </Typography>
            <Typography variant="body2" sx={{ color: '#CBD5E1', lineHeight: 1.6 }}>
              관측자를 향해 초고속으로 회전해 오는 원반 가스는 청색편이(Blue-shift)와 함께 극도로
              밝아지고, 멀어지는 쪽은 적색편이(Red-shift)와 함께 어두워지는 비대칭 광도가
              나타납니다.
            </Typography>
          </Box>
        </Box>

        <Button
          fullWidth
          variant="contained"
          onClick={() => {
            playButtonClickSound();
            setShowInfoModal(false);
          }}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 800,
            background: 'linear-gradient(135deg, #0284C7 0%, #06B6D4 100%)',
          }}
        >
          이해했습니다 (확인)
        </Button>
      </Dialog>
    </>
  );
}
