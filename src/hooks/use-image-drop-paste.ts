import { useState, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

export interface UseImageDropPasteOptions {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  accept?: string[]; // e.g. ['image/*'] or ['image/png', 'image/jpeg', 'image/gif']
  disabled?: boolean;
  enablePaste?: boolean;
}

export function useImageDropPaste({
  onFiles,
  multiple = false,
  accept = ['image/*'],
  disabled = false,
  enablePaste = true,
}: UseImageDropPasteOptions) {
  const [isDragActive, setIsDragActive] = useState(false);

  const isAcceptedFile = useCallback(
    (file: File) => {
      if (!accept || accept.length === 0) return true;
      return accept.some((pattern) => {
        if (pattern === 'image/*' || pattern === '*/*') {
          return file.type.startsWith('image/');
        }
        if (pattern.endsWith('/*')) {
          const mainType = pattern.split('/')[0];
          return file.type.startsWith(`${mainType}/`);
        }
        if (pattern.startsWith('.')) {
          return file.name.toLowerCase().endsWith(pattern.toLowerCase());
        }
        return file.type === pattern;
      });
    },
    [accept]
  );

  const handleFiles = useCallback(
    (incomingFiles: FileList | File[]) => {
      if (disabled) return;
      const fileList = Array.from(incomingFiles);
      const filtered = fileList.filter(isAcceptedFile);

      if (filtered.length === 0) return;

      const finalFiles = multiple ? filtered : [filtered[0]];
      onFiles(finalFiles);
    },
    [disabled, isAcceptedFile, multiple, onFiles]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(true);
    },
    [disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      if (!isDragActive) setIsDragActive(true);
    },
    [disabled, isDragActive]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      // Only deactivate if leaving the bound container
      if (e.currentTarget.contains(e.relatedTarget as Node)) return;
      setIsDragActive(false);
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [disabled, handleFiles]
  );

  // Paste Event Listener
  useEffect(() => {
    if (disabled || !enablePaste) return undefined;

    const handleWindowPaste = (e: ClipboardEvent) => {
      // Extract image files from clipboard
      const clipboardFiles: File[] = [];

      if (e.clipboardData?.files && e.clipboardData.files.length > 0) {
        for (let i = 0; i < e.clipboardData.files.length; i += 1) {
          const file = e.clipboardData.files[i];
          if (isAcceptedFile(file)) {
            clipboardFiles.push(file);
          }
        }
      }

      // If no direct files, check items (e.g. copied from web/screenshot)
      if (clipboardFiles.length === 0 && e.clipboardData?.items) {
        for (let i = 0; i < e.clipboardData.items.length; i += 1) {
          const item = e.clipboardData.items[i];
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (file && isAcceptedFile(file)) {
              clipboardFiles.push(file);
            }
          }
        }
      }

      if (clipboardFiles.length > 0) {
        e.preventDefault();
        const finalFiles = multiple ? clipboardFiles : [clipboardFiles[0]];
        onFiles(finalFiles);
      }
    };

    window.addEventListener('paste', handleWindowPaste);
    return () => {
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [disabled, enablePaste, handleFiles, isAcceptedFile, multiple, onFiles]);

  const getRootProps = useCallback(
    <T extends Record<string, any>>(props?: T) => ({
      ...props,
      onDragEnter: (e: React.DragEvent) => {
        handleDragEnter(e);
        props?.onDragEnter?.(e);
      },
      onDragOver: (e: React.DragEvent) => {
        handleDragOver(e);
        props?.onDragOver?.(e);
      },
      onDragLeave: (e: React.DragEvent) => {
        handleDragLeave(e);
        props?.onDragLeave?.(e);
      },
      onDrop: (e: React.DragEvent) => {
        handleDrop(e);
        props?.onDrop?.(e);
      },
    }),
    [handleDragEnter, handleDragLeave, handleDragOver, handleDrop]
  );

  return {
    isDragActive,
    handleDragEnter,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFiles,
    getRootProps,
  };
}
