'use client';

import type { ThreeJsCanvasRef } from '../components/threejs-canvas';
import type {
  ThreeCategory,
  BackgroundPreset,
  CameraViewPreset,
  ExampleDefinition,
} from '../types';

import dynamic from 'next/dynamic';
import React, { useRef, useMemo, useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CircularProgress from '@mui/material/CircularProgress';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import CameraRoundedIcon from '@mui/icons-material/CameraRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import ViewInArRoundedIcon from '@mui/icons-material/ViewInArRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import FullscreenRoundedIcon from '@mui/icons-material/FullscreenRounded';

import { DashboardContent } from 'src/layouts/dashboard';
import { ThemeSelector } from 'src/components/theme-selector';
import { DEFAULT_THEME_ID, IDE_THEMES } from 'src/sections/code-runner/core/editor-themes';

import { ParameterPanel } from '../components/parameter-panel';
import { CodeExportDialog } from '../components/code-export-dialog';
import { THREE_EXAMPLES, THREE_CATEGORIES } from '../examples/registry';

// ----------------------------------------------------------------------

// Dynamic import with SSR disabled to ensure WebGL context safety
const ThreeJsCanvas = dynamic(
  () => import('../components/threejs-canvas').then((m) => m.ThreeJsCanvas),
  {
    ssr: false,
    loading: () => (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: 2,
          bgcolor: '#090d16',
          color: '#94a3b8',
          borderRadius: 2,
        }}
      >
        <CircularProgress size={40} sx={{ color: '#38bdf8' }} />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          Three.js WebGL 3D 엔진 로딩 중...
        </Typography>
      </Box>
    ),
  }
);

// ----------------------------------------------------------------------

