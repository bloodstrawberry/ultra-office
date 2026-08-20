import type { WordDocSection, WordDocumentMetadata } from '../types';

import JSZip from 'jszip';

// Helper to escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Convert WordDocSections & Metadata into valid Microsoft Word (.docx) package using JSZip
export async function generateDocxBlob(
  metadata: WordDocumentMetadata,
  sections: WordDocSection[]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>
  <Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/>
</Relationships>`
  );

  // 4. word/styles.xml
  const themeHex = metadata.themeColor.replace('#', '') || '1E40AF';
  zip.file(
    'word/styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="맑은 고딕" w:hAnsi="맑은 고딕" w:eastAsia="맑은 고딕"/>
        <w:sz w:val="22"/>
        <w:color w:val="333333"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`
  );

  // 5. word/header1.xml
  zip.file(
    'word/header1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="right"/></w:pPr>
    <w:r>
      <w:rPr><w:sz w:val="18"/><w:color w:val="888888"/></w:rPr>
      <w:t>${escapeXml(metadata.headerText || metadata.company || 'Ultra Office DocMaster')}</w:t>
    </w:r>
  </w:p>
</w:hdr>`
  );

  // 6. word/footer1.xml
  zip.file(
    'word/footer1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p>
    <w:pPr><w:jc w:val="center"/></w:pPr>
    <w:r>
      <w:rPr><w:sz w:val="18"/><w:color w:val="888888"/></w:rPr>
      <w:t>${escapeXml(metadata.footerText || metadata.date || 'Ultra Office')}</w:t>
    </w:r>
  </w:p>
</w:ftr>`
  );

  // 7. word/document.xml - Body assembly
  let bodyXml = '';

  // Document Title Header
  bodyXml += `
  <w:p>
    <w:pPr>
      <w:jc w:val="center"/>
      <w:spacing w:before="240" w:after="120"/>
    </w:pPr>
    <w:r>
      <w:rPr>
        <w:b/>
        <w:sz w:val="48"/>
        <w:color w:val="${themeHex}"/>
      </w:rPr>
      <w:t>${escapeXml(metadata.title || '문서 제목')}</w:t>
    </w:r>
  </w:p>`;

  if (metadata.subtitle) {
    bodyXml += `
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="360"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:sz w:val="26"/>
          <w:color w:val="666666"/>
        </w:rPr>
        <w:t>${escapeXml(metadata.subtitle)}</w:t>
      </w:r>
    </w:p>`;
  }

  // Metadata block (Author / Date / Version)
  bodyXml += `
  <w:p>
    <w:pPr>
      <w:jc w:val="right"/>
      <w:spacing w:after="240"/>
    </w:pPr>
    <w:r>
      <w:rPr><w:sz w:val="18"/><w:color w:val="888888"/></w:rPr>
      <w:t>작성자: ${escapeXml(metadata.author || '담당자')} | 일자: ${escapeXml(metadata.date || '2026.08.20')} | 버전: ${escapeXml(metadata.version || 'v1.0')}</w:t>
    </w:r>
  </w:p>`;

  // Render each section
  sections.forEach((sec) => {
    if (sec.type === 'heading1') {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="360" w:after="120"/>
          <w:pBdr>
            <w:bottom w:val="single" w:sz="12" w:space="4" w:color="${themeHex}"/>
          </w:pBdr>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="32"/>
            <w:color w:val="${themeHex}"/>
          </w:rPr>
          <w:t>${escapeXml(sec.content)}</w:t>
        </w:r>
      </w:p>`;
    } else if (sec.type === 'heading2') {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:spacing w:before="240" w:after="80"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:b/>
            <w:sz w:val="26"/>
            <w:color w:val="1E293B"/>
          </w:rPr>
          <w:t>${escapeXml(sec.content)}</w:t>
        </w:r>
      </w:p>`;
    } else if (sec.type === 'bullet') {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:ind w:left="400"/>
          <w:spacing w:after="60"/>
        </w:pPr>
        <w:r>
          <w:rPr><w:b/><w:color w:val="${themeHex}"/></w:rPr>
          <w:t>• </w:t>
        </w:r>
        <w:r>
          <w:rPr>
            ${sec.bold ? '<w:b/>' : ''}
            ${sec.italic ? '<w:i/>' : ''}
          </w:rPr>
          <w:t>${escapeXml(sec.content)}</w:t>
        </w:r>
      </w:p>`;
    } else if (sec.type === 'callout' || sec.type === 'quote') {
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:pBdr>
            <w:left w:val="single" w:sz="24" w:space="12" w:color="${themeHex}"/>
          </w:pBdr>
          <w:ind w:left="300" w:right="300"/>
          <w:spacing w:before="120" w:after="120"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:i/>
            <w:color w:val="475569"/>
            <w:sz w:val="21"/>
          </w:rPr>
          <w:t>${escapeXml(sec.content)}</w:t>
        </w:r>
      </w:p>`;
    } else if (sec.type === 'table' && sec.tableData && sec.tableData.length > 0) {
      bodyXml += `
      <w:tbl>
        <w:tblPr>
          <w:tblW w:w="0" w:type="auto"/>
          <w:tblBorders>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            <w:left w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            <w:right w:val="single" w:sz="6" w:space="0" w:color="CBD5E1"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
            <w:insideV w:val="single" w:sz="4" w:space="0" w:color="E2E8F0"/>
          </w:tblBorders>
        </w:tblPr>`;

      sec.tableData.forEach((row, rowIdx) => {
        const isHeader = rowIdx === 0;
        bodyXml += '<w:tr>';
        row.forEach((cellText) => {
          bodyXml += `
          <w:tc>
            <w:tcPr>
              <w:tcW w:w="2500" w:type="dxa"/>
              ${isHeader ? `<w:shd w:val="clear" w:color="auto" w:fill="F1F5F9"/>` : ''}
            </w:tcPr>
            <w:p>
              <w:pPr>
                <w:spacing w:before="60" w:after="60"/>
                <w:jc w:val="${isHeader ? 'center' : 'left'}"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  ${isHeader ? `<w:b/><w:color w:val="${themeHex}"/>` : ''}
                </w:rPr>
                <w:t>${escapeXml(cellText)}</w:t>
              </w:r>
            </w:p>
          </w:tc>`;
        });
        bodyXml += '</w:tr>';
      });

      bodyXml += '</w:tbl>';
    } else {
      // Regular Paragraph
      const jcVal = sec.alignment || 'left';
      bodyXml += `
      <w:p>
        <w:pPr>
          <w:jc w:val="${jcVal}"/>
          <w:spacing w:before="60" w:after="100" w:line="280" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            ${sec.bold ? '<w:b/>' : ''}
            ${sec.italic ? '<w:i/>' : ''}
          </w:rPr>
          <w:t xml:space="preserve">${escapeXml(sec.content)}</w:t>
        </w:r>
      </w:p>`;
    }
  });

  // Section properties (Page size A4 & Header/Footer binding)
  bodyXml += `
    <w:sectPr>
      <w:headerReference w:type="default" r:id="rId2" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:footerReference w:type="default" r:id="rId3" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>`;

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyXml}
  </w:body>
</w:document>`
  );

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
}

// Download blob directly to user machine
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
