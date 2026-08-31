'use client';

import { toast } from 'sonner';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import TitleRoundedIcon from '@mui/icons-material/TitleRounded';
import PreviewRoundedIcon from '@mui/icons-material/PreviewRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import FormatBoldRoundedIcon from '@mui/icons-material/FormatBoldRounded';
import TableChartRoundedIcon from '@mui/icons-material/TableChartRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import FormatQuoteRoundedIcon from '@mui/icons-material/FormatQuoteRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import FormatItalicRoundedIcon from '@mui/icons-material/FormatItalicRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';
import FormatStrikethroughRoundedIcon from '@mui/icons-material/FormatStrikethroughRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { MARKDOWN_TEMPLATES } from '../data/example-templates';

// ----------------------------------------------------------------------

export function MarkdownStudio() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(MARKDOWN_TEMPLATES[0].id);
  const [markdownContent, setMarkdownContent] = useState<string>(MARKDOWN_TEMPLATES[0].content);

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = MARKDOWN_TEMPLATES.find((t) => t.id === id);
    if (tmpl) {
      setMarkdownContent(tmpl.content);
      toast.success(`'${tmpl.title}' 템플릿을 불러왔습니다.`);
    }
  };

  const handleInsertFormat = (prefix: string, suffix: string = '', defaultText: string = '') => {
    setMarkdownContent((prev) => `${prev}\n${prefix}${defaultText}${suffix}\n`);
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(markdownContent);
    toast.success('마크다운 본문이 클립보드에 복사되었습니다.');
  };

  const handleDownloadMd = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `document_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('.md 파일로 다운로드되었습니다.');
  };

  const wordCount = markdownContent.trim() ? markdownContent.trim().split(/\s+/).length : 0;
  const charCount = markdownContent.length;
  const lineCount = markdownContent.split('\n').length;

  const currentTemplate = MARKDOWN_TEMPLATES.find((t) => t.id === selectedTemplateId);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        gap: 2,
      }}
    >
      {/* 1. Header Toolbar & Quick Examples */}
      <Card
        sx={{
          p: 2,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          boxShadow: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DescriptionRoundedIcon sx={{ color: 'info.main', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                마크다운 에디터 & 뷰어 스튜디오 (Markdown Studio)
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                기획서, API 명세, 회의록, README 등 실무 마크다운 문서를 작성하고 실시간 미리보기를
                제공합니다.
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RestartAltRoundedIcon />}
              onClick={() => setMarkdownContent('')}
            >
              지우기
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadMd}
            >
              .md 저장
            </Button>
            <Button
              variant="contained"
              size="small"
              color="primary"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={handleCopyMarkdown}
            >
              마크다운 복사
            </Button>
          </Box>
        </Box>

        {/* Example Presets Chips */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: 'warning.main' }} />
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              실무 마크다운 템플릿 예시 (5종):
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 0.8,
              overflowX: 'auto',
              pb: 0.5,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
            }}
          >
            {MARKDOWN_TEMPLATES.map((tmpl) => {
              const isSelected = tmpl.id === selectedTemplateId;
              return (
                <Chip
                  key={tmpl.id}
                  label={tmpl.title}
                  clickable
                  color={isSelected ? 'info' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  size="small"
                  onClick={() => handleSelectTemplate(tmpl.id)}
                  sx={{
                    fontWeight: isSelected ? 800 : 500,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </Box>
        </Box>
      </Card>

      {/* 2. Main Studio Resizable Panels (Markdown Editor & Live Preview) */}
      <ResizablePanelGroup orientation="horizontal" autoSaveId="markdown-studio-split">
        {/* Left Column: Markdown Editor & Fast Formatting Toolbar */}
        <ResizablePanel id="md-editor" defaultSize={50} minSize={20}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              height: '100%',
              minHeight: { xs: 320, md: 0 },
              overflow: 'hidden',
            }}
          >
            {/* Quick Formatting Toolbar */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                pb: 1,
                mb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexWrap: 'wrap',
                gap: 0.5,
                flexShrink: 0,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, flexWrap: 'wrap' }}>
                <Tooltip title="제목 1 (H1)">
                  <IconButton size="small" onClick={() => handleInsertFormat('# ', '', '대제목')}>
                    <TitleRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="굵게 (Bold)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('**', '**', '굵은 텍스트')}
                  >
                    <FormatBoldRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="기울임 (Italic)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('*', '*', '기울임 텍스트')}
                  >
                    <FormatItalicRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="취소선 (Strikethrough)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('~~', '~~', '취소선 텍스트')}
                  >
                    <FormatStrikethroughRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="인용구 (Quote)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('> ', '', '중요 인용구')}
                  >
                    <FormatQuoteRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="표 (Table)">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleInsertFormat(
                        '| 컬럼1 | 컬럼2 | 컬럼3 |\n| :--- | :--- | :--- |\n| 데이터1 | 데이터2 | 데이터3 |'
                      )
                    }
                  >
                    <TableChartRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="코드 블록 (Code Block)">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleInsertFormat('```javascript\n', '\n```', 'console.log("Hello World");')
                    }
                  >
                    <CodeRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="할 일 체크리스트 (Task List)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('- [ ] ', '', '새로운 액션 아이템')}
                  >
                    <CheckBoxOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="구분선 (HR)">
                  <IconButton size="small" onClick={() => handleInsertFormat('---\n')}>
                    <HorizontalRuleRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="링크 (Link)">
                  <IconButton
                    size="small"
                    onClick={() => handleInsertFormat('[링크 텍스트](', ')', 'https://example.com')}
                  >
                    <LinkRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {charCount.toLocaleString()}자 | {wordCount.toLocaleString()}단어 | {lineCount}줄
                </Typography>
              </Box>
            </Box>

            {/* Text Area */}
            <TextField
              multiline
              fullWidth
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              placeholder="마크다운 문서를 입력하세요..."
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  fontFamily: 'Consolas, Monaco, monospace',
                  fontSize: '0.88rem',
                  lineHeight: 1.6,
                  p: 1.5,
                  bgcolor: 'background.neutral',
                },
                '& .MuiInputBase-input': {
                  height: '100% !important',
                  overflowY: 'auto !important',
                },
              }}
            />
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Right Column: Live Markdown Rendered Preview */}
        <ResizablePanel id="md-preview" defaultSize={50} minSize={20}>
          <Card
            sx={{
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              height: '100%',
              minHeight: { xs: 320, md: 0 },
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                pb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider',
                flexShrink: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <PreviewRoundedIcon sx={{ fontSize: 18, color: 'info.main' }} />
                실시간 마크다운 렌더링 미리보기
              </Typography>
              {currentTemplate && (
                <Chip
                  label={currentTemplate.categoryLabel}
                  size="small"
                  variant="outlined"
                  color="info"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>

            {/* Rendered Content Area */}
            <Box
              sx={{
                flex: '1 1 auto',
                minHeight: 0,
                overflowY: 'auto',
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 1.5,
                color: 'text.primary',
                '& h1': {
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  mt: 1,
                  mb: 1.5,
                  pb: 0.5,
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                },
                '& h2': {
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  mt: 2,
                  mb: 1,
                  color: 'primary.main',
                },
                '& h3': { fontSize: '1.05rem', fontWeight: 700, mt: 1.5, mb: 0.8 },
                '& p': { my: 0.8, lineHeight: 1.7, fontSize: '0.92rem' },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  m: 0,
                  my: 1.5,
                  pl: 2,
                  py: 0.5,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontStyle: 'italic',
                },
                '& pre': {
                  bgcolor: '#1e293b',
                  color: '#f8fafc',
                  p: 1.5,
                  borderRadius: 1.5,
                  overflowX: 'auto',
                  fontSize: '0.85rem',
                  fontFamily: 'Consolas, Monaco, monospace',
                  my: 1.5,
                },
                '& code': {
                  bgcolor: 'action.hover',
                  px: 0.6,
                  py: 0.2,
                  borderRadius: 0.8,
                  fontSize: '0.85em',
                  fontFamily: 'Consolas, Monaco, monospace',
                  color: 'primary.main',
                },
                '& pre code': {
                  bgcolor: 'transparent',
                  p: 0,
                  color: '#f8fafc',
                },
                '& table': {
                  width: '100%',
                  borderCollapse: 'collapse',
                  my: 1.5,
                  fontSize: '0.88rem',
                },
                '& th, & td': {
                  border: '1px solid',
                  borderColor: 'divider',
                  p: 1,
                  textAlign: 'left',
                },
                '& th': {
                  bgcolor: 'background.paper',
                  fontWeight: 700,
                },
                '& ul, & ol': {
                  pl: 3,
                  my: 0.8,
                },
                '& li': {
                  my: 0.4,
                  fontSize: '0.92rem',
                },
                '& hr': {
                  border: 'none',
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  my: 2,
                },
              }}
            >
              {markdownContent ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                  {markdownContent}
                </ReactMarkdown>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.disabled', textAlign: 'center', py: 6 }}
                >
                  좌측 에디터에 마크다운을 입력하면 실시간으로 스타일링된 문서가 표시됩니다.
                </Typography>
              )}
            </Box>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}

export default MarkdownStudio;
