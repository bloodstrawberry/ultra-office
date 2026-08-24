'use client';

import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import FactCheckRoundedIcon from '@mui/icons-material/FactCheckRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

// ----------------------------------------------------------------------

interface SqlEditorPanelProps {
  value: string;
  onChange: (val: string) => void;
  onRun: () => void;
  onSubmit?: () => void;
  isChallengeMode?: boolean;
  datasetName?: string;
  disabled?: boolean;
}

const SQL_TEMPLATES = [
  { label: '기본 SELECT 템플릿', query: 'SELECT *\nFROM emp\nLIMIT 10;' },
  {
    label: '[SQLD] DUAL 내장 함수 및 계산',
    query:
      "SELECT \n  ABS(-15) AS abs_val,\n  MOD(10, 3) AS mod_val,\n  ROUND(38.523, 1) AS round_val,\n  TRUNC(38.523, 1) AS trunc_val,\n  SUBSTR('SQLD_EXAM', 1, 4) AS sub_str,\n  UPPER('sqlp') AS upper_str\nFROM dual;",
  },
  {
    label: '[SQLD] NULL 함수 및 조건 분기 (NVL / COALESCE / CASE)',
    query:
      "SELECT \n  ename, \n  sal,\n  comm,\n  sal + COALESCE(comm, 0) AS total_pay,\n  NULLIF(deptno, 10) AS nullif_dept,\n  CASE \n    WHEN sal >= 3000 THEN 'HIGH'\n    WHEN sal >= 2000 THEN 'MID'\n    ELSE 'LOW'\n  END AS sal_grade\nFROM emp\nORDER BY sal DESC;",
  },
  {
    label: '[SQLD] 다차원 소계 (ROLLUP / CUBE / GROUPING SETS)',
    query:
      '-- 1. ROLLUP 소계 산출\nSELECT deptno, job, SUM(sal) AS sum_sal, COUNT(*) AS emp_cnt\nFROM emp\nGROUP BY ROLLUP(deptno, job);',
  },
  {
    label: '[SQLD] 윈도우 순위 및 누적합 (RANK / SUM OVER / LAG)',
    query:
      'SELECT \n  deptno,\n  ename,\n  sal,\n  RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rank,\n  DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dense_rank,\n  ROW_NUMBER() OVER (PARTITION BY deptno ORDER BY sal DESC) AS row_num,\n  SUM(sal) OVER (PARTITION BY deptno ORDER BY sal DESC) AS cum_sal,\n  LAG(sal, 1, 0) OVER (PARTITION BY deptno ORDER BY sal DESC) AS prev_sal\nFROM emp;',
  },
  {
    label: '[SQLD] 조인 비교 (INNER / LEFT OUTER / FULL OUTER)',
    query:
      'SELECT e.empno, e.ename, e.sal, d.deptno, d.dname, d.loc\nFROM dept d\nLEFT JOIN emp e ON d.deptno = e.deptno\nORDER BY d.deptno ASC, e.empno ASC;',
  },
  {
    label: '[SQLP] MERGE INTO (Upsert 병합 연산)',
    query:
      'MERGE INTO target_table t\nUSING source_table s\n  ON (t.id = s.id)\nWHEN MATCHED THEN\n  UPDATE SET t.val = s.val\nWHEN NOT MATCHED THEN\n  INSERT (id, val) VALUES (s.id, s.val);',
  },
  {
    label: '[SQLP] 튜닝: Top-N 페이징 및 인덱스 힌트',
    query:
      '-- 인덱스 선두 컬럼 기반 소트 연산 생략 및 Top-N Stopkey 유도\nSELECT /*+ INDEX_DESC(emp idx_emp_sal) */ \n  empno, ename, sal, deptno\nFROM emp\nWHERE sal > 0\nORDER BY sal DESC\nLIMIT 5;',
  },
  {
    label: '[SQLP] 튜닝: 조인 방식 및 드라이빙 순서 힌트',
    query:
      "-- 작은 테이블(dept)을 드라이빙으로 NL/Hash 조인 유도\nSELECT /*+ LEADING(d) USE_HASH(e) */ \n  e.empno, e.ename, d.dname, d.loc\nFROM dept d\nJOIN emp e ON d.deptno = e.deptno\nWHERE d.loc = 'DALLAS';",
  },
  {
    label: '[고난이도] 윈도우 프레임 이동평균 및 범위 집계 (ROWS BETWEEN)',
    query:
      '-- 본인 기준 이전 1명, 이후 1명 총 3명의 이동평균 및 부서내 최고/최저 급여와의 격차\nSELECT \n  deptno,\n  ename,\n  sal,\n  AVG(sal) OVER (\n    PARTITION BY deptno \n    ORDER BY sal ASC \n    ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING\n  ) AS moving_avg_sal,\n  MAX(sal) OVER (PARTITION BY deptno) - sal AS diff_from_max\nFROM emp\nORDER BY deptno ASC, sal ASC;',
  },
  {
    label: '[고난이도] 크로스탭 매트릭스 피벗 (Cross-Tab Pivot)',
    query:
      "-- 부서별 x 직책별 급여 합계를 단일 쿼리로 피벗 테이블화\nSELECT \n  d.deptno,\n  d.dname,\n  SUM(CASE WHEN e.job = 'CLERK' THEN e.sal ELSE 0 END) AS clerk_sal,\n  SUM(CASE WHEN e.job = 'SALESMAN' THEN e.sal ELSE 0 END) AS sales_sal,\n  SUM(CASE WHEN e.job = 'MANAGER' THEN e.sal ELSE 0 END) AS mgr_sal,\n  SUM(CASE WHEN e.job = 'ANALYST' THEN e.sal ELSE 0 END) AS analyst_sal,\n  SUM(CASE WHEN e.job = 'PRESIDENT' THEN e.sal ELSE 0 END) AS pres_sal,\n  COALESCE(SUM(e.sal), 0) AS total_dept_sal\nFROM dept d\nLEFT JOIN emp e ON d.deptno = e.deptno\nGROUP BY d.deptno, d.dname\nORDER BY d.deptno ASC;",
  },
  {
    label: '[고난이도] 직속 상사보다 급여 높은 사원 추출 (Self Join & Gap)',
    query:
      '-- 직속 상사(Manager)보다 급여를 더 많이 받는 사원과 상사 정보 매핑\nSELECT \n  e.empno AS emp_id,\n  e.ename AS emp_name,\n  e.sal AS emp_salary,\n  m.empno AS mgr_id,\n  m.ename AS mgr_name,\n  m.sal AS mgr_salary,\n  e.sal - m.sal AS salary_gap\nFROM emp e\nJOIN emp m ON e.mgr = m.empno\nWHERE e.sal > m.sal\nORDER BY salary_gap DESC;',
  },
  {
    label: '[고난이도] 부서별 급여 상위 2명 추출 (Inline View Top-N)',
    query:
      '-- 부서별로 급여가 가장 높은 상위 2명(동점자 포함 Dense Rank)만 필터링\nSELECT deptno, ename, sal, dept_rank\nFROM (\n  SELECT \n    deptno,\n    ename,\n    sal,\n    DENSE_RANK() OVER (PARTITION BY deptno ORDER BY sal DESC) AS dept_rank\n  FROM emp\n)\nWHERE dept_rank <= 2\nORDER BY deptno ASC, dept_rank ASC;',
  },
  {
    label: '[고난이도] 누적 급여 비율 및 등급 분할 (CUME_DIST / NTILE)',
    query:
      '-- 전체 급여 누적 백분율 및 4분위수(Tier 1~4) 등급 분할\nSELECT \n  empno,\n  ename,\n  sal,\n  ROUND(sal * 100.0 / SUM(sal) OVER (), 2) AS sal_pct_of_total,\n  SUM(sal) OVER (ORDER BY sal ASC) AS running_total,\n  NTILE(4) OVER (ORDER BY sal ASC) AS salary_quartile\nFROM emp\nORDER BY sal ASC;',
  },
  {
    label: '[DDL] CREATE TABLE (신규 테이블 생성)',
    query:
      "-- 신규 프로젝트 태스크 관리 테이블 생성\nCREATE TABLE project_tasks (\n  task_id INT PRIMARY KEY,\n  empno INT NOT NULL,\n  task_name VARCHAR(100),\n  status VARCHAR(20) DEFAULT 'TODO',\n  due_date DATE\n);",
  },
  {
    label: '[DDL] ALTER TABLE (컬럼 추가 및 스키마 변경)',
    query:
      '-- emp 테이블에 이메일 및 전화번호 컬럼 추가\nALTER TABLE emp ADD email VARCHAR(100);\nALTER TABLE emp ADD phone VARCHAR(30);',
  },
  {
    label: '[DDL] CREATE VIEW (가상 뷰 생성 및 조회)',
    query:
      '-- 부서별 급여 요약 뷰 생성\nCREATE VIEW v_dept_sal_summary AS\nSELECT d.deptno, d.dname, COUNT(e.empno) AS emp_cnt, AVG(e.sal) AS avg_sal\nFROM dept d\nLEFT JOIN emp e ON d.deptno = e.deptno\nGROUP BY d.deptno, d.dname;\n\n-- 생성된 뷰 조회\nSELECT * FROM v_dept_sal_summary;',
  },
  {
    label: '[DML] INSERT INTO (단일 삽입 및 서브쿼리 대량 적재)',
    query:
      "-- 1. 신규 사원 단일 삽입\nINSERT INTO emp (empno, ename, job, mgr, hiredate, sal, comm, deptno)\nVALUES (8001, 'LEON', 'DEVELOPER', 7566, '2026-08-19', 4500, 500, 20);\n\n-- 2. 서브쿼리를 통한 대량 적재 (고액 연봉자 대상)\nINSERT INTO target_table (id, val)\nSELECT empno, ename FROM emp WHERE sal >= 3000;\n\n-- 반영 결과 확인\nSELECT * FROM emp WHERE empno = 8001;",
  },
  {
    label: '[DML] UPDATE (조건부 수정 및 서브쿼리 갱신)',
    query:
      "-- 커미션이 없는 사원에게 기본 보너스 300 지급\nUPDATE emp\nSET comm = 300\nWHERE comm IS NULL AND job = 'CLERK';\n\n-- 갱신된 결과 확인\nSELECT empno, ename, job, sal, comm\nFROM emp\nWHERE job = 'CLERK';",
  },
  {
    label: '[DML] DELETE & TRUNCATE (데이터 삭제 및 초기화)',
    query:
      '-- 특정 조건(급여 1000 미만)의 사원 삭제\nDELETE FROM emp\nWHERE sal < 1000;\n\n-- 타깃 테이블 데이터 전체 초기화\nTRUNCATE TABLE target_table;\n\n-- 남은 데이터 확인\nSELECT COUNT(*) AS total_remaining FROM emp;',
  },
  {
    label: '[통합 실습] DDL ➔ DML ➔ SELECT 연속 파이프라인',
    query:
      "-- 1) 테이블 생성\nCREATE TABLE team_bonus (\n  id INT PRIMARY KEY,\n  deptno INT,\n  bonus_title VARCHAR(50),\n  amount INT\n);\n\n-- 2) 데이터 삽입\nINSERT INTO team_bonus VALUES (1, 10, '회계팀 분기 성과금', 2000000);\nINSERT INTO team_bonus VALUES (2, 20, '연구개발 인센티브', 3500000);\nINSERT INTO team_bonus VALUES (3, 30, '영업 목표달성 보너스', 5000000);\n\n-- 3) 부서 테이블과 조인하여 최종 확인\nSELECT b.id, d.dname, b.bonus_title, b.amount\nFROM team_bonus b\nJOIN dept d ON b.deptno = d.deptno;",
  },
];

