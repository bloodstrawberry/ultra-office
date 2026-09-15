/** Capture the entire board, independently of its viewport and flex constraints. */
export function getPuzzleCaptureOptions(element: HTMLElement, pixelRatio: number) {
  const bounds = element.getBoundingClientRect();
  const computed = window.getComputedStyle(element);
  const borderWidth = parseFloat(computed.borderLeftWidth) + parseFloat(computed.borderRightWidth);
  const borderHeight = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);

  let backgroundColor = '#FFFFFF';
  let current: HTMLElement | null = element;
  while (current) {
    const color = window.getComputedStyle(current).backgroundColor;
    if (color && color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') {
      backgroundColor = color;
      break;
    }
    current = current.parentElement;
  }

  return {
    // Include scrollable tubes, large clue grids, and the Rush Hour exit badge.
    width: Math.ceil(Math.max(bounds.width, element.scrollWidth + borderWidth)),
    height: Math.ceil(Math.max(bounds.height, element.scrollHeight + borderHeight)),
    pixelRatio,
    backgroundColor,
    cacheBust: true,
    style: {
      // Keep the board geometry separate from the larger output canvas. In
      // particular, percentage max-height must not resolve against the SVG.
      width: `${element.clientWidth + borderWidth}px`,
      height: `${element.clientHeight + borderHeight}px`,
      boxSizing: 'border-box',
      minWidth: '0',
      minHeight: '0',
      maxWidth: 'none',
      maxHeight: 'none',
      margin: '0',
      flex: 'none',
      overflow: 'visible',
    },
  };
}

/**
 * Encodes captured frame data URLs into an MP4 (or WebM fallback) video blob using Canvas & MediaRecorder.
 */
export async function encodeFramesToMp4(
  frames: string[],
  speed = 1,
  onProgress?: (percent: number) => void,
  frameDurationOverrideMs?: number
): Promise<{ blob: Blob; url: string; ext: string }> {
  if (frames.length === 0) {
    throw new Error('인코딩할 프레임이 없습니다.');
  }

  // Pre-load all frame images
  const images = await Promise.all(
    frames.map(
      (src) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        })
    )
  );

  const firstImg = images[0];
  let width = firstImg.naturalWidth || 480;
  let height = firstImg.naturalHeight || 480;

  // Maximum dimension cap for smooth video encoding
  const maxDim = 1080;
  if (Math.max(width, height) > maxDim) {
    const scale = maxDim / Math.max(width, height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Video codecs require even dimensions
  if (width % 2 !== 0) width += 1;
  if (height % 2 !== 0) height += 1;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D context를 생성할 수 없습니다.');

  // Determine optimal supported MIME type
  let mimeType = 'video/mp4;codecs=avc1.42E01E';
  let ext = 'mp4';

  if (typeof MediaRecorder !== 'undefined') {
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4;codecs=avc1';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4;codecs=h264';
    if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm;codecs=vp9';
      ext = 'webm';
    }
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      mimeType = 'video/webm';
      ext = 'webm';
    }
  }

  // Frame display interval in ms based on playback speed
  const frameDurationMs = frameDurationOverrideMs
    ? Math.max(50, Math.min(500, Math.round(frameDurationOverrideMs)))
    : Math.max(70, Math.min(500, Math.round(260 / speed)));
  const fps = Math.min(30, Math.max(10, Math.round(1000 / frameDurationMs)));

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond: 5000000,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      resolve({ blob, url, ext });
    };

    recorder.onerror = (err) => reject(err);

    recorder.start(100);

    const run = async () => {
      try {
        const videoTrack = stream.getVideoTracks()[0] as
          | (MediaStreamTrack & { requestFrame?: () => void })
          | undefined;

        for (let i = 0; i < images.length; i += 1) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(images[i], 0, 0, width, height);

          if (videoTrack && typeof videoTrack.requestFrame === 'function') {
            videoTrack.requestFrame();
          }

          if (onProgress) {
            onProgress(Math.round(((i + 1) / images.length) * 100));
          }

          // Hold the final completed puzzle frame longer (1.5s)
          const hold = i === images.length - 1 ? 1500 : frameDurationMs;
          await new Promise((r) => setTimeout(r, hold));
        }

        recorder.stop();
      } catch (err) {
        try {
          recorder.stop();
        } catch {
          // ignore
        }
        reject(err);
      }
    };

    void run();
  });
}
