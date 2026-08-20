'use client';

import React from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';

import type { HwpDocument } from '../types';

// ----------------------------------------------------------------------

interface HwpExtractorProps {
  document: HwpDocument;
}

export function HwpExtractor({ document }: HwpExtractorProps) {
  const copyText = (text: string, label: string = '텍스트가 복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleDownloadMarkdown = () => {
    let md = `# ${document.title}\n\n`;
    document.sections.forEach((sec) => {
      sec.paragraphs.forEach((p) => {
        if (p.headingLevel === 1) {
          md += `# ${p.text}\n\n`;
        } else if (p.headingLevel === 2) {
          md += `## ${p.text}\n\n`;
        } else if (p.isBold) {
          md += `**${p.text}**\n\n`;
        } else {
          md += `${p.text}\n\n`;
        }
      });

      sec.tables.forEach((tbl) => {
        if (tbl.caption) md += `**[${tbl.caption}]**\n\n`;
        if (tbl.rows.length > 0) {
          const header = tbl.rows[0].map((c) => c.text || ' ').join(' | ');
          const sep = tbl.rows[0].map(() => '---').join(' | ');
          md += `| ${header} |\n| ${sep} |\n`;
          tbl.rows.slice(1).forEach((r) => {
            md += `| ${r.map((c) => c.text || ' ').join(' | ')} |\n`;
          });
          md += '\n';
        }
      });
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title || 'hwp_document'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('마크다운(.md) 파일이 다운로드되었습니다.');
  };

  const handleDownloadTableCsv = (tableIndex: number) => {
    let currentIdx = 0;
    let targetTable = null;
    for (const sec of document.sections) {
      for (const tbl of sec.tables) {
        if (currentIdx === tableIndex) {
          targetTable = tbl;
          break;
        }
        currentIdx++;
      }
      if (targetTable) break;
    }

    if (!targetTable) {
      toast.error('선택한 표를 찾을 수 없습니다.');
      return;
    }

    const dataMatrix = targetTable.rows.map((row) => row.map((c) => c.text));
    const csvString = Papa.unparse(dataMatrix);
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `table_${tableIndex + 1}_${document.title || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`표 ${tableIndex + 1}이 CSV 파일로 다운로드되었습니다.`);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 1 }}>
      {/* 1. Full text extraction */}
      <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              본문 텍스트 전체 추출 ({document.totalParagraphs}개 문단)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              한글 문서 내 모든 텍스트를 줄바꿈 서식을 유지하며 클립보드에 복사하거나 Markdown
              파일로 저장합니다.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<ContentCopyRoundedIcon />}
              onClick={() => copyText(document.fullText)}
            >
              텍스트 복사
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<DownloadRoundedIcon />}
              onClick={handleDownloadMarkdown}
            >
              Markdown(.md) 저장
            </Button>
          </Box>
        </Box>

        <TextField
          multiline
          rows={12}
          value={document.fullText}
          fullWidth
          slotProps={{
            input: {
              readOnly: true,
              sx: { fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: 1.6 },
            },
          }}
        />
      </Card>

      {/* 2. Tables extraction */}
      {document.totalTables > 0 && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            문서 내 포함된 표(Table) 데이터 개별 추출 ({document.totalTables}개 표)
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            한글 문서 속 복잡한 표 서식을 엑셀에서 바로 열 수 있는 CSV 파일로 즉시 변환합니다.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: 2,
              mt: 1,
            }}
          >
            {(() => {
              let tCount = 0;
              const cards: React.ReactNode[] = [];
              document.sections.forEach((sec) => {
                sec.tables.forEach((tbl) => {
                  const idx = tCount++;
                  cards.push(
                    <Card
                      key={tbl.id}
                      variant="outlined"
                      sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800, color: 'primary.main' }}
                        >
                          {tbl.caption || `표 ${idx + 1}`} ({tbl.rows.length}행 x{' '}
                          {tbl.rows[0]?.length || 0}열)
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<TableViewRoundedIcon />}
                          onClick={() => handleDownloadTableCsv(idx)}
                        >
                          CSV 다운로드
                        </Button>
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                      >
                        첫 번째 행: {tbl.rows[0]?.map((c) => c.text).join(' | ') || '데이터 없음'}
                      </Typography>
                    </Card>
                  );
                });
              });
              return cards;
            })()}
          </Box>
        </Card>
      )}
    </Box>
  );
}
