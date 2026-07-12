import type { ReactNode } from 'react';

import React from 'react';

import FlipIcon from '@mui/icons-material/Flip';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import RestoreIcon from '@mui/icons-material/Restore';
import InsertPhotoIcon from '@mui/icons-material/InsertPhoto';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { Box, Card, Stack, Tooltip, Typography, IconButton } from '@mui/material';

interface Props {
  title: string;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  offset: { x: number; y: number };
  rotation?: number;
  setRotation?: React.Dispatch<React.SetStateAction<number>>;
  isVFlip?: boolean;
  setIsVFlip?: React.Dispatch<React.SetStateAction<boolean>>;
  isHFlip?: boolean;
  setIsHFlip?: React.Dispatch<React.SetStateAction<boolean>>;
  resetViewer: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  isDragActive: boolean;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  imagePreviewUrl: string | null;
  placeholderText?: string;
  actionActiveText?: string;
  isPanning: boolean;
  children?: ReactNode;
  headerActions?: ReactNode;
  showCheckerboard?: boolean;
}

export function ImageViewerCard({
  title,
  zoom,
  setZoom,
  offset,
  resetViewer,
  containerRef,
  isDragActive,
  onDrop,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onPaste,
  onKeyDown,
  onMouseDown,
  imagePreviewUrl,
  rotation = 0,
  setRotation,
  isVFlip = false,
  setIsVFlip,
  isHFlip = false,
  setIsHFlip,
  placeholderText = '이미지 업로드 (드래그 & 드랍 또는 영역 선택 후 Ctrl+V)',
  actionActiveText = '여기에 이미지를 놓아주세요',
  isPanning,
  children,
  headerActions,
  showCheckerboard = false,
}: Props) {
  return (
    <Card
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, gap: 0.5, minHeight: 40 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 1 }}>
          {title}
        </Typography>
        <Tooltip title="축소">
          <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.1, z - 0.1))}>
            <ZoomOutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="확대">
          <IconButton size="small" onClick={() => setZoom((z) => Math.min(5, z + 0.1))}>
            <ZoomInIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="초기화">
          <IconButton
            size="small"
            onClick={resetViewer}
            disabled={
              zoom === 1 &&
              offset.x === 0 &&
              offset.y === 0 &&
              rotation === 0 &&
              !isVFlip &&
              !isHFlip
            }
          >
            <RestoreIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {setRotation && (
          <Tooltip title="90도 회전">
            <IconButton size="small" onClick={() => setRotation((r) => (r + 90) % 360)}>
              <RotateRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {setIsVFlip && (
          <Tooltip title="상하 반전">
            <IconButton size="small" onClick={() => setIsVFlip((f) => !f)}>
              <FlipIcon fontSize="small" sx={{ transform: 'rotate(90deg)' }} />
            </IconButton>
          </Tooltip>
        )}
        {setIsHFlip && (
          <Tooltip title="좌우 반전">
            <IconButton size="small" onClick={() => setIsHFlip((f) => !f)}>
              <FlipIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Typography variant="caption" sx={{ ml: 'auto', color: 'text.disabled' }}>
          {Math.round(zoom * 100)}%
        </Typography>
        {headerActions}
      </Box>

      <Box
        ref={containerRef}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        tabIndex={0}
        sx={{
          flex: 1,
          position: 'relative',
          bgcolor: (theme) =>
            isDragActive ? theme.palette.action.selected : theme.palette.action.hover,
          borderRadius: 1,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: (theme) =>
            isDragActive ? `2px dashed ${theme.palette.primary.main}` : '2px dashed transparent',
          transition: 'all 0.2s ease-in-out',
          cursor: imagePreviewUrl ? 'grab' : 'pointer',
          ...(showCheckerboard && {
            backgroundImage:
              'linear-gradient(45deg, var(--palette-grey-300) 25%, transparent 25%), linear-gradient(-45deg, var(--palette-grey-300) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--palette-grey-300) 75%), linear-gradient(-45deg, transparent 75%, var(--palette-grey-300) 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
          }),
          '&:focus': {
            outline: 'none',
            borderColor: (theme) => theme.palette.primary.main,
          },
        }}
      >
        {imagePreviewUrl ? (
          <Box
            sx={{
              position: 'relative',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'inline-block',
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom}) scale(${isHFlip ? -1 : 1}, ${isVFlip ? -1 : 1}) rotate(${rotation}deg)`,
              transition: isPanning ? 'none' : 'transform 0.1s ease-out',
            }}
          >
            <img
              src={imagePreviewUrl}
              alt={title}
              draggable={false}
              style={{
                display: 'block',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                userSelect: 'none',
                pointerEvents: 'none',
              }}
            />
            {children}
          </Box>
        ) : (
          <Stack alignItems="center" spacing={1} sx={{ color: 'text.disabled' }}>
            <InsertPhotoIcon
              sx={{ fontSize: 48, color: isDragActive ? 'primary.main' : 'inherit' }}
            />
            <Typography
              variant="body2"
              sx={{ color: isDragActive ? 'primary.main' : 'inherit', textAlign: 'center' }}
            >
              {isDragActive ? actionActiveText : placeholderText}
            </Typography>
          </Stack>
        )}
      </Box>
    </Card>
  );
}
