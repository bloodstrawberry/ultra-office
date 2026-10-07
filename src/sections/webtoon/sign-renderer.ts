export interface SignOptions {
  signFile: string | null;
  backgroundMode: 'white' | 'transparent';
  padding: number;
  footer: number;
  radius: number;
  signSize: number;
  signAngle: number;
  signX: number;
  signY: number;
}

export interface SignAsset {
  file: string;
  image: HTMLImageElement;
  bounds: { x: number; y: number; width: number; height: number };
}

// The supplied PNGs are 500x500, with the artwork in one corner. Use only the
// visible pixels so size and placement controls refer to the actual signature.
export function findSignBounds(image: HTMLImageElement): SignAsset['bounds'] {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('싸인 이미지를 읽을 수 없습니다.');
  context.drawImage(image, 0, 0);
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let left = canvas.width;
  let top = canvas.height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (data[(y * canvas.width + x) * 4 + 3] === 0) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  if (right < left || bottom < top) throw new Error('싸인 이미지가 비어 있습니다.');
  return { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

// Measurements are percentages of the source image width, except signX/Y,
// which are percentages of the full output canvas for direct pointer placement.
export function drawSignedImage(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  options: SignOptions,
  sign: SignAsset | null,
  previewMaxPixels?: number
) {
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const padding = (width * options.padding) / 100;
  const footer = (width * options.footer) / 100;
  const fullWidth = width + padding * 2;
  const fullHeight = height + padding + footer;
  const scale = previewMaxPixels
    ? Math.min(
        1,
        8192 / fullWidth,
        8192 / fullHeight,
        Math.sqrt(previewMaxPixels / (fullWidth * fullHeight))
      )
    : 1;

  canvas.width = Math.max(1, Math.round(fullWidth * scale));
  canvas.height = Math.max(1, Math.round(fullHeight * scale));
  const context = canvas.getContext('2d');
  if (!context) throw new Error('캔버스를 만들 수 없습니다.');

  context.scale(canvas.width / fullWidth, canvas.height / fullHeight);
  if (options.backgroundMode === 'white') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, fullWidth, fullHeight);
  }

  context.save();
  context.beginPath();
  context.roundRect(
    padding,
    padding,
    width,
    height,
    Math.min((width * options.radius) / 100, width / 2, height / 2)
  );
  context.clip();
  context.drawImage(image, padding, padding, width, height);
  context.restore();

  if (sign && options.signFile === sign.file) {
    const signWidth = (width * options.signSize) / 100;
    const signHeight = (signWidth * sign.bounds.height) / sign.bounds.width;
    context.save();
    context.translate((fullWidth * options.signX) / 100, (fullHeight * options.signY) / 100);
    context.rotate((options.signAngle * Math.PI) / 180);
    context.drawImage(
      sign.image,
      sign.bounds.x,
      sign.bounds.y,
      sign.bounds.width,
      sign.bounds.height,
      -signWidth / 2,
      -signHeight / 2,
      signWidth,
      signHeight
    );
    context.restore();
  }

  return { width: canvas.width, height: canvas.height };
}
