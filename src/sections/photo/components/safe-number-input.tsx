'use client';

import React, { useState, useEffect } from 'react';

interface SafeNumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: number;
  fallbackValue?: number;
  min?: number;
  max?: number;
  onChangeValue: (val: number) => void;
}

export function SafeNumberInput({
  value,
  fallbackValue = 0,
  min,
  max,
  onChangeValue,
  ...props
}: SafeNumberInputProps) {
  const [internalVal, setInternalVal] = useState<string>(String(value));

  useEffect(() => {
    setInternalVal(String(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInternalVal(raw);

    if (raw === '' || raw === '-') return;

    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed)) {
      let clamped = parsed;
      if (typeof min === 'number') clamped = Math.max(min, clamped);
      if (typeof max === 'number') clamped = Math.min(max, clamped);
      onChangeValue(clamped);
    }
  };

  const handleBlur = () => {
    if (internalVal === '' || internalVal === '-') {
      onChangeValue(fallbackValue);
      setInternalVal(String(fallbackValue));
      return;
    }
    const parsed = parseInt(internalVal, 10);
    if (Number.isNaN(parsed)) {
      onChangeValue(fallbackValue);
      setInternalVal(String(fallbackValue));
    } else {
      let clamped = parsed;
      if (typeof min === 'number') clamped = Math.max(min, clamped);
      if (typeof max === 'number') clamped = Math.min(max, clamped);
      onChangeValue(clamped);
      setInternalVal(String(clamped));
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      value={internalVal}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
