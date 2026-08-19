'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ArchiveRoundedIcon from '@mui/icons-material/ArchiveRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import { SafeNumberInput } from '../components/safe-number-input';
import { downloadZipFile, type ZipFileEntry } from '../utils/zip-exporter';
import {
  downloadDataUrl,
  shareToKakaoTalk,
  cropAndResizeThumbnail,
} from '../utils/image-processor';
import {
  type CropSettings,
  getVerticalCropSettings,
  saveVerticalCropSettings,
  DEFAULT_VERTICAL_SETTINGS,
} from '../utils/thumbnail-storage';

interface UploadedFile {
  id: string;
  name: string;
  src: string;
  resultUrl?: string;
}

export function SeroView() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [cropSettings, setCropSettings] = useState<CropSettings>(DEFAULT_VERTICAL_SETTINGS);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getVerticalCropSettings().then((saved) => {
      setCropSettings(saved);
      setIsLoaded(true);
    });
  }, []);

  const updateCropSettings = (newSettings: CropSettings) => {
    setCropSettings(newSettings);
    if (isLoaded) {
      saveVerticalCropSettings(newSettings);
    }
  };

  const processBatch = useCallback(async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const updatedFiles = await Promise.all(
        files.map(async (file) => {
          const resultUrl = await cropAndResizeThumbnail(
            file.src,
            cropSettings.width,
            cropSettings
          );
          return { ...file, resultUrl };
        })
      );
      setFiles(updatedFiles);
    } catch {
      toast.error('세로 썸네일 일괄 변환 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  }, [files, cropSettings]);

  useEffect(() => {
    if (files.length > 0) {
      const timer = setTimeout(() => {
        processBatch();
      }, 150);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [
    files.length,
    cropSettings.width,
    cropSettings.height,
    cropSettings.x,
    cropSettings.y,
    processBatch,
  ]);

  const addFiles = useCallback((selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    const newUploadedFiles: UploadedFile[] = [];
    let count = 0;

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const src = evt.target?.result as string;
        if (src) {
          newUploadedFiles.push({
            id: Math.random().toString(36).substring(2, 9),
            name: file.name,
            src,
          });
        }
        count += 1;
        if (count === selectedFiles.length) {
          setFiles((prev) => [...prev, ...newUploadedFiles]);
          toast.success(`${newUploadedFiles.length}개 이미지가 추가되었습니다.`);
        }
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const { isDragActive, getRootProps } = useImageDropPaste({
    onFiles: addFiles,
    multiple: true,
  });

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    addFiles(selectedFiles);
    if (e.target) e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const handleResetSettings = () => {
    updateCropSettings(DEFAULT_VERTICAL_SETTINGS);
    toast.info('기본값(636x1048)으로 복원되었습니다.');
  };

  const handleSingleDownload = async (file: UploadedFile) => {
    if (!file.resultUrl) return;
    const filename = `sero_${cropSettings.width}x${cropSettings.height}_${file.name}.png`;
    const res = await downloadDataUrl(file.resultUrl, filename);
    toast.success(res.message);
  };

  const handleBatchDownload = async () => {
    if (files.length === 0) return;
    const readyItems = files.filter((f) => f.resultUrl);
    if (readyItems.length === 0) return;

    setIsProcessing(true);
    try {
      const entries: ZipFileEntry[] = readyItems.map((f, idx) => ({
        filename: `sero_${cropSettings.width}x${cropSettings.height}_${idx + 1}_${f.name}.png`,
        data: f.resultUrl!,
      }));

      await downloadZipFile(`sero_thumbnails_${Date.now()}.zip`, entries);
      toast.success(`${readyItems.length}장 일괄 ZIP 다운로드 완료!`);
    } catch {
      toast.error('ZIP 다운로드 중 오류 발생');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async (file: UploadedFile) => {
    if (!file.resultUrl) return;
    try {
      const res = await shareToKakaoTalk(file.resultUrl, '세로 썸네일', `sero_${file.name}.png`);
      toast.success(res.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    }
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          세로형 썸네일 일괄 생성기 (Vertical 636×1048)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          스마트폰/숏폼/스토리 규격 세로 썸네일을 여러 장의 사진에서 동일한 영역으로 고속 일괄
          생성합니다.
        </Typography>
      </Box>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFilesSelect}
        style={{ display: 'none' }}
      />

      {files.length === 0 ? (
        <Card
          {...getRootProps({
            onClick: () => fileInputRef.current?.click(),
          })}
          sx={{
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
            borderRadius: 3,
            minHeight: 320,
            transition: (theme) => theme.transitions.create(['border-color', 'background-color']),
            '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'primary.lighter',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <PhoneAndroidRoundedIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            세로 썸네일로 변환할 사진들 업로드
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            다중 선택으로 여러 장을 한 번에 올릴 수 있습니다
          </Typography>
          <Button variant="contained" color="primary" startIcon={<CloudUploadRoundedIcon />}>
            사진 선택하기
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' }, gap: 3 }}>
          {/* Left: Options & Sliders */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  출력 해상도 (px)
                </Typography>
                <Button size="small" onClick={handleResetSettings}>
                  기본값 복원
                </Button>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <SafeNumberInput
                  min={10}
                  max={4096}
                  value={cropSettings.width}
                  fallbackValue={DEFAULT_VERTICAL_SETTINGS.width}
                  onChangeValue={(val) => updateCropSettings({ ...cropSettings, width: val })}
                  style={{
                    width: 68,
                    textAlign: 'center',
                    fontWeight: 800,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                  }}
                />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  ×
                </Typography>
                <SafeNumberInput
                  min={10}
                  max={4096}
                  value={cropSettings.height}
                  fallbackValue={DEFAULT_VERTICAL_SETTINGS.height}
                  onChangeValue={(val) => updateCropSettings({ ...cropSettings, height: val })}
                  style={{
                    width: 68,
                    textAlign: 'center',
                    fontWeight: 800,
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #cbd5e1',
                  }}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  px
                </Typography>
              </Box>

              {/* Sliders */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    가로 시작 위치 (X)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {cropSettings.x}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={1000}
                  value={cropSettings.x}
                  onChange={(_, v) => updateCropSettings({ ...cropSettings, x: v as number })}
                />
              </Box>

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    세로 시작 위치 (Y)
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {cropSettings.y}px
                  </Typography>
                </Box>
                <Slider
                  size="small"
                  min={0}
                  max={1000}
                  value={cropSettings.y}
                  onChange={(_, v) => updateCropSettings({ ...cropSettings, y: v as number })}
                />
              </Box>
            </Card>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<CloudUploadRoundedIcon />}
                sx={{ flex: 1, py: 1.2, borderRadius: 2 }}
              >
                + 사진 추가
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={handleBatchDownload}
                disabled={isProcessing || files.length === 0}
                startIcon={<ArchiveRoundedIcon />}
                sx={{ flex: 1.5, py: 1.2, borderRadius: 2, fontWeight: 800 }}
              >
                전체 ZIP 다운로드
              </Button>
            </Box>
          </Box>

          {/* Right: Results Grid */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 2.5, borderRadius: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  변환 결과 ({files.length}장)
                </Typography>
                <Button size="small" color="error" onClick={() => setFiles([])}>
                  전체 삭제
                </Button>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  maxHeight: 480,
                  overflowY: 'auto',
                }}
              >
                {files.map((file, idx) => (
                  <Box
                    key={file.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      position: 'relative',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexGrow: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, width: 24 }}>
                        #{idx + 1}
                      </Typography>

                      <Box
                        sx={{
                          width: 64,
                          aspectRatio: '636/1048',
                          borderRadius: 1.5,
                          overflow: 'hidden',
                          bgcolor: '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {file.resultUrl ? (
                          <img
                            src={file.resultUrl}
                            alt={file.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <CircularProgress size={18} />
                        )}
                      </Box>

                      <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        {file.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleSingleDownload(file)}
                      >
                        <DownloadRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="secondary" onClick={() => handleShare(file)}>
                        <ShareRoundedIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveFile(file.id)}
                      >
                        <DeleteRoundedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
