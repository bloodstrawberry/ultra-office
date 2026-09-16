'use client';

import { useId, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import SchemaIcon from '@mui/icons-material/Schema';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import { alpha, type Theme, type SxProps } from '@mui/material/styles';

// ----------------------------------------------------------------------

interface ParsedErdColumn {
  type: string;
  name: string;
  isPk: boolean;
  isFk: boolean;
  comment?: string;
}

interface ParsedErdTable {
  name: string;
  columns: ParsedErdColumn[];
}

interface ParsedErdRelation {
  from: string;
  to: string;
  relationType: string;
  label?: string;
}

interface SqldErdRendererProps {
  chart: string;
  idPrefix?: string;
  sx?: SxProps<Theme>;
}

// Simple fallback parser for Mermaid erDiagram syntax
function parseMermaidErd(chartText: string): {
  tables: ParsedErdTable[];
  relations: ParsedErdRelation[];
} {
  const tables: ParsedErdTable[] = [];
  const relations: ParsedErdRelation[] = [];

  const lines = chartText.split('\n');
  let currentTable: ParsedErdTable | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line === 'erDiagram') continue;

    // Table end
    if (line === '}') {
      if (currentTable) {
        tables.push(currentTable);
        currentTable = null;
      }
      continue;
    }

    // Table start: e.g. "고객 {" or "사원 {"
    const tableMatch = line.match(/^([a-zA-Z0-9_\uAC00-\uD7A3]+)\s*\{$/);
    if (tableMatch) {
      currentTable = {
        name: tableMatch[1],
        columns: [],
      };
      continue;
    }

    // Inside table: column definition, e.g. "string 고객번호 PK" or "string 주민번호 '주민'"
    if (currentTable) {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const colType = parts[0];
        const colName = parts[1];
        const rest = parts.slice(2).join(' ');
        const isPk = rest.includes('PK');
        const isFk = rest.includes('FK');
        const commentMatch = rest.match(/["']([^"']+)["']/);
        const comment = commentMatch ? commentMatch[1] : undefined;

        currentTable.columns.push({
          type: colType,
          name: colName,
          isPk,
          isFk,
          comment,
        });
      }
      continue;
    }

    // Relation line: e.g. '고객 ||--o{ 주문 : "한다"' or 'A1 ||--|| B1 : "1대1"'
    const relMatch = line.match(
      /^([a-zA-Z0-9_\uAC00-\uD7A3]+)\s*(\|\|--\|\||\|\|--o\{|\}o--o\{|\|o--o\{|\|\|--o\||\|o--\|\||\}o--\|\|)\s*([a-zA-Z0-9_\uAC00-\uD7A3]+)(?:\s*:\s*["']([^"']+)["'])?/
    );
    if (relMatch) {
      relations.push({
        from: relMatch[1],
        relationType: relMatch[2],
        to: relMatch[3],
        label: relMatch[4],
      });
    }
  }

  if (currentTable) {
    tables.push(currentTable);
  }

  return { tables, relations };
}

