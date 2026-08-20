'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { TextAreaPanel } from '../../util/components/shared-text-area';
import { LineNumberTextField } from '../../util/components/line-number-text-field';
import {
  detectFormat,
  convertDataFormat,
  SAMPLE_XML_INVOICE,
  SAMPLE_CSV_EMPLOYEES,
  SAMPLE_JSON_ECOMMERCE,
  SAMPLE_YAML_KUBERNETES,
  type SupportedDataFormat,
} from '../../util/utils/text-transform-utils';

// ----------------------------------------------------------------------

export function FormatConvertTab() {
  const [formatSourceText, setFormatSourceText] = useState<string>(SAMPLE_JSON_ECOMMERCE);
  const [sourceFormat, setSourceFormat] = useState<SupportedDataFormat | 'auto'>('auto');
  const [targetFormat, setTargetFormat] = useState<SupportedDataFormat>('yaml');
  const [convertedText, setConvertedText] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | '\t' | ';' | '|'>(',');

  useEffect(() => {
    const result = convertDataFormat(formatSourceText, sourceFormat, targetFormat, {
      jsonIndent: indentSize,
      yamlIndent: indentSize,
      csvDelimiter,
    });
    setConvertedText(result);
  }, [formatSourceText, sourceFormat, targetFormat, indentSize, csvDelimiter]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      toast.success('클립보드에 복사되었습니다.');
    } catch {
      toast.error('복사에 실패했습니다.');
    }
  };

  const handleDownload = (text: string, ext: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformed_result.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        flex: '1 1 auto',
        minHeight: 0,
        height: '100%',
      }}
    >
      {/* Preset Buttons */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}>
          ⚡ 예제 프리셋:
        </Typography>
        <Chip
          label="E-Commerce 주문 JSON"
          size="small"
          onClick={() => {
            setFormatSourceText(SAMPLE_JSON_ECOMMERCE);
            setSourceFormat('json');
            setTargetFormat('yaml');
            toast.info('E-Commerce 주문 JSON이 로드되었습니다.');
          }}
          clickable
          color="primary"
          variant="outlined"
        />
        <Chip
          label="사원 명부 CSV"
          size="small"
          onClick={() => {
            setFormatSourceText(SAMPLE_CSV_EMPLOYEES);
            setSourceFormat('csv');
            setTargetFormat('json');
            toast.info('사원 명부 CSV가 로드되었습니다.');
          }}
          clickable
          color="secondary"
          variant="outlined"
        />
        <Chip
          label="Kubernetes YAML 배포설정"
          size="small"
          onClick={() => {
            setFormatSourceText(SAMPLE_YAML_KUBERNETES);
            setSourceFormat('yaml');
            setTargetFormat('json');
            toast.info('Kubernetes YAML이 로드되었습니다.');
          }}
          clickable
          color="info"
          variant="outlined"
        />
        <Chip
          label="전자세금계산서 XML"
          size="small"
          onClick={() => {
            setFormatSourceText(SAMPLE_XML_INVOICE);
            setSourceFormat('xml');
            setTargetFormat('json');
            toast.info('전자세금계산서 XML이 로드되었습니다.');
          }}
          clickable
          color="success"
          variant="outlined"
        />
      </Box>

      {/* Editors Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 2,
          flex: '1 1 auto',
          minHeight: 0,
          height: '100%',
        }}
      >
        <TextAreaPanel
          title="원본 데이터"
          headerContent={
            <FormControl size="small" sx={{ width: 140 }}>
              <InputLabel>원본 포맷</InputLabel>
              <Select
                value={sourceFormat}
                label="원본 포맷"
                onChange={(e) => setSourceFormat(e.target.value as SupportedDataFormat | 'auto')}
              >
                <MenuItem value="auto">자동 감지 (Auto)</MenuItem>
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="yaml">YAML</MenuItem>
              </Select>
            </FormControl>
          }
          actions={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="클립보드 복사">
                <IconButton size="small" onClick={() => handleCopy(formatSourceText)}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="스왑">
                <IconButton
                  size="small"
                  onClick={() => {
                    const temp = formatSourceText;
                    setFormatSourceText(convertedText);
                    setConvertedText(temp);
                    const tempFmt =
                      sourceFormat === 'auto' ? detectFormat(formatSourceText) : sourceFormat;
                    setSourceFormat(targetFormat);
                    setTargetFormat(tempFmt);
                  }}
                >
                  <SwapHorizRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="지우기">
                <IconButton size="small" color="error" onClick={() => setFormatSourceText('')}>
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <LineNumberTextField
            value={formatSourceText}
            onChange={setFormatSourceText}
            placeholder="변환할 원본 JSON, CSV, XML, YAML 데이터를 입력하세요..."
          />
        </TextAreaPanel>

        <TextAreaPanel
          title="변환된 결과"
          headerContent={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <FormControl size="small" sx={{ width: 140 }}>
                <InputLabel>목표 포맷</InputLabel>
                <Select
                  value={targetFormat}
                  label="목표 포맷"
                  onChange={(e) => setTargetFormat(e.target.value as SupportedDataFormat)}
                >
                  <MenuItem value="json">JSON</MenuItem>
                  <MenuItem value="csv">CSV</MenuItem>
                  <MenuItem value="xml">XML</MenuItem>
                  <MenuItem value="yaml">YAML</MenuItem>
                </Select>
              </FormControl>

              {(targetFormat === 'json' || targetFormat === 'yaml') && (
                <FormControl size="small" sx={{ width: 110 }}>
                  <InputLabel>들여쓰기</InputLabel>
                  <Select
                    value={indentSize}
                    label="들여쓰기"
                    onChange={(e) => setIndentSize(Number(e.target.value))}
                  >
                    <MenuItem value={2}>2칸 공백</MenuItem>
                    <MenuItem value={4}>4칸 공백</MenuItem>
                  </Select>
                </FormControl>
              )}

              {targetFormat === 'csv' && (
                <FormControl size="small" sx={{ width: 110 }}>
                  <InputLabel>구분자</InputLabel>
                  <Select
                    value={csvDelimiter}
                    label="구분자"
                    onChange={(e) => setCsvDelimiter(e.target.value as ',' | '\t' | ';' | '|')}
                  >
                    <MenuItem value=",">콤마 (,)</MenuItem>
                    <MenuItem value="\t">탭 (Tab)</MenuItem>
                    <MenuItem value=";">세미콜론 (;)</MenuItem>
                    <MenuItem value="|">파이프 (|)</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          }
          actions={
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Tooltip title="클립보드 복사">
                <IconButton size="small" onClick={() => handleCopy(convertedText)}>
                  <ContentCopyRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="파일 다운로드">
                <IconButton
                  size="small"
                  onClick={() => handleDownload(convertedText, targetFormat)}
                >
                  <DownloadRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          }
        >
          <LineNumberTextField
            value={convertedText}
            readOnly
            error={convertedText.startsWith('변환 실패')}
            placeholder="변환된 결과가 여기에 표시됩니다..."
          />
        </TextAreaPanel>
      </Box>
    </Box>
  );
}
