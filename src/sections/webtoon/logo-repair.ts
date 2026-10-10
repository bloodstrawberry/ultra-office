type Box = { x: number; y: number; width: number; height: number };

export type LogoDetection = { mask: Uint8Array; box: Box; pixels: number; score: number } | null;

const luminance = (data: Uint8ClampedArray, index: number) =>
  data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114;

function boundsOf(mask: Uint8Array, width: number, height: number): Box | null {
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!mask[y * width + x]) continue;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
  return right < left
    ? null
    : { x: left, y: top, width: right - left + 1, height: bottom - top + 1 };
}

function expandMask(mask: Uint8Array, width: number, height: number, radius: number) {
  const expanded = new Uint8Array(mask);
  const box = boundsOf(mask, width, height);
  if (!box) return expanded;
  for (
    let y = Math.max(0, box.y - radius);
    y < Math.min(height, box.y + box.height + radius);
    y++
  ) {
    for (
      let x = Math.max(0, box.x - radius);
      x < Math.min(width, box.x + box.width + radius);
      x++
    ) {
      if (!mask[y * width + x]) continue;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const nx = x + dx;
          const ny = y + dy;
          if (
            nx >= 0 &&
            nx < width &&
            ny >= 0 &&
            ny < height &&
            dx * dx + dy * dy <= radius * radius
          )
            expanded[ny * width + nx] = 1;
        }
      }
    }
  }
  return expanded;
}

const starRadius = (angle: number, size: number) =>
  size * (0.53 + 0.47 * Math.abs(Math.cos(angle * 2)));

/** Matches the four-point Gemini mark against its nearby background. */
export function detectBottomRightLogo(image: ImageData, sensitivity = 13): LogoDetection {
  const { width, height, data } = image;
  const size = Math.min(width, height);
  const left = Math.max(0, width - Math.round(size * 0.22));
  const top = Math.max(0, height - Math.round(size * 0.22));
  const likelyX = width - size * 0.105;
  const likelyY = height - size * 0.105;
  let bestScore = -Infinity;
  let centerX = likelyX;
  let centerY = likelyY;
  let bestRadius = Math.max(10, Math.round(size * 0.025));
  const radii = [0.018, 0.024, 0.03, 0.036].map((ratio) => Math.max(8, Math.round(size * ratio)));

  for (let y = top; y < height - 4; y += 2) {
    for (let x = left; x < width - 4; x += 2) {
      for (const radius of radii) {
        const inside: number[] = [];
        const outside: number[] = [];
        let colorful = 0;
        for (let step = 0; step < 16; step++) {
          const angle = (step * Math.PI) / 8;
          const edge = starRadius(angle, radius);
          for (const factor of [0.28, 0.65, 1.5]) {
            const px = Math.round(x + Math.cos(angle) * edge * factor);
            const py = Math.round(y + Math.sin(angle) * edge * factor);
            if (px < 0 || px >= width || py < 0 || py >= height) continue;
            const index = (py * width + px) * 4;
            if (factor < 1) {
              inside.push(luminance(data, index));
              if (
                Math.max(data[index], data[index + 1], data[index + 2]) -
                  Math.min(data[index], data[index + 1], data[index + 2]) >
                48
              )
                colorful++;
            } else {
              const saturation =
                Math.max(data[index], data[index + 1], data[index + 2]) -
                Math.min(data[index], data[index + 1], data[index + 2]);
              if (saturation < 48) outside.push(luminance(data, index));
            }
          }
        }
        if (inside.length < 28 || outside.length < 10 || colorful > 3) continue;
        outside.sort((a, b) => a - b);
        const background = outside[Math.floor(outside.length / 2)];
        const contrast = inside.reduce((sum, value) => sum + value - background, 0) / inside.length;
        const coverage =
          inside.filter((value) => value - background > sensitivity * 0.5).length / inside.length;
        const score = contrast * coverage - Math.hypot(x - likelyX, y - likelyY) * 0.04;
        if (score > bestScore) {
          bestScore = score;
          centerX = x;
          centerY = y;
          bestRadius = radius;
        }
      }
    }
  }

  // An opaque white object against dark artwork is not a translucent corner logo.
  if (bestScore < sensitivity || bestScore > 80) return null;
  const mask = new Uint8Array(width * height);
  let pixels = 0;
  for (
    let y = Math.max(0, centerY - bestRadius - 3);
    y <= Math.min(height - 1, centerY + bestRadius + 3);
    y++
  ) {
    for (
      let x = Math.max(0, centerX - bestRadius - 3);
      x <= Math.min(width - 1, centerX + bestRadius + 3);
      x++
    ) {
      const angle = Math.atan2(y - centerY, x - centerX);
      if (Math.hypot(x - centerX, y - centerY) <= starRadius(angle, bestRadius) * 1.08) {
        mask[y * width + x] = 1;
        pixels++;
      }
    }
  }
  const box = boundsOf(mask, width, height);
  return box ? { mask, box, pixels, score: bestScore } : null;
}

