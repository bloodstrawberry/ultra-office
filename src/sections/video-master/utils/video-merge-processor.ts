/**
 * Multi-Video Merging & Sequential Encoding Engine
 * Supports multi-clip canvas concatenation, seamless sequence playback,
 * Web Audio API audio chaining, aspect ratio transformation, and sample clip generation.
 */

export interface MergeClipData {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number;
  previewUrl: string;
  width: number;
  height: number;
  thumbnailUrl?: string;
}

export interface MergeExportSettings {
  resolutionMode: 'first-clip' | '1080p' | '720p' | 'square' | 'vertical';
  fitMode: 'contain' | 'cover';
  backgroundColor: string;
  quality: 'high' | 'medium' | 'standard';
}

// ----------------------------------------------------------------------
// Sequential Video Merging & Encoding Engine
// ----------------------------------------------------------------------

export async function exportMergedVideoSequentially(
  clips: MergeClipData[],
  settings: MergeExportSettings,
  onProgress?: (
    percent: number,
    currentClipIndex: number,
    totalClips: number,
    elapsedSec: number
  ) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  if (!clips || clips.length === 0) {
    throw new Error('병합할 동영상 클립이 없습니다.');
  }

  // 1. Determine Output Canvas Resolution
  let targetW = 1280;
  let targetH = 720;

  if (settings.resolutionMode === 'first-clip' && clips[0]) {
    targetW = clips[0].width || 1280;
    targetH = clips[0].height || 720;
  } else if (settings.resolutionMode === '1080p') {
    targetW = 1920;
    targetH = 1080;
  } else if (settings.resolutionMode === '720p') {
    targetW = 1280;
    targetH = 720;
  } else if (settings.resolutionMode === 'square') {
    targetW = 1080;
    targetH = 1080;
  } else if (settings.resolutionMode === 'vertical') {
    targetW = 1080;
    targetH = 1920;
  }

  if (targetW % 2 !== 0) targetW += 1;
  if (targetH % 2 !== 0) targetH += 1;

  const canvas = document.createElement('canvas');
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas Context 생성 실패');

  const videoStream = canvas.captureStream(30);

  // 2. Web Audio API Setup for Seamless Sequential Audio
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;
  let combinedStream: MediaStream = videoStream;

  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
    audioDest = audioCtx.createMediaStreamDestination();
    const audioTracks = audioDest.stream.getAudioTracks();
    if (audioTracks.length > 0) {
      combinedStream = new MediaStream([...videoStream.getVideoTracks(), audioTracks[0]]);
    }
  } catch {
    combinedStream = videoStream;
  }

  // 3. Supported Mime Type & Bitrate
  let mimeType = 'video/webm;codecs=vp9,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm;codecs=vp8,opus';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
  if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';

  let videoBitsPerSecond = 8_000_000;
  if (settings.quality === 'medium') videoBitsPerSecond = 5_000_000;
  if (settings.quality === 'standard') videoBitsPerSecond = 2_500_000;

  const recordedChunks: Blob[] = [];
  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType,
      videoBitsPerSecond,
    });
  } catch {
    mediaRecorder = new MediaRecorder(combinedStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const totalDuration = clips.reduce((acc, c) => acc + (c.duration || 0), 0) || 1;
  const startTimestamp = Date.now();
  let accumulatedProcessedSec = 0;

  mediaRecorder.start(100);

  return new Promise((resolve, reject) => {
    let isCancelled = false;

    const cleanup = () => {
      isCancelled = true;
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        try {
          audioCtx.close();
        } catch {
          // ignore
        }
      }
    };

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('동영상 병합 작업이 취소되었습니다.'));
      });
    }

    mediaRecorder.onstop = () => {
      const outputBlob = new Blob(recordedChunks, { type: mimeType });
      cleanup();
      resolve(outputBlob);
    };

    // Sequential Processing Pipeline
    const processAllClips = async () => {
      try {
        for (let i = 0; i < clips.length; i += 1) {
          if (isCancelled || abortSignal?.aborted) return;

          const clip = clips[i];
          await recordSingleClip(
            clip,
            ctx,
            targetW,
            targetH,
            settings,
            audioCtx,
            audioDest,
            (clipCurrentSec) => {
              if (isCancelled) return;
              const currentTotal = accumulatedProcessedSec + clipCurrentSec;
              const pct = Math.min(99, Math.round((currentTotal / totalDuration) * 100));
              const elapsed = Math.round((Date.now() - startTimestamp) / 1000);
              onProgress?.(pct, i + 1, clips.length, elapsed);
            }
          );

          accumulatedProcessedSec += clip.duration || 0;
        }

        onProgress?.(
          100,
          clips.length,
          clips.length,
          Math.round((Date.now() - startTimestamp) / 1000)
        );
        setTimeout(() => {
          if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
          }
        }, 200);
      } catch (err) {
        cleanup();
        reject(err);
      }
    };

    processAllClips();
  });
}

