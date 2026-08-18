'use client';

import React, { useRef, useEffect } from 'react';

import Box from '@mui/material/Box';

interface LineNumberTextFieldProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  error?: boolean;
  highlightRegex?: RegExp | null;
  style?: React.CSSProperties;
}

export function LineNumberTextField({
  value,
  onChange,
  placeholder,
  readOnly = false,
  error = false,
  highlightRegex = null,
  style,
}: LineNumberTextFieldProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  const lines = value ? value.split('\n') : [''];
  const lineCount = Math.max(1, lines.length);

  const handleScroll = () => {
    if (!textareaRef.current) return;
    const { scrollTop, scrollLeft } = textareaRef.current;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = scrollTop;
    }
    if (backdropRef.current) {
      backdropRef.current.scrollTop = scrollTop;
      backdropRef.current.scrollLeft = scrollLeft;
    }
  };

  useEffect(() => {
    handleScroll();
  }, [value]);

  const renderHighlights = () => {
    if (!highlightRegex || !value) {
      return null;
    }

    try {
      const parts: React.ReactNode[] = [];
      let lastIndex = 0;
      let match: RegExpExecArray | null;

      // Copy regex to guarantee global flag
      const flags = highlightRegex.flags.includes('g')
        ? highlightRegex.flags
        : `${highlightRegex.flags}g`;
      const globalRegex = new RegExp(highlightRegex.source, flags);

      let keyIdx = 0;
      while ((match = globalRegex.exec(value)) !== null) {
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;

        if (matchStart > lastIndex) {
          parts.push(value.slice(lastIndex, matchStart));
        }

        parts.push(
          <mark
            key={keyIdx++}
            style={{
              backgroundColor: 'rgba(234, 179, 8, 0.45)',
              color: 'inherit',
              borderRadius: 3,
              padding: '1px 0',
            }}
          >
            {match[0]}
          </mark>
        );

        lastIndex = matchEnd;
        if (match[0].length === 0) {
          globalRegex.lastIndex += 1;
        }
      }

      if (lastIndex < value.length) {
        parts.push(value.slice(lastIndex));
      }

      return parts;
    } catch {
      return value;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        height: '100%',
        minHeight: 180,
        position: 'relative',
        bgcolor: error ? 'error.lighter' : 'background.paper',
        borderRadius: 1.5,
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        overflow: 'hidden',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
        lineHeight: 1.5,
        ...style,
      }}
    >
      {/* Line Numbers Gutter */}
      <Box
        ref={lineNumbersRef}
        sx={{
          width: 44,
          flexShrink: 0,
          bgcolor: 'action.hover',
          color: 'text.secondary',
          textAlign: 'right',
          pr: 1,
          py: 1,
          userSelect: 'none',
          overflow: 'hidden',
          borderRight: '1px solid',
          borderColor: 'divider',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
        }}
      >
        {Array.from({ length: lineCount }, (_, i) => (
          <Box key={i} sx={{ height: 21, color: 'text.disabled' }}>
            {i + 1}
          </Box>
        ))}
      </Box>

      {/* Editor & Highlight Container */}
      <Box sx={{ position: 'relative', flex: 1, height: '100%', overflow: 'hidden' }}>
        {/* Backdrop for Regex Highlight */}
        {highlightRegex && (
          <Box
            ref={backdropRef}
            sx={{
              position: 'absolute',
              inset: 0,
              p: 1,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              lineHeight: 'inherit',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              overflow: 'hidden',
              pointerEvents: 'none',
              color: 'transparent',
            }}
          >
            {renderHighlights()}
          </Box>
        )}

        {/* Real TextArea */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          onScroll={handleScroll}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            padding: 8,
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            color: 'inherit',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
          }}
        />
      </Box>
    </Box>
  );
}
