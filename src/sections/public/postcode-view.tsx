'use client';

import type { Address } from 'react-daum-postcode';

import { useRef, useState } from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LocalPostOfficeRoundedIcon from '@mui/icons-material/LocalPostOfficeRounded';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export function PostcodeView() {
  const [open, setOpen] = useState(false);
  const [addressData, setAddressData] = useState({
    zonecode: '',
    roadAddress: '',
    jibunAddress: '',
    detailAddress: '',
  });

  const detailInputRef = useRef<HTMLInputElement>(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleComplete = (data: Address) => {
    let roadAddr = data.roadAddress;
    let extraRoadAddr = '';

    if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
      extraRoadAddr += data.bname;
    }
    if (data.buildingName !== '' && data.apartment === 'Y') {
      extraRoadAddr += extraRoadAddr !== '' ? `, ${data.buildingName}` : data.buildingName;
    }
    if (extraRoadAddr !== '') {
      roadAddr += ` (${extraRoadAddr})`;
    }

    setAddressData({
      zonecode: data.zonecode,
      roadAddress: roadAddr,
      jibunAddress: data.jibunAddress || data.autoJibunAddress || '',
      detailAddress: '',
    });

    handleClose();

    // Delay focus to ensure the modal transition finishes
    setTimeout(() => {
      detailInputRef.current?.focus();
    }, 100);
  };

  const handleDetailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData((prev) => ({
      ...prev,
      detailAddress: event.target.value,
    }));
  };

  const handleReset = () => {
    setAddressData({
      zonecode: '',
      roadAddress: '',
      jibunAddress: '',
      detailAddress: '',
    });
  };

  return (
    <DashboardContent maxWidth="lg">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        주소 검색 예시
      </Typography>

      <Stack spacing={3}>
        <Card>
          <CardHeader
            title="배송지 정보 입력"
            subheader="우편번호 검색 버튼을 눌러 주소를 검색하세요."
            avatar={<LocalPostOfficeRoundedIcon color="primary" />}
          />
          <CardContent>
            <Box
              component="form"
              noValidate
              autoComplete="off"
              sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}
            >
              {/* 우편번호 & 검색 버튼 */}
              <Box
                sx={{ gridColumn: '1 / -1', display: 'flex', gap: 1.5, alignItems: 'flex-start' }}
              >
                <TextField
                  label="우편번호"
                  value={addressData.zonecode}
                  slotProps={{
                    input: {
                      readOnly: true,
                    },
                  }}
                  variant="outlined"
                  sx={{ width: { xs: '120px', sm: '160px' } }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleOpen}
                  startIcon={<SearchRoundedIcon />}
                  sx={{ height: 56, px: 3 }}
                >
                  우편번호 검색
                </Button>
              </Box>

              {/* 도로명 주소 */}
              <TextField
                fullWidth
                label="도로명 주소"
                value={addressData.roadAddress}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                variant="outlined"
                sx={{ gridColumn: '1 / -1' }}
              />

              {/* 지번 주소 */}
              <TextField
                fullWidth
                label="지번 주소"
                value={addressData.jibunAddress}
                slotProps={{
                  input: {
                    readOnly: true,
                  },
                }}
                variant="outlined"
                sx={{ gridColumn: '1 / -1' }}
              />

              {/* 상세 주소 */}
              <TextField
                fullWidth
                inputRef={detailInputRef}
                label="상세 주소"
                placeholder="동, 호수 등 상세 주소를 입력하세요."
                value={addressData.detailAddress}
                onChange={handleDetailChange}
                variant="outlined"
                disabled={!addressData.roadAddress}
                sx={{ gridColumn: '1 / -1' }}
              />
            </Box>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ mt: 3 }}>
              <Button variant="outlined" color="inherit" onClick={handleReset}>
                초기화
              </Button>
              <Button
                variant="contained"
                color="secondary"
                disabled={!addressData.zonecode || !addressData.detailAddress}
                onClick={() => {
                  alert(
                    `입력된 주소:\n[${addressData.zonecode}] ${addressData.roadAddress} ${addressData.detailAddress}`
                  );
                }}
              >
                저장하기
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {addressData.zonecode && (
          <Card
            sx={{
              p: 3,
              bgcolor: 'background.neutral',
              border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
            }}
          >
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              [선택된 주소 정보 결과]
            </Typography>
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>우편번호:</strong> {addressData.zonecode}
              </Typography>
              <Typography variant="body2">
                <strong>도로명 주소:</strong> {addressData.roadAddress}
              </Typography>
              <Typography variant="body2">
                <strong>지번 주소:</strong> {addressData.jibunAddress}
              </Typography>
              <Typography variant="body2">
                <strong>상세 주소:</strong> {addressData.detailAddress || '(상세 주소 미입력)'}
              </Typography>
            </Stack>
          </Card>
        )}
      </Stack>

      {/* 우편번호 검색 모달 */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6" component="span">
            우편번호 검색
          </Typography>
          <Button onClick={handleClose} color="inherit" size="small">
            닫기
          </Button>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0, height: 450, overflow: 'hidden' }}>
          <DaumPostcodeEmbed
            onComplete={handleComplete}
            style={{ width: '100%', height: '100%' }}
          />
        </DialogContent>
      </Dialog>
    </DashboardContent>
  );
}
