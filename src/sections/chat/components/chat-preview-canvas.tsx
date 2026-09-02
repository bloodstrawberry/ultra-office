'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { toPng, toBlob } from 'html-to-image';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import CropFreeRoundedIcon from '@mui/icons-material/CropFreeRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import RoundedCornerRoundedIcon from '@mui/icons-material/RoundedCornerRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';
import FullscreenExitRoundedIcon from '@mui/icons-material/FullscreenExitRounded';
import DesktopWindowsRoundedIcon from '@mui/icons-material/DesktopWindowsRounded';

import { THEME_OPTIONS, THEMES_BY_CATEGORY } from '../constants/themes';
import { ChatDeviceFrame } from './chat-device-frame';
import { ChatHeaderBar } from './chat-header-bar';
import { ChatMessageItem } from './chat-message-item';
import { ChatBottomInputBar } from './chat-bottom-input-bar';
import type { ChatData, ChatThemeId, ChatCategory, ChatMessage, ChatRoomConfig } from '../types';

interface ChatPreviewCanvasProps {
  data: ChatData;
  category: ChatCategory;
  onOpenEditor: () => void;
  onThemeChange: (themeId: ChatThemeId) => void;
  onSendMessage: (text: string) => void;
  onToggleFrame: () => void;
  onReset: () => void;
  onUpdateConfig?: (patch: Partial<ChatRoomConfig>) => void;
  onSelectMessage?: (msg: ChatMessage) => void;
}

