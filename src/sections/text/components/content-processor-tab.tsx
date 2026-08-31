'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { TextAreaPanel } from '../../util/components/shared-text-area';
import { LineNumberTextField } from '../../util/components/line-number-text-field';
import {
  sortLines,
  trimLines,
  encodeUrl,
  decodeUrl,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toTitleCase,
  toPascalCase,
  encodeBase64,
  decodeBase64,
  calculateHash,
  parseJwtToken,
  anonymizeJson,
  toConstantCase,
  deduplicateLines,
  removeEmptyLines,
} from '../../util/utils/text-transform-utils';

// ----------------------------------------------------------------------

export function ContentProcessorTab() {
  const [contentText, setContentText] = useState<string>(
    'Hello World! Welcome to Ultra Office 2026.'
  );
  const [processedText, setProcessedText] = useState<string>('');

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDownload = (text: string, ext: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformed_result.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
      }}
    >
      {/* Action Toolbar Cards */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          ⚡ 변환 기능 원클릭 실행
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {/* Case transforms */}
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toCamelCase(contentText))}
          >
            camelCase
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toPascalCase(contentText))}
          >
            PascalCase
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toSnakeCase(contentText))}
          >
            snake_case
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toKebabCase(contentText))}
          >
            kebab-case
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toConstantCase(contentText))}
          >
            CONSTANT_CASE
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => setProcessedText(toTitleCase(contentText))}
          >
            Title Case
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Line tools */}
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setProcessedText(sortLines(contentText, 'asc'))}
          >
            가나다 오름차순 정렬
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setProcessedText(deduplicateLines(contentText))}
          >
            중복 줄 제거
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setProcessedText(trimLines(contentText))}
          >
            줄 앞뒤 공백 제거
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => setProcessedText(removeEmptyLines(contentText))}
          >
            빈 줄 제거
          </Button>

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          {/* Encoders */}
          <Button
            size="small"
            variant="contained"
            color="info"
            onClick={() => setProcessedText(encodeBase64(contentText))}
          >
            Base64 인코딩
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="info"
            onClick={() => setProcessedText(decodeBase64(contentText))}
          >
            Base64 디코딩
          </Button>
          <Button
            size="small"
            variant="contained"
            color="success"
            onClick={() => setProcessedText(encodeUrl(contentText))}
          >
            URL 인코딩
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="success"
            onClick={() => setProcessedText(decodeUrl(contentText))}
          >
            URL 디코딩
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => setProcessedText(calculateHash(contentText, 'sha256'))}
          >
            SHA-256 해시
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="warning"
            onClick={() => setProcessedText(calculateHash(contentText, 'md5'))}
          >
            MD5 해시
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              const jwt = parseJwtToken(contentText);
              setProcessedText(
                jwt ? JSON.stringify(jwt, null, 2) : '유효한 JWT 토큰 형식이 아닙니다.'
              );
            }}
          >
            JWT 디코딩
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            onClick={() => setProcessedText(anonymizeJson(contentText))}
          >
            JSON 민감정보 마스킹
          </Button>
        </Box>
      </Card>

      {/* Editors Resizable Panels */}
      <ResizablePanelGroup orientation="horizontal" autoSaveId="content-processor-split">
        {/* Left: Source Text */}
        <ResizablePanel id="source-text" defaultSize={50} minSize={25}>
          <TextAreaPanel
            title="원본 텍스트"
            actions={
              <IconButton size="small" color="error" onClick={() => setContentText('')}>
                <DeleteSweepRoundedIcon fontSize="small" />
              </IconButton>
            }
          >
            <LineNumberTextField
              value={contentText}
              onChange={setContentText}
              placeholder="가공할 텍스트를 입력하세요..."
            />
          </TextAreaPanel>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Right: Processed Text */}
        <ResizablePanel id="processed-text" defaultSize={50} minSize={25}>
          <TextAreaPanel
            title="가공된 결과"
            actions={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton size="small" onClick={() => handleCopy(processedText)}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDownload(processedText, 'txt')}>
                  <DownloadRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            }
          >
            <LineNumberTextField
              value={processedText}
              readOnly
              placeholder="가공 결과가 여기에 표시됩니다..."
            />
          </TextAreaPanel>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Box>
  );
}