function boundarySamples(mask: Uint8Array, width: number, height: number, box: Box) {
  const samples: number[] = [];
  const left = Math.max(0, box.x - 4);
  const top = Math.max(0, box.y - 4);
  const right = Math.min(width - 1, box.x + box.width + 3);
  const bottom = Math.min(height - 1, box.y + box.height + 3);
  for (let y = top; y <= bottom; y += 2) {
    for (let x = left; x <= right; x += 2) {
      const point = y * width + x;
      if (mask[point]) continue;
      let near = false;
      for (let dy = -4; dy <= 4 && !near; dy += 2) {
        for (let dx = -4; dx <= 4; dx += 2) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height && mask[ny * width + nx]) {
            near = true;
            break;
          }
        }
      }
      if (near) samples.push(point);
    }
  }
  return samples;
}

/** Uses a matching nearby patch when possible, then falls back to directional color diffusion. */
export function repairMaskedPixels(image: ImageData, inputMask: Uint8Array): ImageData {
  const { width, height, data } = image;
  if (inputMask.length !== width * height) throw new Error('복구 영역의 크기가 이미지와 다릅니다.');
  const mask = expandMask(inputMask, width, height, 2);
  const box = boundsOf(mask, width, height);
  if (!box) return image;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const boundary = boundarySamples(mask, width, height, box);
  const search = Math.min(160, Math.max(48, Math.round(Math.min(width, height) * 0.22)));
  let bestError = Infinity;
  let bestDx = 0;
  let bestDy = 0;
  let bestShift = [0, 0, 0];

  if (boundary.length >= 6) {
    const median = [0, 1, 2].map((channel) => {
      const values = boundary.map((point) => data[point * 4 + channel]).sort((a, b) => a - b);
      return values[Math.floor(values.length / 2)];
    });
    const background = median[0] * 0.299 + median[1] * 0.587 + median[2] * 0.114;
    const samplePoints: number[] = [];
    const stride = Math.max(1, Math.floor(Math.min(box.width, box.height) / 12));
    for (let y = box.y; y < box.y + box.height; y += stride)
      for (let x = box.x; x < box.x + box.width; x += stride)
        if (mask[y * width + x]) samplePoints.push(y * width + x);
    for (let dy = -search; dy <= search; dy += 4) {
      for (let dx = -search; dx <= search; dx += 4) {
        if (Math.abs(dx) < box.width + 5 && Math.abs(dy) < box.height + 5) continue;
        if (
          box.x + dx < 0 ||
          box.y + dy < 0 ||
          box.x + box.width + dx > width ||
          box.y + box.height + dy > height
        )
          continue;
        let error = 0;
        let shiftR = 0;
        let shiftG = 0;
        let shiftB = 0;
        let valid = 0;
        for (const point of samplePoints) {
          const x = point % width;
          const y = Math.floor(point / width);
          const sx = x + dx;
          const sy = y + dy;
          if (sx < 0 || sy < 0 || sx >= width || sy >= height || mask[sy * width + sx]) continue;
          const source = (sy * width + sx) * 4;
          const difference = Math.abs(luminance(data, source) - background);
          error += difference + Math.max(0, difference - 25) * 3;
          shiftR += data[source];
          shiftG += data[source + 1];
          shiftB += data[source + 2];
          valid++;
        }
        if (valid < samplePoints.length * 0.95) continue;
        const score = error / valid + Math.hypot(dx, dy) * 0.02;
        if (score < bestError) {
          bestError = score;
          bestDx = dx;
          bestDy = dy;
          bestShift = [
            median[0] - shiftR / valid,
            median[1] - shiftG / valid,
            median[2] - shiftB / valid,
          ];
        }
      }
    }
  }

  if (bestError < 24) {
    for (let y = box.y; y < box.y + box.height; y++) {
      for (let x = box.x; x < box.x + box.width; x++) {
        const point = y * width + x;
        if (!mask[point]) continue;
        const source = ((y + bestDy) * width + x + bestDx) * 4;
        const target = point * 4;
        for (let channel = 0; channel < 3; channel++)
          result.data[target + channel] = data[source + channel] + bestShift[channel];
      }
    }
  } else {
    const filled = new Uint8Array(mask);
    let remaining = 0;
    for (let y = box.y; y < box.y + box.height; y++)
      for (let x = box.x; x < box.x + box.width; x++) remaining += filled[y * width + x];
    while (remaining > 0) {
      const updates: { point: number; colors: number[] }[] = [];
      for (let y = box.y; y < box.y + box.height; y++) {
        for (let x = box.x; x < box.x + box.width; x++) {
          const point = y * width + x;
          if (!filled[point]) continue;
          const colors = [0, 0, 0];
          let weight = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              if (
                (!dx && !dy) ||
                nx < 0 ||
                nx >= width ||
                ny < 0 ||
                ny >= height ||
                filled[ny * width + nx]
              )
                continue;
              const factor = dx && dy ? 0.7 : 1;
              const source = (ny * width + nx) * 4;
              for (let channel = 0; channel < 3; channel++)
                colors[channel] += result.data[source + channel] * factor;
              weight += factor;
            }
          }
          if (weight) updates.push({ point, colors: colors.map((value) => value / weight) });
        }
      }
      if (!updates.length) break;
      for (const { point, colors } of updates) {
        for (let channel = 0; channel < 3; channel++)
          result.data[point * 4 + channel] = colors[channel];
        filled[point] = 0;
        remaining--;
      }
    }
  }
  return result;
}
