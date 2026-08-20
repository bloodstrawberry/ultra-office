'use client';

import { toast } from 'sonner';
import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { generateDocxBlob } from '../utils/docx-generator';
import { convertDocxToHtml } from '../utils/mammoth-viewer-utils';

// ----------------------------------------------------------------------

export function WordDocumentViewer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string>('sample-contract.docx');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load a local file from user
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('.docx 형식의 워드 파일만 지원합니다.');
      return;
    }

    try {
      setIsLoading(true);
      setFileName(file.name);
      const arrayBuffer = await file.arrayBuffer();
      const result = await convertDocxToHtml(arrayBuffer);
      setHtmlContent(result.value);
      toast.success(`'${file.name}' 문서를 성공적으로 열었습니다.`);
    } catch (err) {
      console.error(err);
      toast.error('Word 문서를 변환하는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-load a sample DOCX generated on the fly
  const handleLoadSample = async (type: 'contract' | 'report') => {
    try {
      setIsLoading(true);
      setFileName(type === 'contract' ? '샘플_표준근로계약서.docx' : '샘플_사업기획서.docx');

      const blob = await generateDocxBlob(
        {
          title: type === 'contract' ? '표준 근로계약서' : '2026 사업 기획서',
          subtitle: 'Ultra Office Sample Document',
          author: '홍길동',
          company: '(주)울트라오피스',
          date: '2026.08.20',
          version: '1.0',
          headerText: 'Ultra Office DocMaster Viewer',
          footerText: 'Confidential',
          themeColor: '#1E40AF',
          accentColor: '#3B82F6',
        },
        [
          {
            id: '1',
            type: 'heading1',
            content: type === 'contract' ? '제 1 장 총 칙' : '1. 사업 추진 목표',
          },
          {
            id: '2',
            type: 'paragraph',
            content:
              '본 문서는 Mammoth.js 렌더링 엔진을 통해 .docx 바이너리 파일을 순수 HTML로 파싱하여 브라우저에서 표시한 예시입니다. 원본 워드 문서의 제목, 본문, 표, 서식이 그대로 유지됩니다.',
          },
          {
            id: '3',
            type: 'callout',
            content: '클라이언트 사이드에서 백엔드 업로드 없이 100% 안전하게 동작합니다.',
          },
          {
            id: '4',
            type: 'table',
            content: '',
            tableData: [
              ['구분', '세부 내용', '담당자'],
              ['1단계', '워드 파일 파싱 및 HTML 변환', 'FE 엔지니어'],
              ['2단계', 'CSS 스타일 맵핑 및 렌더링', 'UI 디자이너'],
            ],
          },
        ]
      );

      const arrayBuffer = await blob.arrayBuffer();
      const result = await convertDocxToHtml(arrayBuffer);
      setHtmlContent(result.value);
      toast.success('샘플 문서를 성공적으로 로드했습니다.');
    } catch (err) {
      console.error(err);
      toast.error('샘플 문서 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyHtml = () => {
    if (!htmlContent) return;
    navigator.clipboard.writeText(htmlContent);
    toast.success('HTML 코드가 클립보드에 복사되었습니다.');
  };

  const handlePrint = () => {
    window.print();
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
      {/* Top Action Bar */}
      <Card
        sx={{
          p: 2,
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
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUploadRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            내 PC에서 Word(.docx) 열기
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon fontSize="small" />}
            onClick={() => handleLoadSample('contract')}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            샘플 계약서 열기
          </Button>

          <Button
            size="small"
            variant="outlined"
            onClick={() => handleLoadSample('report')}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            샘플 기획서 열기
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>
            {fileName}
          </Typography>

          <Button
            size="small"
            variant="outlined"
            startIcon={<ContentCopyRoundedIcon fontSize="small" />}
            onClick={handleCopyHtml}
            disabled={!htmlContent}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            HTML 복사
          </Button>

          <Button
            size="small"
            variant="outlined"
            startIcon={<PrintRoundedIcon fontSize="small" />}
            onClick={handlePrint}
            disabled={!htmlContent}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            인쇄 (PDF)
          </Button>
        </Box>
      </Card>

      {/* Main Document Viewer Container */}
      <Box
        sx={{
          flexGrow: 1,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0f172a' : '#cbd5e1'),
          p: { xs: 1.5, md: 3 },
          borderRadius: 2,
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: htmlContent ? 'flex-start' : 'center',
        }}
      >
        {isLoading ? (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 8 }}
          >
            <CircularProgress size={40} />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Word 문서를 변환 및 렌더링하는 중입니다...
            </Typography>
          </Box>
        ) : htmlContent ? (
          /* A4 Paper Document Container */
          <Box
            sx={{
              width: '100%',
              maxWidth: 760,
              minHeight: 850,
              bgcolor: '#ffffff',
              color: '#1e293b',
              p: { xs: 3, md: 6 },
              borderRadius: 1,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
              fontFamily: '"Pretendard", -apple-system, sans-serif',
              lineHeight: 1.8,
              '& h1, & h2, & h3': {
                color: '#0f172a',
                borderBottom: '1px solid #e2e8f0',
                pb: 1,
                mt: 3,
                mb: 1.5,
              },
              '& table': {
                width: '100%',
                borderCollapse: 'collapse',
                my: 2,
              },
              '& th, & td': {
                border: '1px solid #cbd5e1',
                p: '8px 12px',
                textAlign: 'left',
              },
              '& th': {
                bgcolor: '#f1f5f9',
                fontWeight: 700,
              },
              '& blockquote': {
                borderLeft: '4px solid #3b82f6',
                m: '16px 0',
                pl: 2,
                color: '#475569',
                fontStyle: 'italic',
              },
            }}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              p: 6,
              bgcolor: 'background.paper',
              borderRadius: 2,
              border: (theme) => `1px dashed ${theme.palette.divider}`,
              maxWidth: 500,
            }}
          >
            <CloudUploadRoundedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
              열람할 Word (.docx) 문서를 선택하세요
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              상단의 버튼을 눌러 내 컴퓨터의 워드 파일을 열거나 샘플 문서를 바로 확인해 보세요.
            </Typography>
            <Button
              variant="contained"
              onClick={() => handleLoadSample('contract')}
              startIcon={<AutoAwesomeRoundedIcon />}
            >
              샘플 계약서 바로 열기
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
