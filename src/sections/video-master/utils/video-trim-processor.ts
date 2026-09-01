/**
 * Video Trimming & Processing Utility Engine
 * Supports filmstrip frame thumbnail extraction, Web Audio API + MediaRecorder audio-preserving export,
 * resolution scaling, and sample video generation.
 */

export interface VideoTrimSettings {
  startTime: number;
  endTime: number;
  playbackRate: number;
  muteAudio: boolean;
  resolution: 'original' | '1080p' | '720p' | '480p';
  quality: 'high' | 'medium' | 'standard';
}

export interface VideoThumbnailItem {
  time: number;
  dataUrl: string;
}

// ----------------------------------------------------------------------
// Thumbnail Filmstrip Extractor
// ----------------------------------------------------------------------

export async function extractVideoThumbnails(
  videoUrl: string,
  count = 10,
  targetWidth = 140
): Promise<VideoThumbnailItem[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.src = videoUrl;
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;

    const thumbnails: VideoThumbnailItem[] = [];

    video.onloadedmetadata = async () => {
      const duration = video.duration || 10;
      const vw = video.videoWidth || 1280;
      const vh = video.videoHeight || 720;
      const aspect = vw / vh;
      const targetHeight = Math.round(targetWidth / aspect);

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        resolve([]);
        return;
      }

      const step = duration / Math.max(1, count);

      for (let i = 0; i < count; i += 1) {
        const time = Math.min(duration - 0.05, i * step + step * 0.1);
        try {
          await seekVideo(video, time);
          ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          thumbnails.push({ time, dataUrl });
        } catch {
          // ignore seek error
        }
      }

      resolve(thumbnails);
    };

    video.onerror = () => {
      resolve([]);
    };
  });
}

function seekVideo(video: HTMLVideoElement, time: number): Promise<void> {
  return new Promise((resolve) => {
    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      resolve();
    };
    video.addEventListener('seeked', handleSeeked);
    video.currentTime = Math.max(0, time);
  });
}

// ----------------------------------------------------------------------
// Video Trimming & Exporting Engine (MediaRecorder + Web Audio API)
// ----------------------------------------------------------------------

export async function exportTrimmedVideo(
  videoSourceUrl: string,
  settings: VideoTrimSettings,
  onProgress?: (percent: number, elapsedSec: number) => void,
  abortSignal?: AbortSignal
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = videoSourceUrl;
    video.crossOrigin = 'anonymous';
    video.playsInline = true;
    video.muted = settings.muteAudio;

    const startTime = Math.max(0, settings.startTime);
    let endTime = settings.endTime;
    const playbackRate = Math.max(0.25, Math.min(4.0, settings.playbackRate || 1.0));

    let audioContext: AudioContext | null = null;
    let audioSource: MediaElementAudioSourceNode | null = null;
    let audioDest: MediaStreamAudioDestinationNode | null = null;
    let mediaRecorder: MediaRecorder | null = null;
    let animFrameId: number | null = null;
    let progressInterval: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (progressInterval) clearInterval(progressInterval);
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        try {
          mediaRecorder.stop();
        } catch {
          // ignore
        }
      }
      if (audioContext && audioContext.state !== 'closed') {
        try {
          audioContext.close();
        } catch {
          // ignore
        }
      }
      video.pause();
      video.src = '';
    };

    if (abortSignal) {
      abortSignal.addEventListener('abort', () => {
        cleanup();
        reject(new Error('동영상 인코딩이 사용자에 의해 중단되었습니다.'));
      });
    }

    video.onloadedmetadata = async () => {
      if (endTime <= startTime || endTime > video.duration) {
        endTime = video.duration || 10;
      }
      const totalTrimDuration = Math.max(0.1, endTime - startTime);

      // 1. Determine Output Canvas Resolution
      let targetW = video.videoWidth || 1280;
      let targetH = video.videoHeight || 720;

      if (settings.resolution === '1080p') {
        const aspect = targetW / targetH;
        targetW = 1920;
        targetH = Math.round(1920 / aspect);
        if (targetH % 2 !== 0) targetH += 1;
      } else if (settings.resolution === '720p') {
        const aspect = targetW / targetH;
        targetW = 1280;
        targetH = Math.round(1280 / aspect);
        if (targetH % 2 !== 0) targetH += 1;
      } else if (settings.resolution === '480p') {
        const aspect = targetW / targetH;
        targetW = 854;
        targetH = Math.round(854 / aspect);
        if (targetH % 2 !== 0) targetH += 1;
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d', { alpha: false });
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas Context 초기화 실패'));
        return;
      }

      // 2. Setup Audio Track Mixing via Web Audio API
      let combinedStream: MediaStream;
      const videoStream = canvas.captureStream(30);

      if (!settings.muteAudio) {
        try {
          const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          audioContext = new AudioContextClass();
          audioSource = audioContext.createMediaElementSource(video);
          audioDest = audioContext.createMediaStreamDestination();
          audioSource.connect(audioDest);

          const audioTracks = audioDest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            combinedStream = new MediaStream([...videoStream.getVideoTracks(), audioTracks[0]]);
          } else {
            combinedStream = videoStream;
          }
        } catch {
          combinedStream = videoStream;
        }
      } else {
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

      mediaRecorder.onstop = () => {
        const outputBlob = new Blob(recordedChunks, { type: mimeType });
        cleanup();
        resolve(outputBlob);
      };

      // 4. Progress Reporting
      const startTimestamp = Date.now();
      progressInterval = setInterval(() => {
        const elapsedSec = (Date.now() - startTimestamp) / 1000;
        const currentTrimPos = Math.max(0, video.currentTime - startTime);
        const percent = Math.min(99, Math.round((currentTrimPos / totalTrimDuration) * 100));
        onProgress?.(percent, Math.round(elapsedSec));
      }, 100);

      // 5. Seek to Start Time & Start Recording Loop
      await seekVideo(video, startTime);

      video.playbackRate = playbackRate;
      mediaRecorder.start(100);

      try {
        await video.play();
      } catch (err) {
        cleanup();
        reject(err);
        return;
      }

      const drawLoop = () => {
        if (abortSignal?.aborted) return;

        if (video.currentTime >= endTime || video.ended || video.paused) {
          onProgress?.(100, Math.round((Date.now() - startTimestamp) / 1000));
          setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          }, 200);
          return;
        }

        // Draw video frame onto output canvas (Fit contain)
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, targetW, targetH);

        const vw = video.videoWidth || 1280;
        const vh = video.videoHeight || 720;
        const scale = Math.min(targetW / vw, targetH / vh);
        const dw = vw * scale;
        const dh = vh * scale;
        const dx = (targetW - dw) / 2;
        const dy = (targetH - dh) / 2;

        ctx.drawImage(video, dx, dy, dw, dh);

        animFrameId = requestAnimationFrame(drawLoop);
      };

      animFrameId = requestAnimationFrame(drawLoop);
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('동영상 소스를 로드할 수 없습니다.'));
    };
  });
}

