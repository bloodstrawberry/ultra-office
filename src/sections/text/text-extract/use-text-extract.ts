import Tesseract from 'tesseract.js';
import { useRef, useState, useCallback } from 'react';

import { preprocessImage } from './text-extract-utils';
import { type OcrSettings } from './ocr-settings-popover';
import { useImageViewer } from '../hooks/use-image-viewer';

type Bbox = { x0: number; y0: number; x1: number; y1: number };
export type ExtractWord = Tesseract.Word & {
  originalBbox: Bbox;
  processedBbox: Bbox;
};

export function useTextExtract() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 });
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });

  const [extractedText, setExtractedText] = useState('');
  const [ocrData, setOcrData] = useState<ExtractWord[] | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState('');

  const [language, setLanguage] = useState<string[]>(['kor', 'eng']);
  const [settings, setSettings] = useState<OcrSettings>({
    psm: '3',
    oem: '3',
    whitelist: '',
    useGrayscale: true,
    contrast: 0,
    threshold: 0,
  });
  const updateSettings = (patch: Partial<OcrSettings>) => setSettings((p) => ({ ...p, ...patch }));

  const viewer = useImageViewer();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
      const img = new Image();
      img.onload = () => {
        setOriginalSize({ width: img.width, height: img.height });
        setImageNaturalSize({ width: img.width, height: img.height });
      };
      img.src = url;
      setExtractedText('');
      setOcrData(null);
      if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
      setProcessedImageUrl(null);
      setProgress(0);
      setProgressStatus('');
      viewer.resetViewer();
    },
    [processedImageUrl, viewer]
  );

  const handleClear = useCallback(() => {
    setImageFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl(null);
    setExtractedText('');
    setOcrData(null);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    setProcessedImageUrl(null);
    setProgress(0);
    setProgressStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    viewer.resetViewer();
  }, [imagePreviewUrl, processedImageUrl, viewer]);

  const handleExtractText = async () => {
    if (!imageFile) return;
    setIsExtracting(true);
    setExtractedText('');
    setProgress(0);
    setProgressStatus('초기화 중...');
    let worker: Tesseract.Worker | null = null;
    try {
      const langString = language.join('+');
      let source: File | HTMLCanvasElement = imageFile;
      const needsPreprocess =
        settings.useGrayscale ||
        settings.contrast !== 0 ||
        settings.threshold !== 0 ||
        viewer.rotation !== 0 ||
        viewer.isVFlip ||
        viewer.isHFlip;
      if (needsPreprocess && imagePreviewUrl) {
        setProgressStatus('전처리 중...');
        const result = await preprocessImage(
          imagePreviewUrl,
          settings,
          viewer.rotation,
          viewer.isVFlip,
          viewer.isHFlip
        );
        setImageNaturalSize({ width: result.width, height: result.height });
        setProcessedImageUrl(result.dataUrl);
        source = result.canvas;
      } else setProcessedImageUrl(null);

      worker = await Tesseract.createWorker(langString, Number(settings.oem), {
        logger: (m) => {
          if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100));
          setProgressStatus(m.status);
        },
      });
      const params: Partial<Tesseract.WorkerParams> = {
        tessedit_pageseg_mode: settings.psm as Tesseract.WorkerParams['tessedit_pageseg_mode'],
      };
      if (settings.whitelist.trim()) params.tessedit_char_whitelist = settings.whitelist.trim();
      await worker.setParameters(params);
      const res = await worker.recognize(source, {}, { blocks: true });
      const words: ExtractWord[] = [];
      if (res.data.blocks) {
        const CW = source instanceof HTMLCanvasElement ? source.width : imageNaturalSize.width;
        const CH = source instanceof HTMLCanvasElement ? source.height : imageNaturalSize.height;
        const W = originalSize.width;
        const H = originalSize.height;
        const rad = (viewer.rotation * Math.PI) / 180;
        const cos = Math.cos(rad);
        const sin = Math.sin(rad);
        const transformToOriginal = (x: number, y: number) => {
          const x0 = x - CW / 2;
          const y0 = y - CH / 2;
          const u0 = x0 * cos + y0 * sin;
          const v0 = -x0 * sin + y0 * cos;
          let u1 = u0;
          let v1 = v0;
          if (viewer.isHFlip) u1 = -u1;
          if (viewer.isVFlip) v1 = -v1;
          return { u: u1 + W / 2, v: v1 + H / 2 };
        };
        res.data.blocks.forEach((b) =>
          b.paragraphs?.forEach((p) =>
            p.lines?.forEach((l) =>
              l.words?.forEach((w) => {
                if (w.text.trim()) {
                  const p0 = transformToOriginal(w.bbox.x0, w.bbox.y0);
                  const p1 = transformToOriginal(w.bbox.x1, w.bbox.y1);
                  words.push({
                    ...w,
                    originalBbox: {
                      x0: Math.min(p0.u, p1.u),
                      y0: Math.min(p0.v, p1.v),
                      x1: Math.max(p0.u, p1.u),
                      y1: Math.max(p0.v, p1.v),
                    },
                    processedBbox: { ...w.bbox },
                  });
                }
              })
            )
          )
        );
      }
      setExtractedText(res.data.text);
      setOcrData(words);
      setImageNaturalSize(originalSize);
    } catch (e) {
      console.error(e);
      const message = e instanceof Error ? e.message : String(e);
      setExtractedText('오류: ' + message);
    } finally {
      if (worker) await worker.terminate();
      setIsExtracting(false);
      setProgressStatus('');
    }
  };

  return {
    imageFile,
    imagePreviewUrl,
    processedImageUrl,
    originalSize,
    imageNaturalSize,
    extractedText,
    setExtractedText,
    ocrData,
    isExtracting,
    progress,
    progressStatus,
    language,
    setLanguage,
    settings,
    updateSettings,
    viewer,
    fileInputRef,
    processFile,
    handleClear,
    handleExtractText,
  };
}
