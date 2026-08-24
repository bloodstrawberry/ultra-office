'use client';

import React, { useRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

// ----------------------------------------------------------------------

export interface SampleImageItem {
  id: string;
  label: string;
  url: string;
  subLabel?: string;
  tag?: string;
}

export interface PhotoUploadWorkspaceProps {
  sampleImages?: SampleImageItem[];
  onSelectSample?: (url: string) => void;
  onFileSelect: (file: File) => void;
  title?: string;
  subtitle?: string;
  sampleTitle?: string;
  sampleSubtitle?: string;
  sampleActionLabel?: string;
  icon?: React.ReactNode;
  buttonText?: string;
  accept?: string;
  sx?: SxProps<Theme>;
}

export function PhotoUploadWorkspace({
  sampleImages,
  onSelectSample,
  onFileSelect,
  title = '이미지 업로드',
  subtitle = '이미지를 드래그하거나 클립보드(Ctrl+V)에서 붙여넣으세요.',
  sampleTitle = '⚡ 즉석 테스트 샘플 이미지',
  sampleSubtitle = '클릭 한 번으로 즉시 테스트해 보세요.',
  sampleActionLabel = '체험하기 ➜',
  icon,
  buttonText = '사진 선택하기',
  accept = 'image/*',
  sx,
}: PhotoUploadWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) {
        onFileSelect(files[0]);
      }
    },
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
      e.target.value = '';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2, sm: 2.5 },
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
        ...sx,
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* 1. Sample Images Section - Pinned to Top */}
      {sampleImages && sampleImages.length > 0 && (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, flexShrink: 0 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
            {sampleTitle}
          </Typography>
          {sampleSubtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
              {sampleSubtitle}
            </Typography>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: `repeat(${Math.min(sampleImages.length, 3)}, 1fr)`,
                md: `repeat(${Math.min(sampleImages.length, 4)}, 1fr)`,
              },
              gap: 1.5,
            }}
          >
            {sampleImages.map((sample) => (
              <Card
                key={sample.id}
                onClick={() => onSelectSample?.(sample.url)}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  component="img"
                  src={sample.url}
                  alt={sample.label}
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 1.5,
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }} noWrap>
                    {sample.label}
                  </Typography>
                  {sample.subLabel && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block' }}
                      noWrap
                    >
                      {sample.subLabel}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    sx={{ color: 'primary.main', fontWeight: 700, mt: 0.25, display: 'block' }}
                  >
                    {sampleActionLabel}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
        </Card>
      )}

      {/* 2. Drag & Drop Upload Zone - Fills Remaining Height */}
      <Card
        {...getRootProps({
          onClick: () => fileInputRef.current?.click(),
        })}
        sx={{
          p: { xs: 3, md: 5 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'divider',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          borderRadius: 3,
          flex: '1 1 auto',
          minHeight: 180,
          transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
          '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
        }}
      >
        <Box
          sx={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {icon || <AddPhotoAlternateRoundedIcon sx={{ fontSize: 36 }} />}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', mb: 2.5, textAlign: 'center', maxWidth: 460 }}
        >
          {subtitle}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<CloudUploadRoundedIcon />}
          sx={{ px: 3.5, py: 1.2, fontWeight: 700, borderRadius: 2 }}
        >
          {buttonText}
        </Button>
      </Card>
    </Box>
  );
}