export function ChatPreviewCanvas({
  data,
  category,
  onOpenEditor,
  onThemeChange,
  onSendMessage,
  onToggleFrame,
  onReset,
  onUpdateConfig,
  onSelectMessage,
}: ChatPreviewCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const themeMeta = THEME_OPTIONS[data.config.themeId] || THEME_OPTIONS.kakaotalk;
  const availableThemes = THEMES_BY_CATEGORY[category] || [];

  const currentScale = data.config.deviceScale || 100;
  const currentWidth = data.config.deviceWidth || 390;
  const currentRadius = data.config.frameBorderRadius ?? 36;
  const isFullViewport = Boolean(data.config.isFullViewport);

  // 1. 재생(Play) 시뮬레이션 상태
  const [isPlaying, setIsPlaying] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number>(data.messages.length);
  const playbackSpeed = 1000; // 1초 간격

  // 메시지 개수가 변경되면 전체 표시로 동기화 (재생 중이 아닐 때)
  useEffect(() => {
    if (!isPlaying) {
      setVisibleCount(data.messages.length);
    }
  }, [data.messages.length, isPlaying]);

  // 재생 타이머
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isPlaying) {
      if (visibleCount < data.messages.length) {
        timer = setTimeout(() => {
          setVisibleCount((prev) => {
            const next = prev + 1;
            // 스크롤 맨 아래로 이동
            setTimeout(() => {
              if (messagesScrollRef.current) {
                messagesScrollRef.current.scrollTop = messagesScrollRef.current.scrollHeight;
              }
            }, 50);
            return next;
          });
        }, playbackSpeed);
      } else {
        setIsPlaying(false);
        toast.info('대화 재생이 완료되었습니다.');
      }
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isPlaying, visibleCount, data.messages.length, playbackSpeed]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (visibleCount >= data.messages.length) {
        setVisibleCount(1);
      }
      setIsPlaying(true);
      toast.success('실시간 대화 재생을 시작합니다.');
    }
  };

  const handleReplay = () => {
    setVisibleCount(0);
    setIsPlaying(true);
  };

  const handleShowAll = () => {
    setIsPlaying(false);
    setVisibleCount(data.messages.length);
  };

  // 2. 줌 및 너비 핸들러
  const handleZoom = (delta: number) => {
    const next = Math.min(140, Math.max(60, currentScale + delta));
    onUpdateConfig?.({ deviceScale: next });
  };

  const handleSetWidth = (w: number) => {
    onUpdateConfig?.({ deviceWidth: w });
  };

  // 3. Round (모서리 곡률) 팝오버 상태
  const [radiusAnchorEl, setRadiusAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleOpenRadius = (e: React.MouseEvent<HTMLButtonElement>) => {
    setRadiusAnchorEl(e.currentTarget);
  };

  const handleCloseRadius = () => {
    setRadiusAnchorEl(null);
  };

  // 4. 이미지 다운로드 (html-to-image)
  const handleDownloadImage = async () => {
    if (!containerRef.current) return;
    toast.loading('채팅방 이미지를 생성 중입니다...', { id: 'chat-export' });
    try {
      const dataUrl = await toPng(containerRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `chat-${data.config.themeId}-${Date.now()}.png`;
      a.click();
      toast.success('채팅방 이미지가 다운로드되었습니다!', { id: 'chat-export' });
    } catch (err) {
      console.error('Download export error:', err);
      toast.error('이미지 변환 중 오류가 발생했습니다.', { id: 'chat-export' });
    }
  };

  // 5. 이미지 클립보드 복사 (Copy)
  const handleCopyImage = async () => {
    if (!containerRef.current) return;
    toast.loading('클립보드에 복사 중입니다...', { id: 'chat-copy' });
    try {
      const blob = await toBlob(containerRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      });
      if (!blob) {
        throw new Error('Blob creation failed');
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('채팅방 이미지가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기)', {
          id: 'chat-copy',
        });
      } else {
        await handleDownloadImage();
      }
    } catch (err) {
      console.warn('Clipboard copy error, fallback to download:', err);
      await handleDownloadImage();
    }
  };

  // 현재 보여줄 메시지 목록
  const displayedMessages = data.messages.slice(0, visibleCount);

  return (
    <Box
      sx={{
        flex: 1,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
        overflow: 'hidden',
      }}
    >
      {/* 1. 상단 컨트롤 툴바 */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.2,
          bgcolor: 'background.paper',
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          gap: 1.5,
          zIndex: 10,
        }}
      >
        {/* 테마 선택 칩 그룹 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mr: 0.5 }}>
            🎨 테마:
          </Typography>
          {availableThemes.map((th) => {
            const isSelected = data.config.themeId === th.id;
            return (
              <Chip
                key={th.id}
                label={th.name}
                onClick={() => onThemeChange(th.id)}
                variant={isSelected ? 'filled' : 'outlined'}
                color={isSelected ? 'primary' : 'default'}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  borderColor: isSelected ? 'primary.main' : undefined,
                }}
              />
            );
          })}
        </Box>

        {/* 액션 버튼 그룹: 재생 시뮬레이터, Copy, 다운로드, 크기, 곡률, 편집, 초기화 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* 🎬 실시간 대화 재생 컨트롤 그룹 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100'),
              borderRadius: 2,
              p: 0.4,
              gap: 0.3,
            }}
          >
            <Tooltip title={isPlaying ? '일시정지' : '처음부터 대화 재생 (Chat Simulator)'}>
              <Button
                size="small"
                variant={isPlaying ? 'contained' : 'outlined'}
                color={isPlaying ? 'warning' : 'primary'}
                startIcon={isPlaying ? <PauseRoundedIcon /> : <PlayArrowRoundedIcon />}
                onClick={handlePlayToggle}
                sx={{ fontSize: 12, fontWeight: 700, py: 0.3, px: 1.2 }}
              >
                {isPlaying ? `재생 중 (${visibleCount}/${data.messages.length})` : '재생'}
              </Button>
            </Tooltip>

            <Tooltip title="다시 처음부터 재생">
              <IconButton size="small" onClick={handleReplay}>
                <ReplayRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {visibleCount < data.messages.length && (
              <Button size="small" variant="text" onClick={handleShowAll} sx={{ fontSize: 11 }}>
                전체보기
              </Button>
            )}
          </Box>

          {/* 📋 Copy 버튼 (이미지 클립보드 복사) */}
          <Tooltip title="채팅방 이미지 복사 (Copy to Clipboard)">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyImage}
              sx={{ fontWeight: 700, fontSize: 12.5 }}
            >
              Copy
            </Button>
          </Tooltip>

          {/* 📥 다운로드 버튼 (PNG 고해상도 저장) */}
          <Tooltip title="채팅방 이미지 파일 다운로드 (Download PNG)">
            <Button
              variant="contained"
              color="primary"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadImage}
              sx={{ fontWeight: 700, fontSize: 12.5 }}
            >
              다운로드
            </Button>
          </Tooltip>

          {/* 🔲 Round (모서리 둥글기) 조절 버튼 & 팝오버 */}
          <Tooltip title="채팅방 모서리 둥글기 (Border Radius) 조절">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RoundedCornerRoundedIcon />}
              onClick={handleOpenRadius}
              sx={{ fontSize: 12, py: 0.4 }}
            >
              Round: {currentRadius}px
            </Button>
          </Tooltip>

          <Popover
            open={Boolean(radiusAnchorEl)}
            anchorEl={radiusAnchorEl}
            onClose={handleCloseRadius}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Box sx={{ p: 2, width: 220, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                모서리 둥글기 (Round: {currentRadius}px)
              </Typography>
              <Slider
                value={currentRadius}
                min={0}
                max={50}
                step={2}
                onChange={(_, val) => onUpdateConfig?.({ frameBorderRadius: val as number })}
              />
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onUpdateConfig?.({ frameBorderRadius: 0 })}
                >
                  0px (직각)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onUpdateConfig?.({ frameBorderRadius: 16 })}
                >
                  16px
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onUpdateConfig?.({ frameBorderRadius: 36 })}
                >
                  36px (기본)
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => onUpdateConfig?.({ frameBorderRadius: 48 })}
                >
                  48px
                </Button>
              </Box>
            </Box>
          </Popover>

          {/* 디바이스 너비 퀵 셀렉터 */}
          {/* 디바이스 너비 퀵 셀렉터 */}
          <Box
            sx={{
              display: { xs: 'none', lg: 'flex' },
              alignItems: 'center',
              gap: 0.5,
              bgcolor: 'action.hover',
              p: 0.3,
              borderRadius: 1.5,
            }}
          >
            <Button
              size="small"
              variant={!isFullViewport && currentWidth === 340 ? 'contained' : 'text'}
              onClick={() => {
                handleSetWidth(340);
                onUpdateConfig?.({ isFullViewport: false, deviceType: 'iphone' });
              }}
              sx={{ minWidth: 38, px: 0.8, py: 0.2, fontSize: 11 }}
            >
              340
            </Button>
            <Button
              size="small"
              variant={!isFullViewport && currentWidth === 390 ? 'contained' : 'text'}
              onClick={() => {
                handleSetWidth(390);
                onUpdateConfig?.({ isFullViewport: false, deviceType: 'iphone' });
              }}
              sx={{ minWidth: 38, px: 0.8, py: 0.2, fontSize: 11 }}
            >
              390
            </Button>
            <Button
              size="small"
              variant={!isFullViewport && currentWidth === 430 ? 'contained' : 'text'}
              onClick={() => {
                handleSetWidth(430);
                onUpdateConfig?.({ isFullViewport: false, deviceType: 'iphone' });
              }}
              sx={{ minWidth: 38, px: 0.8, py: 0.2, fontSize: 11 }}
            >
              430
            </Button>
            <Button
              size="small"
              variant={!isFullViewport && currentWidth === 820 ? 'contained' : 'text'}
              onClick={() => {
                handleSetWidth(820);
                onUpdateConfig?.({ isFullViewport: false, deviceType: 'desktop' });
              }}
              sx={{ minWidth: 44, px: 0.8, py: 0.2, fontSize: 11, fontWeight: 700 }}
            >
              820 (PC)
            </Button>
            <Button
              size="small"
              variant={isFullViewport ? 'contained' : 'text'}
              color="primary"
              onClick={() => onUpdateConfig?.({ isFullViewport: true, deviceType: 'desktop' })}
              sx={{ minWidth: 50, px: 0.8, py: 0.2, fontSize: 11, fontWeight: 700 }}
            >
              🖥️ Full (100%)
            </Button>
          </Box>

          {/* 줌 인 / 아웃 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'action.hover',
              borderRadius: 1.5,
              px: 0.5,
            }}
          >
            <Tooltip title="축소">
              <IconButton size="small" onClick={() => handleZoom(-10)}>
                <ZoomOutRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography
              variant="caption"
              sx={{ px: 0.5, fontWeight: 700, minWidth: 36, textAlign: 'center' }}
            >
              {currentScale}%
            </Typography>
            <Tooltip title="확대">
              <IconButton size="small" onClick={() => handleZoom(10)}>
                <ZoomInRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<EditRoundedIcon />}
            onClick={onOpenEditor}
            sx={{ fontWeight: 700, fontSize: 12.5 }}
          >
            편집
          </Button>

          <Tooltip title={isFullViewport ? '기본 크기로 복귀' : '화면 전체 채우기 (Full Viewport)'}>
            <IconButton
              onClick={() =>
                onUpdateConfig?.({
                  isFullViewport: !isFullViewport,
                  ...(isFullViewport ? { deviceWidth: 820 } : { deviceType: 'desktop' }),
                })
              }
              sx={{
                bgcolor: isFullViewport ? 'primary.main' : 'action.hover',
                color: isFullViewport ? '#FFFFFF' : 'inherit',
                '&:hover': { bgcolor: isFullViewport ? 'primary.dark' : 'action.selected' },
              }}
            >
              {isFullViewport ? (
                <FullscreenExitRoundedIcon fontSize="small" />
              ) : (
                <FullscreenRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title={data.config.showDeviceFrame ? '프레임리스 모드' : '외곽 프레임 모드'}>
            <IconButton onClick={onToggleFrame} sx={{ bgcolor: 'action.hover' }}>
              {data.config.showDeviceFrame ? (
                <CropFreeRoundedIcon fontSize="small" />
              ) : (
                <PhoneIphoneRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="대화 초기화">
            <IconButton onClick={onReset} sx={{ bgcolor: 'action.hover' }}>
              <RestartAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 2. 중앙 캔버스 뷰포트 (목업 렌더링 영역) */}
      <Box
        sx={{
          flex: 1,
          overflowY: isFullViewport ? 'hidden' : 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: isFullViewport
            ? data.config.showDeviceFrame
              ? { xs: 1, md: 1.5 }
              : 0
            : { xs: 1.5, md: 3 },
          position: 'relative',
          height: isFullViewport ? '100%' : 'auto',
          minHeight: 0,
        }}
      >
        <Box
          ref={containerRef}
          sx={{
            width: isFullViewport ? '100%' : 'auto',
            height: isFullViewport ? '100%' : 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: isFullViewport ? 1 : 'none',
          }}
        >
          <ChatDeviceFrame config={data.config}>
            {/* 채팅방 내부 전체 래퍼 */}
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                bgcolor: themeMeta.defaultBg,
                background: themeMeta.defaultBg,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* 상단 헤더 */}
              <ChatHeaderBar
                config={data.config}
                partner={data.users.find((u) => u.role === 'other' || u.role === 'bot')}
              />

              {/* 메시지 스트림 스크롤 영역 (PC 화면일 때 중앙 840px 컨테이너 유지) */}
              <Box
                ref={messagesScrollRef}
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  py: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  scrollBehavior: 'smooth',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth:
                      data.config.category === 'llm' || data.config.deviceType === 'desktop'
                        ? 840
                        : '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {displayedMessages.map((msg, idx) => {
                    const sender = data.users.find((u) => u.id === msg.senderId);
                    const previousMessage = idx > 0 ? displayedMessages[idx - 1] : null;
                    const nextMessage =
                      idx < displayedMessages.length - 1 ? displayedMessages[idx + 1] : null;

                    return (
                      <ChatMessageItem
                        key={msg.id}
                        message={msg}
                        sender={sender}
                        config={data.config}
                        previousMessage={previousMessage}
                        nextMessage={nextMessage}
                        onSelectMessage={onSelectMessage}
                      />
                    );
                  })}
                </Box>
              </Box>

              {/* 하단 입력바 */}
              <ChatBottomInputBar config={data.config} onSendMessage={onSendMessage} />
            </Box>
          </ChatDeviceFrame>
        </Box>
      </Box>
    </Box>
  );
}