function recordSingleClip(
  clip: MergeClipData,
  ctx: CanvasRenderingContext2D,
  targetW: number,
  targetH: number,
  settings: MergeExportSettings,
  audioCtx: AudioContext | null,
  audioDest: MediaStreamAudioDestinationNode | null,
  onClipProgress: (sec: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = clip.previewUrl;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = false;

    let sourceNode: MediaElementAudioSourceNode | null = null;
    if (audioCtx && audioDest) {
      try {
        sourceNode = audioCtx.createMediaElementSource(video);
        sourceNode.connect(audioDest);
      } catch {
        // ignore audio connection failure
      }
    }

    let animId: number | null = null;

    const cleanupClip = () => {
      if (animId) cancelAnimationFrame(animId);
      if (sourceNode) {
        try {
          sourceNode.disconnect();
        } catch {
          // ignore
        }
      }
      video.pause();
      video.src = '';
    };

    video.onloadeddata = async () => {
      try {
        await video.play();
      } catch (err) {
        cleanupClip();
        reject(err);
        return;
      }

      const drawLoop = () => {
        if (video.ended || video.paused || video.currentTime >= (clip.duration || 9999)) {
          cleanupClip();
          resolve();
          return;
        }

        // Fill background
        ctx.fillStyle = settings.backgroundColor || '#000000';
        ctx.fillRect(0, 0, targetW, targetH);

        const vw = video.videoWidth || targetW;
        const vh = video.videoHeight || targetH;

        if (settings.fitMode === 'cover') {
          // Cover: Fill entire frame, crop overflow
          const scale = Math.max(targetW / vw, targetH / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          const dx = (targetW - dw) / 2;
          const dy = (targetH - dh) / 2;
          ctx.drawImage(video, dx, dy, dw, dh);
        } else {
          // Contain (Letterbox): Fit inside maintaining aspect ratio
          const scale = Math.min(targetW / vw, targetH / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          const dx = (targetW - dw) / 2;
          const dy = (targetH - dh) / 2;
          ctx.drawImage(video, dx, dy, dw, dh);
        }

        onClipProgress(video.currentTime);
        animId = requestAnimationFrame(drawLoop);
      };

      animId = requestAnimationFrame(drawLoop);
    };

    video.onerror = () => {
      cleanupClip();
      reject(new Error(`클립 '${clip.name}' 로드 실패`));
    };
  });
}

// ----------------------------------------------------------------------
// Generate 3 Animated Test Sample Clips
// ----------------------------------------------------------------------

export async function createSampleMergeClips(): Promise<File[]> {
  const sampleConfigs = [
    {
      title: '클립 1: 사이버펑크 오프닝',
      duration: 3,
      color1: '#00A76F',
      color2: '#0F172A',
      accent: '#36B37E',
      freq: 440,
    },
    {
      title: '클립 2: 인디고 모션 센터',
      duration: 3,
      color1: '#6366F1',
      color2: '#1E1B4B',
      accent: '#818CF8',
      freq: 554,
    },
    {
      title: '클립 3: 로즈 네온 아웃트로',
      duration: 3,
      color1: '#EC4899',
      color2: '#4C0519',
      accent: '#F472B6',
      freq: 659,
    },
  ];

  const files: File[] = [];

  for (let i = 0; i < sampleConfigs.length; i += 1) {
    const cfg = sampleConfigs[i];
    const file = await generateSingleSampleClip(cfg, i + 1);
    files.push(file);
  }

  return files;
}

function generateSingleSampleClip(
  cfg: {
    title: string;
    duration: number;
    color1: string;
    color2: string;
    accent: string;
    freq: number;
  },
  clipNum: number
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 생성 실패');

    const stream = canvas.captureStream(30);

    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const dest = audioCtx.createMediaStreamDestination();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(cfg.freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    osc.connect(gain);
    gain.connect(dest);
    osc.start();

    const combinedStream = new MediaStream([
      ...stream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    let mimeType = 'video/webm;codecs=vp9,opus';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(combinedStream, { mimeType });
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.start(100);
    const startTime = Date.now();

    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= cfg.duration) {
        recorder.stop();
        osc.stop();
        audioCtx.close();
        return;
      }

      // Background
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, cfg.color1);
      grad.addColorStop(1, cfg.color2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Rotating shape
      ctx.save();
      ctx.translate(640, 360);
      ctx.rotate(elapsed * 1.5);
      ctx.strokeStyle = cfg.accent;
      ctx.lineWidth = 8;
      ctx.strokeRect(-120, -120, 240, 240);
      ctx.restore();

      // Info badge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(240, 220, 800, 280);
      ctx.strokeStyle = cfg.accent;
      ctx.lineWidth = 3;
      ctx.strokeRect(240, 220, 800, 280);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🎞️ ${cfg.title} (#${clipNum})`, 640, 300);

      ctx.fillStyle = cfg.accent;
      ctx.font = 'bold 28px monospace';
      ctx.fillText(`00:0${elapsed.toFixed(2)} / 00:0${cfg.duration}.00`, 640, 360);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '18px monospace';
      ctx.fillText(`1280x720 30fps · Audio ${cfg.freq}Hz`, 640, 420);

      requestAnimationFrame(render);
    };

    render();

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `sample_clip_${clipNum}_${cfg.duration}s.webm`, {
        type: mimeType,
      });
      resolve(file);
    };
  });
}
