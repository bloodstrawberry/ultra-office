'use client';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ToggleButton from '@mui/material/ToggleButton';
import FormControlLabel from '@mui/material/FormControlLabel';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import FormatListNumberedRoundedIcon from '@mui/icons-material/FormatListNumberedRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { LineNumberTextField } from '../../util/components/line-number-text-field';
import { ResizeHandle, TextAreaPanel } from '../../util/components/shared-text-area';

// ----------------------------------------------------------------------
// Sample Diff Presets
// ----------------------------------------------------------------------

const TEXT_DIFF_PRESETS = [
  {
    name: '1. 소스 코드 (TypeScript)',
    desc: '인증 미들웨어 로직 수정',
    oldVal: `async function authenticateUser(token: string) {
  if (!token) {
    throw new Error("Token missing");
  }
  const user = await verifyJwt(token);
  return { id: user.id, role: "USER" };
}`,
    newVal: `async function authenticateUser(token: string, requiredRole = "USER") {
  if (!token) {
    throw new Error("Authentication token is required");
  }
  const user = await verifyJwt(token);
  if (user.isSuspended) {
    throw new Error("User account is suspended");
  }
  return { id: user.id, role: user.role, permissions: user.permissions };
}`,
  },
  {
    name: '2. API JSON 응답',
    desc: '결제 트랜잭션 데이터 변경',
    oldVal: `{
  "status": "PENDING",
  "orderId": "ORD-2026-0818",
  "amount": 45000,
  "currency": "KRW",
  "items": [
    { "id": "ITM-01", "name": "무선 마우스", "qty": 1 }
  ]
}`,
    newVal: `{
  "status": "SUCCESS",
  "orderId": "ORD-2026-0818",
  "amount": 45000,
  "currency": "KRW",
  "paymentMethod": "HYUNDAI_CARD",
  "approvedAt": "2026-08-18T15:20:00Z",
  "items": [
    { "id": "ITM-01", "name": "무선 마우스 M3", "qty": 1, "price": 45000 }
  ]
}`,
  },
  {
    name: '3. 계약서 & 이용약관',
    desc: '개인정보 보유기간 개정',
    oldVal: `제5조 (개인정보의 보유 및 이용기간)
1. 회사는 회원이 탈퇴할 때까지 개인정보를 보유합니다.
2. 상법 등 법령에 따른 보존 의무가 있는 경우 3년간 보관합니다.`,
    newVal: `제5조 (개인정보의 보유 및 이용기간)
1. 회사는 회원 탈퇴 시 지체 없이 개인정보를 파기합니다. 단, 부정 이용 방지를 위해 식별값은 탈퇴 후 6개월간 안전하게 분리 보관합니다.
2. 전자상거래 등에서의 소비자보호에 관한 법률 등 관련 법령에 따라 결제 및 계약 기록은 5년간 보존합니다.`,
  },
  {
    name: '4. SQL 쿼리',
    desc: '인덱스 최적화 및 조인 튜닝',
    oldVal: `SELECT u.id, u.name, o.total_price
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.created_at >= '2026-01-01';`,
    newVal: `SELECT /*+ INDEX(o idx_orders_created) */ 
  u.id, u.name, u.email, SUM(o.total_price) AS total_spent
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'PAID'
  AND o.created_at >= '2026-01-01'
GROUP BY u.id, u.name, u.email
HAVING SUM(o.total_price) >= 1000000;`,
  },
];