export function SqldErdRenderer({ chart, idPrefix = 'sqld_erd', sx }: SqldErdRendererProps) {
  const uniqueId = useId().replace(/:/g, '_');
  const elementId = `${idPrefix}_${uniqueId}`;

  const [svgHtml, setSvgHtml] = useState<string>('');
  const [useFallback, setUseFallback] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    if (!mounted || !chart || !chart.trim()) {
      return () => {
        isCancelled = true;
      };
    }

    const renderMermaid = async () => {
      try {
        // Attempt dynamic import of mermaid if available
        const mermaidModule = await import(/* webpackIgnore: true */ 'mermaid' as string);
        const mermaid = mermaidModule.default || mermaidModule;

        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'inherit',
          er: {
            useMaxWidth: true,
            layoutDirection: 'TB',
          },
        });

        let validChart = chart.trim();
        if (!validChart.startsWith('erDiagram')) {
          validChart = `erDiagram\n${validChart}`;
        }

        const renderId = `render_${elementId}_${Date.now()}`;
        const { svg } = await mermaid.render(renderId, validChart);

        const tempElem = document.getElementById(renderId);
        if (tempElem) {
          tempElem.remove();
        }

        if (!isCancelled) {
          setSvgHtml(svg);
          setUseFallback(false);
        }
      } catch {
        // If mermaid library is not installed or throws, gracefully fallback to structured view
        if (!isCancelled) {
          setUseFallback(true);
        }
      }
    };

    renderMermaid();

    return () => {
      isCancelled = true;
    };
  }, [chart, mounted, elementId]);

  if (!mounted || !chart || !chart.trim()) {
    return null;
  }

  // If Mermaid rendered SVG successfully
  if (svgHtml && !useFallback) {
    return (
      <Box
        sx={{
          p: 2,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          border: (t) => `1px solid ${t.vars.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          maxWidth: '100%',
          '& svg': {
            maxWidth: '100%',
            height: 'auto',
          },
          ...sx,
        }}
      >
        <Box
          dangerouslySetInnerHTML={{ __html: svgHtml }}
          sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}
        />
      </Box>
    );
  }

  // Fallback: Elegant Structured ERD View
  const { tables, relations } = parseMermaidErd(chart);

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        bgcolor: (t) => alpha(t.palette.primary.main, 0.02),
        borderColor: (t) => alpha(t.palette.primary.main, 0.2),
        borderRadius: 2,
        ...sx,
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <SchemaIcon sx={{ color: 'primary.main', fontSize: 20 }} />
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
          ERD 다이어그램 (Entity Relationship Diagram)
        </Typography>
      </Box>

      {/* Relations Summary */}
      {relations.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {relations.map((rel, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.8,
                px: 1.5,
                py: 0.6,
                borderRadius: 1,
                bgcolor: 'background.paper',
                border: (t) => `1px solid ${t.vars.palette.divider}`,
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {rel.from}
              </Typography>
              <Chip
                label={
                  rel.relationType === '||--||'
                    ? '1 : 1'
                    : rel.relationType === '||--o{' || rel.relationType === '|o--o{'
                      ? '1 : N'
                      : rel.relationType === '}o--o{'
                        ? 'N : M'
                        : rel.relationType
                }
                size="small"
                color="info"
                variant="soft"
                sx={{ height: 20, fontSize: 11, fontWeight: 700 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {rel.to}
              </Typography>
              {rel.label && (
                <Typography variant="caption" sx={{ color: 'text.secondary', ml: 0.5 }}>
                  ({rel.label})
                </Typography>
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Tables Grid */}
      {tables.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'flex-start',
          }}
        >
          {tables.map((table, tIdx) => (
            <Box
              key={tIdx}
              sx={{
                flex: '1 1 220px',
                maxWidth: { xs: '100%', sm: 320 },
                borderRadius: 1.5,
                overflow: 'hidden',
                border: (t) => `1px solid ${t.vars.palette.divider}`,
                bgcolor: 'background.paper',
                boxShadow: (t) => t.customShadows?.z1,
              }}
            >
              {/* Table Name */}
              <Box
                sx={{
                  py: 0.8,
                  px: 1.5,
                  bgcolor: (t) => alpha(t.palette.primary.main, 0.08),
                  borderBottom: (t) => `1px solid ${t.vars.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.8,
                }}
              >
                <StorageRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {table.name}
                </Typography>
              </Box>

              {/* Columns */}
              <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {table.columns.length === 0 ? (
                  <Typography variant="caption" sx={{ color: 'text.disabled', p: 0.5 }}>
                    엔터티 정의됨
                  </Typography>
                ) : (
                  table.columns.map((col, cIdx) => (
                    <Box
                      key={cIdx}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 0.8,
                        py: 0.3,
                        borderRadius: 0.8,
                        fontSize: 12,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                        {col.isPk && (
                          <Chip
                            label="PK"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              bgcolor: 'warning.lighter',
                              color: 'warning.darker',
                            }}
                          />
                        )}
                        {col.isFk && (
                          <Chip
                            label="FK"
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: '0.62rem',
                              fontWeight: 800,
                              bgcolor: 'info.lighter',
                              color: 'info.darker',
                            }}
                          />
                        )}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: col.isPk ? 700 : 500,
                            color: col.isPk ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          {col.name}
                        </Typography>
                        {col.comment && (
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.disabled', fontSize: 11 }}
                          >
                            {col.comment}
                          </Typography>
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.disabled',
                          fontFamily: 'monospace',
                          fontSize: 11,
                        }}
                      >
                        {col.type}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {/* Raw Chart Toggle / Preview */}
      <Box sx={{ mt: 1.5, pt: 1, borderTop: (t) => `1px dashed ${t.vars.palette.divider}` }}>
        <Typography
          variant="caption"
          component="pre"
          sx={{
            m: 0,
            p: 1,
            borderRadius: 1,
            bgcolor: (t) => alpha(t.palette.grey[500], 0.08),
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'text.secondary',
            overflowX: 'auto',
          }}
        >
          {chart.trim()}
        </Typography>
      </Box>
    </Card>
  );
}
