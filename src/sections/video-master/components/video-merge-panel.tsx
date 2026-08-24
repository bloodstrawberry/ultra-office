'use client';

import type { MergeClipItem } from '../types';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CallMergeRoundedIcon from '@mui/icons-material/CallMergeRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import { formatTime, formatBytes } from '../utils/audio-processor';

// ----------------------------------------------------------------------

export function VideoMergePanel() {
  const [clips, setClips] = useState<MergeClipItem[]>([]);
  const [isMerging, setIsMerging] = useState<boolean>(false);
  const [mergeProgress, setMergeProgress] = useState<number>(0);
  const [mergedBlobUrl, setMergedBlobUrl] = useState<string | null>(null);

  const handleAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const tempVideo = document.createElement('video');
      tempVideo.src = url;
      tempVideo.onloadedmetadata = () => {
        setClips((prev) => [
          ...prev,
          {
            id: `clip-${Date.now()}-${Math.random()}`,
            file,
            name: file.name,
            size: file.size,
            duration: tempVideo.duration || 0,
            previewUrl: url,
          },
        ]);
      };
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setClips((prev) => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === clips.length - 1) return;
    setClips((prev) => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleDelete = (index: number) => {
    setClips((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMergeVideos = async () => {
    if (clips.length < 2) {
      toast.error('병합할 영상을 2개 이상 추가해 주세요.');
      return;
    }

    setIsMerging(true);
    setMergeProgress(0);
    setMergedBlobUrl(null);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas 생성 실패');

      const stream = canvas.captureStream(30);
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, { mimeType });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.start(100);

      const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);
      let processedDuration = 0;

      for (let i = 0; i < clips.length; i += 1) {
        const clip = clips[i];
        await playAndRecordClip(clip.previewUrl, ctx, canvas.width, canvas.height, (currentSec) => {
          const currentTotal = processedDuration + currentSec;
          const pct = Math.min(99, Math.round((currentTotal / (totalDuration || 1)) * 100));
          setMergeProgress(pct);
        });
        processedDuration += clip.duration;
      }

      await new Promise((resolve) => setTimeout(resolve, 300));
      mediaRecorder.stop();

      await new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => {
          const resultBlob = new Blob(chunks, { type: mimeType });
          const url = URL.createObjectURL(resultBlob);
          setMergedBlobUrl(url);
          setMergeProgress(100);
          resolve();
        };
      });

      toast.success('모든 영상이 성공적으로 병합되었습니다!');
    } catch {
      toast.error('동영상 병합 중 오류가 발생했습니다.');
    } finally {
      setIsMerging(false);
    }
  };

  const playAndRecordClip = (
    url: string,
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    onProgress: (sec: number) => void
  ): Promise<void> =>
    new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = url;
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.play();

        const drawLoop = () => {
          if (video.ended || video.paused) {
            resolve();
            return;
          }

          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, w, h);

          // Draw fit contain
          const scale = Math.min(w / video.videoWidth, h / video.videoHeight);
          const dw = video.videoWidth * scale;
          const dh = video.videoHeight * scale;
          const dx = (w - dw) / 2;
          const dy = (h - dh) / 2;
          ctx.drawImage(video, dx, dy, dw, dh);

          onProgress(video.currentTime);
          requestAnimationFrame(drawLoop);
        };

        requestAnimationFrame(drawLoop);
      };
    });

  const handleDownloadMerged = () => {
    if (!mergedBlobUrl) return;
    const link = document.createElement('a');
    link.href = mergedBlobUrl;
    link.download = `merged_video_${Date.now()}.webm`;
    link.click();
    toast.success('병합된 비디오 파일이 다운로드되었습니다.');
  };

  const totalDuration = clips.reduce((acc, c) => acc + c.duration, 0);

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CallMergeRoundedIcon color="primary" />
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          다중 비디오 클립 병합 (Video Merger)
        </Typography>
      </Box>

      {/* Upload button */}
      <Button
        variant="outlined"
        component="label"
        startIcon={<CloudUploadRoundedIcon />}
        sx={{ borderStyle: 'dashed', py: 2 }}
      >
        병합할 동영상 파일 추가하기 (여러 개 선택 가능)
        <input
          type="file"
          hidden
          multiple
          accept="video/*"
          onChange={(e) => handleAddFiles(e.target.files)}
        />
      </Button>

      {/* Clip List */}
      {clips.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              병합 대기 목록 ({clips.length}개 클립)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              총 예상 길이: {formatTime(totalDuration)}
            </Typography>
          </Box>

          <List sx={{ bgcolor: 'background.neutral', borderRadius: 1.5, p: 1 }}>
            {clips.map((clip, index) => (
              <ListItem
                key={clip.id}
                sx={{
                  bgcolor: 'background.paper',
                  mb: 1,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: 'primary.main', minWidth: 20 }}
                >
                  #{index + 1}
                </Typography>

                <ListItemText
                  primary={clip.name}
                  secondary={`${formatBytes(clip.size)} · ${formatTime(clip.duration)}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600, noWrap: true }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUpwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === clips.length - 1}
                  >
                    <ArrowDownwardRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(index)}>
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>

          <Button
            variant="contained"
            startIcon={<CallMergeRoundedIcon />}
            onClick={handleMergeVideos}
            disabled={isMerging || clips.length < 2}
          >
            {isMerging
              ? `영상 병합 중... (${mergeProgress}%)`
              : `총 ${clips.length}개 영상 하나로 병합하기`}
          </Button>

          {isMerging && (
            <LinearProgress
              variant="determinate"
              value={mergeProgress}
              sx={{ height: 6, borderRadius: 1 }}
            />
          )}
        </Box>
      )}

      {/* Merged Video Result */}
      {mergedBlobUrl && (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            병합 완료 미리보기
          </Typography>

          <video
            controls
            src={mergedBlobUrl}
            style={{ width: '100%', maxHeight: 300, borderRadius: 8, backgroundColor: '#000000' }}
          />

          <Button
            variant="contained"
            color="success"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleDownloadMerged}
          >
            병합된 영상 다운로드 (.webm)
          </Button>
        </Box>
      )}
    </Card>
  );
}
