'use client';

import type { PlotOutput, SystemDiagnosticInfo } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import InsertChartOutlinedRoundedIcon from '@mui/icons-material/InsertChartOutlinedRounded';

import { getThemeById } from '../core/editor-themes';

// ----------------------------------------------------------------------

export interface PreviewPanelProps {
  themeId?: string;
  previewUrl: string | null;
  htmlContent?: string;
  isServerRunning: boolean;
  activePort?: number | null;
  plots: PlotOutput[];
  onClearPlots: () => void;
  systemInfo: SystemDiagnosticInfo;
}

export function PreviewPanel({
  themeId = 'vs-dark',
  previewUrl,
  htmlContent,
  isServerRunning,
  activePort,
  plots,
  onClearPlots,
  systemInfo,
}: PreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'preview' | 'plots' | 'info'>('preview');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'responsive' | 'mobile' | 'tablet'>('responsive');

  const activeTheme = getThemeById(themeId);

  const handleRefresh = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenNewTab = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank');
    }
  };

  const handleDownloadPlot = (plot: PlotOutput) => {
    const a = document.createElement('a');
    a.href = plot.dataUrl;
    a.download = `${plot.title || 'plot'}-${Date.now()}.png`;
    a.click();
  };

  const effectiveWidth = viewMode === 'mobile' ? '375px' : viewMode === 'tablet' ? '768px' : '100%';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        bgcolor: activeTheme.uiColors.bg,
        borderLeft: `1px solid ${activeTheme.uiColors.border}`,
        overflow: 'hidden',
      }}
    >
      {/* Top Tabs */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          bgcolor: activeTheme.uiColors.surface,
          borderBottom: `1px solid ${activeTheme.uiColors.border}`,
          minHeight: 40,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          sx={{
            minHeight: 34,
            '& .MuiTab-root': {
              minHeight: 34,
              py: 0.5,
              px: 1.2,
              fontSize: '12px',
              fontWeight: 600,
              color: activeTheme.uiColors.textMuted,
              '&.Mui-selected': {
                color: activeTheme.previewAccent,
              },
            },
            '& .MuiTabs-indicator': {
              backgroundColor: activeTheme.previewAccent,
            },
          }}
        >
          <Tab
            value="preview"
            icon={<LanguageRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="웹 미리보기"
          />
          <Tab
            value="plots"
            icon={<InsertChartOutlinedRoundedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label={`그래프 / 차트 (${plots.length})`}
          />
          <Tab
            value="info"
            icon={<InfoOutlinedIcon sx={{ fontSize: 16 }} />}
            iconPosition="start"
            label="시스템 진단"
          />
        </Tabs>

        {activeTab === 'preview' && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Tooltip title="반응형 크기 전환">
              <IconButton
                size="small"
                onClick={() =>
                  setViewMode((prev) =>
                    prev === 'responsive' ? 'tablet' : prev === 'tablet' ? 'mobile' : 'responsive'
                  )
                }
                sx={{
                  color: activeTheme.uiColors.textMuted,
                  '&:hover': { color: activeTheme.uiColors.text },
                }}
              >
                <DevicesRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="미리보기 새로고침">
              <IconButton
                size="small"
                onClick={handleRefresh}
                sx={{
                  color: activeTheme.uiColors.textMuted,
                  '&:hover': { color: activeTheme.uiColors.text },
                }}
              >
                <RefreshRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            {previewUrl && (
              <Tooltip title="새 탭에서 열기">
                <IconButton
                  size="small"
                  onClick={handleOpenNewTab}
                  sx={{
                    color: activeTheme.uiColors.textMuted,
                    '&:hover': { color: activeTheme.uiColors.text },
                  }}
                >
                  <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>

      {/* Tab 1: Web Preview */}
      {activeTab === 'preview' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            width: '100%',
            overflow: 'hidden',
          }}
        >
          {/* Address Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.6,
              bgcolor: activeTheme.uiColors.surface,
              borderBottom: `1px solid ${activeTheme.uiColors.border}`,
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: isServerRunning || htmlContent ? '#10b981' : '#94a3b8',
                boxShadow: isServerRunning || htmlContent ? '0 0 8px #10b981' : 'none',
              }}
            />
            <Box
              sx={{
                flex: 1,
                bgcolor: activeTheme.uiColors.card,
                borderRadius: '6px',
                px: 1.5,
                py: 0.4,
                border: `1px solid ${activeTheme.uiColors.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: activeTheme.uiColors.textMuted, fontFamily: 'monospace' }}
              >
                {previewUrl ||
                  (htmlContent
                    ? 'sandbox://local-live-preview'
                    : 'http://localhost:3000 (대기 중)')}
              </Typography>
              {activePort && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: `${activeTheme.previewAccent}25`,
                    color: activeTheme.previewAccent,
                    px: 0.8,
                    py: 0.1,
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                  }}
                >
                  PORT {activePort}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Viewport Area */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: activeTheme.uiColors.bg,
              p: viewMode !== 'responsive' ? 1.5 : 0,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: effectiveWidth,
                height: '100%',
                bgcolor: '#ffffff',
                borderRadius: viewMode !== 'responsive' ? '8px' : 0,
                overflow: 'hidden',
                boxShadow:
                  viewMode !== 'responsive'
                    ? activeTheme.isDark
                      ? '0 10px 30px rgba(0,0,0,0.6)'
                      : '0 10px 30px rgba(0,0,0,0.15)'
                    : 'none',
                position: 'relative',
                transition: 'width 0.25s ease',
              }}
            >
              {previewUrl ? (
                <iframe
                  key={iframeKey}
                  src={previewUrl}
                  title="Live Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : htmlContent ? (
                <iframe
                  key={iframeKey}
                  srcDoc={htmlContent}
                  title="HTML Sandbox"
                  sandbox="allow-scripts allow-modals allow-same-origin"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: activeTheme.uiColors.card,
                    color: activeTheme.uiColors.textMuted,
                    p: 3,
                    textAlign: 'center',
                    gap: 1.5,
                  }}
                >
                  <LanguageRoundedIcon sx={{ fontSize: 44, color: activeTheme.uiColors.border }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ color: activeTheme.uiColors.text, fontWeight: 600 }}
                  >
                    실시간 웹 미리보기 대기 중
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ maxWidth: 320, color: activeTheme.uiColors.textMuted }}
                  >
                    Node.js Express 서버, React 컴포넌트, 또는 HTML 템플릿을 선택하고{' '}
                    <b>[▶ 실행]</b> 버튼을 누르면 이곳에 실시간 웹 페이지가 렌더링됩니다.
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Tab 2: Plots / Charts */}
      {activeTab === 'plots' && (
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: activeTheme.uiColors.bg,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              variant="caption"
              sx={{ color: activeTheme.uiColors.textMuted, fontWeight: 600 }}
            >
              생성된 차트 ({plots.length}개)
            </Typography>
            {plots.length > 0 && (
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />}
                onClick={onClearPlots}
                sx={{
                  fontSize: '11px',
                  py: 0.2,
                  px: 1,
                  borderColor: activeTheme.uiColors.border,
                  color: activeTheme.uiColors.textMuted,
                }}
              >
                모두 지우기
              </Button>
            )}
          </Box>

          {plots.length === 0 ? (
            <Box
              sx={{
                flex: 1,
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1px dashed ${activeTheme.uiColors.border}`,
                borderRadius: '12px',
                p: 3,
                textAlign: 'center',
                gap: 1,
                bgcolor: activeTheme.uiColors.card,
              }}
            >
              <InsertChartOutlinedRoundedIcon
                sx={{ fontSize: 36, color: activeTheme.uiColors.textMuted }}
              />
              <Typography variant="caption" sx={{ color: activeTheme.uiColors.textMuted }}>
                아직 생성된 차트가 없습니다.
                <br />
                Python Matplotlib 템플릿을 실행하면 차트가 자동으로 추출됩니다.
              </Typography>
            </Box>
          ) : (
            plots.map((plot) => (
              <Box
                key={plot.id}
                sx={{
                  bgcolor: activeTheme.uiColors.card,
                  border: `1px solid ${activeTheme.uiColors.border}`,
                  borderRadius: '10px',
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: activeTheme.uiColors.text }}
                  >
                    {plot.title || 'Matplotlib Figure'}
                  </Typography>
                  <Tooltip title="PNG 다운로드">
                    <IconButton
                      size="small"
                      onClick={() => handleDownloadPlot(plot)}
                      sx={{ color: activeTheme.previewAccent }}
                    >
                      <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box
                  component="img"
                  src={plot.dataUrl}
                  alt={plot.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '6px',
                    bgcolor: '#ffffff',
                    border: `1px solid ${activeTheme.uiColors.border}`,
                  }}
                />
              </Box>
            ))
          )}
        </Box>
      )}

      {/* Tab 3: System Diagnostics */}
      {activeTab === 'info' && (
        <Box
          sx={{
            flex: 1,
            p: 2,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            bgcolor: activeTheme.uiColors.bg,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: activeTheme.uiColors.text, fontWeight: 600 }}
          >
            브라우저 런타임 진단
          </Typography>

          <Alert
            severity={systemInfo.isCrossOriginIsolated ? 'success' : 'warning'}
            sx={{
              bgcolor: systemInfo.isCrossOriginIsolated
                ? 'rgba(16, 185, 129, 0.12)'
                : 'rgba(245, 158, 11, 0.12)',
              color: systemInfo.isCrossOriginIsolated ? '#10b981' : '#f59e0b',
              border: `1px solid ${systemInfo.isCrossOriginIsolated ? '#059669' : '#d97706'}`,
              fontSize: '12px',
            }}
          >
            {systemInfo.isCrossOriginIsolated
              ? 'Cross-Origin Isolation 활성화: WebContainer 및 고속 SharedArrayBuffer 사용 가능'
              : 'Cross-Origin Isolation 비활성화: Pyodide, SQL 및 HTML Sandbox 실행 가능, WebContainer는 헤더 설정 필요'}
          </Alert>

          <Box
            sx={{
              bgcolor: activeTheme.uiColors.card,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '10px',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <DiagnosticRow
              label="WebContainer (StackBlitz Node)"
              status={systemInfo.webContainerReady ? 'Ready' : 'Standby / Isolated Only'}
              success={systemInfo.webContainerReady}
              activeTheme={activeTheme}
            />
            <DiagnosticRow
              label="Pyodide (WebAssembly Python 3.12)"
              status={systemInfo.pyodideReady ? 'Ready' : 'Loaded on Demand'}
              success={systemInfo.pyodideReady}
              activeTheme={activeTheme}
            />
            <DiagnosticRow
              label="SharedArrayBuffer 지원"
              status={systemInfo.hasSharedArrayBuffer ? 'Available' : 'Unavailable'}
              success={systemInfo.hasSharedArrayBuffer}
              activeTheme={activeTheme}
            />
            <DiagnosticRow
              label="Cross-Origin Isolated"
              status={systemInfo.isCrossOriginIsolated ? 'True' : 'False'}
              success={systemInfo.isCrossOriginIsolated}
              activeTheme={activeTheme}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}

function DiagnosticRow({
  label,
  status,
  success,
  activeTheme,
}: {
  label: string;
  status: string;
  success: boolean;
  activeTheme: any;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Typography variant="caption" sx={{ color: activeTheme.uiColors.textMuted }}>
        {label}
      </Typography>
      <Box
        sx={{
          px: 1,
          py: 0.2,
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: 600,
          bgcolor: success ? 'rgba(16, 185, 129, 0.15)' : `${activeTheme.uiColors.textMuted}20`,
          color: success ? '#10b981' : activeTheme.uiColors.textMuted,
        }}
      >
        {status}
      </Box>
    </Box>
  );
}
