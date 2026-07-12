/** Canvas 전처리 (grayscale / contrast / threshold) → dataURL + canvas */
export function preprocessImage(
  imgSrc: string,
  opts: { useGrayscale: boolean; contrast: number; threshold: number },
  rotation: number = 0,
  isVFlip: boolean = false,
  isHFlip: boolean = false
): Promise<{ canvas: HTMLCanvasElement; dataUrl: string; width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let targetWidth = img.width;
      let targetHeight = img.height;
      if (rotation % 180 !== 0) {
        targetWidth = img.height;
        targetHeight = img.width;
      }
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.filter = `grayscale(${opts.useGrayscale ? 100 : 0}%) contrast(${100 + opts.contrast}%)`;
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(isHFlip ? -1 : 1, isVFlip ? -1 : 1);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();
      if (opts.threshold !== 0) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const d = imageData.data;
        const tv = 127 + opts.threshold * 1.27;
        for (let i = 0; i < d.length; i += 4) {
          const avg = (d[i] + d[i + 1] + d[i + 2]) / 3;
          const v = avg >= tv ? 255 : 0;
          d[i] = d[i + 1] = d[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
      }
      resolve({
        canvas,
        dataUrl: canvas.toDataURL('image/png'),
        width: canvas.width,
        height: canvas.height,
      });
    };
    img.src = imgSrc;
  });
}
