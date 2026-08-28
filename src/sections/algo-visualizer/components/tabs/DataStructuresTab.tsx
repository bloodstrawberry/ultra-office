'use client';

import React, { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import QuizRoundedIcon from '@mui/icons-material/QuizRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';

import { DATA_STRUCTURES } from '../../lib/data-structures/registry';
import { type DataStructureId } from '../../lib/data-structures/types';
import { DSQuizModal } from '../data-structures/DSQuizModal';
import { DSConceptCard } from '../data-structures/DSConceptCard';
import { SetInteractiveView } from '../data-structures/SetInteractiveView';
import { MapInteractiveView } from '../data-structures/MapInteractiveView';
import { TrieInteractiveView } from '../data-structures/TrieInteractiveView';
import { TreeInteractiveView } from '../data-structures/TreeInteractiveView';
import { HeapInteractiveView } from '../data-structures/HeapInteractiveView';
import { ArrayInteractiveView } from '../data-structures/ArrayInteractiveView';
import { DequeInteractiveView } from '../data-structures/DequeInteractiveView';
import { GraphInteractiveView } from '../data-structures/GraphInteractiveView';
import { HashTableInteractiveView } from '../data-structures/HashTableInteractiveView';
import { LinkedListInteractiveView } from '../data-structures/LinkedListInteractiveView';
import { DisjointSetInteractiveView } from '../data-structures/DisjointSetInteractiveView';
import { StackQueueInteractiveView } from '../data-structures/StackQueueInteractiveView';
import { PriorityQueueInteractiveView } from '../data-structures/PriorityQueueInteractiveView';

export function DataStructuresTab({
  onNavigateToAlgo,
}: {
  onNavigateToAlgo?: (algoId: string) => void;
}) {
  const [selectedDSId, setSelectedDSId] = useState<DataStructureId>('array');
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isDSModalOpen, setIsDSModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'interactive' | 'concept'>('interactive');

  const currentDS = DATA_STRUCTURES[selectedDSId] || DATA_STRUCTURES.array;

  const handleSelectDS = (id: DataStructureId) => {
    setSelectedDSId(id);
    setIsDSModalOpen(false);
  };

  const renderInteractiveCanvas = () => {
    switch (selectedDSId) {
      case 'array':
        return <ArrayInteractiveView />;
      case 'linkedList':
        return <LinkedListInteractiveView />;
      case 'stack':
      case 'queue':
        return <StackQueueInteractiveView />;
      case 'deque':
        return <DequeInteractiveView />;
      case 'priorityQueue':
        return <PriorityQueueInteractiveView />;
      case 'set':
        return <SetInteractiveView />;
      case 'map':
        return <MapInteractiveView />;
      case 'hashTable':
        return <HashTableInteractiveView />;
      case 'tree':
        return <TreeInteractiveView />;
      case 'heap':
        return <HeapInteractiveView />;
      case 'trie':
        return <TrieInteractiveView />;
      case 'disjointSet':
        return <DisjointSetInteractiveView />;
      case 'graph':
        return <GraphInteractiveView />;
      case 'bst':
        return (
          <Card
            sx={{
              p: 6,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: 2,
              borderRadius: 3,
            }}
          >
            <Typography variant="h2">🌲</Typography>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              이진 탐색 트리 (BST) 종합 시각화
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 500 }}>
              BST의 동적 노드 삽입 및 4대 순회(전위/중위/후위/레벨) 애니메이션은 시각화 랩에서
              심층적으로 체험할 수 있습니다.
            </Typography>
            {onNavigateToAlgo && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => onNavigateToAlgo('bst')}
                sx={{ mt: 1, px: 3, py: 1, borderRadius: 2, fontWeight: 800 }}
              >
                🌲 BST 시각화 플레이어로 이동하기
              </Button>
            )}
          </Card>
        );
      default:
        return <ArrayInteractiveView />;
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* 1. Header Card: Selector, Quiz, Chips */}
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
          bgcolor: 'background.neutral',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsDSModalOpen(true)}
            sx={{ fontWeight: 800, borderRadius: 2, px: 2, py: 1 }}
          >
            <Box component="span" sx={{ mr: 1, fontSize: '1.2rem' }}>
              {currentDS.icon}
            </Box>
            {currentDS.name} ({currentDS.englishName}) ▾
          </Button>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<QuizRoundedIcon />}
            onClick={() => setIsQuizOpen(true)}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            개념 퀴즈 풀기
          </Button>
        </Box>

        {/* View Mode Toggle: Interactive vs Concept */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            variant={activeTab === 'interactive' ? 'contained' : 'outlined'}
            color={activeTab === 'interactive' ? 'primary' : 'inherit'}
            startIcon={<TouchAppRoundedIcon />}
            onClick={() => setActiveTab('interactive')}
            sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
          >
            인터랙티브 실습관
          </Button>
          <Button
            variant={activeTab === 'concept' ? 'contained' : 'outlined'}
            color={activeTab === 'concept' ? 'primary' : 'inherit'}
            startIcon={<MenuBookRoundedIcon />}
            onClick={() => setActiveTab('concept')}
            sx={{ borderRadius: 2, fontWeight: 700, px: 2 }}
          >
            개념 & 복잡도 정리
          </Button>
        </Box>
      </Card>

      {/* 2. Horizontal DS Picker Chips */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          overflowX: 'auto',
          pb: 0.5,
        }}
      >
        {Object.values(DATA_STRUCTURES).map((ds) => {
          const isSelected = ds.id === selectedDSId;
          return (
            <Button
              key={ds.id}
              size="small"
              variant={isSelected ? 'contained' : 'outlined'}
              color={isSelected ? 'primary' : 'inherit'}
              onClick={() => handleSelectDS(ds.id)}
              sx={{
                minWidth: 'auto',
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                fontSize: '0.8rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              <Box component="span" sx={{ mr: 0.5 }}>
                {ds.icon}
              </Box>
              {ds.name.split(' ')[0]}
            </Button>
          );
        })}
      </Box>

      {/* 3. Main Content: Interactive Canvas vs Concept Card */}
      <Box sx={{ mt: 1 }}>
        {activeTab === 'interactive' ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {renderInteractiveCanvas()}
          </Box>
        ) : (
          <DSConceptCard ds={currentDS} onOpenQuiz={() => setIsQuizOpen(true)} />
        )}
      </Box>

      {/* 4. DS Picker Dialog */}
      <Dialog
        open={isDSModalOpen}
        onClose={() => setIsDSModalOpen(false)}
        maxWidth="md"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 3, p: 2.5 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}
          >
            📦 핵심 자료구조 15종 실습관
          </Typography>
          <IconButton onClick={() => setIsDSModalOpen(false)} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 1.5,
            maxHeight: '60vh',
            overflowY: 'auto',
          }}
        >
          {Object.values(DATA_STRUCTURES).map((ds) => {
            const isSelected = ds.id === selectedDSId;
            return (
              <Card
                key={ds.id}
                onClick={() => handleSelectDS(ds.id)}
                sx={{
                  p: 2,
                  cursor: 'pointer',
                  borderRadius: 2,
                  border: 2,
                  borderColor: isSelected ? 'primary.main' : 'divider',
                  bgcolor: isSelected ? 'primary.lighter' : 'background.paper',
                  transition: 'all 0.15s ease',
                  '&:hover': {
                    borderColor: 'primary.light',
                    transform: 'translateY(-2px)',
                    boxShadow: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1,
                  }}
                >
                  <Typography variant="h5">{ds.icon}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      px: 1,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      fontWeight: 700,
                    }}
                  >
                    {ds.tag}
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 800, color: isSelected ? 'primary.main' : 'text.primary' }}
                >
                  {ds.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', display: 'block', mb: 1, fontFamily: 'monospace' }}
                >
                  {ds.englishName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {ds.summary}
                </Typography>
              </Card>
            );
          })}
        </Box>
      </Dialog>

      {/* 5. DS Quiz Modal */}
      <DSQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        dsName={currentDS.name}
        questions={currentDS.quiz || []}
      />
    </Box>
  );
}