// ----------------------------------------------------------------------
// Standalone Sample Video Generator for 1-Click Testing
// ----------------------------------------------------------------------

export async function createSampleTrimVideo(durationSec = 8): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 생성 실패');

  const stream = canvas.captureStream(30);

  // Audio track oscillator with rhythmic beep sound
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioContextClass();
  const dest = audioCtx.createMediaStreamDestination();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(440, audioCtx.currentTime);
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
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

  return new Promise((resolve) => {
    const render = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= durationSec) {
        recorder.stop();
        osc.stop();
        audioCtx.close();
        return;
      }

      // Animated Background Gradient
      const hue = (elapsed * 45) % 360;
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, `hsl(${hue}, 70%, 25%)`);
      grad.addColorStop(1, `hsl(${(hue + 90) % 360}, 75%, 15%)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1280; x += 64) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, 720);
        ctx.stroke();
      }
      for (let y = 0; y < 720; y += 64) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(1280, y);
        ctx.stroke();
      }

      // Orbiting Planet / Particle
      const orbitX = 640 + Math.cos(elapsed * 2) * 260;
      const orbitY = 360 + Math.sin(elapsed * 2) * 140;
      ctx.fillStyle = '#00A76F';
      ctx.beginPath();
      ctx.arc(orbitX, orbitY, 28, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Center Ring
      ctx.strokeStyle = 'rgba(0, 167, 111, 0.5)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(640, 360, 100 + Math.sin(elapsed * 3) * 20, 0, Math.PI * 2);
      ctx.stroke();

      // Timecode HUD Box
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(340, 240, 600, 240);
      ctx.strokeStyle = 'rgba(0, 167, 111, 0.6)';
      ctx.lineWidth = 2;
      ctx.strokeRect(340, 240, 600, 240);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TIMECODE: 00:0${elapsed.toFixed(2)}`, 640, 310);

      ctx.fillStyle = '#00A76F';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText('✂️ 동영상 자르기 테스트 샘플 영상', 640, 365);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '16px monospace';
      ctx.fillText(`Total: ${durationSec}s | Resolution: 1280x720 30fps`, 640, 420);

      requestAnimationFrame(render);
    };

    render();

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const file = new File([blob], `sample_trim_video_${durationSec}s.webm`, {
        type: mimeType,
      });
      resolve(file);
    };
  });
}
