import type { useTextExtract } from './use-text-extract';

import React from 'react';

import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DocumentScannerIcon from '@mui/icons-material/DocumentScanner';
import {
  Box,
  Card,
  Stack,
  Button,
  Tooltip,
  IconButton,
  Typography,
  CircularProgress,
} from '@mui/material';

import { LanguageSelect } from './language-select';
import { OcrSettingsPopover } from './ocr-settings-popover';

interface Props {
  hook: ReturnType<typeof useTextExtract>;
  uiState: {
    showOverlays: boolean;
    setShowOverlays: (v: boolean) => void;
    showProcessed: boolean;
    setShowProcessed: (v: boolean) => void;
  };
}

export function TextExtractToolbar({ hook, uiState }: Props) {
  return (
    <Card
      sx={{
        p: 2,
        mb: 2,
        flexShrink: 0,
        display: 'flex',
        flexWrap: 'wrap',
        gap: 3,
        alignItems: 'center',
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <LanguageSelect
          value={hook.language}
          onChange={hook.setLanguage}
          disabled={hook.isExtracting}
        />
        <OcrSettingsPopover settings={hook.settings} onChange={hook.updateSettings} />
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
            p: 0.5,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tooltip title="결과 표시">
            <IconButton
              size="small"
              onClick={() => uiState.setShowOverlays(!uiState.showOverlays)}
              sx={{
                bgcolor: uiState.showOverlays ? 'background.paper' : 'transparent',
                borderRadius: 1,
              }}
            >
              <DocumentScannerIcon
                sx={{ width: 20, height: 20, color: uiState.showOverlays ? '#FF5630' : 'inherit' }}
              />
            </IconButton>
          </Tooltip>
          {hook.processedImageUrl && (
            <Tooltip title="전처리 뷰">
              <IconButton
                size="small"
                onClick={() => uiState.setShowProcessed(!uiState.showProcessed)}
                sx={{
                  bgcolor: uiState.showProcessed ? 'background.paper' : 'transparent',
                  borderRadius: 1,
                }}
              >
                <AutoFixHighIcon
                  sx={{
                    width: 20,
                    height: 20,
                    color: uiState.showProcessed ? 'primary.main' : 'inherit',
                  }}
                />
              </IconButton>
            </Tooltip>
          )}
        </Box>
        <input
          type="file"
          accept="image/*"
          hidden
          ref={hook.fileInputRef}
          onChange={(e) => {
            if (e.target.files?.[0]) hook.processFile(e.target.files[0]);
          }}
        />
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => hook.fileInputRef.current?.click()}
          disabled={hook.isExtracting}
        >
          이미지 업로드
        </Button>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={hook.handleExtractText}
          disabled={!hook.imageFile || hook.isExtracting}
        >
          추출하기
        </Button>
        <Tooltip title="초기화">
          <span>
            <IconButton
              onClick={hook.handleClear}
              disabled={!hook.imageFile && !hook.extractedText}
              color="error"
            >
              <DeleteSweepIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
      {hook.isExtracting && (
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography variant="body2" color="text.secondary">
            {hook.progressStatus} ({hook.progress}%)
          </Typography>
        </Box>
      )}
    </Card>
  );
}
