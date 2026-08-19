import type { UploadProps } from './types';

import { useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { varAlpha, mergeClasses } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

import { uploadClasses } from './classes';
import { RejectionFiles } from './components/rejection-files';

// ----------------------------------------------------------------------

export function UploadAvatar({
  sx,
  error,
  value,
  disabled,
  helperText,
  className,
  ...other
}: UploadProps) {
  const { getRootProps, getInputProps, isDragActive, isDragReject, fileRejections } = useDropzone({
    multiple: false,
    disabled,
    accept: { 'image/*': [] },
    ...other,
  });

  const hasFile = !!value;

  const hasError = isDragReject || !!error;

  const [preview, setPreview] = useState('');

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

  useEffect(() => {
    if (typeof value === 'string') {
      setPreview(value);
    } else if (value instanceof File) {
      setPreview(URL.createObjectURL(value));
    }
  }, [value]);

  const renderPreview = () =>
    hasFile && (
      <Box
        component="img"
        alt="Avatar"
        src={preview}
        sx={{ width: 1, height: 1, objectFit: 'cover', borderRadius: '50%' }}
      />
    );

  const renderPlaceholder = () => (
    <Box
      className="upload-placeholder"
      sx={(theme) => ({
        top: 0,
        gap: 1,
        left: 0,
        width: 1,
        height: 1,
        zIndex: 9,
        display: 'flex',
        borderRadius: '50%',
        position: 'absolute',
        alignItems: 'center',
        color: 'text.disabled',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
        transition: theme.transitions.create(['opacity'], {
          duration: theme.transitions.duration.shorter,
        }),
        '&:hover': { opacity: 0.72 },
        ...(hasError && {
          color: 'error.main',
          bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08),
        }),
        ...(hasFile && {
          zIndex: 9,
          opacity: 0,
          color: 'common.white',
          bgcolor: varAlpha(theme.vars.palette.grey['900Channel'], 0.64),
        }),
      })}
    >
      <AddAPhotoIcon sx={{ width: 32, height: 32 }} />

      <Typography variant="caption">{hasFile ? 'Update photo' : 'Upload photo'}</Typography>
    </Box>
  );

  const renderContent = () => (
    <Box
      sx={{
        width: 1,
        height: 1,
        overflow: 'hidden',
        borderRadius: '50%',
        position: 'relative',
      }}
    >
      {renderPreview()}
      {renderPlaceholder()}
    </Box>
  );

  return (
    <>
      <Box
        {...getRootProps()}
        tabIndex={0}
        onPaste={handlePaste}
        className={mergeClasses([uploadClasses.uploadBox, className])}
        sx={[
          (theme) => ({
            p: 1,
            m: 'auto',
            width: 144,
            height: 144,
            cursor: 'pointer',
            overflow: 'hidden',
            borderRadius: '50%',
            border: `1px dashed ${varAlpha(theme.vars.palette.grey['500Channel'], 0.2)}`,
            ...(isDragActive && { opacity: 0.72 }),
            ...(disabled && { opacity: 0.48, pointerEvents: 'none' }),
            ...(hasError && { borderColor: 'error.main' }),
            ...(hasFile && {
              ...(hasError && { bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.08) }),
              '&:hover .upload-placeholder': { opacity: 1 },
            }),
          }),
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <input {...getInputProps()} />

        {renderContent()}
      </Box>

      {helperText && helperText}

      {!!fileRejections.length && <RejectionFiles files={fileRejections} />}
    </>
  );
}
