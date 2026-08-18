'use client';

import '@fortune-sheet/react/dist/index.css';

import type { Sheet } from '@fortune-sheet/core';
import type { WorkbookInstance } from '@fortune-sheet/react';
import type { FortuneSheetData } from './utils';
import type { FortuneSpreadsheetOptions } from './options';

import React, { forwardRef } from 'react';
import { Workbook } from '@fortune-sheet/react';

import Box from '@mui/material/Box';

import { DEFAULT_OPTIONS } from './options';

export interface FortuneSpreadsheetProps {
  data: FortuneSheetData[];
  onChange?: (data: FortuneSheetData[]) => void;
  options?: FortuneSpreadsheetOptions;
  height?: string | number;
  width?: string | number;
}

export const FortuneSpreadsheet = forwardRef<WorkbookInstance, FortuneSpreadsheetProps>(
  ({ data, onChange, options = {}, height = 'calc(100vh - 280px)', width = '100%' }, ref) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const handleWorkbookChange = onChange
      ? (workbookData: Sheet[]) => onChange(workbookData as unknown as FortuneSheetData[])
      : undefined;

    return (
      <Box
        sx={{
          height,
          width,
          bgcolor: 'background.paper',
          borderRadius: 2,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: (theme) => theme.customShadows?.card || '0px 4px 20px rgba(0, 0, 0, 0.05)',
          '& .fortune-sheet-container': {
            height: '100% !important',
          },
        }}
      >
        <Workbook
          ref={ref}
          data={data as unknown as Sheet[]}
          onChange={handleWorkbookChange}
          lang={mergedOptions.lang}
          showToolbar={mergedOptions.showToolbar}
          showFormulaBar={mergedOptions.showFormulaBar}
          showSheetTabs={mergedOptions.showSheetTabs}
          toolbarItems={mergedOptions.toolbarItems}
        />
      </Box>
    );
  }
);

FortuneSpreadsheet.displayName = 'FortuneSpreadsheet';
