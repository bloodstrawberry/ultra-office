'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import FormatColorTextRoundedIcon from '@mui/icons-material/FormatColorTextRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import BorderColorRoundedIcon from '@mui/icons-material/BorderColorRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  CAPTION_STYLES,
  type CaptionStyleId,
  NEWS_SAMPLE_IMAGES,
  MEME_QUOTE_PRESETS,
  type NewsCaptionConfig,
  type CaptionElement,
  type CaptionFontWeight,
  type FontFamilyChoice,
  DEFAULT_NEWS_CAPTION_CONFIG,
  createDefaultElementsForStyle,
} from '../utils/news-caption-presets';
import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';
import {
  renderNewsCaption,
  getElementBounds,
  type ElementBounds,
} from '../utils/news-caption-renderer';
import { downloadDataUrl, shareToKakaoTalk } from '../utils/image-processor';

// ----------------------------------------------------------------------

export function PhotoNewsCaptionView() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null);
  const [config, setConfig] = useState<NewsCaptionConfig>(DEFAULT_NEWS_CAPTION_CONFIG);

  // Viewport & Compare states
  const [previewMode, setPreviewMode] = useState<ComparePreviewMode>('single');
  const [splitOrientation, setSplitOrientation] = useState<SplitOrientation>('horizontal');
  const [splitMode, setSplitMode] = useState<SplitMode>('inside');
  const [splitStart, setSplitStart] = useState<number>(30);
  const [splitEnd, setSplitEnd] = useState<number>(70);
  const [zoom, setZoom] = useState<number>(0.9);
  const [resultDataUrl, setResultDataUrl] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Drag & Drop / Selection states
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [elementBounds, setElementBounds] = useState<Record<string, ElementBounds>>({});
  const isDraggingRef = useRef<boolean>(false);
  const dragStartOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Canvas references
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewportContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Image load handler
  useEffect(() => {
    if (!imageSrc) {
      setOriginalImage(null);
      setResultDataUrl('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      setZoom(0.9);
    };
    img.onerror = () => {
      toast.error('이미지 로드에 실패했습니다. 올바른 이미지 파일인지 확인하세요.');
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // 2. Real-time render pipeline
  const updateRender = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    renderNewsCaption(canvasRef.current, originalImage, config);

    // Compute bounding boxes for hit-testing & interactive overlays
    const bounds = getElementBounds(canvasRef.current.width, canvasRef.current.height, config);
    setElementBounds(bounds);

    setResultDataUrl(canvasRef.current.toDataURL('image/png'));
  }, [originalImage, config]);

  useEffect(() => {
    updateRender();
  }, [updateRender]);

  // Selected element helper
  const selectedElement = useMemo(
    () => config.elements.find((el) => el.id === config.selectedElementId) || null,
    [config.elements, config.selectedElementId]
  );

  // 3. Selection & Drag-and-Drop Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current || previewMode !== 'single') return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // Hit-test in reverse order (topmost element first) using normalized bounds
    const boundsList = Object.values(elementBounds).reverse();
    const hit = boundsList.find(
      (b) =>
        normX >= b.normX &&
        normX <= b.normX + b.normWidth &&
        normY >= b.normY &&
        normY <= b.normY + b.normHeight
    );

    if (hit) {
      const hitElement = config.elements.find((el) => el.id === hit.id);
      if (hitElement) {
        setConfig((prev) => ({ ...prev, selectedElementId: hit.id }));
        isDraggingRef.current = true;
        dragStartOffsetRef.current = {
          dx: normX - hitElement.x,
          dy: normY - hitElement.y,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Clicked outside elements -> deselect
    setConfig((prev) => ({ ...prev, selectedElementId: null }));
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canvasRef.current || previewMode !== 'single') return;

    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;

    const normX = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const normY = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

    // If dragging an element
    if (isDraggingRef.current && config.selectedElementId) {
      const targetId = config.selectedElementId;
      const newX = Math.max(0.04, Math.min(0.96, normX - dragStartOffsetRef.current.dx));
      const newY = Math.max(0.04, Math.min(0.96, normY - dragStartOffsetRef.current.dy));

      setConfig((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === targetId ? { ...el, x: newX, y: newY } : el
        ),
      }));
      return;
    }

    // Hover hit-test
    const boundsList = Object.values(elementBounds).reverse();
    const hit = boundsList.find(
      (b) =>
        normX >= b.normX &&
        normX <= b.normX + b.normWidth &&
        normY >= b.normY &&
        normY <= b.normY + b.normHeight
    );
    setHoveredElementId(hit ? hit.id : null);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Pointer capture release safety
      }
      // Regenerate result data URL after drag finishes
      if (canvasRef.current) {
        setResultDataUrl(canvasRef.current.toDataURL('image/png'));
      }
    }
  };

  // Keyboard shortcut: Delete key deletes selected element
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // Only if active element is not an input / textarea
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;

        if (config.selectedElementId) {
          handleDeleteElement(config.selectedElementId);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.selectedElementId]);

  // 4. Update / Add / Delete Elements
  const handleUpdateElement = (id: string, partial: Partial<CaptionElement>) => {
    setConfig((prev) => ({
      ...prev,
      elements: prev.elements.map((el) => (el.id === id ? { ...el, ...partial } : el)),
    }));
  };

  const handleAddNewCaption = () => {
    const timestamp = Date.now();
    const newElement: CaptionElement = {
      id: `caption-${timestamp}`,
      type: 'custom',
      name: `추가 자막 ${config.elements.filter((e) => e.type === 'custom').length + 1}`,
      text: '새로운 자막 텍스트',
      x: 0.5,
      y: 0.72,
      align: 'center',
      fontSize: 34,
      fontWeight: 'bold',
      outlineWidth: config.styleId === 'human-theater' ? 2.8 : 0,
      outlineColor: '#000000',
      textColor: config.styleId === 'variety-meme' ? '#fef08a' : '#FFFFFF',
      fontFamily: config.styleId === 'human-theater' ? 'myeongjo' : 'gothic',
      visible: true,
      isDeletable: true,
    };

    setConfig((prev) => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedElementId: newElement.id,
    }));
    toast.success('새 자막이 추가되었습니다. 마우스로 원하는 위치로 드래그하세요.');
  };

  const handleDeleteElement = (id: string) => {
    setConfig((prev) => {
      const el = prev.elements.find((e) => e.id === id);
      if (!el) return prev;

      // Custom elements are removed completely; predefined ones are hidden
      if (el.type === 'custom') {
        return {
          ...prev,
          elements: prev.elements.filter((e) => e.id !== id),
          selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
        };
      }

      return {
        ...prev,
        elements: prev.elements.map((e) => (e.id === id ? { ...e, visible: false } : e)),
        selectedElementId: prev.selectedElementId === id ? null : prev.selectedElementId,
      };
    });
    toast.info('자막 요소가 삭제/숨김 처리되었습니다.');
  };

  const handleRestoreTitleBadge = () => {
    setConfig((prev) => {
      const existing = prev.elements.find((e) => e.type === 'titleBadge');
      if (existing) {
        return {
          ...prev,
          elements: prev.elements.map((e) =>
            e.type === 'titleBadge' ? { ...e, visible: true } : e
          ),
          selectedElementId: existing.id,
        };
      }
      // Re-create title badge
      const newBadge: CaptionElement = {
        id: 'titleBadge',
        type: 'titleBadge',
        name: config.styleId === 'human-theater' ? 'KBS 인간극장 타이틀' : '방송사 로고',
        text: config.styleId === 'human-theater' ? 'KBS 인간극장' : '방송 로고',
        x: 0.9,
        y: 0.08,
        align: 'right',
        fontSize: 24,
        fontWeight: 'bold',
        outlineWidth: config.styleId === 'human-theater' ? 2.4 : 1.5,
        outlineColor: '#000000',
        textColor: '#FFFFFF',
        fontFamily: config.styleId === 'human-theater' ? 'myeongjo' : 'gothic',
        visible: true,
        isDeletable: true,
      };
      return {
        ...prev,
        elements: [...prev.elements, newBadge],
        selectedElementId: newBadge.id,
      };
    });
    toast.success('상단 타이틀 로고가 복원되었습니다.');
  };

  // 5. Presets & Samples Handlers
  const handleSelectSample = (sampleUrl: string) => {
    setImageSrc(sampleUrl);
    if (sampleUrl.includes('514888286974')) {
      setConfig({
        ...DEFAULT_NEWS_CAPTION_CONFIG,
        styleId: 'human-theater',
        elements: createDefaultElementsForStyle('human-theater'),
        selectedElementId: 'headline',
      });
    }
  };

  const handleFileSelect = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageSrc(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStyleChange = (styleId: CaptionStyleId) => {
    const found = CAPTION_STYLES.find((s) => s.id === styleId);
    if (!found) return;

    // Retain current text if already customized
    const currentHeadline = config.elements.find((e) => e.type === 'headline')?.text;
    const currentSub = config.elements.find((e) => e.type === 'subText')?.text;

    const newElements = createDefaultElementsForStyle(
      styleId,
      currentHeadline,
      currentSub,
      found.defaultConfig.badgeText,
      found.defaultConfig.locationText
    );

    setConfig((prev) => ({
      ...prev,
      ...found.defaultConfig,
      styleId,
      elements: newElements,
      selectedElementId: 'headline',
    }));
  };

  const handleApplyMemeQuote = (meme: (typeof MEME_QUOTE_PRESETS)[number]) => {
    const targetStyle = meme.styleId || config.styleId;
    const newElements = createDefaultElementsForStyle(targetStyle, meme.headline, meme.subText);

    setConfig((prev) => ({
      ...prev,
      styleId: targetStyle,
      elements: newElements,
      selectedElementId: 'headline',
    }));
    toast.success(`'${meme.label}' 대사가 적용되었습니다.`);
  };

  const handleDownload = () => {
    if (!resultDataUrl) return;
    downloadDataUrl(resultDataUrl, `news_caption_${config.styleId}_${Date.now()}.png`);
    toast.success('뉴스 자막 이미지가 다운로드되었습니다.');
  };

  const handleCopyToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) return;
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        toast.success('클립보드에 복사되었습니다! 메신저나 SNS에 바로 붙여넣기(Ctrl+V)하세요.');
      });
    } catch {
      toast.error('클립보드 복사를 지원하지 않는 브라우저 환경입니다.');
    }
  };

  const handleShareKakao = async () => {
    if (!resultDataUrl) return;
    setIsSaving(true);
    try {
      const res = await shareToKakaoTalk(
        resultDataUrl,
        '[Ultra Office] 뉴스 자막 스튜디오',
        `news_caption_${Date.now()}.png`
      );
      toast.success(res.message);
    } catch {
      toast.error('카카오톡 공유 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetConfig = () => {
    setConfig({
      ...DEFAULT_NEWS_CAPTION_CONFIG,
      elements: createDefaultElementsForStyle('human-theater'),
      selectedElementId: 'headline',
    });
    toast.info('자막 설정이 기본값으로 초기화되었습니다.');
  };

  // Selected element bounding box in normalized percentages for overlay
  const selectedBounds = useMemo(() => {
    if (!config.selectedElementId || !elementBounds[config.selectedElementId]) return null;
    return elementBounds[config.selectedElementId];
  }, [config.selectedElementId, elementBounds]);

  // Hovered element bounding box in normalized percentages for hover feedback
  const hoveredBounds = useMemo(() => {
    if (!hoveredElementId || !elementBounds[hoveredElementId]) return null;
    return elementBounds[hoveredElementId];
  }, [hoveredElementId, elementBounds]);

  const titleBadgeElement = config.elements.find((e) => e.type === 'titleBadge');

  return (
    <DashboardContent
      disablePadding
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Offscreen / Master Canvas */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!imageSrc ? (
        /* Upload Workspace */
        <Box sx={{ p: { xs: 2, sm: 3 }, height: '100%', overflowY: 'auto' }}>
          <Box sx={{ mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
              <TvRoundedIcon color="primary" sx={{ fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                뉴스 & 인간극장 자막 스튜디오
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              KBS &lt;인간극장&gt; 명조체 감성 다큐 자막부터 지상파 9시 뉴스, YTN/CNN 긴급 속보
              배너까지 사진에 1초 만에 방송 자막을 합성하세요. 자막을 마우스로 잡고 자유롭게 이동할
              수 있습니다.
            </Typography>
          </Box>

          <PhotoUploadWorkspace
            sampleImages={NEWS_SAMPLE_IMAGES}
            onSelectSample={handleSelectSample}
            onFileSelect={handleFileSelect}
            title="방송 자막을 넣을 사진을 업로드하세요"
            subtitle="JPG, PNG, WebP 이미지를 드래그하거나 아래 예시 샘플을 클릭하여 즉시 테스트해 보세요."
            sampleTitle="📺 뉴스 & 다큐멘터리 감성 샘플 샷"
            sampleSubtitle="원하는 분위기의 사진을 선택하면 바로 자막 스튜디오가 실행됩니다."
          />
        </Box>
      ) : (
        /* Full-Screen Caption Studio */
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Top Global Toolbar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            {/* Left: Back & Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ArrowBackRoundedIcon />}
                onClick={() => setImageSrc('')}
                sx={{ fontWeight: 700 }}
              >
                다른 사진
              </Button>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: { xs: 'none', md: 'block' } }}
              >
                뉴스 자막 스튜디오
              </Typography>
              <Chip
                label={CAPTION_STYLES.find((s) => s.id === config.styleId)?.name || '스타일'}
                size="small"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
            </Box>

            {/* Center: Compare & Zoom Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ToggleButtonGroup
                value={previewMode}
                exclusive
                size="small"
                onChange={(_, v) => v && setPreviewMode(v)}
              >
                <ToggleButton value="single" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
                  인터랙티브 편집
                </ToggleButton>
                <ToggleButton value="split" sx={{ px: 1.5, py: 0.5, fontWeight: 700 }}>
                  <CompareArrowsRoundedIcon sx={{ fontSize: 18, mr: 0.5 }} /> 전후 비교
                </ToggleButton>
              </ToggleButtonGroup>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 1 }}>
                <Tooltip title="축소">
                  <IconButton size="small" onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}>
                    <ZoomOutRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Typography
                  variant="caption"
                  sx={{ minWidth: 40, textAlign: 'center', fontWeight: 700 }}
                >
                  {Math.round(zoom * 100)}%
                </Typography>
                <Tooltip title="확대">
                  <IconButton size="small" onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}>
                    <ZoomInRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="화면 맞춤">
                  <IconButton size="small" onClick={() => setZoom(0.9)}>
                    <CenterFocusStrongRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Right: Export actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyRoundedIcon />}
                onClick={handleCopyToClipboard}
                sx={{ fontWeight: 700 }}
              >
                복사
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ShareRoundedIcon />}
                disabled={isSaving}
                onClick={handleShareKakao}
                sx={{ fontWeight: 700 }}
              >
                공유
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                onClick={handleDownload}
                sx={{ fontWeight: 800 }}
              >
                다운로드 (PNG)
              </Button>
            </Box>
          </Box>

          {/* Quick Sample Selector Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              px: 2,
              py: 0.75,
              bgcolor: 'background.neutral',
              borderBottom: '1px solid',
              borderColor: 'divider',
              flexShrink: 0,
              overflowX: 'auto',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              📷 샘플 사진 전환:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {NEWS_SAMPLE_IMAGES.map((sample) => {
                const isActive = imageSrc === sample.url;
                return (
                  <Tooltip key={sample.id} title={`${sample.label} - ${sample.subLabel || ''}`}>
                    <Box
                      onClick={() => handleSelectSample(sample.url)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1,
                        py: 0.4,
                        borderRadius: 1,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        bgcolor: isActive ? 'action.selected' : 'background.paper',
                        boxShadow: isActive ? '0 0 0 2px rgba(37,99,235,0.2)' : 'none',
                        transition: 'all 0.15s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          transform: 'translateY(-1px)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={sample.url}
                        alt={sample.label}
                        sx={{ width: 28, height: 20, borderRadius: 0.5, objectFit: 'cover' }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: isActive ? 800 : 600, whiteSpace: 'nowrap' }}
                      >
                        {sample.label}
                      </Typography>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          {/* Main Body: Interactive Canvas Viewport + Right Options Sidebar */}
          <Box
            sx={{
              display: 'flex',
              flex: '1 1 0px',
              minHeight: 0,
              overflow: 'hidden',
              flexDirection: { xs: 'column', md: 'row' },
            }}
          >
            {/* Viewport Area */}
            <Box
              ref={viewportContainerRef}
              sx={{
                flex: '1 1 0px',
                minWidth: 0,
                minHeight: 0,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                position: 'relative',
                overflow: 'auto',
                userSelect: 'none',
              }}
            >
              {previewMode === 'single' ? (
                resultDataUrl ? (
                  <Box
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: isDraggingRef.current ? 'none' : 'transform 0.15s ease',
                      boxShadow: (theme) => theme.shadows[24],
                      borderRadius: 1,
                      cursor: isDraggingRef.current
                        ? 'grabbing'
                        : hoveredElementId
                          ? 'grab'
                          : 'default',
                    }}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                  >
                    {/* Rendered Image */}
                    <Box
                      component="img"
                      src={resultDataUrl}
                      alt="News Caption Preview"
                      sx={{
                        display: 'block',
                        maxWidth: '82vw',
                        maxHeight: '78vh',
                        objectFit: 'contain',
                        pointerEvents: 'none',
                      }}
                    />

                    {/* Hover Outline for Quick Feedback */}
                    {hoveredBounds && hoveredElementId !== config.selectedElementId && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${hoveredBounds.normX * 100}%`,
                          top: `${hoveredBounds.normY * 100}%`,
                          width: `${hoveredBounds.normWidth * 100}%`,
                          height: `${hoveredBounds.normHeight * 100}%`,
                          border: '1.5px dashed rgba(59, 130, 246, 0.75)',
                          bgcolor: 'rgba(59, 130, 246, 0.06)',
                          pointerEvents: 'none',
                          borderRadius: 0.5,
                          zIndex: 8,
                          transition: 'all 0.08s ease',
                        }}
                      />
                    )}

                    {/* Interactive Selection Bounding Box Overlay */}
                    {selectedBounds && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: `${selectedBounds.normX * 100}%`,
                          top: `${selectedBounds.normY * 100}%`,
                          width: `${selectedBounds.normWidth * 100}%`,
                          height: `${selectedBounds.normHeight * 100}%`,
                          border: '2px dashed #2563eb',
                          bgcolor: 'rgba(37, 99, 235, 0.08)',
                          pointerEvents: 'none',
                          borderRadius: 0.5,
                          zIndex: 10,
                        }}
                      >
                        {/* 4 Corner handles */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -4,
                            left: -4,
                            width: 8,
                            height: 8,
                            bgcolor: '#2563eb',
                            border: '1px solid #ffffff',
                            borderRadius: '50%',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            width: 8,
                            height: 8,
                            bgcolor: '#2563eb',
                            border: '1px solid #ffffff',
                            borderRadius: '50%',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -4,
                            left: -4,
                            width: 8,
                            height: 8,
                            bgcolor: '#2563eb',
                            border: '1px solid #ffffff',
                            borderRadius: '50%',
                          }}
                        />
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            width: 8,
                            height: 8,
                            bgcolor: '#2563eb',
                            border: '1px solid #ffffff',
                            borderRadius: '50%',
                          }}
                        />

                        {/* Floating Element Tag & Quick Delete Button */}
                        <Box
                          onPointerDown={(e) => e.stopPropagation()}
                          sx={{
                            position: 'absolute',
                            top: -28,
                            left: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            bgcolor: 'rgba(15, 23, 42, 0.92)',
                            color: '#FFFFFF',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '11px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            boxShadow: 2,
                            pointerEvents: 'auto',
                          }}
                        >
                          <span>{selectedElement?.name || '선택된 자막'}</span>
                          {selectedElement?.isDeletable !== false && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (config.selectedElementId) {
                                  handleDeleteElement(config.selectedElementId);
                                }
                              }}
                              sx={{
                                p: 0.25,
                                color: '#f87171',
                                '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.2)' },
                              }}
                            >
                              <DeleteRoundedIcon sx={{ fontSize: 13 }} />
                            </IconButton>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : null
              ) : (
                /* Split Comparison */
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PhotoCompareViewport
                    originalSrc={imageSrc}
                    resultSrc={resultDataUrl}
                    splitOrientation={splitOrientation}
                    onSplitOrientationChange={setSplitOrientation}
                    splitMode={splitMode}
                    onSplitModeChange={setSplitMode}
                    splitStart={splitStart}
                    onSplitStartChange={setSplitStart}
                    splitEnd={splitEnd}
                    onSplitEndChange={setSplitEnd}
                  />
                </Box>
              )}
            </Box>

            {/* Controls Sidebar (Internal Scroll) */}
            <Box
              sx={{
                width: { xs: '100%', md: 430 },
                height: '100%',
                bgcolor: 'background.paper',
                borderLeft: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                flexShrink: 0,
                overflowY: 'auto',
                p: 2.5,
                gap: 2.5,
              }}
            >
              {/* Sidebar Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    자막 & 요소 편집
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    드래그하여 위치 이동, 개별 굵기 및 테두리 제어
                  </Typography>
                </Box>
                <Tooltip title="설정 초기화">
                  <IconButton size="small" onClick={handleResetConfig}>
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* 1. Layers & Quick Add Bar */}
              <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1.25,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LayersRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      자막 레이어 목록
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleAddNewCaption}
                    sx={{ fontWeight: 800, fontSize: '11px', py: 0.25 }}
                  >
                    새 자막 추가
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {config.elements.map((el) => {
                    const isSelected = config.selectedElementId === el.id;
                    return (
                      <Box
                        key={el.id}
                        onClick={() => setConfig((p) => ({ ...p, selectedElementId: el.id }))}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'action.selected' : 'background.neutral',
                          cursor: 'pointer',
                          opacity: el.visible ? 1 : 0.45,
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: 'primary.light' },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 800,
                              color: isSelected ? 'primary.main' : 'text.primary',
                              minWidth: 70,
                            }}
                          >
                            {el.name}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {el.text.replace(/\n/g, ' ')}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                          <Tooltip title={el.visible ? '숨기기' : '표시하기'}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateElement(el.id, { visible: !el.visible });
                              }}
                              sx={{ p: 0.25 }}
                            >
                              {el.visible ? (
                                <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                              ) : (
                                <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Tooltip>

                          {el.isDeletable !== false && (
                            <Tooltip title="삭제">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteElement(el.id);
                                }}
                                sx={{ p: 0.25, color: 'error.main' }}
                              >
                                <DeleteRoundedIcon sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Restore Title Badge button if deleted */}
                {(!titleBadgeElement || !titleBadgeElement.visible) && (
                  <Button
                    size="small"
                    variant="text"
                    color="secondary"
                    fullWidth
                    startIcon={<TvRoundedIcon />}
                    onClick={handleRestoreTitleBadge}
                    sx={{ mt: 1, fontWeight: 700, fontSize: '11px' }}
                  >
                    + 상단 방송국 로고 / 'KBS 인간극장' 로고 복원하기
                  </Button>
                )}
              </Card>

              {/* 2. Focused / Selected Element Controls */}
              {selectedElement ? (
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BorderColorRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {selectedElement.name} 정밀 설정
                      </Typography>
                    </Box>
                    {selectedElement.isDeletable !== false && (
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        startIcon={<DeleteRoundedIcon />}
                        onClick={() => handleDeleteElement(selectedElement.id)}
                        sx={{ fontSize: '11px', fontWeight: 700 }}
                      >
                        삭제
                      </Button>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
                    {/* Text Input (Multi-line) */}
                    <TextField
                      label="자막 문구 (줄바꿈 Enter 지원)"
                      multiline
                      minRows={1}
                      maxRows={3}
                      size="small"
                      fullWidth
                      value={selectedElement.text}
                      onChange={(e) =>
                        handleUpdateElement(selectedElement.id, { text: e.target.value })
                      }
                    />

                    {/* Font Weight Toggle */}
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <FormatBoldRoundedIcon sx={{ fontSize: 16 }} />
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          글자 굵기 (Weight)
                        </Typography>
                      </Box>
                      <ToggleButtonGroup
                        value={selectedElement.fontWeight}
                        exclusive
                        size="small"
                        fullWidth
                        onChange={(_, v) =>
                          v &&
                          handleUpdateElement(selectedElement.id, {
                            fontWeight: v as CaptionFontWeight,
                          })
                        }
                      >
                        <ToggleButton
                          value="normal"
                          sx={{ py: 0.5, fontSize: '11.5px', fontWeight: 500 }}
                        >
                          보통 (Normal)
                        </ToggleButton>
                        <ToggleButton
                          value="bold"
                          sx={{ py: 0.5, fontSize: '11.5px', fontWeight: 700 }}
                        >
                          볼드 (Bold)
                        </ToggleButton>
                        <ToggleButton
                          value="900"
                          sx={{ py: 0.5, fontSize: '11.5px', fontWeight: 900 }}
                        >
                          블랙 (Black)
                        </ToggleButton>
                      </ToggleButtonGroup>
                    </Box>

                    {/* Outline / Stroke Width Slider */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          검은색 테두리(외곽선) 두께
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: 'primary.main' }}
                        >
                          {selectedElement.outlineWidth.toFixed(1)}px
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={0}
                        max={12}
                        step={0.2}
                        value={selectedElement.outlineWidth}
                        onChange={(_, v) =>
                          handleUpdateElement(selectedElement.id, { outlineWidth: v as number })
                        }
                      />
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '10px', color: 'text.secondary' }}
                      >
                        * 첨부 사진 인간극장 최적값: 2.4px ~ 3.2px (깔끔하고 또렷한 외곽선)
                      </Typography>
                    </Box>

                    {/* Font Size Slider */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          글자 크기 (Font Size)
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {selectedElement.fontSize}px
                        </Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={16}
                        max={72}
                        step={1}
                        value={selectedElement.fontSize}
                        onChange={(_, v) =>
                          handleUpdateElement(selectedElement.id, { fontSize: v as number })
                        }
                      />
                    </Box>

                    {/* Font Family Selection */}
                    <FormControl size="small" fullWidth>
                      <InputLabel>서체 선택</InputLabel>
                      <Select
                        value={selectedElement.fontFamily}
                        label="서체 선택"
                        onChange={(e) =>
                          handleUpdateElement(selectedElement.id, {
                            fontFamily: e.target.value as FontFamilyChoice,
                          })
                        }
                      >
                        <MenuItem value="myeongjo">명조 / 바탕체 (KBS 인간극장 오리지널)</MenuItem>
                        <MenuItem value="gothic">고딕 / 산세리프 (9시 뉴스 & 현대 방송)</MenuItem>
                        <MenuItem value="retro">복고 / 굴림·돋움 (레트로 방송 & 밈)</MenuItem>
                        <MenuItem value="impact">임팩트 볼드 (CNN & 글로벌 속보)</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Alignment & Colors */}
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                      {/* Alignment */}
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          정렬
                        </Typography>
                        <ToggleButtonGroup
                          value={selectedElement.align}
                          exclusive
                          size="small"
                          fullWidth
                          onChange={(_, v) =>
                            v && handleUpdateElement(selectedElement.id, { align: v })
                          }
                        >
                          <ToggleButton value="left" sx={{ py: 0.25, fontSize: '11px' }}>
                            좌측
                          </ToggleButton>
                          <ToggleButton value="center" sx={{ py: 0.25, fontSize: '11px' }}>
                            가운데
                          </ToggleButton>
                          <ToggleButton value="right" sx={{ py: 0.25, fontSize: '11px' }}>
                            우측
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>

                      {/* Text Color */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          글자색
                        </Typography>
                        <input
                          type="color"
                          value={selectedElement.textColor}
                          onChange={(e) =>
                            handleUpdateElement(selectedElement.id, { textColor: e.target.value })
                          }
                          style={{
                            width: 36,
                            height: 32,
                            borderRadius: 4,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>

                      {/* Outline Color */}
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                        >
                          테두리색
                        </Typography>
                        <input
                          type="color"
                          value={selectedElement.outlineColor}
                          onChange={(e) =>
                            handleUpdateElement(selectedElement.id, {
                              outlineColor: e.target.value,
                            })
                          }
                          style={{
                            width: 36,
                            height: 32,
                            borderRadius: 4,
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              ) : (
                <Card
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    textAlign: 'center',
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    💡 캔버스에서 자막 또는 'KBS 인간극장' 로고를 클릭하면 드래그하여 이동하고
                    굵기/테두리를 수정할 수 있습니다.
                  </Typography>
                </Card>
              )}

              {/* 3. Quick Meme Quotes Presets */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <AutoAwesomeRoundedIcon color="warning" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    인기 밈 대사 원클릭 적용
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                  {MEME_QUOTE_PRESETS.map((m) => (
                    <Chip
                      key={m.label}
                      label={m.label}
                      size="small"
                      variant="outlined"
                      onClick={() => handleApplyMemeQuote(m)}
                      sx={{
                        cursor: 'pointer',
                        fontWeight: 600,
                        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
                      }}
                    />
                  ))}
                </Box>
              </Card>

              {/* 4. Broadcast Style Presets Grid */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  방송 / 다큐 자막 스타일 (9종)
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 1,
                  }}
                >
                  {CAPTION_STYLES.map((st) => {
                    const isSelected = config.styleId === st.id;
                    return (
                      <Card
                        key={st.id}
                        onClick={() => handleStyleChange(st.id)}
                        sx={{
                          p: 1.25,
                          cursor: 'pointer',
                          borderRadius: 1.5,
                          textAlign: 'center',
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : 'divider',
                          bgcolor: isSelected ? 'action.selected' : 'background.paper',
                          transition: 'all 0.15s ease',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            borderColor: 'primary.light',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: '50%',
                            bgcolor: st.themeColor,
                            mx: 'auto',
                            mb: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 800, display: 'block', lineHeight: 1.2 }}
                        >
                          {st.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ fontSize: '10px', color: 'text.secondary' }}
                        >
                          {st.iconTag}
                        </Typography>
                      </Card>
                    );
                  })}
                </Box>
              </Box>

              {/* 5. Broadcast Cinematic Effects & Letterbox */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  화면 연출 & 레터박스
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.enableLetterbox}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, enableLetterbox: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🎬 16:9 시네마틱 레터박스 (상하 블랙 바)
                      </Typography>
                    }
                  />

                  {config.enableLetterbox && (
                    <Box sx={{ pl: 4, pr: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption">레터박스 높이</Typography>
                        <Typography variant="caption">{config.letterboxSize}%</Typography>
                      </Box>
                      <Slider
                        size="small"
                        min={5}
                        max={20}
                        step={1}
                        value={config.letterboxSize}
                        onChange={(_, v) =>
                          setConfig((p) => ({ ...p, letterboxSize: v as number }))
                        }
                      />
                    </Box>
                  )}

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.enableVignette}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, enableVignette: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🌗 하단 다크 비네팅 그라데이션
                      </Typography>
                    }
                  />
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
