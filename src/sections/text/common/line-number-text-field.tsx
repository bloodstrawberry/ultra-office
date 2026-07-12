'use client';

import type { SxProps } from '@mui/material';
import type { Theme } from '@mui/material/styles';

import React, { useRef, useState, useEffect, useCallback } from 'react';

import { Box, useTheme, TextField } from '@mui/material';

interface LineNumberTextFieldProps {
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  label?: string;
  sx?: SxProps<Theme>;
  highlightRegex?: RegExp | null;
  error?: boolean;
}

export function LineNumberTextField({
  value,
  onChange,
  placeholder,
  readOnly,
  label,
  sx,
  highlightRegex,
  error,
}: LineNumberTextFieldProps) {
  const theme = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const highlightScrollRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  const sharedTextStyles = {
    fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    fontSize: '14px',
    lineHeight: 1.5,
    fontWeight: 'fontWeightRegular',
    whiteSpace: 'pre-wrap' as const,
    wordBreak: 'break-word' as const,
    wordWrap: 'break-word' as const,
    letterSpacing: 'normal',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0',
    tabSize: 4,
    MozTabSize: 4, // for Firefox
  };

  const calculateHeights = useCallback(() => {
    if (!mirrorRef.current || !inputRef.current || !scrollRef.current) return;

    const gutterWidth = scrollRef.current.offsetWidth;
    const clientWidth = inputRef.current.clientWidth;
    const offsetWidth = inputRef.current.offsetWidth;
    const scrollbarWidth = offsetWidth - clientWidth;

    // Exact fractional width of the content area
    const exactWidth = inputRef.current.getBoundingClientRect().width - scrollbarWidth;

    // Match mirror width exactly to the visible input text area width
    mirrorRef.current.style.width = `${exactWidth}px`;

    if (highlightScrollRef.current) {
      highlightScrollRef.current.style.left = `${gutterWidth}px`;
      highlightScrollRef.current.style.width = `${exactWidth}px`;
      highlightScrollRef.current.style.right = 'auto';
    }

    const children = mirrorRef.current.children;
    const newHeights = new Array(children.length);
    for (let i = 0; i < children.length; i++) {
      newHeights[i] = (children[i] as HTMLElement).offsetHeight;
    }

    // Update heights state only if there are actual changes
    setLineHeights((prev) => {
      if (prev.length !== newHeights.length) return newHeights;
      for (let i = 0; i < prev.length; i++) {
        if (prev[i] !== newHeights[i]) return newHeights;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    calculateHeights();
  }, [value, calculateHeights]);

  useEffect(() => {
    if (inputRef.current) {
      const observer = new ResizeObserver(() => {
        calculateHeights();
      });
      observer.observe(inputRef.current);
      return () => observer.disconnect();
    }
    return undefined;
  }, [calculateHeights]);

  useEffect(() => {
    if (inputRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = inputRef.current.scrollTop;
      }
      if (highlightScrollRef.current) {
        highlightScrollRef.current.scrollTop = inputRef.current.scrollTop;
        highlightScrollRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    }
  }, [value, highlightRegex]);

  const handleScroll = () => {
    if (inputRef.current) {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = inputRef.current.scrollTop;
      }
      if (highlightScrollRef.current) {
        highlightScrollRef.current.scrollTop = inputRef.current.scrollTop;
        highlightScrollRef.current.scrollLeft = inputRef.current.scrollLeft;
      }
    }
  };

  const renderHighlightedText = useCallback((text: string, regex: RegExp | null | undefined) => {
    if (!regex || !text) return text;

    try {
      const parts: (string | React.ReactNode)[] = [];
      let lastIndex = 0;
      let match;

      // Ensure global flag is set for consistent exec behavior
      const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
      const re = new RegExp(regex.source, flags);

      while ((match = re.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push(text.substring(lastIndex, match.index));
        }
        parts.push(
          <mark
            key={match.index}
            style={{
              backgroundColor: 'rgba(255, 235, 59, 0.5)',
              borderRadius: '2px',
            }}
          >
            {match[0]}
          </mark>
        );
        lastIndex = re.lastIndex;
        if (match[0].length === 0) re.lastIndex++; // prevent infinite loops
      }

      if (lastIndex < text.length) {
        parts.push(text.substring(lastIndex));
      }

      return parts;
    } catch {
      return text;
    }
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        height: '100%',
        minHeight: 0,
        position: 'relative',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 0,
        bgcolor: (muiTheme) => (error ? muiTheme.palette.error.lighter : 'background.default'),
        ...sx,
      }}
    >
      {/* Hidden Mirror for Exact Height Calculation */}
      <Box
        ref={mirrorRef}
        sx={{
          position: 'absolute',
          visibility: 'hidden',
          top: 0,
          left: 0,
          pt: 2.0625, // Match MUI textarea internal padding
          pb: 2.0625,
          px: 1.75,
          boxSizing: 'border-box',
          ...sharedTextStyles,
          pointerEvents: 'none',
          zIndex: -1,
        }}
      >
        {lines.map((line, i) => (
          <div key={i} style={{ minHeight: '21px' }}>
            {line || '\u200b'}
          </div>
        ))}
      </Box>

      {/* Dynamic Line Numbers Gutter */}
      <Box
        ref={scrollRef}
        sx={{
          pt: 2.0625, // Top padding exactly matching MUI
          pb: 2.0625,
          px: 1,
          minWidth: 40,
          bgcolor: (muiTheme) => (muiTheme.palette.mode === 'dark' ? 'grey.900' : 'grey.100'),
          borderRight: '1px solid',
          borderColor: 'divider',
          color: 'text.disabled',
          textAlign: 'right',
          fontSize: '14px',
          fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
          lineHeight: 1.5,
          overflow: 'hidden', // Gutter scrolling is purely driven by handleScroll
          userSelect: 'none',
          zIndex: 2,
        }}
      >
        {lines.map((_, i) => (
          <Box
            key={i}
            sx={{
              height: lineHeights[i] || 21,
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'flex-end',
            }}
          >
            {i + 1}
          </Box>
        ))}
        {/* Spacer to prevent vertical scroll clamping at the bottom edge */}
        <Box sx={{ height: 250, flexShrink: 0 }} />
      </Box>

      {/* Highlighting Underlay Layer Container */}
      <Box
        ref={highlightScrollRef}
        sx={{
          position: 'absolute',
          top: 0,
          left: 41, // Initial, gets overwritten dynamically
          right: 'auto',
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            width: '100%',
            pt: 2.0625,
            pb: 2.0625,
            px: 1.75, // Match TextField padding exactly
            boxSizing: 'border-box',
            ...sharedTextStyles,
            color: error ? 'error.main' : 'text.primary',
            '& mark': {
              backgroundColor: 'rgba(255, 235, 59, 0.5)',
              color: 'text.primary',
              fontWeight: 'bold',
              borderRadius: '2px',
            },
          }}
        >
          {renderHighlightedText(
            value.replace(/\r/g, '') + (value.endsWith('\n') ? ' ' : ''),
            highlightRegex
          )}
        </Box>
        {/* Spacer to prevent scroll clamping at extreme bottom/right positions */}
        <Box sx={{ height: 250, width: 'calc(100% + 250px)', flexShrink: 0 }} />
      </Box>

      {/* Editor Area */}
      <TextField
        fullWidth
        multiline
        error={error}
        value={value}
        label={label}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        slotProps={{
          input: {
            readOnly,
          },
          htmlInput: {
            ref: inputRef,
            onScroll: handleScroll,
            spellCheck: false,
          },
        }}
        sx={{
          flex: 1,
          height: '100%',
          zIndex: 2,
          '& .MuiInputBase-root': {
            p: 0,
            height: '100%',
            alignItems: 'flex-start',
            borderRadius: 0,
            backgroundColor: 'transparent', // Important for underlay to show
          },
          '& .MuiInputBase-input': {
            pt: '16.5px !important',
            pb: '16.5px !important',
            px: 1.75,
            boxSizing: 'border-box',
            height: '100% !important',
            overflow: 'auto !important',
            ...sharedTextStyles,
            zIndex: 3,
            color: error
              ? theme.palette.mode === 'dark'
                ? 'error.main'
                : 'error.dark'
              : 'transparent',
            caretColor: (muiTheme) => muiTheme.palette.text.primary, // Ensure cursor is visible
            '&::selection': {
              backgroundColor: 'rgba(33, 150, 243, 0.3)',
            },
          },
          '& fieldset': {
            border: 'none',
          },
          '& label': {
            display: value ? 'none' : 'block',
          },
        }}
      />
    </Box>
  );
}
