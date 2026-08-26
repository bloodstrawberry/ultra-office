'use client';

import type { MoleculePreset, PubChemPropertyResult } from '../chemistry/molecule-types';

import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import BiotechRoundedIcon from '@mui/icons-material/BiotechRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';

import { KNOWN_MOLECULES } from '../chemistry/molecule-validator';
import { useChemistryStore } from '../chemistry/use-chemistry-store';
import {
  getPubChem2DImageUrl,
  searchPubChemCompound,
  fetchNextPubChemBatch,
  convertPubChemToPreset,
} from '../chemistry/pubchem-api';

// ----------------------------------------------------------------------

type CategoryFilter =
  | 'ALL'
  | '기본 기체'
  | '생명/유기 화합물'
  | '무기 화합물'
  | '산/염기'
  | '의약품/영양소'
  | 'PubChem 추가';

type DiscoveredFilter = 'ALL' | 'DISCOVERED' | 'LOCKED';
type SortBy = 'DEFAULT' | 'NAME' | 'MW_ASC' | 'MW_DESC' | 'XP_DESC';

interface MoleculeCodexPanelProps {
  onNavigateToBuilderWithPreset?: (moleculeId: string, customPreset?: MoleculePreset) => void;
}

export function MoleculeCodexPanel({ onNavigateToBuilderWithPreset }: MoleculeCodexPanelProps) {
  const {
    discoveredMoleculeIds,
    customMolecules,
    addCustomMolecule,
    addBatchCustomMolecules,
    loadPresetMolecule,
  } = useChemistryStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [discoveredFilter, setDiscoveredFilter] = useState<DiscoveredFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('DEFAULT');

  // Modals
  const [selectedMolecule, setSelectedMolecule] = useState<MoleculePreset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // PubChem search modal state
  const [pubChemQuery, setPubChemQuery] = useState('');
  const [pubChemSearching, setPubChemSearching] = useState(false);
  const [pubChemResults, setPubChemResults] = useState<PubChemPropertyResult[]>([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const allMolecules = useMemo(() => [...KNOWN_MOLECULES, ...customMolecules], [customMolecules]);

  const filteredMolecules = useMemo(
    () =>
      allMolecules
        .filter((m) => {
          if (categoryFilter !== 'ALL' && m.category !== categoryFilter) return false;

          const isDiscovered = discoveredMoleculeIds.includes(m.id);
          if (discoveredFilter === 'DISCOVERED' && !isDiscovered) return false;
          if (discoveredFilter === 'LOCKED' && isDiscovered) return false;

          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const matchNameKo = m.nameKo.toLowerCase().includes(q);
            const matchNameEn = m.nameEn.toLowerCase().includes(q);
            const matchFormula = m.formula.toLowerCase().includes(q);
            const matchCid = m.cid?.toString().includes(q);
            if (!matchNameKo && !matchNameEn && !matchFormula && !matchCid) return false;
          }

          return true;
        })
        .sort((a, b) => {
          if (sortBy === 'NAME') return a.nameKo.localeCompare(b.nameKo, 'ko');
          if (sortBy === 'MW_ASC') return a.molecularWeight - b.molecularWeight;
          if (sortBy === 'MW_DESC') return b.molecularWeight - a.molecularWeight;
          if (sortBy === 'XP_DESC') return b.xp - a.xp;
          return 0;
        }),
    [allMolecules, categoryFilter, discoveredFilter, searchQuery, sortBy, discoveredMoleculeIds]
  );

  const totalCount = allMolecules.length;
  const discoveredCount = allMolecules.filter((m) => discoveredMoleculeIds.includes(m.id)).length;
  const progressPercent = Math.round((discoveredCount / (totalCount || 1)) * 100);

  const handleSearchPubChem = async () => {
    if (!pubChemQuery.trim()) return;
    setPubChemSearching(true);
    try {
      const res = await searchPubChemCompound(pubChemQuery);
      setPubChemResults(res);
    } catch (e) {
      console.error(e);
    } finally {
      setPubChemSearching(false);
    }
  };

  const handleAddFromPubChem = async (prop: PubChemPropertyResult) => {
    const preset = await convertPubChemToPreset(prop);
    addCustomMolecule(preset);
    setIsAddModalOpen(false);
  };

  const handleBatchFetch = async () => {
    setIsBatchLoading(true);
    try {
      const existingCids = allMolecules.map((m) => m.cid).filter(Boolean) as number[];
      const fetched = await fetchNextPubChemBatch(existingCids, 5);
      addBatchCustomMolecules(fetched);
      setIsAddModalOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBatchLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Header with Collection Progress & PubChem Modal Action */}
      <Card
        sx={{
          p: 3,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 260 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
              📖 분자 백과사전 도감 ({discoveredCount} / {totalCount}종 해금)
            </Typography>
            <Chip
              label={`${progressPercent}% 수집 완료`}
              color="primary"
              size="small"
              sx={{ fontWeight: 800 }}
            />
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 8, borderRadius: 1, my: 1 }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            원소를 직접 결합하여 분자를 발견하거나, <strong>PubChem</strong> 글로벌 오픈 화학
            데이터베이스에서 새로운 화합물을 추가하세요!
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddRoundedIcon />}
          onClick={() => setIsAddModalOpen(true)}
          sx={{ fontWeight: 800, px: 2.5, py: 1.2, flexShrink: 0 }}
        >
          PubChem 분자 추가
        </Button>
      </Card>

      {/* 2. Filter & Search Toolbar */}
      <Card
        sx={{
          p: 2,
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <TextField
          size="small"
          placeholder="분자명, 화학식(H2O), 영문명, CID 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchRoundedIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ width: { xs: '100%', sm: 280 } }}
        />

        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>카테고리</InputLabel>
            <Select
              value={categoryFilter}
              label="카테고리"
              onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
            >
              <MenuItem value="ALL">전체 카테고리</MenuItem>
              <MenuItem value="기본 기체">기본 기체</MenuItem>
              <MenuItem value="생명/유기 화합물">생명/유기 화합물</MenuItem>
              <MenuItem value="무기 화합물">무기 화합물</MenuItem>
              <MenuItem value="산/염기">산/염기</MenuItem>
              <MenuItem value="의약품/영양소">의약품/영양소</MenuItem>
              <MenuItem value="PubChem 추가">PubChem 추가</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>발견 여부</InputLabel>
            <Select
              value={discoveredFilter}
              label="발견 여부"
              onChange={(e) => setDiscoveredFilter(e.target.value as DiscoveredFilter)}
            >
              <MenuItem value="ALL">전체 상태</MenuItem>
              <MenuItem value="DISCOVERED">🔓 발견 분자</MenuItem>
              <MenuItem value="LOCKED">🔒 미발견</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel>정렬</InputLabel>
            <Select
              value={sortBy}
              label="정렬"
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <MenuItem value="DEFAULT">기본 순서</MenuItem>
              <MenuItem value="NAME">가나다순</MenuItem>
              <MenuItem value="MW_ASC">분자량 낮은순</MenuItem>
              <MenuItem value="MW_DESC">분자량 높은순</MenuItem>
              <MenuItem value="XP_DESC">보상 XP순</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Card>

      {/* 3. Molecule Cards Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(3, 1fr)',
            md: 'repeat(4, 1fr)',
            lg: 'repeat(5, 1fr)',
          },
          gap: 2,
        }}
      >
        {filteredMolecules.map((m) => {
          const isDiscovered = discoveredMoleculeIds.includes(m.id);
          return (
            <Card
              key={m.id}
              variant="outlined"
              onClick={() => setSelectedMolecule(m)}
              sx={{
                p: 2,
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                opacity: isDiscovered ? 1 : 0.65,
                bgcolor: isDiscovered ? 'background.paper' : 'background.neutral',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-2px)',
                  boxShadow: 3,
                  opacity: 1,
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 1,
                  }}
                >
                  <Chip
                    label={m.difficulty}
                    size="small"
                    color={
                      m.difficulty === '초급'
                        ? 'success'
                        : m.difficulty === '중급'
                          ? 'warning'
                          : 'error'
                    }
                    variant="outlined"
                    sx={{ height: 20, fontSize: '10px', fontWeight: 800 }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ color: 'warning.main', fontWeight: 800, fontSize: '11px' }}
                  >
                    +{m.xp} XP
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 900,
                    color: isDiscovered ? 'primary.main' : 'text.secondary',
                    my: 0.5,
                  }}
                >
                  {isDiscovered ? m.formula : '🔒 ???'}
                </Typography>

                <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                  {isDiscovered ? m.nameKo : '미발견 화합물'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isDiscovered ? m.nameEn : m.category}
                </Typography>
              </Box>

              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1, mt: 1.5 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {m.molecularWeight} g/mol
                </Typography>
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* 4. Molecule Detail Dialog Modal */}
      {selectedMolecule && (
        <Dialog
          open={Boolean(selectedMolecule)}
          onClose={() => setSelectedMolecule(null)}
          maxWidth="sm"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 3,
              p: 3,
              bgcolor: 'background.paper',
            },
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Chip label={selectedMolecule.category} color="primary" size="small" sx={{ mb: 1 }} />
            <Typography variant="h3" sx={{ fontWeight: 900 }}>
              {selectedMolecule.formula}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {selectedMolecule.nameKo} ({selectedMolecule.nameEn})
            </Typography>
          </Box>

          {/* PubChem 2D Structure diagram image if CID exists */}
          {selectedMolecule.cid && (
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 800, mb: 1 }}>
                PubChem 2D 화학 구조 다이어그램 (CID: {selectedMolecule.cid})
              </Typography>
              <img
                src={getPubChem2DImageUrl(selectedMolecule.cid)}
                alt={selectedMolecule.nameEn}
                style={{ maxHeight: 150, objectFit: 'contain' }}
              />
            </Box>
          )}

          {/* Attributes List */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: 'background.neutral',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                분자량 (MW)
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800 }}>
                {selectedMolecule.molecularWeight} g/mol
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                화학 결합 특성
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'success.main' }}>
                {selectedMolecule.bondsSummary}
              </Typography>
            </Box>
            {selectedMolecule.smiles && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Canonical SMILES
                </Typography>
                <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 700 }}>
                  {selectedMolecule.smiles}
                </Typography>
              </Box>
            )}
          </Box>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.6 }}>
            {selectedMolecule.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              startIcon={<BiotechRoundedIcon />}
              onClick={() => {
                loadPresetMolecule(selectedMolecule.id, selectedMolecule);
                setSelectedMolecule(null);
                if (onNavigateToBuilderWithPreset) {
                  onNavigateToBuilderWithPreset(selectedMolecule.id, selectedMolecule);
                }
              }}
              sx={{ fontWeight: 800 }}
            >
              조립 샌드박스로 불러오기
            </Button>
            <Button variant="outlined" onClick={() => setSelectedMolecule(null)}>
              닫기
            </Button>
          </Box>
        </Dialog>
      )}

      {/* 5. PubChem Add Molecule Modal */}
      <Dialog
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            p: 3,
          },
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 900, mb: 1 }}>
          🌐 PubChem 글로벌 화학 데이터베이스 연동
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
          NCBI PubChem API를 통해 수천만 종의 화합물 중 원하는 분자를 검색하거나 추천 분자를
          불러오세요.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="화합물명 입력 (예: 카페인, aspirin, 5288826)..."
            value={pubChemQuery}
            onChange={(e) => setPubChemQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchPubChem();
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearchPubChem}
            disabled={pubChemSearching}
            sx={{ fontWeight: 800, flexShrink: 0 }}
          >
            {pubChemSearching ? '검색 중...' : '검색'}
          </Button>
        </Box>

        {/* Quick Batch Load Button */}
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          startIcon={<AutoFixHighRoundedIcon />}
          onClick={handleBatchFetch}
          disabled={isBatchLoading}
          sx={{ mb: 2.5, fontWeight: 800 }}
        >
          {isBatchLoading ? '불러오는 중...' : '✨ 추천 인기 화합물 5종 자동 불러오기'}
        </Button>

        {/* Search Results */}
        {pubChemResults.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {pubChemResults.map((res) => (
              <Card
                key={res.CID}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {res.Title || res.IUPACName || `Compound ${res.CID}`}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    CID: {res.CID} | 화학식: {res.MolecularFormula} | MW: {res.MolecularWeight}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleAddFromPubChem(res)}
                  sx={{ fontWeight: 800 }}
                >
                  도감 추가
                </Button>
              </Card>
            ))}
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
