'use client';

import type { Theme, SxProps } from '@mui/material/styles';

import React, { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import MovieRoundedIcon from '@mui/icons-material/MovieRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { type SampleVideoItem, DEFAULT_VIDEO_SAMPLES } from '../data/video-samples';

// ----------------------------------------------------------------------

export interface VideoUploadWorkspaceProps {
  sampleVideos?: SampleVideoItem[];
  onSelectSample?: (sample: SampleVideoItem) => void | Promise<void>;
  onFileSelect: (file: File) => void;
  onMultipleFilesSelect?: (files: File[]) => void;
  multiple?: boolean;
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

export function VideoUploadWorkspace({
  sampleVideos = DEFAULT_VIDEO_SAMPLES,
  onSelectSample,
  onFileSelect,
  onMultipleFilesSelect,
  multiple = false,
  title = '동영상 업로드',
  subtitle = '동영상 파일을 드래그하거나 컴퓨터에서 선택하세요. (모든 작업은 브라우저 로컬에서 안전하게 처리됩니다)',
  sampleTitle = '⚡ 즉석 테스트 샘플 동영상',
  sampleSubtitle = '클릭 한 번으로 고품질 예제 영상을 즉시 테스트해 보세요.',
  sampleActionLabel = '체험하기 ➜',
  icon,
  buttonText = '동영상 선택하기',
  accept = 'video/*',
  sx,
}: VideoUploadWorkspaceProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingSampleId, setLoadingSampleId] = useState<string | null>(null);

  const handleFiles = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const videoFiles = files.filter(
        (f) => f.type.startsWith('video/') || /\.(mp4|webm|mov|mkv|avi|m4v|flv)$/i.test(f.name)
      );
      if (videoFiles.length === 0) return;

      if (multiple && onMultipleFilesSelect) {
        onMultipleFilesSelect(videoFiles);
      } else if (videoFiles[0]) {
        onFileSelect(videoFiles[0]);
      }
    },
    [multiple, onFileSelect, onMultipleFilesSelect]
  );

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: handleFiles,
    multiple,
    accept: ['video/*', '.mp4', '.webm', '.mov', '.mkv', '.avi', '.m4v', '.flv'],
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    e.target.value = '';
  };

  const handleSampleClick = async (sample: SampleVideoItem) => {
    if (loadingSampleId) return;
    setLoadingSampleId(sample.id);

    try {
      if (onSelectSample) {
        await onSelectSample(sample);
      } else {
        const file = await sample.generate();
        handleFiles([file]);
      }
    } catch {
      // Error handled by caller
    } finally {
      setLoadingSampleId(null);
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
        multiple={multiple}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* 1. Sample Videos Section - Pinned to Top */}
      {sampleVideos && sampleVideos.length > 0 && (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, flexShrink: 0 }}>
          <Box
            sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              {sampleTitle}
            </Typography>
            <Chip
              size="small"
              label={`${sampleVideos.length}개 예제 지원`}
              color="primary"
              variant="soft"
              sx={{ fontWeight: 700, fontSize: '0.725rem', height: 22 }}
            />
          </Box>

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
                sm: `repeat(${Math.min(sampleVideos.length, 2)}, 1fr)`,
                md: `repeat(${Math.min(sampleVideos.length, 4)}, 1fr)`,
              },
              gap: 1.5,
            }}
          >
            {sampleVideos.map((sample) => {
              const isLoading = loadingSampleId === sample.id;

              return (
                <Card
                  key={sample.id}
                  onClick={() => handleSampleClick(sample)}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    cursor: isLoading ? 'default' : 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'action.hover',
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  {/* Thumbnail / SVG Poster */}
                  <Box
                    sx={{
                      width: 58,
                      height: 54,
                      borderRadius: 1,
                      overflow: 'hidden',
                      flexShrink: 0,
                      position: 'relative',
                      bgcolor: '#0f172a',
                    }}
                  >
                    <Box
                      component="img"
                      src={sample.thumbnailSvg}
                      alt={sample.label}
                      sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                    {sample.duration && (
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 2,
                          right: 2,
                          px: 0.5,
                          py: 0.1,
                          borderRadius: 0.5,
                          bgcolor: 'rgba(0,0,0,0.75)',
                          color: '#ffffff',
                          fontSize: '0.625rem',
                          fontFamily: 'monospace',
                          fontWeight: 700,
                        }}
                      >
                        {sample.duration}
                      </Box>
                    )}
                  </Box>

                  {/* Info */}
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                      noWrap
                    >
                      {sample.label}
                    </Typography>
                    {sample.subLabel && (
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', display: 'block', fontSize: '0.725rem' }}
                        noWrap
                      >
                        {sample.subLabel}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                      {isLoading ? (
                        <>
                          <CircularProgress size={12} color="primary" />
                          <Typography
                            variant="caption"
                            sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.725rem' }}
                          >
                            생성 중...
                          </Typography>
                        </>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'primary.main',
                            fontWeight: 700,
                            display: 'block',
                            fontSize: '0.725rem',
                          }}
                        >
                          {sampleActionLabel}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Card>
              );
            })}
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
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: 'primary.lighter',
            color: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          {icon || <MovieRoundedIcon sx={{ fontSize: 38 }} />}
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.75, textAlign: 'center' }}>
          {title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            mb: 2.5,
            textAlign: 'center',
            maxWidth: 520,
            lineHeight: 1.5,
          }}
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
