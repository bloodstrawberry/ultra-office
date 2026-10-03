'use client';

import type { Components } from 'react-markdown';

import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, type Theme, type SxProps } from '@mui/material/styles';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { KatexMath } from 'src/components/katex';
import { MermaidDiagram } from 'src/components/mermaid';

import { isSqlQuery, cleanSqlForInput } from '../sqld-lab-data';

export interface RichContentSegment {
  type: 'markdown' | 'inlineMath' | 'displayMath' | 'erd';
  content: string;
}

function extractNodeText(node: unknown): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractNodeText).join('');
  if (typeof node === 'object' && node !== null && 'props' in node) {
    const element = node as { props?: { children?: unknown } };
    return extractNodeText(element.props?.children);
  }
  return '';
}

export function isRichTextEmpty(text?: string | null): boolean {
  if (!text) return true;
  const stripped = text.replace(/&nbsp;|<p><\/p>|<br\s*\/?>|\s|\u200B/g, '');
  return stripped.length === 0;
}

export function parseRichContent(text: string): RichContentSegment[] {
  if (isRichTextEmpty(text)) return [];

  const trimmed = text.trim();

  // Check for ERD diagram blocks or erDiagram syntax
  if (trimmed.startsWith('erDiagram') || trimmed.includes('```mermaid')) {
    const mermaidMatch = trimmed.match(/```mermaid\s*([\s\S]*?)```/);
    if (mermaidMatch) {
      const before = trimmed.slice(0, mermaidMatch.index).trim();
      const erdCode = mermaidMatch[1].trim();
      const after = trimmed.slice((mermaidMatch.index || 0) + mermaidMatch[0].length).trim();
      const segments: RichContentSegment[] = [];
      if (before) segments.push(...parseRichContent(before));
      segments.push({ type: 'erd', content: erdCode });
      if (after) segments.push(...parseRichContent(after));
      return segments;
    }
    return [{ type: 'erd', content: trimmed }];
  }

  const segments: RichContentSegment[] = [];
  const mathRegex = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  while ((match = mathRegex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index);
    if (textBefore) {
      segments.push({ type: 'markdown', content: textBefore });
    }

    if (match[1]) {
      segments.push({ type: 'displayMath', content: match[1] });
    } else if (match[2]) {
      segments.push({ type: 'inlineMath', content: match[2] });
    }

    lastIndex = mathRegex.lastIndex;
  }

  const remaining = text.substring(lastIndex);
  if (remaining) {
    // Detect raw KaTeX commands if not delimited by $
    const isPureMath =
      /^\s*\\(frac|sqrt|int|sum|lim|alpha|beta|theta|pi|infty|matrix|vec|pm|le|ge|neq|times|div|cdot)\b/.test(
        remaining
      );

    if (isPureMath) {
      segments.push({ type: 'displayMath', content: remaining.trim() });
    } else {
      segments.push({ type: 'markdown', content: remaining });
    }
  }

  return segments;
}

interface RichContentRendererProps {
  content: string;
  idPrefix?: string;
  sx?: SxProps<Theme>;
  inline?: boolean;
  onSqlClick?: (sql: string) => void;
}

