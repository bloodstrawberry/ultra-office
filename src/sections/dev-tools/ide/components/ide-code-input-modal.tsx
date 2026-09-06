'use client';

import type { IdeFile } from '../types';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import { getMonacoLanguage, SUPPORTED_LANGUAGES } from '../data/ide-languages';

interface IdeCodeInputModalProps {
  open: boolean;
  activeFile: IdeFile;
  onClose: () => void;
  onSaveAndPlay: (fileName: string, language: string, content: string) => void;
  onSaveOnly: (fileName: string, language: string, content: string) => void;
}

export function IdeCodeInputModal({
  open,
  activeFile,
  onClose,
  onSaveAndPlay,
  onSaveOnly,
}: IdeCodeInputModalProps) {
  const [fileName, setFileName] = useState(activeFile.name);
  const [language, setLanguage] = useState(activeFile.language);
  const [content, setContent] = useState(activeFile.content);

  useEffect(() => {
    if (open) {
      setFileName(activeFile.name);
      setLanguage(activeFile.language);
      setContent(activeFile.content);
    }
  }, [open, activeFile]);

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFileName(val);
    setLanguage(getMonacoLanguage(val));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          bgcolor: '#1e1e1e',
          color: '#ffffff',
          borderRadius: 2,
          border: '1px solid #3c3c3c',
          boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.8,
          borderBottom: '1px solid #2d2d2d',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CodeRoundedIcon sx={{ color: '#007acc' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            소스코드 설정 & 붙여넣기
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: '#858585' }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* File Name and Language selector */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            label="파일명 (확장자 포함)"
            value={fileName}
            onChange={handleFileNameChange}
            fullWidth
            size="small"
            sx={{
              '& .MuiInputBase-input': { color: '#ffffff' },
              '& .MuiInputLabel-root': { color: '#aaaaaa' },
              '& .MuiOutlinedInput-root': {
                bgcolor: '#252526',
                '& fieldset': { borderColor: '#3c3c3c' },
                '&:hover fieldset': { borderColor: '#007acc' },
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel sx={{ color: '#aaaaaa' }}>언어 구문강조</InputLabel>
            <Select
              value={language}
              label="언어 구문강조"
              onChange={(e) => setLanguage(e.target.value)}
              sx={{
                color: '#ffffff',
                bgcolor: '#252526',
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#3c3c3c' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
                '& .MuiSvgIcon-root': { color: '#aaaaaa' },
              }}
              MenuProps={{
                sx: {
                  '& .MuiPaper-root': {
                    bgcolor: '#1e1e1e',
                    color: '#ffffff',
                    maxHeight: 320,
                    border: '1px solid #3c3c3c',
                  },
                },
              }}
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <MenuItem key={lang.id} value={lang.monacoLang}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: lang.color,
                        flexShrink: 0,
                      }}
                    />
                    <Typography sx={{ fontSize: '0.8125rem' }}>{lang.name}</Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Source Code Multiline Textarea */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: '#aaaaaa' }}>
              타이핑 효과로 출력할 전체 소스코드를 입력하거나 붙여넣으세요:
            </Typography>
            <Typography variant="caption" sx={{ color: '#007acc', fontWeight: 600 }}>
              {content.length.toLocaleString()} 글자 ({content.split('\n').length} 줄)
            </Typography>
          </Box>
          <TextField
            multiline
            rows={14}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="여기에 소스코드를 입력하세요..."
            fullWidth
            sx={{
              '& .MuiInputBase-root': {
                bgcolor: '#141414',
                fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                fontSize: '0.8125rem',
                lineHeight: 1.5,
              },
              '& .MuiInputBase-input': {
                color: '#e0e0e0',
                '&::-webkit-scrollbar': { width: 8 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#333333', borderRadius: 4 },
              },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333333' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#007acc' },
            }}
          />
        </Box>
      </Box>

      {/* Footer Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.8,
          borderTop: '1px solid #2d2d2d',
          bgcolor: '#181818',
        }}
      >
        <Button onClick={onClose} sx={{ color: '#858585' }}>
          취소
        </Button>

        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={() => onSaveOnly(fileName, language, content)}
            startIcon={<CheckRoundedIcon />}
            sx={{
              borderColor: '#3c3c3c',
              color: '#cccccc',
              '&:hover': { borderColor: '#858585', bgcolor: 'rgba(255,255,255,0.05)' },
            }}
          >
            저장만 하기
          </Button>

          <Button
            variant="contained"
            onClick={() => onSaveAndPlay(fileName, language, content)}
            startIcon={<PlayArrowRoundedIcon />}
            sx={{
              bgcolor: '#007acc',
              color: '#ffffff',
              fontWeight: 700,
              '&:hover': { bgcolor: '#0062a3' },
            }}
          >
            저장 후 타이핑 재생 시작
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
