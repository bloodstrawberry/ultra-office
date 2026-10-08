'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { PhotoUploadWorkspace } from 'src/sections/photo/components';
import { shareToKakaoTalk } from 'src/sections/photo/utils/image-processor';

import { loadWebtoonSample, WEBTOON_SAMPLE_IMAGES } from './webtoon-samples';

type LoadedImage = { id: string; name: string; url: string; image: HTMLImageElement };
type ImageLayer = LoadedImage & {
  x: number;
  y: number;
  fit: number;
  size: number;
  rotation: number;
};
type DragState =
  | { mode: 'move'; id: string; startX: number; startY: number; x: number; y: number }
  | { mode: 'resize'; id: string; startDistance: number; size: number; x: number; y: number };

const PANEL_TABS = [
  { id: 'add', label: '이미지 추가' },
  { id: 'edit', label: '이미지 편집' },
  { id: 'layers', label: '레이어 목록' },
] as const;

type PanelTab = (typeof PANEL_TABS)[number]['id'];

function readImage(file: File): Promise<LoadedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error(`${file.name}: 이미지 파일이 아닙니다.`));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth && image.naturalHeight) {
        resolve({ id: crypto.randomUUID(), name: file.name, url, image });
      } else {
        URL.revokeObjectURL(url);
        reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
    };
    image.src = url;
  });
}

function layerDimensions(layer: ImageLayer) {
  const factor = (layer.fit * layer.size) / 100;
  return { width: layer.image.naturalWidth * factor, height: layer.image.naturalHeight * factor };
}

function cornerPosition(layer: ImageLayer, corner: number) {
  const { width, height } = layerDimensions(layer);
  const angle = (layer.rotation * Math.PI) / 180;
  const dx = ((corner === 0 || corner === 3 ? -1 : 1) * width) / 2;
  const dy = ((corner < 2 ? -1 : 1) * height) / 2;
  return {
    x: layer.x + dx * Math.cos(angle) - dy * Math.sin(angle),
    y: layer.y + dx * Math.sin(angle) + dy * Math.cos(angle),
  };
}

function drawComposite(
  canvas: HTMLCanvasElement,
  base: LoadedImage,
  layers: ImageLayer[],
  selectedId: string | null,
  showSelection: boolean
) {
  const width = base.image.naturalWidth;
  const height = base.image.naturalHeight;
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(base.image, 0, 0);

  layers.forEach((layer) => {
    const dimensions = layerDimensions(layer);
    ctx.save();
    ctx.translate(layer.x, layer.y);
    ctx.rotate((layer.rotation * Math.PI) / 180);
    ctx.drawImage(
      layer.image,
      -dimensions.width / 2,
      -dimensions.height / 2,
      dimensions.width,
      dimensions.height
    );
    ctx.restore();
  });

  const selected = showSelection ? layers.find((layer) => layer.id === selectedId) : null;
  if (!selected) return;
  const corners = [0, 1, 2, 3].map((index) => cornerPosition(selected, index));
  const lineWidth = Math.max(2, Math.min(width, height) / 350);
  ctx.save();
  ctx.strokeStyle = '#4f46e5';
  ctx.fillStyle = '#ffffff';
  ctx.lineWidth = lineWidth;
  ctx.setLineDash([lineWidth * 3, lineWidth * 2]);
  ctx.beginPath();
  corners.forEach((corner, index) => {
    if (index === 0) ctx.moveTo(corner.x, corner.y);
    else ctx.lineTo(corner.x, corner.y);
  });
  ctx.closePath();
  ctx.stroke();
  ctx.setLineDash([]);
  corners.forEach((corner) => {
    ctx.fillRect(corner.x - lineWidth * 3, corner.y - lineWidth * 3, lineWidth * 6, lineWidth * 6);
    ctx.strokeRect(
      corner.x - lineWidth * 3,
      corner.y - lineWidth * 3,
      lineWidth * 6,
      lineWidth * 6
    );
  });
  ctx.restore();
}

function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) * canvas.width) / rect.width,
    y: ((event.clientY - rect.top) * canvas.height) / rect.height,
  };
}

function containsPoint(layer: ImageLayer, x: number, y: number) {
  const angle = (-layer.rotation * Math.PI) / 180;
  const dx = x - layer.x;
  const dy = y - layer.y;
  const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
  const localY = dx * Math.sin(angle) + dy * Math.cos(angle);
  const { width, height } = layerDimensions(layer);
  return Math.abs(localX) <= width / 2 && Math.abs(localY) <= height / 2;
}

