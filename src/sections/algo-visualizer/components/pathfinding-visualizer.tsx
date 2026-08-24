'use client';

import type { GridCell } from '../types';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import DeleteSweepRoundedIcon from '@mui/icons-material/DeleteSweepRounded';

import { runAStar, createInitialGrid, generateRandomMaze } from '../utils/pathfinding-algorithms';

// ----------------------------------------------------------------------

export function PathfindingVisualizer() {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [isMousePressed, setIsMousePressed] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    setGrid(createInitialGrid());
  }, []);

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    setIsMousePressed(true);
    toggleWall(row, col);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isMousePressed || isRunning) return;
    toggleWall(row, col);
  };

  const handleMouseUp = () => {
    setIsMousePressed(false);
  };

  const toggleWall = (row: number, col: number) => {
    setGrid((prev) =>
      prev.map((r, rIdx) =>
        r.map((cell, cIdx) => {
          if (rIdx === row && cIdx === col) {
            if (cell.isStart || cell.isEnd) return cell;
            return { ...cell, isWall: !cell.isWall };
          }
          return cell;
        })
      )
    );
  };

  const handleRunAStar = () => {
    if (isRunning) return;
    setIsRunning(true);

    let startNode: GridCell | null = null;
    let endNode: GridCell | null = null;

    grid.forEach((row) => {
      row.forEach((cell) => {
        if (cell.isStart) startNode = cell;
        if (cell.isEnd) endNode = cell;
      });
    });

    if (!startNode || !endNode) return;

    const { visitedNodesInOrder, shortestPath } = runAStar(grid, startNode, endNode);

    // Animate visited nodes
    visitedNodesInOrder.forEach((node, i) => {
      setTimeout(() => {
        setGrid((prev) =>
          prev.map((r) =>
            r.map((cell) =>
              cell.row === node.row && cell.col === node.col && !cell.isStart && !cell.isEnd
                ? { ...cell, isVisited: true }
                : cell
            )
          )
        );

        if (i === visitedNodesInOrder.length - 1) {
          // Animate shortest path
          shortestPath.forEach((pathNode, pIdx) => {
            setTimeout(() => {
              setGrid((prev) =>
                prev.map((r) =>
                  r.map((cell) =>
                    cell.row === pathNode.row &&
                    cell.col === pathNode.col &&
                    !cell.isStart &&
                    !cell.isEnd
                      ? { ...cell, isPath: true }
                      : cell
                  )
                )
              );
              if (pIdx === shortestPath.length - 1) {
                setIsRunning(false);
                toast.success(`A* 최단 경로 탐색 완료! (길이: ${shortestPath.length}칸)`);
              }
            }, pIdx * 30);
          });
        }
      }, i * 15);
    });
  };

  const handleGenerateMaze = () => {
    if (isRunning) return;
    setGrid((prev) => generateRandomMaze(prev));
    toast.info('랜덤 미로가 생성되었습니다.');
  };

  const handleClear = () => {
    if (isRunning) return;
    setGrid(createInitialGrid());
    toast.info('격자 맵이 초기화되었습니다.');
  };

  return (
    <Card sx={{ p: 3, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* 1. Toolbar */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowRoundedIcon />}
            onClick={handleRunAStar}
            disabled={isRunning}
            sx={{ fontWeight: 800 }}
          >
            A* 최단 경로 탐색 시작
          </Button>

          <Button
            variant="outlined"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={handleGenerateMaze}
            disabled={isRunning}
          >
            랜덤 미로 생성
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepRoundedIcon />}
            onClick={handleClear}
            disabled={isRunning}
          >
            초기화
          </Button>
        </Box>

        {/* Legend */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#22c55e' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              출발지
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: '#ef4444' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              도착지
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#1e293b' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              장애물 (벽)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#38bdf8' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              탐색 영역
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 14, height: 14, bgcolor: '#eab308' }} />
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              최단 경로
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 2. Interactive Grid Canvas */}
      <Box
        onMouseLeave={handleMouseUp}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          p: 2,
          bgcolor: '#0f172a',
          borderRadius: 2,
          overflowX: 'auto',
          userSelect: 'none',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {grid.map((row, rIdx) => (
            <Box key={rIdx} sx={{ display: 'flex', gap: '2px' }}>
              {row.map((cell) => {
                let cellBg = '#1e293b';
                if (cell.isStart) cellBg = '#22c55e';
                else if (cell.isEnd) cellBg = '#ef4444';
                else if (cell.isWall) cellBg = '#020617';
                else if (cell.isPath) cellBg = '#eab308';
                else if (cell.isVisited) cellBg = '#0284c7';

                return (
                  <Box
                    key={`${cell.row}-${cell.col}`}
                    onMouseDown={() => handleMouseDown(cell.row, cell.col)}
                    onMouseEnter={() => handleMouseEnter(cell.row, cell.col)}
                    onMouseUp={handleMouseUp}
                    sx={{
                      width: { xs: 18, sm: 24 },
                      height: { xs: 18, sm: 24 },
                      bgcolor: cellBg,
                      borderRadius: cell.isStart || cell.isEnd ? '50%' : '2px',
                      cursor: cell.isStart || cell.isEnd ? 'default' : 'pointer',
                      transition:
                        cell.isVisited || cell.isPath
                          ? 'background-color 0.2s ease, transform 0.15s'
                          : 'none',
                      transform: cell.isPath ? 'scale(1.15)' : 'none',
                      border: '1px solid rgba(255,255,255,0.05)',
                    }}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
