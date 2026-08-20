import type { WordDocSection, WordTemplateConfig, WordDocumentMetadata } from '../types';

import { generateDocxBlob } from './docx-generator';

// Replace {key} placeholders with actual values
export function renderTemplateText(templateText: string, data: Record<string, string>): string {
  let rendered = templateText;
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    rendered = rendered.replace(regex, data[key] || '');
  });
  return rendered;
}

// Convert markdown-style template text into WordDocSection[]
export function parseTemplateContentToSections(content: string): WordDocSection[] {
  const lines = content.split('\n');
  const sections: WordDocSection[] = [];

  let currentTable: string[][] | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) {
      if (currentTable) {
        sections.push({
          id: `tbl-${Date.now()}-${sections.length}`,
          type: 'table',
          content: '',
          tableData: currentTable,
        });
        currentTable = null;
      }
      continue;
    }

    // Markdown Table Line e.g. | Col1 | Col2 |
    if (rawLine.startsWith('|') && rawLine.endsWith('|')) {
      if (rawLine.includes('---')) {
        // Separator line, skip
        continue;
      }
      const cells = rawLine
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      if (!currentTable) {
        currentTable = [cells];
      } else {
        currentTable.push(cells);
      }
      continue;
    } else if (currentTable) {
      sections.push({
        id: `tbl-${Date.now()}-${sections.length}`,
        type: 'table',
        content: '',
        tableData: currentTable,
      });
      currentTable = null;
    }

    if (rawLine.startsWith('# ')) {
      sections.push({
        id: `sec-${i}`,
        type: 'heading1',
        content: rawLine.replace(/^#\s+/, ''),
      });
    } else if (rawLine.startsWith('## ') || rawLine.startsWith('### ')) {
      sections.push({
        id: `sec-${i}`,
        type: 'heading2',
        content: rawLine.replace(/^###?\s+/, ''),
      });
    } else if (rawLine.startsWith('* ') || rawLine.startsWith('- ')) {
      sections.push({
        id: `sec-${i}`,
        type: 'bullet',
        content: rawLine.replace(/^[*-]\s+/, ''),
      });
    } else if (rawLine.startsWith('> ')) {
      sections.push({
        id: `sec-${i}`,
        type: 'quote',
        content: rawLine.replace(/^>\s+/, ''),
      });
    } else if (rawLine === '---') {
      // Horizontal separator as subtle text or skip
      continue;
    } else {
      sections.push({
        id: `sec-${i}`,
        type: 'paragraph',
        content: rawLine,
      });
    }
  }

  if (currentTable) {
    sections.push({
      id: `tbl-${Date.now()}-${sections.length}`,
      type: 'table',
      content: '',
      tableData: currentTable,
    });
  }

  return sections;
}

// Build final DOCX from Template Config & Data
export async function buildDocxFromTemplate(
  template: WordTemplateConfig,
  data: Record<string, string>
): Promise<Blob> {
  const renderedContent = renderTemplateText(template.sampleContent, data);
  const sections = parseTemplateContentToSections(renderedContent);

  const metadata: WordDocumentMetadata = {
    title: data.title || template.title,
    subtitle: data.company_name || template.category,
    author: data.employee_name || data.recipient_name || data.author || '담당자',
    company: data.company_name || data.issuer_org || 'Ultra Office',
    date: data.contract_date || data.issue_date || '2026.08.20',
    version: '1.0',
    headerText: template.title,
    footerText: data.company_name || 'Ultra Office DocMaster',
    themeColor: '#1e40af',
    accentColor: '#3b82f6',
  };

  return generateDocxBlob(metadata, sections);
}
