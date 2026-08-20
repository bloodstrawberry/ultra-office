import type { TableRow } from '../types';

// Convert SVG element to PNG data URL or trigger download
export async function downloadSvgAsPng(
  svgElement: SVGSVGElement,
  filename: string = 'math-graph.png',
  scale: number = 2
) {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.crossOrigin = 'anonymous';

    const canvas = document.createElement('canvas');
    const width = (svgElement.clientWidth || 800) * scale;
    const height = (svgElement.clientHeight || 500) * scale;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    await new Promise<void>((resolve, reject) => {
      img.onload = () => {
        // White background for math graphs
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve();
      };
      img.onerror = reject;
      img.src = blobURL;
    });

    URL.revokeObjectURL(blobURL);

    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = pngUrl;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  } catch (err) {
    console.error('Failed to export PNG:', err);
  }
}

// Download raw SVG
export function downloadSvg(svgElement: SVGSVGElement, filename: string = 'math-graph.svg') {
  try {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Failed to export SVG:', err);
  }
}

// Download HTML5 Canvas as PNG
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = '3d-surface.png') {
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('Failed to export canvas:', err);
  }
}

// Export Table of values as CSV
export function exportTableToCsv(rows: TableRow[], filename: string = 'table_of_values.csv') {
  const headers = ['x', 'f(x)', "f'(x) [1st Derivative]", "f''(x) [2nd Derivative]"];
  const csvLines = [headers.join(',')];

  rows.forEach((r) => {
    csvLines.push([r.x, r.fx ?? '', r.dfx ?? '', r.d2fx ?? ''].join(','));
  });

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
