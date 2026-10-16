'use client';

import type { VideoCompressionFormat } from '../utils/video-compress-processor';

import { toast } from 'sonner';
import { useRef, useMemo, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import LinearProgress from '@mui/material/LinearProgress';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CompressRoundedIcon from '@mui/icons-material/CompressRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { VideoUploadWorkspace } from '../components/video-upload-workspace';
import {
  getQualityCrf,
  compressVideoWithFfmpeg,
  readVideoMetadataWithFfmpeg,
} from '../utils/video-quality-compress-processor';
import {
  compressVideo,
  readVideoMetadata,
  getCompressionSettings,
  estimateCompressedBytes,
  getCompressionPreviewWindow,
} from '../utils/video-compress-processor';

type LoadedVideo = {
  file: File;
  url: string;
  duration: number;
  width: number;
  height: number;
  playable: boolean;
};
type EncodedVideo = {
  url: string;
  size: number;
  extension: 'mp4' | 'webm';
  hasAudio: boolean | null;
};
const VIDEO_INPUT_ACCEPT =
  'video/*,.mp4,.webm,.mov,.m4v,.mkv,.avi,.flv,.mpeg,.mpg,.ogv,.3gp,.ts,.mts,.wmv';

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && 'message' in error) return String(error.message);
  if (typeof error === 'string') return error;
  return fallback;
}

