'use client';

import type { InvoiceForm, InvoiceItem } from '../types';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

// ----------------------------------------------------------------------

interface QuickInvoiceFormProps {
  currentStampUrl?: string;
}

const INITIAL_FORM: InvoiceForm = {
  title: '견 적 서',
  docNumber: 'EST-2026-0820',
  issueDate: new Date().toISOString().slice(0, 10),
  supplierName: '주식회사 울트라오피스',
  supplierBizNo: '123-45-67890',
  supplierCeo: '홍 길 동',
  supplierAddr: '서울특별시 강남구 테헤란로 123',
  supplierTel: '02-1234-5678',
  customerName: '주식회사 글로벌파트너스 귀하',
  items: [
    {
      id: '1',
      name: 'Ultra Office AI 라이선스 구축',
      spec: 'Enterprise 1식',
      qty: 1,
      price: 3500000,
      amount: 3500000,
    },
    {
      id: '2',
      name: '사내 보안 및 무설치 커스터마이징',
      spec: '1식',
      qty: 1,
      price: 1500000,
      amount: 1500000,
    },
  ],
  supplyAmount: 5000000,
  taxAmount: 500000,
  totalAmount: 5500000,
  remarks: '유효기간: 견적일로부터 30일 이내 / VAT 포함가',
};

