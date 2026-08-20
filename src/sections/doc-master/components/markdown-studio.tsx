'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import CheckBoxRoundedIcon from '@mui/icons-material/CheckBoxRounded';
import FunctionsRoundedIcon from '@mui/icons-material/FunctionsRounded';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

import { MARKDOWN_TEMPLATES } from '../data/document-templates';
import {
  exportToHtmlFile,
  exportMarkdownToDocx,
  exportToMarkdownFile,
} from '../utils/markdown-export-utils';

// ----------------------------------------------------------------------

declare global {
  interface Window {
    katex?: {
      renderToString: (
        tex: string,
        options?: { displayMode?: boolean; throwOnError?: boolean }
      ) => string;
    };
    mermaid?: {
      initialize: (config: Record<string, unknown>) => void;
      render: (id: string, text: string) => Promise<{ svg: string }>;
    };
  }
}

export function MarkdownStudio() {
  const [content, setContent] = useState<string>(MARKDOWN_TEMPLATES[0].content);
  const [docTitle, setDocTitle] = useState<string>('오피스 기술 설계 사양서');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const previewContainerRef = useRef<HTMLDivElement | null>(null);

  // Dynamic KaTeX & Mermaid script loader
  useEffect(() => {
    // Load KaTeX CSS & JS
    if (!document.getElementById('katex-cdn-css')) {
      const link = document.createElement('link');
      link.id = 'katex-cdn-css';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      document.head.appendChild(link);
    }
    if (!window.katex && !document.getElementById('katex-cdn-js')) {
      const script = document.createElement('script');
      script.id = 'katex-cdn-js';
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      document.head.appendChild(script);
    }

    // Load Mermaid JS
    if (!window.mermaid && !document.getElementById('mermaid-cdn-js')) {
      const script = document.createElement('script');
      script.id = 'mermaid-cdn-js';
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.min.js';
      script.onload = () => {
        if (window.mermaid) {
          window.mermaid.initialize({ startOnLoad: false, theme: 'default' });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  // Simple Markdown + Math parser for live preview
  useEffect(() => {
    let parsed = content;

    // Process KaTeX Display Math $$...$$
    parsed = parsed.replace(/\$\$([\s\S]*?)\$\$/g, (_, tex) => {
      if (window.katex) {
        try {
          return `<div class="katex-block" style="text-align:center; padding:8px 0;">${window.katex.renderToString(tex.trim(), { displayMode: true, throwOnError: false })}</div>`;
        } catch {
          return `<pre>$$${tex}$$</pre>`;
        }
      }
      return `<pre>$$${tex}$$</pre>`;
    });

    // Process KaTeX Inline Math $...$
    parsed = parsed.replace(/\$([^$\n]+?)\$/g, (_, tex) => {
      if (window.katex) {
        try {
          return `<span class="katex-inline">${window.katex.renderToString(tex.trim(), { displayMode: false, throwOnError: false })}</span>`;
        } catch {
          return `<code>$${tex}$</code>`;
        }
      }
      return `<code>$${tex}$</code>`;
    });

    // Process Headings
    parsed = parsed.replace(
      /^# (.*$)/gim,
      '<h1 style="color:#0f172a; border-bottom:2px solid #e2e8f0; padding-bottom:6px; margin-top:20px;">$1</h1>'
    );
    parsed = parsed.replace(
      /^## (.*$)/gim,
      '<h2 style="color:#1e293b; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-top:16px;">$1</h2>'
    );
    parsed = parsed.replace(/^### (.*$)/gim, '<h3 style="color:#334155; margin-top:12px;">$1</h3>');

    // Bold, Italic, Strikethrough
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    parsed = parsed.replace(/~~(.*?)~~/g, '<del>$1</del>');

    // Checklists
    parsed = parsed.replace(
      /^- \[x\] (.*$)/gim,
      '<li style="list-style:none;"><input type="checkbox" checked disabled /> $1</li>'
    );
    parsed = parsed.replace(
      /^- \[ \] (.*$)/gim,
      '<li style="list-style:none;"><input type="checkbox" disabled /> $1</li>'
    );

    // Unordered lists
    parsed = parsed.replace(/^\* (.*$)/gim, '<li>$1</li>');
    parsed = parsed.replace(/^- (.*$)/gim, '<li>$1</li>');

    // Blockquotes
    parsed = parsed.replace(
      /^> (.*$)/gim,
      '<blockquote style="border-left:4px solid #3b82f6; margin:8px 0; padding-left:12px; color:#475569; font-style:italic;">$1</blockquote>'
    );

    // Tables
    parsed = parsed.replace(/\|(.+)\|/g, (match) => {
      if (match.includes('---')) return '';
      const cells = match
        .slice(1, -1)
        .split('|')
        .map((c) => `<td style="border:1px solid #cbd5e1; padding:6px 10px;">${c.trim()}</td>`)
        .join('');
      return `<tr style="border-bottom:1px solid #e2e8f0;">${cells}</tr>`;
    });

    // Horizontal Rule
    parsed = parsed.replace(
      /^---$/gim,
      '<hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;" />'
    );

    // Line breaks
    parsed = parsed.replace(/\n\n/g, '<p style="margin: 8px 0;"></p>');

    setRenderedHtml(parsed);
  }, [content]);

  // Insert tool text at cursor
  const handleInsert = (prefix: string, suffix: string = '') => {
    setContent((prev) => `${prev}\n${prefix}${suffix}`);
  };

  const handleExportDocx = async () => {
    try {
      setIsExporting(true);
      await exportMarkdownToDocx(content, docTitle, `${docTitle}.docx`);
      toast.success(`'${docTitle}.docx' 워드 파일이 다운로드되었습니다!`);
    } catch (err) {
      console.error(err);
      toast.error('Word 파일 변환 중 오류가 발생했습니다.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMd = () => {
    exportToMarkdownFile(content, `${docTitle}.md`);
    toast.success(`'${docTitle}.md' 파일이 저장되었습니다.`);
  };

  const handleExportHtml = () => {
    exportToHtmlFile(renderedHtml, docTitle, `${docTitle}.html`);
    toast.success(`'${docTitle}.html' 파일이 저장되었습니다.`);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      {/* Top Toolbar & Template Switcher */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
          <TextField
            size="small"
            label="문서 제목"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            sx={{ width: 260 }}
          />

          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 0.5, alignItems: 'center' }}>
            <Tooltip title="대제목 (# H1)">
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleInsert('# 새 제목')}
                sx={{ minWidth: 36, px: 1 }}
              >
                <TitleRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="굵게 (**Text**)">
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleInsert('**굵은 텍스트**')}
                sx={{ minWidth: 36, px: 1 }}
              >
                <FormatBoldRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="기울임 (*Text*)">
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleInsert('*기울임 텍스트*')}
                sx={{ minWidth: 36, px: 1 }}
              >
                <FormatItalicRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="표 삽입">
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleInsert(
                    '| 컬럼 1 | 컬럼 2 | 컬럼 3 |\n| --- | --- | --- |\n| 데이터 A | 데이터 B | 데이터 C |'
                  )
                }
                sx={{ minWidth: 36, px: 1 }}
              >
                <TableChartRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="KaTeX 수식 삽입 ($$...$$)">
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleInsert('$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$')
                }
                sx={{ minWidth: 36, px: 1 }}
              >
                <FunctionsRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="Mermaid 다이어그램 삽입">
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleInsert(
                    '```mermaid\ngraph TD;\n  A[시작] --> B{조건 분기};\n  B -->|Yes| C[완료];\n  B -->|No| D[재시도];\n```'
                  )
                }
                sx={{ minWidth: 36, px: 1 }}
              >
                <AccountTreeRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="체크리스트">
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleInsert('- [ ] 새로운 할 일')}
                sx={{ minWidth: 36, px: 1 }}
              >
                <CheckBoxRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
            <Tooltip title="코드 블록">
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  handleInsert(
                    '```typescript\nconst greeting = "Hello Ultra Office";\nconsole.log(greeting);\n```'
                  )
                }
                sx={{ minWidth: 36, px: 1 }}
              >
                <CodeRoundedIcon fontSize="small" />
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Template Selector & Export Dropdowns */}
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setContent(MARKDOWN_TEMPLATES[0].content);
              setDocTitle(MARKDOWN_TEMPLATES[0].title);
            }}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            기술 사양서 템플릿
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setContent(MARKDOWN_TEMPLATES[1].content);
              setDocTitle(MARKDOWN_TEMPLATES[1].title);
            }}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            주간 회의록 템플릿
          </Button>

          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<FileDownloadRoundedIcon />}
            onClick={handleExportDocx}
            disabled={isExporting}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            Word (.docx) 내보내기
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleExportMd}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            .md
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={handleExportHtml}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            HTML
          </Button>
        </Box>
      </Card>

      {/* Main Split Pane: Editor & Live Preview */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' },
          gap: 2,
          flexGrow: 1,
          minHeight: 520,
        }}
      >
        {/* Left: Raw Markdown Editor */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
            Markdown 소스 코드 에디터:
          </Typography>
          <TextField
            multiline
            fullWidth
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
            slotProps={{
              input: {
                sx: {
                  fontFamily: '"Fira Code", monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                  height: '100%',
                  alignItems: 'flex-start',
                },
              },
            }}
            sx={{
              flexGrow: 1,
              '& .MuiInputBase-root': { height: '100%' },
              '& textarea': { height: '100% !important' },
            }}
          />
        </Card>

        {/* Right: Live Preview Panel */}
        <Card
          sx={{
            p: { xs: 2, md: 3.5 },
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1 }}>
            실시간 렌더링 미리보기 (KaTeX, 표, 다이어그램):
          </Typography>

          <Box
            ref={previewContainerRef}
            sx={{
              flexGrow: 1,
              fontFamily: '"Pretendard", -apple-system, sans-serif',
              lineHeight: 1.8,
              color: 'text.primary',
              '& h1, & h2, & h3': {
                fontWeight: 700,
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
              },
              '& th, & td': {
                border: (theme) => `1px solid ${theme.palette.divider}`,
                p: '8px 12px',
                textAlign: 'left',
              },
              '& th': {
                bgcolor: 'action.hover',
                fontWeight: 700,
              },
              '& code': {
                bgcolor: 'action.hover',
                p: '2px 6px',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.88em',
              },
              '& pre': {
                bgcolor: 'background.neutral',
                p: 2,
                borderRadius: 1.5,
                overflowX: 'auto',
              },
            }}
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        </Card>
      </Box>
    </Box>
  );
}
