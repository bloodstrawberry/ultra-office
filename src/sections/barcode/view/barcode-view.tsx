'use client';

import { toast } from 'sonner';
import React, { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import WifiRoundedIcon from '@mui/icons-material/WifiRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import ViewWeekRoundedIcon from '@mui/icons-material/ViewWeekRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { renderQrCodeToCanvas, renderCode128ToCanvas } from '../utils/barcode-renderer';

export function BarcodeView() {
  const [currentTab, setCurrentTab] = useState<'qr' | 'barcode' | 'label'>('qr');

  // --------------------------------------------------------------------
  // Tab 1: QR Code State
  // --------------------------------------------------------------------
  const [qrType, setQrType] = useState<'url' | 'wifi' | 'text'>('url');
  const [qrUrl, setQrUrl] = useState<string>('https://github.com');
  const [wifiSsid, setWifiSsid] = useState<string>('Ultra_Office_5G');
  const [wifiPassword, setWifiPassword] = useState<string>('password1234');
  const [wifiType, setWifiType] = useState<string>('WPA');
  const [qrRawText, setQrRawText] = useState<string>('울트라 오피스 QR 코드');

  const [qrColor, setQrColor] = useState<string>('#1976d2');
  const [qrBgColor, setQrBgColor] = useState<string>('#ffffff');
  const [qrLogo, setQrLogo] = useState<string>('');

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute final QR content
  const getQrPayload = () => {
    if (qrType === 'url') return qrUrl;
    if (qrType === 'wifi') return `WIFI:T:${wifiType};S:${wifiSsid};P:${wifiPassword};;`;
    return qrRawText;
  };

  useEffect(() => {
    if (currentTab === 'qr' && qrCanvasRef.current) {
      renderQrCodeToCanvas(qrCanvasRef.current, getQrPayload(), {
        size: 280,
        color: qrColor,
        bgColor: qrBgColor,
        logoUrl: qrLogo,
      }).catch(() => {});
    }
  }, [
    currentTab,
    qrType,
    qrUrl,
    wifiSsid,
    wifiPassword,
    wifiType,
    qrRawText,
    qrColor,
    qrBgColor,
    qrLogo,
  ]);

  // --------------------------------------------------------------------
  // Tab 2: Barcode State
  // --------------------------------------------------------------------
  const [barcodeText, setBarcodeText] = useState<string>('UO-2026-8890');
  const [barcodeColor, setBarcodeColor] = useState<string>('#000000');
  const barcodeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (currentTab === 'barcode' && barcodeCanvasRef.current) {
      renderCode128ToCanvas(barcodeCanvasRef.current, barcodeText, {
        barWidth: 2,
        height: 90,
        color: barcodeColor,
        bgColor: '#ffffff',
      });
    }
  }, [currentTab, barcodeText, barcodeColor]);

  // --------------------------------------------------------------------
  // Tab 3: Label Sheet State
  // --------------------------------------------------------------------
  const [bulkCodes, setBulkCodes] = useState<string>(
    'UO-001\nUO-002\nUO-003\nUO-004\nUO-005\nUO-006'
  );

  const downloadCanvasImage = (canvas: HTMLCanvasElement | null, filename: string) => {
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('이미지가 다운로드되었습니다.');
  };

  return (
    <DashboardContent>
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          QR & 바코드 스튜디오 (Barcode Studio)
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          커스텀 QR 코드, Code128 바코드 생성 및 재고/물품 관리용 A4 라벨 인쇄를 지원합니다.
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
            label="1. 커스텀 QR 코드 생성기"
            value="qr"
            icon={<QrCode2RoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="2. Code128 바코드 생성기"
            value="barcode"
            icon={<ViewWeekRoundedIcon />}
            iconPosition="start"
          />
          <Tab
            label="3. 대량 바코드 · A4 라벨 인쇄"
            value="label"
            icon={<PrintRoundedIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Main Area */}
      <Box sx={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', pb: 3 }}>
        {/* TAB 1: QR CODE */}
        {currentTab === 'qr' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}
          >
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                QR 코드 유형 및 콘텐츠 설정
              </Typography>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  size="small"
                  variant={qrType === 'url' ? 'contained' : 'outlined'}
                  startIcon={<LinkRoundedIcon />}
                  onClick={() => setQrType('url')}
                >
                  웹사이트 URL
                </Button>
                <Button
                  size="small"
                  variant={qrType === 'wifi' ? 'contained' : 'outlined'}
                  startIcon={<WifiRoundedIcon />}
                  onClick={() => setQrType('wifi')}
                >
                  Wi-Fi 접속용
                </Button>
                <Button
                  size="small"
                  variant={qrType === 'text' ? 'contained' : 'outlined'}
                  onClick={() => setQrType('text')}
                >
                  일반 텍스트
                </Button>
              </Box>

              {qrType === 'url' && (
                <TextField
                  label="URL 주소"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://..."
                  fullWidth
                />
              )}

              {qrType === 'wifi' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Wi-Fi 이름 (SSID)"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                  />
                  <TextField
                    label="Wi-Fi 비밀번호"
                    value={wifiPassword}
                    onChange={(e) => setWifiPassword(e.target.value)}
                  />
                </Box>
              )}

              {qrType === 'text' && (
                <TextField
                  label="내용 텍스트"
                  multiline
                  rows={3}
                  value={qrRawText}
                  onChange={(e) => setQrRawText(e.target.value)}
                  fullWidth
                />
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    QR 색상:
                  </Typography>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    style={{
                      width: 36,
                      height: 32,
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    배경 색상:
                  </Typography>
                  <input
                    type="color"
                    value={qrBgColor}
                    onChange={(e) => setQrBgColor(e.target.value)}
                    style={{
                      width: 36,
                      height: 32,
                      border: 'none',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  />
                </Box>

                <Button
                  variant="outlined"
                  size="small"
                  component="label"
                  startIcon={<CloudUploadRoundedIcon />}
                >
                  중앙 로고 삽입
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setQrLogo(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </Button>
              </Box>
            </Card>

            {/* QR Preview Card */}
            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <canvas ref={qrCanvasRef} />
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => downloadCanvasImage(qrCanvasRef.current, 'custom_qr_code.png')}
                sx={{ fontWeight: 800, px: 4 }}
              >
                PNG 이미지로 다운로드
              </Button>
            </Card>
          </Box>
        )}

        {/* TAB 2: CODE128 BARCODE */}
        {currentTab === 'barcode' && (
          <Box
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 3 }}
          >
            <Card
              sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                Code128 바코드 텍스트 입력
              </Typography>
              <TextField
                label="바코드 번호 또는 품번"
                value={barcodeText}
                onChange={(e) => setBarcodeText(e.target.value)}
                placeholder="예: UO-123456"
                fullWidth
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  바코드 선 색상:
                </Typography>
                <input
                  type="color"
                  value={barcodeColor}
                  onChange={(e) => setBarcodeColor(e.target.value)}
                  style={{
                    width: 36,
                    height: 32,
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                />
              </Box>
            </Card>

            <Card
              sx={{
                p: 3,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Box
                sx={{
                  p: 2,
                  bgcolor: '#ffffff',
                  borderRadius: 2,
                  boxShadow: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflowX: 'auto',
                  maxWidth: '100%',
                }}
              >
                <canvas ref={barcodeCanvasRef} />
              </Box>

              <Button
                variant="contained"
                size="large"
                startIcon={<DownloadRoundedIcon />}
                onClick={() =>
                  downloadCanvasImage(barcodeCanvasRef.current, `barcode_${barcodeText}.png`)
                }
                sx={{ fontWeight: 800, px: 4 }}
              >
                바코드 이미지 저장
              </Button>
            </Card>
          </Box>
        )}

        {/* TAB 3: BULK LABEL PRINT */}
        {currentTab === 'label' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                  대량 바코드 라벨 목록 입력 (줄바꿈 구분)
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<PrintRoundedIcon />}
                  onClick={() => window.print()}
                  sx={{ fontWeight: 800 }}
                >
                  A4 라벨지 인쇄하기
                </Button>
              </Box>

              <TextField
                multiline
                rows={4}
                value={bulkCodes}
                onChange={(e) => setBulkCodes(e.target.value)}
                placeholder="코드를 줄바꿈으로 입력하세요..."
                fullWidth
              />
            </Card>

            {/* Print Grid Preview */}
            <Card sx={{ p: 4, bgcolor: '#ffffff', color: '#000000', borderRadius: 2 }}>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'gray', mb: 2, display: 'block' }}
              >
                A4 라벨 인쇄 미리보기 (인쇄 시 이 영역만 깔끔하게 출력됩니다):
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: 3,
                }}
              >
                {bulkCodes
                  .split('\n')
                  .map((code) => code.trim())
                  .filter(Boolean)
                  .map((code, idx) => (
                    <BulkBarcodeItem key={`${code}-${idx}`} code={code} />
                  ))}
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </DashboardContent>
  );
}

function BulkBarcodeItem({ code }: { code: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderCode128ToCanvas(canvasRef.current, code, {
        barWidth: 1.5,
        height: 60,
        color: '#000000',
        bgColor: '#ffffff',
      });
    }
  }, [code]);

  return (
    <Box
      sx={{
        p: 1.5,
        border: '1px dashed #999',
        borderRadius: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#ffffff',
      }}
    >
      <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
    </Box>
  );
}