export function ThreeJsView() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const [themeId, setThemeId] = useState<string>(DEFAULT_THEME_ID);
  const [hasLoadedTheme, setHasLoadedTheme] = useState(false);

  const [activeCategory, setActiveCategory] = useState<ThreeCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeExampleId, setActiveExampleId] = useState<string>('geom-primitives');

  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>('dark-studio');
  const [showStats, setShowStats] = useState(true);
  const [showInspector, setShowInspector] = useState(true);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);

  // Dynamic parameters state per active example
  const [customParams, setCustomParams] = useState<Record<string, number | string | boolean>>({});

  const canvasRef = useRef<ThreeJsCanvasRef>(null);

  useEffect(() => {
    setHasLoaded(true);
    try {
      const savedTheme = localStorage.getItem('threejs-theme');
      if (savedTheme && IDE_THEMES.some((t) => t.id === savedTheme)) {
        setThemeId(savedTheme);
      }
    } catch {
      // ignore storage access error
    }
    setHasLoadedTheme(true);
  }, []);

  useEffect(() => {
    if (hasLoadedTheme) {
      try {
        localStorage.setItem('threejs-theme', themeId);
      } catch {
        // ignore storage access error
      }
    }
  }, [themeId, hasLoadedTheme]);

  const activeExample: ExampleDefinition = useMemo(() => {
    const found = THREE_EXAMPLES.find((ex) => ex.id === activeExampleId);
    return found || THREE_EXAMPLES[0];
  }, [activeExampleId]);

  // Sync params when active example changes
  useEffect(() => {
    setCustomParams({ ...activeExample.defaultParams });
  }, [activeExample]);

  const filteredExamples = useMemo(
    () =>
      THREE_EXAMPLES.filter((ex) => {
        const matchCat = activeCategory === 'all' || ex.category === activeCategory;
        const matchSearch =
          !searchQuery ||
          ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ex.badge.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
      }),
    [activeCategory, searchQuery]
  );

  const handleParamChange = (key: string, value: number | string | boolean) => {
    setCustomParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleResetParams = () => {
    setCustomParams({ ...activeExample.defaultParams });
    canvasRef.current?.resetCamera();
  };

  const handleAction = (actionKey: string) => {
    canvasRef.current?.triggerAction(actionKey);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      {/* 1. Header Section */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1.5,
          mb: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
            }}
          >
            <ViewInArRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Three.js 3D 랩 & 스튜디오
              </Typography>
              <Chip
                label={`${THREE_EXAMPLES.length}개 예제 쇼케이스`}
                size="small"
                color="primary"
                sx={{ fontWeight: 800, fontSize: '0.72rem' }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem' }}>
              WebGL 3D 그래픽스, PBR 셰이더, 파티클 VFX, 절차적 지형, 물리 시뮬레이션 및 코드 생성기
            </Typography>
          </Box>
        </Box>

        {/* Global Toolbar Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {/* Background Preset */}
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel sx={{ fontSize: '0.78rem' }}>배경 환경</InputLabel>
            <Select
              value={backgroundPreset}
              label="배경 환경"
              onChange={(e) => setBackgroundPreset(e.target.value as BackgroundPreset)}
              sx={{ fontSize: '0.8rem', height: 34 }}
              startAdornment={
                <PaletteRoundedIcon sx={{ fontSize: 16, mr: 0.8, color: 'text.secondary' }} />
              }
            >
              <MenuItem value="dark-studio" sx={{ fontSize: '0.8rem' }}>
                다크 스튜디오
              </MenuItem>
              <MenuItem value="cyber-grid" sx={{ fontSize: '0.8rem' }}>
                사이버 그리드
              </MenuItem>
              <MenuItem value="starfield" sx={{ fontSize: '0.8rem' }}>
                우주 성간 별자리
              </MenuItem>
              <MenuItem value="sunset" sx={{ fontSize: '0.8rem' }}>
                선셋 오렌지
              </MenuItem>
              <MenuItem value="deep-navy" sx={{ fontSize: '0.8rem' }}>
                딥 네이비
              </MenuItem>
              <MenuItem value="clean-white" sx={{ fontSize: '0.8rem' }}>
                클린 화이트
              </MenuItem>
            </Select>
          </FormControl>

          {/* Camera View Preset */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ fontSize: '0.78rem' }}>카메라 뷰</InputLabel>
            <Select
              defaultValue="perspective"
              label="카메라 뷰"
              onChange={(e) =>
                canvasRef.current?.setCameraPreset(e.target.value as CameraViewPreset)
              }
              sx={{ fontSize: '0.8rem', height: 34 }}
              startAdornment={
                <VideocamRoundedIcon sx={{ fontSize: 16, mr: 0.8, color: 'text.secondary' }} />
              }
            >
              <MenuItem value="perspective" sx={{ fontSize: '0.8rem' }}>
                원근 (기본)
              </MenuItem>
              <MenuItem value="top" sx={{ fontSize: '0.8rem' }}>
                탑 뷰 (Top)
              </MenuItem>
              <MenuItem value="front" sx={{ fontSize: '0.8rem' }}>
                정면 (Front)
              </MenuItem>
              <MenuItem value="side" sx={{ fontSize: '0.8rem' }}>
                측면 (Side)
              </MenuItem>
              <MenuItem value="isometric" sx={{ fontSize: '0.8rem' }}>
                아이소메트릭
              </MenuItem>
            </Select>
          </FormControl>

          {/* Reset Camera */}
          <Tooltip title="카메라 위치 리셋">
            <IconButton
              size="small"
              onClick={() => canvasRef.current?.resetCamera()}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <RestartAltRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Toggle Stats */}
          <Tooltip title="성능 통계 HUD (FPS / 드로우콜)">
            <IconButton
              size="small"
              onClick={() => setShowStats((prev) => !prev)}
              color={showStats ? 'primary' : 'default'}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <SpeedRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Screenshot PNG */}
          <Tooltip title="3D 씬 PNG 스크린샷 캡처">
            <IconButton
              size="small"
              onClick={() => canvasRef.current?.captureScreenshot()}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <CameraRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip title="전체화면 모드">
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{ border: '1px solid', borderColor: 'divider' }}
            >
              <FullscreenRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {/* Code Theme Selector */}
          <ThemeSelector
            currentThemeId={themeId}
            onThemeChange={setThemeId}
            size="small"
            height={34}
            minWidth={140}
          />

          {/* Code Export Dialog Button */}
          <Button
            size="small"
            variant="contained"
            startIcon={<CodeRoundedIcon />}
            onClick={() => setIsCodeDialogOpen(true)}
            sx={{
              fontWeight: 800,
              fontSize: '0.8rem',
              height: 34,
              bgcolor: 'primary.main',
              '&:hover': { bgcolor: 'primary.dark' },
            }}
          >
            코드 내보내기
          </Button>
        </Box>
      </Box>

      {/* 2. Main Workspace Layout */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: showInspector ? '280px 1fr 320px' : '280px 1fr',
          },
          gap: 2,
          flex: '1 1 auto',
          minHeight: 0,
          height: 'calc(100vh - 170px)',
        }}
      >
        {/* LEFT COLUMN: Categories & Example Selector */}
        <Card
          variant="outlined"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            bgcolor: 'background.paper',
            borderRadius: 2,
          }}
        >
          {/* Category Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 1.5, pt: 1 }}>
            <Tabs
              value={activeCategory}
              onChange={(_, val) => setActiveCategory(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 36,
                '& .MuiTab-root': {
                  minHeight: 36,
                  py: 0.5,
                  px: 1.2,
                  fontSize: '0.78rem',
                  fontWeight: 700,
                },
              }}
            >
              <Tab value="all" label="전체 (26)" />
              {THREE_CATEGORIES.map((cat) => (
                <Tab key={cat.id} value={cat.id} label={cat.badge} />
              ))}
            </Tabs>
          </Box>

          {/* Search Box */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="예제 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchRoundedIcon sx={{ fontSize: 18, mr: 0.8, color: 'text.secondary' }} />
                ),
              }}
              sx={{ '& input': { fontSize: '0.8rem', py: 0.8 } }}
            />
          </Box>

          {/* Examples List */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              p: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            {filteredExamples.map((ex, index) => {
              const isSelected = ex.id === activeExample.id;
              return (
                <Box
                  key={ex.id}
                  onClick={() => setActiveExampleId(ex.id)}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    bgcolor: isSelected ? 'primary.lighter' : 'transparent',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : 'transparent',
                    transition: 'all 0.15s ease-in-out',
                    '&:hover': {
                      bgcolor: isSelected ? 'primary.lighter' : 'action.hover',
                    },
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.4,
                  }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? 800 : 600,
                        color: isSelected ? 'primary.dark' : 'text.primary',
                        fontSize: '0.82rem',
                      }}
                    >
                      {index + 1}. {ex.title}
                    </Typography>
                    <Chip
                      label={ex.badge}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 18,
                        fontWeight: 700,
                        bgcolor: isSelected ? 'primary.main' : 'action.selected',
                        color: isSelected ? '#fff' : 'text.secondary',
                      }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '0.72rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {ex.subtitle}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Card>

        {/* CENTER COLUMN: 3D Live WebGL Canvas Viewport */}
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          {/* Top Floating Info Tag */}
          <Box
            sx={{
              position: 'absolute',
              top: 14,
              right: 14,
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Chip
              label={activeExample.badge}
              size="small"
              sx={{
                bgcolor: 'rgba(2, 132, 199, 0.9)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.75rem',
                backdropFilter: 'blur(8px)',
              }}
            />

            <Tooltip title={showInspector ? '인스펙터 패널 접기' : '인스펙터 패널 열기'}>
              <IconButton
                size="small"
                onClick={() => setShowInspector((prev) => !prev)}
                sx={{
                  bgcolor: 'rgba(15, 23, 42, 0.85)',
                  color: '#f8fafc',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  '&:hover': { bgcolor: 'rgba(15, 23, 42, 1)' },
                }}
              >
                <TuneRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* 3D Canvas Engine */}
          <ThreeJsCanvas
            ref={canvasRef}
            example={activeExample}
            params={customParams}
            backgroundPreset={backgroundPreset}
            showStats={showStats}
          />
        </Box>

        {/* RIGHT COLUMN: Real-Time Parameter Tuning Panel */}
        {showInspector && (
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              overflow: 'hidden',
              bgcolor: 'background.paper',
              borderRadius: 2,
            }}
          >
            <ParameterPanel
              example={activeExample}
              params={customParams}
              onParamChange={handleParamChange}
              onAction={handleAction}
              onResetParams={handleResetParams}
            />
          </Card>
        )}
      </Box>

      {/* Code Export Dialog */}
      <CodeExportDialog
        open={isCodeDialogOpen}
        onClose={() => setIsCodeDialogOpen(false)}
        example={activeExample}
        currentParams={customParams}
        themeId={themeId}
        onThemeChange={setThemeId}
      />
    </DashboardContent>
  );
}
