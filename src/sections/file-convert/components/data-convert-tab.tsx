'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import SchemaRoundedIcon from '@mui/icons-material/SchemaRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import TextFieldsRoundedIcon from '@mui/icons-material/TextFieldsRounded';
import DataObjectRoundedIcon from '@mui/icons-material/DataObjectRounded';

import {
  type DataFormat,
  convertDataFormat,
  generateSqlFromData,
  decodeBase64ToString,
  encodeStringToBase64,
  generateTypeScriptInterface,
} from '../utils/data-format-utils';

// ----------------------------------------------------------------------

export function DataConvertTab() {
  const [dataSubTool, setDataSubTool] = useState<'4way' | 'ts' | 'sql' | 'base64'>('4way');
  const [dataFromFormat, setDataFromFormat] = useState<DataFormat>('json');
  const [dataToFormat, setDataToFormat] = useState<DataFormat>('yaml');
  const [dataInputText, setDataInputText] = useState<string>(
    JSON.stringify(
      [
        {
          id: 1,
          name: '홍길동',
          email: 'hong@ultraoffice.com',
          role: 'Admin',
          isActive: true,
          dept: { name: '플랫폼개발팀', floor: 7 },
        },
        {
          id: 2,
          name: '김영희',
          email: 'kim@ultraoffice.com',
          role: 'Designer',
          isActive: true,
          dept: { name: 'UX디자인실', floor: 6 },
        },
      ],
      null,
      2
    )
  );
  const [dataOutputText, setDataOutputText] = useState<string>('');

  // TS & SQL
  const [tsResult, setTsResult] = useState<string>('');
  const [sqlResult, setSqlResult] = useState<{ createTable: string; insertQueries: string }>({
    createTable: '',
    insertQueries: '',
  });

  // Base64
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64Input, setBase64Input] = useState<string>('Ultra Office All-in-one Data Converter');
  const [base64Output, setBase64Output] = useState<string>('');

  const copyToClipboard = (text: string, label = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleConvert4Way = () => {
    try {
      const out = convertDataFormat(dataInputText, dataFromFormat, dataToFormat);
      setDataOutputText(out);
      toast.success(`${dataFromFormat.toUpperCase()} ➔ ${dataToFormat.toUpperCase()} 변환 완료`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`변환 오류: ${msg}`);
    }
  };

  const handleGenerateTsAndSql = () => {
    try {
      const tsCode = generateTypeScriptInterface(dataInputText, 'UserProfile');
      setTsResult(tsCode);
      const sqlCode = generateSqlFromData(dataInputText, 'users');
      setSqlResult(sqlCode);
      toast.success('TypeScript 인터페이스 및 SQL 쿼리가 생성되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`생성 실패: ${msg}`);
    }
  };

  const handleBase64Process = () => {
    try {
      if (base64Mode === 'encode') {
        const encoded = encodeStringToBase64(base64Input);
        setBase64Output(encoded);
      } else {
        const decoded = decodeBase64ToString(base64Input);
        setBase64Output(decoded);
      }
      toast.success('Base64 변환 완료');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Base64 처리 오류: ${msg}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={dataSubTool === '4way' ? 'contained' : 'outlined'}
          startIcon={<SchemaRoundedIcon />}
          onClick={() => setDataSubTool('4way')}
        >
          JSON ⇄ YAML ⇄ XML ⇄ CSV 상호 변환
        </Button>
        <Button
          variant={dataSubTool === 'ts' ? 'contained' : 'outlined'}
          startIcon={<DataObjectRoundedIcon />}
          onClick={() => {
            setDataSubTool('ts');
            handleGenerateTsAndSql();
          }}
        >
          JSON ➔ TypeScript (.ts) Interface
        </Button>
        <Button
          variant={dataSubTool === 'sql' ? 'contained' : 'outlined'}
          startIcon={<TableViewRoundedIcon />}
          onClick={() => {
            setDataSubTool('sql');
            handleGenerateTsAndSql();
          }}
        >
          JSON ➔ SQL (DDL / DML)
        </Button>
        <Button
          variant={dataSubTool === 'base64' ? 'contained' : 'outlined'}
          startIcon={<TextFieldsRoundedIcon />}
          onClick={() => setDataSubTool('base64')}
        >
          Base64 인코딩 / 디코딩
        </Button>
      </Box>

      {/* 4-Way Converter */}
      {dataSubTool === '4way' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            JSON, YAML, XML, CSV 간 자유로운 4-Way 데이터 변환
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>입력 포맷 (From)</InputLabel>
              <Select
                value={dataFromFormat}
                label="입력 포맷 (From)"
                onChange={(e) => setDataFromFormat(e.target.value as DataFormat)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="yaml">YAML</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body1" sx={{ fontWeight: 800 }}>
              ➔
            </Typography>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>출력 포맷 (To)</InputLabel>
              <Select
                value={dataToFormat}
                label="출력 포맷 (To)"
                onChange={(e) => setDataToFormat(e.target.value as DataFormat)}
              >
                <MenuItem value="json">JSON</MenuItem>
                <MenuItem value="yaml">YAML</MenuItem>
                <MenuItem value="xml">XML</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={handleConvert4Way}>
              포맷 변환 실행
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                입력 ({dataFromFormat.toUpperCase()})
              </Typography>
              <textarea
                value={dataInputText}
                onChange={(e) => setDataInputText(e.target.value)}
                rows={14}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  변환 결과 ({dataToFormat.toUpperCase()})
                </Typography>
                {dataOutputText && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      onClick={() => copyToClipboard(dataOutputText, '변환 결과가 복사되었습니다.')}
                    >
                      복사
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => {
                        const mime =
                          dataToFormat === 'json'
                            ? 'application/json'
                            : dataToFormat === 'xml'
                              ? 'application/xml'
                              : 'text/plain';
                        const blob = new Blob([dataOutputText], {
                          type: `${mime};charset=utf-8`,
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `converted_data.${dataToFormat}`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('파일이 다운로드되었습니다.');
                      }}
                    >
                      다운로드
                    </Button>
                  </Box>
                )}
              </Box>
              <textarea
                readOnly
                value={dataOutputText}
                rows={14}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'action.hover',
                  color: 'inherit',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              />
            </Box>
          </Box>
        </Card>
      )}

      {/* TypeScript Generator */}
      {dataSubTool === 'ts' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            JSON 데이터 ➔ TypeScript Interface / Type 선언 코드 자동 생성
          </Typography>
          <Button
            variant="contained"
            onClick={handleGenerateTsAndSql}
            sx={{ alignSelf: 'flex-start' }}
          >
            타입스크립트 인터페이스 재추출
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              생성된 TypeScript 코드 (.ts)
            </Typography>
            {tsResult && (
              <Button
                size="small"
                onClick={() => copyToClipboard(tsResult, 'TS 코드가 복사되었습니다.')}
              >
                코드 복사
              </Button>
            )}
          </Box>
          <textarea
            readOnly
            value={tsResult}
            rows={14}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 6,
              backgroundColor: '#090d16',
              color: '#67e8f9',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          />
        </Card>
      )}

      {/* SQL Generator */}
      {dataSubTool === 'sql' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            JSON 데이터 ➔ SQL DDL (CREATE TABLE) 및 DML (INSERT INTO) 생성
          </Typography>
          <Button
            variant="contained"
            onClick={handleGenerateTsAndSql}
            sx={{ alignSelf: 'flex-start' }}
          >
            SQL 쿼리 재추출
          </Button>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                1. CREATE TABLE (테이블 정의 DDL)
              </Typography>
              {sqlResult.createTable && (
                <Button
                  size="small"
                  onClick={() => copyToClipboard(sqlResult.createTable, 'DDL이 복사되었습니다.')}
                >
                  복사
                </Button>
              )}
            </Box>
            <textarea
              readOnly
              value={sqlResult.createTable}
              rows={6}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                backgroundColor: '#090d16',
                color: '#a5b4fc',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                2. INSERT INTO (데이터 삽입 DML)
              </Typography>
              {sqlResult.insertQueries && (
                <Button
                  size="small"
                  onClick={() => copyToClipboard(sqlResult.insertQueries, 'DML이 복사되었습니다.')}
                >
                  복사
                </Button>
              )}
            </Box>
            <textarea
              readOnly
              value={sqlResult.insertQueries}
              rows={8}
              style={{
                width: '100%',
                padding: 10,
                borderRadius: 6,
                backgroundColor: '#090d16',
                color: '#86efac',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            />
          </Box>
        </Card>
      )}

      {/* Base64 Converter */}
      {dataSubTool === 'base64' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Base64 텍스트 / 데이터 인코딩 & 디코딩
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <ToggleButtonGroup
              value={base64Mode}
              exclusive
              onChange={(_, v) => {
                if (v) setBase64Mode(v);
              }}
              size="small"
            >
              <ToggleButton value="encode">인코딩 (Text ➔ Base64)</ToggleButton>
              <ToggleButton value="decode">디코딩 (Base64 ➔ Text)</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="contained" onClick={handleBase64Process}>
              실행
            </Button>
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700 }}>
                입력 ({base64Mode === 'encode' ? '일반 텍스트' : 'Base64 문자열'})
              </Typography>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                rows={8}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  fontFamily: 'monospace',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  출력 ({base64Mode === 'encode' ? 'Base64 결과' : '디코딩된 텍스트'})
                </Typography>
                {base64Output && (
                  <Button
                    size="small"
                    onClick={() => copyToClipboard(base64Output, '결과가 복사되었습니다.')}
                  >
                    복사
                  </Button>
                )}
              </Box>
              <textarea
                readOnly
                value={base64Output}
                rows={8}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'action.hover',
                  color: 'inherit',
                  fontFamily: 'monospace',
                }}
              />
            </Box>
          </Box>
        </Card>
      )}
    </Box>
  );
}
