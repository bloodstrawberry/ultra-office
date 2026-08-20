'use client';

import type { BatchItemData } from '../types';

import JSZip from 'jszip';
import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { downloadFile } from '../utils/docx-generator';
import { WORD_TEMPLATES } from '../data/document-templates';
import { buildDocxFromTemplate } from '../utils/docx-template-engine';

// ----------------------------------------------------------------------

const SAMPLE_BATCH_DATA: BatchItemData[] = [
  {
    id: 'row-1',
    recipient_name: '김철수',
    recipient_birth: '1995.03.15',
    course_name: 'Next.js 풀스택 마스터 과정',
    cert_number: 'UO-2026-001',
    training_period: '2026.06.01 ~ 2026.08.20',
    issuer_org: '한국 SW 혁신원',
    issuer_ceo: '홍길동',
    issue_date: '2026.08.20',
  },
  {
    id: 'row-2',
    recipient_name: '이영희',
    recipient_birth: '1997.08.24',
    course_name: 'Next.js 풀스택 마스터 과정',
    cert_number: 'UO-2026-002',
    training_period: '2026.06.01 ~ 2026.08.20',
    issuer_org: '한국 SW 혁신원',
    issuer_ceo: '홍길동',
    issue_date: '2026.08.20',
  },
  {
    id: 'row-3',
    recipient_name: '박민수',
    recipient_birth: '1992.11.02',
    course_name: 'Next.js 풀스택 마스터 과정',
    cert_number: 'UO-2026-003',
    training_period: '2026.06.01 ~ 2026.08.20',
    issuer_org: '한국 SW 혁신원',
    issuer_ceo: '홍길동',
    issue_date: '2026.08.20',
  },
  {
    id: 'row-4',
    recipient_name: '정하나',
    recipient_birth: '1999.01.19',
    course_name: 'Next.js 풀스택 마스터 과정',
    cert_number: 'UO-2026-004',
    training_period: '2026.06.01 ~ 2026.08.20',
    issuer_org: '한국 SW 혁신원',
    issuer_ceo: '홍길동',
    issue_date: '2026.08.20',
  },
];

export function BatchGenerator() {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('certificate-award');
  const [rows, setRows] = useState<BatchItemData[]>(SAMPLE_BATCH_DATA);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const activeTemplate =
    WORD_TEMPLATES.find((t) => t.id === selectedTemplateId) || WORD_TEMPLATES[2];

  const handleAddRow = () => {
    const newId = `row-${Date.now()}`;
    const newRow: BatchItemData = {
      id: newId,
      recipient_name: '홍길순',
      recipient_birth: '1996.12.05',
      course_name: 'Next.js 풀스택 마스터 과정',
      cert_number: `UO-2026-00${rows.length + 1}`,
      training_period: '2026.06.01 ~ 2026.08.20',
      issuer_org: '한국 SW 혁신원',
      issuer_ceo: '홍길동',
      issue_date: '2026.08.20',
    };
    setRows((prev) => [...prev, newRow]);
    toast.success('새 수신자 행이 추가되었습니다.');
  };

  const handleRemoveRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleBatchGenerate = async () => {
    if (rows.length === 0) {
      toast.warning('생성할 데이터 행이 없습니다.');
      return;
    }

    try {
      setIsProcessing(true);
      setProgress(10);
      const zip = new JSZip();

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const blob = await buildDocxFromTemplate(activeTemplate, row);
        const name = row.recipient_name || row.employee_name || `document_${i + 1}`;
        const fileName = `${activeTemplate.title}_${name}.docx`;

        zip.file(fileName, blob);
        setProgress(Math.round(((i + 1) / rows.length) * 85));
      }

      setProgress(95);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipName = `${activeTemplate.title}_대량생성_${rows.length}건.zip`;
      downloadFile(zipBlob, zipName);

      setProgress(100);
      toast.success(`${rows.length}건의 문서가 압축된 '${zipName}' 파일이 다운로드되었습니다!`);
    } catch (err) {
      console.error(err);
      toast.error('대량 문서 일괄 생성 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        height: '100%',
      }}
    >
      {/* Top Header & Actions */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
          <FolderZipRoundedIcon color="primary" />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              대량 문서 일괄 생성기 (Batch Hub)
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              CSV/데이터셋을 주입하여 수십~수백 개의 개인화된 Word 문서를 ZIP 압축 파일로 일괄
              생성합니다.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1.5 }}>
          <Select
            size="small"
            value={selectedTemplateId}
            onChange={(e) => setSelectedTemplateId(e.target.value)}
            sx={{ minWidth: 200, height: 38 }}
          >
            {WORD_TEMPLATES.map((tmpl) => (
              <MenuItem key={tmpl.id} value={tmpl.id}>
                {tmpl.title}
              </MenuItem>
            ))}
          </Select>

          <Button
            size="small"
            variant="outlined"
            startIcon={<AddRoundedIcon fontSize="small" />}
            onClick={handleAddRow}
            sx={{ textTransform: 'none', borderRadius: 1.5 }}
          >
            행 추가
          </Button>

          <Button
            variant="contained"
            color="primary"
            startIcon={<FolderZipRoundedIcon />}
            onClick={handleBatchGenerate}
            disabled={isProcessing || rows.length === 0}
            sx={{ fontWeight: 700, borderRadius: 1.5 }}
          >
            {isProcessing
              ? `일괄 생성 중 (${progress}%)...`
              : `전체 ${rows.length}건 ZIP 일괄 발급`}
          </Button>
        </Box>
      </Card>

      {/* Progress Bar when processing */}
      {isProcessing && (
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ height: 6, borderRadius: 1 }}
        />
      )}

      {/* Data Table */}
      <Card
        sx={{
          flexGrow: 1,
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral', width: 60 }}>
                  No.
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                  수신자 성명
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                  생년월일
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                  증서/계약 번호
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                  과정/직무명
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral' }}>
                  발급 기관
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: 'background.neutral', width: 80 }}>
                  삭제
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>{idx + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {row.recipient_name || row.employee_name}
                  </TableCell>
                  <TableCell>{row.recipient_birth || row.employee_birth}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace' }}>
                    {row.cert_number || row.contract_date}
                  </TableCell>
                  <TableCell>{row.course_name || row.position}</TableCell>
                  <TableCell>{row.issuer_org || row.company_name}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleRemoveRow(row.id)}>
                      <DeleteOutlineRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
}
