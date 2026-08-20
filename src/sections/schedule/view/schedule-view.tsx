'use client';

import type { CalendarTask} from '../utils/ics-utils';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import React, { useState } from 'react';
import listPlugin from '@fullcalendar/list';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import LinearProgress from '@mui/material/LinearProgress';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import { DashboardContent } from 'src/layouts/dashboard';

import { exportToIcs, generateShiftSchedule } from '../utils/ics-utils';

const INITIAL_TASKS: CalendarTask[] = [
  {
    id: '1',
    title: 'Ultra Office v2.0 릴리즈',
    start: dayjs().format('YYYY-MM-DD'),
    end: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    backgroundColor: '#1976d2',
    assignee: '전체 팀',
    progress: 80,
    description: '신규 오피스 도구 6종 배포 및 QA 검증',
  },
  {
    id: '2',
    title: '보안 감사 및 암호화 점검',
    start: dayjs().add(3, 'day').format('YYYY-MM-DD'),
    end: dayjs().add(4, 'day').format('YYYY-MM-DD'),
    backgroundColor: '#2e7d32',
    assignee: '보안팀',
    progress: 40,
    description: 'JWT 및 로컬 스토리지 데이터 암호화 감사',
  },
];

export function ScheduleView() {
  const [tasks, setTasks] = useState<CalendarTask[]>(INITIAL_TASKS);

  // Add / Edit Modal
  const [openModal, setOpenModal] = useState(false);
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(dayjs().format('YYYY-MM-DD'));
  const [end, setEnd] = useState(dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [assignee, setAssignee] = useState('');
  const [color, setColor] = useState('#1976d2');
  const [progress, setProgress] = useState(0);
  const [description, setDescription] = useState('');

  // Shift Generator Modal
  const [openShiftModal, setOpenShiftModal] = useState(false);
  const [membersInput, setMembersInput] = useState('김철수, 이영희, 박민수, 최지혜');
  const [shiftDays, setShiftDays] = useState(14);
  const [shiftStartDate, setShiftStartDate] = useState(dayjs().format('YYYY-MM-DD'));

  const handleOpenAdd = (dateStr?: string) => {
    setTitle('');
    setStart(dateStr || dayjs().format('YYYY-MM-DD'));
    setEnd(dateStr || dayjs().add(1, 'day').format('YYYY-MM-DD'));
    setAssignee('');
    setColor('#1976d2');
    setProgress(0);
    setDescription('');
    setOpenModal(true);
  };

  const handleSaveTask = () => {
    if (!title.trim()) {
      toast.error('일정 제목을 입력해 주세요.');
      return;
    }
    const newTask: CalendarTask = {
      id: String(Date.now()),
      title,
      start,
      end,
      assignee,
      backgroundColor: color,
      progress,
      description,
    };
    setTasks((prev) => [...prev, newTask]);
    toast.success('새 일정이 등록되었습니다.');
    setOpenModal(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.info('일정이 삭제되었습니다.');
  };

  const handleGenerateShift = () => {
    const memberList = membersInput
      .split(',')
      .map((m) => m.trim())
      .filter(Boolean);

    if (memberList.length === 0) {
      toast.error('근무자 이름을 입력해 주세요.');
      return;
    }

    const shiftTypes = [
      { name: '주간당직', color: '#1976d2' },
      { name: '야간당직', color: '#ed6c02' },
      { name: '주말당직', color: '#9c27b0' },
    ];

    const generated = generateShiftSchedule(memberList, shiftStartDate, shiftDays, shiftTypes);
    setTasks((prev) => [...prev, ...generated]);
    toast.success(`${generated.length}건의 당직 일정이 자동 편성되었습니다.`);
    setOpenShiftModal(false);
  };

  const handleExportIcs = () => {
    const blob = exportToIcs(tasks);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `schedule_${dayjs().format('YYYYMMDD')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('구글/아웃룩 캘린더용 .ics 파일이 다운로드되었습니다.');
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
            일정 & 간트차트 스튜디오 (Schedule & Gantt)
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            프로젝트 타임라인, 마일스톤 관리 및 스마트 당직/교대근무 자동 편성표를 제공합니다.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => setOpenShiftModal(true)}
          >
            당직/근무표 자동생성
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DownloadRoundedIcon />}
            onClick={handleExportIcs}
          >
            .ICS 캘린더 내보내기
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<AddRoundedIcon />}
            onClick={() => handleOpenAdd()}
          >
            일정 추가
          </Button>
        </Box>
      </Box>

      {/* Main Grid: Calendar & Timeline Gantt */}
      <Box
        sx={{
          flex: '1 1 auto',
          minHeight: 0,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Left: FullCalendar */}
        <Card
          sx={{
            p: 2,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,listMonth',
            }}
            events={tasks.map((t) => ({
              id: t.id,
              title: t.title,
              start: t.start,
              end: t.end,
              backgroundColor: t.backgroundColor,
              borderColor: t.backgroundColor,
            }))}
            dateClick={(info) => handleOpenAdd(info.dateStr)}
            height="100%"
            editable
          />
        </Card>

        {/* Right: Gantt / Milestone Progress List */}
        <Card
          sx={{
            p: 2.5,
            borderRadius: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1.5, flexShrink: 0 }}>
            프로젝트 업무 진행률 & 마일스톤 ({tasks.length}개)
          </Typography>

          <Box
            sx={{
              flex: '1 1 auto',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            {tasks.map((t) => (
              <Card
                key={t.id}
                variant="outlined"
                sx={{
                  p: 1.8,
                  borderRadius: 2,
                  borderLeft: `4px solid ${t.backgroundColor || '#1976d2'}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      {t.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.start} {t.end && `~ ${t.end}`} {t.assignee && `| 담당: ${t.assignee}`}
                    </Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => handleDeleteTask(t.id)}>
                    <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>

                {t.progress !== undefined && (
                  <Box sx={{ mt: 0.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        진행률
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                        {t.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={t.progress}
                      sx={{
                        height: 6,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: t.backgroundColor || 'primary.main',
                        },
                      }}
                    />
                  </Box>
                )}
              </Card>
            ))}
          </Box>
        </Card>
      </Box>

      {/* Add Task Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="xs"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>새 일정 / 프로젝트 업무 등록</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField
            label="업무 / 일정 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            autoFocus
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="시작일"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="종료일"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <TextField
            label="담당자"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            fullWidth
          />
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              진행률: {progress}%
            </Typography>
            <Slider
              value={progress}
              onChange={(_, v) => setProgress(v as number)}
              min={0}
              max={100}
            />
          </Box>
          <TextField
            label="상세 내용 / 메모"
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              태그 색상:
            </Typography>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              style={{ width: 40, height: 32, border: 'none', borderRadius: 4, cursor: 'pointer' }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenModal(false)}>취소</Button>
          <Button variant="contained" onClick={handleSaveTask}>
            등록
          </Button>
        </DialogActions>
      </Dialog>

      {/* Shift Generator Modal */}
      <Dialog
        open={openShiftModal}
        onClose={() => setOpenShiftModal(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>스마트 당직 / 교대근무 자동 편성</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          <TextField
            label="근무 대상자 명단 (쉼표로 구분)"
            value={membersInput}
            onChange={(e) => setMembersInput(e.target.value)}
            fullWidth
            helperText="입력된 순서대로 순환하여 자동 배치됩니다."
          />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <TextField
              label="시작 일자"
              type="date"
              value={shiftStartDate}
              onChange={(e) => setShiftStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="편성 기간 (일수)"
              type="number"
              value={shiftDays}
              onChange={(e) => setShiftDays(Number(e.target.value))}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenShiftModal(false)}>취소</Button>
          <Button variant="contained" color="primary" onClick={handleGenerateShift}>
            자동 편성 실행
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
