'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCutRoundedIcon from '@mui/icons-material/ContentCutRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import ZoomOutRoundedIcon from '@mui/icons-material/ZoomOutRounded';
import { SubtitleBoundingBox } from '../types';

export interface SubtitleRemoverTimelineTrackProps {
  boxes: SubtitleBoundingBox[];
  activeBoxId: string | null;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onSelectBox: (id: string) => void;
  onUpdateBoxTime: (id: string, startTime: number, endTime: number) => void;
  onAddBoxAtCurrentTime: () => void;
  onSplitBoxAtCurrentTime?: (id: string) => void;
  onDeleteBox?: (id: string) => void;
  onTogglePlay?: () => void;
}

interface DragState {
  type: 'move' | 'resize-left' | 'resize-right' | 'playhead';
  boxId?: string;
  startX: number;
  initStartTime: number;
  initEndTime: number;
}

const TRACK_HEIGHT = 44;
const RULER_HEIGHT = 24;

export function SubtitleRemoverTimelineTrack({
  boxes,
  activeBoxId,
  currentTime,
  duration,
  isPlaying,
  onSeek,
  onSelectBox,
  onUpdateBoxTime,
  onAddBoxAtCurrentTime,
  onSplitBoxAtCurrentTime,
  onDeleteBox,
  onTogglePlay,
}: SubtitleRemoverTimelineTrackProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackContentRef = useRef<HTMLDivElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [hoveredTime, setHoveredTime] = useState<number | null>(null);

  const safeDuration = Math.max(0.1, duration || 10);

  // Time formatter: mm:ss.ss
  const formatTimeFull = useCallback((sec: number): string => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remSec = (s % 60).toFixed(2).padStart(5, '0');
    return `${m.toString().padStart(2, '0')}:${remSec}`;
  }, []);

  // Format ruler time marks (e.g. 00:02)
  const formatRulerTime = useCallback((sec: number): string => {
    const s = Math.max(0, sec);
    const m = Math.floor(s / 60);
    const remSec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${remSec.toString().padStart(2, '0')}`;
  }, []);

  // Calculate non-overlapping lane rows for clips (Multi-lane packing)
  const clipLanes = useMemo(() => {
    const sorted = [...boxes].sort((a, b) => (a.startTime || 0) - (b.startTime || 0));
    const lanes: SubtitleBoundingBox[][] = [];

    sorted.forEach((box) => {
      const boxStart = box.startTime || 0;
      let placed = false;

      for (let i = 0; i < lanes.length; i += 1) {
        const lane = lanes[i];
        const lastInLane = lane[lane.length - 1];
        const lastEnd = lastInLane.endTime ?? safeDuration;

        // If fits in this lane without collision (with 0.05s buffer)
        if (boxStart >= lastEnd - 0.05) {
          lane.push(box);
          placed = true;
          break;
        }
      }

      if (!placed) {
        lanes.push([box]);
      }
    });

    return lanes.length > 0 ? lanes : [[]];
  }, [boxes, safeDuration]);

  // Convert pixel offset within track to seconds
  const clientXToTime = useCallback(
    (clientX: number): number => {
      if (!trackContentRef.current) return 0;
      const rect = trackContentRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      return Number((ratio * safeDuration).toFixed(2));
    },
    [safeDuration]
  );

  // ----------------------------------------------------------------------
  // Drag handling via window pointer listeners
  // ----------------------------------------------------------------------
  const handlePointerDownClip = (
    e: React.PointerEvent,
    box: SubtitleBoundingBox,
    type: 'move' | 'resize-left' | 'resize-right'
  ) => {
    e.stopPropagation();
    onSelectBox(box.id);

    setDragState({
      type,
      boxId: box.id,
      startX: e.clientX,
      initStartTime: box.startTime || 0,
      initEndTime: box.endTime ?? safeDuration,
    });
  };

  const handlePointerDownTrack = (e: React.PointerEvent) => {
    const time = clientXToTime(e.clientX);
    onSeek(time);

    setDragState({
      type: 'playhead',
      startX: e.clientX,
      initStartTime: time,
      initEndTime: time,
    });
  };

  useEffect(() => {
    if (!dragState) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!trackContentRef.current) return;
      const rect = trackContentRef.current.getBoundingClientRect();
      const deltaPixels = e.clientX - dragState.startX;
      const deltaTime = (deltaPixels / rect.width) * safeDuration;

      if (dragState.type === 'playhead') {
        const time = clientXToTime(e.clientX);
        onSeek(time);
        return;
      }

      if (!dragState.boxId) return;

      if (dragState.type === 'move') {
        const clipDuration = dragState.initEndTime - dragState.initStartTime;
        let newStart = dragState.initStartTime + deltaTime;
        let newEnd = dragState.initEndTime + deltaTime;

        if (newStart < 0) {
          newStart = 0;
          newEnd = clipDuration;
        } else if (newEnd > safeDuration) {
          newEnd = safeDuration;
          newStart = safeDuration - clipDuration;
        }

        onUpdateBoxTime(
          dragState.boxId,
          Number(newStart.toFixed(2)),
          Number(newEnd.toFixed(2))
        );
      } else if (dragState.type === 'resize-left') {
        let newStart = dragState.initStartTime + deltaTime;
        // Minimum clip length: 0.15s
        newStart = Math.max(0, Math.min(dragState.initEndTime - 0.15, newStart));
        onUpdateBoxTime(
          dragState.boxId,
          Number(newStart.toFixed(2)),
          Number(dragState.initEndTime.toFixed(2))
        );
      } else if (dragState.type === 'resize-right') {
        let newEnd = dragState.initEndTime + deltaTime;
        // Minimum clip length: 0.15s
        newEnd = Math.max(dragState.initStartTime + 0.15, Math.min(safeDuration, newEnd));
        onUpdateBoxTime(
          dragState.boxId,
          Number(dragState.initStartTime.toFixed(2)),
          Number(newEnd.toFixed(2))
        );
      }
    };

    const handlePointerUp = () => {
      setDragState(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [dragState, clientXToTime, onSeek, onUpdateBoxTime, safeDuration]);

  // Generate ticks for time ruler
  const rulerTicks = useMemo(() => {
    // Select tick interval based on zoom and duration
    let interval = 1;
    if (safeDuration > 60 && zoomLevel === 1) interval = 10;
    else if (safeDuration > 30 && zoomLevel === 1) interval = 5;
    else if (safeDuration > 15 && zoomLevel <= 1.5) interval = 2;
    else if (safeDuration <= 10 && zoomLevel >= 2) interval = 0.5;

    const ticks: { time: number; pct: number; isMajor: boolean }[] = [];
    for (let t = 0; t <= safeDuration; t += interval) {
      const pct = (t / safeDuration) * 100;
      ticks.push({
        time: Number(t.toFixed(1)),
        pct,
        isMajor: t % (interval * 2) === 0 || t === 0,
      });
    }
    return ticks;
  }, [safeDuration, zoomLevel]);

  const activeBox = useMemo(() => {
    return boxes.find((b) => b.id === activeBoxId) || null;
  }, [boxes, activeBoxId]);

  const canSplit = useMemo(() => {
    if (!activeBox) return false;
    const s = activeBox.startTime || 0;
    const e = activeBox.endTime ?? safeDuration;
    // Current time must be within box with at least 0.2s margin on each side
    return currentTime > s + 0.2 && currentTime < e - 0.2;
  }, [activeBox, currentTime, safeDuration]);

  const totalTrackHeight = Math.max(1, clipLanes.length) * (TRACK_HEIGHT + 6) + RULER_HEIGHT + 16;

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        bgcolor: 'rgba(15, 23, 42, 0.96)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* 1. Timeline Toolbar */}
      <Box
        sx={{
          px: 2,
          py: 0.8,
          bgcolor: 'rgba(30, 41, 59, 0.7)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* Left: Playback & Time Display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {onTogglePlay && (
            <IconButton
              size="small"
              onClick={onTogglePlay}
              sx={{
                bgcolor: 'primary.main',
                color: '#ffffff',
                width: 30,
                height: 30,
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              {isPlaying ? (
                <PauseRoundedIcon sx={{ fontSize: 18 }} />
              ) : (
                <PlayArrowRoundedIcon sx={{ fontSize: 18 }} />
              )}
            </IconButton>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'monospace',
                fontWeight: 700,
                fontSize: 13,
                color: '#ffffff',
                bgcolor: 'rgba(0, 0, 0, 0.4)',
                px: 1,
                py: 0.3,
                borderRadius: 0.8,
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <span style={{ color: '#00A76F' }}>{formatTimeFull(currentTime)}</span>
              <span style={{ color: 'rgba(255, 255, 255, 0.4)', margin: '0 4px' }}>/</span>
              <span>{formatTimeFull(safeDuration)}</span>
            </Typography>
          </Box>
        </Box>

        {/* Center: Track Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddBoxAtCurrentTime}
            sx={{
              height: 28,
              fontSize: 11.5,
              fontWeight: 800,
              px: 1.2,
              boxShadow: '0 2px 8px rgba(0, 167, 111, 0.35)',
            }}
          >
            현재 위치에 지우개 추가
          </Button>

          {onSplitBoxAtCurrentTime && (
            <Tooltip
              title={
                canSplit
                  ? '선택된 자막 클립을 현재 재생 바 위치에서 2개로 분할합니다.'
                  : '선택된 자막 클립 내부에서만 분할할 수 있습니다.'
              }
            >
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContentCutRoundedIcon />}
                  disabled={!canSplit || !activeBoxId}
                  onClick={() => activeBoxId && onSplitBoxAtCurrentTime(activeBoxId)}
                  sx={{
                    height: 28,
                    fontSize: 11.5,
                    fontWeight: 700,
                    px: 1.2,
                    color: '#ffffff',
                    borderColor: 'rgba(255, 255, 255, 0.25)',
                    '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' },
                  }}
                >
                  현재 위치 분할
                </Button>
              </span>
            </Tooltip>
          )}

          {onDeleteBox && activeBox && (
            <Button
              size="small"
              variant="outlined"
              color="error"
              startIcon={<DeleteRoundedIcon />}
              onClick={() => onDeleteBox(activeBox.id)}
              sx={{ height: 28, fontSize: 11.5, fontWeight: 700, px: 1.2 }}
            >
              선택 삭제
            </Button>
          )}
        </Box>

        {/* Right: Zoom Level Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" sx={{ color: 'grey.400', fontSize: 11, fontWeight: 600 }}>
            트랙 줌:
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={zoomLevel}
            exclusive
            onChange={(_, val) => val && setZoomLevel(val)}
            sx={{
              height: 24,
              '& .MuiToggleButton-root': {
                color: 'grey.400',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                fontSize: 10.5,
                fontWeight: 700,
                px: 1,
                py: 0,
                '&.Mui-selected': {
                  color: '#ffffff',
                  bgcolor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              },
            }}
          >
            <ToggleButton value={1}>1x</ToggleButton>
            <ToggleButton value={1.5}>1.5x</ToggleButton>
            <ToggleButton value={2}>2x</ToggleButton>
            <ToggleButton value={3}>3x</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* 2. Scrollable Timeline Canvas & Track Lanes */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          overflowX: 'auto',
          overflowY: 'hidden',
          bgcolor: '#090d16',
          cursor: dragState?.type === 'playhead' ? 'ew-resize' : 'default',
        }}
      >
        <Box
          ref={trackContentRef}
          onPointerDown={handlePointerDownTrack}
          onPointerMove={(e) => {
            if (!dragState) {
              setHoveredTime(clientXToTime(e.clientX));
            }
          }}
          onPointerLeave={() => setHoveredTime(null)}
          sx={{
            position: 'relative',
            width: `${100 * zoomLevel}%`,
            minWidth: '100%',
            height: totalTrackHeight,
            boxSizing: 'border-box',
          }}
        >
          {/* Time Ruler Header Bar */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: RULER_HEIGHT,
              bgcolor: 'rgba(30, 41, 59, 0.85)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
              cursor: 'pointer',
            }}
          >
            {rulerTicks.map((tick, i) => (
              <Box
                key={i}
                sx={{
                  position: 'absolute',
                  left: `${tick.pct}%`,
                  bottom: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    position: 'absolute',
                    bottom: 4,
                    left: 2,
                    fontSize: 9.5,
                    fontFamily: 'monospace',
                    fontWeight: tick.isMajor ? 700 : 500,
                    color: tick.isMajor ? 'grey.300' : 'grey.500',
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tick.isMajor ? formatRulerTime(tick.time) : ''}
                </Typography>
                <Box
                  sx={{
                    width: '1px',
                    height: tick.isMajor ? 7 : 4,
                    bgcolor: tick.isMajor ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Track Lanes */}
          <Box sx={{ position: 'relative', width: '100%', pt: 1 }}>
            {clipLanes.map((lane, laneIdx) => (
              <Box
                key={laneIdx}
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: TRACK_HEIGHT,
                  mb: 0.8,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  borderTop: '1px dashed rgba(255, 255, 255, 0.05)',
                  borderBottom: '1px dashed rgba(255, 255, 255, 0.05)',
                  boxSizing: 'border-box',
                }}
              >
                {/* Lane Track Background Grid Marks */}
                {rulerTicks
                  .filter((t) => t.isMajor)
                  .map((tick, i) => (
                    <Box
                      key={i}
                      sx={{
                        position: 'absolute',
                        left: `${tick.pct}%`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        pointerEvents: 'none',
                      }}
                    />
                  ))}

                {/* Subtitle Mask Clips in this lane */}
                {lane.map((box) => {
                  const s = Math.max(0, box.startTime || 0);
                  const e = Math.min(safeDuration, box.endTime ?? safeDuration);
                  const leftPct = (s / safeDuration) * 100;
                  const widthPct = Math.max(0.8, ((e - s) / safeDuration) * 100);

                  const isSelected = box.id === activeBoxId;
                  const isCurrent = currentTime >= s && currentTime <= e;
                  const isTop = box.y < 0.35;

                  const clipColor = isTop ? '#0284c7' : '#00A76F';
                  const clipDarkColor = isTop ? '#0369a1' : '#007850';

                  return (
                    <Box
                      key={box.id}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        onSelectBox(box.id);
                      }}
                      sx={{
                        position: 'absolute',
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        top: 4,
                        bottom: 4,
                        borderRadius: 1.2,
                        bgcolor: clipDarkColor,
                        backgroundImage: `linear-gradient(180deg, ${clipColor} 0%, ${clipDarkColor} 100%)`,
                        border: isSelected
                          ? '2px solid #ffffff'
                          : isCurrent
                            ? '1.5px solid rgba(255, 255, 255, 0.7)'
                            : '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: isSelected
                          ? `0 0 0 2px ${clipColor}, 0 4px 12px rgba(0, 0, 0, 0.5)`
                          : '0 2px 6px rgba(0, 0, 0, 0.35)',
                        zIndex: isSelected ? 10 : 2,
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' },
                        display: 'flex',
                        alignItems: 'center',
                        overflow: 'hidden',
                        transition: dragState ? 'none' : 'box-shadow 0.15s, border 0.15s',
                      }}
                      onPointerDown={(evt) => handlePointerDownClip(evt, box, 'move')}
                    >
                      {/* Left Trim Handle (StartTime Adjustment) */}
                      <Box
                        onPointerDown={(evt) => handlePointerDownClip(evt, box, 'resize-left')}
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 10,
                          cursor: 'ew-resize',
                          bgcolor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 15,
                          '&:hover': { bgcolor: '#ffffff' },
                        }}
                      >
                        <Box sx={{ width: 2, height: 12, bgcolor: '#000000', borderRadius: 1 }} />
                      </Box>

                      {/* Clip Center Info & Label */}
                      <Box
                        sx={{
                          flex: 1,
                          px: 1.8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1,
                          overflow: 'hidden',
                          pointerEvents: 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
                          <LayersRoundedIcon sx={{ fontSize: 13, color: '#ffffff', flexShrink: 0 }} />
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#ffffff',
                              fontWeight: 800,
                              fontSize: 11,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                            }}
                          >
                            {box.label}
                          </Typography>
                        </Box>

                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255, 255, 255, 0.85)',
                            fontSize: 10,
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                            bgcolor: 'rgba(0, 0, 0, 0.35)',
                            px: 0.6,
                            py: 0.1,
                            borderRadius: 0.5,
                          }}
                        >
                          {s.toFixed(1)}s ~ {e.toFixed(1)}s ({(e - s).toFixed(1)}s)
                        </Typography>
                      </Box>

                      {/* Right Trim Handle (EndTime Adjustment) */}
                      <Box
                        onPointerDown={(evt) => handlePointerDownClip(evt, box, 'resize-right')}
                        sx={{
                          position: 'absolute',
                          right: 0,
                          top: 0,
                          bottom: 0,
                          width: 10,
                          cursor: 'ew-resize',
                          bgcolor: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 15,
                          '&:hover': { bgcolor: '#ffffff' },
                        }}
                      >
                        <Box sx={{ width: 2, height: 12, bgcolor: '#000000', borderRadius: 1 }} />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Box>

          {/* Hover Time Indicator Line (When moving mouse) */}
          {hoveredTime !== null && !dragState && (
            <Box
              sx={{
                position: 'absolute',
                left: `${(hoveredTime / safeDuration) * 100}%`,
                top: 0,
                bottom: 0,
                width: '1px',
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                pointerEvents: 'none',
                zIndex: 20,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: 2,
                  left: 4,
                  fontFamily: 'monospace',
                  fontSize: 9,
                  color: 'grey.300',
                  bgcolor: 'rgba(0, 0, 0, 0.7)',
                  px: 0.4,
                  py: 0.1,
                  borderRadius: 0.4,
                }}
              >
                {hoveredTime.toFixed(1)}s
              </Typography>
            </Box>
          )}

          {/* Interactive Playhead Cursor Line */}
          <Box
            sx={{
              position: 'absolute',
              left: `${(currentTime / safeDuration) * 100}%`,
              top: 0,
              bottom: 0,
              width: '2px',
              bgcolor: '#ff3030',
              zIndex: 30,
              pointerEvents: 'none',
              boxShadow: '0 0 8px rgba(255, 48, 48, 0.8)',
            }}
          >
            {/* Draggable Playhead Scrubber Head */}
            <Box
              onPointerDown={(evt) => {
                evt.stopPropagation();
                setDragState({
                  type: 'playhead',
                  startX: evt.clientX,
                  initStartTime: currentTime,
                  initEndTime: currentTime,
                });
              }}
              sx={{
                position: 'absolute',
                top: 0,
                left: -7,
                width: 16,
                height: 16,
                bgcolor: '#ff3030',
                borderRadius: '50% 50% 50% 0',
                transform: 'rotate(-45deg)',
                cursor: 'ew-resize',
                pointerEvents: 'auto',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)',
                border: '1.5px solid #ffffff',
                '&:hover': { bgcolor: '#ff5c5c', transform: 'rotate(-45deg) scale(1.15)' },
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
