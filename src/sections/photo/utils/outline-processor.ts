/** Make every visible pixel close to the clicked color transparent, across the whole image. */
export function removeSimilarColor(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  x: number,
  y: number,
  tolerance: number
): { pixels: Uint8ClampedArray; removedCount: number } {
  const target = (y * width + x) * 4;
  const pixels = new Uint8ClampedArray(source);
  if (x < 0 || x >= width || y < 0 || y >= height || source[target + 3] === 0) {
    return { pixels, removedCount: 0 };
  }

  const red = source[target];
  const green = source[target + 1];
  const blue = source[target + 2];
  let removedCount = 0;

  for (let i = 0; i < pixels.length; i += 4) {
    if (
      pixels[i + 3] > 0 &&
      Math.abs(pixels[i] - red) <= tolerance &&
      Math.abs(pixels[i + 1] - green) <= tolerance &&
      Math.abs(pixels[i + 2] - blue) <= tolerance
    ) {
      pixels[i + 3] = 0;
      removedCount += 1;
    }
  }

  return { pixels, removedCount };
}

/** Build a solid, rounded outline from the visible pixels of a transparent image. */
export function createOutlineMask(
  source: Uint8ClampedArray,
  width: number,
  height: number,
  thickness: number,
  color: string
): { pixels: Uint8ClampedArray; width: number; height: number; padding: number } {
  const padding = Math.max(1, Math.round(thickness));
  const outWidth = width + padding * 2;
  const outHeight = height + padding * 2;
  const size = outWidth * outHeight;
  const infinity = 1e12;
  const horizontal = new Float64Array(size);
  const distances = new Float64Array(size);
  const maxLength = Math.max(outWidth, outHeight);
  const input = new Float64Array(maxLength);
  const output = new Float64Array(maxLength);
  const sites = new Int32Array(maxLength);
  const boundaries = new Float64Array(maxLength + 1);

  // Exact squared Euclidean distance transform, applied to rows and then columns.
  // Keeping the outline as a distance field gives round corners without a costly
  // drawImage call for every pixel in the chosen radius.
  const transformLine = (length: number) => {
    let last = -1;
    for (let q = 0; q < length; q += 1) {
      if (input[q] >= infinity) continue;
      let crossing = 0;
      while (last >= 0) {
        const previous = sites[last];
        crossing =
          (input[q] + q * q - input[previous] - previous * previous) / (2 * (q - previous));
        if (crossing > boundaries[last]) break;
        last -= 1;
      }
      last += 1;
      sites[last] = q;
      boundaries[last] = last === 0 ? -Infinity : crossing;
      boundaries[last + 1] = Infinity;
    }
    if (last < 0) {
      output.fill(infinity, 0, length);
      return;
    }
    let active = 0;
    for (let q = 0; q < length; q += 1) {
      while (active < last && boundaries[active + 1] < q) active += 1;
      const dx = q - sites[active];
      output[q] = dx * dx + input[sites[active]];
    }
  };

  for (let y = 0; y < outHeight; y += 1) {
    for (let x = 0; x < outWidth; x += 1) {
      const sx = x - padding;
      const sy = y - padding;
      input[x] =
        sx >= 0 && sx < width && sy >= 0 && sy < height && source[(sy * width + sx) * 4 + 3] >= 16
          ? 0
          : infinity;
    }
    transformLine(outWidth);
    horizontal.set(output.subarray(0, outWidth), y * outWidth);
  }

  for (let x = 0; x < outWidth; x += 1) {
    for (let y = 0; y < outHeight; y += 1) input[y] = horizontal[y * outWidth + x];
    transformLine(outHeight);
    for (let y = 0; y < outHeight; y += 1) distances[y * outWidth + x] = output[y];
  }

  const pixels = new Uint8ClampedArray(size * 4);
  const red = parseInt(color.slice(1, 3), 16);
  const green = parseInt(color.slice(3, 5), 16);
  const blue = parseInt(color.slice(5, 7), 16);
  const limit = padding * padding;
  for (let i = 0; i < size; i += 1) {
    if (distances[i] <= limit) {
      const offset = i * 4;
      pixels[offset] = red;
      pixels[offset + 1] = green;
      pixels[offset + 2] = blue;
      pixels[offset + 3] = 255;
    }
  }

  return { pixels, width: outWidth, height: outHeight, padding };
}