export function SqlEditorPanel({
  value,
  onChange,
  onRun,
  onSubmit,
  isChallengeMode = false,
  datasetName,
  disabled = false,
}: SqlEditorPanelProps) {
  const [templateAnchor, setTemplateAnchor] = useState<null | HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const lines = value ? value.split('\n') : [''];
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleScroll = () => {
    if (!textareaRef.current || !lineNumbersRef.current) return;
    lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Tab key support in textarea
    if (e.key === 'Tab' && textareaRef.current) {
      e.preventDefault();
      const target = textareaRef.current;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
      return;
    }

    // Ctrl + Enter or Cmd + Enter to Run / Submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (isChallengeMode && onSubmit) {
        onSubmit();
      } else {
        onRun();
      }
    }
  };

  const handleFormatSql = () => {
    if (!value.trim()) return;

    const keywords = [
      'SELECT',
      'FROM',
      'WHERE',
      'GROUP BY',
      'HAVING',
      'ORDER BY',
      'LIMIT',
      'OFFSET',
      'LEFT JOIN',
      'RIGHT JOIN',
      'INNER JOIN',
      'FULL JOIN',
      'CROSS JOIN',
      'JOIN',
      'ON',
      'AND',
      'OR',
      'NOT',
      'IN',
      'BETWEEN',
      'LIKE',
      'IS NULL',
      'IS NOT NULL',
      'AS',
      'DISTINCT',
      'CASE',
      'WHEN',
      'THEN',
      'ELSE',
      'END',
      'UNION ALL',
      'UNION',
      'INSERT INTO',
      'VALUES',
      'UPDATE',
      'SET',
      'DELETE FROM',
      'CREATE TABLE',
      'DROP TABLE',
      'ALTER TABLE',
      'PRIMARY KEY',
      'DESC',
      'ASC',
      'SUM',
      'COUNT',
      'AVG',
      'MAX',
      'MIN',
    ];

    let formatted = value;

    // Capitalize SQL keywords safely
    keywords.forEach((kw) => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });

    onChange(formatted);
  };

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleClear = () => {
    onChange('');
    if (textareaRef.current) textareaRef.current.focus();
  };

  const handleSelectTemplate = (templateQuery: string) => {
    onChange(templateQuery);
    setTemplateAnchor(null);
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <Card
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.vars.palette.divider}`,
      }}
    >
      {/* Editor Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: (theme) => `1px solid ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            SQL 에디터
          </Typography>
          {datasetName && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: 'action.hover',
                px: 1,
                py: 0.2,
                borderRadius: 1,
                fontWeight: 600,
                color: 'text.secondary',
                display: { xs: 'none', sm: 'inline-block' },
              }}
            >
              {datasetName}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {!isChallengeMode && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<BookmarkBorderRoundedIcon fontSize="small" />}
                onClick={(e) => setTemplateAnchor(e.currentTarget)}
                sx={{ fontSize: 12, height: 32, fontWeight: 600, borderRadius: 1.5 }}
              >
                예제 템플릿
              </Button>
              <Menu
                anchorEl={templateAnchor}
                open={Boolean(templateAnchor)}
                onClose={() => setTemplateAnchor(null)}
                slotProps={{
                  paper: {
                    sx: { maxHeight: 400, width: 340 },
                  },
                }}
              >
                {SQL_TEMPLATES.map((tmpl, idx) => (
                  <MenuItem
                    key={idx}
                    onClick={() => handleSelectTemplate(tmpl.query)}
                    sx={{ fontSize: 13, py: 1 }}
                  >
                    {tmpl.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title="SQL 키워드 대문자 자동 정리">
            <IconButton size="small" onClick={handleFormatSql}>
              <AutoFixHighRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={copied ? '복사됨!' : '쿼리 복사'}>
            <IconButton size="small" onClick={handleCopy}>
              {copied ? (
                <CheckCircleOutlineRoundedIcon color="success" fontSize="small" />
              ) : (
                <ContentCopyRoundedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          <Tooltip title="내용 지우기">
            <IconButton size="small" onClick={handleClear} color="default">
              <DeleteSweepRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={onRun}
            disabled={disabled || !value.trim()}
            sx={{ height: 32, px: 1.75, fontWeight: 700, borderRadius: 1.5 }}
          >
            실행 (Run)
          </Button>

          {isChallengeMode && onSubmit && (
            <Button
              variant="contained"
              color="success"
              size="small"
              startIcon={<FactCheckRoundedIcon />}
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              sx={{ height: 32, px: 1.75, fontWeight: 700, borderRadius: 1.5 }}
            >
              제출 & 채점
            </Button>
          )}
        </Box>
      </Box>

      {/* Editor Content Area with Line Numbering */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? '#0d1117' : '#ffffff'),
          position: 'relative',
          overflow: 'hidden',
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Line Numbers Gutter */}
        <Box
          ref={lineNumbersRef}
          sx={{
            width: 44,
            py: '14px',
            px: '8px',
            userSelect: 'none',
            textAlign: 'right',
            color: 'text.disabled',
            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
            fontSize: '13px',
            lineHeight: '22px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            borderRight: (theme) => `1px solid ${theme.vars.palette.divider}`,
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {lines.map((_, i) => (
            <div key={i} style={{ height: '22px' }}>
              {i + 1}
            </div>
          ))}
        </Box>

        {/* Textarea Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onScroll={handleScroll}
          placeholder="-- 여기에 SQL 쿼리를 작성하세요 (예: SELECT * FROM customers;)"
          spellCheck={false}
          style={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            border: 'none',
            outline: 'none',
            resize: 'none',
            background: 'transparent',
            color: 'inherit',
            fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
            fontSize: '13px',
            lineHeight: '22px',
            padding: '14px 16px',
            boxSizing: 'border-box',
          }}
        />
      </Box>

      {/* Footer shortcut helper */}
      <Box
        sx={{
          px: 2,
          py: 0.6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          bgcolor: 'background.neutral',
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: 11 }}>
          단축키: <strong>Ctrl + Enter</strong>로 쿼리 실행 • <strong>Tab</strong> 키 들여쓰기
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', fontSize: 11, fontWeight: 600 }}
        >
          In-Memory SQLite Engine
        </Typography>
      </Box>
    </Card>
  );
}
