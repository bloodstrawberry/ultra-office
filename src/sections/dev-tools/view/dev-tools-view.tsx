'use client';

import type { JwtDecoded, PasswordOptions } from '../utils/crypto-dev-utils';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import HttpRoundedIcon from '@mui/icons-material/HttpRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import KeyRoundedIcon from '@mui/icons-material/VpnKeyRounded';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import HandymanRoundedIcon from '@mui/icons-material/HandymanRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PasswordRoundedIcon from '@mui/icons-material/PasswordRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import FindReplaceRoundedIcon from '@mui/icons-material/FindReplaceRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import IntegrationInstructionsRoundedIcon from '@mui/icons-material/IntegrationInstructionsRounded';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks/use-router';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  decodeJwt,
  jsonToSql,
  jsonToCsv,
  decryptAes,
  encryptAes,
  jsonToYaml,
  formatJson,
  minifyJson,
  curlToAxios,
  curlToFetch,
  encodeBase64,
  decodeBase64,
  generateCuid,
  calculateHash,
  calculateHmac,
  REGEX_PRESETS,
  generateUuidV4,
  generateUuidV7,
  generateNanoId,
  SAMPLE_SCHEMAS,
  jsonToZodSchema,
  timestampToDate,
  dateToTimestamp,
  jsonToTypeScript,
  SAMPLE_JWT_TOKENS,
  HTTP_STATUS_CODES,
  generateLoremIpsum,
  encodeUrlComponent,
  generateRandomPassword,
} from '../utils/crypto-dev-utils';

// ----------------------------------------------------------------------
// Hub Tool Categories Definition
// ----------------------------------------------------------------------
type ToolTabKey = 'hub' | 'jwt' | 'crypto' | 'schema' | 'regex' | 'generators' | 'web';

interface HubToolItem {
  id: ToolTabKey;
  subId?: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
  tag?: string;
  badgeColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  path?: string;
}

const HUB_SECTIONS: { category: string; desc: string; tools: HubToolItem[] }[] = [
  {
    category: '1. 보안 & 토큰 랩',
    desc: 'JWT 디코딩, 만료시간 검증, Base64 및 URL 안전 인코딩/디코딩 도구입니다.',
    tools: [
      {
        id: 'jwt',
        title: 'JWT 토큰 분석기',
        desc: 'Header/Payload 분리, 만료 시간(KST/UTC) 카운트다운 및 유효성 검증',
        icon: <KeyRoundedIcon sx={{ fontSize: 26, color: '#6366f1' }} />,
        tag: '보안 핵심',
        badgeColor: 'primary',
      },
      {
        id: 'jwt',
        subId: 'base64',
        title: 'Base64 & URL 인코더',
        desc: 'UTF-8 문자열 및 URI 컴포넌트 상호 인코딩/디코딩 변환기',
        icon: <IntegrationInstructionsRoundedIcon sx={{ fontSize: 26, color: '#3b82f6' }} />,
        tag: '실무 필수',
        badgeColor: 'info',
      },
    ],
  },
  {
    category: '2. 암호화 & 해시 랩',
    desc: '단방향 해시(MD5/SHA/HMAC) 계산 및 AES-256 대칭키 암호화/복호화 스튜디오입니다.',
    tools: [
      {
        id: 'crypto',
        title: '해시 생성기 (Hash Lab)',
        desc: 'MD5, SHA-1, SHA-256, SHA-512, SHA-3, RIPEMD160 및 HMAC 일괄 계산',
        icon: <SecurityRoundedIcon sx={{ fontSize: 26, color: '#10b981' }} />,
        tag: 'HOT',
        badgeColor: 'success',
      },
      {
        id: 'crypto',
        subId: 'aes',
        title: 'AES-256 대칭키 암·복호화',
        desc: 'Secret Key 기반 안전한 양방향 암호화 및 복호화 실시간 테스트',
        icon: <LockRoundedIcon sx={{ fontSize: 26, color: '#f59e0b' }} />,
        tag: '보안',
        badgeColor: 'warning',
      },
    ],
  },
  {
    category: '3. 스키마 & 코드 변환기',
    desc: 'JSON 데이터를 TypeScript, SQL DDL/INSERT, Zod, YAML, CSV로 자동 생성합니다.',
    tools: [
      {
        id: 'schema',
        title: 'JSON ➔ TypeScript Interface',
        desc: '중첩 객체와 배열 타입을 자동 추론하여 안전한 TS 인터페이스 생성',
        icon: <CodeRoundedIcon sx={{ fontSize: 26, color: '#38bdf8' }} />,
        tag: '추천',
        badgeColor: 'primary',
      },
      {
        id: 'schema',
        subId: 'sql',
        title: 'JSON ➔ SQL DDL & INSERT',
        desc: 'MySQL / PostgreSQL 호환 테이블 생성 DDL 및 데이터 삽입 쿼리 생성',
        icon: <AutoFixHighRoundedIcon sx={{ fontSize: 26, color: '#ec4899' }} />,
      },
      {
        id: 'schema',
        subId: 'zod',
        title: 'JSON ➔ Zod Validation Schema',
        desc: '런타임 데이터 검증을 위한 Zod 스키마 및 TypeScript Type 생성',
        icon: <IntegrationInstructionsRoundedIcon sx={{ fontSize: 26, color: '#8b5cf6' }} />,
        tag: 'NEW',
        badgeColor: 'secondary',
      },
      {
        id: 'schema',
        subId: 'yaml',
        title: 'JSON ➔ YAML / CSV 변환',
        desc: '설정 파일용 YAML 변환 및 엑셀 호환 CSV 테이블 데이터 내보내기',
        icon: <TuneRoundedIcon sx={{ fontSize: 26, color: '#14b8a6' }} />,
      },
    ],
  },
  {
    category: '4. 정규표현식 & 텍스트 랩',
    desc: '정규식 실시간 매칭 하이라이트, 치환 테스트 및 한국 실무 프리셋 10종을 제공합니다.',
    tools: [
      {
        id: 'regex',
        title: '정규표현식(Regex) 테스터',
        desc: '실시간 매칭 하이라이트, 일치 개수/캡처 그룹 분석 및 실시간 치환',
        icon: <FindReplaceRoundedIcon sx={{ fontSize: 26, color: '#f43f5e' }} />,
        tag: '인기',
        badgeColor: 'error',
      },
      {
        id: 'regex',
        subId: 'korea',
        title: '한국 실무 정규식 프리셋 10종',
        desc: '주민번호, 사업자번호, 법인번호, 휴대폰, 이메일, IP, 카드번호 프리셋',
        icon: <TuneRoundedIcon sx={{ fontSize: 26, color: '#0ea5e9' }} />,
        tag: '한국 실무',
        badgeColor: 'info',
      },
    ],
  },
  {
    category: '5. 난수 & 고유 식별자 생성기',
    desc: '강력한 비밀번호, UUID v4/v7, NanoID, CUID 및 더미 텍스트를 즉시 생성합니다.',
    tools: [
      {
        id: 'generators',
        title: '보안 비밀번호 생성기',
        desc: '길이/조합 커스텀, 혼동 문자 제외, 엔트로피 보안 강도 실시간 분석',
        icon: <PasswordRoundedIcon sx={{ fontSize: 26, color: '#eab308' }} />,
        tag: '추천',
        badgeColor: 'warning',
      },
      {
        id: 'generators',
        subId: 'uuid',
        title: 'UUID v4/v7 & NanoID & CUID',
        desc: '표준 랜덤 UUID v4, 시간 정렬형 UUID v7, 초경량 NanoID 일괄 생성',
        icon: <CasinoRoundedIcon sx={{ fontSize: 26, color: '#84cc16' }} />,
        tag: '고유 ID',
        badgeColor: 'success',
      },
    ],
  },
  {
    category: '6. Web & Network 도구',
    desc: 'Unix Timestamp 변환, HTTP 상태 코드 도감, cURL ➔ Fetch/Axios 코드 변환기입니다.',
    tools: [
      {
        id: 'web',
        title: 'Epoch Timestamp 변환기',
        desc: '현재 밀리초 타임스탬프, KST 한국시간, UTC, ISO 8601 및 상대 시간',
        icon: <ScheduleRoundedIcon sx={{ fontSize: 26, color: '#06b6d4' }} />,
      },
      {
        id: 'web',
        subId: 'status',
        title: 'HTTP 상태 코드 도감',
        desc: '2xx, 3xx, 4xx, 5xx 상태 코드 설명 및 의미 빠른 검색',
        icon: <HttpRoundedIcon sx={{ fontSize: 26, color: '#6366f1' }} />,
      },
      {
        id: 'web',
        subId: 'curl',
        title: 'cURL ➔ Fetch / Axios 변환기',
        desc: 'cURL 터미널 명령어를 브라우저 Fetch API 및 Axios 코드로 자동 변환',
        icon: <SendRoundedIcon sx={{ fontSize: 26, color: '#f97316' }} />,
        tag: 'NEW',
        badgeColor: 'secondary',
      },
      {
        id: 'web',
        subId: 'publicApi',
        title: 'Public API 탐색기 & 테스터',
        desc: '한국 300개 + 글로벌 1,491개 공개 API 검색 및 브라우저 실시간 요청/응답 테스트',
        icon: <PublicRoundedIcon sx={{ fontSize: 26, color: '#0ea5e9' }} />,
        tag: 'HOT',
        badgeColor: 'primary',
        path: paths.publicApi,
      },
    ],
  },
  {
    category: '7. IDE & 코드 시뮬레이터',
    desc: 'Visual Studio Code 환경에서 소스코드가 한 글자씩 실시간 타이핑되는 타이핑 스튜디오입니다.',
    tools: [
      {
        id: 'web',
        title: 'VS Code 타이핑 IDE (Code Typing Player)',
        desc: 'VS Code 테마 에디터에서 코드를 입력하고 재생 버튼을 누르면 실시간 타이핑 애니메이션과 타건음 출력',
        icon: <CodeRoundedIcon sx={{ fontSize: 26, color: '#007acc' }} />,
        tag: 'NEW',
        badgeColor: 'primary',
        path: paths.devToolsIde,
      },
    ],
  },
];

