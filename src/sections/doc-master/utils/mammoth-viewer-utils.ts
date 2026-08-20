declare global {
  interface Window {
    mammoth?: any;
  }
}

// Load mammoth.js library script dynamically
export async function loadMammothJs(): Promise<void> {
  if (typeof window === 'undefined' || window.mammoth) return;

  const scriptId = 'mammoth-cdn-script';
  if (document.getElementById(scriptId)) {
    await new Promise<void>((resolve) => {
      const el = document.getElementById(scriptId) as HTMLScriptElement;
      if (el) el.addEventListener('load', () => resolve());
      else resolve();
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

// Convert DOCX ArrayBuffer into clean HTML
export async function convertDocxToHtml(
  arrayBuffer: ArrayBuffer
): Promise<{ value: string; messages: unknown[] }> {
  await loadMammothJs();

  if (!window.mammoth) {
    throw new Error('Mammoth.js 라이브러리를 로드할 수 없습니다.');
  }

  const options = {
    styleMap: [
      "p[style-name='Title'] => h1.doc-title:fresh",
      "p[style-name='Subtitle'] => p.doc-subtitle:fresh",
      "p[style-name='Heading 1'] => h2.doc-h2:fresh",
      "p[style-name='Heading 2'] => h3.doc-h3:fresh",
      "p[style-name='Heading 3'] => h4.doc-h4:fresh",
      'table => table.doc-table:fresh',
    ],
  };

  return window.mammoth.convertToHtml({ arrayBuffer }, options);
}
