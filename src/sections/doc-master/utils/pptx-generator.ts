import type { PptDeck, PptTheme } from '../types';

import { PPT_THEMES } from '../data/presentation-templates';

declare global {
  interface Window {
    PptxGenJS?: any;
  }
}

// Load pptxgenjs library script dynamically
export async function loadPptxGenJs(): Promise<void> {
  if (typeof window === 'undefined' || window.PptxGenJS) return;

  const scriptId = 'pptxgenjs-cdn-script';
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
    script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

// Generate and trigger download of PowerPoint .pptx file
export async function generatePptxFile(
  deck: PptDeck,
  filename: string = 'presentation.pptx'
): Promise<void> {
  await loadPptxGenJs();

  if (!window.PptxGenJS) {
    throw new Error('PptxGenJS 라이브러리를 로드할 수 없습니다.');
  }

  const pptx = new window.PptxGenJS();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = deck.author || 'Ultra Office Team';
  pptx.company = deck.company || 'Ultra Office AI';
  pptx.title = deck.title || 'Presentation';

  const theme: PptTheme = PPT_THEMES[deck.themeId] || PPT_THEMES['navy-tech'];
  const bgHex = theme.bgColor.replace('#', '');
  const titleHex = theme.titleColor.replace('#', '');
  const textHex = theme.textColor.replace('#', '');
  const accentHex = theme.accentColor.replace('#', '');
  const cardBgHex = theme.cardBg.replace('#', '');

  deck.slides.forEach((slideItem) => {
    const slide = pptx.addSlide();
    slide.background = { color: bgHex };

    // Header/Footer branding
    slide.addText(deck.company || 'Ultra Office AI', {
      x: 0.8,
      y: 7.0,
      w: 4.0,
      h: 0.3,
      fontSize: 10,
      color: '888888',
      fontFace: 'Arial',
    });

    if (slideItem.speakerNotes) {
      slide.addNotes(slideItem.speakerNotes);
    }

    if (slideItem.layout === 'title') {
      // 1. Title Slide
      slide.addText(slideItem.title, {
        x: 1.0,
        y: 2.4,
        w: 11.3,
        h: 1.5,
        fontSize: 40,
        bold: true,
        color: titleHex,
        align: 'center',
        fontFace: 'Arial',
      });

      if (slideItem.subtitle) {
        slide.addText(slideItem.subtitle, {
          x: 1.5,
          y: 4.0,
          w: 10.3,
          h: 1.0,
          fontSize: 18,
          color: textHex,
          align: 'center',
          fontFace: 'Arial',
        });
      }

      slide.addText(`발표: ${deck.author || '담당자'} | ${deck.company || '울트라오피스'}`, {
        x: 1.0,
        y: 5.5,
        w: 11.3,
        h: 0.5,
        fontSize: 13,
        color: '94A3B8',
        align: 'center',
      });
    } else if (slideItem.layout === 'kpi-cards') {
      // 2. KPI Metrics Cards Slide
      slide.addText(slideItem.title, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: titleHex,
      });

      if (slideItem.subtitle) {
        slide.addText(slideItem.subtitle, {
          x: 0.8,
          y: 1.6,
          w: 11.7,
          h: 0.5,
          fontSize: 14,
          color: '94A3B8',
        });
      }

      const kpis = slideItem.kpiList || [];
      const cardWidth = 3.6;
      const gap = 0.4;
      const startX = 0.8;

      kpis.forEach((kpi, idx) => {
        const curX = startX + idx * (cardWidth + gap);

        // Background Card Box
        slide.addShape(pptx.ShapeType.rect, {
          x: curX,
          y: 2.6,
          w: cardWidth,
          h: 3.5,
          fill: { color: cardBgHex },
          line: { color: accentHex, width: 1.5 },
        });

        // Value text
        slide.addText(kpi.value, {
          x: curX + 0.2,
          y: 3.2,
          w: cardWidth - 0.4,
          h: 1.0,
          fontSize: 36,
          bold: true,
          color: accentHex,
          align: 'center',
        });

        // Label text
        slide.addText(kpi.label, {
          x: curX + 0.2,
          y: 4.4,
          w: cardWidth - 0.4,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: textHex,
          align: 'center',
        });

        if (kpi.desc) {
          slide.addText(kpi.desc, {
            x: curX + 0.2,
            y: 5.0,
            w: cardWidth - 0.4,
            h: 0.6,
            fontSize: 12,
            color: '94A3B8',
            align: 'center',
          });
        }
      });
    } else if (slideItem.layout === 'chart-bar' || slideItem.layout === 'chart-pie') {
      // 3. Chart Slide
      slide.addText(slideItem.title, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: titleHex,
      });

      const labels = slideItem.chartLabels || ['A', 'B', 'C'];
      const dataVals = slideItem.chartData || [10, 20, 30];

      const chartData = [
        {
          name: slideItem.chartTitle || '데이터',
          labels,
          values: dataVals,
        },
      ];

      const chartType = slideItem.layout === 'chart-bar' ? pptx.ChartType.bar : pptx.ChartType.pie;

      slide.addChart(chartType, chartData, {
        x: 0.8,
        y: 2.2,
        w: 6.5,
        h: 4.2,
        showTitle: false,
        showLegend: true,
        legendPos: 'b',
        chartColors: ['0EA5E9', '38BDF8', '818CF8', 'F43F5E'],
      });

      // Side Bullets Explanation
      if (slideItem.bullets && slideItem.bullets.length > 0) {
        const bulletTexts = slideItem.bullets.map((b) => ({
          text: b,
          options: { breakLine: true, bullet: true },
        }));
        slide.addText(bulletTexts, {
          x: 7.6,
          y: 2.4,
          w: 4.8,
          h: 3.8,
          fontSize: 15,
          color: textHex,
          lineSpacing: 24,
        });
      }
    } else if (slideItem.layout === 'timeline') {
      // 4. Timeline Roadmap Slide
      slide.addText(slideItem.title, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: titleHex,
      });

      const steps = slideItem.timelineSteps || [];
      const colWidth = 3.6;
      const startX = 0.8;

      steps.forEach((st, idx) => {
        const curX = startX + idx * (colWidth + 0.4);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: curX,
          y: 2.6,
          w: colWidth,
          h: 3.6,
          fill: { color: cardBgHex },
          line: { color: accentHex, width: 1 },
        });

        slide.addText(st.step, {
          x: curX + 0.3,
          y: 2.9,
          w: colWidth - 0.6,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: accentHex,
        });

        slide.addText(st.title, {
          x: curX + 0.3,
          y: 3.4,
          w: colWidth - 0.6,
          h: 0.6,
          fontSize: 18,
          bold: true,
          color: textHex,
        });

        slide.addText(st.desc, {
          x: curX + 0.3,
          y: 4.1,
          w: colWidth - 0.6,
          h: 1.8,
          fontSize: 13,
          color: '94A3B8',
        });
      });
    } else if (slideItem.layout === 'team') {
      // 5. Team Profile Slide
      slide.addText(slideItem.title, {
        x: 0.8,
        y: 0.8,
        w: 11.7,
        h: 0.8,
        fontSize: 28,
        bold: true,
        color: titleHex,
      });

      const members = slideItem.teamMembers || [];
      const mWidth = 3.6;
      const startX = 0.8;

      members.forEach((m, idx) => {
        const curX = startX + idx * (mWidth + 0.4);

        slide.addShape(pptx.ShapeType.roundRect, {
          x: curX,
          y: 2.5,
          w: mWidth,
          h: 3.8,
          fill: { color: cardBgHex },
          line: { color: '475569', width: 1 },
        });

        slide.addText(m.name, {
          x: curX + 0.3,
          y: 3.0,
          w: mWidth - 0.6,
          h: 0.5,
          fontSize: 20,
          bold: true,
          color: textHex,
          align: 'center',
        });

        slide.addText(m.role, {
          x: curX + 0.3,
          y: 3.6,
          w: mWidth - 0.6,
          h: 0.4,
          fontSize: 14,
          color: accentHex,
          align: 'center',
          bold: true,
        });

        slide.addText(m.desc, {
          x: curX + 0.3,
          y: 4.2,
          w: mWidth - 0.6,
          h: 1.5,
          fontSize: 12,
          color: '94A3B8',
          align: 'center',
        });
      });
    } else {
      // Standard / Conclusion Slide
      slide.addText(slideItem.title, {
        x: 0.8,
        y: 1.5,
        w: 11.7,
        h: 1.2,
        fontSize: 36,
        bold: true,
        color: titleHex,
        align: 'center',
      });

      if (slideItem.subtitle) {
        slide.addText(slideItem.subtitle, {
          x: 1.5,
          y: 3.0,
          w: 10.3,
          h: 0.8,
          fontSize: 20,
          color: textHex,
          align: 'center',
        });
      }

      if (slideItem.bodyText) {
        slide.addText(slideItem.bodyText, {
          x: 1.5,
          y: 4.2,
          w: 10.3,
          h: 1.2,
          fontSize: 16,
          color: '94A3B8',
          align: 'center',
        });
      }
    }
  });

  await pptx.writeFile({ fileName: filename });
}
