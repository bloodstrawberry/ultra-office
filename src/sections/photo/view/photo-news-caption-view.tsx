'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

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
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TvRoundedIcon from '@mui/icons-material/LiveTvRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import FormatColorTextRoundedIcon from '@mui/icons-material/FormatColorTextRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import CenterFocusStrongRoundedIcon from '@mui/icons-material/CenterFocusStrongRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  CAPTION_STYLES,
  type CaptionStyleId,
  NEWS_SAMPLE_IMAGES,
  MEME_QUOTE_PRESETS,
  type NewsCaptionConfig,
  type FontFamilyChoice,
  DEFAULT_NEWS_CAPTION_CONFIG,
} from '../utils/news-caption-presets';
import {
  type SplitMode,
  PhotoUploadWorkspace,
  PhotoCompareViewport,
  type SplitOrientation,
  type ComparePreviewMode,
} from '../components';
import { renderNewsCaption } from '../utils/news-caption-renderer';
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

  // Hidden/Offscreen rendering canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  // 2. Real-time render when image or config updates
  const updateRender = useCallback(() => {
    if (!originalImage || !canvasRef.current) return;
    renderNewsCaption(canvasRef.current, originalImage, config);
    setResultDataUrl(canvasRef.current.toDataURL('image/png'));
  }, [originalImage, config]);

  useEffect(() => {
    updateRender();
  }, [updateRender]);

  // 3. Handlers
  const handleSelectSample = (sampleUrl: string) => {
    setImageSrc(sampleUrl);
    // If it's the empty fridge cat sample, default to Human Theater & "계란이 다 떨어졌다"
    if (sampleUrl.includes('514888286974')) {
      setConfig({
        ...DEFAULT_NEWS_CAPTION_CONFIG,
        styleId: 'human-theater',
        headline: '"계란이 다 떨어졌다"',
        subText: '시능지(23) / 자취생',
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
    setConfig((prev) => ({
      ...prev,
      ...found.defaultConfig,
      styleId,
      // Preserve current text if already customized, unless blank
      headline: prev.headline || (found.defaultConfig.headline as string),
      subText: prev.subText || (found.defaultConfig.subText as string),
    }));
  };

  const handleApplyMemeQuote = (meme: (typeof MEME_QUOTE_PRESETS)[number]) => {
    setConfig((prev) => ({
      ...prev,
      headline: meme.headline,
      subText: meme.subText,
      ...(meme.styleId ? { styleId: meme.styleId } : {}),
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
    setConfig(DEFAULT_NEWS_CAPTION_CONFIG);
    toast.info('자막 설정이 기본값으로 초기화되었습니다.');
  };

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
      {/* Hidden Master Canvas */}
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
              배너까지 사진에 1초 만에 방송 자막을 합성하세요.
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
                  완성본
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

          {/* Main Body: Canvas Viewport + Right Options Sidebar */}
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
              }}
            >
              {previewMode === 'single' ? (
                /* Single Preview */
                resultDataUrl ? (
                  <Box
                    component="img"
                    src={resultDataUrl}
                    alt="News Caption Preview"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      transform: `scale(${zoom})`,
                      transformOrigin: 'center center',
                      transition: 'transform 0.15s ease',
                      boxShadow: (theme) => theme.shadows[24],
                      borderRadius: 1,
                    }}
                  />
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
                width: { xs: '100%', md: 420 },
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
                    자막 커스터마이징
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    실시간 렌더링 & 스타일 정밀 제어
                  </Typography>
                </Box>
                <Tooltip title="설정 초기화">
                  <IconButton size="small" onClick={handleResetConfig}>
                    <RefreshRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* 1. Quick Meme Presets */}
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

              {/* 2. Broadcast Caption Style Presets Grid */}
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

              {/* 3. Text Content Inputs */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <FormatQuoteRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    자막 문구 입력
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <TextField
                    label="메인 대사 / 뉴스 헤드라인"
                    placeholder='예: "계란이 다 떨어졌다"'
                    size="small"
                    fullWidth
                    value={config.headline}
                    onChange={(e) => setConfig((p) => ({ ...p, headline: e.target.value }))}
                  />

                  <TextField
                    label="인물 정보 / 기자 소속"
                    placeholder="예: 시능지(23) / 자취생 또는 홍길동 기자 / 사회부"
                    size="small"
                    fullWidth
                    value={config.subText}
                    onChange={(e) => setConfig((p) => ({ ...p, subText: e.target.value }))}
                  />

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="뱃지 / 카테고리"
                      placeholder="예: [단독], [속보], 인간극장"
                      size="small"
                      fullWidth
                      value={config.badgeText}
                      onChange={(e) => setConfig((p) => ({ ...p, badgeText: e.target.value }))}
                    />
                    <TextField
                      label="위치 / 시간 / LIVE"
                      placeholder="예: ● LIVE 서울"
                      size="small"
                      fullWidth
                      value={config.locationText}
                      onChange={(e) => setConfig((p) => ({ ...p, locationText: e.target.value }))}
                    />
                  </Box>
                </Box>
              </Card>

              {/* 4. Typography & Layout Controls */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <FormatColorTextRoundedIcon color="secondary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    서체 및 레이아웃 제어
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>서체 선택 (Font Family)</InputLabel>
                    <Select
                      value={config.fontFamily}
                      label="서체 선택 (Font Family)"
                      onChange={(e) =>
                        setConfig((p) => ({ ...p, fontFamily: e.target.value as FontFamilyChoice }))
                      }
                    >
                      <MenuItem value="myeongjo">명조 / 바탕체 (KBS 인간극장 오리지널)</MenuItem>
                      <MenuItem value="gothic">고딕 / 산세리프 (9시 뉴스 & 현대 방송)</MenuItem>
                      <MenuItem value="retro">복고 / 굴림·돋움 (레트로 방송 & 밈)</MenuItem>
                      <MenuItem value="impact">임팩트 볼드 (CNN & 글로벌 속보)</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Font Scale Slider */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        자막 크기 배율
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {Math.round(config.fontSizeScale * 100)}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0.6}
                      max={1.6}
                      step={0.05}
                      value={config.fontSizeScale}
                      onChange={(_, v) => setConfig((p) => ({ ...p, fontSizeScale: v as number }))}
                    />
                  </Box>

                  {/* Outline Width Slider */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        외곽선(Stroke) 두께
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {config.outlineWidth}px
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={16}
                      step={1}
                      value={config.outlineWidth}
                      onChange={(_, v) => setConfig((p) => ({ ...p, outlineWidth: v as number }))}
                    />
                  </Box>

                  {/* Bottom Offset Slider */}
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        하단 여백 위치 (Y Offset)
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {config.bottomOffset}%
                      </Typography>
                    </Box>
                    <Slider
                      size="small"
                      min={0}
                      max={35}
                      step={1}
                      value={config.bottomOffset}
                      onChange={(_, v) => setConfig((p) => ({ ...p, bottomOffset: v as number }))}
                    />
                  </Box>

                  {/* Text Alignment */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                      텍스트 정렬
                    </Typography>
                    <ToggleButtonGroup
                      value={config.textAlign}
                      exclusive
                      size="small"
                      onChange={(_, v) => v && setConfig((p) => ({ ...p, textAlign: v }))}
                    >
                      <ToggleButton value="center" sx={{ px: 2, py: 0.25, fontSize: '12px' }}>
                        가운데 정렬
                      </ToggleButton>
                      <ToggleButton value="left" sx={{ px: 2, py: 0.25, fontSize: '12px' }}>
                        좌측 정렬
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Box>
              </Card>

              {/* 5. Broadcast Cinematic Effects & Watermarks */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  방송 연출 효과 & 레터박스
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
                        🌗 하단 다크 비네팅 그라데이션 (가독성 향상)
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.showStationLogo}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, showStationLogo: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        📺 방송국 로고 / 인간극장 타이틀 워터마크
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={config.showLiveBadge}
                        onChange={(e) =>
                          setConfig((p) => ({ ...p, showLiveBadge: e.target.checked }))
                        }
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        🔴 LIVE / 시간 인디케이터 위젯
                      </Typography>
                    }
                  />
                </Box>
              </Card>

              {/* 6. Color Customization */}
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
                  색상 커스터마이징
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      글자 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={config.textColor}
                        onChange={(e) => setConfig((p) => ({ ...p, textColor: e.target.value }))}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption">{config.textColor}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      외곽선 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={config.outlineColor}
                        onChange={(e) => setConfig((p) => ({ ...p, outlineColor: e.target.value }))}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption">{config.outlineColor}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      포인트 뱃지 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={config.accentColor}
                        onChange={(e) => setConfig((p) => ({ ...p, accentColor: e.target.value }))}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption">{config.accentColor}</Typography>
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      배너 주 색상
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input
                        type="color"
                        value={config.bannerColor.startsWith('#') ? config.bannerColor : '#1e3a8a'}
                        onChange={(e) => setConfig((p) => ({ ...p, bannerColor: e.target.value }))}
                        style={{
                          width: 36,
                          height: 32,
                          borderRadius: 4,
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      />
                      <Typography variant="caption">
                        {config.bannerColor.startsWith('#') ? config.bannerColor : '기본값'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
