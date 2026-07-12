import React from 'react';

import SettingsIcon from '@mui/icons-material/Settings';
import {
  Box,
  Stack,
  Button,
  Select,
  Slider,
  Tooltip,
  Popover,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  IconButton,
  FormControl,
} from '@mui/material';

import { PSM_OPTIONS, OEM_OPTIONS } from './constants';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OcrSettings {
  psm: string;
  oem: string;
  whitelist: string;
  useGrayscale: boolean;
  contrast: number;
  threshold: number;
}

interface Props {
  settings: OcrSettings;
  onChange: (patch: Partial<OcrSettings>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function OcrSettingsPopover({ settings, onChange }: Props) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  return (
    <>
      <Tooltip title="고급 설정">
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 320, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            인식 정밀 설정
          </Typography>

          {/* ── 이미지 전처리 ── */}
          <Divider>이미지 전처리</Divider>

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption">흑백 변환</Typography>
              <Checkbox
                size="small"
                checked={settings.useGrayscale}
                onChange={(e) => onChange({ useGrayscale: e.target.checked })}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              대비를 높이기 위해 이미지를 회색조로 변경합니다.
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption">대비 (Contrast): {settings.contrast}%</Typography>
            <Slider
              size="small"
              value={settings.contrast}
              min={-100}
              max={200}
              onChange={(_, v) => onChange({ contrast: v as number })}
            />
          </Box>

          <Box>
            <Typography variant="caption">임계값 (Thresholding): {settings.threshold}</Typography>
            <Slider
              size="small"
              value={settings.threshold}
              min={-100}
              max={100}
              onChange={(_, v) => onChange({ threshold: v as number })}
            />
            <Typography variant="caption" color="text.secondary">
              배경과 문자를 확실히 구분합니다. (이진화)
            </Typography>
          </Box>

          {/* ── 엔진 설정 ── */}
          <Divider>엔진 설정</Divider>

          <FormControl size="small" fullWidth>
            <InputLabel id="psm-label">페이지 세그먼트 모드(PSM)</InputLabel>
            <Select
              labelId="psm-label"
              value={settings.psm}
              label="페이지 세그먼트 모드(PSM)"
              onChange={(e) => onChange({ psm: e.target.value })}
            >
              {PSM_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="oem-label">OCR 엔진 모드 (OEM)</InputLabel>
            <Select
              labelId="oem-label"
              value={settings.oem}
              label="OCR 엔진 모드 (OEM)"
              onChange={(e) => onChange({ oem: e.target.value })}
            >
              {OEM_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            fullWidth
            label="추출 문자 제한 (Whitelist)"
            placeholder="예: 0123456789"
            value={settings.whitelist}
            onChange={(e) => onChange({ whitelist: e.target.value })}
          />

          <Button variant="contained" size="small" onClick={() => setAnchorEl(null)}>
            설정 완료
          </Button>
        </Box>
      </Popover>
    </>
  );
}
