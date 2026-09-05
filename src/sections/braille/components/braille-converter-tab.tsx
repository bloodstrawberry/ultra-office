'use client';

import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { ResizablePanel, ResizableHandle, ResizablePanelGroup } from 'src/components/resizable';

import { BrailleTactileCell } from './braille-tactile-cell';
import { textToBraille, brailleCharToDots } from '../utils/braille-core';

// ----------------------------------------------------------------------

const BRAILLE_PRESETS = [
  { label: '훈맹정음 (박두성)', text: '훈맹정음' },
  { label: '사랑합니다', text: '사랑합니다' },
  { label: '안녕하세요', text: '안녕하세요' },
  { label: '숫자 12345', text: '12345' },
  { label: 'Ultra Office', text: 'Ultra Office' },
  { label: '긴급 출구 (비상구)', text: '비상구' },
];

export function BrailleConverterTab() {
  const [inputText, setInputText] = useState('훈맹정음');
  const [brailleOutput, setBrailleOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [cellSize, setCellSize] = useState<'small' | 'medium' | 'large'>('medium');

  useEffect(() => {
    setBrailleOutput(textToBraille(inputText));
  }, [inputText]);

  const handleCopy = () => {
    if (!brailleOutput) return;
    navigator.clipboard.writeText(brailleOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const brailleChars = Array.from(brailleOutput);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 auto', minHeight: 0 }}>
      {/* Quick Presets Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          빠른 예시:
        </Typography>
        {BRAILLE_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            label={preset.label}
            size="small"
            variant="outlined"
            onClick={() => setInputText(preset.text)}
            sx={{ fontWeight: 600, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
          />
        ))}
      </Box>

      {/* Dual Inputs Resizable Panels */}
      <ResizablePanelGroup
        orientation="horizontal"
        autoSaveId="braille-converter-split"
        sx={{ flex: '1 1 0px', minHeight: 0 }}
      >
        {/* Input Card */}
        <ResizablePanel id="braille-input" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              flex: '1 1 auto',
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                📝 원본 텍스트 (한국어 / 영문 / 숫자)
              </Typography>
              <IconButton size="small" onClick={() => setInputText('')} disabled={!inputText}>
                <ClearRoundedIcon fontSize="small" />
              </IconButton>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="점자로 변환할 한국어(한글), 영어, 숫자, 문장부호를 입력하세요."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': { height: '100%', alignItems: 'flex-start' },
              }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              {inputText.length} 글자
            </Typography>
          </Card>
        </ResizablePanel>

        {/* Resizable Divider Handle */}
        <ResizableHandle direction="horizontal" tooltipText="좌우 너비 조절" />

        {/* Output Card */}
        <ResizablePanel id="braille-output" defaultSize={50} minSize={25}>
          <Card
            sx={{
              p: 2,
              borderRadius: 2,
              flex: '1 1 auto',
              height: '100%',
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  ⠠⠨⠃ 유니코드 점자 텍스트
                </Typography>
                <Chip
                  label="Unicode 6-Dot"
                  size="small"
                  color="primary"
                  variant="soft"
                  sx={{ height: 22 }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="soft"
                  color={copied ? 'success' : 'inherit'}
                  startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                  onClick={handleCopy}
                  disabled={!brailleOutput}
                >
                  {copied ? '복사됨' : '복사'}
                </Button>
                <Button
                  size="small"
                  variant="soft"
                  color="primary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={handlePrint}
                  disabled={!brailleOutput}
                >
                  인쇄
                </Button>
              </Box>
            </Box>

            <TextField
              fullWidth
              multiline
              minRows={2}
              value={brailleOutput}
              slotProps={{ input: { readOnly: true } }}
              placeholder="변환된 점자가 유니코드로 표시됩니다."
              variant="outlined"
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  height: '100%',
                  alignItems: 'flex-start',
                  bgcolor: 'background.paper',
                  fontSize: '1.35rem',
                  letterSpacing: '3px',
                  lineHeight: 1.8,
                },
              }}
            />

            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
              점자 셀 수: {brailleChars.length} 셀
            </Typography>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup>

      {/* 3D Tactile Embossed Board Card */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          flex: '1 1 0px',
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1,
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TouchAppRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              3D 엠보싱 촉각 점자 보드 (Tactile Visualization)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
              크기:
            </Typography>
            <Button
              size="small"
              variant={cellSize === 'small' ? 'contained' : 'outlined'}
              onClick={() => setCellSize('small')}
              sx={{ minWidth: 44, py: 0.2 }}
            >
              작게
            </Button>
            <Button
              size="small"
              variant={cellSize === 'medium' ? 'contained' : 'outlined'}
              onClick={() => setCellSize('medium')}
              sx={{ minWidth: 44, py: 0.2 }}
            >
              중간
            </Button>
            <Button
              size="small"
              variant={cellSize === 'large' ? 'contained' : 'outlined'}
              onClick={() => setCellSize('large')}
              sx={{ minWidth: 44, py: 0.2 }}
            >
              크게
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'background.neutral',
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexWrap: 'wrap',
            gap: cellSize === 'large' ? 2 : 1.2,
            alignItems: 'flex-start',
            alignContent: 'flex-start',
            overflowY: 'auto',
          }}
        >
          {brailleChars.map((ch, idx) => {
            if (ch === ' ') {
              return (
                <Box
                  key={`space-${idx}`}
                  sx={{
                    width: cellSize === 'small' ? 20 : cellSize === 'large' ? 40 : 28,
                    height: 20,
                  }}
                />
              );
            }
            if (ch === '\n') {
              return <Box key={`nl-${idx}`} sx={{ width: '100%', height: 12 }} />;
            }

            const dots = brailleCharToDots(ch);
            const label = dots.length > 0 ? dots.join('') : '';

            return (
              <Tooltip key={`cell-${idx}`} title={`점 번호: [${dots.join(', ')}]`}>
                <Box>
                  <BrailleTactileCell char={ch} label={label} size={cellSize} />
                </Box>
              </Tooltip>
            );
          })}

          {brailleChars.length === 0 && (
            <Typography variant="body2" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
              입력된 글자가 없습니다. 위 텍스트 창에 내용을 입력해보세요.
            </Typography>
          )}
        </Box>
      </Card>
    </Box>
  );
}