// ----------------------------------------------------------------------
// Main DevTools View Component
// ----------------------------------------------------------------------
export function DevToolsView() {
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<ToolTabKey>('jwt');
  const [hasLoaded, setHasLoaded] = useState(false);
  const [splitWidth, setSplitWidth] = useState<number>(500);

  const isResizingRef = useRef<boolean>(false);
  const resizeStartXRef = useRef<number>(0);
  const resizeStartWidthRef = useRef<number>(500);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  // Resizer handlers
  const handleDividerPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    isResizingRef.current = true;
    resizeStartXRef.current = e.clientX;
    resizeStartWidthRef.current = splitWidth;
  };

  const handleDividerPointerMove = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const deltaX = e.clientX - resizeStartXRef.current;
    const newWidth = Math.max(340, Math.min(850, resizeStartWidthRef.current + deltaX));
    setSplitWidth(newWidth);
  };

  const handleDividerPointerUp = (e: React.PointerEvent) => {
    if (isResizingRef.current) {
      isResizingRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, label: string = '복사되었습니다.') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  // --------------------------------------------------------------------
  // Tab 1: JWT & Base64 State
  // --------------------------------------------------------------------
  const [jwtInput, setJwtInput] = useState<string>(SAMPLE_JWT_TOKENS[0].token);
  const [jwtResult, setJwtResult] = useState<JwtDecoded | null>(() =>
    decodeJwt(SAMPLE_JWT_TOKENS[0].token)
  );

  const handleJwtChange = (val: string) => {
    setJwtInput(val);
    setJwtResult(decodeJwt(val));
  };

  const [base64Input, setBase64Input] = useState<string>(
    'Ultra Office 개발자 툴킷 - 안전한 로컬 브라우저 처리'
  );
  const [base64Output, setBase64Output] = useState<string>(() =>
    encodeBase64('Ultra Office 개발자 툴킷 - 안전한 로컬 브라우저 처리')
  );
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');

  const handleBase64Process = (text: string, mode: 'encode' | 'decode') => {
    setBase64Input(text);
    setBase64Mode(mode);
    setBase64Output(mode === 'encode' ? encodeBase64(text) : decodeBase64(text));
  };

  const [urlInput, setUrlInput] = useState<string>(
    'https://ultraoffice.com/search?query=개발자 툴킷&tag=보안'
  );
  const [urlOutput, setUrlOutput] = useState<string>(() =>
    encodeUrlComponent('https://ultraoffice.com/search?query=개발자 툴킷&tag=보안')
  );

  // --------------------------------------------------------------------
  // Tab 2: Crypto & Hash State
  // --------------------------------------------------------------------
  const [cryptoInput, setCryptoInput] = useState<string>(
    'Ultra Office All-in-one Developer Suite 2026'
  );
  const [hmacKey, setHmacKey] = useState<string>('ultra-secret-hmac-key');
  const [aesKey, setAesKey] = useState<string>('secret-pass-key-1234');
  const [aesEncrypted, setAesEncrypted] = useState<string>('');
  const [aesDecrypted, setAesDecrypted] = useState<string>('');

  // --------------------------------------------------------------------
  // Tab 3: Schema Converter State
  // --------------------------------------------------------------------
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_SCHEMAS[0].json);
  const [schemaMode, setSchemaMode] = useState<'ts' | 'sql' | 'zod' | 'yaml' | 'csv'>('ts');
  const [tsTypeMode, setTsTypeMode] = useState<'interface' | 'type'>('interface');
  const [sqlDialect, setSqlDialect] = useState<'mysql' | 'postgres'>('mysql');
  const [schemaName, setSchemaName] = useState<string>('OrderData');

  const getSchemaOutput = useCallback((): string => {
    switch (schemaMode) {
      case 'ts':
        return jsonToTypeScript(jsonInput, schemaName, tsTypeMode);
      case 'sql':
        return jsonToSql(jsonInput, 'orders_table', sqlDialect);
      case 'zod':
        return jsonToZodSchema(jsonInput, 'orderSchema');
      case 'yaml':
        return jsonToYaml(jsonInput);
      case 'csv':
        return jsonToCsv(jsonInput);
      default:
        return '';
    }
  }, [schemaMode, jsonInput, schemaName, tsTypeMode, sqlDialect]);

  // --------------------------------------------------------------------
  // Tab 4: Regex & Text State
  // --------------------------------------------------------------------
  const [regexPattern, setRegexPattern] = useState<string>('\\d{3}-\\d{2}-\\d{5}');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [regexTestText, setRegexTestText] = useState<string>(
    '주식회사 울트라오피스 사업자등록번호는 123-45-67890 및 987-65-43210 입니다. 대표자 문의 010-1234-5678'
  );
  const [regexReplaceText, setRegexReplaceText] = useState<string>('[사업자번호 숨김]');

  // --------------------------------------------------------------------
  // Tab 5: Generators State
  // --------------------------------------------------------------------
  const [pwdOptions, setPwdOptions] = useState<PasswordOptions>({
    length: 20,
    upper: true,
    lower: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [pwdResult, setPwdResult] = useState(() => generateRandomPassword());
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([]);
  const [uuidType, setUuidType] = useState<'v4' | 'v7' | 'nanoid' | 'cuid'>('v4');
  const [uuidBatchCount, setUuidBatchCount] = useState<number>(5);

  const handleGenerateUuids = useCallback(() => {
    const list: string[] = [];
    for (let i = 0; i < uuidBatchCount; i += 1) {
      if (uuidType === 'v4') list.push(generateUuidV4());
      else if (uuidType === 'v7') list.push(generateUuidV7());
      else if (uuidType === 'nanoid') list.push(generateNanoId(21));
      else list.push(generateCuid());
    }
    setGeneratedUuids(list);
  }, [uuidBatchCount, uuidType]);

  const [loremType, setLoremType] = useState<'ko' | 'en'>('ko');
  const [loremCount, setLoremCount] = useState<number>(4);
  const [loremOutput, setLoremOutput] = useState<string>('');

  // --------------------------------------------------------------------
  // Tab 6: Web & Network State
  // --------------------------------------------------------------------
  const [epochInput, setEpochInput] = useState<number>(1772320000);
  const [epochDateResult, setEpochDateResult] = useState(() => timestampToDate(1772320000));
  const [dateInputStr, setDateInputStr] = useState<string>('2026-08-29 15:30:00');
  const [dateToEpochResult, setDateToEpochResult] = useState(() =>
    dateToTimestamp('2026-08-29 15:30:00')
  );

  const [curlInput, setCurlInput] = useState<string>(
    `curl -X POST "https://api.ultraoffice.com/v1/auth/login" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer sample_jwt_key_2026" \\\n  -d '{"email":"dev@ultraoffice.com","role":"admin"}'`
  );
  const [curlTarget, setCurlTarget] = useState<'fetch' | 'axios'>('fetch');
  const [statusSearch, setStatusSearch] = useState<string>('');

  // Loading state
  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}
        >
          <CircularProgress size={40} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent
      sx={{
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        pb: { xs: 2, sm: 2.5 },
      }}
    >
      {/* Top Header */}
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 0.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2,
                bgcolor: 'warning.main',
                color: 'warning.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 2,
              }}
            >
              <HandymanRoundedIcon sx={{ fontSize: 22 }} />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              개발자 & 보안 툴킷 (Developer Suite)
            </Typography>
            <Chip
              label="100% 로컬 처리"
              size="small"
              color="success"
              sx={{ fontWeight: 800, fontSize: '0.72rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            서버 전송 없이 브라우저 내에서 안전하게 작동하는 JWT, 암호화, 스키마 변환, 정규식 & 난수
            통합 워크스페이스입니다.
          </Typography>
        </Box>

        {/* View Mode Toggle Button */}
        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            variant={currentTab === 'hub' ? 'contained' : 'outlined'}
            color={currentTab === 'hub' ? 'primary' : 'inherit'}
            onClick={() => setCurrentTab('hub')}
            startIcon={<GridViewRoundedIcon />}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            도구 허브 전체보기
          </Button>
        </Box>
      </Box>

      {/* Tabs Navigation Bar */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2, flexShrink: 0 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => setCurrentTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              minHeight: 44,
              fontWeight: 700,
              fontSize: '0.85rem',
              py: 1,
            },
          }}
        >
          <Tab
            label="도구 허브 (Hub)"
            value="hub"
            icon={<GridViewRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="1. 보안 & 토큰 랩"
            value="jwt"
            icon={<KeyRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="2. 암호화 & 해시 랩"
            value="crypto"
            icon={<SecurityRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="3. 스키마 & 코드 변환"
            value="schema"
            icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="4. 정규표현식 & 텍스트"
            value="regex"
            icon={<FindReplaceRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="5. 난수 & 고유 식별자"
            value="generators"
            icon={<CasinoRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
          <Tab
            label="6. Web & Network 도구"
            value="web"
            icon={<HttpRoundedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* ================================================================ */}
      {/* 0. HUB VIEW: Categorized Cards Grid (PhotoHubView Pattern)        */}
      {/* ================================================================ */}
      {currentTab === 'hub' && (
        <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pr: 0.5, pb: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {HUB_SECTIONS.map((sec) => (
              <Box key={sec.category}>
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {sec.category}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {sec.desc}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  {sec.tools.map((tool, idx) => (
                    <Card
                      key={`${tool.id}-${idx}`}
                      onClick={() => {
                        if (tool.path) {
                          router.push(tool.path);
                        } else {
                          setCurrentTab(tool.id);
                        }
                      }}
                      sx={{
                        p: 2.5,
                        borderRadius: 2.5,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        minHeight: 155,
                        cursor: 'pointer',
                        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[8],
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 1.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: 44,
                              height: 44,
                              borderRadius: 2,
                              bgcolor: 'action.hover',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {tool.icon}
                          </Box>
                          {tool.tag && (
                            <Chip
                              label={tool.tag}
                              size="small"
                              color={tool.badgeColor || 'primary'}
                              sx={{ fontWeight: 700, height: 22, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {tool.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary', fontSize: '0.8rem', lineHeight: 1.45 }}
                        >
                          {tool.desc}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          mt: 1.5,
                          color: 'primary.main',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                        }}
                      >
                        <span>도구 열기</span>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                      </Box>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 1. JWT & Base64 Studio                                           */}
      {/* ================================================================ */}
      {currentTab === 'jwt' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: Input & Presets */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${splitWidth}px` },
              minWidth: { md: '340px' },
              maxWidth: { md: '850px' },
              flexShrink: 0,
              pr: { md: 1 },
              gap: 1.5,
              minHeight: 0,
              overflowY: 'auto',
            }}
          >
            {/* JWT Input Card */}
            <Card
              sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <KeyRoundedIcon color="primary" sx={{ fontSize: 20 }} />
                  JWT 토큰 원문 입력
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => handleJwtChange('')}
                  sx={{ fontSize: '0.75rem' }}
                >
                  지우기
                </Button>
              </Box>

              {/* Sample Presets */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {SAMPLE_JWT_TOKENS.map((s) => (
                  <Chip
                    key={s.name}
                    label={s.name}
                    clickable
                    size="small"
                    onClick={() => {
                      handleJwtChange(s.token);
                      toast.info(`'${s.name}' 샘플 토큰을 불러왔습니다.`);
                    }}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                ))}
              </Box>

              <TextField
                multiline
                rows={7}
                value={jwtInput}
                onChange={(e) => handleJwtChange(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ..."
                fullWidth
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                  },
                }}
              />
            </Card>

            {/* Base64 & URL Studio Card */}
            <Card
              sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  Base64 & URL 인코딩/디코딩
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    variant={base64Mode === 'encode' ? 'contained' : 'outlined'}
                    onClick={() => handleBase64Process(base64Input, 'encode')}
                    sx={{ py: 0.2, px: 1, fontSize: '0.72rem' }}
                  >
                    인코딩
                  </Button>
                  <Button
                    size="small"
                    variant={base64Mode === 'decode' ? 'contained' : 'outlined'}
                    onClick={() => handleBase64Process(base64Output, 'decode')}
                    sx={{ py: 0.2, px: 1, fontSize: '0.72rem' }}
                  >
                    디코딩
                  </Button>
                </Box>
              </Box>

              <TextField
                size="small"
                label="입력 문자열"
                value={base64Input}
                onChange={(e) => handleBase64Process(e.target.value, base64Mode)}
                fullWidth
              />

              <Box sx={{ position: 'relative' }}>
                <TextField
                  size="small"
                  label="Base64 변환 결과"
                  value={base64Output}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(base64Output, 'Base64 결과 복사')}
                  sx={{ position: 'absolute', right: 6, top: 6 }}
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5 }}>
                <TextField
                  size="small"
                  label="URL 인코딩 대상"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    setUrlOutput(encodeUrlComponent(e.target.value));
                  }}
                />
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    size="small"
                    label="URL 인코딩 결과"
                    value={urlOutput}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.78rem' },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => copyToClipboard(urlOutput, 'URL 인코딩 복사')}
                    sx={{ position: 'absolute', right: 4, top: 4 }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 6,
              margin: '0 -2px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
              position: 'relative',
              '&:hover .divider-bar, &:active .divider-bar': {
                bgcolor: 'primary.main',
                width: '2px',
                boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
              },
            }}
          >
            <Box
              className="divider-bar"
              sx={{
                width: '1px',
                height: '100%',
                bgcolor: 'divider',
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'width', 'box-shadow'], {
                    duration: 150,
                  }),
              }}
            />
          </Box>

          {/* Right: JWT Inspector Output Stage */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pl: { md: 1 },
              gap: 1.5,
              overflowY: 'auto',
            }}
          >
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                flex: '1 1 auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  JWT 디코딩 상세 분석 결과
                </Typography>
                {jwtResult && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {jwtResult.timeRemaining && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: jwtResult.isExpired ? 'error.main' : 'success.main',
                        }}
                      >
                        {jwtResult.timeRemaining}
                      </Typography>
                    )}
                    <Chip
                      label={jwtResult.isExpired ? '만료된 토큰 (EXPIRED)' : '유효한 토큰 (ACTIVE)'}
                      color={jwtResult.isExpired ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 800 }}
                    />
                  </Box>
                )}
              </Box>

              {jwtResult ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Meta Bar */}
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: 1.5,
                    }}
                  >
                    <Card variant="outlined" sx={{ p: 1.25, bgcolor: 'background.neutral' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}
                      >
                        발급 일시 (iat):
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        {jwtResult.issuedAt || '명시되지 않음'}
                      </Typography>
                    </Card>

                    <Card variant="outlined" sx={{ p: 1.25, bgcolor: 'background.neutral' }}>
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, color: 'text.secondary', display: 'block' }}
                      >
                        만료 일시 (exp, KST 한국시간):
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          color: jwtResult.isExpired ? 'error.main' : 'primary.main',
                        }}
                      >
                        {jwtResult.expiresAt || '만료시간 없음 (무제한)'}
                      </Typography>
                    </Card>
                  </Box>

                  {/* Header Box */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        HEADER : 알고리즘 & 토큰 유형
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                        onClick={() =>
                          copyToClipboard(JSON.stringify(jwtResult.header, null, 2), 'Header 복사')
                        }
                        sx={{ fontSize: '0.72rem', py: 0.1 }}
                      >
                        복사
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#0f172a',
                        color: '#38bdf8',
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        overflowX: 'auto',
                      }}
                    >
                      <pre style={{ margin: 0 }}>{JSON.stringify(jwtResult.header, null, 2)}</pre>
                    </Box>
                  </Box>

                  {/* Payload Box */}
                  <Box>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5,
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'info.main' }}>
                        PAYLOAD : 클레임 데이터 (User Claims)
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(jwtResult.payload, null, 2),
                            'Payload 복사'
                          )
                        }
                        sx={{ fontSize: '0.72rem', py: 0.1 }}
                      >
                        복사
                      </Button>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#0f172a',
                        color: '#a7f3d0',
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        overflowX: 'auto',
                      }}
                    >
                      <pre style={{ margin: 0 }}>{JSON.stringify(jwtResult.payload, null, 2)}</pre>
                    </Box>
                  </Box>

                  {/* Signature Box */}
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 800, color: 'warning.main', display: 'block', mb: 0.5 }}
                    >
                      SIGNATURE : 암호화 서명 값
                    </Typography>
                    <Box
                      sx={{
                        p: 1.25,
                        bgcolor: '#0f172a',
                        color: '#fbbf24',
                        borderRadius: 2,
                        fontFamily: 'monospace',
                        fontSize: '0.78rem',
                        wordBreak: 'break-all',
                      }}
                    >
                      {jwtResult.signature}
                    </Box>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '240px',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">
                    유효한 JWT 포맷이 아닙니다. 좌측에 올바른 JWT 문자열을 입력해 주세요.
                  </Typography>
                </Box>
              )}
            </Card>
          </Box>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 2. Crypto & Hash Lab                                             */}
      {/* ================================================================ */}
      {currentTab === 'crypto' && (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Hash Generator */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <SecurityRoundedIcon color="success" sx={{ fontSize: 22 }} />
                단방향 암호화 해시 (Hash Generator)
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const hashes = (['md5', 'sha1', 'sha256', 'sha512'] as const)
                    .map((a) => `${a.toUpperCase()}: ${calculateHash(cryptoInput, a)}`)
                    .join('\n');
                  copyToClipboard(hashes, '전체 해시 결과가 복사되었습니다.');
                }}
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
              >
                전체 해시 일괄 복사
              </Button>
            </Box>

            <TextField
              label="해시 계산 대상 원문 텍스트"
              value={cryptoInput}
              onChange={(e) => setCryptoInput(e.target.value)}
              fullWidth
            />

            {/* Hash Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {(['md5', 'sha1', 'sha256', 'sha512'] as const).map((algo) => {
                const hashVal = calculateHash(cryptoInput, algo);
                return (
                  <Card
                    key={algo}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.75,
                      bgcolor: 'background.paper',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
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
                        sx={{ fontWeight: 800, height: 22, fontSize: '0.72rem' }}
                      />
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(hashVal, `${algo.toUpperCase()} 해시 복사`)}
                      >
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
                        fontSize: '0.75rem',
                      }}
                    >
                      {hashVal}
                    </Typography>
                  </Card>
                );
              })}
            </Box>

            {/* HMAC Lab */}
            <Box
              sx={{
                mt: 1,
                p: 2,
                bgcolor: 'background.neutral',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.5,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                HMAC-SHA256 해시 계산
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1.5fr' },
                  gap: 1.5,
                }}
              >
                <TextField
                  size="small"
                  label="HMAC 비밀키 (Secret Key)"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                />
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    size="small"
                    label="HMAC-SHA256 결과"
                    value={calculateHmac(cryptoInput, hmacKey, 'sha256')}
                    fullWidth
                    InputProps={{
                      readOnly: true,
                      sx: { fontFamily: 'monospace', fontSize: '0.8rem' },
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() =>
                      copyToClipboard(calculateHmac(cryptoInput, hmacKey, 'sha256'), 'HMAC 복사')
                    }
                    sx={{ position: 'absolute', right: 4, top: 4 }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Card>

          {/* AES-256 Symmetric Encryption Card */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <LockRoundedIcon color="warning" sx={{ fontSize: 22 }} />
              AES-256 양방향 대칭키 암호화 & 복호화
            </Typography>

            <TextField
              size="small"
              label="대칭 암호키 (Secret Password Key)"
              value={aesKey}
              onChange={(e) => setAesKey(e.target.value)}
              fullWidth
            />

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              {/* Encrypt Block */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    const enc = encryptAes(cryptoInput, aesKey);
                    setAesEncrypted(enc);
                    toast.success('AES-256 암호화 완료');
                  }}
                  sx={{ py: 1, fontWeight: 700 }}
                >
                  평문 암호화 (Encrypt)
                </Button>
                {aesEncrypted && (
                  <Card
                    variant="outlined"
                    sx={{ p: 1.5, position: 'relative', bgcolor: '#0f172a', color: '#38bdf8' }}
                  >
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 6, right: 6, color: '#ffffff' }}
                      onClick={() => copyToClipboard(aesEncrypted, '암호문 복사')}
                    >
                      <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5, color: '#94a3b8' }}
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

              {/* Decrypt Block */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="secondary"
                  disabled={!aesEncrypted}
                  onClick={() => {
                    const dec = decryptAes(aesEncrypted, aesKey);
                    setAesDecrypted(dec);
                    toast.success('복호화 처리 완료');
                  }}
                  sx={{ py: 1, fontWeight: 700 }}
                >
                  암호문 복호화 (Decrypt)
                </Button>
                {aesDecrypted && (
                  <Card
                    variant="outlined"
                    sx={{ p: 1.5, position: 'relative', bgcolor: 'background.neutral' }}
                  >
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 6, right: 6 }}
                      onClick={() => copyToClipboard(aesDecrypted, '복호화 원문 복사')}
                    >
                      <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}
                    >
                      복호화 원문:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {aesDecrypted}
                    </Typography>
                  </Card>
                )}
              </Box>
            </Box>
          </Card>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 3. Schema & Code Converter                                       */}
      {/* ================================================================ */}
      {currentTab === 'schema' && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, md: 0 },
            flex: '1 1 auto',
            minHeight: 0,
            height: '100%',
            position: 'relative',
          }}
        >
          {/* Left: JSON Input & Formatter */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              width: { xs: '100%', md: `${splitWidth}px` },
              minWidth: { md: '340px' },
              maxWidth: { md: '850px' },
              flexShrink: 0,
              pr: { md: 1 },
              gap: 1.5,
              minHeight: 0,
              height: '100%',
            }}
          >
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                  flexShrink: 0,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  JSON 데이터 입력
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      const fmt = formatJson(jsonInput, 2);
                      setJsonInput(fmt);
                      toast.success('JSON 정렬 완료');
                    }}
                    sx={{ fontSize: '0.72rem' }}
                  >
                    정렬 (Prettify)
                  </Button>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => {
                      const min = minifyJson(jsonInput);
                      setJsonInput(min);
                      toast.success('JSON 압축 완료');
                    }}
                    sx={{ fontSize: '0.72rem' }}
                  >
                    압축 (Minify)
                  </Button>
                </Box>
              </Box>

              {/* Sample Buttons */}
              <Box sx={{ display: 'flex', gap: 0.75, mb: 1.5, flexWrap: 'wrap', flexShrink: 0 }}>
                {SAMPLE_SCHEMAS.map((s) => (
                  <Chip
                    key={s.name}
                    label={s.name}
                    clickable
                    size="small"
                    onClick={() => {
                      setJsonInput(s.json);
                      toast.info(`'${s.name}' 샘플 데이터를 불러왔습니다.`);
                    }}
                    variant="outlined"
                    sx={{ fontWeight: 600, fontSize: '0.72rem' }}
                  />
                ))}
              </Box>

              <TextField
                multiline
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSON 객체 또는 배열을 입력하세요..."
                fullWidth
                sx={{
                  flex: '1 1 auto',
                  display: 'flex',
                  '& .MuiInputBase-root': {
                    height: '100%',
                    alignItems: 'flex-start',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.82rem',
                    lineHeight: 1.5,
                    height: '100% !important',
                    overflowY: 'auto !important',
                  },
                }}
              />
            </Card>
          </Box>

          {/* Draggable Divider (Desktop) */}
          <Box
            onPointerDown={handleDividerPointerDown}
            onPointerMove={handleDividerPointerMove}
            onPointerUp={handleDividerPointerUp}
            sx={{
              display: { xs: 'none', md: 'flex' },
              width: 6,
              margin: '0 -2px',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'col-resize',
              userSelect: 'none',
              touchAction: 'none',
              zIndex: 10,
              flexShrink: 0,
              position: 'relative',
              '&:hover .divider-bar, &:active .divider-bar': {
                bgcolor: 'primary.main',
                width: '2px',
                boxShadow: (theme) => `0 0 6px ${theme.palette.primary.main}80`,
              },
            }}
          >
            <Box
              className="divider-bar"
              sx={{
                width: '1px',
                height: '100%',
                bgcolor: 'divider',
                transition: (theme) =>
                  theme.transitions.create(['background-color', 'width', 'box-shadow'], {
                    duration: 150,
                  }),
              }}
            />
          </Box>

          {/* Right: Code Generator Output */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flex: '1 1 0px',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
              pl: { md: 1 },
              gap: 1.5,
            }}
          >
            <Card
              sx={{
                p: 2.5,
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                flex: '1 1 auto',
                minHeight: 0,
              }}
            >
              {/* Mode Switcher */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  flexShrink: 0,
                  flexWrap: 'wrap',
                  gap: 1,
                }}
              >
                <ToggleButtonGroup
                  value={schemaMode}
                  exclusive
                  onChange={(_, val) => val && setSchemaMode(val)}
                  size="small"
                >
                  <ToggleButton value="ts">TypeScript</ToggleButton>
                  <ToggleButton value="sql">SQL DDL</ToggleButton>
                  <ToggleButton value="zod">Zod Schema</ToggleButton>
                  <ToggleButton value="yaml">YAML</ToggleButton>
                  <ToggleButton value="csv">CSV</ToggleButton>
                </ToggleButtonGroup>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {schemaMode === 'ts' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label="interface"
                        clickable
                        size="small"
                        color={tsTypeMode === 'interface' ? 'primary' : 'default'}
                        onClick={() => setTsTypeMode('interface')}
                      />
                      <Chip
                        label="type"
                        clickable
                        size="small"
                        color={tsTypeMode === 'type' ? 'primary' : 'default'}
                        onClick={() => setTsTypeMode('type')}
                      />
                    </Box>
                  )}
                  {schemaMode === 'sql' && (
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Chip
                        label="MySQL"
                        clickable
                        size="small"
                        color={sqlDialect === 'mysql' ? 'primary' : 'default'}
                        onClick={() => setSqlDialect('mysql')}
                      />
                      <Chip
                        label="PostgreSQL"
                        clickable
                        size="small"
                        color={sqlDialect === 'postgres' ? 'primary' : 'default'}
                        onClick={() => setSqlDialect('postgres')}
                      />
                    </Box>
                  )}
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 15 }} />}
                    onClick={() =>
                      copyToClipboard(
                        getSchemaOutput(),
                        `${schemaMode.toUpperCase()} 코드가 복사되었습니다.`
                      )
                    }
                  >
                    결과 복사
                  </Button>
                </Box>
              </Box>

              {/* Code Output Stage */}
              <Box
                sx={{
                  flex: '1 1 auto',
                  p: 2,
                  bgcolor: '#0f172a',
                  color: '#e2e8f0',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  overflow: 'auto',
                }}
              >
                <pre style={{ margin: 0 }}>{getSchemaOutput()}</pre>
              </Box>
            </Card>
          </Box>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 4. Regex & Text Studio                                           */}
      {/* ================================================================ */}
      {currentTab === 'regex' && (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <FindReplaceRoundedIcon color="error" sx={{ fontSize: 22 }} />
                정규표현식(Regex) 테스터 & 한국 실무 프리셋 10종
              </Typography>
            </Box>

            {/* Presets Chips */}
            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {REGEX_PRESETS.map((p) => (
                <Tooltip key={p.name} title={p.description}>
                  <Chip
                    label={p.name}
                    clickable
                    size="small"
                    onClick={() => {
                      setRegexPattern(p.pattern);
                      setRegexTestText(p.example);
                      toast.info(`'${p.name}' 프리셋이 적용되었습니다.`);
                    }}
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                </Tooltip>
              ))}
            </Box>

            {/* Pattern & Flags */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 2 }}>
              <TextField
                label="정규표현식 패턴 (Pattern)"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                InputProps={{ sx: { fontFamily: 'monospace', fontWeight: 700 } }}
              />
              <TextField
                label="플래그 (Flags)"
                value={regexFlags}
                onChange={(e) => setRegexFlags(e.target.value)}
                InputProps={{ sx: { fontFamily: 'monospace' } }}
              />
            </Box>

            {/* Test String */}
            <TextField
              label="테스트 대상 문자열"
              multiline
              rows={4}
              value={regexTestText}
              onChange={(e) => setRegexTestText(e.target.value)}
            />

            {/* Matches & Highlights Info */}
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  매칭 결과 (Matches Analysis):
                </Typography>
                <Chip
                  label={(() => {
                    try {
                      const reg = new RegExp(regexPattern, regexFlags);
                      const matches = regexTestText.match(reg);
                      return matches ? `${matches.length}개 일치` : '일치 항목 없음';
                    } catch {
                      return '정규식 오류';
                    }
                  })()}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 800 }}
                />
              </Box>

              {/* Replace block */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 2,
                  mt: 1.5,
                }}
              >
                <TextField
                  size="small"
                  label="치환할 문자열 (Replace with)"
                  value={regexReplaceText}
                  onChange={(e) => setRegexReplaceText(e.target.value)}
                />
                <Box sx={{ position: 'relative' }}>
                  <TextField
                    size="small"
                    label="치환 결과"
                    value={(() => {
                      try {
                        const reg = new RegExp(regexPattern, regexFlags);
                        return regexTestText.replace(reg, regexReplaceText);
                      } catch {
                        return '정규식 문법 오류';
                      }
                    })()}
                    fullWidth
                    InputProps={{ readOnly: true, sx: { fontWeight: 700, color: 'primary.main' } }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      try {
                        const reg = new RegExp(regexPattern, regexFlags);
                        copyToClipboard(
                          regexTestText.replace(reg, regexReplaceText),
                          '치환 결과 복사'
                        );
                      } catch {
                        toast.error('정규식 오류');
                      }
                    }}
                    sx={{ position: 'absolute', right: 4, top: 4 }}
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Card>
          </Card>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 5. Random Generators                                             */}
      {/* ================================================================ */}
      {currentTab === 'generators' && (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Password Generator */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <PasswordRoundedIcon color="warning" sx={{ fontSize: 22 }} />
                보안 비밀번호 생성기 & 엔트로피 강도 분석
              </Typography>
              <Chip
                label={`보안 강도: ${pwdResult.strength} (${pwdResult.entropyScore} bits)`}
                color={
                  pwdResult.strength === '매우 강력' || pwdResult.strength === '강력'
                    ? 'success'
                    : 'warning'
                }
                size="small"
                sx={{ fontWeight: 800 }}
              />
            </Box>

            {/* Generated Pwd Banner */}
            <Card
              sx={{
                p: 2,
                bgcolor: '#0f172a',
                color: '#ffffff',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography
                variant="h5"
                sx={{ fontFamily: 'monospace', fontWeight: 800, letterSpacing: 1 }}
              >
                {pwdResult.password}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => {
                    const res = generateRandomPassword(pwdOptions);
                    setPwdResult(res);
                  }}
                  startIcon={<CasinoRoundedIcon />}
                >
                  새로 생성
                </Button>
                <IconButton
                  color="inherit"
                  onClick={() => copyToClipboard(pwdResult.password, '비밀번호가 복사되었습니다.')}
                >
                  <ContentCopyRoundedIcon />
                </IconButton>
              </Box>
            </Card>

            {/* Options */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 2fr' },
                gap: 2,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  비밀번호 길이: {pwdOptions.length}자리
                </Typography>
                <Slider
                  value={pwdOptions.length}
                  min={8}
                  max={64}
                  onChange={(_, v) => {
                    const next = { ...pwdOptions, length: v as number };
                    setPwdOptions(next);
                    setPwdResult(generateRandomPassword(next));
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={pwdOptions.upper}
                      onChange={(e) => {
                        const next = { ...pwdOptions, upper: e.target.checked };
                        setPwdOptions(next);
                        setPwdResult(generateRandomPassword(next));
                      }}
                      size="small"
                    />
                  }
                  label="대문자 (A-Z)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={pwdOptions.lower}
                      onChange={(e) => {
                        const next = { ...pwdOptions, lower: e.target.checked };
                        setPwdOptions(next);
                        setPwdResult(generateRandomPassword(next));
                      }}
                      size="small"
                    />
                  }
                  label="소문자 (a-z)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={pwdOptions.digits}
                      onChange={(e) => {
                        const next = { ...pwdOptions, digits: e.target.checked };
                        setPwdOptions(next);
                        setPwdResult(generateRandomPassword(next));
                      }}
                      size="small"
                    />
                  }
                  label="숫자 (0-9)"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={pwdOptions.symbols}
                      onChange={(e) => {
                        const next = { ...pwdOptions, symbols: e.target.checked };
                        setPwdOptions(next);
                        setPwdResult(generateRandomPassword(next));
                      }}
                      size="small"
                    />
                  }
                  label="특수문자 (!@#$)"
                />
              </Box>
            </Box>
          </Card>

          {/* UUID / NanoID / CUID Generator */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <CasinoRoundedIcon color="primary" sx={{ fontSize: 22 }} />
                고유 식별자 일괄 생성 (UUID v4 / v7 / NanoID / CUID)
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  copyToClipboard(
                    generatedUuids.join('\n'),
                    '생성된 식별자 전체가 복사되었습니다.'
                  );
                }}
                disabled={generatedUuids.length === 0}
                startIcon={<ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
              >
                전체 일괄 복사
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
              <ToggleButtonGroup
                value={uuidType}
                exclusive
                onChange={(_, val) => val && setUuidType(val)}
                size="small"
              >
                <ToggleButton value="v4">UUID v4 (랜덤)</ToggleButton>
                <ToggleButton value="v7">UUID v7 (시간순)</ToggleButton>
                <ToggleButton value="nanoid">NanoID</ToggleButton>
                <ToggleButton value="cuid">CUID2</ToggleButton>
              </ToggleButtonGroup>

              <ToggleButtonGroup
                value={uuidBatchCount}
                exclusive
                onChange={(_, val) => val && setUuidBatchCount(val)}
                size="small"
              >
                <ToggleButton value={1}>1개</ToggleButton>
                <ToggleButton value={5}>5개</ToggleButton>
                <ToggleButton value={10}>10개</ToggleButton>
                <ToggleButton value={20}>20개</ToggleButton>
              </ToggleButtonGroup>

              <Button variant="contained" onClick={handleGenerateUuids} sx={{ fontWeight: 700 }}>
                생성하기
              </Button>
            </Box>

            {generatedUuids.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mt: 1 }}>
                {generatedUuids.map((id, idx) => (
                  <Card
                    key={`${id}-${idx}`}
                    variant="outlined"
                    sx={{
                      p: '8px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
                    >
                      {id}
                    </Typography>
                    <IconButton size="small" onClick={() => copyToClipboard(id, '복사 완료')}>
                      <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Card>
                ))}
              </Box>
            )}
          </Card>

          {/* Lorem Ipsum Generator */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                더미 텍스트 (Lorem Ipsum) 생성기
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const txt = generateLoremIpsum(loremType, loremCount);
                  setLoremOutput(txt);
                }}
              >
                더미 텍스트 생성
              </Button>
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                label="한국어 문장"
                clickable
                color={loremType === 'ko' ? 'primary' : 'default'}
                onClick={() => setLoremType('ko')}
              />
              <Chip
                label="영어 (Latin)"
                clickable
                color={loremType === 'en' ? 'primary' : 'default'}
                onClick={() => setLoremType('en')}
              />
            </Box>

            {loremOutput && (
              <Box sx={{ position: 'relative' }}>
                <TextField
                  multiline
                  rows={3}
                  value={loremOutput}
                  fullWidth
                  InputProps={{ readOnly: true }}
                />
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(loremOutput, '더미 텍스트 복사')}
                  sx={{ position: 'absolute', right: 6, top: 6 }}
                >
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            )}
          </Card>
        </Box>
      )}

      {/* ================================================================ */}
      {/* 6. Web & Network Utilities                                       */}
      {/* ================================================================ */}
      {currentTab === 'web' && (
        <Box
          sx={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.5,
            pb: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2.5,
          }}
        >
          {/* Epoch Timestamp Converter */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <ScheduleRoundedIcon color="info" sx={{ fontSize: 22 }} />
                Unix Timestamp (Epoch) ↔ 표준 일시 상호 변환기
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const nowSec = Math.floor(Date.now() / 1000);
                  setEpochInput(nowSec);
                  setEpochDateResult(timestampToDate(nowSec));
                  toast.info('현재 시각 타임스탬프가 적용되었습니다.');
                }}
              >
                현재 시각 적용
              </Button>
            </Box>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              {/* Epoch to Date */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label="Unix Timestamp 입력 (초 또는 밀리초)"
                  type="number"
                  value={epochInput}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setEpochInput(val);
                    setEpochDateResult(timestampToDate(val));
                  }}
                />
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    KST 한국 시간:{' '}
                    <span style={{ color: '#0284c7', fontWeight: 800 }}>{epochDateResult.kst}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    UTC 시간: <span>{epochDateResult.utc}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    상대 시간:{' '}
                    <span style={{ color: '#16a34a', fontWeight: 800 }}>{epochDateResult.rel}</span>
                  </Typography>
                </Card>
              </Box>

              {/* Date to Epoch */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <TextField
                  label="표준 날짜 문자열 (YYYY-MM-DD HH:mm:ss)"
                  value={dateInputStr}
                  onChange={(e) => {
                    setDateInputStr(e.target.value);
                    setDateToEpochResult(dateToTimestamp(e.target.value));
                  }}
                />
                <Card
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.neutral',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.75,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    초 단위 (Seconds):{' '}
                    <span style={{ color: '#0284c7', fontWeight: 800 }}>
                      {dateToEpochResult?.seconds ?? '유효하지 않은 날짜'}
                    </span>
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    밀리초 (Milliseconds): <span>{dateToEpochResult?.milliseconds ?? '-'}</span>
                  </Typography>
                </Card>
              </Box>
            </Box>
          </Card>

          {/* cURL to Fetch / Axios Converter */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <SendRoundedIcon color="secondary" sx={{ fontSize: 22 }} />
                cURL ➔ Fetch / Axios 코드 자동 변환기
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <ToggleButtonGroup
                  value={curlTarget}
                  exclusive
                  onChange={(_, val) => val && setCurlTarget(val)}
                  size="small"
                >
                  <ToggleButton value="fetch">Fetch API</ToggleButton>
                  <ToggleButton value="axios">Axios</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    const code =
                      curlTarget === 'fetch' ? curlToFetch(curlInput) : curlToAxios(curlInput);
                    copyToClipboard(code, '생성된 코드가 복사되었습니다.');
                  }}
                >
                  코드 복사
                </Button>
              </Box>
            </Box>

            <Box
              sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}
            >
              <TextField
                multiline
                rows={8}
                label="cURL 명령어 입력"
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
                InputProps={{ sx: { fontFamily: 'monospace', fontSize: '0.82rem' } }}
              />

              <Box
                sx={{
                  p: 2,
                  bgcolor: '#0f172a',
                  color: '#38bdf8',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  overflow: 'auto',
                  maxHeight: 220,
                }}
              >
                <pre style={{ margin: 0 }}>
                  {curlTarget === 'fetch' ? curlToFetch(curlInput) : curlToAxios(curlInput)}
                </pre>
              </Box>
            </Box>
          </Card>

          {/* HTTP Status Catalog */}
          <Card
            sx={{ p: 2.5, borderRadius: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <HttpRoundedIcon color="primary" sx={{ fontSize: 22 }} />
                HTTP 상태 코드 (Status Codes) 도감
              </Typography>
              <TextField
                size="small"
                placeholder="코드/설명 검색..."
                value={statusSearch}
                onChange={(e) => setStatusSearch(e.target.value)}
                sx={{ width: 200 }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' },
                gap: 1.5,
              }}
            >
              {HTTP_STATUS_CODES.filter(
                (s) =>
                  String(s.code).includes(statusSearch) ||
                  s.name.toLowerCase().includes(statusSearch.toLowerCase()) ||
                  s.desc.includes(statusSearch)
              ).map((item) => (
                <Card
                  key={item.code}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={item.code}
                        size="small"
                        color={
                          item.code < 300
                            ? 'success'
                            : item.code < 400
                              ? 'info'
                              : item.code < 500
                                ? 'warning'
                                : 'error'
                        }
                        sx={{ fontWeight: 800 }}
                      />
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => copyToClipboard(`${item.code} ${item.name}: ${item.desc}`)}
                    >
                      <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.4 }}>
                    {item.desc}
                  </Typography>
                </Card>
              ))}
            </Box>
          </Card>
        </Box>
      )}
    </DashboardContent>
  );
}