const LINE_COMPARE_PRESETS = [
  {
    name: '1. 이메일 수신자 명단 비교',
    listA: `gildong.hong@company.com
minsu.kim@company.com
jieun.lee@company.com
seojun.park@company.com
yuna.jung@company.com`,
    listB: `minsu.kim@company.com
seojun.park@company.com
dongwook.choi@company.com
haewon.song@company.com
jieun.lee@company.com`,
  },
  {
    name: '2. 서버 IP 화이트리스트 검증',
    listA: `192.168.1.10
192.168.1.20
10.0.0.50
10.0.0.55
211.234.120.5`,
    listB: `192.168.1.10
10.0.0.50
10.0.0.99
211.234.120.5
172.16.0.100`,
  },
  {
    name: '3. 상품 SKU 재고 코드 비교',
    listA: `SKU-MACBOOK-M3-16
SKU-STUDIO-DISP-27
SKU-MX-MASTER-3S
SKU-MAGIC-KEYBOARD
SKU-IPAD-AIR-13`,
    listB: `SKU-MACBOOK-M3-16
SKU-MX-MASTER-3S
SKU-IPHONE-16-PRO
SKU-AIRPODS-PRO-2
SKU-MAGIC-KEYBOARD`,
  },
];

interface EntityItem {
  id: string;
  name: string;
  dept: string;
  role: string;
}

const ENTITY_PRESET_A: EntityItem[] = [
  { id: 'E101', name: '김민수', dept: '플랫폼개발팀', role: '수석연구원' },
  { id: 'E102', name: '이지은', dept: '글로벌마케팅팀', role: '책임연구원' },
  { id: 'E103', name: '박서준', dept: '디자인전략실', role: '선임연구원' },
  { id: 'E104', name: '정유나', dept: '인사기획팀', role: '책임연구원' },
  { id: 'E105', name: '홍길동', dept: 'AI 연구소', role: '수석연구원' },
];

const ENTITY_PRESET_B: EntityItem[] = [
  { id: 'E102', name: '이지은', dept: '글로벌마케팅팀', role: '책임연구원' },
  { id: 'E103', name: '박서준', dept: '디자인전략실', role: '선임연구원' },
  { id: 'E106', name: '최동욱', dept: '재무회계팀', role: '수석연구원' },
  { id: 'E107', name: '송해원', dept: '보안인프라팀', role: '선임연구원' },
  { id: 'E108', name: '강태양', dept: '클라우드개발팀', role: '책임연구원' },
];

// ----------------------------------------------------------------------

