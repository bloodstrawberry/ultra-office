'use client';

import type { HwpDocument } from '../types';

import React from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

// ----------------------------------------------------------------------

interface HwpViewerProps {
  document: HwpDocument;
  zoomLevel: number;
}

export function HwpViewer({ document, zoomLevel }: HwpViewerProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        p: { xs: 1.5, sm: 3 },
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'grey.900' : 'grey.200'),
        minHeight: '100%',
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 820,
          display: 'flex',
          justifyContent: 'center',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease',
          mb: zoomLevel > 100 ? `${((zoomLevel - 100) / 100) * 1160}px` : 0,
        }}
      >
        {/* A4 Paper simulation card */}
        <Card
          sx={{
            width: '100%',
            minHeight: 1160,
            p: { xs: 3, sm: 6 },
            bgcolor: '#ffffff',
            color: '#111827',
            boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            borderRadius: 1.5,
            fontFamily: "'Nanum Myeongjo', 'Noto Serif KR', serif, 'Public Sans'",
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Document Header Info Bar */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '2px solid #1e293b',
              pb: 1.5,
              mb: 1,
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              {document.fileName}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700 }}>
              {document.lastModified || '한글 공문서'}
            </Typography>
          </Box>

          {/* Content Render Sections */}
          {document.sections.map((section) => (
            <Box key={section.id} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Paragraphs */}
              {section.paragraphs.map((p) => {
                const isMainTitle = p.headingLevel === 1;

                return (
                  <Box
                    key={p.id}
                    sx={{
                      textAlign: p.align || 'left',
                      mb: p.isHeading ? 1.5 : 0.5,
                    }}
                  >
                    <Typography
                      component="div"
                      sx={{
                        display: isMainTitle ? 'inline-block' : 'block',
                        textAlign: p.align || 'left',
                        fontWeight: p.isBold ? 800 : 400,
                        fontSize: p.fontSize ? `${p.fontSize * 1.05}px` : '15px',
                        lineHeight: 1.8,
                        color: '#1e293b',
                        whiteSpace: 'pre-wrap',
                        letterSpacing: '-0.02em',
                        ...(isMainTitle && {
                          borderBottom: '3px double #1d4ed8',
                          pb: 0.5,
                          px: { xs: 1, sm: 2 },
                          letterSpacing: '0.02em',
                        }),
                      }}
                    >
                      {p.text}
                    </Typography>
                  </Box>
                );
              })}

              {/* Tables */}
              {section.tables.map((tbl) => (
                <Box key={tbl.id} sx={{ my: 1.5 }}>
                  {tbl.caption && (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: 700, color: '#475569', mb: 0.5, display: 'block' }}
                    >
                      [{tbl.caption}]
                    </Typography>
                  )}
                  <TableContainer
                    sx={{
                      border: '1.5px solid #334155',
                      borderRadius: 0,
                      bgcolor: '#ffffff',
                    }}
                  >
                    <Table size="small">
                      {tbl.rows.length > 0 && tbl.rows[0].some((c) => c.isHeader) && (
                        <TableHead>
                          <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                            {tbl.rows[0].map((cell, cIdx) => (
                              <TableCell
                                key={cIdx}
                                align="center"
                                sx={{
                                  fontWeight: 800,
                                  borderRight: '1px solid #cbd5e1',
                                  borderBottom: '1.5px solid #334155',
                                  color: '#0f172a',
                                  fontSize: '13px',
                                  py: 1.2,
                                }}
                              >
                                {cell.text}
                              </TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                      )}
                      <TableBody>
                        {tbl.rows
                          .filter((_, rIdx) => !(rIdx === 0 && tbl.rows[0].some((c) => c.isHeader)))
                          .map((row, rIdx) => (
                            <TableRow
                              key={rIdx}
                              sx={{
                                '&:nth-of-type(even)': { bgcolor: '#f8fafc' },
                                '&:last-child td': { borderBottom: 0 },
                              }}
                            >
                              {row.map((cell, cIdx) => (
                                <TableCell
                                  key={cIdx}
                                  sx={{
                                    borderRight: '1px solid #e2e8f0',
                                    borderBottom: '1px solid #e2e8f0',
                                    color: '#1e293b',
                                    fontSize: '13px',
                                    py: 1,
                                    px: 1.5,
                                  }}
                                >
                                  {cell.text}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              ))}
            </Box>
          ))}
        </Card>
      </Box>
    </Box>
  );
}
