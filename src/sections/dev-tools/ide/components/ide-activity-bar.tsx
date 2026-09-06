'use client';

import type { IDETheme } from 'src/sections/code-runner/core/editor-themes';

import React from 'react';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import BugReportRoundedIcon from '@mui/icons-material/BugReportRounded';
import ExtensionRoundedIcon from '@mui/icons-material/ExtensionRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';

export type ActivityTab = 'explorer' | 'search' | 'git' | 'debug' | 'extensions' | 'settings';

interface IdeActivityBarProps {
  activeTab: ActivityTab;
  isSidebarOpen: boolean;
  currentTheme: IDETheme;
  onSelectTab: (tab: ActivityTab) => void;
  onOpenSettings: () => void;
}

export function IdeActivityBar({
  activeTab,
  isSidebarOpen,
  currentTheme,
  onSelectTab,
  onOpenSettings,
}: IdeActivityBarProps) {
  const topItems: { id: ActivityTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'explorer',
      label: '탐색기 (Explorer)',
      icon: <InsertDriveFileRoundedIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'search',
      label: '검색 (Search)',
      icon: <SearchRoundedIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'git',
      label: '소스 제어 (Git)',
      icon: <AccountTreeRoundedIcon sx={{ fontSize: 22 }} />,
      badge: 1,
    },
    {
      id: 'debug',
      label: '실행 및 디버그 (Run & Debug)',
      icon: <BugReportRoundedIcon sx={{ fontSize: 22 }} />,
    },
    {
      id: 'extensions',
      label: '확장 (Extensions)',
      icon: <ExtensionRoundedIcon sx={{ fontSize: 22 }} />,
    },
  ];

  const barBg = currentTheme.uiColors.bg;
  const inactiveIconColor = currentTheme.uiColors.textMuted;
  const activeIconColor = currentTheme.isDark
    ? currentTheme.uiColors.text
    : currentTheme.previewAccent || '#007acc';
  const hoverBg = currentTheme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <Box
      sx={{
        width: 48,
        bgcolor: barBg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        py: 1,
        flexShrink: 0,
        borderRight: `1px solid ${currentTheme.uiColors.border}`,
        userSelect: 'none',
      }}
    >
      {/* Top Icons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: 0.5,
        }}
      >
        {topItems.map((item) => {
          const isActive = isSidebarOpen && activeTab === item.id;
          return (
            <Tooltip key={item.id} title={item.label} placement="right">
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      top: 4,
                      bottom: 4,
                      width: 2.5,
                      bgcolor: currentTheme.previewAccent || '#007acc',
                    }}
                  />
                )}
                <IconButton
                  onClick={() => onSelectTab(item.id)}
                  sx={{
                    color: isActive ? activeIconColor : inactiveIconColor,
                    p: 1.2,
                    borderRadius: 0,
                    '&:hover': {
                      color: activeIconColor,
                      bgcolor: hoverBg,
                    },
                  }}
                >
                  {item.badge ? (
                    <Badge
                      badgeContent={item.badge}
                      color="primary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.65rem',
                          height: 14,
                          minWidth: 14,
                          bgcolor: currentTheme.previewAccent || '#007acc',
                        },
                      }}
                    >
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </IconButton>
              </Box>
            </Tooltip>
          );
        })}
      </Box>

      {/* Bottom Icons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%',
          gap: 0.5,
        }}
      >
        <Tooltip title="계정" placement="right">
          <IconButton
            sx={{
              color: currentTheme.uiColors.textMuted,
              p: 1.2,
              '&:hover': { color: currentTheme.uiColors.text, bgcolor: hoverBg },
            }}
          >
            <AccountCircleRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="설정 & 테마" placement="right">
          <IconButton
            onClick={onOpenSettings}
            sx={{
              color:
                activeTab === 'settings' && isSidebarOpen
                  ? currentTheme.uiColors.text
                  : currentTheme.uiColors.textMuted,
              p: 1.2,
              '&:hover': { color: currentTheme.uiColors.text, bgcolor: hoverBg },
            }}
          >
            <SettingsRoundedIcon sx={{ fontSize: 22 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
}
