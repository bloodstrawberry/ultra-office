import type { UploadProps } from './types';

import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { uploadClasses } from './classes';

// ----------------------------------------------------------------------

export function UploadBox({ placeholder, error, disabled, className, sx, ...other }: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    disabled,
    ...other,
  });

  const hasError = isDragReject || error;

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardFiles: File[] = [];
    if (e.clipboardData?.files?.length) {
      for (let i = 0; i < e.clipboardData.files.length; i += 1) {
        clipboardFiles.push(e.clipboardData.files[i]);
      }
    } else if (e.clipboardData?.items) {
      for (let i = 0; i < e.clipboardData.items.length; i += 1) {
        const item = e.clipboardData.items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) clipboardFiles.push(file);
        }
      }
    }
    if (clipboardFiles.length > 0) {
      e.preventDefault();
      if (other.onDrop) {
        (other.onDrop as any)(clipboardFiles, [], e as any);
      } else if (other.onDropAccepted) {
        (other.onDropAccepted as any)(clipboardFiles, e as any);
      }
    }
  };

  return (
    <Box
      {...getRootProps()}
      tabIndex={0}
      onPaste={handlePaste}
      className={mergeClasses([uploadClasses.uploadBox, className])}
      sx={[
        (theme) => ({
          width: 64,
          height: 64,
          flexShrink: 0,
          display: 'flex',
          borderRadius: 1,
          cursor: 'pointer',
          alignItems: 'center',
          color: 'text.disabled',
          justifyContent: 'center',
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          border: `dashed 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.16)}`,
          ...(isDragActive && { opacity: 0.72 }),
          ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
          ...(hasError && {
            color: 'error.main',
            borderColor: 'error.main',
            bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
          }),
          '&:hover': { opacity: 0.72 },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <input {...getInputProps()} />

      {placeholder || <CloudUploadIcon sx={{ width: 28, height: 28 }} />}
    </Box>
  );
}
