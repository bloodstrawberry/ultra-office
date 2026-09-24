// Run: node scripts/test-subtitle-remover.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const moduleOutput = { exports: {} };
new Function(
  'module',
  'exports',
  ts.transpileModule(
    fs.readFileSync('src/sections/video-master/utils/video-subtitle-remover-processor.ts', 'utf8'),
    { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }
  ).outputText
)(moduleOutput, moduleOutput.exports);
const {
  getPresetSubtitleBox,
  getSubtitleBoxHit,
  isSubtitleBoxVisible,
  applySubtitleRemovalToCanvas,
  detectSubtitleBoxesFromCanvas,
} = moduleOutput.exports;

// A pixel canvas lets us verify reconstruction against a known clean background.
function frame(width, height, pixel) {
  const original = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      original.set([...pixel(x, y), 255], (y * width + x) * 4);
    }
  const ctx = {
    canvas: { width, height },
    pixels: original.slice(),
    drawImage() {
      this.pixels.set(original);
    },
    getImageData(x, y, w, h) {
      assert.ok(x >= 0 && y >= 0 && x + w <= width && y + h <= height);
      const data = new Uint8ClampedArray(w * h * 4);
      for (let row = 0; row < h; row++)
        for (let col = 0; col < w; col++) {
          data.set(
            this.pixels.slice(
              ((y + row) * width + x + col) * 4,
              ((y + row) * width + x + col) * 4 + 4
            ),
            (row * w + col) * 4
          );
        }
      return { data, width: w, height: h };
    },
    putImageData(image, x, y) {
      for (let row = 0; row < image.height; row++)
        for (let col = 0; col < image.width; col++) {
          const i = (row * image.width + col) * 4;
          this.pixels.set(image.data.slice(i, i + 4), ((y + row) * width + x + col) * 4);
        }
    },
  };
  ctx.canvas.getContext = () => ctx;
  return ctx;
}
const box = {
  ...getPresetSubtitleBox('bottom-center'),
  x: 0.2,
  y: 0.4,
  width: 0.6,
  height: 0.2,
  padding: 2,
  feather: 14,
  grainStrength: 0,
  sampleDirection: 'vertical',
  startTime: 1,
  endTime: 2,
};
const render = (ctx, overrides = {}, time = 1.5) =>
  applySubtitleRemovalToCanvas(
    ctx,
    {},
    {
      boxes: [{ ...box, ...overrides }],
      currentTime: time,
      showBoxOutline: false,
    }
  );
const background = (x, y) => [40 + x, 30 + y, 60];
const ctx = frame(100, 100, (x, y) =>
  x >= 20 && x < 80 && y >= 40 && y < 60 ? [255, 255, 255] : background(x, y)
);
render(ctx);
for (let y = 40; y < 60; y++)
  for (let x = 20; x < 80; x++) {
    assert.deepEqual(Array.from(ctx.getImageData(x, y, 1, 1).data).slice(0, 3), background(x, y));
  }
assert.deepEqual(Array.from(ctx.getImageData(5, 5, 1, 1).data).slice(0, 3), background(5, 5));
render(ctx, {}, 2);
assert.equal(ctx.getImageData(50, 50, 1, 1).data[0], 255, 'end time excludes mask');
render(ctx, { enabled: false });
assert.equal(ctx.getImageData(50, 50, 1, 1).data[0], 255, 'deleted/disabled mask leaves original');
render(ctx, { grainStrength: 4 });
const first = ctx.pixels.slice();
render(ctx, { grainStrength: 4 });
assert.deepEqual(ctx.pixels, first, 'preview and export grain is deterministic');
for (const sampleDirection of ['vertical', 'top-only', 'bottom-only', 'horizontal']) {
  render(ctx, { x: 0, y: 0, width: 0.2, height: 0.2, sampleDirection });
  render(ctx, { x: 0.8, y: 0.8, width: 0.2, height: 0.2, sampleDirection });
}
assert.equal(isSubtitleBoxVisible(box, 0), false);
assert.equal(isSubtitleBoxVisible(box, 1), true);
assert.equal(isSubtitleBoxVisible(box, 2), false);
const badgeBox = { ...box, x: 0.9, y: 0.5, width: 0.1 };
assert.equal(getSubtitleBoxHit(badgeBox, 1000, 500, 970, 235), 'delete');
assert.deepEqual(
  detectSubtitleBoxesFromCanvas(
    frame(100, 100, () => [50, 50, 50]).canvas,
    { sensitivity: 'medium', searchZone: 'all' },
    true
  ),
  []
);
console.log(
  'PASS: opaque text coverage, background reconstruction, feather limits, time bounds, frame edges, stable grain, delete hit target, empty detection'
);
