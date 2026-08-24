'use client';

import type { CircuitGate, CircuitWire } from '../types';

import { toast } from 'sonner';
import React, { useRef, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

// ----------------------------------------------------------------------

interface CircuitCanvasProps {
  gates: CircuitGate[];
  wires: CircuitWire[];
  onToggleSwitch: (gateId: string) => void;
  onAddWire: (wire: CircuitWire) => void;
  onDeleteGate: (gateId: string) => void;
  onDeleteWire: (wireId: string) => void;
  onMoveGate: (gateId: string, x: number, y: number) => void;
}

export function CircuitCanvas({
  gates,
  wires,
  onToggleSwitch,
  onAddWire,
  onDeleteGate,
  onDeleteWire,
  onMoveGate,
}: CircuitCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [connectingPin, setConnectingPin] = useState<{
    gateId: string;
    pinId: string;
    type: 'input' | 'output';
    x: number;
    y: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dragging Gate State
  const [draggingGateId, setDraggingGateId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDownGate = (e: React.MouseEvent, gate: CircuitGate) => {
    e.stopPropagation();
    setDraggingGateId(gate.id);
    setDragOffset({ x: e.clientX - gate.x, y: e.clientY - gate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setMousePos({ x: curX, y: curY });

    if (draggingGateId) {
      onMoveGate(
        draggingGateId,
        Math.max(10, curX - dragOffset.x),
        Math.max(10, curY - dragOffset.y)
      );
    }
  };

  const handleMouseUp = () => {
    setDraggingGateId(null);
  };

  const handlePinClick = (
    e: React.MouseEvent,
    gate: CircuitGate,
    pin: { id: string; type: 'input' | 'output'; relX: number; relY: number }
  ) => {
    e.stopPropagation();

    const pinAbsX = gate.x + pin.relX;
    const pinAbsY = gate.y + pin.relY;

    if (!connectingPin) {
      // Start connecting wire
      setConnectingPin({ gateId: gate.id, pinId: pin.id, type: pin.type, x: pinAbsX, y: pinAbsY });
      toast.info('연결할 반대편 핀을 클릭하세요.');
    } else {
      // Try to complete wire connection
      if (connectingPin.gateId === gate.id) {
        toast.warning('동일한 게이트 내에서는 연결할 수 없습니다.');
        setConnectingPin(null);
        return;
      }
      if (connectingPin.type === pin.type) {
        toast.warning('입력과 출력 핀 사이만 연결할 수 있습니다.');
        setConnectingPin(null);
        return;
      }

      // Valid connection: output -> input
      const fromGateId = connectingPin.type === 'output' ? connectingPin.gateId : gate.id;
      const fromPinId = connectingPin.type === 'output' ? connectingPin.pinId : pin.id;
      const toGateId = connectingPin.type === 'input' ? connectingPin.gateId : gate.id;
      const toPinId = connectingPin.type === 'input' ? connectingPin.pinId : pin.id;

      onAddWire({
        id: `wire_${Date.now()}`,
        fromGateId,
        fromPinId,
        toGateId,
        toPinId,
      });

      setConnectingPin(null);
      toast.success('전선이 연결되었습니다.');
    }
  };

  const getPinCoords = (gateId: string, pinId: string, isInput: boolean) => {
    const gate = gates.find((g) => g.id === gateId);
    if (!gate) return { x: 0, y: 0 };
    const pinList = isInput ? gate.inputs : gate.outputs;
    const pin = pinList.find((p) => p.id === pinId);
    if (!pin) return { x: gate.x, y: gate.y };
    return { x: gate.x + pin.relX, y: gate.y + pin.relY };
  };

  return (
    <Card
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      sx={{
        width: '100%',
        height: 600,
        bgcolor: '#0f172a',
        position: 'relative',
        overflow: 'hidden',
        userSelect: 'none',
        borderRadius: 2,
        border: '1.5px solid #334155',
        backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* SVG for drawing connecting Wires */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
      >
        {wires.map((wire) => {
          const p1 = getPinCoords(wire.fromGateId, wire.fromPinId, false);
          const p2 = getPinCoords(wire.toGateId, wire.toPinId, true);
          const fromGate = gates.find((g) => g.id === wire.fromGateId);
          const isHigh = fromGate?.outputs.find((p) => p.id === wire.fromPinId)?.value ?? false;

          const midX = (p1.x + p2.x) / 2;
          const pathD = `M ${p1.x} ${p1.y} C ${midX} ${p1.y}, ${midX} ${p2.y}, ${p2.x} ${p2.y}`;

          return (
            <g key={wire.id} style={{ pointerEvents: 'auto' }}>
              {/* Thick clickable wire hit area */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                onClick={() => onDeleteWire(wire.id)}
                style={{ cursor: 'pointer' }}
              />
              {/* Main signal line */}
              <path
                d={pathD}
                fill="none"
                stroke={isHigh ? '#22c55e' : '#64748b'} // Green for 1, Grey for 0
                strokeWidth={isHigh ? 3.5 : 2.5}
                strokeDasharray={isHigh ? 'none' : '4 2'}
              />
            </g>
          );
        })}

        {/* Temporary drawing wire */}
        {connectingPin && (
          <line
            x1={connectingPin.x}
            y1={connectingPin.y}
            x2={mousePos.x}
            y2={mousePos.y}
            stroke="#38bdf8"
            strokeWidth={2.5}
            strokeDasharray="5 3"
          />
        )}
      </svg>

      {/* Render Gates / Components */}
      {gates.map((gate) => {
        const isSwitch = gate.type === 'SWITCH';
        const isLed = gate.type === 'LED';
        const isHigh = isSwitch ? !!gate.state : isLed ? !!gate.inputs[0]?.value : false;

        return (
          <Box
            key={gate.id}
            onMouseDown={(e) => handleMouseDownGate(e, gate)}
            sx={{
              position: 'absolute',
              left: gate.x,
              top: gate.y,
              width: gate.width,
              height: gate.height,
              bgcolor: isSwitch
                ? isHigh
                  ? '#15803d'
                  : '#1e293b'
                : isLed
                  ? isHigh
                    ? '#b91c1c'
                    : '#1e293b'
                  : '#1e293b',
              color: '#ffffff',
              borderRadius: isSwitch || isLed ? 2 : 1.5,
              border: '2px solid',
              borderColor: isHigh ? (isSwitch ? '#22c55e' : '#ef4444') : '#475569',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: isSwitch ? 'pointer' : 'move',
              boxShadow: isHigh ? '0 0 16px rgba(34, 197, 94, 0.4)' : '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              zIndex: 2,
            }}
            onClick={isSwitch ? () => onToggleSwitch(gate.id) : undefined}
          >
            {/* Component Title */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 900,
                fontSize: isSwitch || isLed ? '11px' : '13px',
                letterSpacing: '0.05em',
              }}
            >
              {isSwitch
                ? isHigh
                  ? 'ON (1)'
                  : 'OFF (0)'
                : isLed
                  ? isHigh
                    ? '💡 ON'
                    : '⚫ OFF'
                  : gate.label}
            </Typography>

            {/* Input Pins */}
            {gate.inputs.map((pin) => (
              <Box
                key={pin.id}
                onClick={(e) => handlePinClick(e, gate, pin)}
                sx={{
                  position: 'absolute',
                  left: -6,
                  top: pin.relY - 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: pin.value ? '#22c55e' : '#64748b',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.3)', bgcolor: '#38bdf8' },
                  zIndex: 3,
                }}
              />
            ))}

            {/* Output Pins */}
            {gate.outputs.map((pin) => (
              <Box
                key={pin.id}
                onClick={(e) => handlePinClick(e, gate, pin)}
                sx={{
                  position: 'absolute',
                  right: -6,
                  top: pin.relY - 6,
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: pin.value ? '#22c55e' : '#64748b',
                  border: '2px solid #ffffff',
                  cursor: 'pointer',
                  '&:hover': { transform: 'scale(1.3)', bgcolor: '#38bdf8' },
                  zIndex: 3,
                }}
              />
            ))}

            {/* Delete button (hover) */}
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteGate(gate.id);
              }}
              sx={{
                position: 'absolute',
                top: -12,
                right: -12,
                bgcolor: '#ef4444',
                color: '#ffffff',
                width: 18,
                height: 18,
                p: 0,
                opacity: 0.8,
                '&:hover': { bgcolor: '#dc2626', opacity: 1 },
              }}
            >
              <DeleteOutlineRoundedIcon sx={{ fontSize: 12 }} />
            </IconButton>
          </Box>
        );
      })}
    </Card>
  );
}
