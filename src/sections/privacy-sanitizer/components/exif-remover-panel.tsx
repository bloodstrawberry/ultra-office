'use client';

import type { ExifReport } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';

import { inspectExif, sanitizeImageExif } from '../utils/privacy-utils';

// ----------------------------------------------------------------------

export function ExifRemoverPanel() {
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [exifReport, setExifReport] = useState<ExifReport | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cleanedBlob, setCleanedBlob] = useState<Blob | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (!uploaded) return;

    setFile(uploaded);
    setImagePreview(URL.createObjectURL(uploaded));
    setCleanedBlob(null);

    const report = await inspectExif(uploaded);
    setExifReport(report);
    toast.info('사진 메타데이터 분석 완료');
  };

  const handlePurgeExif = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const blob = await sanitizeImageExif(file);
      setCleanedBlob(blob);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sanitized_${file.name.replace(/\.[^/.]+$/, '')}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('GPS 및 모든 EXIF 메타데이터가 영구 삭제된 사진이 다운로드되었습니다.');
    } catch {
      toast.error('메타데이터 파기 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
      {/* 1. Upload & Inspection Report */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
          사진 메타데이터(EXIF / GPS) 검사
        </Typography>

        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileRoundedIcon />}
          sx={{ fontWeight: 700 }}
        >
          검사할 사진(JPG/PNG) 업로드
          <input type="file" hidden accept="image/*" onChange={handleFileUpload} />
        </Button>

        {exifReport ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="warning" icon={<LocationOnRoundedIcon />}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                촬영 위치 및 기기 정보가 포함되어 있을 수 있습니다.
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                SNS, 블로그, 외부 거래처에 사진을 공유하기 전 EXIF를 세척하면 집/직장 위치 유출을
                방지할 수 있습니다.
              </Typography>
            </Alert>

            <Card
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                bgcolor: 'background.neutral',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  위치 정보 (GPS):
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'error.main' }}>
                  {exifReport.gpsCoordinates}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  촬영 기기:
                </Typography>
                <Typography variant="caption">{exifReport.cameraModel}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  촬영 일시:
                </Typography>
                <Typography variant="caption">{exifReport.dateTime}</Typography>
              </Box>
            </Card>

            <Button
              variant="contained"
              color="success"
              size="large"
              startIcon={<ShieldRoundedIcon />}
              onClick={handlePurgeExif}
              disabled={isProcessing}
              sx={{ fontWeight: 800 }}
            >
              {isProcessing ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                '메타데이터 100% 완전 파기 및 저장'
              )}
            </Button>
          </Box>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}>
            사진을 업로드하면 촬영 위치(GPS) 및 카메라 정보 유출 여부를 점검합니다.
          </Typography>
        )}
      </Card>

      {/* 2. Photo Preview */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.neutral',
          minHeight: 380,
        }}
      >
        {imagePreview ? (
          <Box
            sx={{
              maxWidth: '100%',
              maxHeight: 360,
              borderRadius: 1.5,
              overflow: 'hidden',
              boxShadow: 2,
            }}
          >
            <img
              src={imagePreview}
              alt="Preview"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Box>
        ) : (
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            사진 미리보기가 여기에 표시됩니다.
          </Typography>
        )}
      </Card>
    </Box>
  );
}
