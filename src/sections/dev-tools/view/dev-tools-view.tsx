'use client';

import type { JwtDecoded } from '../utils/crypto-dev-utils';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import VpnKeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FindReplaceRoundedIcon from '@mui/icons-material/FindReplaceRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  decodeJwt,
  jsonToSql,
  decryptAes,
  encryptAes,
  calculateHash,
  REGEX_PRESETS,
  generateUuidV4,
  jsonToTypeScript,
  generateRandomPassword,
} from '../utils/crypto-dev-utils';

export function DevToolsView() {
  const [currentTab, setCurrentTab] = useState<'jwt' | 'crypto' | 'schema' | 'regex'>('jwt');

  // Copy helper
  const copyToClipboard = (text: string, label: string = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  // --------------------------------------------------------------------
  // Tab 1: JWT Decoder
  // --------------------------------------------------------------------
  const [jwtInput, setJwtInput] = useState<string>(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkhvbmcgR2lsLURvbmciLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTk5OTk5OTk5OX0.4pe_v64WzW8iQ5V4'
  );
  const [jwtResult, setJwtResult] = useState<JwtDecoded | null>(() => decodeJwt(jwtInput));

  const handleJwtChange = (val: string) => {
    setJwtInput(val);
    setJwtResult(decodeJwt(val));
  };

  // --------------------------------------------------------------------
  // Tab 2: Crypto & Hash
  // --------------------------------------------------------------------
  const [cryptoInput, setCryptoInput] = useState<string>('Ultra Office All-in-one');
  const [aesKey, setAesKey] = useState<string>('secret-pass-key-1234');
  const [aesEncrypted, setAesEncrypted] = useState<string>('');
  const [aesDecrypted, setAesDecrypted] = useState<string>('');

  // --------------------------------------------------------------------
  // Tab 3: Schema Converter
  // --------------------------------------------------------------------
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(
      [
        {
          id: 1,
          name: '홍길동',
          email: 'hong@ultraoffice.com',
          isActive: true,
          dept: { name: '플랫폼개발팀', floor: 7 },
        },
      ],
      null,
      2
    )
  );
  const [schemaMode, setSchemaMode] = useState<'ts' | 'sql'>('ts');

  // --------------------------------------------------------------------
  // Tab 4: Regex & Generator
  // --------------------------------------------------------------------
  const [regexPattern, setRegexPattern] = useState<string>('\\d{3}-\\d{2}-\\d{5}');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexTestText, setRegexTestText] = useState<string>(
    '주식회사 울트라오피스 사업자등록번호는 123-45-67890 및 987-65-43210 입니다.'
  );
  const [regexReplaceText, setRegexReplaceText] = useState<string>('[사업자번호 숨김]');

  const [generatedPassword, setGeneratedPassword] = useState<string>('');
  const [generatedUuid, setGeneratedUuid] = useState<string>('');

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          개발자 & 보안 툴킷 (Developer & Security Suite)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          JWT 분석, 해시/AES 암호화, JSON ➔ TypeScript/SQL 스키마 변환, 정규식 테스터를 제공합니다.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ flexShrink: 0, mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            label="1. JWT 토큰 분석기"
            value="jwt"
            icon={<VpnKeyRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. 해시 & 암호화 랩"
            value="crypto"
            icon={<LockRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 스키마 · 코드 변환기"
            value="schema"
            icon={<CodeRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="4. 정규식 & 난수 생성기"
            value="regex"
            icon={<FindReplaceRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Tab Contents */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {/* TAB 1: JWT Analyzer */}
        {currentTab === 'jwt' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 3 }}
          >
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                JWT 인코딩 토큰 입력
              </Typography>
              <TextField
                multiline
                rows={10}
                value={jwtInput}
                onChange={(e) => handleJwtChange(e.target.value)}
                placeholder="ey..."
                fullWidth
                sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </Card>

            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  디코딩 분석 결과
                </Typography>
                {jwtResult && (
                  <Chip
                    label={jwtResult.isExpired ? '만료된 토큰 (EXPIRED)' : '유효한 토큰 (ACTIVE)'}
                    color={jwtResult.isExpired ? 'error' : 'success'}
                    size="small"
                    sx={{ fontWeight: 800 }}
                  />
                )}
              </Box>

              {jwtResult ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {jwtResult.expiresAt && (
                    <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary' }}
                      >
                        만료 일시 (KST 한국 시간 기준):
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: jwtResult.isExpired ? 'error.main' : 'primary.main',
                        }}
                      >
                        {jwtResult.expiresAt}
                      </Typography>
                    </Card>
                  )}

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      HEADER (알고리즘 & 토큰 유형)
                    </Typography>
                    <pre
                      style={{
                        padding: 10,
                        backgroundColor: 'var(--palette-background-neutral, #f4f6f8)',
                        borderRadius: 6,
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {JSON.stringify(jwtResult.header, null, 2)}
                    </pre>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'info.main' }}>
                      PAYLOAD (클레임 데이터)
                    </Typography>
                    <pre
                      style={{
                        padding: 10,
                        backgroundColor: 'var(--palette-background-neutral, #f4f6f8)',
                        borderRadius: 6,
                        overflowX: 'auto',
                        fontSize: '0.8rem',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {JSON.stringify(jwtResult.payload, null, 2)}
                    </pre>
                  </Box>
                </Box>
              ) : (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}
                >
                  유효한 JWT 포맷이 아닙니다.
                </Typography>
              )}
            </Card>
          </Box>
        )}

        {/* TAB 2: Crypto & Hash */}
        {currentTab === 'crypto' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Hash calculation */}
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                단방향 암호화 해시 (Hash Generator)
              </Typography>
              <TextField
                label="해시 계산 대상 원문 텍스트"
                value={cryptoInput}
                onChange={(e) => setCryptoInput(e.target.value)}
                fullWidth
              />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mt: 1,
                }}
              >
                {(['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => {
                  const hashVal = calculateHash(cryptoInput, algo);
                  return (
                    <Card
                      key={algo}
                      variant="outlined"
                      sx={{ p: 1.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Chip
                          label={algo.toUpperCase()}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 800 }}
                        />
                        <IconButton size="small" onClick={() => copyToClipboard(hashVal)}>
                          <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          wordBreak: 'break-all',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        {hashVal}
                      </Typography>
                    </Card>
                  );
                })}
              </Box>
            </Card>

            {/* AES-256 Symmetric Encryption */}
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                AES-256 양방향 대칭키 암호화 & 복호화
              </Typography>
              <TextField
                label="비밀 암호키 (Secret Key)"
                value={aesKey}
                onChange={(e) => setAesKey(e.target.value)}
              />

              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
              >
                {/* Encrypt */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={() => {
                      const enc = encryptAes(cryptoInput, aesKey);
                      setAesEncrypted(enc);
                      toast.success('AES 암호화 완료');
                    }}
                  >
                    입력 텍스트 암호화 (Encrypt)
                  </Button>
                  {aesEncrypted && (
                    <Card variant="outlined" sx={{ p: 1.5, position: 'relative' }}>
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4 }}
                        onClick={() => copyToClipboard(aesEncrypted)}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                      >
                        암호문 (Ciphertext):
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                      >
                        {aesEncrypted}
                      </Typography>
                    </Card>
                  )}
                </Box>

                {/* Decrypt */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={!aesEncrypted}
                    onClick={() => {
                      const dec = decryptAes(aesEncrypted, aesKey);
                      setAesDecrypted(dec);
                    }}
                  >
                    암호문 복호화 (Decrypt)
                  </Button>
                  {aesDecrypted && (
                    <Card variant="outlined" sx={{ p: 1.5, position: 'relative' }}>
                      <IconButton
                        size="small"
                        sx={{ position: 'absolute', top: 4, right: 4 }}
                        onClick={() => copyToClipboard(aesDecrypted)}
                      >
                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                      >
                        복호화 결과:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'success.main' }}>
                        {aesDecrypted}
                      </Typography>
                    </Card>
                  )}
                </Box>
              </Box>
            </Card>
          </Box>
        )}

        {/* TAB 3: Schema Converter */}
        {currentTab === 'schema' && (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                JSON 데이터 입력
              </Typography>
              <TextField
                multiline
                rows={16}
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSON 객체 또는 배열을 입력하세요..."
                fullWidth
                sx={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              />
            </Card>

            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={schemaMode === 'ts' ? 'contained' : 'outlined'}
                    onClick={() => setSchemaMode('ts')}
                  >
                    TypeScript 인터페이스
                  </Button>
                  <Button
                    size="small"
                    variant={schemaMode === 'sql' ? 'contained' : 'outlined'}
                    onClick={() => setSchemaMode('sql')}
                  >
                    SQL DDL & INSERT
                  </Button>
                </Box>

                <Button
                  size="small"
                  startIcon={<ContentCopyRoundedIcon />}
                  onClick={() => {
                    const result =
                      schemaMode === 'ts' ? jsonToTypeScript(jsonInput) : jsonToSql(jsonInput);
                    copyToClipboard(result);
                  }}
                >
                  결과 복사
                </Button>
              </Box>

              <pre
                style={{
                  flex: 1,
                  padding: 14,
                  backgroundColor: 'var(--palette-background-neutral, #f4f6f8)',
                  borderRadius: 8,
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {schemaMode === 'ts' ? jsonToTypeScript(jsonInput) : jsonToSql(jsonInput)}
              </pre>
            </Card>
          </Box>
        )}

        {/* TAB 4: Regex & Generator */}
        {currentTab === 'regex' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Regex Studio */}
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                정규표현식(Regex) 테스터 & 한국 실무 프리셋
              </Typography>

              {/* Presets */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {REGEX_PRESETS.map((p) => (
                  <Chip
                    key={p.name}
                    label={p.name}
                    clickable
                    onClick={() => {
                      setRegexPattern(p.pattern);
                      setRegexTestText(p.example);
                      toast.info(`'${p.name}' 프리셋이 적용되었습니다.`);
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: 2 }}>
                <TextField
                  label="정규식 패턴 (Pattern)"
                  value={regexPattern}
                  onChange={(e) => setRegexPattern(e.target.value)}
                />
                <TextField
                  label="플래그 (Flags)"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                />
              </Box>

              <TextField
                label="테스트 대상 문자열"
                multiline
                rows={3}
                value={regexTestText}
                onChange={(e) => setRegexTestText(e.target.value)}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <TextField
                  label="치환할 문자열 (Replace with)"
                  value={regexReplaceText}
                  onChange={(e) => setRegexReplaceText(e.target.value)}
                />
                <Card variant="outlined" sx={{ p: 1.5, bgcolor: 'background.neutral' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    치환 결과 (Replace Output):
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {(() => {
                      try {
                        const reg = new RegExp(regexPattern, regexFlags);
                        return regexTestText.replace(reg, regexReplaceText);
                      } catch {
                        return '정규식 문법 오류';
                      }
                    })()}
                  </Typography>
                </Card>
              </Box>
            </Card>

            {/* Random Password & UUID */}
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                보안 비밀번호 & UUID 난수 생성기
              </Typography>

              <Box
                sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
              >
                {/* Password */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CasinoRoundedIcon />}
                    onClick={() => {
                      const pwd = generateRandomPassword(20);
                      setGeneratedPassword(pwd);
                    }}
                  >
                    강력한 20자리 비밀번호 생성
                  </Button>
                  {generatedPassword && (
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'error.main' }}
                      >
                        {generatedPassword}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(generatedPassword)}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Card>
                  )}
                </Box>

                {/* UUID */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CasinoRoundedIcon />}
                    onClick={() => {
                      const uuid = generateUuidV4();
                      setGeneratedUuid(uuid);
                    }}
                  >
                    UUID v4 고유 식별자 생성
                  </Button>
                  {generatedUuid && (
                    <Card
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main' }}
                      >
                        {generatedUuid}
                      </Typography>
                      <IconButton size="small" onClick={() => copyToClipboard(generatedUuid)}>
                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Card>
                  )}
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}