export function QuickInvoiceForm({ currentStampUrl }: QuickInvoiceFormProps) {
  const [form, setForm] = useState<InvoiceForm>(INITIAL_FORM);

  const calculateTotals = (items: InvoiceItem[]) => {
    const supply = items.reduce((acc, cur) => acc + cur.price * cur.qty, 0);
    const tax = Math.round(supply * 0.1);
    return { supply, tax, total: supply + tax };
  };

  const handleItemChange = (id: string, field: keyof InvoiceItem, val: string | number) => {
    setForm((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, [field]: val };
        if (field === 'qty' || field === 'price') {
          next.amount = Number(next.qty) * Number(next.price);
        }
        return next;
      });
      const totals = calculateTotals(updatedItems);
      return {
        ...prev,
        items: updatedItems,
        supplyAmount: totals.supply,
        taxAmount: totals.tax,
        totalAmount: totals.total,
      };
    });
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      name: '신규 품목',
      spec: '규격',
      qty: 1,
      price: 100000,
      amount: 100000,
    };
    setForm((prev) => {
      const items = [...prev.items, newItem];
      const totals = calculateTotals(items);
      return {
        ...prev,
        items,
        supplyAmount: totals.supply,
        taxAmount: totals.tax,
        totalAmount: totals.total,
      };
    });
  };

  const handleDeleteItem = (id: string) => {
    setForm((prev) => {
      const items = prev.items.filter((i) => i.id !== id);
      const totals = calculateTotals(items);
      return {
        ...prev,
        items,
        supplyAmount: totals.supply,
        taxAmount: totals.tax,
        totalAmount: totals.total,
      };
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 1. Header Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>서식 양식</InputLabel>
            <Select
              value={form.title}
              label="서식 양식"
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            >
              <MenuItem value="견 적 서">견 적 서</MenuItem>
              <MenuItem value="거 래 명 세 서">거 래 명 세 서</MenuItem>
              <MenuItem value="간 이 영 수 증">간 이 영 수 증</MenuItem>
              <MenuItem value="청 구 서">청 구 서</MenuItem>
            </Select>
          </FormControl>
          <TextField
            size="small"
            label="문서 번호"
            value={form.docNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, docNumber: e.target.value }))}
          />
        </Box>

        <Button
          variant="contained"
          startIcon={<PrintRoundedIcon />}
          onClick={handlePrint}
          sx={{ fontWeight: 800 }}
        >
          A4 서식 인쇄 / PDF 출력
        </Button>
      </Box>

      {/* 2. Printable A4 Paper Invoice Sheet */}
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Card
          sx={{
            width: '100%',
            maxWidth: 820,
            p: { xs: 3, sm: 5 },
            bgcolor: '#ffffff',
            color: '#1e293b',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            borderRadius: 1.5,
            border: '1px solid #cbd5e1',
          }}
        >
          {/* Document Title Header */}
          <Box sx={{ textAlign: 'center', mb: 3, borderBottom: '3px double #0f172a', pb: 1.5 }}>
            <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '0.4em' }}>
              {form.title}
            </Typography>
          </Box>

          {/* Supplier and Customer Info Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
              gap: 3,
              mb: 3,
            }}
          >
            {/* Customer Box */}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 1 }}
            >
              <TextField
                variant="standard"
                label="수신처 (고객사)"
                value={form.customerName}
                onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                InputProps={{ sx: { fontSize: '1.2rem', fontWeight: 800 } }}
              />
              <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary', mt: 1 }}>
                아래와 같이 견적(발행)합니다.
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 1 }}>
                합계금액: ₩{form.totalAmount.toLocaleString()} (VAT포함)
              </Typography>
            </Box>

            {/* Supplier Box with Seal Stamping Slot */}
            <Box
              sx={{ border: '1.5px solid #334155', p: 1.5, borderRadius: 0, position: 'relative' }}
            >
              <Typography
                variant="caption"
                sx={{ fontWeight: 800, color: '#334155', display: 'block', mb: 1 }}
              >
                [ 공급자 정보 ]
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr',
                  rowGap: 0.8,
                  fontSize: '13px',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  등록번호
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {form.supplierBizNo}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  상호/법인명
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {form.supplierName}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  대표자
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {form.supplierCeo} (인)
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  사업장주소
                </Typography>
                <Typography variant="caption">{form.supplierAddr}</Typography>
              </Box>

              {/* Mounted Stamp Overlay */}
              {currentStampUrl && (
                <Box
                  sx={{
                    position: 'absolute',
                    right: 20,
                    top: 25,
                    width: 75,
                    height: 75,
                    pointerEvents: 'none',
                  }}
                >
                  <img
                    src={currentStampUrl}
                    alt="Seal"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>
              )}
            </Box>
          </Box>

          {/* Item Details Table */}
          <TableContainer sx={{ border: '1.5px solid #0f172a', mb: 2 }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, borderRight: '1px solid #cbd5e1' }}>
                    품목명
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800, borderRight: '1px solid #cbd5e1', width: 120 }}>
                    규격
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, borderRight: '1px solid #cbd5e1', width: 70 }}
                  >
                    수량
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, borderRight: '1px solid #cbd5e1', width: 120 }}
                  >
                    단가
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontWeight: 800, borderRight: '1px solid #cbd5e1', width: 130 }}
                  >
                    공급가액
                  </TableCell>
                  <TableCell align="center" sx={{ width: 40 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {form.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell sx={{ borderRight: '1px solid #e2e8f0', p: 0.5 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { fontSize: '13px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ borderRight: '1px solid #e2e8f0', p: 0.5 }}>
                      <TextField
                        variant="standard"
                        fullWidth
                        value={item.spec || ''}
                        onChange={(e) => handleItemChange(item.id, 'spec', e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { fontSize: '13px' } }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: '1px solid #e2e8f0', p: 0.5 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleItemChange(item.id, 'qty', Number(e.target.value))}
                        InputProps={{
                          disableUnderline: true,
                          sx: { fontSize: '13px', textAlign: 'right' },
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ borderRight: '1px solid #e2e8f0', p: 0.5 }}>
                      <TextField
                        variant="standard"
                        type="number"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', Number(e.target.value))}
                        InputProps={{
                          disableUnderline: true,
                          sx: { fontSize: '13px', textAlign: 'right' },
                        }}
                      />
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ borderRight: '1px solid #e2e8f0', fontWeight: 700, fontSize: '13px' }}
                    >
                      ₩{item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell align="center" sx={{ p: 0.5 }}>
                      <IconButton size="small" onClick={() => handleDeleteItem(item.id)}>
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={handleAddItem}
            sx={{ mb: 3 }}
          >
            품목 항목 추가
          </Button>

          {/* Bottom Remarks & Summary */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 240px',
              gap: 2,
              borderTop: '2px solid #0f172a',
              pt: 2,
            }}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.5 }}
              >
                비고 사항
              </Typography>
              <TextField
                multiline
                rows={2}
                fullWidth
                size="small"
                value={form.remarks}
                onChange={(e) => setForm((prev) => ({ ...prev, remarks: e.target.value }))}
              />
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 0.5,
                bgcolor: '#f8fafc',
                p: 1.5,
                border: '1px solid #cbd5e1',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">공급가액:</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ₩{form.supplyAmount.toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption">부가세(10%):</Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  ₩{form.taxAmount.toLocaleString()}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderTop: '1px solid #cbd5e1',
                  pt: 0.5,
                  mt: 0.5,
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  총 합계:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                  ₩{form.totalAmount.toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
