'use client';

import type { ReceiptInfo, BusinessCardInfo } from '../utils/ocr-parser-utils';

import { toast } from 'sonner';
import { utils, write } from 'xlsx';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import TableViewRoundedIcon from '@mui/icons-material/TableViewRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import ContactPageRoundedIcon from '@mui/icons-material/ContactPageRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DocumentScannerRoundedIcon from '@mui/icons-material/DocumentScannerRounded';

import { useImageDropPaste } from 'src/hooks/use-image-drop-paste';

import { DashboardContent } from 'src/layouts/dashboard';

import {
  performOcr,
  parseReceiptText,
  parseBusinessCard,
  generateVCardString,
  exportTableToExcelBlob,
} from '../utils/ocr-parser-utils';

export function OcrScannerView() {
  const [currentTab, setCurrentTab] = useState<'receipt' | 'card' | 'table'>('receipt');

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);

  // Tab 1: Receipt Data
  const [receiptData, setReceiptData] = useState<ReceiptInfo | null>(null);

  // Tab 2: Business Card Data
  const [cardData, setCardData] = useState<BusinessCardInfo | null>(null);

  // Tab 3: Table Text Data
  const [rawOcrText, setRawOcrText] = useState<string>('');

  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setHasLoaded(true);
  }, []);

  const handleProcessImage = async (file: File) => {
    setImagePreview(URL.createObjectURL(file));
    setIsProcessing(true);
    setProgressPercent(0);

    try {
      const text = await performOcr(file, (p) => setProgressPercent(p));
      setRawOcrText(text);

      if (currentTab === 'receipt') {
        const parsed = parseReceiptText(text);
        setReceiptData(parsed);
        toast.success('영수증 정보가 성공적으로 추출되었습니다.');
      } else if (currentTab === 'card') {
        const parsed = parseBusinessCard(text);
        setCardData(parsed);
        toast.success('명함 정보가 성공적으로 분석되었습니다.');
      } else {
        toast.success('표 텍스트가 인식되었습니다.');
      }
    } catch {
      toast.error('OCR 텍스트 인식에 실패했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const imageDrop = useImageDropPaste({
    onFiles: (files) => {
      if (files[0]) handleProcessImage(files[0]);
    },
    multiple: false,
  });

  const handleDownloadReceiptExcel = () => {
    if (!receiptData) return;
    const data = [
      ['항목', '내용'],
      ['상호명', receiptData.storeName],
      ['사업자등록번호', receiptData.bizNumber],
      ['결제일자', receiptData.date],
      ['공급가액', receiptData.supplyAmount],
      ['부가세(VAT)', receiptData.taxAmount],
      ['합계금액', receiptData.totalAmount],
    ];
    const ws = utils.aoa_to_sheet(data);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, '지출내역');
    const buf = write(wb, { type: 'array', bookType: 'xlsx' });
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `영수증_${receiptData.storeName || '지출내역'}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('영수증 엑셀 파일이 다운로드되었습니다.');
  };

  const handleDownloadVCard = () => {
    if (!cardData) return;
    const vcardStr = generateVCardString(cardData);
    const blob = new Blob([vcardStr], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.name || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('연락처(.vcf) 파일이 다운로드되었습니다.');
  };

  const handleDownloadTableExcel = () => {
    if (!rawOcrText.trim()) return;
    const lines = rawOcrText.split('\n').filter((l) => l.trim().length > 0);
    const blob = exportTableToExcelBlob(lines);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ocr_extracted_table.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('표 엑셀 파일이 다운로드되었습니다.');
  };

  if (!hasLoaded) {
    return (
      <DashboardContent>
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}
        >
          <CircularProgress size={36} />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <DocumentScannerRoundedIcon sx={{ fontSize: 32, color: 'info.main' }} />
          스마트 OCR 스캐너 (Smart OCR Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          영수증, 명함, 표 이미지를 AI 광학 문자인식(OCR)으로 분석하여 엑셀 및 연락처 파일로 자동
          변환합니다.
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={currentTab}
          onChange={(_, val) => {
            setCurrentTab(val);
            setImagePreview(null);
            setReceiptData(null);
            setCardData(null);
            setRawOcrText('');
          }}
        >
          <Tab
            label="1. 영수증 · 지출결의서 스캔"
            value="receipt"
            icon={<ReceiptLongRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. 명함 스캔 (vCard 생성)"
            value="card"
            icon={<ContactPageRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 표(Table) 이미지 ➔ 엑셀 변환"
            value="table"
            icon={<TableViewRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 3 }}>
          {/* Left: Upload and Preview */}
          <Card
            {...imageDrop.getRootProps()}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              borderRadius: 2,
              border: imageDrop.isDragActive ? '2px dashed' : '1px solid',
              borderColor: imageDrop.isDragActive ? 'primary.main' : 'divider',
              bgcolor: imageDrop.isDragActive ? 'action.hover' : 'background.paper',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
              이미지 업로드 (드래그 & 드롭 / 붙여넣기 지원)
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
              사진 파일 선택 (JPG, PNG)
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleProcessImage(e.target.files[0]);
                }}
              />
            </Button>

            {isProcessing && (
              <Box sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    AI 문자인식 엔진 실행 중...
                  </Typography>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {progressPercent}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            )}

            {imagePreview && (
              <Box
                sx={{
                  width: '100%',
                  maxHeight: 400,
                  overflow: 'hidden',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: '#00000008',
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', maxHeight: 380, objectFit: 'contain' }}
                />
              </Box>
            )}
          </Card>

          {/* Right: Analysis Results */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* TAB 1: Receipt Results */}
            {currentTab === 'receipt' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    영수증 추출 데이터
                  </Typography>
                  {receiptData && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleDownloadReceiptExcel}
                    >
                      엑셀(.xlsx)로 내보내기
                    </Button>
                  )}
                </Box>

                {receiptData ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="상호명"
                      value={receiptData.storeName}
                      onChange={(e) =>
                        setReceiptData({ ...receiptData, storeName: e.target.value })
                      }
                      fullWidth
                    />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="사업자등록번호"
                        value={receiptData.bizNumber}
                        onChange={(e) =>
                          setReceiptData({ ...receiptData, bizNumber: e.target.value })
                        }
                      />
                      <TextField
                        label="결제 일자"
                        value={receiptData.date}
                        onChange={(e) => setReceiptData({ ...receiptData, date: e.target.value })}
                      />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2 }}>
                      <TextField
                        label="공급가액"
                        type="number"
                        value={receiptData.supplyAmount}
                        onChange={(e) =>
                          setReceiptData({ ...receiptData, supplyAmount: Number(e.target.value) })
                        }
                      />
                      <TextField
                        label="부가세(VAT)"
                        type="number"
                        value={receiptData.taxAmount}
                        onChange={(e) =>
                          setReceiptData({ ...receiptData, taxAmount: Number(e.target.value) })
                        }
                      />
                      <TextField
                        label="총 결제금액 (합계)"
                        type="number"
                        value={receiptData.totalAmount}
                        onChange={(e) =>
                          setReceiptData({ ...receiptData, totalAmount: Number(e.target.value) })
                        }
                        sx={{ input: { fontWeight: 800, color: 'primary.main' } }}
                      />
                    </Box>

                    <Typography variant="caption" sx={{ fontWeight: 700, mt: 1 }}>
                      원문 텍스트:
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      value={receiptData.rawText}
                      onChange={(e) => setReceiptData({ ...receiptData, rawText: e.target.value })}
                      fullWidth
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}
                  >
                    영수증 사진을 업로드하면 항목들이 자동으로 추출됩니다.
                  </Typography>
                )}
              </Card>
            )}

            {/* TAB 2: Business Card Results */}
            {currentTab === 'card' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    명함 추출 인적사항
                  </Typography>
                  {cardData && (
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleDownloadVCard}
                    >
                      연락처(vCard) 다운로드
                    </Button>
                  )}
                </Box>

                {cardData ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="이름"
                        value={cardData.name}
                        onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      />
                      <TextField
                        label="회사명"
                        value={cardData.company}
                        onChange={(e) => setCardData({ ...cardData, company: e.target.value })}
                      />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <TextField
                        label="부서 / 직함"
                        value={cardData.department}
                        onChange={(e) => setCardData({ ...cardData, department: e.target.value })}
                      />
                      <TextField
                        label="휴대폰 / 연락처"
                        value={cardData.phone}
                        onChange={(e) => setCardData({ ...cardData, phone: e.target.value })}
                      />
                    </Box>
                    <TextField
                      label="이메일"
                      value={cardData.email}
                      onChange={(e) => setCardData({ ...cardData, email: e.target.value })}
                      fullWidth
                    />
                    <TextField
                      label="회사 주소"
                      value={cardData.address}
                      onChange={(e) => setCardData({ ...cardData, address: e.target.value })}
                      fullWidth
                    />
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}
                  >
                    명함 사진을 업로드하면 성명, 회사, 연락처가 파싱됩니다.
                  </Typography>
                )}
              </Card>
            )}

            {/* TAB 3: Table Results */}
            {currentTab === 'table' && (
              <Card
                sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
              >
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    인식된 표 텍스트 데이터
                  </Typography>
                  {rawOcrText && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ContentCopyRoundedIcon />}
                        onClick={() => {
                          navigator.clipboard.writeText(rawOcrText);
                          toast.success('클립보드에 복사되었습니다.');
                        }}
                      >
                        복사
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<DownloadRoundedIcon />}
                        onClick={handleDownloadTableExcel}
                      >
                        엑셀(.xlsx) 생성
                      </Button>
                    </Box>
                  )}
                </Box>

                {rawOcrText ? (
                  <TextField
                    multiline
                    rows={12}
                    value={rawOcrText}
                    onChange={(e) => setRawOcrText(e.target.value)}
                    placeholder="인식된 표 텍스트가 여기에 표시됩니다."
                    fullWidth
                    sx={{ fontFamily: 'monospace' }}
                  />
                ) : (
                  <Typography
                    variant="body2"
                    sx={{ color: 'text.secondary', textAlign: 'center', py: 6 }}
                  >
                    표 이미지를 업로드하면 텍스트가 추출되어 엑셀로 내보낼 수 있습니다.
                  </Typography>
                )}
              </Card>
            )}
          </Box>
        </Box>
      </Box>
    </DashboardContent>
  );
}
