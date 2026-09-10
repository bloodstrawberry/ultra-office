import type { NonogramLayout, NonogramOcrResult } from '../utils/nonogram-ocr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export function splitNonogramClueLines(text: string, count: number): string[] {
  const lines = text.split('\n');
  return Array.from({ length: count }, (_, index) => lines[index] || '');
}

function splitClueNumbers(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

function createClueSlots(line: string, count: number): string[] {
  const numbers = splitClueNumbers(line).slice(-count);
  return [...Array(Math.max(0, count - numbers.length)).fill(''), ...numbers];
}

function normalizeClueNumber(value: string): string {
  const normalized = value.replace(/[^\d?]/g, '');
  if (normalized.includes('?')) return '?';
  return normalized.slice(0, 2);
}

export function NonogramOcrEditableTable({
  result,
  layout,
  reference,
  selected,
  disabled,
  onEdit,
  onSelect,
}: {
  result: NonogramOcrResult;
  layout: NonogramLayout;
  reference?: NonogramOcrResult;
  selected: boolean;
  disabled: boolean;
  onEdit: (axis: 'rows' | 'cols', index: number, value: string) => void;
  onSelect: () => void;
}) {
  const rowLines = splitNonogramClueLines(result.rows, layout.rows);
  const colLines = splitNonogramClueLines(result.cols, layout.cols);
  const referenceRows = reference ? splitNonogramClueLines(reference.rows, layout.rows) : [];
  const referenceCols = reference ? splitNonogramClueLines(reference.cols, layout.cols) : [];
  const rowClueSlots = Math.ceil(layout.cols / 2);
  const colClueSlots = Math.ceil(layout.rows / 2);
  const cellSize = layout.cols > 20 || layout.rows > 20 ? 22 : 27;
  const differs =
    rowLines.filter((line, index) => line !== referenceRows[index]).length +
    colLines.filter((line, index) => line !== referenceCols[index]).length;

  const editCell = (axis: 'rows' | 'cols', lineIndex: number, slotIndex: number, value: string) => {
    const slotCount = axis === 'rows' ? rowClueSlots : colClueSlots;
    const line = axis === 'rows' ? rowLines[lineIndex] : colLines[lineIndex];
    const slots = createClueSlots(line, slotCount);
    slots[slotIndex] = normalizeClueNumber(value);
    onEdit(axis, lineIndex, slots.filter(Boolean).join(' ') || '?');
  };

  const clueInput = (
    axis: 'rows' | 'cols',
    lineIndex: number,
    slotIndex: number,
    value: string,
    changed: boolean
  ) => (
    <Box
      key={`${axis}-${lineIndex}-${slotIndex}`}
      sx={{
        borderRight: axis === 'rows' && slotIndex === rowClueSlots - 1 ? '2px solid' : '1px solid',
        borderBottom: axis === 'cols' && slotIndex === colClueSlots - 1 ? '2px solid' : '1px solid',
        borderColor: 'divider',
        bgcolor: changed ? 'info.lighter' : value === '?' ? 'warning.lighter' : 'background.paper',
      }}
    >
      <Box
        component="input"
        aria-label={`${result.name} ${axis === 'rows' ? '행' : '열'} ${lineIndex + 1} 단서 ${slotIndex + 1}`}
        inputMode="numeric"
        value={value}
        disabled={disabled}
        onChange={(event) => editCell(axis, lineIndex, slotIndex, event.target.value)}
        sx={{
          width: '100%',
          height: '100%',
          p: 0,
          border: 0,
          outline: 0,
          bgcolor: 'transparent',
          color: 'text.primary',
          textAlign: 'center',
          fontSize: cellSize <= 22 ? 10 : 12,
          fontWeight: 800,
          lineHeight: 1,
          '&:focus': {
            bgcolor: 'primary.lighter',
            boxShadow: 'inset 0 0 0 2px',
            color: 'primary.main',
          },
        }}
      />
    </Box>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.5,
        minWidth: Math.max(390, (rowClueSlots + layout.cols) * cellSize + 26),
        height: 'fit-content',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? 'primary.main' : 'divider',
        boxShadow: selected ? 4 : 0,
        flexShrink: 0,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {result.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            신뢰도 {result.confidence}% · {(result.duration / 1000).toFixed(1)}초
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
          <Chip
            size="small"
            color={result.errors.length ? 'warning' : 'success'}
            label={result.errors.length ? `확인 필요 ${result.errors.length}건` : '단서 검증 정상'}
          />
          {reference && reference.id !== result.id && (
            <Typography variant="caption" color={differs ? 'info.main' : 'success.main'}>
              {differs ? `기준 모델과 ${differs}줄 다름` : '기준 모델과 동일'}
            </Typography>
          )}
        </Box>
      </Box>

      {result.rows && result.cols ? (
        <Box sx={{ overflow: 'auto', pb: 0.5 }}>
          <Box
            aria-label={`${result.name} 단서 편집표`}
            sx={{
              width: 'fit-content',
              display: 'grid',
              gridTemplateColumns: `repeat(${rowClueSlots + layout.cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${colClueSlots + layout.rows}, ${cellSize}px)`,
              borderTop: '1px solid',
              borderLeft: '1px solid',
              borderColor: 'divider',
            }}
          >
            {Array.from({ length: colClueSlots }, (unusedRow, clueRow) => [
              ...Array.from({ length: rowClueSlots }, (unusedCol, clueCol) => (
                <Box
                  key={`corner-${clueRow}-${clueCol}`}
                  sx={{
                    borderRight: clueCol === rowClueSlots - 1 ? '2px solid' : '1px solid',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.neutral',
                  }}
                />
              )),
              ...colLines.map((line, col) => {
                const slots = createClueSlots(line, colClueSlots);
                return clueInput(
                  'cols',
                  col,
                  clueRow,
                  slots[clueRow],
                  !!reference && line !== referenceCols[col]
                );
              }),
            ])}

            {rowLines.map((line, row) => {
              const slots = createClueSlots(line, rowClueSlots);
              return [
                ...slots.map((value, clueCol) =>
                  clueInput('rows', row, clueCol, value, !!reference && line !== referenceRows[row])
                ),
                ...Array.from({ length: layout.cols }, (_, col) => (
                  <Box
                    key={`cell-${row}-${col}`}
                    sx={{
                      borderRight: '1px solid',
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      bgcolor: (row + col) % 2 ? 'transparent' : 'action.hover',
                    }}
                  />
                )),
              ];
            })}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.7 }}>
            숫자 한 칸씩 직접 수정 · 행 단서는 오른쪽 정렬 · 열 단서는 아래쪽 정렬
          </Typography>
        </Box>
      ) : (
        <Alert severity="error">{result.errors[0] || '숫자를 인식하지 못했습니다.'}</Alert>
      )}

      {result.errors.length > 0 && result.rows && (
        <Alert severity="warning" sx={{ mt: 1, py: 0 }}>
          {result.errors[0]}
        </Alert>
      )}
      <Button
        fullWidth
        size="small"
        sx={{ mt: 1, fontWeight: 800 }}
        variant={selected ? 'contained' : 'outlined'}
        disabled={!result.rows || disabled}
        onClick={onSelect}
      >
        {selected ? '✓ 이 표를 적용 대상으로 선택함' : '이 표를 적용 대상으로 선택'}
      </Button>
    </Card>
  );
}