export function VideoMasterCompressView() {
  const inputRef = useRef<HTMLInputElement>(null);
  const fileLoadTokenRef = useRef(0);
  const previewAbortRef = useRef<AbortController | null>(null);
  const exportAbortRef = useRef<AbortController | null>(null);
  const [source, setSource] = useState<LoadedVideo | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [strength, setStrength] = useState(50);
  const [mode, setMode] = useState<'fast' | 'quality'>('fast');
  const [outputFormat, setOutputFormat] = useState<VideoCompressionFormat>('auto');
  const [preview, setPreview] = useState<EncodedVideo | null>(null);
  const [result, setResult] = useState<EncodedVideo | null>(null);
  const [previewProgress, setPreviewProgress] = useState<number | null>(null);
  const [exportProgress, setExportProgress] = useState<number | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const settings = useMemo(
    () => (source ? getCompressionSettings(source.width, source.height, strength) : null),
    [source, strength]
  );

  useEffect(() => {
    if (!source || !settings) return undefined;
    const controller = new AbortController();
    previewAbortRef.current = controller;
    setPreview(null);
    setPreviewError(null);
    setPreviewProgress(null);
    if (mode === 'quality') {
      return () => controller.abort();
    }
    const timer = window.setTimeout(async () => {
      setPreviewProgress(0);
      try {
        const encoded = await compressVideo(source.url, settings, {
          duration: source.duration,
          preview: true,
          format: outputFormat,
          signal: controller.signal,
          onProgress: setPreviewProgress,
        });
        if (controller.signal.aborted) return;
        setPreview({
          url: URL.createObjectURL(encoded.blob),
          size: encoded.blob.size,
          extension: encoded.extension,
          hasAudio: encoded.hasAudio,
        });
      } catch (error) {
        if (!controller.signal.aborted) {
          setPreviewError(errorMessage(error, '미리보기를 만들지 못했습니다.'));
        }
      } finally {
        if (!controller.signal.aborted) setPreviewProgress(null);
      }
    }, 450);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [source, settings, outputFormat, mode]);

  const handleQualityPreview = async () => {
    if (!source) return;
    previewAbortRef.current?.abort();
    const controller = new AbortController();
    previewAbortRef.current = controller;
    setPreview(null);
    setPreviewError(null);
    setPreviewProgress(0);
    try {
      const encoded = await compressVideoWithFfmpeg(source.file, {
        duration: source.duration,
        strength,
        format: outputFormat === 'mp4' ? 'mp4' : 'webm',
        preview: true,
        signal: controller.signal,
        onProgress: setPreviewProgress,
      });
      if (controller.signal.aborted) return;
      setPreview({
        url: URL.createObjectURL(encoded.blob),
        size: encoded.blob.size,
        extension: encoded.extension,
        hasAudio: encoded.hasAudio,
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        setPreviewError(errorMessage(error, '미리보기를 만들지 못했습니다.'));
      }
    } finally {
      if (!controller.signal.aborted) setPreviewProgress(null);
    }
  };

  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source.url);
    },
    [source]
  );
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview.url);
    },
    [preview]
  );
  useEffect(
    () => () => {
      if (result) URL.revokeObjectURL(result.url);
    },
    [result]
  );
  useEffect(
    () => () => {
      fileLoadTokenRef.current += 1;
      previewAbortRef.current?.abort();
      exportAbortRef.current?.abort();
    },
    []
  );

  const handleFile = async (file: File) => {
    const token = ++fileLoadTokenRef.current;
    previewAbortRef.current?.abort();
    exportAbortRef.current?.abort();
    setSource(null);
    setPreview(null);
    setResult(null);
    setExportProgress(null);
    setIsLoadingFile(true);
    const url = URL.createObjectURL(file);
    try {
      let playable = true;
      const metadata = await readVideoMetadata(url).catch(async () => {
        playable = false;
        return readVideoMetadataWithFfmpeg(file);
      });
      if (token !== fileLoadTokenRef.current) {
        URL.revokeObjectURL(url);
        return;
      }
      if (!playable) {
        setMode('quality');
        setOutputFormat('mp4');
      }
      setSource({ file, url, playable, ...metadata });
    } catch (error) {
      URL.revokeObjectURL(url);
      if (token === fileLoadTokenRef.current) {
        toast.error(errorMessage(error, '동영상을 불러오지 못했습니다.'));
      }
    } finally {
      if (token === fileLoadTokenRef.current) setIsLoadingFile(false);
    }
  };

  const handleCompress = async () => {
    if (!source || !settings) return;
    exportAbortRef.current?.abort();
    const controller = new AbortController();
    exportAbortRef.current = controller;
    setResult(null);
    setExportProgress(0);
    try {
      const encoded =
        mode === 'quality'
          ? await compressVideoWithFfmpeg(source.file, {
              duration: source.duration,
              strength,
              format: outputFormat === 'mp4' ? 'mp4' : 'webm',
              signal: controller.signal,
              onProgress: setExportProgress,
            })
          : await compressVideo(source.url, settings, {
              duration: source.duration,
              format: outputFormat,
              signal: controller.signal,
              onProgress: setExportProgress,
            });
      if (controller.signal.aborted) return;
      setResult({
        url: URL.createObjectURL(encoded.blob),
        size: encoded.blob.size,
        extension: encoded.extension,
        hasAudio: encoded.hasAudio,
      });
      toast.success('동영상 압축이 완료되었습니다.');
    } catch (error) {
      if (!controller.signal.aborted) {
        toast.error(errorMessage(error, '동영상 압축에 실패했습니다.'));
      }
    } finally {
      if (!controller.signal.aborted) setExportProgress(null);
    }
  };

  const handleDownload = () => {
    if (!source || !result) return;
    const link = document.createElement('a');
    link.href = result.url;
    link.download = `${source.file.name.replace(/\.[^.]+$/, '')}_compressed.${result.extension}`;
    link.click();
  };

  const previewWindow = source ? getCompressionPreviewWindow(source.duration) : null;
  const estimatedBytes =
    source && settings && preview && previewWindow
      ? mode === 'quality'
        ? Math.round((preview.size / previewWindow.duration) * source.duration)
        : estimateCompressedBytes(source.duration, settings.bitrate, {
            size: preview.size,
            duration: previewWindow.duration,
            hasAudio: preview.hasAudio,
            extension: preview.extension,
          })
      : null;
  const estimatedChange =
    source && estimatedBytes !== null
      ? Math.round((1 - estimatedBytes / source.file.size) * 100)
      : null;

  return (
    <DashboardContent sx={{ pb: 3 }}>
      <input
        ref={inputRef}
        type="file"
        accept={VIDEO_INPUT_ACCEPT}
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
          event.target.value = '';
        }}
      />
      <Box
        sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            동영상 압축
          </Typography>
          <Typography variant="body2" color="text.secondary">
            압축량을 조절하고 실제 인코딩된 최대 3초 미리보기로 화질을 확인하세요.
          </Typography>
        </Box>
        {source && (
          <Button startIcon={<CloudUploadRoundedIcon />} onClick={() => inputRef.current?.click()}>
            다른 동영상 선택
          </Button>
        )}
      </Box>

      {!source ? (
        <Box>
          <VideoUploadWorkspace
            sampleVideos={[]}
            accept={VIDEO_INPUT_ACCEPT}
            onFileSelect={(file) => void handleFile(file)}
            title="압축할 동영상을 선택하세요"
            subtitle="MP4, WebM, MOV, MKV, AVI 등 동영상을 선택하세요."
            icon={<CompressRoundedIcon sx={{ fontSize: 44 }} />}
          />
          {isLoadingFile && (
            <Box sx={{ mt: 2 }}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                영상 정보를 읽는 중입니다. 브라우저에서 재생되지 않는 형식은 FFmpeg로 확인합니다.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gap: 2.5,
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 380px) 1fr' },
          }}
        >
          <Card sx={{ p: 3, alignSelf: 'start' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
              압축 설정
            </Typography>
            <Typography variant="body2" noWrap title={source.file.name}>
              {source.file.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatSize(source.file.size)} · {source.width} × {source.height} ·{' '}
              {source.duration.toFixed(1)}초
            </Typography>

            <Box sx={{ mt: 3 }}>
              <ToggleButtonGroup
                fullWidth
                exclusive
                size="small"
                value={mode}
                disabled={exportProgress !== null || previewProgress !== null}
                onChange={(_, value: 'fast' | 'quality' | null) => {
                  if (!value || (value === 'fast' && !source.playable)) return;
                  setMode(value);
                  setOutputFormat(value === 'quality' ? 'mp4' : 'auto');
                  setResult(null);
                }}
                sx={{ mb: 2 }}
              >
                <ToggleButton value="fast" disabled={!source.playable}>빠른 압축</ToggleButton>
                <ToggleButton value="quality">고화질 압축 (CRF)</ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                {mode === 'quality'
                  ? 'FFmpeg WASM으로 원본 해상도를 유지하며 압축합니다. 인코딩에 시간이 오래 걸릴 수 있습니다.'
                  : '브라우저 인코더로 재생 속도에 맞춰 압축합니다.'}
              </Typography>
              {!source.playable && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  이 형식은 브라우저에서 재생되지 않아 FFmpeg 고화질 압축으로 처리합니다.
                </Alert>
              )}
              <FormControl size="small" fullWidth sx={{ mb: 3 }}>
                <InputLabel>출력 형식</InputLabel>
                <Select
                  value={outputFormat}
                  label="출력 형식"
                  onChange={(event) => {
                    setOutputFormat(event.target.value as VideoCompressionFormat);
                    setPreview(null);
                    setResult(null);
                  }}
                  disabled={exportProgress !== null || previewProgress !== null}
                >
                  {mode === 'fast' && <MenuItem value="auto">자동 (브라우저 지원 형식)</MenuItem>}
                  <MenuItem value="mp4">{mode === 'quality' ? 'MP4 · H.264 (권장)' : 'MP4'}</MenuItem>
                  <MenuItem value="webm">{mode === 'quality' ? 'WebM · VP8' : 'WebM'}</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="subtitle2">압축량</Typography>
                <Chip size="small" color="primary" label={`${strength}%`} />
              </Box>
              <Slider
                value={strength}
                min={0}
                max={100}
                step={5}
                marks={[
                  { value: 0, label: '고화질' },
                  { value: 50, label: '균형' },
                  { value: 100, label: '작은 파일' },
                ]}
                onChange={(_, value) => {
                  setStrength(value as number);
                  setPreview(null);
                  setResult(null);
                }}
                disabled={exportProgress !== null || previewProgress !== null}
                aria-label="동영상 압축량"
                sx={{ mb: 2 }}
              />
              {settings && mode === 'fast' && (
                <Typography variant="body2" color="text.secondary">
                  출력 {settings.width} × {settings.height} · 목표 영상 비트레이트{' '}
                  {(settings.bitrate / 1_000_000).toFixed(2)} Mbps
                </Typography>
              )}
              {mode === 'quality' && (
                <Typography variant="body2" color="text.secondary">
                  원본 해상도 유지 · CRF {getQualityCrf(strength, outputFormat === 'mp4' ? 'mp4' : 'webm')}
                  {' · '}값이 낮을수록 화질이 높습니다.
                </Typography>
              )}
              {mode === 'quality' && (
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => void handleQualityPreview()}
                  disabled={previewProgress !== null || exportProgress !== null}
                  sx={{ mt: 2 }}
                >
                  {preview ? '미리보기 다시 만들기' : '고화질 미리보기 만들기'}
                </Button>
              )}
              {estimatedBytes !== null && estimatedChange !== null && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2">예상 최종 파일 크기</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.5 }}>
                    약 {formatSize(estimatedBytes)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    원본 대비 약 {Math.abs(estimatedChange)}%{' '}
                    {estimatedChange > 0 ? '감소' : estimatedChange < 0 ? '증가' : '변화 없음'}
                    {' · '}약 {formatSize(Math.abs(source.file.size - estimatedBytes))}{' '}
                    {estimatedChange > 0 ? '절감' : estimatedChange < 0 ? '증가' : '차이'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    압축 미리보기 실측 기준 ·{' '}
                    {mode === 'quality'
                      ? '영상과 오디오가 포함된 실제 인코딩 기준'
                      : preview?.hasAudio === false ? '무음 영상 기준' : '오디오 128 kbps 포함 추정'}
                  </Typography>
                </Box>
              )}
              {estimatedBytes === null && (
                <Box sx={{ mt: 2, p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                  <Typography variant="subtitle2">예상 최종 파일 크기</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {previewError
                      ? '미리보기를 만들 수 없어 예상 크기를 계산하지 못했습니다.'
                      : mode === 'quality'
                        ? '미리보기를 만들면 예상 크기를 계산합니다.'
                        : '압축 미리보기에서 계산 중...'}
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                실제 파일 크기는 영상 내용과 인코더에 따라 달라질 수 있습니다.
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<CompressRoundedIcon />}
              onClick={() => void handleCompress()}
              disabled={exportProgress !== null || previewProgress !== null}
              sx={{ mt: 3 }}
            >
              {exportProgress !== null ? '압축 중...' : '동영상 압축하기'}
            </Button>
            {exportProgress !== null && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={exportProgress} />
                <Typography variant="caption">{exportProgress}% 완료</Typography>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => {
                    exportAbortRef.current?.abort();
                    setExportProgress(null);
                  }}
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  취소
                </Button>
              </Box>
            )}
            {result && (
              <Box sx={{ mt: 2 }}>
                <Alert
                  severity={result.size < source.file.size ? 'success' : 'info'}
                  sx={{ mb: 1.5 }}
                >
                  결과 {formatSize(result.size)} · 원본 대비{' '}
                  {Math.abs(Math.round((1 - result.size / source.file.size) * 100))}%{' '}
                  {result.size < source.file.size
                    ? '감소'
                    : result.size > source.file.size
                      ? '증가'
                      : '변화 없음'}
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<DownloadRoundedIcon />}
                  onClick={handleDownload}
                >
                  압축 파일 다운로드 (.{result.extension})
                </Button>
              </Box>
            )}
          </Card>

          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              alignItems: 'start',
            }}
          >
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                원본
              </Typography>
              {source.playable ? (
                <Box
                  component="video"
                  src={source.url}
                  controls
                  muted
                  playsInline
                  onLoadedMetadata={(event: React.SyntheticEvent<HTMLVideoElement>) => {
                    event.currentTarget.currentTime = previewWindow?.start || 0;
                  }}
                  sx={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    bgcolor: '#000',
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box sx={{ aspectRatio: '16 / 9', bgcolor: '#0f172a', color: 'white', display: 'grid', placeItems: 'center', p: 2, textAlign: 'center' }}>
                  <Typography variant="body2">브라우저에서 원본을 재생할 수 없습니다.</Typography>
                </Box>
              )}
              <Typography variant="caption" color="text.secondary">
                {formatSize(source.file.size)} · {source.width} × {source.height}
              </Typography>
            </Card>
            <Card sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                압축 화질 미리보기
              </Typography>
              {preview ? (
                <Box
                  component="video"
                  key={preview.url}
                  src={preview.url}
                  controls
                  muted
                  loop
                  playsInline
                  sx={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    bgcolor: '#000',
                    objectFit: 'contain',
                    borderRadius: 1,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    bgcolor: '#0f172a',
                    borderRadius: 1,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'white',
                    px: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="body2">
                    {previewError ||
                      (previewProgress !== null
                        ? `실제 압축 미리보기 생성 중... ${previewProgress}%`
                        : mode === 'quality' ? '버튼을 눌러 고화질 미리보기를 만드세요.' : '미리보기 준비 중...')}
                  </Typography>
                </Box>
              )}
              {previewProgress !== null && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress variant="determinate" value={previewProgress} />
                  {mode === 'quality' && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => {
                        previewAbortRef.current?.abort();
                        setPreviewProgress(null);
                      }}
                    >
                      미리보기 취소
                    </Button>
                  )}
                </Box>
              )}
              <Typography variant="caption" color="text.secondary">
                {preview
                  ? `동일한 설정으로 인코딩한 최대 3초 구간 · ${formatSize(preview.size)}`
                  : mode === 'quality'
                    ? '설정을 바꾸면 미리보기를 다시 만들어야 합니다.'
                    : '설정을 바꾸면 미리보기를 다시 만듭니다.'}
              </Typography>
            </Card>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