export function CompareView() {
  const [currentTab, setCurrentTab] = useState<'text' | 'line' | 'entity'>('text');

  // Tab 1: Text Diff State
  const [oldText, setOldText] = useState<string>(TEXT_DIFF_PRESETS[0].oldVal);
  const [newText, setNewText] = useState<string>(TEXT_DIFF_PRESETS[0].newVal);
  const [splitView, setSplitView] = useState<boolean>(true);
  const [useDarkTheme, setUseDarkTheme] = useState<boolean>(false);
  const [hideLineNumbers, setHideLineNumbers] = useState<boolean>(false);
  const [disableWordDiff, setDisableWordDiff] = useState<boolean>(false);
  const [inputHeight, setInputHeight] = useState<number>(240);

  // Tab 2: Line Compare State
  const [lineTextA, setLineTextA] = useState<string>(LINE_COMPARE_PRESETS[0].listA);
  const [lineTextB, setLineTextB] = useState<string>(LINE_COMPARE_PRESETS[0].listB);
  const [trimLines, setTrimLines] = useState<boolean>(true);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [dedup, setDedup] = useState<boolean>(true);

  const [onlyA, setOnlyA] = useState<string[]>([]);
  const [onlyB, setOnlyB] = useState<string[]>([]);
  const [commonAB, setCommonAB] = useState<string[]>([]);

  // Tab 3: Entity Compare Data
  const entitiesA = ENTITY_PRESET_A;
  const entitiesB = ENTITY_PRESET_B;

  // Calculate Line Differences
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

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Entity compare metrics
  const idsB = new Set(entitiesB.map((e) => e.id));
  const idsA = new Set(entitiesA.map((e) => e.id));
  const entityOnlyA = entitiesA.filter((e) => !idsB.has(e.id));
  const entityOnlyB = entitiesB.filter((e) => !idsA.has(e.id));
  const entityCommon = entitiesA.filter((e) => idsB.has(e.id));

  return (
    <DashboardContent>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          데이터 비교 스튜디오 (Data Diff & Compare)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          소스 코드·텍스트 정밀 Diff, 목록 라인 교집합/차집합 분석, 항목/인력 구조 비교를
          제공합니다.
        </Typography>
      </Box>

      <Tabs
        value={currentTab}
        onChange={(_, v) => setCurrentTab(v)}
        sx={{ mb: 2.5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab
          label="텍스트 Diff 비교"
          value="text"
          icon={<TextSnippetRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="라인 목록 비교 (교집합·차집합)"
          value="line"
          icon={<FormatListNumberedRoundedIcon />}
          iconPosition="start"
        />
        <Tab
          label="항목 & 인력 비교"
          value="entity"
          icon={<PeopleAltRoundedIcon />}
          iconPosition="start"
        />
      </Tabs>

      {/* TAB 1: TEXT DIFF */}
      {currentTab === 'text' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Preset Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
            >
              ⚡ 예제 프리셋:
            </Typography>
            {TEXT_DIFF_PRESETS.map((preset, i) => (
              <Chip
                key={i}
                label={preset.name}
                size="small"
                onClick={() => {
                  setOldText(preset.oldVal);
                  setNewText(preset.newVal);
                  toast.info(`${preset.name} 예제가 로드되었습니다.`);
                }}
                clickable
                color="primary"
                variant="outlined"
                sx={{ borderRadius: 1.5, fontWeight: 600 }}
              />
            ))}
          </Box>

          {/* Editors Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              height: inputHeight,
            }}
          >
            <TextAreaPanel
              title="이전 내용 (Original / Left)"
              actions={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="클립보드 복사">
                    <IconButton size="small" onClick={() => handleCopy(oldText)}>
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="스왑">
                    <IconButton
                      size="small"
                      onClick={() => {
                        const temp = oldText;
                        setOldText(newText);
                        setNewText(temp);
                      }}
                    >
                      <SwapHorizRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="비우기">
                    <IconButton size="small" color="error" onClick={() => setOldText('')}>
                      <DeleteSweepRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <LineNumberTextField
                value={oldText}
                onChange={setOldText}
                placeholder="비교할 원본 텍스트를 입력하세요..."
              />
            </TextAreaPanel>

            <TextAreaPanel
              title="변경 내용 (Modified / Right)"
              actions={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="클립보드 복사">
                    <IconButton size="small" onClick={() => handleCopy(newText)}>
                      <ContentCopyRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="비우기">
                    <IconButton size="small" color="error" onClick={() => setNewText('')}>
                      <DeleteSweepRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <LineNumberTextField
                value={newText}
                onChange={setNewText}
                placeholder="비교할 변경된 텍스트를 입력하세요..."
              />
            </TextAreaPanel>
          </Box>

          <ResizeHandle
            onDrag={(delta) => setInputHeight((h) => Math.max(160, Math.min(600, h + delta)))}
          />

          {/* Diff Controls Toolbar */}
          <Card
            sx={{
              p: 1.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <ToggleButtonGroup
                value={splitView ? 'split' : 'unified'}
                exclusive
                onChange={(_, v) => v && setSplitView(v === 'split')}
                size="small"
              >
                <ToggleButton value="split">나란히 보기 (Split)</ToggleButton>
                <ToggleButton value="unified">통합 보기 (Unified)</ToggleButton>
              </ToggleButtonGroup>

              <FormControlLabel
                control={
                  <Switch
                    checked={disableWordDiff}
                    onChange={(e) => setDisableWordDiff(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    단어 단위 강조 끄기
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={hideLineNumbers}
                    onChange={(e) => setHideLineNumbers(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    줄 번호 숨기기
                  </Typography>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={useDarkTheme}
                    onChange={(e) => setUseDarkTheme(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    다크 모드 뷰어
                  </Typography>
                }
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={() =>
                  handleDownload(
                    `=== ORIGINAL ===\n${oldText}\n\n=== MODIFIED ===\n${newText}`,
                    'diff_export.txt'
                  )
                }
              >
                Diff 텍스트 내보내기
              </Button>
            </Box>
          </Card>

          {/* Diff Viewer Canvas */}
          <Card
            sx={{
              p: 1.5,
              borderRadius: 2,
              minHeight: 280,
              bgcolor: useDarkTheme ? '#0f172a' : '#ffffff',
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ReactDiffViewer
              oldValue={oldText}
              newValue={newText}
              splitView={splitView}
              useDarkTheme={useDarkTheme}
              hideLineNumbers={hideLineNumbers}
              disableWordDiff={disableWordDiff}
              codeFoldMessageRenderer={(total) => (
                <Box sx={{ py: 0.8, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {total}개의 변경 없는 줄이 접혀 있습니다. 클릭하여 펼치기
                  </Typography>
                </Box>
              )}
            />
          </Card>
        </Box>
      )}

      {/* TAB 2: LINE COMPARE */}
      {currentTab === 'line' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Preset Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', mr: 0.5 }}
            >
              ⚡ 예제 프리셋:
            </Typography>
            {LINE_COMPARE_PRESETS.map((preset, i) => (
              <Chip
                key={i}
                label={preset.name}
                size="small"
                onClick={() => {
                  setLineTextA(preset.listA);
                  setLineTextB(preset.listB);
                  toast.info(`${preset.name} 예제가 로드되었습니다.`);
                }}
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
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}
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
                      p: 0.8,
                      borderRadius: 1,
                      bgcolor: '#ffffff',
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
                      p: 0.8,
                      borderRadius: 1,
                      bgcolor: '#ffffff',
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
                      p: 0.8,
                      borderRadius: 1,
                      bgcolor: '#ffffff',
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
      )}

      {/* TAB 3: ENTITY COMPARE */}
      {currentTab === 'entity' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Summary Metric Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
            <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'error.lighter' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'error.dark' }}>
                A 조직에만 있는 인원
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'error.main', my: 0.5 }}>
                {entityOnlyA.length}명
              </Typography>
            </Card>
            <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'info.lighter' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'info.dark' }}>
                양쪽 공통 소속 인원
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'info.main', my: 0.5 }}>
                {entityCommon.length}명
              </Typography>
            </Card>
            <Card sx={{ p: 2, borderRadius: 2, textAlign: 'center', bgcolor: 'success.lighter' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'success.dark' }}>
                B 조직에만 있는 인원
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main', my: 0.5 }}>
                {entityOnlyB.length}명
              </Typography>
            </Card>
          </Box>

          {/* 3-Column Entity Cards */}
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2 }}
          >
            {/* Only A */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, color: 'error.main' }}
              >
                A 전용 인력 명단
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {entityOnlyA.map((e) => (
                  <Card key={e.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {e.name} <Chip label={e.role} size="small" sx={{ ml: 0.5, height: 20 }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {e.dept} ({e.id})
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>

            {/* Common */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'info.main' }}>
                공통 참여 인력 명단
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {entityCommon.map((e) => (
                  <Card
                    key={e.id}
                    variant="outlined"
                    sx={{ p: 1.2, borderRadius: 1.5, borderColor: 'info.light' }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {e.name}{' '}
                      <Chip label={e.role} color="info" size="small" sx={{ ml: 0.5, height: 20 }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {e.dept} ({e.id})
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>

            {/* Only B */}
            <Card sx={{ p: 2, borderRadius: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 1.5, color: 'success.main' }}
              >
                B 전용 인력 명단
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {entityOnlyB.map((e) => (
                  <Card key={e.id} variant="outlined" sx={{ p: 1.2, borderRadius: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {e.name} <Chip label={e.role} size="small" sx={{ ml: 0.5, height: 20 }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {e.dept} ({e.id})
                    </Typography>
                  </Card>
                ))}
              </Box>
            </Card>
          </Box>
        </Box>
      )}
    </DashboardContent>
  );
}