export function WebtoonMergeView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const urlsRef = useRef(new Set<string>());
  const dragRef = useRef<DragState | null>(null);
  const [base, setBase] = useState<LoadedImage | null>(null);
  const [layers, setLayers] = useState<ImageLayer[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<PanelTab>('add');
  const [rightPanelWidth, setRightPanelWidth] = useState(380);
  const dividerRef = useRef<{ startX: number; width: number } | null>(null);
  const selected = layers.find((layer) => layer.id === selectedId) ?? null;

  useEffect(
    () => () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current.clear();
    },
    []
  );

  useEffect(() => {
    if (base && canvasRef.current) drawComposite(canvasRef.current, base, layers, selectedId, true);
  }, [base, layers, selectedId]);

  const addFiles = async (files: File[]) => {
    if (!base || !files.length) return;
    const results = await Promise.allSettled(files.map(readImage));
    const added: ImageLayer[] = [];
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        toast.error(
          result.reason instanceof Error ? result.reason.message : '이미지를 읽을 수 없습니다.'
        );
        return;
      }
      const item = result.value;
      urlsRef.current.add(item.url);
      const fit = Math.min(
        1,
        (base.image.naturalWidth * 0.45) / item.image.naturalWidth,
        (base.image.naturalHeight * 0.45) / item.image.naturalHeight
      );
      added.push({
        ...item,
        x: base.image.naturalWidth / 2 + index * 24,
        y: base.image.naturalHeight / 2 + index * 24,
        fit,
        size: 100,
        rotation: 0,
      });
    });
    if (added.length) {
      setLayers((current) => [...current, ...added]);
      setSelectedId(added[added.length - 1].id);
      setActiveTab('edit');
    }
  };

  const loadBase = async (file: File) => {
    try {
      const loaded = await readImage(file);
      urlsRef.current.add(loaded.url);
      setBase(loaded);
      setLayers([]);
      setSelectedId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지를 읽을 수 없습니다.');
    }
  };

  const reset = () => {
    dragRef.current = null;
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current.clear();
    setBase(null);
    setLayers([]);
    setSelectedId(null);
    setActiveTab('add');
  };

  const updateSelected = (change: Partial<Pick<ImageLayer, 'size' | 'rotation'>>) => {
    if (!selectedId) return;
    setLayers((current) =>
      current.map((layer) => (layer.id === selectedId ? { ...layer, ...change } : layer))
    );
  };

  const removeSelected = () => {
    if (!selected) return;
    URL.revokeObjectURL(selected.url);
    urlsRef.current.delete(selected.url);
    setLayers((current) => current.filter((layer) => layer.id !== selected.id));
    setSelectedId(null);
    setActiveTab('add');
  };

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const point = canvasPoint(event, canvas);
    const bounds = canvas.getBoundingClientRect();
    const hitRadius = (12 * canvas.width) / bounds.width;
    if (selected) {
      const handle = [0, 1, 2, 3].find((corner) => {
        const position = cornerPosition(selected, corner);
        return Math.hypot(point.x - position.x, point.y - position.y) <= hitRadius;
      });
      if (handle !== undefined) {
        dragRef.current = {
          mode: 'resize',
          id: selected.id,
          x: selected.x,
          y: selected.y,
          startDistance: Math.max(1, Math.hypot(point.x - selected.x, point.y - selected.y)),
          size: selected.size,
        };
        canvas.setPointerCapture(event.pointerId);
        return;
      }
    }
    const hit = [...layers].reverse().find((layer) => containsPoint(layer, point.x, point.y));
    setSelectedId(hit?.id ?? null);
    if (hit) {
      dragRef.current = {
        mode: 'move',
        id: hit.id,
        startX: point.x,
        startY: point.y,
        x: hit.x,
        y: hit.y,
      };
      canvas.setPointerCapture(event.pointerId);
    }
  };

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    const canvas = canvasRef.current;
    if (!drag || !canvas) return;
    const point = canvasPoint(event, canvas);
    setLayers((current) =>
      current.map((layer) => {
        if (layer.id !== drag.id) return layer;
        if (drag.mode === 'move') {
          return { ...layer, x: drag.x + point.x - drag.startX, y: drag.y + point.y - drag.startY };
        }
        const distance = Math.hypot(point.x - drag.x, point.y - drag.y);
        return {
          ...layer,
          size: Math.round(
            Math.max(10, Math.min(400, (drag.size * distance) / drag.startDistance))
          ),
        };
      })
    );
  };

  const exportPng = async () => {
    if (!base || exporting) return;
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      drawComposite(canvas, base, layers, null, false);
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => (value ? resolve(value) : reject(new Error('PNG 파일을 만들 수 없습니다.'))),
          'image/png'
        );
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `webtoon_merged_${Date.now()}.png`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      toast.success('결과물을 PNG로 저장했습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '이미지를 저장하지 못했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const shareResult = async () => {
    if (!base || exporting) return;
    setExporting(true);
    try {
      const canvas = document.createElement('canvas');
      drawComposite(canvas, base, layers, null, false);
      const result = await shareToKakaoTalk(
        canvas.toDataURL('image/png'),
        '[Ultra Office] 웹툰 이미지 합치기 작품',
        `webtoon_merged_${Date.now()}.png`
      );
      toast.success(result.message);
    } catch {
      toast.error('공유 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 3 },
      }}
    >
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          웹툰 이미지 합치기
        </Typography>
        <Typography variant="body2" color="text.secondary">
          원본 위에 이미지를 추가하고 위치·크기·회전을 조절해 한 장의 PNG로 저장하세요.
        </Typography>
      </Box>

      {!base ? (
        <PhotoUploadWorkspace
          sampleImages={WEBTOON_SAMPLE_IMAGES}
          onSelectSample={(url) => {
            void loadWebtoonSample(url)
              .then(loadBase)
              .catch(() => toast.error('예시 이미지를 불러오지 못했습니다.'));
          }}
          onFileSelect={(file) => {
            void loadBase(file);
          }}
          title="원본 웹툰/사진 업로드"
          subtitle="이미지를 드래그하거나 클릭하여 원본을 올려주세요."
          icon={<LayersRoundedIcon sx={{ fontSize: 36 }} />}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pr: { md: 1 },
            }}
          >
            <Card
              onDragEnter={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node))
                  setDragActive(false);
              }}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                void addFiles(Array.from(event.dataTransfer.files));
              }}
              sx={{
                p: { xs: 1.5, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minWidth: 0,
                minHeight: { xs: 420, md: 0 },
                height: '100%',
                overflow: 'hidden',
                border: dragActive ? '2px dashed' : undefined,
                borderColor: 'primary.main',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 1.5, flexShrink: 0 }}
              >
                <Chip
                  size="small"
                  label={`${base.image.naturalWidth} × ${base.image.naturalHeight} px`}
                  variant="outlined"
                />
                <Chip
                  size="small"
                  label={`추가 이미지 ${layers.length}개`}
                  color="primary"
                  variant="soft"
                />
              </Stack>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'auto',
                  p: 1,
                  position: 'relative',
                }}
              >
                <canvas
                  ref={canvasRef}
                  onPointerDown={pointerDown}
                  onPointerMove={pointerMove}
                  onPointerUp={() => {
                    dragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null;
                  }}
                  style={{
                    display: 'block',
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: 'calc(100vh - 280px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,.2)',
                    touchAction: 'none',
                    cursor: 'move',
                  }}
                  aria-label="이미지 합치기 캔버스"
                />
                {dragActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.lighter',
                      opacity: 0.9,
                      pointerEvents: 'none',
                      zIndex: 1,
                    }}
                  >
                    <Typography fontWeight={700}>이미지를 놓아 추가하기</Typography>
                  </Box>
                )}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                textAlign="center"
                sx={{ mt: 1, flexShrink: 0, fontSize: '0.72rem' }}
              >
                이미지를 끌어와 추가 · 캔버스에서 드래그하여 이동 · 모서리를 드래그하여 크기 조절
              </Typography>
            </Card>
          </Box>

          <Box
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              dividerRef.current = { startX: event.clientX, width: rightPanelWidth };
            }}
            onPointerMove={(event) => {
              const drag = dividerRef.current;
              if (drag)
                setRightPanelWidth(
                  Math.max(300, Math.min(650, drag.width + drag.startX - event.clientX))
                );
            }}
            onPointerUp={() => {
              dividerRef.current = null;
            }}
            onPointerCancel={() => {
              dividerRef.current = null;
            }}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 16,
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              flexShrink: 0,
              '&:hover .divider-bar': { bgcolor: 'primary.main', width: '3px' },
            }}
          >
            <Box
              className="divider-bar"
              sx={{ width: '2px', height: '100%', bgcolor: 'divider', borderRadius: '1px' }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${rightPanelWidth}px` },
              minWidth: { md: `${rightPanelWidth}px` },
              maxWidth: { md: `${rightPanelWidth}px` },
              flexShrink: 0,
              gap: 1.25,
              minHeight: 0,
              height: '100%',
              overflow: { xs: 'auto', md: 'hidden' },
              pl: { md: 1 },
              pr: 0.5,
            }}
          >
            <Card
              sx={{
                p: { xs: 1.75, sm: 2 },
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
                height: '100%',
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(event) => {
                  void addFiles(Array.from(event.target.files ?? []));
                  event.target.value = '';
                }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.75, flexShrink: 0 }}>
                이미지 합치기 컨트롤
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.25, flexShrink: 0 }}>
                {PANEL_TABS.map((tab) => (
                  <Chip
                    key={tab.id}
                    label={tab.label}
                    size="small"
                    clickable
                    color={activeTab === tab.id ? 'primary' : 'default'}
                    variant={activeTab === tab.id ? 'filled' : 'outlined'}
                    onClick={() => setActiveTab(tab.id)}
                    sx={{ fontWeight: 600, fontSize: '0.72rem', height: 26 }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: '1 1 0px',
                  minHeight: 0,
                  overflowY: 'auto',
                  pr: 0.5,
                  mb: 1.25,
                  '&::-webkit-scrollbar': { width: '5px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: '3px' },
                }}
              >
                {activeTab === 'add' && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                    <Typography variant="body2" color="text.secondary">
                      원본 이미지 위에 올릴 이미지를 불러오세요. 여러 장을 한 번에 선택하거나 왼쪽
                      캔버스에 드래그 &amp; 드롭할 수 있습니다.
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<AddPhotoAlternateRoundedIcon />}
                      onClick={() => fileRef.current?.click()}
                    >
                      이미지 불러오기
                    </Button>
                  </Box>
                )}
                {activeTab === 'edit' &&
                  (selected ? (
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ mb: 1 }}
                      >
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {selected.name}
                        </Typography>
                        <IconButton
                          aria-label="선택한 이미지 삭제"
                          color="error"
                          size="small"
                          onClick={removeSelected}
                        >
                          <DeleteRoundedIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                      <Typography variant="body2">크기 {selected.size}%</Typography>
                      <Slider
                        size="small"
                        min={10}
                        max={400}
                        value={selected.size}
                        onChange={(_, value) => updateSelected({ size: value as number })}
                        aria-label="추가 이미지 크기"
                      />
                      <Typography variant="body2">회전 {selected.rotation}°</Typography>
                      <Slider
                        size="small"
                        min={-180}
                        max={180}
                        value={selected.rotation}
                        onChange={(_, value) => updateSelected({ rotation: value as number })}
                        aria-label="추가 이미지 회전"
                      />
                      <Button
                        size="small"
                        onClick={() => updateSelected({ size: 100, rotation: 0 })}
                      >
                        크기·회전 초기화
                      </Button>
                    </Box>
                  ) : (
                    <Box sx={{ py: 5, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        캔버스나 레이어 목록에서 편집할 이미지를 선택하세요.
                      </Typography>
                      <Button size="small" sx={{ mt: 1.5 }} onClick={() => setActiveTab('add')}>
                        이미지 추가하기
                      </Button>
                    </Box>
                  ))}
                {activeTab === 'layers' && (
                  <Box>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="small"
                      startIcon={<AddPhotoAlternateRoundedIcon />}
                      onClick={() => fileRef.current?.click()}
                      sx={{ mb: 1.25 }}
                    >
                      이미지 추가
                    </Button>
                    {layers.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        아직 추가된 이미지가 없습니다.
                      </Typography>
                    )}
                    <Stack spacing={0.75}>
                      {[...layers].reverse().map((layer) => (
                        <Box
                          key={layer.id}
                          onClick={() => {
                            setSelectedId(layer.id);
                            setActiveTab('edit');
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            p: 0.75,
                            border: '1px solid',
                            borderColor: selectedId === layer.id ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            cursor: 'pointer',
                            bgcolor: selectedId === layer.id ? 'action.selected' : 'transparent',
                          }}
                        >
                          <Box
                            component="img"
                            src={layer.url}
                            alt=""
                            sx={{
                              width: 40,
                              height: 40,
                              objectFit: 'contain',
                              bgcolor: 'background.neutral',
                              borderRadius: 0.5,
                            }}
                          />
                          <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                            {layer.name}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Card>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85, flexShrink: 0 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  color="inherit"
                  size="small"
                  onClick={reset}
                  startIcon={<RefreshRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  다른 사진
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  size="small"
                  onClick={() => {
                    void shareResult();
                  }}
                  disabled={exporting}
                  startIcon={<ShareRoundedIcon sx={{ fontSize: 18 }} />}
                  sx={{ py: 0.75, borderRadius: 1.5, fontWeight: 600, fontSize: '0.8rem' }}
                >
                  공유
                </Button>
              </Box>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => {
                  void exportPng();
                }}
                disabled={exporting}
                startIcon={
                  exporting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1, borderRadius: 2, fontWeight: 700, fontSize: '0.88rem' }}
              >
                결과물 저장 (PNG)
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}

export default WebtoonMergeView;
