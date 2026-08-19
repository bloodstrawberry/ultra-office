'use client';

import type { ToolItem } from './home-tools-data';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { useRouter } from 'src/routes/hooks';

import { renderHomeIcon } from './home-icons';

// ----------------------------------------------------------------------

export interface HomeToolCardProps {
  tool: ToolItem;
  dense?: boolean;
}

export function HomeToolCard({ tool, dense = false }: HomeToolCardProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleNavigate = () => {
    router.push(tool.path);
  };

  return (
    <Paper
      onClick={handleNavigate}
      sx={{
        p: { xs: 2.25, sm: 2.75 },
        height: '100%',
        borderRadius: 2.5,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        bgcolor: (t) => alpha(t.palette.background.paper, 0.8),
        backdropFilter: 'blur(12px)',
        border: (t) => `1px solid ${alpha(t.palette.divider, 0.12)}`,
        transition: theme.transitions.create(['all'], {
          duration: theme.transitions.duration.shorter,
          easing: theme.transitions.easing.easeOut,
        }),
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: alpha(tool.accentColor, 0.5),
          bgcolor: (t) => alpha(t.palette.background.paper, 0.98),
          boxShadow: (t) =>
            `0 16px 32px -8px ${alpha(tool.accentColor, 0.22)}, 0 4px 12px ${alpha(t.palette.common.black, 0.08)}`,
          '& .tool-arrow-icon': {
            transform: 'translateX(4px)',
            color: tool.accentColor,
          },
          '& .tool-icon-bg': {
            transform: 'scale(1.08)',
            boxShadow: `0 8px 20px -4px ${alpha(tool.accentColor, 0.4)}`,
          },
        },
      }}
    >
      {/* Top Accent Gradient Bar */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${tool.accentColor}, ${alpha(tool.accentColor, 0.2)})`,
        }}
      />

      {/* Header: Icon & Tag */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.75,
        }}
      >
        <Box
          className="tool-icon-bg"
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: tool.accentColor,
            background: `linear-gradient(135deg, ${alpha(tool.accentColor, 0.18)} 0%, ${alpha(tool.accentColor, 0.05)} 100%)`,
            border: `1px solid ${alpha(tool.accentColor, 0.25)}`,
            transition: theme.transitions.create(['transform', 'box-shadow'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          {renderHomeIcon(tool.iconKey, { sx: { fontSize: 24 } })}
        </Box>

        {tool.tag && (
          <Chip
            size="small"
            label={tool.tag}
            color={tool.tagColor ?? 'primary'}
            variant="soft"
            sx={{
              fontWeight: 700,
              fontSize: '0.72rem',
              height: 24,
              borderRadius: 1,
              bgcolor: alpha(tool.accentColor, 0.12),
              color: tool.accentColor,
              border: `1px solid ${alpha(tool.accentColor, 0.2)}`,
            }}
          />
        )}
      </Box>

      {/* Tool Title & Subtitle */}
      <Box sx={{ mb: 1 }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '1.05rem',
            lineHeight: 1.3,
            color: 'text.primary',
            mb: 0.5,
          }}
        >
          {tool.title}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            display: 'block',
            fontWeight: 600,
            color: alpha(theme.palette.text.secondary, 0.9),
            fontSize: '0.78rem',
          }}
        >
          {tool.subtitle}
        </Typography>
      </Box>

      {/* Description */}
      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          fontSize: '0.83rem',
          lineHeight: 1.5,
          mb: 2,
          flex: '1 1 auto',
          display: '-webkit-box',
          WebkitLineClamp: dense ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {tool.description}
      </Typography>

      {/* Features bullet list (if not dense) */}
      {!dense && tool.features && tool.features.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 0.6,
            mb: 2,
            pt: 1.5,
            borderTop: `1px dashed ${alpha(theme.palette.divider, 0.15)}`,
          }}
        >
          {tool.features.slice(0, 3).map((feature, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <CheckCircleRoundedIcon
                sx={{
                  fontSize: 14,
                  color: tool.accentColor,
                  opacity: 0.85,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.74rem',
                  color: 'text.secondary',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {feature}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* Bottom Action Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          pt: 1.25,
          mt: 'auto',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            fontSize: '0.78rem',
            color: 'text.secondary',
            letterSpacing: 0.3,
          }}
        >
          도구 바로가기
        </Typography>

        <Box
          className="tool-arrow-icon"
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'text.disabled',
            transition: theme.transitions.create(['transform', 'color'], {
              duration: theme.transitions.duration.shorter,
            }),
          }}
        >
          <ArrowForwardRoundedIcon sx={{ fontSize: 18 }} />
        </Box>
      </Box>
    </Paper>
  );
}
