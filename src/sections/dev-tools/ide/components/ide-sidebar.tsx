'use client';

import type { IdeFile, TypingStatus } from '../types';
import type { ActivityTab } from './ide-activity-bar';
import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import InputBase from '@mui/material/InputBase';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import NoteAddRoundedIcon from '@mui/icons-material/NoteAddRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PlayCircleFilledWhiteRoundedIcon from '@mui/icons-material/PlayCircleFilledWhiteRounded';

import { getFileIconColor, ALL_LANGUAGE_PRESETS } from '../data/ide-languages';

interface IdeSidebarProps {
  activeTab: ActivityTab;
  files: IdeFile[];
  activeFileId: string;
  typingStatus: TypingStatus;
  currentTheme: IDETheme;
  onSelectFile: (fileId: string) => void;
  onCloseFile: (fileId: string) => void;
  onDeleteFile: (fileId: string) => void;
  onOpenCodeInput: () => void;
  onSelectPreset: (presetId: string) => void;
}

export function IdeSidebar({
  activeTab,
  files,
  activeFileId,
  typingStatus,
  currentTheme,
  onSelectFile,
  onCloseFile,
  onDeleteFile,
  onOpenCodeInput,
  onSelectPreset,
}: IdeSidebarProps) {
  const [openEditorsExpanded, setOpenEditorsExpanded] = useState(true);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [presetsExpanded, setPresetsExpanded] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [presetSearch, setPresetSearch] = useState<string>('');

  const categories: { id: string; label: string; count: number }[] = [
    { id: 'all', label: '전체', count: ALL_LANGUAGE_PRESETS.length },
    {
      id: 'Frontend',
      label: '프론트',
      count: ALL_LANGUAGE_PRESETS.filter((p) => p.category === 'Frontend').length,
    },
    {
      id: 'Backend',
      label: '백엔드',
      count: ALL_LANGUAGE_PRESETS.filter((p) => p.category === 'Backend').length,
    },
    {
      id: 'Data & Query',
      label: '데이터',
      count: ALL_LANGUAGE_PRESETS.filter((p) => p.category === 'Data & Query').length,
    },
    {
      id: 'DevOps & Config',
      label: '데브옵스',
      count: ALL_LANGUAGE_PRESETS.filter((p) => p.category === 'DevOps & Config').length,
    },
  ];

  const filteredPresets = ALL_LANGUAGE_PRESETS.filter((preset) => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory;
    const query = presetSearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      preset.name.toLowerCase().includes(query) ||
      (preset.tag && preset.tag.toLowerCase().includes(query)) ||
      (preset.description && preset.description.toLowerCase().includes(query)) ||
      preset.language.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];
  const accent = currentTheme.previewAccent || '#007acc';
  const hoverBg = currentTheme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const activeBg = currentTheme.isDark ? 'rgba(0, 122, 204, 0.3)' : 'rgba(0, 122, 204, 0.12)';

  return (
    <Box
      sx={{
        width: 250,
        bgcolor: currentTheme.uiColors.surface,
        color: currentTheme.uiColors.text,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        borderRight: `1px solid ${currentTheme.uiColors.border}`,
        userSelect: 'none',
        overflowY: 'auto',
        flexShrink: 0,
        '&::-webkit-scrollbar': { width: 6 },
        '&::-webkit-scrollbar-thumb': { bgcolor: currentTheme.uiColors.border, borderRadius: 3 },
      }}
    >
      {/* ============================================================ */}
      {/* 1. EXPLORER TAB                                              */}
      {/* ============================================================ */}
      {activeTab === 'explorer' && (
        <>
          {/* Header Title */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1.2,
              fontSize: '0.6875rem',
              fontWeight: 800,
              letterSpacing: 0.8,
              color: currentTheme.uiColors.textMuted,
              borderBottom: `1px solid ${currentTheme.uiColors.border}`,
            }}
          >
            <Typography sx={{ fontSize: '0.6875rem', fontWeight: 800 }}>
              탐색기 : ULTRA-WORKSPACE
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="새 코드 작성 / 붙여넣기">
                <IconButton
                  size="small"
                  onClick={onOpenCodeInput}
                  sx={{
                    color: currentTheme.uiColors.textMuted,
                    p: 0.2,
                    '&:hover': { color: currentTheme.uiColors.text },
                  }}
                >
                  <NoteAddRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="새로고침">
                <IconButton
                  size="small"
                  sx={{
                    color: currentTheme.uiColors.textMuted,
                    p: 0.2,
                    '&:hover': { color: currentTheme.uiColors.text },
                  }}
                >
                  <RefreshRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          {/* Section 1: OPEN EDITORS */}
          <Box sx={{ borderBottom: `1px solid ${currentTheme.uiColors.border}` }}>
            <Box
              onClick={() => setOpenEditorsExpanded((p) => !p)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.6,
                cursor: 'pointer',
                bgcolor: currentTheme.uiColors.surface,
                '&:hover': { bgcolor: hoverBg },
              }}
            >
              {openEditorsExpanded ? (
                <KeyboardArrowDownRoundedIcon
                  sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                />
              ) : (
                <ChevronRightRoundedIcon
                  sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                />
              )}
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: currentTheme.uiColors.textMuted,
                }}
              >
                열린 편집기 ({files.length})
              </Typography>
            </Box>

            {openEditorsExpanded && (
              <Box sx={{ display: 'flex', flexDirection: 'column', pb: 0.5 }}>
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  const isTyping = isActive && typingStatus === 'playing';

                  return (
                    <Box
                      key={file.id}
                      onClick={() => onSelectFile(file.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 1.5,
                        py: 0.45,
                        cursor: 'pointer',
                        bgcolor: isActive ? activeBg : 'transparent',
                        color: isActive
                          ? currentTheme.uiColors.text
                          : currentTheme.uiColors.textMuted,
                        fontSize: '0.8125rem',
                        '&:hover': { bgcolor: isActive ? activeBg : hoverBg },
                        '&:hover .file-close-btn': { opacity: 1 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <CodeRoundedIcon
                          sx={{ fontSize: 15, color: getFileIconColor(file.name), flexShrink: 0 }}
                        />
                        <Typography
                          noWrap
                          sx={{
                            fontSize: '0.8125rem',
                            fontWeight: isActive ? 700 : 400,
                          }}
                        >
                          {file.name}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                        {/* Dirty / Typing Indicator Bullet */}
                        {isTyping && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: accent,
                              animation: 'pulse 1s infinite',
                            }}
                          />
                        )}
                        {files.length > 1 && (
                          <IconButton
                            size="small"
                            className="file-close-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onCloseFile(file.id);
                            }}
                            sx={{
                              opacity: 0,
                              p: 0.2,
                              color: currentTheme.uiColors.textMuted,
                              '&:hover': { color: currentTheme.uiColors.text },
                            }}
                          >
                            <CloseRoundedIcon sx={{ fontSize: 13 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Section 2: WORKSPACE FILE TREE */}
          <Box sx={{ borderBottom: `1px solid ${currentTheme.uiColors.border}` }}>
            <Box
              onClick={() => setWorkspaceExpanded((p) => !p)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.6,
                cursor: 'pointer',
                bgcolor: currentTheme.uiColors.surface,
                '&:hover': { bgcolor: hoverBg },
              }}
            >
              {workspaceExpanded ? (
                <KeyboardArrowDownRoundedIcon
                  sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                />
              ) : (
                <ChevronRightRoundedIcon
                  sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                />
              )}
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  color: currentTheme.uiColors.textMuted,
                }}
              >
                PROJECT FILES
              </Typography>
            </Box>

            {workspaceExpanded && (
              <Box sx={{ display: 'flex', flexDirection: 'column', pb: 0.5 }}>
                {files.map((file) => {
                  const isActive = file.id === activeFileId;
                  return (
                    <Box
                      key={`ws-${file.id}`}
                      onClick={() => onSelectFile(file.id)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 2,
                        py: 0.45,
                        cursor: 'pointer',
                        bgcolor: isActive ? activeBg : 'transparent',
                        color: isActive
                          ? currentTheme.uiColors.text
                          : currentTheme.uiColors.textMuted,
                        fontSize: '0.8125rem',
                        '&:hover': { bgcolor: isActive ? activeBg : hoverBg },
                        '&:hover .file-del-btn': { opacity: 1 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <CodeRoundedIcon
                          sx={{ fontSize: 15, color: getFileIconColor(file.name), flexShrink: 0 }}
                        />
                        <Typography
                          noWrap
                          sx={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 400 }}
                        >
                          {file.name}
                        </Typography>
                      </Box>

                      {files.length > 1 && (
                        <IconButton
                          size="small"
                          className="file-del-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteFile(file.id);
                          }}
                          sx={{
                            opacity: 0,
                            p: 0.2,
                            color: '#e57373',
                            '&:hover': { color: '#ff5252' },
                          }}
                        >
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
          </Box>

          {/* Section 3: CODE PRESETS (샘플 코드 프리셋) */}
          <Box sx={{ borderBottom: `1px solid ${currentTheme.uiColors.border}` }}>
            <Box
              onClick={() => setPresetsExpanded((p) => !p)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.6,
                cursor: 'pointer',
                bgcolor: currentTheme.uiColors.surface,
                '&:hover': { bgcolor: hoverBg },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {presetsExpanded ? (
                  <KeyboardArrowDownRoundedIcon
                    sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                  />
                ) : (
                  <ChevronRightRoundedIcon
                    sx={{ fontSize: 16, mr: 0.5, color: currentTheme.uiColors.textMuted }}
                  />
                )}
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    color: currentTheme.uiColors.textMuted,
                  }}
                >
                  샘플 코드 템플릿 ({ALL_LANGUAGE_PRESETS.length})
                </Typography>
              </Box>
            </Box>

            {presetsExpanded && (
              <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {/* Search Bar for Languages */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    bgcolor: currentTheme.uiColors.card,
                    border: `1px solid ${currentTheme.uiColors.border}`,
                    borderRadius: 1,
                    px: 1,
                    py: 0.2,
                  }}
                >
                  <SearchRoundedIcon
                    sx={{ fontSize: 14, color: currentTheme.uiColors.textMuted }}
                  />
                  <InputBase
                    placeholder="언어/확장자 검색..."
                    value={presetSearch}
                    onChange={(e) => setPresetSearch(e.target.value)}
                    sx={{
                      fontSize: '0.6875rem',
                      color: currentTheme.uiColors.text,
                      width: '100%',
                    }}
                  />
                  {presetSearch && (
                    <Typography
                      onClick={() => setPresetSearch('')}
                      sx={{
                        fontSize: '0.6875rem',
                        cursor: 'pointer',
                        color: currentTheme.uiColors.textMuted,
                        '&:hover': { color: currentTheme.uiColors.text },
                      }}
                    >
                      ×
                    </Typography>
                  )}
                </Box>

                {/* Category Filter Chips */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                  }}
                >
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <Chip
                        key={cat.id}
                        label={`${cat.label} ${cat.count}`}
                        size="small"
                        onClick={() => setSelectedCategory(cat.id)}
                        sx={{
                          height: 19,
                          fontSize: '0.625rem',
                          fontWeight: isSelected ? 700 : 500,
                          cursor: 'pointer',
                          bgcolor: isSelected
                            ? accent
                            : currentTheme.isDark
                              ? 'rgba(255,255,255,0.06)'
                              : 'rgba(0,0,0,0.05)',
                          color: isSelected ? '#ffffff' : currentTheme.uiColors.textMuted,
                          border: `1px solid ${isSelected ? accent : currentTheme.uiColors.border}`,
                          '&:hover': {
                            bgcolor: isSelected ? accent : hoverBg,
                          },
                        }}
                      />
                    );
                  })}
                </Box>

                {/* Filtered Preset List */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.6,
                    maxHeight: 380,
                    overflowY: 'auto',
                    pr: 0.3,
                    '&::-webkit-scrollbar': { width: 4 },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: currentTheme.uiColors.border,
                      borderRadius: 2,
                    },
                  }}
                >
                  {filteredPresets.length === 0 ? (
                    <Typography
                      sx={{
                        fontSize: '0.6875rem',
                        color: currentTheme.uiColors.textMuted,
                        textAlign: 'center',
                        py: 2,
                      }}
                    >
                      검색된 언어가 없습니다.
                    </Typography>
                  ) : (
                    filteredPresets.map((item) => {
                      const iconColor = getFileIconColor(item.name);
                      const isCurrentActive = activeFileId === item.id;

                      return (
                        <Box
                          key={item.id}
                          onClick={() => onSelectPreset(item.id)}
                          sx={{
                            p: 0.8,
                            borderRadius: 1,
                            bgcolor: isCurrentActive ? activeBg : currentTheme.uiColors.card,
                            border: `1px solid ${isCurrentActive ? accent : currentTheme.uiColors.border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 1,
                            transition: 'all 0.15s',
                            '&:hover': {
                              bgcolor: hoverBg,
                              borderColor: accent,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.8,
                              minWidth: 0,
                              flex: 1,
                            }}
                          >
                            <PlayCircleFilledWhiteRoundedIcon
                              sx={{
                                fontSize: 15,
                                color: isCurrentActive ? accent : iconColor,
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                noWrap
                                sx={{
                                  fontSize: '0.75rem',
                                  color: currentTheme.uiColors.text,
                                  fontWeight: isCurrentActive ? 700 : 600,
                                }}
                              >
                                {item.name}
                              </Typography>
                              {item.description && (
                                <Typography
                                  noWrap
                                  sx={{
                                    fontSize: '0.625rem',
                                    color: currentTheme.uiColors.textMuted,
                                  }}
                                >
                                  {item.description}
                                </Typography>
                              )}
                            </Box>
                          </Box>

                          <Chip
                            label={item.tag || item.language.toUpperCase()}
                            size="small"
                            sx={{
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              bgcolor: currentTheme.isDark
                                ? 'rgba(0,0,0,0.35)'
                                : 'rgba(0,0,0,0.06)',
                              color: iconColor,
                              border: `1px solid ${iconColor}40`,
                              flexShrink: 0,
                            }}
                          />
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>
            )}
          </Box>

          {/* Section 4: Quick Action - Custom Code Input */}
          <Box sx={{ p: 1.5 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={onOpenCodeInput}
              startIcon={<EditNoteRoundedIcon />}
              sx={{
                bgcolor: accent,
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.8125rem',
                borderRadius: 1.5,
                py: 0.8,
                '&:hover': { bgcolor: accent },
              }}
            >
              내 소스코드 직접 입력
            </Button>
          </Box>
        </>
      )}

      {/* ============================================================ */}
      {/* 2. SEARCH TAB                                                */}
      {/* ============================================================ */}
      {activeTab === 'search' && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            sx={{ fontSize: '0.6875rem', fontWeight: 800, color: currentTheme.uiColors.textMuted }}
          >
            SEARCH IN FILES
          </Typography>
          <Box
            sx={{
              p: 1,
              bgcolor: currentTheme.uiColors.card,
              border: `1px solid ${currentTheme.uiColors.border}`,
              borderRadius: 1,
              fontSize: '0.75rem',
              color: currentTheme.uiColors.text,
            }}
          >
            현재 활성 파일: {activeFile.name} ({activeFile.content.length.toLocaleString()} 글자)
          </Box>
          <Typography sx={{ fontSize: '0.75rem', color: currentTheme.uiColors.textMuted }}>
            에디터 내 검색은 에디터 포커스 후 Ctrl+F (Cmd+F)를 누르세요.
          </Typography>
        </Box>
      )}

      {/* ============================================================ */}
      {/* 3. GIT TAB                                                   */}
      {/* ============================================================ */}
      {activeTab === 'git' && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            sx={{ fontSize: '0.6875rem', fontWeight: 800, color: currentTheme.uiColors.textMuted }}
          >
            SOURCE CONTROL: GIT (LOCAL)
          </Typography>
          <Box
            sx={{
              p: 1.2,
              bgcolor: currentTheme.uiColors.card,
              borderRadius: 1,
              border: `1px solid ${currentTheme.uiColors.border}`,
            }}
          >
            <Typography sx={{ fontSize: '0.75rem', color: '#4caf50', fontWeight: 700, mb: 0.5 }}>
              ● 1 changed file
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: currentTheme.uiColors.text }}>
              M {activeFile.name}
            </Typography>
          </Box>
          <Button
            size="small"
            variant="outlined"
            onClick={onOpenCodeInput}
            sx={{ borderColor: accent, color: accent, fontSize: '0.75rem', fontWeight: 700 }}
          >
            변경사항 저장 및 적용
          </Button>
        </Box>
      )}

      {/* ============================================================ */}
      {/* 4. DEBUG TAB                                                 */}
      {/* ============================================================ */}
      {activeTab === 'debug' && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography
            sx={{ fontSize: '0.6875rem', fontWeight: 800, color: currentTheme.uiColors.textMuted }}
          >
            RUN & DEBUG
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: currentTheme.uiColors.text }}>
            재생 버튼을 누르면 코드가 타이핑되고 완료 시 하단 터미널에서 실행 결과가 출력됩니다.
          </Typography>
        </Box>
      )}

      {/* ============================================================ */}
      {/* 5. EXTENSIONS TAB                                            */}
      {/* ============================================================ */}
      {activeTab === 'extensions' && (
        <Box sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography
            sx={{ fontSize: '0.6875rem', fontWeight: 800, color: currentTheme.uiColors.textMuted }}
          >
            INSTALLED EXTENSIONS
          </Typography>
          {[
            'TypeScript / JavaScript',
            'Python Language Server',
            'Prettier - Code Formatter',
            'ESLint',
            'Material Icon Theme',
          ].map((ext) => (
            <Box
              key={ext}
              sx={{
                p: 0.8,
                bgcolor: currentTheme.uiColors.card,
                border: `1px solid ${currentTheme.uiColors.border}`,
                borderRadius: 0.8,
                fontSize: '0.75rem',
                color: currentTheme.uiColors.text,
              }}
            >
              {ext}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
