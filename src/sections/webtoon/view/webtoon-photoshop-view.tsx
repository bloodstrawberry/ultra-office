'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import RedoRoundedIcon from '@mui/icons-material/RedoRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import AspectRatioRoundedIcon from '@mui/icons-material/AspectRatioRounded';
import BrushRoundedIcon from '@mui/icons-material/BrushRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { PhotoUploadWorkspace } from 'src/sections/photo/components';
import { downloadDataUrl, shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';
import { ensureStudioFontsLoaded } from 'src/sections/gif-studio/data/gif-fonts';

import { WEBTOON_SAMPLE_IMAGES, loadWebtoonSample } from '../webtoon-samples';
import type {
  ToolSettings,
  BlendMode,
  HistoryItem,
  PhotoshopLayer,
  SelectionState,
  PhotoshopToolType,
} from '../photoshop/types';
import {
  createLayer,
  cloneLayer,
  flattenLayers,
  mergeLayersDown,
  compositeLayers,
  createEmptyCanvas,
} from '../photoshop/utils/canvas-layer';
import { selectAll, createEmptySelection, invertSelection } from '../photoshop/utils/selection';
import {
  filterSepia,
  filterInvert,
  filterGrayscale,
  filterThreshold,
  filterBrightnessContrast,
  filterHueSaturationLightness,
  filterBlur,
  filterSharpen,
  filterLineArt,
  filterScreentone,
  filterMosaic,
  applyFilterWithMask,
  drawWebtoonFocusLines,
} from '../photoshop/utils/filters';
import { PsToolbarLeft } from '../photoshop/components/ps-toolbar-left';
import { PsOptionsTop } from '../photoshop/components/ps-options-top';
import { PsSidebarRight } from '../photoshop/components/ps-sidebar-right';
import { PsCanvasWorkspace } from '../photoshop/components/ps-canvas-workspace';
import { PsDialogFilter, type FilterDialogType } from '../photoshop/components/ps-dialog-filter';

const DEFAULT_TOOL_SETTINGS: ToolSettings = {
  brushSize: 12,
  brushOpacity: 1,
  brushHardness: 0.8,
  eraserSize: 20,
  eraserOpacity: 1,
  eraserHardness: 0.8,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  tolerance: 32,
  gradientType: 'linear',
  cloneSource: null,
  textString: '대사 입력',
  fontFamily: '"Jalnan2", sans-serif',
  fontSize: 28,
  fontWeight: 'bold',
  fontStyle: 'normal',
  textColor: '#000000',
  textStrokeWidth: 0,
  textStrokeColor: '#ffffff',
  shapeFillColor: '#ffffff',
  shapeStrokeColor: '#000000',
  shapeStrokeWidth: 3,
  shapeFill: true,
  shapeStroke: true,
  bubbleShape: 'oval',
  bubbleTailX: 0,
  bubbleTailY: 0,
  focusLineCount: 80,
  focusLineInnerRadius: 100,
  focusLineThickness: 2,
  focusLineColor: '#000000',
};

export function WebtoonPhotoshopView() {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({
    width: 800,
    height: 800,
  });

  // Photoshop Core States
  const [layers, setLayers] = useState<PhotoshopLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('');
  const [selection, setSelection] = useState<SelectionState>(createEmptySelection());
  const [currentTool, setCurrentTool] = useState<PhotoshopToolType>('brush');
  const [settings, setSettings] = useState<ToolSettings>(DEFAULT_TOOL_SETTINGS);

  // Viewport Zoom & Pan
  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // History Stack
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Filter Dialog
  const [activeFilterDialog, setActiveFilterDialog] = useState<FilterDialogType>(null);

  // Export Menu
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

  // Ensure fonts loaded
  useEffect(() => {
    ensureStudioFontsLoaded();
  }, []);

  // Save current layer state to History
  const commitHistory = useCallback(
    (description: string) => {
      if (layers.length === 0) return;

      const snapshotItem: HistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        description,
        timestamp: Date.now(),
        layers: layers.map((l) => ({
          id: l.id,
          name: l.name,
          visible: l.visible,
          locked: l.locked,
          opacity: l.opacity,
          blendMode: l.blendMode,
          dataUrl: l.canvas.toDataURL(),
          x: l.x,
          y: l.y,
          width: l.width,
          height: l.height,
        })),
        activeLayerId,
      };

      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        const next = [...sliced, snapshotItem];
        if (next.length > 25) next.shift();
        return next;
      });
      setHistoryIndex((prev) => Math.min(24, prev + 1));
    },
    [layers, activeLayerId, historyIndex]
  );

  // Initialize Canvas from Image
  const initFromImage = useCallback((img: HTMLImageElement) => {
    const w = img.naturalWidth || img.width;
    const h = img.naturalHeight || img.height;
    setCanvasSize({ width: w, height: h });

    const baseLayer = createLayer(w, h, '배경 (Background)', img);
    setLayers([baseLayer]);
    setActiveLayerId(baseLayer.id);
    setSelection(createEmptySelection());
    setZoom(0.85);
    setPan({ x: 0, y: 0 });

    const initialHistory: HistoryItem = {
      id: `hist_${Date.now()}`,
      description: '이미지 열기',
      timestamp: Date.now(),
      layers: [
        {
          id: baseLayer.id,
          name: baseLayer.name,
          visible: baseLayer.visible,
          locked: baseLayer.locked,
          opacity: baseLayer.opacity,
          blendMode: baseLayer.blendMode,
          dataUrl: baseLayer.canvas.toDataURL(),
          x: 0,
          y: 0,
          width: w,
          height: h,
        },
      ],
      activeLayerId: baseLayer.id,
    };
    setHistory([initialHistory]);
    setHistoryIndex(0);
  }, []);

  // Upload custom file
  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      initFromImage(img);
      toast.success(`${file.name} 이미지를 성공적으로 불러왔습니다.`);
    };
    img.onerror = () => {
      toast.error('이미지를 불러오는데 실패했습니다.');
    };
    img.src = url;
  };

  // Select sample webtoon image
  const handleSelectSample = async (sampleUrl: string) => {
    try {
      const file = await loadWebtoonSample(sampleUrl);
      handleFileUpload(file);
      toast.success('웹툰 샘플 이미지를 불러왔습니다.');
    } catch {
      toast.error('샘플 이미지를 불러올 수 없습니다.');
    }
  };

  // History Undo & Redo Jump
  const jumpHistory = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 0 || targetIndex >= history.length) return;
      const targetState = history[targetIndex];

      const restoredLayers: PhotoshopLayer[] = targetState.layers.map((l) => {
        const c = createEmptyCanvas(l.width, l.height);
        const ctx = c.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.src = l.dataUrl;
          ctx.drawImage(img, 0, 0);
        }
        return {
          id: l.id,
          name: l.name,
          visible: l.visible,
          locked: l.locked,
          opacity: l.opacity,
          blendMode: l.blendMode,
          canvas: c,
          x: l.x,
          y: l.y,
          width: l.width,
          height: l.height,
        };
      });

      setLayers(restoredLayers);
      setActiveLayerId(targetState.activeLayerId);
      setHistoryIndex(targetIndex);
    },
    [history]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      jumpHistory(historyIndex - 1);
    }
  }, [historyIndex, jumpHistory]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      jumpHistory(historyIndex + 1);
    }
  }, [historyIndex, history.length, jumpHistory]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.code === 'KeyZ') {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.code === 'KeyY' || (e.shiftKey && e.code === 'KeyZ'))
      ) {
        e.preventDefault();
        handleRedo();
      }

      // Selection shortcuts
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyA') {
        e.preventDefault();
        setSelection(selectAll(canvasSize.width, canvasSize.height));
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'KeyD') {
        e.preventDefault();
        setSelection(createEmptySelection());
      } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.code === 'KeyI') {
        e.preventDefault();
        setSelection((prev) => invertSelection(prev, canvasSize.width, canvasSize.height));
      }

      // Tool shortcuts
      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.code) {
          case 'KeyV':
            setCurrentTool('move');
            break;
          case 'KeyM':
            setCurrentTool(e.shiftKey ? 'marquee-ellipse' : 'marquee-rect');
            break;
          case 'KeyL':
            setCurrentTool('lasso');
            break;
          case 'KeyW':
            setCurrentTool('magic-wand');
            break;
          case 'KeyC':
            setCurrentTool('crop');
            break;
          case 'KeyI':
            setCurrentTool('eyedropper');
            break;
          case 'KeyB':
            setCurrentTool(e.shiftKey ? 'pencil' : 'brush');
            break;
          case 'KeyE':
            setCurrentTool('eraser');
            break;
          case 'KeyG':
            setCurrentTool(e.shiftKey ? 'gradient' : 'paint-bucket');
            break;
          case 'KeyT':
            setCurrentTool('text');
            break;
          case 'KeyU':
            setCurrentTool('shape-rect');
            break;
          case 'KeyH':
            setCurrentTool('hand');
            break;
          case 'KeyZ':
            setCurrentTool('zoom');
            break;
          case 'KeyX':
            // Swap colors
            setSettings((s) => ({
              ...s,
              foregroundColor: s.backgroundColor,
              backgroundColor: s.foregroundColor,
            }));
            break;
          case 'KeyD':
            // Reset colors
            setSettings((s) => ({
              ...s,
              foregroundColor: '#000000',
              backgroundColor: '#ffffff',
            }));
            break;
          case 'BracketLeft':
            // Brush size down
            setSettings((s) => ({ ...s, brushSize: Math.max(1, s.brushSize - 4) }));
            break;
          case 'BracketRight':
            // Brush size up
            setSettings((s) => ({ ...s, brushSize: Math.min(200, s.brushSize + 4) }));
            break;
          case 'Delete':
            // Clear selection in active layer
            if (selection.hasSelection && selection.maskCanvas) {
              const active = layers.find((l) => l.id === activeLayerId);
              if (active && !active.locked) {
                const ctx = active.canvas.getContext('2d');
                if (ctx) {
                  ctx.save();
                  ctx.globalCompositeOperation = 'destination-out';
                  ctx.drawImage(selection.maskCanvas, 0, 0);
                  ctx.restore();
                  commitHistory('선택 영역 삭제');
                }
              }
            }
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, canvasSize, selection, layers, activeLayerId, commitHistory]);

  // Layer Management Callbacks
  const handleAddLayer = () => {
    const newLayer = createLayer(
      canvasSize.width,
      canvasSize.height,
      `레이어 ${layers.length + 1}`
    );
    setLayers((prev) => [...prev, newLayer]);
    setActiveLayerId(newLayer.id);
    commitHistory('새 레이어 추가');
  };

  const handleCloneLayer = (id: string) => {
    const target = layers.find((l) => l.id === id);
    if (!target) return;
    const cloned = cloneLayer(target);
    setLayers((prev) => [...prev, cloned]);
    setActiveLayerId(cloned.id);
    commitHistory(`레이어 복제 (${target.name})`);
  };

  const handleDeleteLayer = (id: string) => {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setActiveLayerId(layers[0].id);
    commitHistory('레이어 삭제');
  };

  const handleToggleVisible = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  };

  const handleToggleLock = (id: string) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)));
  };

  const handleChangeOpacity = (id: string, opacity: number) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, opacity } : l)));
  };

  const handleChangeBlendMode = (id: string, blendMode: BlendMode) => {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, blendMode } : l)));
    commitHistory('블렌드 모드 변경');
  };

  const handleMoveLayer = (id: string, direction: 'up' | 'down') => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx === -1) return;
    const targetIdx = direction === 'up' ? idx + 1 : idx - 1;
    if (targetIdx < 0 || targetIdx >= layers.length) return;

    const copy = [...layers];
    const [moved] = copy.splice(idx, 1);
    copy.splice(targetIdx, 0, moved);
    setLayers(copy);
    commitHistory('레이어 순서 변경');
  };

  const handleMergeDown = (id: string) => {
    const idx = layers.findIndex((l) => l.id === id);
    if (idx <= 0) {
      toast.info('아래에 병합할 레이어가 없습니다.');
      return;
    }
    const top = layers[idx];
    const bottom = layers[idx - 1];
    const merged = mergeLayersDown(bottom, top);

    const copy = [...layers];
    copy.splice(idx - 1, 2, merged);
    setLayers(copy);
    setActiveLayerId(merged.id);
    commitHistory('아래 레이어와 병합');
  };

  const handleFlatten = () => {
    if (layers.length <= 1) return;
    const flattened = flattenLayers(canvasSize.width, canvasSize.height, layers);
    setLayers([flattened]);
    setActiveLayerId(flattened.id);
    commitHistory('전체 레이어 병합');
  };

  const handleUpdateLayerCanvas = useCallback(
    (layerId: string, updatedCanvas: HTMLCanvasElement) => {
      setLayers((prev) =>
        prev.map((l) => (l.id === layerId ? { ...l, canvas: updatedCanvas } : l))
      );
    },
    []
  );

  const handleUpdateLayerPosition = useCallback((layerId: string, x: number, y: number) => {
    setLayers((prev) => prev.map((l) => (l.id === layerId ? { ...l, x, y } : l)));
  }, []);

  const handlePanChange = useCallback((newPan: { x: number; y: number }) => {
    setPan(newPan);
  }, []);

  // Filter Trigger Callback
  const handleApplyFilter = (
    type:
      | 'brightness'
      | 'hue'
      | 'grayscale'
      | 'invert'
      | 'sepia'
      | 'threshold'
      | 'blur'
      | 'sharpen'
      | 'lineArt'
      | 'screentone'
      | 'mosaic'
      | 'focusLines'
  ) => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked) {
      toast.error('활성화된 편집 가능한 레이어가 없습니다.');
      return;
    }

    if (type === 'focusLines') {
      // Add a new Focus lines layer
      const focusLayer = createLayer(canvasSize.width, canvasSize.height, '웹툰 집중선 효과');
      drawWebtoonFocusLines(
        focusLayer.canvas,
        canvasSize.width / 2,
        canvasSize.height / 2,
        settings.focusLineCount,
        settings.focusLineInnerRadius,
        settings.foregroundColor
      );
      setLayers((prev) => [...prev, focusLayer]);
      setActiveLayerId(focusLayer.id);
      commitHistory('웹툰 집중선 레이어 생성');
      toast.success('웹툰 집중선 레이어가 추가되었습니다.');
      return;
    }

    // Direct filters (no slider needed)
    if (type === 'grayscale' || type === 'invert' || type === 'sepia') {
      applyFilterWithMask(active.canvas, selection.maskCanvas, (data) => {
        if (type === 'grayscale') filterGrayscale(data);
        else if (type === 'invert') filterInvert(data);
        else filterSepia(data);
      });
      setLayers((prev) => [...prev]);
      commitHistory(
        type === 'grayscale'
          ? '흑백 필터 적용'
          : type === 'invert'
            ? '색상 반전 필터 적용'
            : '세피아 필터 적용'
      );
      return;
    }

    // Open slider dialog for other filters
    setActiveFilterDialog(type);
  };

  // Confirm Filter from Dialog
  const handleConfirmFilterDialog = (params: Record<string, number>) => {
    const active = layers.find((l) => l.id === activeLayerId);
    if (!active || active.locked || !activeFilterDialog) return;

    applyFilterWithMask(active.canvas, selection.maskCanvas, (data) => {
      switch (activeFilterDialog) {
        case 'brightness':
          filterBrightnessContrast(data, params.val1, params.val2);
          break;
        case 'hue':
          filterHueSaturationLightness(data, params.val1, params.val2, 0);
          break;
        case 'blur':
          filterBlur(data, params.val1);
          break;
        case 'sharpen':
          filterSharpen(data, params.val1);
          break;
        case 'screentone':
          filterScreentone(data, params.val1);
          break;
        case 'lineArt':
          filterLineArt(data, params.val1);
          break;
        case 'mosaic':
          filterMosaic(data, params.val1);
          break;
        case 'threshold':
          filterThreshold(data, params.val1);
          break;
        default:
          break;
      }
    });

    setLayers((prev) => [...prev]);
    commitHistory(`필터 적용 (${activeFilterDialog})`);
    setActiveFilterDialog(null);
  };

  // Export Composite Result
  const getCompositeDataUrl = (format: 'image/png' | 'image/jpeg' | 'image/webp') => {
    const finalCanvas = createEmptyCanvas(canvasSize.width, canvasSize.height);
    compositeLayers(finalCanvas, layers, { backgroundColor: '#ffffff' });
    return finalCanvas.toDataURL(format, 0.95);
  };

  const handleDownload = (format: 'png' | 'jpg' | 'webp') => {
    const mime = format === 'png' ? 'image/png' : format === 'jpg' ? 'image/jpeg' : 'image/webp';
    const dataUrl = getCompositeDataUrl(mime);
    downloadDataUrl(dataUrl, `webtoon_ps_${Date.now()}.${format}`);
    toast.success(`${format.toUpperCase()} 파일로 저장되었습니다.`);
    setExportAnchorEl(null);
  };

  const handleCopyToClipboard = async () => {
    try {
      const finalCanvas = createEmptyCanvas(canvasSize.width, canvasSize.height);
      compositeLayers(finalCanvas, layers, { backgroundColor: '#ffffff' });
      finalCanvas.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 복사되었습니다. (Ctrl+V로 붙여넣기)');
      }, 'image/png');
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저입니다.');
    }
  };

  const handleShareKakao = () => {
    const dataUrl = getCompositeDataUrl('image/png');
    shareToKakaoTalk(
      dataUrl,
      '웹툰 포토샵에서 편집한 웹툰 원고입니다.',
      `webtoon_ps_${Date.now()}.png`
    );
  };

  const handleCropCanvas = useCallback(
    (cropX: number, cropY: number, cropW: number, cropH: number) => {
      setCanvasSize({ width: cropW, height: cropH });
      setLayers((prev) =>
        prev.map((l) => {
          const newCanvas = createEmptyCanvas(cropW, cropH);
          const ctx = newCanvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(l.canvas, -cropX, -cropY);
          }
          return {
            ...l,
            canvas: newCanvas,
            width: cropW,
            height: cropH,
          };
        })
      );
      setSelection(createEmptySelection());
      setPan({ x: 0, y: 0 });
      // Use setTimeout to ensure history commits after state updates
      setTimeout(() => commitHistory('캔버스 자르기 (Crop)'), 100);
    },
    [commitHistory]
  );

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Header Title Section */}
      <Box sx={{ mb: 1.5, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.25 }}>
          웹툰 포토샵 스튜디오 (Webtoon Photoshop Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          다중 레이어 합성, 정밀 브러시, 선택 영역, 망점 스크린톤 및 웹툰 특화 드로잉 도구를
          제공합니다.
        </Typography>
      </Box>

      {!imageSrc || layers.length === 0 ? (
        <PhotoUploadWorkspace
          sampleImages={WEBTOON_SAMPLE_IMAGES}
          onSelectSample={(url) => void handleSelectSample(url)}
          onFileSelect={handleFileUpload}
          title="웹툰 포토샵으로 편집할 이미지 업로드"
          subtitle="웹툰 원고, 스케치, 일러스트(PNG, JPG, WEBP)를 올리거나 아래 샘플을 선택하세요."
          icon={<BrushRoundedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        <Card
          sx={{
            flex: '1 1 0px',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Main Top Action Header */}
          <Box
            sx={{
              height: 48,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Left Controls: History & Zoom & Resets */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="되돌리기 (Ctrl+Z)">
                <span>
                  <IconButton size="small" onClick={handleUndo} disabled={historyIndex <= 0}>
                    <UndoRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="다시 실행 (Ctrl+Y)">
                <span>
                  <IconButton
                    size="small"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                  >
                    <RedoRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </span>
              </Tooltip>

              <Chip
                size="small"
                label={`${canvasSize.width} × ${canvasSize.height} px`}
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: '0.72rem' }}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 1 }}>
                <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.2, z - 0.15))}>
                  <ZoomOutRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, minWidth: 42, textAlign: 'center' }}
                >
                  {Math.round(zoom * 100)}%
                </Typography>
                <IconButton size="small" onClick={() => setZoom((z) => Math.min(4, z + 0.15))}>
                  <ZoomInRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Tooltip title="화면 크기에 맞춤">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setZoom(0.85);
                      setPan({ x: 0, y: 0 });
                    }}
                  >
                    <AspectRatioRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Right Controls: Share, Copy, Export */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setImageSrc(null)}
                sx={{ fontSize: '0.72rem' }}
              >
                새로 불러오기
              </Button>

              <Tooltip title="클립보드 복사 (Ctrl+C)">
                <IconButton size="small" onClick={handleCopyToClipboard}>
                  <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="카카오톡 공유">
                <IconButton size="small" onClick={handleShareKakao} sx={{ color: '#FEE500' }}>
                  <ShareRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </Tooltip>

              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<DownloadRoundedIcon sx={{ fontSize: 16 }} />}
                onClick={(e) => setExportAnchorEl(e.currentTarget)}
                sx={{ fontSize: '0.75rem', fontWeight: 700 }}
              >
                저장하기
              </Button>

              <Menu
                anchorEl={exportAnchorEl}
                open={Boolean(exportAnchorEl)}
                onClose={() => setExportAnchorEl(null)}
              >
                <MenuItem onClick={() => handleDownload('png')} sx={{ fontSize: '0.78rem' }}>
                  PNG 파일로 저장 (고화질 투명 지원)
                </MenuItem>
                <MenuItem onClick={() => handleDownload('jpg')} sx={{ fontSize: '0.78rem' }}>
                  JPG 파일로 저장 (압축 포맷)
                </MenuItem>
                <MenuItem onClick={() => handleDownload('webp')} sx={{ fontSize: '0.78rem' }}>
                  WEBP 파일로 저장 (웹툰 최적화)
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Sub Options Bar (Tool specific properties) */}
          <PsOptionsTop
            currentTool={currentTool}
            settings={settings}
            onChangeSettings={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            onSelectAll={() => setSelection(selectAll(canvasSize.width, canvasSize.height))}
            onDeselect={() => setSelection(createEmptySelection())}
            onInvertSelection={() =>
              setSelection((prev) => invertSelection(prev, canvasSize.width, canvasSize.height))
            }
            onClearSelection={() => {
              if (selection.hasSelection && selection.maskCanvas) {
                const active = layers.find((l) => l.id === activeLayerId);
                if (active && !active.locked) {
                  const ctx = active.canvas.getContext('2d');
                  if (ctx) {
                    ctx.save();
                    ctx.globalCompositeOperation = 'destination-out';
                    ctx.drawImage(selection.maskCanvas, 0, 0);
                    ctx.restore();
                    commitHistory('선택 영역 삭제');
                  }
                }
              }
            }}
            hasSelection={selection.hasSelection}
          />

          {/* Main Studio Body: Left Toolbar + Canvas Workspace + Right Sidebar */}
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 0px',
              minHeight: 0,
              height: '100%',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Left Vertical Tool Palette (Photoshop UI) */}
            <PsToolbarLeft
              currentTool={currentTool}
              onSelectTool={(tool) => setCurrentTool(tool)}
              foregroundColor={settings.foregroundColor}
              backgroundColor={settings.backgroundColor}
              onChangeForegroundColor={(color) =>
                setSettings((s) => ({ ...s, foregroundColor: color }))
              }
              onChangeBackgroundColor={(color) =>
                setSettings((s) => ({ ...s, backgroundColor: color }))
              }
              onSwapColors={() =>
                setSettings((s) => ({
                  ...s,
                  foregroundColor: s.backgroundColor,
                  backgroundColor: s.foregroundColor,
                }))
              }
              onResetColors={() =>
                setSettings((s) => ({
                  ...s,
                  foregroundColor: '#000000',
                  backgroundColor: '#ffffff',
                }))
              }
            />

            {/* Center Canvas Viewport */}
            <PsCanvasWorkspace
              layers={layers}
              activeLayerId={activeLayerId}
              selection={selection}
              currentTool={currentTool}
              settings={settings}
              zoom={zoom}
              pan={pan}
              canvasSize={canvasSize}
              onUpdateLayerCanvas={handleUpdateLayerCanvas}
              onUpdateLayerPosition={handleUpdateLayerPosition}
              onUpdateSelection={(newSel) => setSelection(newSel)}
              onPickColor={(hex) => {
                setSettings((s) => ({ ...s, foregroundColor: hex }));
                toast.success(`스포이트 추출 색상: ${hex}`);
              }}
              onPanChange={handlePanChange}
              onZoomChange={(newZoom) => setZoom(newZoom)}
              onCommitHistory={commitHistory}
              onCropCanvas={handleCropCanvas}
            />

            {/* Right Docking Sidebar (Layers, Adjustments, Webtoon FX, History) */}
            <PsSidebarRight
              layers={layers}
              activeLayerId={activeLayerId}
              history={history}
              historyIndex={historyIndex}
              onSelectLayer={(id) => setActiveLayerId(id)}
              onAddLayer={handleAddLayer}
              onCloneLayer={handleCloneLayer}
              onDeleteLayer={handleDeleteLayer}
              onToggleVisible={handleToggleVisible}
              onToggleLock={handleToggleLock}
              onChangeOpacity={handleChangeOpacity}
              onChangeBlendMode={handleChangeBlendMode}
              onMoveLayer={handleMoveLayer}
              onMergeDown={handleMergeDown}
              onFlatten={handleFlatten}
              onJumpHistory={jumpHistory}
              onApplyFilter={handleApplyFilter}
            />
          </Box>
        </Card>
      )}

      {/* Filter Parameters Dialog */}
      <PsDialogFilter
        filterType={activeFilterDialog}
        open={Boolean(activeFilterDialog)}
        onClose={() => setActiveFilterDialog(null)}
        onApply={handleConfirmFilterDialog}
      />
    </DashboardContent>
  );
}
