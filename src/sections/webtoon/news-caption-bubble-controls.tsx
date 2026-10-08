'use client';

import type {
  CaptionElement,
  NewsCaptionConfig,
} from 'src/sections/photo/utils/news-caption-presets';

import React from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Slider from '@mui/material/Slider';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

interface Props {
  config: NewsCaptionConfig;
  onChange: (config: NewsCaptionConfig) => void;
}

function NumberSlider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = '',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption">{label}</Typography>
        <Typography variant="caption">
          {value}
          {suffix}
        </Typography>
      </Box>
      <Slider
        size="small"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(_, next) => onChange(next as number)}
      />
    </Box>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Typography variant="caption">{label}</Typography>
      <input
        type="color"
        aria-label={label}
        value={/^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'}
        onChange={(event) => onChange(event.target.value)}
      />
    </Box>
  );
}

export function NewsCaptionBubbleControls({ config, onChange }: Props) {
  const selected =
    config.elements.find((element) => element.id === config.selectedElementId) ||
    config.elements[0];
  const updateElement = (id: string, patch: Partial<CaptionElement>) =>
    onChange({
      ...config,
      elements: config.elements.map((element) =>
        element.id === id ? { ...element, ...patch } : element
      ),
    });
  const updateSelected = (patch: Partial<CaptionElement>) => {
    if (selected) updateElement(selected.id, patch);
  };
  const addElement = () => {
    const id = crypto.randomUUID();
    onChange({
      ...config,
      elements: [
        ...config.elements,
        {
          id,
          type: 'custom',
          name: `추가 자막 ${config.elements.length + 1}`,
          text: '새 자막',
          x: 0.5,
          y: 0.65,
          align: 'center',
          fontSize: 32,
          fontWeight: 'bold',
          outlineWidth: 2,
          outlineColor: '#000000',
          textColor: '#ffffff',
          fontFamily: 'gothic',
          visible: true,
        },
      ],
      selectedElementId: id,
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        방송 자막 레이어
      </Typography>
      <Button size="small" variant="outlined" onClick={addElement}>
        + 새 자막 추가
      </Button>
      {config.elements.map((element) => (
        <Box key={element.id} sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
          <Button
            size="small"
            fullWidth
            variant={selected?.id === element.id ? 'contained' : 'outlined'}
            onClick={() => onChange({ ...config, selectedElementId: element.id })}
            sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
          >
            {element.name}: {element.text.slice(0, 16)}
          </Button>
          <Button
            size="small"
            onClick={() => updateElement(element.id, { visible: !element.visible })}
          >
            {element.visible ? '숨김' : '표시'}
          </Button>
          {element.isDeletable !== false && (
            <Button
              size="small"
              color="error"
              onClick={() =>
                onChange({
                  ...config,
                  elements: config.elements.filter((item) => item.id !== element.id),
                  selectedElementId:
                    element.id === selected?.id ? 'headline' : selected?.id || null,
                })
              }
            >
              삭제
            </Button>
          )}
        </Box>
      ))}
      {selected && (
        <>
          <Divider />
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {selected.name} 편집
          </Typography>
          <TextField
            size="small"
            multiline
            minRows={2}
            fullWidth
            label="자막 문구"
            value={selected.text}
            onChange={(event) => updateSelected({ text: event.target.value })}
          />
          <Select
            size="small"
            fullWidth
            value={selected.fontFamily}
            onChange={(event) =>
              updateSelected({ fontFamily: event.target.value as CaptionElement['fontFamily'] })
            }
            inputProps={{ 'aria-label': '자막 서체' }}
          >
            <MenuItem value="myeongjo">명조 / 바탕</MenuItem>
            <MenuItem value="gothic">고딕 / 산세리프</MenuItem>
            <MenuItem value="retro">복고 / 굴림</MenuItem>
            <MenuItem value="impact">임팩트 볼드</MenuItem>
          </Select>
          <Select
            size="small"
            fullWidth
            value={selected.fontWeight}
            onChange={(event) =>
              updateSelected({ fontWeight: event.target.value as CaptionElement['fontWeight'] })
            }
            inputProps={{ 'aria-label': '자막 굵기' }}
          >
            <MenuItem value="normal">보통</MenuItem>
            <MenuItem value="bold">굵게</MenuItem>
            <MenuItem value="800">매우 굵게</MenuItem>
            <MenuItem value="900">블랙</MenuItem>
          </Select>
          <Select
            size="small"
            fullWidth
            value={selected.align}
            onChange={(event) =>
              updateSelected({ align: event.target.value as CaptionElement['align'] })
            }
            inputProps={{ 'aria-label': '자막 정렬' }}
          >
            <MenuItem value="left">왼쪽</MenuItem>
            <MenuItem value="center">가운데</MenuItem>
            <MenuItem value="right">오른쪽</MenuItem>
          </Select>
          <NumberSlider
            label="글자 크기"
            value={selected.fontSize}
            min={16}
            max={72}
            suffix="px"
            onChange={(fontSize) => updateSelected({ fontSize })}
          />
          <NumberSlider
            label="외곽선 굵기"
            value={selected.outlineWidth}
            min={0}
            max={12}
            step={0.2}
            suffix="px"
            onChange={(outlineWidth) => updateSelected({ outlineWidth })}
          />
          <NumberSlider
            label="가로 위치"
            value={Math.round(selected.x * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(x) => updateSelected({ x: x / 100 })}
          />
          <NumberSlider
            label="세로 위치"
            value={Math.round(selected.y * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(y) => updateSelected({ y: y / 100 })}
          />
          <ColorInput
            label="글자색"
            value={selected.textColor}
            onChange={(textColor) => updateSelected({ textColor })}
          />
          <ColorInput
            label="외곽선색"
            value={selected.outlineColor}
            onChange={(outlineColor) => updateSelected({ outlineColor })}
          />
        </>
      )}
      <Divider />
      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
        방송 화면 연출
      </Typography>
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.enableLetterbox}
            onChange={(event) => onChange({ ...config, enableLetterbox: event.target.checked })}
          />
        }
        label="레터박스"
      />
      {config.enableLetterbox && (
        <NumberSlider
          label="레터박스 높이"
          value={config.letterboxSize}
          min={5}
          max={20}
          suffix="%"
          onChange={(letterboxSize) => onChange({ ...config, letterboxSize })}
        />
      )}
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.enableVignette}
            onChange={(event) => onChange({ ...config, enableVignette: event.target.checked })}
          />
        }
        label="하단 비네팅"
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.showStationLogo}
            onChange={(event) => onChange({ ...config, showStationLogo: event.target.checked })}
          />
        }
        label="방송국 / 타이틀 로고"
      />
      <FormControlLabel
        control={
          <Switch
            size="small"
            checked={config.showLiveBadge}
            onChange={(event) => onChange({ ...config, showLiveBadge: event.target.checked })}
          />
        }
        label="LIVE 배지"
      />
      <NumberSlider
        label="자막 아래쪽 여백"
        value={config.bottomOffset}
        min={0}
        max={30}
        suffix="%"
        onChange={(bottomOffset) => {
          const delta = (config.bottomOffset - bottomOffset) / 100;
          onChange({
            ...config,
            bottomOffset,
            elements: config.elements.map((element) =>
              element.y > 0.5
                ? { ...element, y: Math.max(0.05, Math.min(0.98, element.y + delta)) }
                : element
            ),
          });
        }}
      />
      <NumberSlider
        label="전체 글자 크기"
        value={config.fontSizeScale}
        min={0.6}
        max={1.6}
        step={0.05}
        onChange={(fontSizeScale) => onChange({ ...config, fontSizeScale })}
      />
      <ColorInput
        label="배너 색상"
        value={config.bannerColor}
        onChange={(bannerColor) => onChange({ ...config, bannerColor })}
      />
      <ColorInput
        label="강조 색상"
        value={config.accentColor}
        onChange={(accentColor) => onChange({ ...config, accentColor })}
      />
    </Box>
  );
}
