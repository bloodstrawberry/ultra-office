'use client';

import type { RunnerState, CodeTemplate, SupportedLanguage } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import StopRoundedIcon from '@mui/icons-material/StopRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { TEMPLATES } from '../core/templates';
import { IDE_THEMES, getThemeById } from '../core/editor-themes';

// ----------------------------------------------------------------------

export interface RunnerToolbarProps {
  currentLanguage: SupportedLanguage;
  currentTemplateId: string;
  currentThemeId: string;
  runnerState: RunnerState;
  fontSize: number;
  minimap: boolean;
  onLanguageChange: (lang: SupportedLanguage) => void;
  onTemplateChange: (template: CodeTemplate) => void;
  onThemeChange: (themeId: string) => void;
  onRun: () => void;
  onStop: () => void;
  onReset: () => void;
  onDownload: () => void;
  onCopyCode: () => void;
  onFontSizeChange: (size: number) => void;
  onMinimapToggle: () => void;
}

interface LanguageOption {
  value: SupportedLanguage;
  label: string;
  icon: string;
  group: string;
  engine: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  // Web & Frontend
  {
    value: 'javascript',
    label: 'JavaScript (Node.js)',
    icon: '🟨',
    group: 'Frontend & Node',
    engine: 'WebContainer',
  },
  {
    value: 'typescript',
    label: 'TypeScript',
    icon: '🔷',
    group: 'Frontend & Node',
    engine: 'WebContainer',
  },
  {
    value: 'react',
    label: 'React Live Component',
    icon: '⚛️',
    group: 'Frontend & Node',
    engine: 'React Live',
  },
  {
    value: 'html',
    label: 'HTML5 / CSS / JS Sandbox',
    icon: '🎨',
    group: 'Frontend & Node',
    engine: 'DOM Sandbox',
  },
  {
    value: 'node-server',
    label: 'Express.js Web Server',
    icon: '🌐',
    group: 'Frontend & Node',
    engine: 'WebContainer Server',
  },

  // Data & Scientific
  {
    value: 'python',
    label: 'Python 3 (Pyodide Wasm)',
    icon: '🐍',
    group: 'Data & Database',
    engine: 'Pyodide Wasm',
  },
  {
    value: 'sql',
    label: 'SQL (In-Memory Database)',
    icon: '🗄️',
    group: 'Data & Database',
    engine: 'SQL Engine',
  },

  // Backend & Scripting
  {
    value: 'go',
    label: 'Go (Golang)',
    icon: '🐹',
    group: 'Backend & Systems',
    engine: 'Wasm Toolchain',
  },
  {
    value: 'java',
    label: 'Java (OpenJDK)',
    icon: '☕',
    group: 'Backend & Systems',
    engine: 'Wasm JVM',
  },
  { value: 'ruby', label: 'Ruby 3.3', icon: '💎', group: 'Backend & Systems', engine: 'Ruby Wasm' },
  { value: 'php', label: 'PHP 8.3', icon: '🐘', group: 'Backend & Systems', engine: 'PHP Wasm' },
  { value: 'lua', label: 'Lua 5.3', icon: '🌙', group: 'Backend & Systems', engine: 'Lua Wasm' },
  {
    value: 'bash',
    label: 'Bash 쉘 스크립트',
    icon: '🐚',
    group: 'Backend & Systems',
    engine: 'Virtual Shell',
  },

  // Systems & Native
  { value: 'c', label: 'C Language', icon: '⚡', group: 'Systems & Native', engine: 'Wasm Clang' },
  { value: 'rust', label: 'Rust', icon: '🦀', group: 'Systems & Native', engine: 'Wasm Toolchain' },
];

