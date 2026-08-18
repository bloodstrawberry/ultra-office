'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import TransformRoundedIcon from '@mui/icons-material/TransformRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import FindReplaceRoundedIcon from '@mui/icons-material/FindReplaceRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { REGEX_PRESETS } from '../../util/utils/regex-library-utils';
import { LineNumberTextField } from '../../util/components/line-number-text-field';
import { ResizeHandle, TextAreaPanel } from '../../util/components/shared-text-area';
import {
  sortLines,
  trimLines,
  encodeUrl,
  decodeUrl,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toTitleCase,
  detectFormat,
  toPascalCase,
  encodeBase64,
  decodeBase64,
  calculateHash,
  parseJwtToken,
  anonymizeJson,
  toConstantCase,
  deduplicateLines,
  removeEmptyLines,
  convertDataFormat,
  SAMPLE_XML_INVOICE,
  SAMPLE_CSV_EMPLOYEES,
  SAMPLE_JSON_ECOMMERCE,
  SAMPLE_YAML_KUBERNETES,
  type SupportedDataFormat,
} from '../../util/utils/text-transform-utils';

// ----------------------------------------------------------------------

export function TextTransformView() {
  const [currentTab, setCurrentTab] = useState<'format' | 'content' | 'regex'>('format');

  // --------------------------------------------------------------------
  // Tab 1: Format Ext Converter State
  // --------------------------------------------------------------------
  const [formatSourceText, setFormatSourceText] = useState<string>(SAMPLE_JSON_ECOMMERCE);
  const [sourceFormat, setSourceFormat] = useState<SupportedDataFormat | 'auto'>('auto');
  const [targetFormat, setTargetFormat] = useState<SupportedDataFormat>('yaml');
  const [convertedText, setConvertedText] = useState<string>('');
  const [indentSize, setIndentSize] = useState<number>(2);
  const [csvDelimiter, setCsvDelimiter] = useState<',' | '\t' | ';' | '|'>(',');
  const [formatInputHeight, setFormatInputHeight] = useState<number>(360);

  useEffect(() => {
    const result = convertDataFormat(formatSourceText, sourceFormat, targetFormat, {
      jsonIndent: indentSize,
      yamlIndent: indentSize,
      csvDelimiter,
    });
    setConvertedText(result);
  }, [formatSourceText, sourceFormat, targetFormat, indentSize, csvDelimiter]);

  // --------------------------------------------------------------------
  // Tab 2: Content & Security Processor State
  // --------------------------------------------------------------------
  const [contentText, setContentText] = useState<string>(
    'Hello World! Welcome to Ultra Office 2026.'
  );
  const [processedText, setProcessedText] = useState<string>('');
  const [contentInputHeight, setContentInputHeight] = useState<number>(360);

  // --------------------------------------------------------------------
  // Tab 3: Regex Studio State
  // --------------------------------------------------------------------
  const [regexTargetText, setRegexTargetText] = useState<string>(REGEX_PRESETS[0].sampleInput);
  const [regexPattern, setRegexPattern] = useState<string>(REGEX_PRESETS[0].pattern);
  const [activeFlags, setActiveFlags] = useState<string[]>(['g']);
  const [regexMode, setRegexMode] = useState<'extract' | 'replace'>('extract');
  const [replacementPattern, setReplacementPattern] = useState<string>(
    REGEX_PRESETS[0].sampleReplacement || ''
  );
  const [regexResultText, setRegexResultText] = useState<string>('');
  const [regexError, setRegexError] = useState<string>('');
  const [currentCompiledRegex, setCurrentCompiledRegex] = useState<RegExp | null>(null);
  const [showLibraryDrawer, setShowLibraryDrawer] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  // Compute live regex results
  useEffect(() => {
    if (!regexPattern) {
      setRegexError('');
      setRegexResultText('');
      setCurrentCompiledRegex(null);
      return;
    }

    try {
      const flagsStr = activeFlags.join('');
      const rx = new RegExp(regexPattern, flagsStr);
      setCurrentCompiledRegex(rx);
      setRegexError('');

      if (regexMode === 'extract') {
        const matches = Array.from(regexTargetText.matchAll(rx));
        if (matches.length === 0) {
          setRegexResultText('일치하는 항목이 없습니다.');
        } else {
          const list = matches.map((m, idx) => `[매칭 ${idx + 1}] ${m[0]}`);
          setRegexResultText(list.join('\n'));
        }
      } else {
        const replaced = regexTargetText.replace(rx, replacementPattern);
        setRegexResultText(replaced);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setRegexError(msg);
      setCurrentCompiledRegex(null);
      setRegexResultText('');
    }
  }, [regexPattern, activeFlags, regexMode, replacementPattern, regexTargetText]);

  const toggleFlag = (flag: string) => {
    setActiveFlags((prev) =>
      prev.includes(flag) ? prev.filter((f) => f !== flag) : [...prev, flag]
    );
  };

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

  const categories = [
    '전체',
    '연락처/개인정보',
    '웹/네트워크',
    '숫자/금융',
    '텍스트/코드',
    '검증/보안',
  ];
  const filteredPresets =
    selectedCategory === '전체'
      ? REGEX_PRESETS
      : REGEX_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          텍스트 변환 & 정규식 스튜디오 (Text Transform)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          JSON·CSV·XML·YAML 구조 데이터 상호 변환, 텍스트 가공·인코딩, 16+종 정규식 라이브러리
          테스터를 제공합니다.
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label="1. 구조 데이터 변환 (JSON ⇄ CSV ⇄ XML ⇄ YAML)"
          value="format"
          icon={<TransformRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="2. 텍스트 가공 & 보안/인코딩"
          value="content"
          icon={<CodeRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="3. 정규식 테스터 & 치환 (Regex Studio)"
          value="regex"
          icon={<FindReplaceRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 1: FORMAT EXT CONVERTER */}
      {currentTab === 'format' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Preset Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
            >
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
              height: formatInputHeight,
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
                    onChange={(e) =>
                      setSourceFormat(e.target.value as SupportedDataFormat | 'auto')
                    }
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

          <ResizeHandle
            onDrag={(delta) => setFormatInputHeight((h) => Math.max(200, Math.min(700, h + delta)))}
          />
        </Box>
      )}

      {/* TAB 2: CONTENT & ENCODING */}
      {currentTab === 'content' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Action Toolbar Cards */}
          <Card sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
              ⚡ 변환 기능 원클릭 실행
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {/* Case transforms */}
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toCamelCase(contentText))}
              >
                camelCase
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toPascalCase(contentText))}
              >
                PascalCase
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toSnakeCase(contentText))}
              >
                snake_case
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toKebabCase(contentText))}
              >
                kebab-case
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toConstantCase(contentText))}
              >
                CONSTANT_CASE
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setProcessedText(toTitleCase(contentText))}
              >
                Title Case
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {/* Line tools */}
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setProcessedText(sortLines(contentText, 'asc'))}
              >
                가나다 오름차순 정렬
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setProcessedText(deduplicateLines(contentText))}
              >
                중복 줄 제거
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setProcessedText(trimLines(contentText))}
              >
                줄 앞뒤 공백 제거
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="secondary"
                onClick={() => setProcessedText(removeEmptyLines(contentText))}
              >
                빈 줄 제거
              </Button>

              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

              {/* Encoders */}
              <Button
                size="small"
                variant="contained"
                color="info"
                onClick={() => setProcessedText(encodeBase64(contentText))}
              >
                Base64 인코딩
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="info"
                onClick={() => setProcessedText(decodeBase64(contentText))}
              >
                Base64 디코딩
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => setProcessedText(encodeUrl(contentText))}
              >
                URL 인코딩
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={() => setProcessedText(decodeUrl(contentText))}
              >
                URL 디코딩
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => setProcessedText(calculateHash(contentText, 'sha256'))}
              >
                SHA-256 해시
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                onClick={() => setProcessedText(calculateHash(contentText, 'md5'))}
              >
                MD5 해시
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  const jwt = parseJwtToken(contentText);
                  setProcessedText(
                    jwt ? JSON.stringify(jwt, null, 2) : '유효한 JWT 토큰 형식이 아닙니다.'
                  );
                }}
              >
                JWT 디코딩
              </Button>
              <Button
                size="small"
                variant="contained"
                color="error"
                onClick={() => setProcessedText(anonymizeJson(contentText))}
              >
                JSON 민감정보 마스킹
              </Button>
            </Box>
          </Card>

          {/* Editors Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              height: contentInputHeight,
            }}
          >
            <TextAreaPanel
              title="원본 텍스트"
              actions={
                <IconButton size="small" color="error" onClick={() => setContentText('')}>
                  <DeleteSweepRoundedIcon fontSize="small" />
                </IconButton>
              }
            >
              <LineNumberTextField
                value={contentText}
                onChange={setContentText}
                placeholder="가공할 텍스트를 입력하세요..."
              />
            </TextAreaPanel>

            <TextAreaPanel
              title="가공된 결과"
              actions={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton size="small" onClick={() => handleCopy(processedText)}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDownload(processedText, 'txt')}>
                    <DownloadRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <LineNumberTextField
                value={processedText}
                readOnly
                placeholder="가공 결과가 여기에 표시됩니다..."
              />
            </TextAreaPanel>
          </Box>

          <ResizeHandle
            onDrag={(delta) =>
              setContentInputHeight((h) => Math.max(200, Math.min(700, h + delta)))
            }
          />
        </Box>
      )}

      {/* TAB 3: REGEX STUDIO */}
      {currentTab === 'regex' && (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: showLibraryDrawer ? { xs: '1fr', md: '1fr 340px' } : '1fr',
            gap: 2.5,
          }}
        >
          {/* Main Regex Editor Panel */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Pattern & Flags Toolbar */}
            <Card
              sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  size="small"
                  label="정규식 패턴 (RegExp)"
                  placeholder="예: 01[016789]-?\d{3,4}-?\d{4}"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                  error={!!regexError}
                  helperText={regexError}
                  sx={{ flex: 1, minWidth: 260 }}
                />

                {/* Flags Chips */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {[
                    { flag: 'g', label: 'g (전역)' },
                    { flag: 'i', label: 'i (대소문자)' },
                    { flag: 'm', label: 'm (여러줄)' },
                    { flag: 's', label: 's (DotAll)' },
                    { flag: 'u', label: 'u (유니코드)' },
                  ].map(({ flag, label }) => {
                    const isActive = activeFlags.includes(flag);
                    return (
                      <Chip
                        key={flag}
                        label={label}
                        size="small"
                        clickable
                        onClick={() => toggleFlag(flag)}
                        color={isActive ? 'primary' : 'default'}
                        variant={isActive ? 'filled' : 'outlined'}
                        sx={{ fontWeight: 700 }}
                      />
                    );
                  })}
                </Box>

                <Button
                  variant={regexMode === 'replace' ? 'contained' : 'outlined'}
                  color="secondary"
                  size="small"
                  startIcon={<AutoFixHighRoundedIcon />}
                  onClick={() => setRegexMode((m) => (m === 'extract' ? 'replace' : 'extract'))}
                  sx={{ height: 40 }}
                >
                  {regexMode === 'replace' ? '치환 모드' : '추출 모드'}
                </Button>

                <Tooltip title={showLibraryDrawer ? '라이브러리 닫기' : '정규식 라이브러리 열기'}>
                  <IconButton onClick={() => setShowLibraryDrawer((prev) => !prev)}>
                    <MenuBookRoundedIcon color={showLibraryDrawer ? 'primary' : 'inherit'} />
                  </IconButton>
                </Tooltip>
              </Box>

              {regexMode === 'replace' && (
                <TextField
                  fullWidth
                  size="small"
                  label="치환할 패턴 (Replacement)"
                  placeholder="예: $1-****-$2 또는 [MASKED]"
                  value={replacementPattern}
                  onChange={(e) => setReplacementPattern(e.target.value)}
                />
              )}
            </Card>

            {/* Target Text & Result Viewers */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 2,
                height: 380,
              }}
            >
              <TextAreaPanel
                title="대상 텍스트 (실시간 하이라이트)"
                actions={
                  <IconButton size="small" color="error" onClick={() => setRegexTargetText('')}>
                    <DeleteSweepRoundedIcon fontSize="small" />
                  </IconButton>
                }
              >
                <LineNumberTextField
                  value={regexTargetText}
                  onChange={setRegexTargetText}
                  highlightRegex={currentCompiledRegex}
                  placeholder="정규식을 테스트할 텍스트를 입력하세요..."
                />
              </TextAreaPanel>

              <TextAreaPanel
                title={
                  regexMode === 'extract' ? '추출 결과 (Match List)' : '치환 결과 (Replaced Result)'
                }
                actions={
                  <IconButton size="small" onClick={() => handleCopy(regexResultText)}>
                    <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
                }
              >
                <LineNumberTextField
                  value={regexResultText}
                  readOnly
                  placeholder="정규식 실행 결과가 여기에 표시됩니다..."
                />
              </TextAreaPanel>
            </Box>
          </Box>

          {/* Right Library Drawer */}
          {showLibraryDrawer && (
            <Card
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
                maxHeight: 520,
                overflowY: 'auto',
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                📚 16+종 실무 정규식 라이브러리
              </Typography>

              {/* Category Filter */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    onClick={() => setSelectedCategory(cat)}
                    color={selectedCategory === cat ? 'primary' : 'default'}
                    variant={selectedCategory === cat ? 'filled' : 'outlined'}
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Box>

              <Divider sx={{ my: 0.5 }} />

              {/* Presets List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {filteredPresets.map((preset) => (
                  <Card
                    key={preset.id}
                    variant="outlined"
                    sx={{
                      p: 1.2,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { bgcolor: 'action.hover', borderColor: 'primary.main' },
                    }}
                    onClick={() => {
                      setRegexPattern(preset.pattern);
                      setRegexTargetText(preset.sampleInput);
                      if (preset.sampleReplacement) setReplacementPattern(preset.sampleReplacement);
                      toast.info(`${preset.name} 프리셋이 적용되었습니다.`);
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {preset.name}
                      </Typography>
                      <Chip
                        label={preset.category}
                        size="small"
                        sx={{ height: 18, fontSize: '0.65rem' }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}
                    >
                      {preset.description}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: 'monospace',
                        bgcolor: 'background.neutral',
                        p: 0.4,
                        borderRadius: 0.5,
                        display: 'block',
                      }}
                    >
                      /{preset.pattern}/{preset.flags}
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>
          )}
        </Box>
      )}
    </DashboardContent>
  );
}
