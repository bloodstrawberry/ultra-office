import React from 'react';

import {
  Select,
  Checkbox,
  MenuItem,
  InputLabel,
  FormControl,
  ListItemText,
  OutlinedInput,
} from '@mui/material';

import { LANGUAGE_OPTIONS, LANGUAGE_LABEL_MAP } from './constants';

interface Props {
  value: string[];
  onChange: (langs: string[]) => void;
  disabled?: boolean;
}

export function LanguageSelect({ value, onChange, disabled }: Props) {
  return (
    <FormControl size="small" sx={{ minWidth: 200 }}>
      <InputLabel id="language-select-label">인식 언어 (다중 선택)</InputLabel>
      <Select
        labelId="language-select-label"
        multiple
        value={value}
        label="인식 언어 (다중 선택)"
        onChange={(e) =>
          onChange(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)
        }
        disabled={disabled}
        input={<OutlinedInput label="인식 언어 (다중 선택)" />}
        renderValue={(selected) => selected.map((v) => LANGUAGE_LABEL_MAP[v] || v).join(', ')}
      >
        {LANGUAGE_OPTIONS.map(({ value: val, label }) => (
          <MenuItem key={val} value={val}>
            <Checkbox checked={value.indexOf(val) > -1} />
            <ListItemText primary={label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
