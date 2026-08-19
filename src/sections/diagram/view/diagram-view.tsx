'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';

import { DashboardContent } from 'src/layouts/dashboard';

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  color?: string;
  children?: OrgNode[];
}

const INITIAL_TREE_DATA: OrgNode = {
  id: '1',
  name: '김대표',
  role: 'CEO / 대표이사',
  department: '경영총괄',
  color: '#1976d2',
  children: [
    {
      id: '2',
      name: '이수석',
      role: 'CTO / 개발총괄',
      department: '기술연구소',
      color: '#2e7d32',
      children: [
        {
          id: '4',
          name: '박책임',
          role: 'Frontend Lead',
          department: '프론트엔드팀',
          color: '#0288d1',
          children: [],
        },
        {
          id: '5',
          name: '최선임',
          role: 'Backend Lead',
          department: '백엔드팀',
          color: '#ed6c02',
          children: [],
        },
      ],
    },
    {
      id: '3',
      name: '정이사',
      role: 'CMO / 마케팅총괄',
      department: '사업본부',
      color: '#9c27b0',
      children: [
        {
          id: '6',
          name: '강팀장',
          role: 'Growth Lead',
          department: '그로스마케팅',
          color: '#d32f2f',
          children: [],
        },
      ],
    },
  ],
};

