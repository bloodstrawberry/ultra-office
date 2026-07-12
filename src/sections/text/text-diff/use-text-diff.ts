import { useMemo, useState, useCallback } from 'react';
import { DiffMethod } from 'react-diff-viewer-continued';

import { useTheme } from '@mui/material';

import { useDebounce } from '../use-debounce';

export function useTextDiff() {
  const theme = useTheme();

  const [oldValue, setOldValue] = useState('');
  const [newValue, setNewValue] = useState('');
  const debouncedOldValue = useDebounce(oldValue, 300);
  const debouncedNewValue = useDebounce(newValue, 300);

  const [splitView, setSplitView] = useState(true);
  const [showDiffOnly, setShowDiffOnly] = useState(false);
  const [useDarkTheme, setUseDarkTheme] = useState(theme.palette.mode === 'dark');
  const [disableWordDiff, setDisableWordDiff] = useState(false);
  const [hideLineNumbers, setHideLineNumbers] = useState(false);
  const [highlightLines, setHighlightLines] = useState<string[]>([]);
  const [compareMethod, setCompareMethod] = useState<DiffMethod>(DiffMethod.CHARS);
  const [inputHeight, setInputHeight] = useState(300);

  const handleDrag = useCallback((deltaY: number) => {
    setInputHeight((prev) => Math.max(100, Math.min(800, prev + deltaY)));
  }, []);

  const handleSwap = () => {
    const temp = oldValue;
    setOldValue(newValue);
    setNewValue(temp);
  };

  const handleClear = () => {
    setOldValue('');
    setNewValue('');
    setHighlightLines([]);
  };

  const handleLineNumberClick = (lineId: string) => {
    setHighlightLines((prev) =>
      prev.includes(lineId) ? prev.filter((id) => id !== lineId) : [...prev, lineId]
    );
  };

  const customStyles = useMemo(
    () => ({
      variables: {
        light: {
          diffViewerBackground: theme.palette.background.paper,
          diffViewerColor: theme.palette.text.primary,
          addedBackground: '#e6ffec',
          addedColor: '#24292e',
          removedBackground: '#ffeef0',
          removedColor: '#24292e',
          wordAddedBackground: '#acf2bd',
          wordRemovedBackground: '#fdb8c0',
          addedGutterBackground: '#cdffd8',
          removedGutterBackground: '#ffdce0',
          gutterColor: theme.palette.text.secondary,
          codeFoldGutterBackground: theme.palette.action.hover,
          codeFoldBackground: theme.palette.action.selected,
          emptyLineBackground: theme.palette.action.hover,
          lineNumberColor: theme.palette.text.disabled,
        },
        dark: {
          diffViewerBackground: '#1e1e1e',
          diffViewerColor: '#d4d4d4',
          addedBackground: '#2d4a3e',
          addedColor: '#d4d4d4',
          removedBackground: '#632b30',
          removedColor: '#d4d4d4',
          wordAddedBackground: '#3d614f',
          wordRemovedBackground: '#8a3a41',
          addedGutterBackground: '#1e3a2f',
          removedGutterBackground: '#441d21',
          gutterColor: '#858585',
          codeFoldGutterBackground: '#252526',
          codeFoldBackground: '#333333',
          emptyLineBackground: '#1e1e1e',
          lineNumberColor: '#858585',
        },
      },
      contentText: {
        fontSize: '14px',
        fontFamily: 'SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
      },
      lineNumber: { fontSize: '12px' },
      titleBlock: {
        padding: '8px 12px',
        background: theme.palette.action.hover,
        borderBottom: `1px solid ${theme.palette.divider}`,
        fontWeight: 'bold',
        fontSize: '13px',
      },
    }),
    [theme]
  );

  return {
    oldValue,
    setOldValue,
    newValue,
    setNewValue,
    debouncedOldValue,
    debouncedNewValue,
    splitView,
    setSplitView,
    showDiffOnly,
    setShowDiffOnly,
    useDarkTheme,
    setUseDarkTheme,
    disableWordDiff,
    setDisableWordDiff,
    hideLineNumbers,
    setHideLineNumbers,
    highlightLines,
    setHighlightLines,
    compareMethod,
    setCompareMethod,
    inputHeight,
    handleDrag,
    handleSwap,
    handleClear,
    handleLineNumberClick,
    customStyles,
  };
}
