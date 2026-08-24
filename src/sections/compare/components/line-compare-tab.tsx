'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';

import { TextAreaPanel } from '../../util/components/shared-text-area';
import { type LinePreset, LINE_COMPARE_PRESETS } from '../data/compare-presets';
import { LineNumberTextField } from '../../util/components/line-number-text-field';

// ----------------------------------------------------------------------

export function LineCompareTab() {
  const [lineTextA, setLineTextA] = useState<string>(LINE_COMPARE_PRESETS[0].listA);
  const [lineTextB, setLineTextB] = useState<string>(LINE_COMPARE_PRESETS[0].listB);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [dedup, setDedup] = useState<boolean>(true);

  const [onlyA, setOnlyA] = useState<string[]>([]);
  const [onlyB, setOnlyB] = useState<string[]>([]);
  const [commonAB, setCommonAB] = useState<string[]>([]);

  const runLineComparison = (aStr: string, bStr: string) => {
    const processLines = (raw: string): string[] => {
      let lines = raw.split('\n');
      if (trimLines) lines = lines.map((l) => l.trim());
      lines = lines.filter((l) => l.length > 0);
      if (ignoreCase) lines = lines.map((l) => l.toLowerCase());
      if (dedup) lines = Array.from(new Set(lines));
      return lines;
    };

    const linesA = processLines(aStr);
    const linesB = processLines(bStr);

    const setB = new Set(linesB);
    const setA = new Set(linesA);

    setOnlyA(linesA.filter((x) => !setB.has(x)));
    setOnlyB(linesB.filter((x) => !setA.has(x)));
    setCommonAB(linesA.filter((x) => setB.has(x)));
  };

  useEffect(() => {
    runLineComparison(lineTextA, lineTextB);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineTextA, lineTextB, trimLines, ignoreCase, dedup]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleApplyPreset = (preset: LinePreset) => {
    setLineTextA(preset.listA);
    setLineTextB(preset.listB);
    toast.info(`${preset.name} 예제가 로드되었습니다.`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Preset Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          ⚡ 예제 프리셋:
        </Typography>
        {LINE_COMPARE_PRESETS.map((preset, i) => (
          <Chip
            key={i}
            label={preset.name}
            size="small"
            onClick={() => handleApplyPreset(preset)}
            clickable
            color="secondary"
            variant="outlined"
            sx={{ borderRadius: 1.5, fontWeight: 600 }}
          />
        ))}
      </Box>

      {/* Options */}
      <Card
        sx={{
          p: 1.5,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          flexWrap: 'wrap',
        }}
      >
        <FormControlLabel
          control={
            <Switch
              checked={trimLines}
              onChange={(e) => setTrimLines(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              공백 자동 제거 (Trim)
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              대소문자 구분 안함
            </Typography>
          }
        />
        <FormControlLabel
          control={
            <Switch checked={dedup} onChange={(e) => setDedup(e.target.checked)} size="small" />
          }
          label={
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              중복 항목 자동 제거
            </Typography>
          }
        />
      </Card>

      {/* Input Lists Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          height: 260,
        }}
      >
        <TextAreaPanel title="A 목록 입력">
          <LineNumberTextField
            value={lineTextA}
            onChange={setLineTextA}
            placeholder="줄 단위로 A 목록 항목을 입력하세요..."
          />
        </TextAreaPanel>
        <TextAreaPanel title="B 목록 입력">
          <LineNumberTextField
            value={lineTextB}
            onChange={setLineTextB}
            placeholder="줄 단위로 B 목록 항목을 입력하세요..."
          />
        </TextAreaPanel>
      </Box>

      {/* 3-Column Results (Only A, Common, Only B) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2,
        }}
      >
        {/* Only A */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'error.lighter',
            border: '1px solid',
            borderColor: 'error.light',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'error.dark' }}>
              A에만 있는 항목 ({onlyA.length}건)
            </Typography>
            <IconButton size="small" onClick={() => handleCopy(onlyA.join('\n'))}>
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              maxHeight: 240,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {onlyA.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  flexShrink: 0,
                  p: 0.8,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {item}
              </Box>
            ))}
            {onlyA.length === 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                해당 항목 없음
              </Typography>
            )}
          </Box>
        </Card>

        {/* Common AB */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'info.lighter',
            border: '1px solid',
            borderColor: 'info.light',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'info.dark' }}>
              A & B 공통 항목 (교집합 {commonAB.length}건)
            </Typography>
            <IconButton size="small" onClick={() => handleCopy(commonAB.join('\n'))}>
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              maxHeight: 240,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {commonAB.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  flexShrink: 0,
                  p: 0.8,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {item}
              </Box>
            ))}
            {commonAB.length === 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                해당 항목 없음
              </Typography>
            )}
          </Box>
        </Card>

        {/* Only B */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: 'success.lighter',
            border: '1px solid',
            borderColor: 'success.light',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'success.dark' }}>
              B에만 있는 항목 ({onlyB.length}건)
            </Typography>
            <IconButton size="small" onClick={() => handleCopy(onlyB.join('\n'))}>
              <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              maxHeight: 240,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {onlyB.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  flexShrink: 0,
                  p: 0.8,
                  borderRadius: 1,
                  bgcolor: 'background.paper',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {item}
              </Box>
            ))}
            {onlyB.length === 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                해당 항목 없음
              </Typography>
            )}
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