export function RunnerToolbar({
  currentLanguage,
  currentTemplateId,
  currentThemeId,
  runnerState,
  fontSize,
  minimap,
  onLanguageChange,
  onTemplateChange,
  onThemeChange,
  onRun,
  onStop,
  onReset,
  onDownload,
  onCopyCode,
  onFontSizeChange,
  onMinimapToggle,
}: RunnerToolbarProps) {
  const [settingsAnchor, setSettingsAnchor] = React.useState<null | HTMLElement>(null);

  const isRunning = runnerState.status === 'running' || runnerState.status === 'booting';
  const activeTheme = getThemeById(currentThemeId);

  const engineChipColor =
    runnerState.currentEngine === 'webcontainer'
      ? '#3b82f6'
      : runnerState.currentEngine === 'pyodide'
        ? '#10b981'
        : runnerState.currentEngine === 'sql'
          ? '#06b6d4'
          : runnerState.currentEngine === 'html-sandbox' ||
              runnerState.currentEngine === 'react-live'
            ? '#f59e0b'
            : '#8b5cf6';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1,
        bgcolor: activeTheme.uiColors.surface,
        borderBottom: `1px solid ${activeTheme.uiColors.border}`,
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      {/* Left Area: Language & Template & Theme Selectors */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {/* Language Selector */}
        <FormControl size="small" sx={{ minWidth: 190 }}>
          <Select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '13px',
              fontWeight: 600,
              bgcolor: activeTheme.uiColors.card,
              color: activeTheme.uiColors.text,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '8px',
              '& .MuiSelect-select': {
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
              '& .MuiSvgIcon-root': {
                color: activeTheme.uiColors.textMuted,
              },
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '13px', py: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                  <span>{opt.icon}</span>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {opt.label}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Template Selector */}
        <FormControl size="small" sx={{ minWidth: 210 }}>
          <Select
            value={currentTemplateId}
            onChange={(e) => {
              const selected = TEMPLATES.find((t) => t.id === e.target.value);
              if (selected) onTemplateChange(selected);
            }}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '13px',
              bgcolor: activeTheme.uiColors.card,
              color: activeTheme.uiColors.text,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '8px',
              '& .MuiSelect-select': {
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
              '& .MuiSvgIcon-root': {
                color: activeTheme.uiColors.textMuted,
              },
            }}
          >
            {TEMPLATES.map((tmpl) => (
              <MenuItem key={tmpl.id} value={tmpl.id} sx={{ fontSize: '13px', py: 0.8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: activeTheme.uiColors.text }}
                  >
                    {tmpl.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: activeTheme.uiColors.textMuted, fontSize: '11px' }}
                  >
                    {tmpl.category} • {tmpl.engine}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Theme Selector */}
        <FormControl size="small" sx={{ minWidth: 175 }}>
          <Select
            value={currentThemeId}
            onChange={(e) => onThemeChange(e.target.value as string)}
            displayEmpty
            sx={{
              height: 36,
              fontSize: '13px',
              bgcolor: activeTheme.uiColors.card,
              color: activeTheme.uiColors.text,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '8px',
              '& .MuiSelect-select': {
                py: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              },
              '& .MuiSvgIcon-root': {
                color: activeTheme.uiColors.textMuted,
              },
            }}
          >
            {IDE_THEMES.map((th) => (
              <MenuItem key={th.id} value={th.id} sx={{ fontSize: '13px', py: 0.8 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      bgcolor: th.previewBg,
                      border: `2px solid ${th.previewAccent}`,
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {th.name}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Engine Badge */}
        <Chip
          label={runnerState.currentEngine.toUpperCase()}
          size="small"
          sx={{
            bgcolor: `${engineChipColor}20`,
            color: engineChipColor,
            border: `1px solid ${engineChipColor}50`,
            fontWeight: 700,
            fontSize: '11px',
            height: 24,
          }}
        />
      </Box>

      {/* Right Area: Action Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* Run / Stop Button */}
        {isRunning ? (
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<StopRoundedIcon />}
            onClick={onStop}
            sx={{
              height: 36,
              px: 2,
              fontWeight: 700,
              borderRadius: '8px',
              boxShadow: '0 0 15px rgba(239, 68, 68, 0.4)',
            }}
          >
            중지 (Stop)
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={onRun}
            sx={{
              height: 36,
              px: 2.2,
              fontWeight: 700,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
              },
            }}
          >
            실행 (Run)
            <Typography variant="caption" sx={{ ml: 0.8, opacity: 0.8, fontSize: '10px' }}>
              Ctrl+↵
            </Typography>
          </Button>
        )}

        {/* Reset Template */}
        <Tooltip title="코드 초기화 (템플릿 복원)">
          <IconButton
            size="small"
            onClick={onReset}
            sx={{
              color: activeTheme.uiColors.textMuted,
              '&:hover': { color: activeTheme.uiColors.text },
            }}
          >
            <RestartAltRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Copy Code */}
        <Tooltip title="전체 코드 복사">
          <IconButton
            size="small"
            onClick={onCopyCode}
            sx={{
              color: activeTheme.uiColors.textMuted,
              '&:hover': { color: activeTheme.uiColors.text },
            }}
          >
            <ContentCopyRoundedIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Tooltip>

        {/* Download File */}
        <Tooltip title="코드 파일 다운로드">
          <IconButton
            size="small"
            onClick={onDownload}
            sx={{
              color: activeTheme.uiColors.textMuted,
              '&:hover': { color: activeTheme.uiColors.text },
            }}
          >
            <DownloadRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        {/* Editor Settings Menu */}
        <Tooltip title="에디터 설정">
          <IconButton
            size="small"
            onClick={(e) => setSettingsAnchor(e.currentTarget)}
            sx={{
              color: activeTheme.uiColors.textMuted,
              '&:hover': { color: activeTheme.uiColors.text },
            }}
          >
            <SettingsRoundedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={settingsAnchor}
          open={Boolean(settingsAnchor)}
          onClose={() => setSettingsAnchor(null)}
          sx={{
            '& .MuiPaper-root': {
              bgcolor: activeTheme.uiColors.card,
              color: activeTheme.uiColors.text,
              border: `1px solid ${activeTheme.uiColors.border}`,
              borderRadius: '8px',
              minWidth: 200,
            },
          }}
        >
          <MenuItem
            onClick={onMinimapToggle}
            sx={{ fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}
          >
            <span>미니맵 표시</span>
            {minimap && <CheckRoundedIcon sx={{ fontSize: 16, color: '#38bdf8' }} />}
          </MenuItem>

          <Box sx={{ px: 2, py: 1, borderTop: `1px solid ${activeTheme.uiColors.border}` }}>
            <Typography variant="caption" sx={{ color: activeTheme.uiColors.textMuted }}>
              폰트 크기: {fontSize}px
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {[12, 14, 16, 18].map((size) => (
                <Button
                  key={size}
                  size="small"
                  variant={fontSize === size ? 'contained' : 'outlined'}
                  onClick={() => onFontSizeChange(size)}
                  sx={{ minWidth: 32, height: 24, fontSize: '11px', p: 0 }}
                >
                  {size}
                </Button>
              ))}
            </Box>
          </Box>
        </Menu>
      </Box>
    </Box>
  );
}