export const RichContentRenderer = memo(function RichContentRenderer({
  content,
  idPrefix = 'rich_content',
  sx,
  inline = false,
  onSqlClick,
}: RichContentRendererProps) {
  const segments = useMemo(() => parseRichContent(content), [content]);

  const markdownComponents: Components | undefined = useMemo(() => {
    if (!onSqlClick) return undefined;

    return {
      code({ className, children, ...props }) {
        const rawText = extractNodeText(children);
        const codeString = rawText.replace(/\n$/, '');
        const isSql = isSqlQuery(codeString);

        if (isSql) {
          return (
            <Box
              component="span"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onSqlClick(cleanSqlForInput(codeString));
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onSqlClick(cleanSqlForInput(codeString));
                }
              }}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                cursor: 'pointer',
                px: 0.75,
                py: 0.25,
                my: 0.2,
                borderRadius: 0.75,
                border: (t) => `1px dashed ${t.palette.primary.main}`,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                color: 'primary.main',
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 600,
                transition: 'all 0.15s ease',
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.18),
                  borderColor: 'primary.dark',
                  transform: 'scale(1.02)',
                },
              }}
              title="클릭하여 SQL 실습 입력창에 넣기"
            >
              <span>{children}</span>
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: 10,
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  px: 0.5,
                  py: 0.1,
                  borderRadius: 0.4,
                  fontWeight: 700,
                  letterSpacing: 0.3,
                  lineHeight: 1.2,
                }}
              >
                SQL 입력
              </Box>
            </Box>
          );
        }

        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
      pre({ children, ...props }) {
        const rawText = extractNodeText(children).trim();
        const isSql = isSqlQuery(rawText);

        if (isSql) {
          return (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onSqlClick(cleanSqlForInput(rawText));
              }}
              sx={{
                position: 'relative',
                cursor: 'pointer',
                border: (t) => `1.5px solid ${t.palette.primary.main}`,
                borderRadius: 1.5,
                overflow: 'hidden',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
                my: 1.5,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderColor: 'primary.dark',
                  boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.18)}`,
                },
              }}
              title="클릭하여 오른쪽 SQL 실습 입력창에 넣기"
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  px: 1.5,
                  py: 0.75,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                  borderBottom: (t) => `1px solid ${alpha(t.palette.primary.main, 0.16)}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}
                >
                  SQL 쿼리 (클릭 시 자동 입력)
                </Typography>
                <Button
                  size="small"
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowRoundedIcon sx={{ fontSize: 16 }} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSqlClick(cleanSqlForInput(rawText));
                  }}
                  sx={{
                    py: 0.2,
                    px: 1,
                    fontSize: 11,
                    fontWeight: 700,
                    height: 24,
                    minHeight: 24,
                    boxShadow: 'none',
                  }}
                >
                  입력창에 넣기
                </Button>
              </Box>

              <Box
                component="pre"
                sx={{
                  p: 1.5,
                  m: 0,
                  bgcolor: 'transparent',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: 'text.primary',
                  '& code': {
                    bgcolor: 'transparent',
                    color: 'inherit',
                    p: 0,
                  },
                }}
              >
                {children}
              </Box>
            </Box>
          );
        }

        return <pre {...props}>{children}</pre>;
      },
    };
  }, [onSqlClick]);

  if (isRichTextEmpty(content)) {
    return null;
  }

  const hasTableOrBlock =
    content.includes('|') || content.includes('```') || content.includes('<table');
  const isEffectivelyInline = inline && !hasTableOrBlock;

  return (
    <Box
      component={isEffectivelyInline ? 'span' : 'div'}
      sx={{
        display: isEffectivelyInline ? 'inline-flex' : 'flex',
        flexDirection: isEffectivelyInline ? 'row' : 'column',
        alignItems: isEffectivelyInline ? 'center' : 'stretch',
        flexWrap: isEffectivelyInline ? 'wrap' : 'nowrap',
        width: isEffectivelyInline ? 'auto' : '100%',
        gap: 0.5,
        '& p': {
          m: 0,
          mb: 1,
          display: isEffectivelyInline ? 'inline-block' : 'block',
          fontSize: 14,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          minHeight: '1.2em',
          '&:last-child': { mb: 0 },
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          my: 1,
          '& th, & td': {
            px: 1.5,
            py: 0.75,
            fontSize: 13,
            border: (t) => `1px solid ${t.palette.divider}`,
            '&[align="center"], &[style*="text-align: center"], &[style*="text-align:center"]': {
              textAlign: 'center',
            },
            '&[align="right"], &[style*="text-align: right"], &[style*="text-align:right"]': {
              textAlign: 'right',
            },
            '&[align="left"], &[style*="text-align: left"], &[style*="text-align:left"]': {
              textAlign: 'left',
            },
          },
          '& th': {
            fontWeight: 700,
            bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
          },
          '& th p, & td p': {
            textAlign: 'inherit',
            m: 0,
          },
        },
        '& strong': { fontWeight: 700 },
        '& em': { fontStyle: 'italic' },
        '& ul, & ol': {
          pl: 2.5,
          m: 0,
          mb: 1,
          '& li': { mb: 0.25 },
        },
        '& code': {
          px: 0.5,
          py: 0.25,
          borderRadius: 0.5,
          fontSize: 13,
          fontFamily: 'monospace',
          bgcolor: (t) => t.palette.action.hover,
          color: 'error.main',
        },
        '& pre': {
          p: 1.5,
          borderRadius: 1,
          bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
          overflow: 'auto',
          '& code': {
            bgcolor: 'transparent',
            color: (t) => t.palette.text.primary,
            px: 0,
            py: 0,
          },
        },
        '& blockquote': {
          m: 0,
          pl: 1.5,
          borderLeft: (t) => `3px solid ${t.palette.primary.main}`,
        },
        '& ruby': {
          display: 'inline-flex',
          flexDirection: 'column-reverse',
          alignItems: 'center',
          verticalAlign: 'baseline',
          mx: 0.35,
          position: 'relative',
          bottom: '-0.15em',
        },
        '& rt': {
          fontSize: '0.75em',
          fontWeight: 700,
          color: (t) => t.palette.primary.main,
          lineHeight: 1.1,
          mb: '1px',
          display: 'block',
          userSelect: 'text',
        },
        '& s, & del': {
          color: 'text.secondary',
          textDecoration: 'line-through',
          textDecorationColor: (t) => t.palette.error.main,
          textDecorationThickness: '1.5px',
        },
        '& u': {
          textDecoration: 'underline',
          textDecorationThickness: '1.5px',
          textUnderlineOffset: '3px',
        },
        ...sx,
      }}
    >
      {segments.map((seg, idx) => {
        if (seg.type === 'erd') {
          return (
            <Box key={idx} sx={{ my: isEffectivelyInline ? 0.5 : 1, width: '100%' }}>
              <MermaidDiagram chart={seg.content} idPrefix={`${idPrefix}_erd_${idx}`} />
            </Box>
          );
        }

        if (seg.type === 'inlineMath') {
          return <KatexMath key={idx} math={seg.content} inline />;
        }

        if (seg.type === 'displayMath') {
          return <KatexMath key={idx} math={seg.content} inline={isEffectivelyInline} />;
        }

        return (
          <Box
            key={idx}
            component={isEffectivelyInline ? 'span' : 'div'}
            sx={{ width: isEffectivelyInline ? 'auto' : '100%' }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={markdownComponents}
            >
              {seg.content}
            </ReactMarkdown>
          </Box>
        );
      })}
    </Box>
  );
});

export default RichContentRenderer;
