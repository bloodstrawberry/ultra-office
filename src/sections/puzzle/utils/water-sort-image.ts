import { TUBE_CAPACITY, type WaterColorDef } from './water-sort-solver';

type RGB = [number, number, number];

export interface ImportedWaterSort {
  tubes: number[][];
  colors: Record<number, WaterColorDef>;
  balanced: boolean;
}

function isLiquid([r, g, b]: RGB): boolean {
  const maximum = Math.max(r, g, b);
  const minimum = Math.min(r, g, b);
  return maximum > 105 && maximum - minimum > 48 && maximum - minimum > maximum * 0.27;
}

function runs(values: number[], threshold: number, minimumLength: number): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  let start = -1;
  for (let i = 0; i <= values.length; i += 1) {
    if (i < values.length && values[i] >= threshold) {
      if (start < 0) start = i;
    } else if (start >= 0) {
      if (i - start >= minimumLength) result.push([start, i - 1]);
      start = -1;
    }
  }
  return result;
}

function distance(a: RGB, b: RGB): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

function toHex([r, g, b]: RGB): string {
  return `#${[r, g, b].map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function parseWaterSortImage(image: ImageData): ImportedWaterSort {
  const { width, height, data } = image;
  const pixel = (x: number, y: number): RGB => {
    const offset = (y * width + x) * 4;
    return [data[offset], data[offset + 1], data[offset + 2]];
  };
  const columnCounts = Array.from({ length: width }, (_, x) => {
    let count = 0;
    for (let y = 0; y < height; y += 1) if (isLiquid(pixel(x, y))) count += 1;
    return count;
  });
  const columns = runs(
    columnCounts,
    Math.max(8, Math.round(height * 0.045)),
    Math.max(3, Math.round(width * 0.018))
  );
  const samples: RGB[][] = [];

  for (const [left, right] of columns) {
    const centerX = Math.round((left + right) / 2);
    const rowCounts = Array.from({ length: height }, (_, y) => {
      let count = 0;
      for (let x = Math.max(left, centerX - 2); x <= Math.min(right, centerX + 2); x += 1) {
        if (isLiquid(pixel(x, y))) count += 1;
      }
      return count;
    });
    for (const [top, bottom] of runs(rowCounts, 2, Math.max(12, Math.round(height * 0.08)))) {
      const layerHeight = (bottom - top + 1) / TUBE_CAPACITY;
      const tube = Array.from({ length: TUBE_CAPACITY }, (_, layer) => {
        const y = Math.max(top, Math.min(bottom, Math.round(bottom - layerHeight * (layer + 0.5))));
        const colors: RGB[] = [];
        for (let dy = -1; dy <= 1; dy += 1) {
          for (let dx = -1; dx <= 1; dx += 1) {
            const color = pixel(
              Math.max(0, Math.min(width - 1, centerX + dx)),
              Math.max(0, Math.min(height - 1, y + dy))
            );
            if (isLiquid(color)) colors.push(color);
          }
        }
        if (colors.length < 4)
          throw new Error('시험관의 색상 일부를 읽지 못했습니다. 선명한 이미지를 사용해 주세요.');
        return [0, 1, 2].map((channel) =>
          Math.round(colors.reduce((total, color) => total + color[channel], 0) / colors.length)
        ) as RGB;
      });
      samples.push(tube);
    }
  }

  if (samples.length < 2) throw new Error('이미지에서 시험관을 찾지 못했습니다.');

  // Columns are scanned left to right; restore the visual row order.
  const located = samples.map((tube, index) => ({ tube, index }));
  const rows = located.length / columns.length;
  const ordered = Number.isInteger(rows)
    ? Array.from({ length: rows }, (_, row) =>
        located.filter((item) => item.index % rows === row)
      ).flat()
    : located;
  const clusters: Array<{ sum: RGB; count: number }> = [];
  const tubes = ordered.map(({ tube }) =>
    tube.map((color) => {
      const index = clusters.findIndex(
        ({ sum, count }) => distance(color, sum.map((value) => value / count) as RGB) < 60
      );
      if (index >= 0) {
        const cluster = clusters[index];
        cluster.sum = cluster.sum.map((value, channel) => value + color[channel]) as RGB;
        cluster.count += 1;
        return index + 1;
      }
      clusters.push({ sum: [...color], count: 1 });
      return clusters.length;
    })
  );
  const balanced = clusters.every(({ count }) => count === TUBE_CAPACITY);
  const colors: Record<number, WaterColorDef> = {};
  clusters.forEach(({ sum, count }, index) => {
    const hex = toHex(sum.map((value) => value / count) as RGB);
    colors[index + 1] = {
      id: index + 1,
      name: `이미지 색상 ${index + 1}`,
      color: hex,
      gradient: `linear-gradient(105deg, ${hex} 0%, ${hex} 100%)`,
    };
  });
  tubes.push([], []);
  return { tubes, colors, balanced };
}

export async function readWaterSortImage(file: File): Promise<ImportedWaterSort> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일을 선택해 주세요.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('이미지를 읽을 수 없습니다.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return parseWaterSortImage(context.getImageData(0, 0, canvas.width, canvas.height));
  } finally {
    bitmap.close();
  }
}
