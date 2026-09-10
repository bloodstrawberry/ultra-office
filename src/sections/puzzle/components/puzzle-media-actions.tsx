'use client';

import type { UsePuzzleMediaExportReturn } from '../hooks/use-puzzle-media-export';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemIcon from '@mui/material/ListItemIcon';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import MovieCreationRoundedIcon from '@mui/icons-material/MovieCreationRounded';
import FiberManualRecordRoundedIcon from '@mui/icons-material/FiberManualRecordRounded';

export interface PuzzleMediaActionsProps {
  mediaExport: UsePuzzleMediaExportReturn;
  size?: 'small' | 'medium';
  variant?: 'toolbar' | 'compact' | 'header';
}

export function PuzzleMediaActions({
  mediaExport,
  size = 'small',
  variant = 'toolbar',
}: PuzzleMediaActionsProps) {
  const {
    isCapturingScreenshot,
    copyScreenshotToClipboard,
    downloadScreenshot,
    gifMode,
    toggleGifMode,
    isRecording,
    isEncoding,
    encodingProgress,
    capturedFramesCount,
    gifResultUrl,
    downloadGif,
    clearGif,
    startAutoRecord,
  } = mediaExport;

  // Screenshot dropdown menu anchor
  const [screenshotAnchorEl, setScreenshotAnchorEl] = useState<null | HTMLElement>(null);
  const isScreenshotMenuOpen = Boolean(screenshotAnchorEl);

  const handleOpenScreenshotMenu = (event: React.MouseEvent<HTMLElement>) => {
    setScreenshotAnchorEl(event.currentTarget);
  };

  const handleCloseScreenshotMenu = () => {
    setScreenshotAnchorEl(null);
  };

  const handleCopy = async () => {
    handleCloseScreenshotMenu();
    await copyScreenshotToClipboard();
  };

  const handleDownloadImage = async () => {
    handleCloseScreenshotMenu();
    await downloadScreenshot();
  };

  const isCompact = variant === 'compact';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
      {/* 1. 스크린샷 버튼 & 드롭다운 메뉴 */}
      <Tooltip title="현재 게임 화면 캡처 (클립보드 복사 또는 이미지 다운로드)">
        <span>
          <Button
            size={size}
            variant="outlined"
            color="inherit"
            onClick={handleOpenScreenshotMenu}
            disabled={isCapturingScreenshot}
            startIcon={
              isCapturingScreenshot ? (
                <CircularProgress size={14} color="inherit" />
              ) : (
                <CameraAltRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              fontWeight: 700,
              px: isCompact ? 1 : 1.25,
              borderColor: 'divider',
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            {isCapturingScreenshot ? '캡처 중...' : isCompact ? '캡처' : '스크린샷'}
          </Button>
        </span>
      </Tooltip>

      <Menu
        anchorEl={screenshotAnchorEl}
        open={isScreenshotMenuOpen}
        onClose={handleCloseScreenshotMenu}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: 1.5,
            minWidth: 180,
            boxShadow: 4,
          },
        }}
      >
        <MenuItem onClick={handleCopy} sx={{ py: 1, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 'auto !important' }}>
            <ContentCopyRoundedIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              클립보드에 복사
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              즉시 붙여넣기 (Ctrl+V)
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem onClick={handleDownloadImage} sx={{ py: 1, gap: 1 }}>
          <ListItemIcon sx={{ minWidth: 'auto !important' }}>
            <FileDownloadRoundedIcon fontSize="small" color="info" />
          </ListItemIcon>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              PNG 파일 다운로드
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              고화질 이미지 저장
            </Typography>
          </Box>
        </MenuItem>
      </Menu>

      {/* 2. GIF 모드 토글 버튼 */}
      <Tooltip
        title={
          gifMode
            ? 'GIF 녹화 모드 활성 중 (재생 버튼을 누르면 종료 시 다운로드 버튼이 생성됩니다)'
            : 'GIF 녹화 모드 켜기 (재생 과정을 GIF로 녹화)'
        }
      >
        <span>
          <Button
            size={size}
            variant={gifMode ? 'contained' : 'outlined'}
            color={gifMode ? (isRecording ? 'error' : 'secondary') : 'inherit'}
            onClick={toggleGifMode}
            disabled={isEncoding}
            startIcon={
              isRecording ? (
                <FiberManualRecordRoundedIcon
                  sx={{
                    fontSize: 16,
                    color: '#FFF',
                    animation: 'pulse 1s infinite alternate',
                    '@keyframes pulse': {
                      '0%': { opacity: 1, transform: 'scale(1)' },
                      '100%': { opacity: 0.4, transform: 'scale(0.85)' },
                    },
                  }}
                />
              ) : (
                <MovieCreationRoundedIcon sx={{ fontSize: 18 }} />
              )
            }
            sx={{
              fontWeight: 700,
              px: isCompact ? 1 : 1.25,
              borderColor: gifMode ? undefined : 'divider',
              bgcolor: gifMode ? undefined : 'background.paper',
            }}
          >
            {isRecording
              ? `녹화 중 (${capturedFramesCount})`
              : gifMode
                ? isCompact
                  ? 'GIF 준비'
                  : 'GIF 녹화 대기'
                : 'GIF'}
          </Button>
        </span>
      </Tooltip>

      {/* 3. GIF 인코딩 중 상태 표시 */}
      {isEncoding && (
        <Chip
          icon={<CircularProgress size={14} color="inherit" />}
          label={`GIF 변환 중 ${encodingProgress > 0 ? `(${encodingProgress}%)` : ''}`}
          color="secondary"
          size="small"
          variant="soft"
          sx={{ fontWeight: 700, height: 30 }}
        />
      )}

      {/* 4. 생성 완료된 GIF 다운로드 버튼 (사용자 요청 핵심!) */}
      {gifResultUrl && (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            p: 0.25,
            borderRadius: 1.5,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.main',
            animation: 'bounce 0.6s ease',
            '@keyframes bounce': {
              '0%': { transform: 'scale(0.9)', opacity: 0 },
              '70%': { transform: 'scale(1.05)' },
              '100%': { transform: 'scale(1)', opacity: 1 },
            },
          }}
        >
          <Button
            size={size}
            variant="contained"
            color="success"
            onClick={downloadGif}
            startIcon={<FileDownloadRoundedIcon sx={{ fontSize: 18 }} />}
            sx={{
              fontWeight: 800,
              boxShadow: 2,
              px: 1.5,
              whiteSpace: 'nowrap',
            }}
          >
            GIF 다운로드
          </Button>
          <Tooltip title="GIF 초기화">
            <IconButton size="small" onClick={clearGif} sx={{ color: 'success.dark', p: 0.5 }}>
              <CloseRoundedIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}

      {/* 5. 풀이 단계가 있을 때 바로 녹화 재생을 시작할 수 있는 보조 팁 (GIF 모드일 때만 가볍게 노출) */}
      {gifMode && !isRecording && !isEncoding && !gifResultUrl && (
        <Tooltip title="0단계부터 전체 과정을 자동으로 재생하며 녹화합니다">
          <Button
            size={size}
            variant="text"
            color="secondary"
            onClick={startAutoRecord}
            sx={{ fontSize: '0.75rem', fontWeight: 700, p: 0.5, minWidth: 'auto' }}
          >
            ⚡ 자동 녹화 재생
          </Button>
        </Tooltip>
      )}
    </Box>
  );
}
