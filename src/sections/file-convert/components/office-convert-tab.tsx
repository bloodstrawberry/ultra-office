'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import SlideshowRoundedIcon from '@mui/icons-material/SlideshowRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { parseHwpxFile } from '../../hwp-master/utils/hwpx-parser';
import { generatePptxFile } from '../../doc-master/utils/pptx-generator';
import {
  convertExcelToCsv,
  convertExcelToJson,
  convertDataToExcelBlob,
} from '../../util/utils/excel-converter-utils';
import {
  exportToHtmlFile,
  exportMarkdownToDocx,
  exportToMarkdownFile,
} from '../../doc-master/utils/markdown-export-utils';

// ----------------------------------------------------------------------

export function OfficeConvertTab() {
  const [officeSubTool, setOfficeSubTool] = useState<'excel' | 'markdown' | 'hwpx' | 'pptx'>(
    'excel'
  );

  // Excel
  const [excelSubMode, setExcelSubMode] = useState<'excel2csv' | 'excel2json' | 'toExcel'>(
    'excel2csv'
  );
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [rawTableData, setRawTableData] = useState<string>(
    '이름,부서,직급,이메일\n홍길동,플랫폼개발팀,수석,hong@ultraoffice.com\n김영희,디자인실,책임,kim@ultraoffice.com\n이철수,경영지원팀,선임,lee@ultraoffice.com'
  );
  const [isOfficeLoading, setIsOfficeLoading] = useState<boolean>(false);

  // Markdown to Word / HTML
  const [markdownInput, setMarkdownInput] = useState<string>(
    `# 울트라 오피스 프로젝트 보고서\n\n## 1. 개요\n본 문서는 차세대 오피스 통합 플랫폼의 **변환 기능**을 설명합니다.\n\n- PDF 병합 및 분할\n- 엑셀 / CSV / JSON 상호 변환\n- 마크다운 DOCX / HTML 내보내기\n- 이미지 포맷 6종 일괄 변환\n\n### 2. 성능 지표\n| 항목 | 기존 | 울트라오피스 |\n| :--- | :--- | :--- |\n| 변환 속도 | 3.5s | **0.2s** |\n| 보안 | 서버 전송 | **100% 로컬 처리** |`
  );
  const [docTitle, setDocTitle] = useState<string>('울트라_오피스_보고서');

  // HWPX Extractor
  const [hwpxFile, setHwpxFile] = useState<File | null>(null);
  const [hwpxExtractedMd, setHwpxExtractedMd] = useState<string>('');
  const [hwpxExtractedTxt, setHwpxExtractedTxt] = useState<string>('');
  const [hwpxTablesCsv, setHwpxTablesCsv] = useState<string[]>([]);

  // PPTX Generator
  const [pptxTitle, setPptxTitle] = useState<string>('신규 서비스 런칭 전략');
  const [pptxOutline, setPptxOutline] = useState<string>(
    `# 1. 시장 환경 분석\n- 디지털 전환 가속화 및 오피스 도구 통합 수요 증가\n- 강력한 웹 기반 클라이언트 사이드 변환 엔진\n\n# 2. 핵심 기능 및 가치\n- 100% 클라이언트 로컬 처리로 데이터 유출 원천 차단\n- PDF, Office, 이미지, 개발자 데이터의 전방위적 포맷 변환 지원\n\n# 3. 향후 로드맵\n- AI 기반 자동 문서 요약 및 서식 스타일링 기능 고도화`
  );

  const copyToClipboard = (text: string, label = '복사되었습니다.') => {
    navigator.clipboard.writeText(text);
    toast.success(label);
  };

  const handleExcelToCsv = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      const { csv, sheetName } = await convertExcelToCsv(excelFile);
      const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], {
        type: 'text/csv;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sheetName}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('엑셀 파일이 CSV로 성공적으로 변환되었습니다.');
    } catch {
      toast.error('엑셀 변환에 실패했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleExcelToJson = async () => {
    if (!excelFile) {
      toast.error('엑셀 파일을 선택해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      const { json, sheetName } = await convertExcelToJson(excelFile);
      const blob = new Blob([JSON.stringify(json, null, 2)], {
        type: 'application/json;charset=utf-8;',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sheetName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('엑셀 파일이 JSON으로 성공적으로 변환되었습니다.');
    } catch {
      toast.error('JSON 변환에 실패했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleDataToExcel = () => {
    try {
      const blob = convertDataToExcelBlob(rawTableData, '데이터');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'converted_workbook.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('데이터가 엑셀(.xlsx) 파일로 생성되었습니다.');
    } catch {
      toast.error('엑셀 생성에 실패했습니다.');
    }
  };

  const handleMarkdownToDocx = async () => {
    if (!markdownInput.trim()) {
      toast.error('마크다운 내용을 입력해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      await exportMarkdownToDocx(markdownInput, docTitle, `${docTitle}.docx`);
      toast.success('MS Word(.docx) 문서가 성공적으로 생성되었습니다.');
    } catch {
      toast.error('Word 문서 변환에 실패했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleMarkdownToHtml = () => {
    if (!markdownInput.trim()) {
      toast.error('마크다운 내용을 입력해 주세요.');
      return;
    }
    try {
      const simpleHtml = markdownInput
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gim, '<em>$1</em>')
        .replace(/\n/gim, '<br />');
      exportToHtmlFile(simpleHtml, docTitle, `${docTitle}.html`);
      toast.success('HTML 웹 문서가 다운로드되었습니다.');
    } catch {
      toast.error('HTML 변환 실패');
    }
  };

  const handleHwpxUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setHwpxFile(file);
    setIsOfficeLoading(true);
    try {
      const parsed = await parseHwpxFile(file);
      setHwpxExtractedTxt(parsed.fullText);

      // Markdown format
      let md = `# ${parsed.title}\n\n`;
      parsed.sections.forEach((sec) => {
        sec.paragraphs.forEach((p) => {
          if (p.headingLevel === 1) md += `# ${p.text}\n\n`;
          else if (p.headingLevel === 2) md += `## ${p.text}\n\n`;
          else if (p.isBold) md += `**${p.text}**\n\n`;
          else md += `${p.text}\n\n`;
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
      setHwpxExtractedMd(md);

      // Tables to CSVs
      const csvs: string[] = [];
      parsed.sections.forEach((sec) => {
        sec.tables.forEach((tbl) => {
          const rows = tbl.rows.map((r) =>
            r.map((c) => `"${c.text.replace(/"/g, '""')}"`).join(',')
          );
          csvs.push(rows.join('\n'));
        });
      });
      setHwpxTablesCsv(csvs);

      toast.success(`한글 문서(${file.name}) 파싱이 완료되었습니다.`);
    } catch {
      toast.error('HWPX 파일 분석 중 오류가 발생했습니다.');
    } finally {
      setIsOfficeLoading(false);
    }
  };

  const handleGeneratePptx = async () => {
    if (!pptxOutline.trim()) {
      toast.error('슬라이드 개요 내용을 입력해 주세요.');
      return;
    }
    setIsOfficeLoading(true);
    try {
      const slidesData = pptxOutline
        .split(/(?=# \d+\.)|(?=# )/g)
        .filter((s) => s.trim().length > 0)
        .map((sec, idx) => {
          const lines = sec.trim().split('\n');
          const title = lines[0].replace(/^# \d+\.\s*|^#\s*/, '').trim() || `Slide ${idx + 1}`;
          const bullets = lines
            .slice(1)
            .map((l) => l.replace(/^[-*•]\s*/, '').trim())
            .filter((l) => l.length > 0);
          return {
            id: `slide_${idx + 1}`,
            title,
            layout: 'agenda' as const,
            bullets: bullets.length > 0 ? bullets : ['내용을 입력하세요.'],
          };
        });

      await generatePptxFile(
        {
          title: pptxTitle,
          author: 'Ultra Office User',
          company: 'Ultra Office AI',
          themeId: 'navy-tech',
          slides: slidesData,
        },
        `${pptxTitle}.pptx`
      );
      toast.success('PowerPoint(.pptx) 프레젠테이션이 생성되었습니다.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`PPTX 생성 실패: ${msg}`);
    } finally {
      setIsOfficeLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={officeSubTool === 'excel' ? 'contained' : 'outlined'}
          startIcon={<TableViewRoundedIcon />}
          onClick={() => setOfficeSubTool('excel')}
        >
          Excel ⇄ CSV · JSON
        </Button>
        <Button
          variant={officeSubTool === 'markdown' ? 'contained' : 'outlined'}
          startIcon={<DescriptionRoundedIcon />}
          onClick={() => setOfficeSubTool('markdown')}
        >
          Markdown ➔ Word(.docx) / HTML
        </Button>
        <Button
          variant={officeSubTool === 'hwpx' ? 'contained' : 'outlined'}
          startIcon={<DescriptionRoundedIcon />}
          onClick={() => setOfficeSubTool('hwpx')}
        >
          한글 문서(HWPX) ➔ MD / CSV / TXT
        </Button>
        <Button
          variant={officeSubTool === 'pptx' ? 'contained' : 'outlined'}
          startIcon={<SlideshowRoundedIcon />}
          onClick={() => setOfficeSubTool('pptx')}
        >
          텍스트 개요 ➔ PPTX 슬라이드
        </Button>
      </Box>

      {/* Office Subtool 1: Excel */}
      {officeSubTool === 'excel' && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant={excelSubMode === 'excel2csv' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubMode('excel2csv')}
            >
              Excel (.xlsx, .xls) ➔ CSV
            </Button>
            <Button
              size="small"
              variant={excelSubMode === 'excel2json' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubMode('excel2json')}
            >
              Excel (.xlsx, .xls) ➔ JSON
            </Button>
            <Button
              size="small"
              variant={excelSubMode === 'toExcel' ? 'contained' : 'outlined'}
              onClick={() => setExcelSubMode('toExcel')}
            >
              CSV / JSON ➔ Excel (.xlsx) 생성
            </Button>
          </Box>

          {(excelSubMode === 'excel2csv' || excelSubMode === 'excel2json') && (
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {excelSubMode === 'excel2csv'
                  ? 'Excel 파일 ➔ CSV 파일 변환'
                  : 'Excel 파일 ➔ JSON 구조화 변환'}
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<CloudUploadRoundedIcon />}
                sx={{
                  py: 3,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  borderRadius: 2,
                  fontWeight: 700,
                }}
              >
                엑셀 파일 (.xlsx, .xls) 업로드
                <input
                  type="file"
                  hidden
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) setExcelFile(e.target.files[0]);
                  }}
                />
              </Button>
              {excelFile && (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  선택된 파일: {excelFile.name} ({Math.round(excelFile.size / 1024)} KB)
                </Typography>
              )}
              <Button
                variant="contained"
                size="large"
                disabled={!excelFile || isOfficeLoading}
                onClick={excelSubMode === 'excel2csv' ? handleExcelToCsv : handleExcelToJson}
                startIcon={
                  isOfficeLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <DownloadRoundedIcon />
                  )
                }
                sx={{ py: 1.3, fontWeight: 800 }}
              >
                {isOfficeLoading ? '변환 중...' : '변환 및 다운로드'}
              </Button>
            </Card>
          )}

          {excelSubMode === 'toExcel' && (
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                CSV 문자열 또는 JSON 데이터 ➔ Excel (.xlsx) 파일 생성
              </Typography>
              <textarea
                value={rawTableData}
                onChange={(e) => setRawTableData(e.target.value)}
                placeholder="CSV 텍스트 또는 JSON 배열을 입력하세요..."
                style={{
                  width: '100%',
                  minHeight: 180,
                  padding: 12,
                  borderRadius: 8,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                }}
              />
              <Button
                variant="contained"
                color="success"
                size="large"
                disabled={!rawTableData.trim()}
                onClick={handleDataToExcel}
                startIcon={<DownloadRoundedIcon />}
                sx={{ py: 1.3, fontWeight: 800 }}
              >
                Excel (.xlsx) 파일로 내보내기
              </Button>
            </Card>
          )}
        </Box>
      )}

      {/* Office Subtool 2: Markdown */}
      {officeSubTool === 'markdown' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            마크다운(Markdown) 문서 ➔ MS Word (.docx) & HTML 웹 문서 변환
          </Typography>
          <TextField
            label="문서 제목 (Title)"
            value={docTitle}
            onChange={(e) => setDocTitle(e.target.value)}
            size="small"
          />
          <textarea
            value={markdownInput}
            onChange={(e) => setMarkdownInput(e.target.value)}
            placeholder="마크다운 문법을 입력하세요 (# 제목, ## 소제목, - 불릿, | 표 등)..."
            style={{
              width: '100%',
              minHeight: 220,
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--palette-divider, #e2e8f0)',
              backgroundColor: 'transparent',
              color: 'inherit',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          />
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              disabled={!markdownInput.trim() || isOfficeLoading}
              onClick={handleMarkdownToDocx}
              startIcon={
                isOfficeLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <DownloadRoundedIcon />
                )
              }
              sx={{ fontWeight: 800 }}
            >
              MS Word (.docx) 다운로드
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              disabled={!markdownInput.trim()}
              onClick={handleMarkdownToHtml}
              startIcon={<DownloadRoundedIcon />}
              sx={{ fontWeight: 800 }}
            >
              HTML 웹 문서 (.html) 다운로드
            </Button>
            <Button
              variant="outlined"
              onClick={() => exportToMarkdownFile(markdownInput, `${docTitle}.md`)}
            >
              .md 파일 저장
            </Button>
          </Box>
        </Card>
      )}

      {/* Office Subtool 3: HWPX Extractor */}
      {officeSubTool === 'hwpx' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            한글 문서 (.hwpx) ➔ Markdown / 표 데이터(CSV) / 본문 텍스트(TXT) 추출
          </Typography>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadRoundedIcon />}
            sx={{
              py: 3,
              borderStyle: 'dashed',
              borderWidth: 2,
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            한글 (.hwpx) 파일 업로드
            <input type="file" hidden accept=".hwpx" onChange={handleHwpxUpload} />
          </Button>
          {hwpxFile && (
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
              로드된 파일: {hwpxFile.name} ({Math.round(hwpxFile.size / 1024)} KB)
            </Typography>
          )}
          {hwpxExtractedTxt && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => {
                    const blob = new Blob([hwpxExtractedMd], {
                      type: 'text/markdown;charset=utf-8',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${hwpxFile?.name.replace(/\.[^/.]+$/, '') || 'hwp'}.md`;
                    a.click();
                    URL.revokeObjectURL(a.href);
                    toast.success('Markdown(.md) 파일이 다운로드되었습니다.');
                  }}
                >
                  Markdown(.md) 저장
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => copyToClipboard(hwpxExtractedTxt, '본문 텍스트가 복사되었습니다.')}
                >
                  본문 텍스트 복사
                </Button>
                {hwpxTablesCsv.length > 0 && (
                  <Button
                    size="small"
                    color="success"
                    variant="contained"
                    onClick={() => {
                      hwpxTablesCsv.forEach((csv, idx) => {
                        const blob = new Blob(['\uFEFF' + csv], {
                          type: 'text/csv;charset=utf-8',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `table_${idx + 1}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                      });
                      toast.success(`${hwpxTablesCsv.length}개 표가 CSV로 다운로드되었습니다.`);
                    }}
                  >
                    표 데이터 ({hwpxTablesCsv.length}개) CSV 다운로드
                  </Button>
                )}
              </Box>
              <textarea
                readOnly
                value={hwpxExtractedTxt}
                rows={8}
                style={{
                  width: '100%',
                  padding: 10,
                  borderRadius: 6,
                  border: '1px solid var(--palette-divider, #e2e8f0)',
                  backgroundColor: 'transparent',
                  color: 'inherit',
                }}
              />
            </Box>
          )}
        </Card>
      )}

      {/* Office Subtool 4: PPTX Generator */}
      {officeSubTool === 'pptx' && (
        <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            개요 텍스트 ➔ PowerPoint 프레젠테이션 (.pptx) 슬라이드 자동 생성
          </Typography>
          <TextField
            label="프레젠테이션 제목 (Title)"
            value={pptxTitle}
            onChange={(e) => setPptxTitle(e.target.value)}
            size="small"
          />
          <textarea
            value={pptxOutline}
            onChange={(e) => setPptxOutline(e.target.value)}
            placeholder="# 1. 슬라이드 제목&#10;- 불릿 항목 1&#10;- 불릿 항목 2"
            style={{
              width: '100%',
              minHeight: 200,
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--palette-divider, #e2e8f0)',
              backgroundColor: 'transparent',
              color: 'inherit',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            size="large"
            disabled={!pptxOutline.trim() || isOfficeLoading}
            onClick={handleGeneratePptx}
            startIcon={
              isOfficeLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SlideshowRoundedIcon />
              )
            }
            sx={{ py: 1.3, fontWeight: 800 }}
          >
            {isOfficeLoading
              ? 'PPTX 생성 중...'
              : 'PowerPoint (.pptx) 프레젠테이션 생성 및 다운로드'}
          </Button>
        </Card>
      )}
    </Box>
  );
}
