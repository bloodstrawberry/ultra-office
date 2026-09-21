'use client';

import type { DataPoint2D } from '../types';

import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import TableContainer from '@mui/material/TableContainer';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import CasinoRoundedIcon from '@mui/icons-material/CasinoRounded';
import ClearAllRoundedIcon from '@mui/icons-material/ClearAllRounded';
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';

// ----------------------------------------------------------------------

interface MlSpreadsheetEditorProps {
  points: DataPoint2D[];
  onChange: (newPoints: DataPoint2D[]) => void;
  taskType: 'regression' | 'classification' | 'clustering' | 'pca';
  maxHeight?: number | string;
}

export function MlSpreadsheetEditor({
  points,
  onChange,
  taskType,
  maxHeight = 460,
}: MlSpreadsheetEditorProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pasteDialogOpen, setPasteDialogOpen] = useState(false);
  const [pasteText, setPasteText] = useState('');

  // 1. Add Row
  const handleAddRow = () => {
    const lastPoint = points[points.length - 1];
    const newX = lastPoint ? Number((lastPoint.x + 0.5).toFixed(2)) : 0;
    const newY = lastPoint ? Number((lastPoint.y + 0.5).toFixed(2)) : 0;
    const newPt: DataPoint2D = {
      id: `pt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      x: newX,
      y: newY,
      label: 0,
    };
    onChange([...points, newPt]);
  };

  // 2. Delete Row
  const handleDeleteRow = (id: string) => {
    onChange(points.filter((p) => p.id !== id));
  };

  // 3. Cell Edit
  const handleCellChange = (id: string, field: 'x' | 'y' | 'label', value: number) => {
    onChange(
      points.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          [field]: value,
        };
      })
    );
  };

  // 4. CSV File Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      parseAndApplyData(text);
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // 5. Parse CSV or TSV string
  const parseAndApplyData = (raw: string) => {
    const lines = raw.trim().split(/\r?\n/);
    const newPoints: DataPoint2D[] = [];

    lines.forEach((line, idx) => {
      // Split by tab or comma
      const parts = line.includes('\t') ? line.split('\t') : line.split(',').map((p) => p.trim());

      const num1 = parseFloat(parts[0]);
      const num2 = parseFloat(parts[1]);
      const labelVal = parts[2] !== undefined ? parseInt(parts[2], 10) : 0;

      // Skip header row if parsing fails
      if (!Number.isNaN(num1) && !Number.isNaN(num2)) {
        newPoints.push({
          id: `csv-${idx}-${Date.now()}`,
          x: Number(num1.toFixed(2)),
          y: Number(num2.toFixed(2)),
          label: Number.isNaN(labelVal) ? 0 : labelVal,
        });
      }
    });

    if (newPoints.length > 0) {
      onChange(newPoints);
    }
  };

  // 6. CSV File Download
  const handleDownloadCsv = () => {
    if (points.length === 0) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (taskType === 'regression') {
      csvContent += 'X,Y\n';
      points.forEach((p) => {
        csvContent += `${p.x},${p.y}\n`;
      });
    } else {
      csvContent += 'X1,X2,Label\n';
      points.forEach((p) => {
        csvContent += `${p.x},${p.y},${p.label ?? 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ml_dataset_${taskType}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. Add Random Noise to all points
  const handleAddNoise = () => {
    onChange(
      points.map((p) => ({
        ...p,
        x: Number((p.x + (Math.random() * 0.5 - 0.25)).toFixed(2)),
        y: Number((p.y + (Math.random() * 0.5 - 0.25)).toFixed(2)),
      }))
    );
  };

  // 8. Inject 1 Outlier
  const handleInjectOutlier = () => {
    const newPt: DataPoint2D = {
      id: `outlier-${Date.now()}`,
      x: Number((Math.random() * 6 - 3).toFixed(2)),
      y: Number((Math.random() > 0.5 ? 5.5 : -5.5).toFixed(2)),
      label: Math.random() > 0.5 ? 1 : 0,
    };
    onChange([...points, newPt]);
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: typeof maxHeight === 'number' ? maxHeight : 440,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.tsv,.txt"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Spreadsheet Toolbar */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.25,
          bgcolor: 'background.neutral',
          borderBottom: '1px solid',
          borderColor: 'divider',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            📋 데이터 스프레드시트 (총 {points.length}행)
          </Typography>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddRow}
            sx={{ fontWeight: 700 }}
          >
            행 추가
          </Button>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.75 }}>
          <Tooltip title="로컬 CSV 파일 업로드">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileUploadRoundedIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ fontWeight: 700 }}
            >
              CSV 업로드
            </Button>
          </Tooltip>

          <Tooltip title="현재 데이터셋 CSV 파일로 저장">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadRoundedIcon />}
              onClick={handleDownloadCsv}
              sx={{ fontWeight: 700 }}
            >
              CSV 저장
            </Button>
          </Tooltip>

          <Tooltip title="엑셀 / 구글 시트에서 복사한 데이터 붙여넣기">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<ContentPasteRoundedIcon />}
              onClick={() => setPasteDialogOpen(true)}
              sx={{ fontWeight: 700 }}
            >
              붙여넣기
            </Button>
          </Tooltip>

          <Tooltip title="전체 데이터에 미세 가우시안 노이즈 주입">
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<CasinoRoundedIcon />}
              onClick={handleAddNoise}
              sx={{ fontWeight: 700 }}
            >
              노이즈 추가
            </Button>
          </Tooltip>

          <Tooltip title="극단적인 이상치(Outlier) 1개 주입">
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={handleInjectOutlier}
              sx={{ fontWeight: 700 }}
            >
              +이상치
            </Button>
          </Tooltip>

          <Tooltip title="전체 행 삭제">
            <IconButton size="small" color="error" onClick={() => onChange([])}>
              <ClearAllRoundedIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Spreadsheet Table Viewport */}
      <TableContainer sx={{ flex: '1 1 auto', maxHeight: 420, overflowY: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60, fontWeight: 800, bgcolor: 'background.paper' }}>
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper' }}>
                {taskType === 'regression' ? 'X (독립 변수)' : 'X₁ (특성 1)'}
              </TableCell>
              <TableCell sx={{ fontWeight: 800, bgcolor: 'background.paper' }}>
                {taskType === 'regression' ? 'Y (종속 변수)' : 'X₂ (특성 2)'}
              </TableCell>
              {taskType === 'classification' && (
                <TableCell sx={{ width: 140, fontWeight: 800, bgcolor: 'background.paper' }}>
                  클래스 (Label)
                </TableCell>
              )}
              {taskType === 'clustering' && (
                <TableCell sx={{ width: 120, fontWeight: 800, bgcolor: 'background.paper' }}>
                  할당 군집
                </TableCell>
              )}
              <TableCell sx={{ width: 60, textAlign: 'center', bgcolor: 'background.paper' }}>
                동작
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {points.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={taskType === 'classification' || taskType === 'clustering' ? 5 : 4}
                  sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}
                >
                  데이터가 없습니다. [행 추가] 버튼을 누르거나 캔버스를 클릭하여 데이터를
                  추가하세요.
                </TableCell>
              </TableRow>
            ) : (
              points.map((pt, index) => (
                <TableRow
                  key={pt.id}
                  hover
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  {/* Row index */}
                  <TableCell sx={{ color: 'text.disabled', fontWeight: 600 }}>
                    {index + 1}
                  </TableCell>

                  {/* X Value */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={pt.x}
                      onChange={(e) =>
                        handleCellChange(pt.id, 'x', parseFloat(e.target.value) || 0)
                      }
                      slotProps={{ htmlInput: { step: '0.1' } }}
                      sx={{
                        width: 110,
                        '& .MuiOutlinedInput-input': { py: 0.5, px: 1, fontFamily: 'monospace' },
                      }}
                    />
                  </TableCell>

                  {/* Y Value */}
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      value={pt.y}
                      onChange={(e) =>
                        handleCellChange(pt.id, 'y', parseFloat(e.target.value) || 0)
                      }
                      slotProps={{ htmlInput: { step: '0.1' } }}
                      sx={{
                        width: 110,
                        '& .MuiOutlinedInput-input': { py: 0.5, px: 1, fontFamily: 'monospace' },
                      }}
                    />
                  </TableCell>

                  {/* Class Label for Classification */}
                  {taskType === 'classification' && (
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          size="small"
                          label="0 (Blue)"
                          color={pt.label === 0 ? 'primary' : 'default'}
                          variant={pt.label === 0 ? 'filled' : 'outlined'}
                          onClick={() => handleCellChange(pt.id, 'label', 0)}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 700,
                            height: 24,
                            fontSize: '0.6875rem',
                          }}
                        />
                        <Chip
                          size="small"
                          label="1 (Red)"
                          color={pt.label === 1 ? 'error' : 'default'}
                          variant={pt.label === 1 ? 'filled' : 'outlined'}
                          onClick={() => handleCellChange(pt.id, 'label', 1)}
                          sx={{
                            cursor: 'pointer',
                            fontWeight: 700,
                            height: 24,
                            fontSize: '0.6875rem',
                          }}
                        />
                      </Box>
                    </TableCell>
                  )}

                  {/* Cluster Tag for Clustering */}
                  {taskType === 'clustering' && (
                    <TableCell>
                      {pt.isNoise ? (
                        <Chip
                          size="small"
                          label="노이즈"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.6875rem' }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          label={`Cluster ${(pt.cluster ?? 0) + 1}`}
                          color="primary"
                          variant="soft"
                          sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700 }}
                        />
                      )}
                    </TableCell>
                  )}

                  {/* Delete Button */}
                  <TableCell sx={{ textAlign: 'center' }}>
                    <IconButton size="small" color="error" onClick={() => handleDeleteRow(pt.id)}>
                      <DeleteRoundedIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paste Dialog */}
      <Dialog
        open={pasteDialogOpen}
        onClose={() => setPasteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>📋 엑셀 / CSV 클립보드 붙여넣기</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5 }}>
            엑셀, 구글 스프레드시트 또는 텍스트 에디터에서 복사한 데이터를 아래 텍스트 영역에
            붙여넣으세요. (행마다 줄바꿈, 열은 탭 또는 쉼표로 구분: 예시: <code>1.5, 3.2</code> 또는{' '}
            <code>-2.0\t4.5\t1</code>)
          </Typography>
          <TextField
            multiline
            rows={8}
            fullWidth
            placeholder={`1.2\t3.5\n-0.8\t1.4\n2.5\t5.8`}
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            sx={{ fontFamily: 'monospace' }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setPasteDialogOpen(false)} color="inherit">
            취소
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              parseAndApplyData(pasteText);
              setPasteDialogOpen(false);
              setPasteText('');
            }}
            disabled={!pasteText.trim()}
            sx={{ fontWeight: 700 }}
          >
            데이터 적용하기
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