export function DiagramView() {
  const [treeData, setTreeData] = useState<OrgNode>(INITIAL_TREE_DATA);

  // Edit / Add Modal State
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [targetParentId, setTargetParentId] = useState<string | null>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formColor, setFormColor] = useState('#1976d2');

  const handleOpenAdd = (parentId: string) => {
    setModalMode('add');
    setTargetParentId(parentId);
    setFormName('');
    setFormRole('팀원');
    setFormDepartment('부서명');
    setFormColor('#1976d2');
    setOpenModal(true);
  };

  const handleOpenEdit = (node: OrgNode) => {
    setModalMode('edit');
    setTargetNodeId(node.id);
    setFormName(node.name);
    setFormRole(node.role);
    setFormDepartment(node.department);
    setFormColor(node.color || '#1976d2');
    setOpenModal(true);
  };

  const handleSaveModal = () => {
    if (!formName.trim()) {
      toast.error('이름을 입력해 주세요.');
      return;
    }

    if (modalMode === 'add' && targetParentId) {
      const newNode: OrgNode = {
        id: String(Date.now()),
        name: formName,
        role: formRole,
        department: formDepartment,
        color: formColor,
        children: [],
      };

      const addRecursive = (curr: OrgNode): OrgNode => {
        if (curr.id === targetParentId) {
          return { ...curr, children: [...(curr.children || []), newNode] };
        }
        return {
          ...curr,
          children: curr.children ? curr.children.map(addRecursive) : [],
        };
      };

      setTreeData(addRecursive(treeData));
      toast.success('하위 구성원이 추가되었습니다.');
    } else if (modalMode === 'edit' && targetNodeId) {
      const editRecursive = (curr: OrgNode): OrgNode => {
        if (curr.id === targetNodeId) {
          return {
            ...curr,
            name: formName,
            role: formRole,
            department: formDepartment,
            color: formColor,
          };
        }
        return {
          ...curr,
          children: curr.children ? curr.children.map(editRecursive) : [],
        };
      };

      setTreeData(editRecursive(treeData));
      toast.success('구성원 정보가 수정되었습니다.');
    }

    setOpenModal(false);
  };

  const handleDeleteNode = (nodeId: string) => {
    if (nodeId === treeData.id) {
      toast.error('최상위 루트 노드는 삭제할 수 없습니다.');
      return;
    }

    const deleteRecursive = (curr: OrgNode): OrgNode => {
      return {
        ...curr,
        children: curr.children
          ? curr.children.filter((c) => c.id !== nodeId).map(deleteRecursive)
          : [],
      };
    };

    setTreeData(deleteRecursive(treeData));
    toast.info('노드가 삭제되었습니다.');
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(treeData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `org_chart_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('조직도 데이터가 JSON으로 내보내기 되었습니다.');
  };

  const renderTreeNode = (node: OrgNode) => {
    return (
      <TreeNode
        key={node.id}
        label={
          <Card
            sx={{
              display: 'inline-flex',
              flexDirection: 'column',
              p: 1.5,
              minWidth: 160,
              maxWidth: 220,
              borderRadius: 2,
              borderTop: `4px solid ${node.color || '#1976d2'}`,
              boxShadow: 2,
              textAlign: 'center',
              position: 'relative',
              '&:hover .node-actions': { opacity: 1 },
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {node.department}
            </Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 0.2 }}>
              {node.name}
            </Typography>
            <Chip
              label={node.role}
              size="small"
              sx={{
                mt: 0.8,
                fontSize: '0.7rem',
                height: 20,
                bgcolor: `${node.color}15`,
                color: node.color,
                fontWeight: 700,
              }}
            />

            {/* Quick Actions */}
            <Box
              className="node-actions"
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                opacity: 0,
                transition: 'opacity 0.2s ease',
                display: 'flex',
                gap: 0.2,
                bgcolor: 'background.paper',
                borderRadius: 1,
                boxShadow: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => handleOpenAdd(node.id)}
                title="하위 팀원 추가"
              >
                <AddRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              <IconButton size="small" onClick={() => handleOpenEdit(node)} title="수정">
                <EditRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
              {node.id !== treeData.id && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDeleteNode(node.id)}
                  title="삭제"
                >
                  <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              )}
            </Box>
          </Card>
        }
      >
        {node.children && node.children.map((child) => renderTreeNode(child))}
      </TreeNode>
    );
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 2,
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            조직도 & 마인드맵 (Org Chart Studio)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            계층형 조직도와 비즈니스 마인드맵을 인터랙티브하게 작성하고 공유합니다.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<RestartAltRoundedIcon />}
            onClick={() => setTreeData(INITIAL_TREE_DATA)}
          >
            초기화
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportJson}
          >
            JSON 저장
          </Button>
        </Box>
      </Box>

      {/* Main Visual Workspace */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          overflow: 'auto',
          p: 4,
          bgcolor: 'background.neutral',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <Tree
          lineWidth="2px"
          lineColor="#90caf9"
          lineBorderRadius="8px"
          nodePadding="14px"
          label={
            <Card
              sx={{
                display: 'inline-flex',
                flexDirection: 'column',
                p: 2,
                minWidth: 180,
                borderRadius: 2,
                borderTop: `4px solid ${treeData.color || '#1976d2'}`,
                boxShadow: 3,
                textAlign: 'center',
                position: 'relative',
                '&:hover .node-actions': { opacity: 1 },
              }}
            >
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {treeData.department}
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 0.2 }}>
                {treeData.name}
              </Typography>
              <Chip
                label={treeData.role}
                size="small"
                sx={{
                  mt: 0.8,
                  bgcolor: `${treeData.color}15`,
                  color: treeData.color,
                  fontWeight: 700,
                }}
              />

              <Box
                className="node-actions"
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  display: 'flex',
                  gap: 0.2,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  boxShadow: 1,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => handleOpenAdd(treeData.id)}
                  title="하위 팀원 추가"
                >
                  <AddRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <IconButton size="small" onClick={() => handleOpenEdit(treeData)} title="수정">
                  <EditRoundedIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Card>
          }
        >
          {treeData.children && treeData.children.map((child) => renderTreeNode(child))}
        </Tree>
      </Box>

      {/* Edit / Add Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {modalMode === 'add' ? '새 하위 구성원 추가' : '구성원 정보 수정'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="성명 / 구성원명"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="직함 / 역할"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            fullWidth
          />
          <TextField
            label="소속 부서"
            value={formDepartment}
            onChange={(e) => setFormDepartment(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              테마 색상:
            </Typography>
            <input
              type="color"
              value={formColor}
              onChange={(e) => setFormColor(e.target.value)}
              style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveModal}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
