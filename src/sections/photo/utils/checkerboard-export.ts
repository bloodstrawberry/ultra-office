/** A square is half the width of the repeating checkerboard tile. */
export function checkerboardBackground(squareSize: number): string {
  return `repeating-conic-gradient(#cbd5e1 0% 25%, #f1f5f9 0% 50%) 50% / ${squareSize * 2}px ${squareSize * 2}px`;
}

/** Flatten transparent pixels onto the checkerboard used by the photo editors. */
export function exportCheckerboardJpeg(source: HTMLCanvasElement, squareSize = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = source.width;
  canvas.height = source.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('JPEG export canvas is unavailable');

  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#cbd5e1';
  for (let y = 0; y < canvas.height; y += squareSize) {
    for (let x = 0; x < canvas.width; x += squareSize) {
      if ((x / squareSize + y / squareSize) % 2 === 1) {
        ctx.fillRect(x, y, squareSize, squareSize);
      }
    }
  }
  ctx.drawImage(source, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.95);
}
