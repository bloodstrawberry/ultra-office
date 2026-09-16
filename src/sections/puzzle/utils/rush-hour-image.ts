import { EXIT_ROW, GRID_SIZE, type Vehicle } from './rush-hour-solver';

type Color = [number, number, number];

function validColor([r, g, b]: Color): boolean {
  return (
    (r > g * 1.35 && r > b * 1.25 && r > 90) ||
    (b > r * 1.18 && b > g * 0.9 && b > 65) ||
    (g > r * 1.25 && g > b * 0.9 && g > 65)
  );
}

function isBoardBackground([r, g, b]: Color): boolean {
  return r > 170 && g > 155 && b > 110 && r >= g && g >= b && r - b > 18 && r - b < 85;
}

export function parseRushHourImage(image: ImageData): Vehicle[] {
  const { width, height, data } = image;
  const pixel = (x: number, y: number): Color => {
    const i = (y * width + x) * 4;
    return [data[i], data[i + 1], data[i + 2]];
  };

  // Find the cream-colored playing area, excluding the white page around it.
  const xs: number[] = [];
  const ys: number[] = [];
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (isBoardBackground(pixel(x, y))) {
        xs.push(x);
        ys.push(y);
      }
    }
  }
  if (xs.length < 100)
    throw new Error('6×6 게임판을 찾지 못했습니다. 게임판만 보이도록 이미지를 잘라 주세요.');
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  const right = Math.max(...xs);
  const bottom = Math.max(...ys);
  const cell = ((right - left + 1) / GRID_SIZE + (bottom - top + 1) / GRID_SIZE) / 2;
  if (Math.abs(right - left - (bottom - top)) > cell * 0.7) {
    throw new Error('정사각형 게임판을 찾지 못했습니다. 게임판만 보이도록 이미지를 잘라 주세요.');
  }

  const visited = new Uint8Array(width * height);
  const vehicles: Vehicle[] = [];
  for (let y = Math.max(0, top); y <= Math.min(height - 1, bottom); y += 1) {
    for (let x = Math.max(0, left); x <= Math.min(width - 1, right); x += 1) {
      const index = y * width + x;
      if (visited[index] || !validColor(pixel(x, y))) continue;
      const seed = pixel(x, y);
      const queue = [index];
      visited[index] = 1;
      let minX = x;
      let maxX = x;
      let minY = y;
      let maxY = y;
      let count = 0;
      for (let head = 0; head < queue.length; head += 1) {
        const current = queue[head];
        const cx = current % width;
        const cy = Math.floor(current / width);
        count += 1;
        minX = Math.min(minX, cx);
        maxX = Math.max(maxX, cx);
        minY = Math.min(minY, cy);
        maxY = Math.max(maxY, cy);
        for (const next of [current - 1, current + 1, current - width, current + width]) {
          if (next < 0 || next >= visited.length || visited[next]) continue;
          const nx = next % width;
          const ny = Math.floor(next / width);
          if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;
          const color = pixel(nx, ny);
          const currentColor = pixel(cx, cy);
          if (
            !validColor(color) ||
            Math.hypot(...color.map((v, channel) => v - currentColor[channel])) > 65
          )
            continue;
          visited[next] = 1;
          queue.push(next);
        }
      }
      if (count < cell * cell * 0.3) continue;
      const horizontal = maxX - minX > maxY - minY;
      const length = Math.round((horizontal ? maxX - minX + 1 : maxY - minY + 1) / cell);
      if (length !== 2 && length !== 3) continue;
      const row = Math.round((minY - top) / cell);
      const col = Math.round((minX - left) / cell);
      const isTarget = seed[0] > seed[1] * 1.35 && seed[0] > seed[2] * 1.25;
      const id = isTarget
        ? 'X'
        : String.fromCharCode(65 + vehicles.filter((v) => !v.isTarget).length);
      vehicles.push({
        id,
        name: isTarget ? '빨간 주인공 차' : `차량 ${id}`,
        length,
        orientation: horizontal ? 'H' : 'V',
        row,
        col,
        color: isTarget ? '#C53131' : '#32849B',
        isTarget,
      });
    }
  }
  if (
    vehicles.filter((v) => v.isTarget).length !== 1 ||
    !vehicles.some((v) => v.isTarget && v.row === EXIT_ROW && v.orientation === 'H')
  ) {
    throw new Error(
      '출구 행의 빨간 자동차를 정확히 읽지 못했습니다. 편집 기능으로 직접 배치해 주세요.'
    );
  }
  if (vehicles.length < 2)
    throw new Error('차량을 충분히 찾지 못했습니다. 게임판만 보이도록 이미지를 잘라 주세요.');
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const occupied = vehicles.some((v) =>
        v.orientation === 'H'
          ? v.row === row && col >= v.col && col < v.col + v.length
          : v.col === col && row >= v.row && row < v.row + v.length
      );
      if (occupied) continue;
      const centerX = Math.round(left + (col + 0.5) * cell);
      const centerY = Math.round(top + (row + 0.5) * cell);
      const [r, g, b] = pixel(centerX, centerY);
      if (Math.max(r, g, b) < 65) {
        const id = `#${row}${col}`;
        vehicles.push({
          id,
          name: '고정 장애물',
          row,
          col,
          orientation: 'H',
          length: 1,
          color: '#202020',
          isFixed: true,
        });
      }
    }
  }
  return vehicles;
}

export async function readRushHourImage(file: File): Promise<Vehicle[]> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일을 선택해 주세요.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) throw new Error('이미지를 읽을 수 없습니다.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return parseRushHourImage(context.getImageData(0, 0, canvas.width, canvas.height));
  } finally {
    bitmap.close();
  }
}
