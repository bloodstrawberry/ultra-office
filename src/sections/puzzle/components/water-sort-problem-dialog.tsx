'use client';

import { useState, type ChangeEvent } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { WATER_COLORS, TUBE_CAPACITY, type WaterColorDef } from '../utils/water-sort-solver';

interface Props {
  initialTubes: number[][];
  initialColors: Record<number, WaterColorDef>;
  initialName: string;
  onClose: () => void;
  onApply: (problem: {
    name: string;
    tubes: number[][];
    colors: Record<number, WaterColorDef>;
    balanced: boolean;
  }) => void;
}

export function WaterSortProblemDialog({
  initialTubes,
  initialColors,
  initialName,
  onClose,
  onApply,
}: Props) {
  const [name, setName] = useState(initialName || '직접 만든 문제');
  const [tubes, setTubes] = useState(() => initialTubes.map((tube) => [...tube]));
  const [colors, setColors] = useState<Record<number, WaterColorDef>>(() => ({ ...initialColors }));
  const [selectedColor, setSelectedColor] = useState<number>(
    Object.keys(initialColors).length ? Number(Object.keys(initialColors)[0]) : 1
  );
  const [newColor, setNewColor] = useState('#ff6b6b');

  const counts = tubes.flat().reduce<Record<number, number>>((result, id) => {
    result[id] = (result[id] || 0) + 1;
    return result;
  }, {});
  const balanced = Object.values(counts).every((count) => count === TUBE_CAPACITY);
  const hasWater = tubes.some((tube) => tube.length > 0);

  const editLayer = (tubeIndex: number, layerIndex: number) => {
    setTubes((previous) =>
      previous.map((tube, index) => {
        if (index !== tubeIndex) return tube;
        const next = [...tube];
        if (selectedColor === 0) {
          if (layerIndex < next.length) next.splice(layerIndex, 1);
        } else if (layerIndex < next.length) {
          next[layerIndex] = selectedColor;
        } else if (layerIndex === next.length) {
          next.push(selectedColor);
        }
        return next;
      })
    );
  };

  const addColor = () => {
    const existing = Object.values(colors).find(
      (color) => color.color.toLowerCase() === newColor.toLowerCase()
    );
    if (existing) {
      setSelectedColor(existing.id);
      return;
    }
    const id = Math.max(0, ...Object.keys(colors).map(Number)) + 1;
    setColors((previous) => ({
      ...previous,
      [id]: {
        id,
        name: `사용자 색상 ${id}`,
        color: newColor,
        gradient: `linear-gradient(105deg, ${newColor} 0%, ${newColor} 100%)`,
      },
    }));
    setSelectedColor(id);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Water Sort 문제 수정 / 만들기</DialogTitle>
      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="문제 이름"
          size="small"
          value={name}
          onChange={(event) => setName(event.target.value)}
          inputProps={{ maxLength: 60 }}
        />
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button variant="outlined" size="small" onClick={() => setTubes([[], [], []])}>
            빈 문제에서 시작
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setTubes([[1, 2, 1, 2], [2, 1, 2, 1], [], []]);
              setColors(WATER_COLORS);
              setSelectedColor(1);
            }}
          >
            예시 문제
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={tubes.length >= 20}
            onClick={() => setTubes((previous) => [...previous, []])}
          >
            빈 시험관 추가
          </Button>
        </Box>
        <Divider />
        <Typography variant="subtitle2">색상 선택</Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Button
            size="small"
            variant={selectedColor === 0 ? 'contained' : 'outlined'}
            color="inherit"
            onClick={() => setSelectedColor(0)}
          >
            지우기
          </Button>
          {Object.values(colors).map((color) => (
            <Box
              component="button"
              type="button"
              key={color.id}
              title={`${color.name} (${counts[color.id] || 0}칸)`}
              aria-label={`${color.name} 선택`}
              onClick={() => setSelectedColor(color.id)}
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: color.color,
                border: selectedColor === color.id ? '3px solid #fff' : '1px solid #999',
                outline: selectedColor === color.id ? '2px solid #222' : 'none',
                cursor: 'pointer',
              }}
            />
          ))}
          <Box
            component="input"
            type="color"
            value={newColor}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setNewColor(event.target.value)}
            aria-label="새 색상"
            sx={{ width: 42, height: 36, cursor: 'pointer' }}
          />
          <Button size="small" onClick={addColor}>
            색 추가
          </Button>
        </Box>
        <Typography variant="caption" color="text.secondary">
          색을 고른 뒤 시험관을 아래에서 위로 채우세요. 지우기를 선택하면 클릭한 칸을 제거합니다.
        </Typography>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            p: 2,
            bgcolor: 'action.hover',
            borderRadius: 2,
          }}
        >
          {tubes.map((tube, tubeIndex) => (
            <Box
              key={tubeIndex}
              sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '2px solid',
                  borderColor: 'text.secondary',
                  borderTop: 'none',
                  borderRadius: '0 0 15px 15px',
                  overflow: 'hidden',
                }}
              >
                {Array.from({ length: TUBE_CAPACITY }, (_, index) => TUBE_CAPACITY - index - 1).map(
                  (layerIndex) => (
                    <Box
                      component="button"
                      type="button"
                      key={layerIndex}
                      title={`시험관 ${tubeIndex + 1}, 아래에서 ${layerIndex + 1}번째 칸`}
                      aria-label={`시험관 ${tubeIndex + 1}, 아래에서 ${layerIndex + 1}번째 칸`}
                      onClick={() => editLayer(tubeIndex, layerIndex)}
                      sx={{
                        width: 43,
                        height: 32,
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,.3)',
                        bgcolor: tube[layerIndex]
                          ? colors[tube[layerIndex]]?.color
                          : 'background.paper',
                        cursor: 'pointer',
                        '&:hover': { opacity: 0.7 },
                      }}
                    />
                  )
                )}
              </Box>
              <Typography variant="caption">#{tubeIndex + 1}</Typography>
              <Button
                size="small"
                color="error"
                disabled={tubes.length <= 2}
                onClick={() =>
                  setTubes((previous) => previous.filter((_, index) => index !== tubeIndex))
                }
                sx={{ minWidth: 0, fontSize: 11 }}
              >
                삭제
              </Button>
            </Box>
          ))}
        </Box>
        <Chip
          size="small"
          color={balanced ? 'success' : 'warning'}
          label={balanced ? '색상별 4칸 조건 충족' : '색상별 칸 수가 다름: 자동 풀이 불가'}
          sx={{ alignSelf: 'flex-start' }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button
          variant="contained"
          disabled={!hasWater || !name.trim()}
          onClick={() => onApply({ name: name.trim(), tubes, colors, balanced })}
        >
          이 배치로 문제 시작
        </Button>
      </DialogActions>
    </Dialog>
  );
}
