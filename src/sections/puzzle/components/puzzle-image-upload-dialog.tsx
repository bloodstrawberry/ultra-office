'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import CircularProgress from '@mui/material/CircularProgress';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';

import { toast } from 'src/components/snackbar';

interface PuzzleImageUploadDialogProps {
  open: boolean;
  title: string;
  isImporting: boolean;
  onClose: () => void;
  onImage: (file: File) => Promise<boolean>;
}

export function PuzzleImageUploadDialog({
  open,
  title,
  isImporting,
  onClose,
  onImage,
}: PuzzleImageUploadDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const submittingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const submitImage = useCallback(
    async (file?: File) => {
      if (isImporting || submittingRef.current) return;
      if (!file || !file.type.startsWith('image/')) {
        toast.error('이미지 파일(PNG, JPG, WebP 등)을 선택해 주세요.');
        return;
      }
      submittingRef.current = true;
      try {
        if (await onImage(file)) onClose();
      } finally {
        submittingRef.current = false;
      }
    },
    [isImporting, onClose, onImage]
  );

  useEffect(() => {
    if (!open) return undefined;
    const handlePaste = (event: ClipboardEvent) => {
      const image = Array.from(event.clipboardData?.items || [])
        .find((item) => item.type.startsWith('image/'))
        ?.getAsFile();
      if (!image) return;
      event.preventDefault();
      void submitImage(image);
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [open, submitImage]);

  const pasteFromClipboard = async () => {
    try {
      if (!navigator.clipboard?.read) throw new Error('clipboard-unavailable');
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((candidate) => candidate.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          await submitImage(new File([blob], 'clipboard-image.png', { type }));
          return;
        }
      }
      toast.error('클립보드에 이미지가 없습니다.');
    } catch {
      toast.error('클립보드를 읽을 수 없습니다. Ctrl+V로 붙여넣어 주세요.');
    }
  };

  return (
    <Dialog open={open} onClose={isImporting ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{title} 이미지 업로드</DialogTitle>
      <DialogContent>
        <Box
          onDragEnter={(event) => {
            if (!event.dataTransfer.types.includes('Files')) return;
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragOver={(event) => {
            if (!event.dataTransfer.types.includes('Files')) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setIsDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            setIsDragging(false);
            void submitImage(
              Array.from(event.dataTransfer.files).find((file) => file.type.startsWith('image/'))
            );
          }}
          sx={{
            mt: 1,
            p: 4,
            minHeight: 230,
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'divider',
            borderRadius: 2,
            bgcolor: isDragging ? 'action.hover' : 'background.neutral',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
            textAlign: 'center',
          }}
        >
          {isImporting ? (
            <CircularProgress />
          ) : (
            <CloudUploadRoundedIcon color="primary" sx={{ fontSize: 48 }} />
          )}
          <Typography variant="subtitle1">
            {isImporting ? '이미지 분석 중...' : '이미지를 여기에 끌어 놓으세요'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            파일을 선택하거나 클립보드 이미지를 Ctrl+V로 붙여넣을 수도 있습니다.
          </Typography>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              void submitImage(event.target.files?.[0]);
              event.target.value = '';
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<CloudUploadRoundedIcon />}
              disabled={isImporting}
              onClick={() => inputRef.current?.click()}
            >
              이미지 파일 선택
            </Button>
            <Button
              variant="outlined"
              startIcon={<ContentPasteRoundedIcon />}
              disabled={isImporting}
              onClick={() => void pasteFromClipboard()}
            >
              클립보드 붙여넣기
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isImporting} color="inherit">
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}
