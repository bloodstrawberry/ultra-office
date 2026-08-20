'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

declare global {
  interface Window {
    katex?: {
      renderToString: (
        tex: string,
        options?: { displayMode?: boolean; throwOnError?: boolean }
      ) => string;
    };
  }
}

interface LatexPreviewProps {
  latex: string;
  displayMode?: boolean;
  fontSize?: string | number;
  color?: string;
  fallbackText?: string;
}

export function LatexPreview({
  latex,
  displayMode = true,
  fontSize = '1.15rem',
  color,
  fallbackText,
}: LatexPreviewProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [katexLoaded, setKatexLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    // Load KaTeX CSS
    const linkId = 'katex-cdn-css';
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // Load KaTeX JS
    const scriptId = 'katex-cdn-js';
    if (!window.katex && !document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        if (isMounted) setKatexLoaded(true);
      };
      document.head.appendChild(script);
    } else if (window.katex) {
      setKatexLoaded(true);
    }

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!latex || !latex.trim()) {
      setRenderedHtml('');
      return;
    }

    if (window.katex && katexLoaded) {
      try {
        const html = window.katex.renderToString(latex, {
          displayMode,
          throwOnError: false,
        });
        setRenderedHtml(html);
      } catch {
        setRenderedHtml('');
      }
    }
  }, [latex, displayMode, katexLoaded]);

  if (!latex || !latex.trim()) {
    return (
      <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
        {fallbackText || '수식을 입력하면 LaTeX로 렌더링됩니다.'}
      </Typography>
    );
  }

  if (renderedHtml) {
    return (
      <Box
        sx={{
          fontSize,
          color: color || 'text.primary',
          overflowX: 'auto',
          py: 0.5,
          '& .katex-display': { my: 0.5 },
        }}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  // Fallback before KaTeX is loaded or plain expression
  return (
    <Typography
      sx={{
        fontFamily: 'monospace',
        fontSize,
        color: color || 'primary.main',
        fontWeight: 600,
      }}
    >
      {latex}
    </Typography>
  );
}
