'use client';

import React, { useState } from 'react';

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Box, Card, Tooltip, Typography, IconButton } from '@mui/material';

import { DashboardContent } from 'src/layouts/dashboard';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { ImageViewerCard } from '../common/image-viewer-card';
import { useTextExtract } from '../text-extract/use-text-extract';
import { LineNumberTextField } from '../common/line-number-text-field';
import { TextExtractToolbar } from '../text-extract/text-extract-toolbar';

// ----------------------------------------------------------------------

export function TextExtractView() {
  const ocr = useTextExtract();

  const [showOverlays, setShowOverlays] = useState(true);
  const [showProcessed, setShowProcessed] = useState(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    ocr.viewer.handleDrop(e, (file: File) => ocr.processFile(file));
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    if (e.clipboardData.files?.[0]) {
      e.preventDefault();
      ocr.processFile(e.clipboardData.files[0]);
      return;
    }
    for (let i = 0; i < (e.clipboardData.items?.length ?? 0); i++) {
      const item = e.clipboardData.items[i];
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const f = item.getAsFile();
        if (f) {
          ocr.processFile(f);
          break;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Delete' || e.key === 'Backspace') ocr.handleClear();
  };

  const handleCopy = () => navigator.clipboard.writeText(ocr.extractedText);
  const handleCleanText = () => {
    ocr.setExtractedText(
      ocr.extractedText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join(' ')
    );
  };

  return (
    <DashboardContent
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 1 auto',
        minHeight: 0,
        pb: 2,
      }}
    >
      <TextExtractToolbar
        hook={ocr}
        uiState={{ showOverlays, setShowOverlays, showProcessed, setShowProcessed }}
      />

      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="text-extract-split"
        style={{ flex: 1 }}
      >
        <ResizablePanel id="extract-image" defaultSize={50} minSize={25}>
          <ImageViewerCard
            title="원본 이미지"
            zoom={ocr.viewer.zoom}
            setZoom={ocr.viewer.setZoom}
            offset={ocr.viewer.offset}
            rotation={showProcessed ? 0 : ocr.viewer.rotation}
            setRotation={ocr.viewer.setRotation}
            isVFlip={showProcessed ? false : ocr.viewer.isVFlip}
            setIsVFlip={ocr.viewer.setIsVFlip}
            isHFlip={showProcessed ? false : ocr.viewer.isHFlip}
            setIsHFlip={ocr.viewer.setIsHFlip}
            resetViewer={ocr.viewer.resetViewer}
            containerRef={ocr.viewer.containerRef}
            isDragActive={ocr.viewer.isDragActive}
            onDrop={handleDrop}
            onDragOver={ocr.viewer.handleDragOver}
            onDragEnter={ocr.viewer.handleDragEnter}
            onDragLeave={ocr.viewer.handleDragLeave}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onMouseDown={(e) =>
              ocr.viewer.handlePanStart(e, !!(ocr.imagePreviewUrl || ocr.processedImageUrl))
            }
            imagePreviewUrl={
              showProcessed && ocr.processedImageUrl ? ocr.processedImageUrl : ocr.imagePreviewUrl
            }
            isPanning={ocr.viewer.isPanning.current}
          >
            {showOverlays && ocr.ocrData && ocr.imageNaturalSize.width > 0 && (
              <Box
                sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
              >
                {ocr.ocrData.map((word, idx) => {
                  const targetBbox = showProcessed ? word.processedBbox : word.originalBbox;
                  const divW = showProcessed
                    ? ocr.viewer.rotation % 180 !== 0
                      ? ocr.originalSize.height
                      : ocr.originalSize.width
                    : ocr.originalSize.width;
                  const divH = showProcessed
                    ? ocr.viewer.rotation % 180 !== 0
                      ? ocr.originalSize.width
                      : ocr.originalSize.height
                    : ocr.originalSize.height;

                  const leftPct = (targetBbox.x0 / divW) * 100;
                  const topPct = (targetBbox.y0 / divH) * 100;
                  const widthPct = ((targetBbox.x1 - targetBbox.x0) / divW) * 100;
                  const heightPct = ((targetBbox.y1 - targetBbox.y0) / divH) * 100;

                  return (
                    <Box
                      key={idx}
                      sx={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        top: `${topPct}%`,
                        width: `${widthPct}%`,
                        height: `${heightPct}%`,
                        border: '1px solid rgba(255, 0, 0, 0.6)',
                        backgroundColor: 'rgba(255, 0, 0, 0.1)',
                        boxSizing: 'border-box',
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </ImageViewerCard>
        </ResizablePanel>

        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        <ResizablePanel id="extract-text" defaultSize={50} minSize={25}>
          <Card
            sx={{
              flex: 1,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              p: 2,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1.5,
                minHeight: 40,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                추출된 텍스트
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
                <Tooltip title="공백 제거">
                  <span>
                    <IconButton
                      size="small"
                      onClick={handleCleanText}
                      disabled={!ocr.extractedText}
                    >
                      <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="복사">
                  <span>
                    <IconButton size="small" onClick={handleCopy} disabled={!ocr.extractedText}>
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            </Box>
            <LineNumberTextField
              value={ocr.extractedText}
              onChange={ocr.setExtractedText}
              placeholder={ocr.isExtracting ? '추출 중...' : '추출된 텍스트가 표시됩니다.'}
              sx={{ flex: 1, minHeight: 0 }}
            />
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>
    </DashboardContent>
  );
}
