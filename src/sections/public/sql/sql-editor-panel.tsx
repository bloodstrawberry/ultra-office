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
  { label: '기본 SELECT 템플릿', query: 'SELECT *\nFROM customers\nLIMIT 10;' },
  {
    label: '조건부 검색 (WHERE)',
    query:
      "SELECT name, email, city\nFROM customers\nWHERE city = '서울'\nORDER BY customer_id ASC;",
  },
  {
    label: '그룹화 및 집계 (GROUP BY)',
    query: 'SELECT city, COUNT(*) AS count\nFROM customers\nGROUP BY city\nORDER BY count DESC;',
  },
  {
    label: '테이블 조인 (INNER JOIN)',
    query:
      'SELECT o.order_id, c.name, o.total_amount, o.status\nFROM orders o\nJOIN customers c ON o.customer_id = c.customer_id\nORDER BY o.order_id ASC;',
  },
  {
    label: '서브쿼리 (Subquery)',
    query:
      'SELECT product_name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products)\nORDER BY price DESC;',
  },
  {
    label: '테이블 생성 (CREATE TABLE)',
    query:
      'CREATE TABLE temp_logs (\n  id INT PRIMARY KEY,\n  message VARCHAR(100),\n  created_at DATE\n);',
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
  };

  const handleSelectTemplate = (templateQuery: string) => {
    onChange(templateQuery);
    setTemplateAnchor(null);
  };

  return (
    <Card
      sx={{
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
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
            SQL 에디터
          </Typography>
          {datasetName && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }}
            >
              ({datasetName})
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          {!isChallengeMode && (
            <>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<BookmarkBorderRoundedIcon fontSize="small" />}
                onClick={(e) => setTemplateAnchor(e.currentTarget)}
                sx={{ fontSize: 12, height: 30 }}
              >
                예제 템플릿
              </Button>
              <Menu
                anchorEl={templateAnchor}
                open={Boolean(templateAnchor)}
                onClose={() => setTemplateAnchor(null)}
              >
                {SQL_TEMPLATES.map((tmpl, idx) => (
                  <MenuItem
                    key={idx}
                    onClick={() => handleSelectTemplate(tmpl.query)}
                    sx={{ fontSize: 13 }}
                  >
                    {tmpl.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title="SQL 키워드 정리">
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

          <Tooltip title="지우기">
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
            sx={{ height: 32, px: 1.5, fontWeight: 'bold' }}
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
              sx={{ height: 32, px: 1.5, fontWeight: 'bold' }}
            >
              제출 & 채점
            </Button>
          )}
        </Box>
      </Box>

      {/* Editor Content Area */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'background.paper'),
          position: 'relative',
        }}
        onKeyDown={handleKeyDown}
      >
        <TextField
          fullWidth
          multiline
          placeholder="-- 여기에 SQL 쿼리를 작성하세요 (예: SELECT * FROM customers;)"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          inputRef={inputRef}
          slotProps={{
            input: {
              spellCheck: false,
            },
            htmlInput: {
              style: {
                fontFamily:
                  'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
                fontSize: '14px',
                lineHeight: 1.6,
                height: '100%',
                overflow: 'auto',
                boxSizing: 'border-box',
                padding: '16px',
              },
            },
          }}
          sx={{
            height: '100%',
            '& .MuiInputBase-root': {
              height: '100%',
              alignItems: 'flex-start',
              p: 0,
            },
            '& .MuiOutlinedInput-notchedOutline': {
              border: 'none',
            },
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
          단축키: <strong>Ctrl + Enter</strong> 또는 <strong>Cmd + Enter</strong>로 쿼리 실행
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: 11 }}>
          In-Memory SQLite Engine
        </Typography>
      </Box>
    </Card>
  );
}
